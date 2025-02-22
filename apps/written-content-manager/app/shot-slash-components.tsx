"use client";

import {
  RENDER_TYPES,
  SCREENSHOT_TARGET_ID,
} from "@total-typescript/twoslash-shared";
import clsx from "clsx";
import React, { forwardRef } from "react";
import { useForceSquareAspectRatio } from "./use-force-square-aspect-ratio.js";

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
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div
        ref={ref}
        id={SCREENSHOT_TARGET_ID}
        className={clsx(
          props.className,
          "inline-flex items-center justify-center"
        )}
      >
        {props.children}
      </div>
    );
  }
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
        getGradient(Number(props.gradientIndex ?? 0))
      )}
    >
      <div ref={innerRef} className="inline-block p-8 space-y-8">
        {props.children}
      </div>
    </ScreenshotSnippetWrapper>
  );
};

export const CodeSnippet = (props: {
  codeHtml: string;
  terminalText: string;
}) => {
  return (
    <>
      <div className="rounded-xl overflow-hidden">
        <div
          className="bg-gray-900 px-0 shadow-2xl py-10 text-white"
          dangerouslySetInnerHTML={{
            __html: props.codeHtml,
          }}
        ></div>
        {props.terminalText ? (
          <div className="bg-gray-950 px-12 py-10 pb-12">
            <div className="flex items-center space-x-4 pb-8">
              <div className="bg-red-500 size-[18px] rounded-full"></div>
              <div className="bg-yellow-500 size-[18px] rounded-full"></div>
              <div className="bg-green-500 size-[18px] rounded-full"></div>
            </div>

            <pre className="shadow-2xl text-gray-200 max-w-5xl text-xl text-wrap leading-7">
              {props.terminalText}
            </pre>
          </div>
        ) : null}
      </div>
    </>
  );
};

export type RendererData =
  | {
      mode:
        | typeof RENDER_TYPES.basicWithBorder
        | typeof RENDER_TYPES.simpleNoBorder;
      codeHtml: string;
      terminalText: string;
    }
  | {
      mode:
        | typeof RENDER_TYPES.allSquareWithBorder
        | typeof RENDER_TYPES.allBasicWithBorder;
      content: { codeHtml: string; terminalText: string }[];
    }
  | {
      mode: "error";
      error: string;
      code: string;
      title: string;
      description: string;
      recommendation: string;
    };

export function CodeSnippetRenderer({ data }: { data: RendererData }) {
  switch (data.mode) {
    case RENDER_TYPES.basicWithBorder: {
      return (
        <ScreenshotSnippetWrapperWithBorder>
          <CodeSnippet
            codeHtml={data.codeHtml}
            terminalText={data.terminalText}
          />
        </ScreenshotSnippetWrapperWithBorder>
      );
    }
    case RENDER_TYPES.simpleNoBorder: {
      return (
        <ScreenshotSnippetWrapper>
          <CodeSnippet
            codeHtml={data.codeHtml}
            terminalText={data.terminalText}
          />
        </ScreenshotSnippetWrapper>
      );
    }
    case RENDER_TYPES.allSquareWithBorder:
      return (
        <ScreenshotSnippetWrapperWithBorder outerClassName="aspect-square">
          {data.content.map((content, index) => {
            return (
              <CodeSnippet
                key={index}
                codeHtml={content.codeHtml}
                terminalText={content.terminalText}
              />
            );
          })}
        </ScreenshotSnippetWrapperWithBorder>
      );
    case RENDER_TYPES.allBasicWithBorder: {
      return (
        <ScreenshotSnippetWrapperWithBorder>
          {data.content.map((content, index) => {
            return (
              <CodeSnippet
                key={index}
                codeHtml={content.codeHtml}
                terminalText={content.terminalText}
              />
            );
          })}
        </ScreenshotSnippetWrapperWithBorder>
      );
    }
    case "error":
      return (
        <ScreenshotSnippetWrapper>
          <div className="p-6 space-y-4 bg-gray-900 text-4xl text-white">
            <pre className="leading-snug">{data.code}</pre>
            <h1 className="">{data.title}</h1>
            <p className="">{data.description}</p>
            <p className="">{data.recommendation}</p>
          </div>
        </ScreenshotSnippetWrapper>
      );
  }
}
