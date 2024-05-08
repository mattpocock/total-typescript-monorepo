# What are `.mjs`, `.cjs`, `.mts`, and `.cts` extensions?

## Quick Explanation

- `.mjs` and `.cjs` are a way to tell Node.js explicitly how to interpret your JavaScript files.

- If you're using CommonJS modules with `require`, you should use `.cjs`.

- If you're using ES modules with `import`, you should use `.mjs`.

- `.mts` and `.cts` are TypeScript-specific extensions that tell TypeScript what to compile that specific file down to.

- There are also versions of these extensions that are designed to contain jsx: `.mjsx`, `.cjsx`, `.mtsx`, and `.ctsx`.

- By default, `.js` files will be considered as CommonJS modules. This changes if you set `"type": "module"` in your `package.json` file.

- When using TypeScript, you'll need to import code using the _JAVASCRIPT_ version of the file extension.

```ts
// importing from foo.mts
import { foo } from "./foo.mjs";

// importing from bar.cts
import { bar } from "./bar.cjs";

// importing from baz.js
import { baz } from "./baz.js";
```

- If you're planning to make use of this, you should set `module: "NodeNext"` and `moduleResolution: "NodeNext"` in your `tsconfig.json` file. This will make TypeScript respect the `.mts` and `.cts` extensions.

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

- If you want TypeScript to ensure you use the correct module syntax, you can set `verbatimModuleSyntax: true` in your `tsconfig.json` file. This will make TypeScript throw an error if you use the wrong module syntax.

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

- When `verbatimModuleSyntax` is set to `true`, you'll need to use TypeScript's version of CommonJS imports and exports in your `.cts` files:

```ts
import { foo } = require("./foo.cjs");

const example = 123;

export = example;
```
