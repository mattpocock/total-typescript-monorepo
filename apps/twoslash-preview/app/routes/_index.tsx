"use client";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import {
  getCodeSamplesFromFile,
  IMAGE_SERVER_PORT,
  RENDER_TYPE_HUMAN_READABLE_NAMES,
  RENDER_TYPES,
  type HTMLRendererSearchParams,
  type RenderType,
} from "@total-typescript/twoslash-shared";
import { useSubscribeToSocket } from "../useSubscribeToSocket";

export const meta: MetaFunction = () => {
  return [
    { title: "Twoslash Screenshot Tool" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  const { readFile } = await import("fs/promises");
  const { createHash } = await import("crypto");

  const url = new URL(args.request.url);

  const uri = url.searchParams.get("uri");

  if (!uri) {
    return {
      status: "waiting" as const,
    };
  }

  const fileContents = await readFile(uri, "utf-8");

  const snippetHashes = Array.from(getCodeSamplesFromFile(fileContents)).map(
    (codeBlock) => {
      const hash = createHash("md5")
        .update(`${codeBlock.code}${codeBlock.lang}`)
        .digest("hex");
      return hash;
    },
  );

  const fileContentsHash = createHash("md5").update(fileContents).digest("hex");

  return {
    status: "ready" as const,
    snippetHashes,
    fileContentsHash,
    uri,
  };
};

export default function Index() {
  const [params, setSearchParams] = useSearchParams();

  useSubscribeToSocket((uri) => {
    setSearchParams(
      (prev) => {
        prev.set("uri", uri);

        return prev;
      },
      {
        preventScrollReset: true,
        replace: true,
      },
    );
  });

  const data = useLoaderData<typeof loader>();

  const renderType =
    (params.get("renderType") as RenderType) ?? RENDER_TYPES.simpleNoBorder;

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
              replace: true,
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
                src={`http://localhost:${IMAGE_SERVER_PORT}/render?${new URLSearchParams(
                  {
                    uri: data.uri,
                    mode: renderType,
                    cacheBuster: data.fileContentsHash,
                  } satisfies HTMLRendererSearchParams,
                )}`}
                className="width-96 border-2 border-gray-700 rounded-lg"
              />
            );
          case RENDER_TYPES.basicWithBorder:
          case RENDER_TYPES.simpleNoBorder:
            return data.snippetHashes.map((hash, index) => {
              return (
                <img
                  key={index}
                  src={`http://localhost:${IMAGE_SERVER_PORT}/render?${new URLSearchParams(
                    {
                      uri: data.uri,
                      mode: renderType,
                      snippetIndex: String(index),
                      cacheBuster: hash,
                    } satisfies HTMLRendererSearchParams,
                  )}`}
                  className="width-96 border-2 border-gray-700 rounded-lg"
                />
              );
            });
        }
        return null;
      })()}
    </div>
  );
}
