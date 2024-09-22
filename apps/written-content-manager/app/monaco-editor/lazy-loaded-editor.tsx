import React, { Suspense } from "react";
import type { CodeEditorProps } from "./code-editor";

const _LazyLoadedEditor = React.lazy(() =>
  import("./code-editor").then((res) => {
    return {
      default: res.EagerlyLoadedEditor,
    };
  })
);

export const LazyLoadedEditor = (props: CodeEditorProps) => {
  return (
    <Suspense fallback={null}>
      <_LazyLoadedEditor {...props} />
    </Suspense>
  );
};
