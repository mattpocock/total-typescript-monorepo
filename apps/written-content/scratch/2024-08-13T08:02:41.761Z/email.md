# Node 22's `glob` function is so nice

Node 22's experimental glob function is so freaking beautiful.

```ts twoslash
// @types: node
import { glob } from "node:fs/promises";

// 1. Grabs all files based on a glob...
const markdownFiles = await glob("./**/*.md");

// 2. ...and streams them to you via an
// async iterator.
for await (const file of markdownFiles) {
  console.log(file);
}
```

There are tons of `glob` libraries in the wild. I tend to gravitate to `fast-glob` through force of habit.

But `fast-glob` waits until it has all the results available, then returns them.

```ts twoslash
import fg from "fast-glob";

const markdownFiles = await fg("./**/*.md");

for (const file of markdownFiles) {
  console.log(file);
}
```

`glob` from `node:fs/promises` is new to Node 22. Instead of waiting for all results to become available, it streams them to you.

This is a huge win speed, especially when dealing with large directories.

Love it.

https://nodejs.org/en/blog/announcements/v22-release-announce#glob-and-globsync
