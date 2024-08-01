"use client";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { applyShikiToMarkdownFile } from "@total-typescript/twoslash-shared";
import { readFile } from "fs/promises";
import { useSubscribeToSocket } from "../useSubscribeToSocket";
import type { HTMLRendererSearchParams } from "~/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Narration Recorder" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  const url = new URL(args.request.url);

  const uri = url.searchParams.get("uri");

  if (!uri) {
    return {
      status: "waiting" as const,
    };
  }

  const fileContents = await readFile(uri, "utf-8");

  const markdown = await applyShikiToMarkdownFile(fileContents);

  const numberOfSnippets = markdown.snippets.length;

  return {
    status: "ready" as const,
    numberOfSnippets,
    uri,
  };
};

let cacheBuster = 0;

export default function Index() {
  const [, setSearchParams] = useSearchParams();

  useSubscribeToSocket((uri) => {
    console.log("setting search params");
    cacheBuster++;
    setSearchParams({ uri, cacheBuster: String(cacheBuster) });
  });

  const data = useLoaderData<typeof loader>();

  if (data.status === "waiting") {
    return <div>Waiting for snippet...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto my-16 px-8">
      <h1>Basic Snippet</h1>
      <img
        src={`/render?${new URLSearchParams({
          uri: data.uri,
          mode: "all-basic",
          cacheBuster: String(cacheBuster),
        } satisfies HTMLRendererSearchParams)}`}
        className="size-96"
      />
    </div>
  );
}
