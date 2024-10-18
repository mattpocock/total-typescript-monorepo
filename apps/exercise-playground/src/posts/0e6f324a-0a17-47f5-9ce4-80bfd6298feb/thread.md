```ts twoslash
// @noErrors
declare global {
  interface ImportMeta {
    glob: <T>(...args: string[]) => Record<string, Promise<() => T>>;
  }
}

// ---cut---
// 1. Add this into any Vite setup...
const mdxFiles = import.meta.glob("./content/**.mdx");

// 2. and it compiles to...
{
  "./content/foo.mdx": () => import("./content/foo.mdx"),
  "./content/bar.mdx": () => import("./content/bar.mdx"),
};
```
