import { ClientOnly } from "remix-utils/client-only";
import { EagerlyLoadedEditor, type CodeEditorProps } from "./code-editor";

export const LazyLoadedEditor = (props: CodeEditorProps) => {
  return <ClientOnly>{() => <EagerlyLoadedEditor {...props} />}</ClientOnly>;
};
