In this article, we'll learn how to set up TypeScript to bundle a Node app.

We'll be using:

- [pnpm](https://pnpm.io/) for package management.
- [Node.js](https://nodejs.org/en/) for running our code.
- [TypeScript](https://www.typescriptlang.org/) for type safety and for bundling our code.
- [ES Modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) as our module system.

## 0. Understanding the Tools

To make our Node app ready for production, we will need a few things:

- A `dev` script to run our code locally and check for TypeScript errors.
- A `build` script to bundle our code for production and check for TypeScript errors.
- A `start` script to run our bundled code in production.

## 1. Adding Our Config Files

### 1.1 `package.json`

Let's start with an empty repository and initialize it with `npm init -y`. This will create a `package.json` file.

### 1.2 `"type": "module"` in `package.json`

Next, add `"type": "module"` to the `package.json` file.

```json
{
  // ...other properties
  "type": "module"
  // ...other properties
}
```

This tells Node.js to use ES Modules instead of CommonJS modules.

### 1.3 Dependencies

If you don't have pnpm installed, [install it](https://pnpm.io/).

Next, let's install our dependencies:

```
pnpm add -D typescript @types/node
```

This will add `typescript` and `@types/node` to our `package.json`.

This will also create a `pnpm-lock.yaml`. This file keeps track of the exact versions of our dependencies to make installation faster and more predictable.

### 1.4 TypeScript Config

Add a `tsconfig.json` file at the root of the project with the following configuration:

```json
{
  "compilerOptions": {
    /* Base Options: */
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "es2022",
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    /* Strictness */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    /* If transpiling with TypeScript: */
    "moduleResolution": "NodeNext",
    "module": "NodeNext",
    "outDir": "dist",
    "sourceMap": true,
    /* If your code doesn't run in the DOM: */
    "lib": ["es2022"]
  }
}
```

This configuration is drawn from Total TypeScript's [TSConfig Cheat Sheet](/tsconfig-cheat-sheet).

One important option to note is `moduleResolution`: this ensures that TypeScript uses the same module resolution as Node.js. If you're not used to it, this might be surprising - as you need to [add `.js` extensions to your imports](https://www.totaltypescript.com/relative-import-paths-need-explicit-file-extensions-in-ecmascript-imports). But using it massively improves the startup time of your Node app, which is very important for lambdas.

### 1.5 `.gitignore`

Add a `.gitignore` file with the following content:

```
node_modules
dist
```

`node_modules` contains all of the files we get from `npm`. `dist` contains all of the files we get from `esbuild`.

### 1.6 `src` folder

Create a `src` folder at the root of the project.

Inside the `src` folder, create an `index.ts` file with the following content:

```ts
console.log("Hello, world!");
```

## 2. Adding Our Scripts

### 2.1 `build` script

Add a `build` script to `package.json`:

```json
{
  // ...other properties
  "scripts": {
    "build": "tsc"
  }
  // ...other properties
}
```

This script bundles our code using `esbuild`.

Try changing `console.log` to `console.lg` in `src/index.ts`. Then run `pnpm build` - it will report the incorrect code. It'll also output a `.js` file in the `dist` folder.

### 2.2 `start` script

Add a `start` script to `package.json`:

```json
{
  // ...other properties
  "scripts": {
    "start": "node dist/index.js"
  }
  // ...other properties
}
```

This script runs our bundled code using Node.js.

Try running `pnpm build && pnpm start`. This will build our code and then run it.

You should see `Hello, world!` printed to the console.

### 2.3 `dev` script

The `dev` script will be the most complex. When we run it, we want to do several things at once:

- `tsc --watch` to bundle our TypeScript code and check for errors.
- `node --watch` to re-run our application when it changes.

For each of these, we will add a separate `npm` script, then run them all simultaneously using `npm-run-all`.

#### 2.3.1 `tsc --watch`

Add a `dev:tsc` script to our `package.json`:

```json
{
  // ...other properties
  "scripts": {
    "dev:tsc": "tsc --watch --preserveWatchOutput"
  }
  // ...other properties
}
```

The `--watch` flag tells TypeScript to re-run when the code changes.

The `--preserveWatchOutput` flag tells TypeScript not to clear the console output when it re-runs.

#### 2.3.2 `node --watch`

Add a `dev:node` script to our `package.json`:

```json
{
  // ...other properties
  "scripts": {
    "dev:node": "node --watch dist/index.js"
  }
  // ...other properties
}
```

#### 2.3.3 `dev` script

Add a `dev` script to our `package.json`:

```json
{
  // ...other properties
  "scripts": {
    "dev": "pnpm run \"/dev:/\""
  }
  // ...other properties
}
```

This script runs all the scripts that start with `dev:` in parallel.

Try it out by running `pnpm dev`. You will see that type checking, bundling, and execution all happen simultaneously.

## 3. Final Thoughts

Congratulations! You now have a fully functional TypeScript and Node setup.

This setup can handle any Node.js code you throw at it, from `express` servers to Lambdas.

If you have any questions, ping me in my [Discord server](https://totaltypescript.com/discord) and I'll let you know how to fix it.
