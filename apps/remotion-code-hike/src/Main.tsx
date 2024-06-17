import { AbsoluteFill, Series, useVideoConfig } from "remotion";
import { ProgressBar } from "./ProgressBar";
import { CodeTransition } from "./CodeTransition";
import { HighlightedCode } from "codehike/code";
import { TRANSITION_DURATION } from "./constants";

export const Main = (props: { steps: HighlightedCode[] }) => {
  const { steps } = props;
  const { durationInFrames } = useVideoConfig();
  const stepDuration = durationInFrames / steps.length;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0D1117" }}>
      <ProgressBar steps={steps} />
      <AbsoluteFill style={{ padding: "84px 48px" }}>
        <Series>
          {steps.map((step, index) => (
            <Series.Sequence
              key={index}
              layout="none"
              durationInFrames={stepDuration}
              name={step.meta}
            >
              <CodeTransition
                oldCode={steps[index - 1]!}
                newCode={step}
                durationInFrames={TRANSITION_DURATION}
              />
            </Series.Sequence>
          ))}
        </Series>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
