import {
  AnnotationHandler,
  HighlightedCode,
  Pre,
} from "codehike/code";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  continueRender,
  delayRender,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

import {
  calculateTransitions,
  getStartingSnapshot,
  TokenTransitionsSnapshot,
} from "codehike/utils/token-transitions";
import { applyStyle } from "./utils";

import { inlineBlockTokens } from "./annotations/InlineToken";
import {
  makeQueryComponent,
  transformQuery,
} from "./annotations/Query";

const errorCallout = (
  displayLength: number,
): AnnotationHandler => ({
  name: "error-callout",
  transform: transformQuery,
  AnnotatedLine: makeQueryComponent({
    displayLength,
    type: "error",
  }),
});

const queryCallout = (
  displayLength: number,
): AnnotationHandler => ({
  name: "query-callout",
  transform: transformQuery,
  AnnotatedLine: makeQueryComponent({
    displayLength,
    type: "query",
  }),
});

export function CodeTransition({
  oldCode,
  newCode,
  transitionDuration: transitionDuration,
  displayLength,
}: {
  oldCode: HighlightedCode | null;
  newCode: HighlightedCode;
  transitionDuration: number;
  displayLength: number;
}) {
  const frame = useCurrentFrame();

  const ref = React.useRef<HTMLPreElement>(null);
  const [oldSnapshot, setOldSnapshot] =
    useState<TokenTransitionsSnapshot | null>(null);
  const [delayRenderHandle] = React.useState(() =>
    delayRender(),
  );

  const prevCode: HighlightedCode = useMemo(() => {
    return (
      oldCode || {
        ...newCode,
        tokens: [],
        annotations: [],
      }
    );
  }, [newCode, oldCode]);

  const code = useMemo(() => {
    return oldSnapshot ? newCode : prevCode;
  }, [newCode, prevCode, oldSnapshot]);

  useEffect(() => {
    if (!oldSnapshot) {
      setOldSnapshot(
        getStartingSnapshot(ref.current!),
      );
    }
  }, [oldSnapshot]);

  useLayoutEffect(() => {
    if (!oldSnapshot) {
      setOldSnapshot(
        getStartingSnapshot(ref.current!),
      );
      return;
    }
    const transitions = calculateTransitions(
      ref.current!,
      oldSnapshot,
    );
    transitions.forEach(
      ({ element, keyframes, options }) => {
        const delay =
          transitionDuration * options.delay;
        const duration =
          transitionDuration * options.duration;

        const progress = interpolate(
          frame,
          [delay, delay + duration],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.ease),
          },
        );

        applyStyle({
          element,
          keyframes,
          progress,
        });
      },
    );
    continueRender(delayRenderHandle);
  });

  const handlers: AnnotationHandler[] = useMemo(() => {
    return [
      inlineBlockTokens,
      errorCallout(displayLength),
      queryCallout(displayLength),
    ];
  }, []);

  const style = useMemo<React.CSSProperties>(() => {
    return {
      position: "relative",
      fontSize: 40,
      lineHeight: 1.5,
    };
  }, []);

  return (
    <Pre
      ref={ref}
      code={code}
      handlers={handlers}
      style={style}
    />
  );
}
