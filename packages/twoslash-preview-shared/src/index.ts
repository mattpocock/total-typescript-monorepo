export type WSEvent = {
  type: "new-html";
  html: string;
  snippets: CodeSnippet[];
};

export type EncodedHTML = string & { __brand: "EncodedHTML" };

export type CodeSnippet = {
  rawHtml: EncodedHTML;
};
