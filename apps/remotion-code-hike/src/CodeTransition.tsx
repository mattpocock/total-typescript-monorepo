import { HighlightedCode, Pre } from "codehike/code";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
import { MyHighlightedCode } from "./calculate-metadata";

const useTransitionCodeLogic = ({
  oldCode,
  currentCode,
  transitionDuration,
}: {
  oldCode: HighlightedCode | null | undefined;
  currentCode: HighlightedCode | undefined;
  transitionDuration: number;
}) => {
  const frame = useCurrentFrame();
  const preRef = useRef<HTMLPreElement>(null);
  const [oldSnapshot, setOldSnapshot] =
    useState<TokenTransitionsSnapshot | null>(null);
  const [delayRenderHandle] = React.useState(() =>
    delayRender(),
  );

  const prevCode: HighlightedCode =
    useMemo((): HighlightedCode => {
      return (
        oldCode || {
          annotations: [],
          tokens: [],
          ...currentCode,
        }
      );
    }, [currentCode, oldCode]);

  console.log({ prevCode });

  useEffect(() => {
    if (!oldSnapshot) {
      setOldSnapshot(
        getStartingSnapshot(preRef.current!),
      );
    }
  }, [oldSnapshot]);

  useLayoutEffect(() => {
    if (!oldSnapshot) {
      setOldSnapshot(
        getStartingSnapshot(preRef.current!),
      );
      return;
    }
    const transitions = calculateTransitions(
      preRef.current!,
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

  const code = useMemo(() => {
    return oldSnapshot ? currentCode : prevCode;
  }, [currentCode, prevCode, oldSnapshot]);

  return { code, ref: preRef };
};

export function CodeTransition({
  oldCode,
  oldScale,
  newScale,
  currentCode,
  oldMarginTop,
  newMarginTop,
  transitionDuration: transitionDuration,
  displayLength,
}: {
  oldScale: number;
  oldMarginTop: number;
  newMarginTop: number;
  newScale: number;
  oldCode: MyHighlightedCode | null;
  currentCode: MyHighlightedCode;
  transitionDuration: number;
  displayLength: number;
}) {
  const frame = useCurrentFrame();

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

  const mainCode = useTransitionCodeLogic({
    currentCode,
    oldCode,
    transitionDuration,
  });

  const terminalOutput = useTransitionCodeLogic({
    currentCode: currentCode.terminalOutput,
    oldCode: oldCode?.terminalOutput,
    transitionDuration,
  });

  return (
    <div
      style={{
        transform: `scale(${scale}) ${featureFlags.USE_CENTRED_TEXT ? `translateY(${marginTop}px)` : ""}`,
        transformOrigin: "top left",
      }}
    >
      {terminalOutput.code && (
        <PreWithHandlers
          code={terminalOutput.code}
          ref={terminalOutput.ref}
          displayLength={displayLength}
        />
      )}
      {mainCode.code && (
        <PreWithHandlers
          code={mainCode.code}
          ref={mainCode.ref}
          displayLength={displayLength}
        />
      )}
    </div>
  );
}
