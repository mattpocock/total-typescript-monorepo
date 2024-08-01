"use client";

import { createUrl } from "./createUrl";
import { useSubscribeToSocket } from "./useSubscribeToSocket";

export default function Home() {
  const state = useSubscribeToSocket();

  return (
    <div className="max-w-6xl mx-auto my-16 px-8">
      <h1 className="my-12 text-5xl">Article</h1>
      <div
        className=" my-16 prose prose-invert"
        dangerouslySetInnerHTML={{
          __html: state.html ?? "",
        }}
      ></div>
      {state.snippets.length > 0 && (
        <>
          <h1 className="my-12 text-5xl">Single Images</h1>
          <div className=" grid grid-cols-2 gap-6">
            <a
              href={createUrl("/snippet/all-square", {
                encodedHtml: state.snippets
                  .map((snippet) => snippet.rawHtml)
                  .join(","),
                index: "0",
              })}
            >
              <img
                src={createUrl("/api/code-snippet-image", {
                  mode: "all-square",
                  encodedHtml: state.snippets
                    .map((snippet) => snippet.rawHtml)
                    .join(","),
                  index: "0",
                })}
                className="w-full"
              />
            </a>
          </div>
          {/* <h1 className="my-12 text-5xl">Square Images</h1>
          <div className=" grid grid-cols-3 gap-6">
            {state.snippets.map((snippet, index) => {
              return (
                <a
                  key={index}
                  href={createUrl("/snippet/square", {
                    encodedHtml: snippet.rawHtml,
                    index: String(index),
                  })}
                >
                  <img
                    src={createUrl("/api/code-snippet-image", {
                      mode: "square",
                      encodedHtml: snippet.rawHtml,
                      index: String(index),
                    })}
                    className="w-full"
                  />
                </a>
              );
            })}
          </div> */}
        </>
      )}
    </div>
  );
}
