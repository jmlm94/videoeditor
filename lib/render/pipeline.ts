import { generateVoiceover } from "@/lib/integrations/elevenlabs";
import { downloadFile } from "@/lib/integrations/google-drive";
import { db } from "@/lib/db";
import { videos, scenes, musicTracks, voices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const RENDER_OUTPUT_DIR = "/tmp/carbinox-renders";
const ASSETS_DIR = "/tmp/carbinox-assets";

interface RenderJob {
  videoId: string;
  onProgress?: (progress: number, stage: string) => void;
}

export async function executeRenderPipeline({ videoId, onProgress }: RenderJob) {
  const report = (progress: number, stage: string) => {
    onProgress?.(progress, stage);
  };

  // 1. Load video and scenes from DB
  report(5, "Loading video data");
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
  if (!video) throw new Error(`Video ${videoId} not found`);

  const videoScenes = await db
    .select()
    .from(scenes)
    .where(eq(scenes.videoId, videoId));

  videoScenes.sort((a, b) => a.sceneNumber - b.sceneNumber);

  // 2. Generate voiceovers for each scene
  report(10, "Generating voiceovers");
  await mkdir(path.join(ASSETS_DIR, videoId, "voiceovers"), { recursive: true });

  const voiceConfig = video.voiceConfig as Record<string, unknown> | null;
  let voiceId = "pNInz6obpgDQGcFmaJgB"; // Default: Adam

  // Look up voice from DB if specified
  if (voiceConfig?.voiceName) {
    const [voice] = await db
      .select()
      .from(voices)
      .where(eq(voices.name, voiceConfig.voiceName as string));
    if (voice) voiceId = voice.elevenlabsVoiceId;
  }

  for (let i = 0; i < videoScenes.length; i++) {
    const scene = videoScenes[i];
    report(
      10 + Math.round((i / videoScenes.length) * 30),
      `Generating voiceover for scene ${scene.sceneNumber}`
    );

    const audio = await generateVoiceover({
      text: scene.scriptText,
      voiceId,
      settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: voiceConfig?.energy === "very-high" ? 0.8 : 0.5,
      },
    });

    const voPath = path.join(
      ASSETS_DIR,
      videoId,
      "voiceovers",
      `scene-${scene.sceneNumber}.mp3`
    );
    await writeFile(voPath, Buffer.from(audio));

    // Update scene with voiceover URL
    await db
      .update(scenes)
      .set({ voiceoverUrl: voPath })
      .where(eq(scenes.id, scene.id));

    videoScenes[i] = { ...scene, voiceoverUrl: voPath };
  }

  // 3. Select and prepare music
  report(45, "Selecting music track");
  const musicConfig = video.musicConfig as Record<string, unknown> | null;
  let musicPath: string | undefined;

  if (musicConfig?.mood) {
    const [track] = await db
      .select()
      .from(musicTracks)
      .where(eq(musicTracks.mood, musicConfig.mood as string));
    if (track) {
      musicPath = track.filePath;
    }
  }

  // 4. Download b-roll clips from Google Drive
  report(50, "Preparing b-roll assets");
  await mkdir(path.join(ASSETS_DIR, videoId, "broll"), { recursive: true });

  for (let i = 0; i < videoScenes.length; i++) {
    const scene = videoScenes[i];
    if (scene.brollClipPath && scene.brollClipPath.startsWith("gdrive:")) {
      report(
        50 + Math.round((i / videoScenes.length) * 15),
        `Downloading b-roll for scene ${scene.sceneNumber}`
      );

      const driveFileId = scene.brollClipPath.replace("gdrive:", "");
      const buffer = await downloadFile(driveFileId);
      const localPath = path.join(
        ASSETS_DIR,
        videoId,
        "broll",
        `scene-${scene.sceneNumber}.mp4`
      );
      await writeFile(localPath, buffer);

      await db
        .update(scenes)
        .set({ brollClipPath: localPath })
        .where(eq(scenes.id, scene.id));

      videoScenes[i] = { ...scene, brollClipPath: localPath };
    }
  }

  // 5. Render with Remotion
  report(70, "Rendering video with Remotion");
  await mkdir(RENDER_OUTPUT_DIR, { recursive: true });

  const outputPath = path.join(RENDER_OUTPUT_DIR, `${videoId}.mp4`);

  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition } = await import("@remotion/renderer");

  const bundleLocation = await bundle({
    entryPoint: path.join(process.cwd(), "src", "index.ts"),
    onProgress: (p) => {
      report(70 + Math.round(p * 5), "Bundling Remotion project");
    },
  });

  const inputProps = {
    scenes: videoScenes.map((s) => ({
      sceneNumber: s.sceneNumber,
      durationSeconds: s.durationSeconds,
      scriptText: s.scriptText,
      brollFolder: s.brollFolder || "watch-closeups",
      brollClipPath: s.brollClipPath || undefined,
      overlayText: s.overlayText || undefined,
      overlayStyle: (s.overlayStyle as Record<string, unknown>) || undefined,
      transitionType: s.transitionType || "cut",
      effects: (s.effects as Record<string, unknown>) || undefined,
      voiceoverUrl: s.voiceoverUrl || undefined,
    })),
    subtitleConfig: (video.subtitleConfig as Record<string, unknown>) || {
      font: "Impact",
      color: "#FFFFFF",
      strokeColor: "#000000",
      position: "center",
      animation: "word-by-word",
    },
    musicUrl: musicPath,
  };

  const totalDuration = videoScenes.reduce(
    (acc, s) => acc + s.durationSeconds,
    0
  );

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "CarbinoxAd",
    inputProps,
  });

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: Math.round(totalDuration * 30),
    },
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      report(75 + Math.round(progress * 20), "Encoding video");
    },
  });

  // 6. Update video record
  report(95, "Finalizing");
  await db
    .update(videos)
    .set({
      status: "rendered",
      renderUrl: outputPath,
      renderProgress: 100,
      updatedAt: new Date(),
    })
    .where(eq(videos.id, videoId));

  report(100, "Complete");

  return { outputPath, videoId };
}
