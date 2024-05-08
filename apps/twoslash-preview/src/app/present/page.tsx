"use client";

import { decompressFromEncodedURIComponent } from "lz-string";
import { useSubscribeToSocket } from "../useSubscribeToSocket";
import { useEffect, useState } from "react";

export default function Present() {
  const state = useSubscribeToSocket();

  const [currentSnippetIndex, setSnippetIndex] = useState(0);

  const currentSnippet = state.snippets[currentSnippetIndex];

  useEffect(() => {
    if (!state.snippets[currentSnippetIndex]) {
      setSnippetIndex(0);
    }
  }, [state.snippets, currentSnippetIndex]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setSnippetIndex((index) => {
          if (index === state.snippets.length - 1) {
            return index;
          }
          return index + 1;
        });
      }
      if (event.key === "ArrowLeft") {
        setSnippetIndex((index) => {
          if (index === 0) {
            return index;
          }
          return index - 1;
        });
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <div className="overflow-hidden flex-nowrap">
      {currentSnippet && (
        <div className="inline-flex items-center justify-center w-screen h-screen overflow-hidden">
          <div
            className="inline-block prose max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                decompressFromEncodedURIComponent(currentSnippet.rawHtml) ?? "",
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
