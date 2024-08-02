"use client";

/**
 * Responsible for rendering the snippets to a HTML file.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  applyShikiToCode,
  getCodeSamplesFromFile,
} from "@total-typescript/twoslash-shared";
import { readFile } from "fs/promises";
import {
  CodeSnippet,
  ScreenshotSnippetWrapper,
  ScreenshotSnippetWrapperWithBorder,
} from "~/components";
import { htmlRendererSchema, RENDER_TYPES } from "~/types";

export const loader = async (args: LoaderFunctionArgs) => {
  const url = new URL(args.request.url);

  const searchParams = Object.fromEntries(url.searchParams);

  const { uri, ...renderType } = htmlRendererSchema.parse(searchParams);

  const fileContents = await readFile(uri, "utf-8");
  const snippets = Array.from(getCodeSamplesFromFile(fileContents));

  if (
    renderType.mode === RENDER_TYPES.basicWithBorder ||
    renderType.mode === RENDER_TYPES.simpleNoBorder
  ) {
    const snippet = snippets[renderType.snippetIndex]!;

    const shikiResult = await applyShikiToCode({
      code: snippet.code,
      lang: snippet.lang,
    });

    if (!shikiResult.success) {
      return {
        mode: "error" as const,
        error: "Failed to apply shiki to code sample",
        title: shikiResult.title,
        description: shikiResult.description,
        recommendation: shikiResult.recommendation,
        code: snippet.code,
      };
    }

    if (!snippet) {
      throw new Error("Snippet not found at index " + renderType.snippetIndex);
    }

    return {
      mode: renderType.mode,
      html: shikiResult.html,
    };
  } else if (
    renderType.mode === RENDER_TYPES.allBasicWithBorder ||
    renderType.mode === RENDER_TYPES.allSquareWithBorder
  ) {
    const html: string[] = [];

    for (const snippet of snippets) {
      const shikiResult = await applyShikiToCode({
        code: snippet.code,
        lang: snippet.lang,
      });

      if (!shikiResult.success) {
        return {
          mode: "error" as const,
          error: "Failed to apply shiki to code sample",
          title: shikiResult.title,
          description: shikiResult.description,
          recommendation: shikiResult.recommendation,
          code: snippet.code,
        };
      }

      html.push(shikiResult.html);
    }

    return {
      mode: renderType.mode,
      html,
    };
  }
};

export default function Render() {
  const data = useLoaderData<typeof loader>();

  switch (data.mode) {
    case RENDER_TYPES.basicWithBorder: {
      return (
        <ScreenshotSnippetWrapperWithBorder>
          <CodeSnippet html={data.html} />
        </ScreenshotSnippetWrapperWithBorder>
      );
    }
    case RENDER_TYPES.simpleNoBorder: {
      return (
        <ScreenshotSnippetWrapper>
          <CodeSnippet html={data.html} />
        </ScreenshotSnippetWrapper>
      );
    }
    case RENDER_TYPES.allSquareWithBorder:
      return (
        <ScreenshotSnippetWrapperWithBorder outerClassName="aspect-square">
          {data.html.map((html, index) => {
            return <CodeSnippet key={index} html={html} />;
          })}
        </ScreenshotSnippetWrapperWithBorder>
      );
    case RENDER_TYPES.allBasicWithBorder: {
      return (
        <ScreenshotSnippetWrapperWithBorder>
          {data.html.map((html, index) => {
            return <CodeSnippet key={index} html={html} />;
          })}
        </ScreenshotSnippetWrapperWithBorder>
      );
    }
    case "error":
      return (
        <ScreenshotSnippetWrapper>
          <div className="p-6 space-y-4 bg-gray-900 text-4xl">
            <pre className="leading-snug">{data.code}</pre>
            <h1 className="">{data.title}</h1>
            <p className="">{data.description}</p>
            <p className="">{data.recommendation}</p>
          </div>
        </ScreenshotSnippetWrapper>
      );
  }
}
