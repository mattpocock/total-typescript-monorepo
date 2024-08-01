"use client";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { getCodeSamplesFromFile } from "@total-typescript/twoslash-shared";
import type { HTMLRendererSearchParams } from "~/types.js";
import { useSubscribeToSocket } from "../useSubscribeToSocket";

export const meta: MetaFunction = () => {
  return [
    { title: "Twoslash Preview" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  const { readFile } = await import("fs/promises");
  const url = new URL(args.request.url);

  const uri = url.searchParams.get("uri");

  if (!uri) {
    return {
      status: "waiting" as const,
    };
  }

  const fileContents = await readFile(uri, "utf-8");

  const codeBlocks = Array.from(getCodeSamplesFromFile(fileContents));

  return {
    status: "ready" as const,
    numberOfSnippets: codeBlocks.length,
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
          mode: "all-basic-with-border",
          cacheBuster: String(cacheBuster),
        } satisfies HTMLRendererSearchParams)}`}
        className="width-96"
      />
    </div>
  );
}
