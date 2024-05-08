## Strongly type URL Search Params with satisfies

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

## Strongly typed POST request with satisfies

```ts twoslash
type Post = {
  title: string;
  content: string;
};

fetch("/api/posts", {
  method: "POST",
  body: JSON.stringify({
    title: "New Post",
    content: "Lorem ipsum.",
  } satisfies Post),
});
```

---

Use the examples above as inspiration. Create a new code sample illustrating the title below. Do not add any accompanying text.

## Strongly typed POST request with satisfies
