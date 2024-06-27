import { HighlightedCode } from "codehike/code";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Series,
  continueRender,
  delayRender,
  staticFile,
  useVideoConfig,
} from "remotion";
import { CodeStepSizes } from "./CodeStepSizes";
import { CodeTransition } from "./CodeTransition";
import { ProgressBar } from "./ProgressBar";
import { calculateElemScale } from "./calculateElemScale";
import {
  DEFAULT_STEP_DURATION,
  TRANSITION_DURATION,
} from "./constants";
// import chillMusic from "./media/chill.mp3";

export const Main = (props: {
  steps: HighlightedCode[];
  durations: number[] | undefined;
}) => {
  const { steps } = props;
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

  const narration = useMemo(() => {
    try {
      return require("./narration.local.ogg").default;
    } catch (e) {}
  }, []);

  return (
    <>
      {narration && (
        <Sequence from={25}>
          <Audio src={narration} startFrom={25} />
        </Sequence>
      )}
      <AbsoluteFill className="bg-gray-900 px-16 py-20 space-y-12">
        {/* <ProgressBar steps={steps} /> */}
        <div
          className="h-full overflow-hidden"
          ref={containerRef}
        >
          {containerRect && (
            <CodeStepSizes steps={steps}>
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

                        const durationInFrames =
                          props.durations?.[index] ??
                          DEFAULT_STEP_DURATION;
                        return (
                          <Series.Sequence
                            key={index}
                            layout="none"
                            durationInFrames={
                              durationInFrames
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
                                durationInFrames
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
