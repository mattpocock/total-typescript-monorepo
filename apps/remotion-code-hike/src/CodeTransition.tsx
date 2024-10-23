import { HighlightedCode, Pre } from "codehike/code";
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
  useCurrentScale,
} from "remotion";

import {
  calculateTransitions,
  getStartingSnapshot,
  TokenTransitionsSnapshot,
} from "codehike/utils/token-transitions";
import { applyStyle } from "./utils";
import { PreWithHandlers } from "./PreWithHandlers";
import {
  featureFlags,
  RESIZE_TRANSITION_LENGTH,
} from "./constants";

export function CodeTransition({
  oldCode,
  oldScale,
  newScale,
  newCode,
  oldMarginTop,
  newMarginTop,
  transitionDuration: transitionDuration,
  displayLength,
}: {
  oldScale: number;
  oldMarginTop: number;
  newMarginTop: number;
  newScale: number;
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

  const scale = interpolate(
    frame,
    [0, RESIZE_TRANSITION_LENGTH],
    [oldScale, newScale],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    },
  );

  const marginTop = interpolate(
    frame,
    [0, RESIZE_TRANSITION_LENGTH],
    [oldMarginTop, newMarginTop],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    },
  );

  return (
    <PreWithHandlers
      ref={ref}
      code={code}
      displayLength={displayLength}
      style={{
        transform: `scale(${scale}) ${featureFlags.USE_CENTRED_TEXT ? `translateY(${marginTop}px)` : ""}`,
        transformOrigin: "top left",
      }}
    />
  );
}
