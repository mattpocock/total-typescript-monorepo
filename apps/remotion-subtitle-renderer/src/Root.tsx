import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { z } from "zod";
import subtitleJson from "./subtitle.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={subtitleJson[subtitleJson.length - 1].endFrame}
        fps={60}
        schema={z.object({
          subtitles: z.array(
            z.object({
              startFrame: z.number(),
              endFrame: z.number(),
              text: z.string(),
            }),
          ),
        })}
        defaultProps={{
          subtitles: subtitleJson,
        }}
        width={1080}
        height={1920}
      />
    </>
  );
};
