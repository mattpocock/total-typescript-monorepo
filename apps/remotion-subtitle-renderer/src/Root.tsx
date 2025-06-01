import "./index.css";
import { Composition, staticFile } from "remotion";
import { MyComposition } from "./Composition";
import { z } from "zod";
import subtitleJson from "./subtitle.json";
import { parseMedia } from "@remotion/media-parser";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        schema={z.object({
          subtitles: z.array(
            z.object({
              startFrame: z.number(),
              endFrame: z.number(),
              text: z.string(),
            }),
          ),
        })}
        calculateMetadata={async () => {
          const video = await parseMedia({
            src: staticFile("/input.mp4"),
            fields: {
              durationInSeconds: true,
              fps: true,
            },
          });
          return {
            durationInFrames: Math.floor(
              (video.durationInSeconds ?? 0) * (video.fps ?? 60),
            ),
            fps: video.fps ?? 60,
          };
        }}
        defaultProps={{
          subtitles: subtitleJson,
        }}
        width={1080}
        height={1920}
      />
    </>
  );
};
