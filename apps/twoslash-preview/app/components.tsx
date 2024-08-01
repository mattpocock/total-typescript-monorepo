import React, { forwardRef } from "react";
import { SCREENSHOT_TARGET_ID } from "./constants";
import { useForceSquareAspectRatio } from "./useForceSquareAspectRatio.js";
import clsx from "clsx";

const gradients = [
  "from-indigo-600 to-cyan-500",
  "from-purple-600 to-pink-500",
  "from-green-600 to-lime-600",
  "from-yellow-600 to-orange-500",
];

const getGradient = (index: number) => {
  return gradients[index % gradients.length];
};

export const ScreenshotSnippetWrapper = forwardRef(
  (
    props: {
      children: React.ReactNode;
      className?: string;
    },
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <div
        ref={ref}
        id={SCREENSHOT_TARGET_ID}
        className={clsx(
          props.className,
          "inline-flex items-center justify-center",
        )}
      >
        {props.children}
      </div>
    );
  },
);

export const ScreenshotSnippetWrapperWithBorder = (props: {
  outerClassName?: string;
  children: React.ReactNode;
  gradientIndex?: string;
}) => {
  const { outerRef, innerRef } = useForceSquareAspectRatio();

  return (
    <ScreenshotSnippetWrapper
      ref={outerRef}
      className={clsx(
        "bg-gradient-to-br inline-flex items-center justify-center",
        props.outerClassName,
        getGradient(Number(props.gradientIndex ?? 0)),
      )}
    >
      <div ref={innerRef} className="inline-block p-8 space-y-8">
        {props.children}
      </div>
    </ScreenshotSnippetWrapper>
  );
};

export const CodeSnippet = (props: { html: string }) => {
  return (
    <div
      className="bg-gray-900 rounded-xl px-0 shadow-2xl py-10"
      dangerouslySetInnerHTML={{
        __html: props.html,
      }}
    ></div>
  );
};
