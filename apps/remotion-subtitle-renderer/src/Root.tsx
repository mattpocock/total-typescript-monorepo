import "./index.css";
import { Composition, staticFile } from "remotion";
import { MyComposition } from "./Composition";
import { z } from "zod";
import meta from "./meta.json";
import { parseMedia } from "@remotion/media-parser";

const schema = z.object({
  subtitles: z.array(
    z.object({
      startFrame: z.number(),
      endFrame: z.number(),
      text: z.string(),
    }),
  ),
  ctaDurationInFrames: z.number(),
  cta: z.enum(["ai", "typescript"]),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        schema={schema as any}
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
          subtitles: meta.subtitles,
          ctaDurationInFrames: Math.ceil(meta.ctaDurationInFrames),
          cta: meta.cta as "ai" | "typescript",
        }}
        width={1080}
        height={1920}
      />
    </>
  );
};
