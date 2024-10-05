"use client";

/**
 * Responsible for rendering the snippets to a HTML file.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  applyShikiToCode,
  getCodeSamplesFromFile,
  htmlRendererFromFileUrlSchema,
  RENDER_TYPES,
} from "@total-typescript/twoslash-shared";
import { readFile } from "fs/promises";
import { CodeSnippetRenderer } from "~/shot-slash-components";

export const loader = async (args: LoaderFunctionArgs) => {
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

export default function HTMLRendererFromFileURI() {
  const data = useLoaderData<typeof loader>();

  return <CodeSnippetRenderer data={data} />;
}
