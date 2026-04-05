"use client";

import { Player } from "@remotion/player";
import { AdComposition } from "@/src/compositions/AdComposition";
import type { AdProps } from "@/src/compositions/schema";

interface VideoPreviewProps {
  scenes: AdProps["scenes"];
  subtitleConfig: AdProps["subtitleConfig"];
  musicUrl?: string;
  className?: string;
}

export function VideoPreview({
  scenes,
  subtitleConfig,
  musicUrl,
  className,
}: VideoPreviewProps) {
  const totalDurationSeconds = scenes.reduce(
    (acc, s) => acc + s.durationSeconds,
    0
  );
  const fps = 30;
  const durationInFrames = Math.round(totalDurationSeconds * fps);

  return (
    <div className={className}>
      <Player
        component={AdComposition}
        inputProps={{ scenes, subtitleConfig, musicUrl }}
        durationInFrames={durationInFrames || 150}
        compositionWidth={1080}
        compositionHeight={1920}
        fps={fps}
        style={{
          width: "100%",
          aspectRatio: "9/16",
          borderRadius: 12,
          overflow: "hidden",
        }}
        controls
        autoPlay={false}
        loop
      />
    </div>
  );
}
