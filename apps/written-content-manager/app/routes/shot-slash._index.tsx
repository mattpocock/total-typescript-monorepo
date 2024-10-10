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
import { PageContent, TitleArea } from "~/components";
import { useSubscribeToSocket } from "~/use-subscribe-to-socket";

export const meta: MetaFunction = () => {
  return [{ title: "ShotSlash | WCM" }];
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
    }
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
      }
    );
  });

  const data = useLoaderData<typeof loader>();

  const renderType =
    (params.get("renderType") as RenderType) ?? RENDER_TYPES.simpleNoBorder;

  if (data.status === "waiting") {
    return (
      <Wrapper>
        <p>Waiting for snippet...</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="space-y-8 max-w-3xl">
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
              }
            );
          }}
          className="p-2 px-4 rounded-md bg-gray-100 appearance-none"
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
                  src={`http://localhost:${IMAGE_SERVER_PORT}/render-from-uri?${new URLSearchParams(
                    {
                      uri: data.uri,
                      mode: renderType,
                      cacheBuster: data.fileContentsHash,
                    } satisfies HTMLRendererSearchParams
                  )}`}
                  className="width-96  rounded-lg"
                />
              );
            case RENDER_TYPES.basicWithBorder:
            case RENDER_TYPES.simpleNoBorder:
              return data.snippetHashes.map((hash, index) => {
                return (
                  <img
                    key={index}
                    src={`http://localhost:${IMAGE_SERVER_PORT}/render-from-uri?${new URLSearchParams(
                      {
                        uri: data.uri,
                        mode: renderType,
                        snippetIndex: String(index),
                        cacheBuster: hash,
                      } satisfies HTMLRendererSearchParams
                    )}`}
                    className="width-96  rounded-lg"
                  />
                );
              });
          }
          return null;
        })()}
      </div>
    </Wrapper>
  );
}

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <PageContent>
      <TitleArea
        title="ShotSlash"
        underTitle={
          <p className="text-gray-600">
            Use Twoslash to create awesome screenshots for your posts.
          </p>
        }
      ></TitleArea>
      {children}
    </PageContent>
  );
};
