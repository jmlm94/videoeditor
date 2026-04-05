import { AbsoluteFill, Audio, Sequence, useVideoConfig } from "remotion";
import { Scene } from "./Scene";
import type { AdProps } from "./schema";

export const AdComposition: React.FC<AdProps> = ({
  scenes,
  subtitleConfig,
  musicUrl,
}) => {
  const { fps } = useVideoConfig();

  // Calculate frame offsets for each scene
  let currentFrame = 0;
  const sceneTimings = scenes.map((scene) => {
    const startFrame = currentFrame;
    const durationFrames = Math.round(scene.durationSeconds * fps);
    currentFrame += durationFrames;
    return { ...scene, startFrame, durationFrames };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* B-roll + subtitles + effects per scene */}
      {sceneTimings.map((scene) => (
        <Sequence
          key={scene.sceneNumber}
          from={scene.startFrame}
          durationInFrames={scene.durationFrames}
        >
          <Scene scene={scene} subtitleConfig={subtitleConfig} />
        </Sequence>
      ))}

      {/* Background music (full duration, ducked) */}
      {musicUrl && <Audio src={musicUrl} volume={0.3} />}

      {/* Per-scene voiceover */}
      {sceneTimings.map(
        (scene) =>
          scene.voiceoverUrl && (
            <Sequence
              key={`vo-${scene.sceneNumber}`}
              from={scene.startFrame}
              durationInFrames={scene.durationFrames}
            >
              <Audio src={scene.voiceoverUrl} volume={1} />
            </Sequence>
          )
      )}
    </AbsoluteFill>
  );
};
