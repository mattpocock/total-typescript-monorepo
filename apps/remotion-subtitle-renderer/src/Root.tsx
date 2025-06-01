import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { z } from "zod";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={60}
        schema={z.object({
          text: z.string().describe("The text to display in the subtitle."),
        })}
        defaultProps={{
          text: "I got a question the other day that got me thinking.",
        }}
        width={1080}
        height={1920}
      />
    </>
  );
};
