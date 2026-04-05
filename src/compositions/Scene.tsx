import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SceneProps, SubtitleConfig } from "./schema";

// Color grade filters
const COLOR_GRADES: Record<string, string> = {
  warm: "sepia(0.15) saturate(1.2) brightness(1.05)",
  cinematic: "contrast(1.1) saturate(0.9) brightness(0.95)",
  "high-contrast": "contrast(1.3) saturate(1.1)",
  desaturated: "saturate(0.5) brightness(0.9)",
};

// B-roll placeholder colors by folder
const BROLL_COLORS: Record<string, string> = {
  "ceo-shots": "#1a1a2e",
  "watch-closeups": "#16213e",
  "outdoor-rugged": "#0f3460",
  "sports-action": "#533483",
  unboxing: "#e94560",
  lifestyle: "#1a1a2e",
  "offer-screens": "#f97316",
  testimonials: "#065f46",
  "durability-tests": "#7c2d12",
  comparison: "#374151",
};

interface SceneComponentProps {
  scene: SceneProps & { durationFrames: number };
  subtitleConfig: SubtitleConfig;
}

export const Scene: React.FC<SceneComponentProps> = ({
  scene,
  subtitleConfig,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Zoom effect
  const scale = scene.effects?.zoom
    ? interpolate(frame, [0, scene.durationFrames], [1, 1.1], {
        extrapolateRight: "clamp",
      })
    : 1;

  // Shake effect
  const shakeX = scene.effects?.shake
    ? Math.sin(frame * 1.5) * interpolate(frame, [0, 10], [5, 0], { extrapolateRight: "clamp" })
    : 0;
  const shakeY = scene.effects?.shake
    ? Math.cos(frame * 1.5) * interpolate(frame, [0, 10], [5, 0], { extrapolateRight: "clamp" })
    : 0;

  // Fade in
  const opacity = interpolate(frame, [0, Math.min(fps * 0.3, 10)], [0, 1], {
    extrapolateRight: "clamp",
  });

  const colorGrade = scene.effects?.colorGrade
    ? COLOR_GRADES[scene.effects.colorGrade] || "none"
    : "none";

  const bgColor = BROLL_COLORS[scene.brollFolder] || "#1a1a2e";

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* B-roll layer (placeholder or actual clip) */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${shakeX}px, ${shakeY}px)`,
          filter: colorGrade,
        }}
      >
        {scene.brollClipPath ? (
          <Img
            src={scene.brollClipPath}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <AbsoluteFill
            style={{
              background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 50%, ${bgColor}88 100%)`,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 24,
                  fontFamily: "system-ui",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                {scene.brollFolder}
              </p>
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* Text overlay */}
      {scene.overlayText && (
        <OverlayText
          text={scene.overlayText}
          style={scene.overlayStyle}
          frame={frame}
          durationFrames={scene.durationFrames}
        />
      )}

      {/* Subtitles */}
      <Subtitle
        text={scene.scriptText}
        config={subtitleConfig}
        frame={frame}
        durationFrames={scene.durationFrames}
      />
    </AbsoluteFill>
  );
};

function OverlayText({
  text,
  style,
  frame,
  durationFrames,
}: {
  text: string;
  style?: { fontSize?: number; position?: string; animation?: string };
  frame: number;
  durationFrames: number;
}) {
  const fontSize = style?.fontSize || 48;
  const position = style?.position || "center";

  const animationScale =
    style?.animation === "pop"
      ? interpolate(frame, [0, 8, 12], [0, 1.1, 1], {
          extrapolateRight: "clamp",
        })
      : style?.animation === "shake"
        ? 1
        : interpolate(frame, [0, 10], [0.8, 1], { extrapolateRight: "clamp" });

  const animationOpacity = interpolate(
    frame,
    [0, 8, durationFrames - 5, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const positionStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    ...(position === "top" && { top: 200 }),
    ...(position === "center" && { top: "50%", transform: "translateY(-50%)" }),
    ...(position === "bottom" && { bottom: 300 }),
  };

  return (
    <div style={positionStyle}>
      <div
        style={{
          opacity: animationOpacity,
          transform: `scale(${animationScale})`,
          fontSize,
          fontFamily: "Impact, sans-serif",
          color: "#FFFFFF",
          textShadow:
            "0 4px 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)",
          textAlign: "center",
          padding: "0 60px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Subtitle({
  text,
  config,
  frame,
  durationFrames,
}: {
  text: string;
  config: SubtitleConfig;
  frame: number;
  durationFrames: number;
}) {
  const words = text.split(" ");
  const wordsPerFrame = words.length / durationFrames;

  const positionStyle: React.CSSProperties = {
    position: "absolute",
    left: 40,
    right: 40,
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "4px 8px",
    ...(config.position === "top" && { top: 120 }),
    ...(config.position === "center" && { bottom: 500 }),
    ...(config.position === "bottom" && { bottom: 180 }),
  };

  return (
    <div style={positionStyle}>
      {words.map((word, i) => {
        const wordFrame = i / wordsPerFrame;
        const isHighlighted =
          config.animation === "word-by-word" ? frame >= wordFrame : true;

        const wordOpacity =
          config.animation === "fade"
            ? interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" })
            : 1;

        return (
          <span
            key={`${word}-${i}`}
            style={{
              fontFamily: config.font || "Impact",
              fontSize: 42,
              fontWeight: "bold",
              color: isHighlighted ? config.color || "#FFF" : "rgba(255,255,255,0.4)",
              WebkitTextStroke: `2px ${config.strokeColor || "#000"}`,
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              opacity: wordOpacity,
              transition: "color 0.1s ease",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
