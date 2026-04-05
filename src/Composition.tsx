import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: 80,
            fontWeight: "bold",
            margin: 0,
            textShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          Video Editor
        </h1>
        <p
          style={{
            fontSize: 32,
            marginTop: 20,
            opacity: 0.9,
          }}
        >
          Powered by Remotion
        </p>
      </div>
    </AbsoluteFill>
  );
};
