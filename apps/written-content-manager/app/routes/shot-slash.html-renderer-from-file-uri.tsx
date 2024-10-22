"use client";

/**
 * Responsible for rendering the snippets to a HTML file.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  transformCode,
  getCodeSamplesFromFile,
  htmlRendererFromFileUrlSchema,
  RENDER_TYPES,
} from "@total-typescript/twoslash-shared";
import { readFile } from "fs/promises";
import {
  CodeSnippetRenderer,
  type RendererData,
} from "~/shot-slash-components";

export const loader = async (
  args: LoaderFunctionArgs
): Promise<RendererData> => {
  const url = new URL(args.request.url);

  const searchParams = Object.fromEntries(url.searchParams);

  const { uri, ...renderType } =
    htmlRendererFromFileUrlSchema.parse(searchParams);

  const fileContents = await readFile(uri, "utf-8");
  const snippets = Array.from(getCodeSamplesFromFile(fileContents));

  if (
    renderType.mode === RENDER_TYPES.basicWithBorder ||
    renderType.mode === RENDER_TYPES.simpleNoBorder
  ) {
    const snippet = snippets[renderType.snippetIndex]!;

    const shikiResult = await transformCode(snippet);

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
      codeHtml: shikiResult.codeHtml,
      terminalText: shikiResult.terminalText,
    };
  } else if (
    renderType.mode === RENDER_TYPES.allBasicWithBorder ||
    renderType.mode === RENDER_TYPES.allSquareWithBorder
  ) {
    const content: { codeHtml: string; terminalText: string }[] = [];

    for (const snippet of snippets) {
      const shikiResult = await transformCode(snippet);

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

      content.push({
        codeHtml: shikiResult.codeHtml,
        terminalText: shikiResult.terminalText,
      });
    }

    return {
      mode: renderType.mode,
      content,
    };
  }

  throw new Error("unsupported");
};

export default function HTMLRendererFromFileURI() {
  const data = useLoaderData<typeof loader>();

  return <CodeSnippetRenderer data={data} />;
}
