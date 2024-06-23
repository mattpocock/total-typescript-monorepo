import {
  AnnotationHandler,
  HighlightedCode,
  Pre,
} from "codehike/code";
import React, { forwardRef, useMemo } from "react";
import {
  interpolate,
  useCurrentFrame,
} from "remotion";

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

const bg = (outerProps: {
  displayLength: number;
}): AnnotationHandler => ({
  name: "bg",
  Inline: ({ annotation, children }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(
      frame,
      [
        35,
        45,
        outerProps.displayLength - 35,
        outerProps.displayLength,
      ],
      [0, 1, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
    return (
      <span className="relative">
        <span
          className="h-2 from-sky-300 to-yellow-200 rounded-full bg-gradient-to-r absolute w-full -bottom-2 left-0"
          style={{
            opacity,
          }}
        ></span>
        {children}
      </span>
    );
  },
});

interface PreWithHandlersProps
  extends React.HTMLAttributes<HTMLPreElement> {
  code: HighlightedCode;
  displayLength: number;
}

export const PreWithHandlers = forwardRef(
  (
    props: PreWithHandlersProps,
    ref: React.ForwardedRef<HTMLPreElement>,
  ) => {
    const { displayLength, ...rest } = props;
    const handlers: AnnotationHandler[] =
      useMemo(() => {
        return [
          inlineBlockTokens,
          errorCallout(displayLength),
          queryCallout(displayLength),
          bg({ displayLength: displayLength }),
        ];
      }, [displayLength]);

    const style = useMemo<React.CSSProperties>(() => {
      return {
        position: "relative",
        fontSize: 40,
        lineHeight: 1.5,
      };
    }, []);

    return (
      <Pre
        {...rest}
        style={{ ...style, ...rest.style }}
        handlers={handlers}
        ref={ref}
      />
    );
  },
);
