"use client";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { getCodeSamplesFromFile } from "@total-typescript/twoslash-shared";
import {
  RENDER_TYPE_HUMAN_READABLE_NAMES,
  RENDER_TYPES,
  type HTMLRendererSearchParams,
  type RenderType,
} from "~/types.js";
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
  const [params, setSearchParams] = useSearchParams();

  useSubscribeToSocket((uri) => {
    console.log("setting search params");
    cacheBuster++;

    setSearchParams(
      (prev) => {
        prev.set("uri", uri);
        prev.set("cacheBuster", String(cacheBuster));

        return prev;
      },
      {
        preventScrollReset: true,
      },
    );
  });

  const data = useLoaderData<typeof loader>();

  const renderType =
    (params.get("renderType") as RenderType) ?? RENDER_TYPES.allBasicWithBorder;

  if (data.status === "waiting") {
    return <div>Waiting for snippet...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto my-16 px-8 space-y-8">
      <select
        value={renderType}
        onChange={(e) => {
          setSearchParams(
            (prev) => {
              prev.set("renderType", e.target.value);

              return prev;
            },
            {
              preventScrollReset: true,
            },
          );
        }}
        className="bg-gray-800 p-2 rounded-md"
      >
        {Object.entries(RENDER_TYPES).map(([key, value]) => {
          if (key === "error") return null;
          return (
            <option key={key} value={value}>
              {
                RENDER_TYPE_HUMAN_READABLE_NAMES[
                  key as keyof typeof RENDER_TYPES
                ]
              }
            </option>
          );
        })}
      </select>
      {(() => {
        switch (renderType) {
          case RENDER_TYPES.allBasicWithBorder:
          case RENDER_TYPES.allSquareWithBorder:
            return (
              <img
                src={`/render?${new URLSearchParams({
                  uri: data.uri,
                  mode: renderType,
                  cacheBuster: String(cacheBuster),
                } satisfies HTMLRendererSearchParams)}`}
                className="width-96 border-2 border-gray-700 rounded-lg"
              />
            );
          case RENDER_TYPES.basicWithBorder:
          case RENDER_TYPES.simpleNoBorder:
            return Array.from({ length: data.numberOfSnippets }).map(
              (_, index) => {
                return (
                  <img
                    key={index}
                    src={`/render?${new URLSearchParams({
                      uri: data.uri,
                      mode: renderType,
                      snippetIndex: String(index),
                      cacheBuster: String(cacheBuster),
                    } satisfies HTMLRendererSearchParams)}`}
                    className="width-96 border-2 border-gray-700 rounded-lg"
                  />
                );
              },
            );
        }
        return null;
      })()}
    </div>
  );
}
