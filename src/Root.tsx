import { Composition } from "remotion";
import { AdComposition } from "./compositions/AdComposition";
import { adSchema } from "./compositions/schema";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CarbinoxAd"
        component={AdComposition}
        durationInFrames={900} // 30s at 30fps, overridden by inputProps
        fps={30}
        width={1080}
        height={1920}
        schema={adSchema}
        defaultProps={{
          scenes: [
            {
              sceneNumber: 1,
              durationSeconds: 5,
              scriptText: "Welcome to Carbinox",
              brollFolder: "watch-closeups",
              overlayText: "CARBINOX",
              overlayStyle: { fontSize: 64, position: "center", animation: "pop" },
              transitionType: "cut",
              effects: { colorGrade: "warm" },
            },
          ],
          subtitleConfig: {
            font: "Impact",
            color: "#FFFFFF",
            strokeColor: "#000000",
            position: "center",
            animation: "word-by-word",
          },
        }}
      />
    </>
  );
};
