"use client";

/**
 * Responsible for rendering the snippets to a HTML file.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  applyShikiToCode,
  htmlRendererFromCodeSchema,
} from "@total-typescript/twoslash-shared";
import { CodeSnippetRenderer, type RendererData } from "~/components";

export const loader = async (
  args: LoaderFunctionArgs,
): Promise<RendererData> => {
  const url = new URL(args.request.url);

  const searchParams = Object.fromEntries(url.searchParams);

  const { code, lang, renderType } =
    htmlRendererFromCodeSchema.parse(searchParams);

  const shikiResult = await applyShikiToCode({
    code: code,
    lang: lang,
  });

  if (!shikiResult.success) {
    return {
      mode: "error",
      title: shikiResult.title,
      description: shikiResult.description,
      recommendation: shikiResult.recommendation,
      code: code,
    };
  }

  return {
    mode: renderType,
    html: shikiResult.html,
  };
};

export default function HTMLRendererFromFileURI() {
  const data = useLoaderData<typeof loader>();

  return <CodeSnippetRenderer data={data} />;
}
