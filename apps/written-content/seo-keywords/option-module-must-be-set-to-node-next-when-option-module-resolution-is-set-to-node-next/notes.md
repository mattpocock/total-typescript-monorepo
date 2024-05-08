> Option 'module' must be set to 'NodeNext' when option 'moduleResolution' is set to 'NodeNext'

This error, new to TypeScript 5.2, might be happening for a few reasons. Let's break down all the reasons why it might be happening and how to fix it.

## I'm Transpiling With `tsc`

In this section, I'm going to assume that you're using `tsc` to transpile your code. I.e., you've set `noEmit` to `false`, and you're running `tsc` to produce JavaScript files. If you're not, you can skip to the next section.

### Problem 1: Your `module` Config is Outdated

Choosing `moduleResolution`: `NodeNext` indicates that the code you're writing is targeting Node. Your `module` might be set to `commonjs`.

#### Why doesn't `commonjs` work?

The reason `commonjs` no longer works is that TypeScript files can be written with `.mts` file extensions. This allows you to write some files which are ES Modules, and some which are CommonJS. Using `commonjs` with `.mts` file extensions mangles the output.

### Solution 1

Since TypeScript 5.2, any code written _for Node_ must use `module: "NodeNext"`.

Set `module` and `moduleResolution` to `NodeNext` in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

#### What about `Node16`?

`Node16` is also a valid option for `module` and `moduleResolution`:

```json
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16"
  }
}
```

Currently, this is equivalent to if both were set to `NodeNext`. However, using `NodeNext` is safer because it's future-proof - the module resolution algorithm might change in the future, and `NodeNext` will always use the latest version.

### Problem 2: `module` is Set to `ESNext`

All LTS Node versions now support ES Modules. If your `module` config option is set to `ESNext`, you might be trying to use ES Modules in Node.

#### Why doesn't `ESNext` work?

`ESNext` doesn't work for the _opposite_ reason `commonjs` doesn't work - it doesn't respect the difference between `.mts` and `.cts` files.

`NodeNext` respects the difference between `.mts` and `.cts` files and emits the correct code for each.

### Solution 2

If you want to emit ES Modules for Node, there's a better way.

1. Set `module` to `NodeNext`

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

2. Add `"type": "module"` to your `package.json`

```json
{
  "type": "module"
}
```

Now, your emitted code will be ES Modules, and your `package.json` will be set up correctly.

## I'm Not Transpiling With `tsc`

If you're using a bundler like `esbuild`, `swc`, `vite`, or your framework of choice handles it, this is the section for you.

If you're not sure, check if your `tsconfig.json` has `noEmit: true` in it. If it does, you're _not_ bundling with TypeScript.

### You're Using The Wrong `moduleResolution`

If you're not bundling with TypeScript, you should be using `moduleResolution: "bundler"` and `module: "ESNext"`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

`moduleResolution: "bundler"` is designed for situations where TypeScript is not responsible for emitting code. It tells TypeScript to assume that the bundler will handle emitting modules.

`module: "ESNext"` is required with `moduleResolution: "bundler"` because it most closely matches the assumptions most bundlers make about your TypeScript code.
