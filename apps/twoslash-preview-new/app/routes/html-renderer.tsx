/**
 * Responsible for rendering the snippets to a HTML file.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { applyShikiToMarkdownFile } from "@total-typescript/twoslash-shared";
import { readFile } from "fs/promises";
import { z } from "zod";
import { CodeSnippet, ScreenshotSnippetWrapper } from "~/components";
import { htmlRendererSchema } from "~/types";

export const loader = async (args: LoaderFunctionArgs) => {
  const url = new URL(args.request.url);

  const searchParams = Object.fromEntries(url.searchParams);

  const { uri, ...renderType } = htmlRendererSchema.parse(searchParams);

  const fileContents = await readFile(uri, "utf-8");
  const { snippets } = await applyShikiToMarkdownFile(fileContents);
  if (renderType.mode === "basic") {
    const snippet = snippets[renderType.snippetIndex];

    if (!snippet) {
      throw new Error("Snippet not found at index " + renderType.snippetIndex);
    }

    return {
      mode: "basic" as const,
      html: snippet.rawHtml,
    };
  } else if (
    renderType.mode === "all-basic" ||
    renderType.mode === "all-square"
  ) {
    return {
      mode: renderType.mode,
      html: snippets.map((snippet) => snippet.rawHtml),
    };
  }
};

export default function Render() {
  const data = useLoaderData<typeof loader>();

  if (data.mode === "basic") {
    return (
      <ScreenshotSnippetWrapper>
        <CodeSnippet html={data.html} />
      </ScreenshotSnippetWrapper>
    );
  } else if (data.mode === "all-square") {
    return (
      <ScreenshotSnippetWrapper outerClassName="aspect-square">
        {data.html.map((html, index) => {
          return <CodeSnippet key={index} html={html} />;
        })}
      </ScreenshotSnippetWrapper>
    );
  } else if (data.mode === "all-basic") {
    return (
      <ScreenshotSnippetWrapper>
        {data.html.map((html, index) => {
          return <CodeSnippet key={index} html={html} />;
        })}
      </ScreenshotSnippetWrapper>
    );
  }
}
