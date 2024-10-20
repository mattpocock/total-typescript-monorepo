"use client";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { getActiveEditorFilePath } from "@total-typescript/shared";
import {
  getCodeSamplesFromFile,
  IMAGE_SERVER_PORT,
  RENDER_TYPE_HUMAN_READABLE_NAMES,
  RENDER_TYPES,
  type HTMLRendererSearchParams,
  type RenderType,
} from "@total-typescript/twoslash-shared";
import path from "path";
import { PageContent, PageDescription, TitleArea } from "~/components";
import { Combobox } from "~/components/ui/combobox";
import { shotSlashUrl } from "~/routes";
import { useSubscribeToSocket } from "~/use-subscribe-to-socket";

export const meta: MetaFunction = () => {
  return [{ title: "ShotSlash | WCM" }];
};

export const loader = async (args: LoaderFunctionArgs) => {
  const { readFile } = await import("fs/promises");
  const { createHash } = await import("crypto");

  const url = new URL(args.request.url);

  let uri = url.searchParams.get("uri");

  if (!uri) {
    const activeFilePath = (await getActiveEditorFilePath()).match(
      (t) => t,
      () => null
    );

    if (!activeFilePath) {
      return {
        status: "waiting" as const,
      };
    }

    uri = activeFilePath;
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

  const relativeUri = path.relative(process.cwd(), uri);

  return {
    status: "ready" as const,
    snippetHashes,
    fileContentsHash,
    uri,
    relativeUri,
  };
};

export default function Index() {
  const [params, setSearchParams] = useSearchParams();

  const data = useLoaderData<typeof loader>();

  const submit = useSubmit();

  useSubscribeToSocket(() => {
    submit(null, {
      replace: true,
      method: "GET",
      preventScrollReset: true,
    });
  });

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
        <Combobox
          defaultValue={renderType}
          className="max-w-80"
          onChange={(e) => {
            setSearchParams(
              (prev) => {
                prev.set("renderType", e.value);
                return prev;
              },
              {
                replace: false,
                preventScrollReset: true,
              }
            );
          }}
          preventDeselection
          emptyText=""
          name="renderType"
          options={Object.entries(RENDER_TYPES).flatMap(([key, value]) => {
            if (key === "error") return [];

            return {
              label:
                RENDER_TYPE_HUMAN_READABLE_NAMES[
                  key as keyof typeof RENDER_TYPES
                ],
              value,
            };
          })}
        ></Combobox>
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
        {data.snippetHashes.length === 0 && (
          <div>
            <span>No Snippets Found at</span>
            <br />
            <span className="font-mono text-sm">{data.relativeUri}</span>
          </div>
        )}
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
          <PageDescription>
            Use Twoslash to create awesome screenshots for your posts.
          </PageDescription>
        }
      ></TitleArea>
      {children}
    </PageContent>
  );
};
