```ts
import { z } from "zod";

const searchParams = new URLSearchParams({
  encodedHtml: snippet.rawHtml,
} satisfies CodeSnippetImageSchema);

export const codeSnippetImageSchema = z.object({
  encodedHtml: z.string(),
});

export type CodeSnippetImageSchema = z.infer<
  typeof codeSnippetImageSchema
>;
```

```ts twoslash
const GITHUB_REPO = `/microsoft/TypeScript/issues/new`;

// ---cut---
// @errors: 1360
type GHIssueURLParams = {
  title: string;
  body: string;
};

const params = new URLSearchParams({
  title: "New Issue",
} satisfies GHIssueURLParams);

const url = `${GITHUB_REPO}?${params}`;
```

export const codeSnippetImageSchema = z.object({
encodedHtml: z.string(),
});

export type CodeSnippetImageSchema = z.infer<
typeof codeSnippetImageSchema

> ;

```

```
