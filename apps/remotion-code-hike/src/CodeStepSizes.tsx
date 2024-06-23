import { HighlightedCode, Pre } from "codehike/code";
import {
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  continueRender,
  delayRender,
  useCurrentScale,
} from "remotion";
import { PreWithHandlers } from "./PreWithHandlers";

interface CodeStepWithSizes {
  code: HighlightedCode;
  elem: HTMLPreElement;
  width: number;
  height: number;
}

interface CodeStepSizesProps {
  steps: HighlightedCode[];
  children: (
    stepsWithSizes: CodeStepWithSizes[],
  ) => ReactNode;
  displayLength: number;
}

export const CodeStepSizes = (
  props: CodeStepSizesProps,
) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [delayRenderHandle] = useState(() =>
    delayRender(),
  );
  const [sizes, setSizes] = useState<
    CodeStepWithSizes[]
  >([]);

  useLayoutEffect(() => {
    if (!parentRef.current) {
      return;
    }

    const elements =
      parentRef.current.querySelectorAll("pre");

    const rects = Array.from(elements).map((elem) => {
      return {
        elem,
        rect: elem.getBoundingClientRect(),
      };
    });

    const newSizes = rects.map(
      ({ elem, rect }, index) => {
        return {
          code: props.steps[index]!,
          width: rect.width,
          height: rect.height,
          elem: elem,
        };
      },
    );

    setSizes(newSizes);

    continueRender(delayRenderHandle);
  }, []);
  return (
    <>
      <div
        className="absolute bottom-[4000px] left-0 opacity-0 select-none"
        ref={parentRef}
      >
        {props.steps.map((code, index) => {
          return (
            <PreWithHandlers
              key={index}
              displayLength={props.displayLength}
              code={code}
              className="inline-block"
            />
          );
        })}
      </div>
      {props.children(sizes)}
    </>
  );
};
