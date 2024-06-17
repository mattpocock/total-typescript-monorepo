import {
  AbsoluteFill,
  Series,
  useVideoConfig,
} from "remotion";
import { ProgressBar } from "./ProgressBar";
import { CodeTransition } from "./CodeTransition";
import { HighlightedCode } from "codehike/code";
import { TRANSITION_DURATION } from "./constants";

export const Main = (props: {
  steps: HighlightedCode[];
}) => {
  const { steps } = props;
  const { durationInFrames } = useVideoConfig();
  const stepDuration = durationInFrames / steps.length;

  return (
    <AbsoluteFill className="bg-gray-900">
      <ProgressBar steps={steps} />
      <AbsoluteFill className="px-12 py-24">
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
                displayLength={stepDuration}
                transitionDuration={
                  TRANSITION_DURATION
                }
              />
            </Series.Sequence>
          ))}
        </Series>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
