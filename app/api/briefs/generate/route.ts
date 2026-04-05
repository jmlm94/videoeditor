import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { briefs, videos, scenes } from "@/lib/db/schema";
import { generateCreativeBrief } from "@/lib/ai/brief-generator";

export async function POST(req: NextRequest) {
  try {
    const { projectId, inputPrompt, inputType } = await req.json();

    if (!projectId || !inputPrompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate brief using Claude
    const briefData = await generateCreativeBrief({
      inputPrompt,
      inputType,
    });

    // Save brief to database
    const [brief] = await db
      .insert(briefs)
      .values({
        projectId,
        analysisResults: briefData.analysis,
        status: "draft",
      })
      .returning();

    // Save each video and its scenes
    for (const videoData of briefData.videos) {
      const [video] = await db
        .insert(videos)
        .values({
          briefId: brief.id,
          title: videoData.title,
          concept: videoData.concept,
          framework: videoData.framework,
          voiceConfig: videoData.voiceConfig,
          musicConfig: videoData.musicConfig,
          subtitleConfig: videoData.subtitleConfig,
          platformTargets: videoData.platformTargets,
          totalDurationSeconds: videoData.totalDurationSeconds,
          status: "pending",
        })
        .returning();

      if (videoData.scenes) {
        for (const sceneData of videoData.scenes) {
          await db.insert(scenes).values({
            videoId: video.id,
            sceneNumber: sceneData.sceneNumber,
            durationSeconds: sceneData.durationSeconds,
            scriptText: sceneData.scriptText,
            brollFolder: sceneData.brollFolder,
            brollClipPath: sceneData.brollClipPath,
            overlayText: sceneData.overlayText,
            overlayStyle: sceneData.overlayStyle,
            transitionType: sceneData.transitionType,
            effects: sceneData.effects,
          });
        }
      }
    }

    return NextResponse.json({ briefId: brief.id }, { status: 201 });
  } catch (error) {
    console.error("Brief generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate brief" },
      { status: 500 }
    );
  }
}
