import { Composition } from "remotion";
import { z } from "zod";
import { MyComposition } from "./Composition";
import "./index.css";
import meta from "./meta.json";
import { schema } from "./schema";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        schema={schema}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: Math.floor(props.durationInFrames),
            fps: 60,
          };
        }}
        defaultProps={
          {
            subtitles: meta.subtitles,
            ctaDurationInFrames: Math.ceil(meta.ctaDurationInFrames),
            cta: meta.cta as "ai" | "typescript",
            durationInFrames: meta.durationInFrames,
          } satisfies z.infer<typeof schema>
        }
        width={1080}
        height={1920}
      />
    </>
  );
};
