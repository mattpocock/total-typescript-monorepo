## The Error

> Relative import paths need explicit file extensions in EcmaScript imports when '--moduleResolution' is 'node16' or 'nodenext'.

```ts
// Relative import paths need explicit file extensions in
// EcmaScript imports when '--moduleResolution' is 'node16'
// or 'nodenext'.

import { example } from "./foo";
```

## The Solution That Doesn't Work

Adding a `.ts` extension to the import path doesn't work, and results in the following error:

> An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

```ts
// An import path can only end with a '.ts' extension when
// 'allowImportingTsExtensions' is enabled.

import { example } from "./foo.ts";
```

## The Solution

Add the `.js` extension to the import path.

```ts
import { example } from "./foo.js";
```

## Why Do We Need to Use JS File Extensions?

This error happens because you've specified `moduleResolution: NodeNext`. This tells TypeScript that you want your imports and exports to conform strictly to the Node spec.

The Node spec requires that you use `.js` file extensions for all imports and exports. This was decided so that a relative import path like `./foo.js` would work both in [Node and the browser](https://twitter.com/giltayar/status/1711669549760757997).

This also simplifies Node's module resolution strategy - Node doesn't have to do any guesswork to figure out what file to import. Thanks to [Gil Tayer](https://twitter.com/giltayar/status/1711670026464354460) for clarifying this for me.

## What if I don't want to use JS file extensions?

- Make sure you're using an external compiler, like esbuild, to compile your TypeScript code.
- Change your `tsconfig.json` to use `moduleResolution: Bundler` instead of `moduleResolution: NodeNext`.
