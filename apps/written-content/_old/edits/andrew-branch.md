# NodeNext: It’s For CommonJS Too

In TypeScript 5.2, `moduleResolution: nodenext` can no longer be combined with any `module` setting other than `nodenext`.[^1] There has been a misconception that `module: nodenext` means only emitting ECMAScript Modules (ESM). In fact, `module: nodenext` can emit CJS _or_ ESM.

To emit CommonJS modules, you ensure that your `package.json` file _doesn't_ have `"type": "module"`. To emit ESM, you ensure that your `package.json` file _does_ have `"type": "module"`.

For most users, migrating from `commonjs` to `nodenext` won’t require changing anything other than their `tsconfig.json`.

Node.js has strict rules about where ESM and CommonJS code can be written. Import and export statements are _only allowed_ in `.mjs` files and in `.js` files (recursively) inside directories with `"type": "module"` in a `package.json` file. Without that special field in `package.json`, Node.js will crash when parsing an `import` in a `.js` file:

```
❯ node module.js
(node:61878) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
/module.js:1
import "fs"
^^^^^^

SyntaxError: Cannot use import statement outside a module
```

What does this mean for TypeScript?

Let's say you’re running `tsc` on a file `index.ts`, which will produce an output called `index.js`.

If TypeScript knows you’re going to run that file in Node.js, it doesn’t really make sense to ask TypeScript to emit the file in ESM or CommonJS.

Only _one_ of those will run without crashing — and which one will work depends on the nearest `package.json` file.

So instead of saying “give me a CommonJS file” or “give me an ESM file,” you instead say “give me the format that won’t crash!” by using `module: nodenext`. Instead of controlling the output format with your `tsconfig.json`, you control it with your file extensions and `package.json` files, which ensures that TypeScript and Node.js are on the same page.

This is a relatively new way of looking at the `module` option in TypeScript. Rather than imperative instructions to force an output format like `commonjs` and `esnext`, `node16` and `nodenext` are declarative statements about how modules work in the target runtime.

The upshot is that **`node16` and `nodenext` are the only correct `module` options for all supported Node.js versions**, regardless of whether you’re using CommonJS or ESM. As long as Node.js supports both formats, `nodenext` will support both formats too.

[^1]: Likewise, using `module: nodenext` requires you to use `moduleResolution: nodenext`. The same is true for all the `node16` values (which are currently aliases for `nodenext`). In other words, `module` and `moduleResolution` always have to be set to the same value when a `node16` or `nodenext` is involved.
