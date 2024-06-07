import path from "path";

export type WSEvent = {
  type: "new-html";
  html: string;
  snippets: CodeSnippet[];
};

export type EncodedHTML = string & { __brand: "EncodedHTML" };

export type CodeSnippet = {
  rawHtml: EncodedHTML;
};

export * from "./applyShikiToMarkdownFile.js";
export * from "./applyShikiToCode.js";

export const SHIKI_TEST_LOCATION = path.resolve(
  import.meta.dirname,
  "../shiki-test.md",
);
