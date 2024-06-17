import { Easing, interpolate } from "remotion";
import {
  continueRender,
  delayRender,
  useCurrentFrame,
} from "remotion";
import {
  Pre,
  HighlightedCode,
  AnnotationHandler,
} from "codehike/code";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import {
  calculateTransitions,
  getStartingSnapshot,
  TokenTransitionsSnapshot,
} from "codehike/utils/token-transitions";
import { applyStyle } from "./utils";
import { errorCallout } from "./annotations/errorCallout";

import { loadFont } from "@remotion/google-fonts/RobotoMono";
import { inlineBlockTokens } from "./annotations/InlineToken";
import { TRANSITION_DURATION } from "./constants";
import { queryCallout } from "./annotations/queryCallout";
const { fontFamily } = loadFont();

export function CodeTransition({
  oldCode,
  newCode,
  durationInFrames = TRANSITION_DURATION,
}: {
  oldCode: HighlightedCode | null;
  newCode: HighlightedCode;
  durationInFrames?: number;
}) {
  const frame = useCurrentFrame();

  const ref = React.useRef<HTMLPreElement>(null);
  const [oldSnapshot, setOldSnapshot] =
    useState<TokenTransitionsSnapshot | null>(null);
  const [handle] = React.useState(() => delayRender());

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
        const delay = durationInFrames * options.delay;
        const duration =
          durationInFrames * options.duration;
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
    continueRender(handle);
  });

  const handlers: AnnotationHandler[] = useMemo(() => {
    return [
      inlineBlockTokens,
      errorCallout,
      queryCallout,
    ];
  }, []);

  const style = useMemo<React.CSSProperties>(() => {
    return {
      position: "relative",
      fontSize: 40,
      lineHeight: 1.5,
      fontFamily,
      backgrouncColor: "#1a222f",
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
