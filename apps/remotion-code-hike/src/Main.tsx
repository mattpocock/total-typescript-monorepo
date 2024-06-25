import { HighlightedCode } from "codehike/code";
import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AbsoluteFill,
  Audio,
  Series,
  continueRender,
  delayRender,
  useVideoConfig,
} from "remotion";
import { CodeStepSizes } from "./CodeStepSizes";
import { CodeTransition } from "./CodeTransition";
import { ProgressBar } from "./ProgressBar";
import { calculateElemScale } from "./calculateElemScale";
import { TRANSITION_DURATION } from "./constants";
import chillMusic from "./media/chill.mp3";

export const Main = (props: {
  steps: HighlightedCode[];
}) => {
  const { steps } = props;
  const { durationInFrames } = useVideoConfig();
  const stepDuration = durationInFrames / steps.length;
  const [delayRenderHandle] = useState(() =>
    delayRender(),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const [containerRect, setContainerRect] =
    useState<DOMRect>();

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setContainerRect(
      containerRef.current.getBoundingClientRect(),
    );
    continueRender(delayRenderHandle);
  }, [containerRef.current]);

  return (
    <>
      {/* Only play audio on short vids */}
      {durationInFrames < 3240 && (
        <Audio src={chillMusic} startFrom={669} />
      )}
      <AbsoluteFill className="bg-gray-900 p-16 space-y-12">
        <ProgressBar steps={steps} />
        <div
          className="h-full overflow-hidden"
          ref={containerRef}
        >
          {containerRect && (
            <CodeStepSizes
              steps={steps}
              displayLength={stepDuration}
            >
              {(stepsWithSizes) => {
                return (
                  <Series>
                    {stepsWithSizes.map(
                      (thisStep, index) => {
                        const prevStep =
                          stepsWithSizes[index - 1] ??
                          // If prevStep not found, default to this step
                          thisStep;

                        const thisElemScale =
                          calculateElemScale({
                            targetHeight:
                              containerRect.height,
                            targetWidth:
                              containerRect.width,
                            elemHeight:
                              thisStep.height,
                            elemWidth: thisStep.width,
                          });

                        const prevElemScale =
                          calculateElemScale({
                            targetHeight:
                              containerRect.height,
                            targetWidth:
                              containerRect.width,
                            elemHeight:
                              prevStep.height,
                            elemWidth: prevStep.width,
                          });

                        const prevMarginTop =
                          containerRect.height -
                          prevStep.height *
                            prevElemScale;
                        const newMarginTop =
                          containerRect.height -
                          thisStep.height *
                            thisElemScale;

                        return (
                          <Series.Sequence
                            key={index}
                            layout="none"
                            durationInFrames={
                              stepDuration
                            }
                            name={thisStep.code.meta}
                          >
                            <CodeTransition
                              oldScale={prevElemScale}
                              newScale={thisElemScale}
                              oldCode={
                                steps[index - 1] ??
                                null
                              }
                              newMarginTop={
                                newMarginTop
                              }
                              oldMarginTop={
                                prevMarginTop
                              }
                              newCode={thisStep.code}
                              displayLength={
                                stepDuration
                              }
                              transitionDuration={
                                TRANSITION_DURATION
                              }
                            />
                          </Series.Sequence>
                        );
                      },
                    )}
                  </Series>
                );
              }}
            </CodeStepSizes>
          )}
        </div>
      </AbsoluteFill>
    </>
  );
};
