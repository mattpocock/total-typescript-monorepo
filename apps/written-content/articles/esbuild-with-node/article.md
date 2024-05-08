ESBuild is an extremely popular, extremely fast bundler. It's used by frameworks like Vite to bundle frontend code, but it can also be used to bundle Node.js code.

In this article, we'll learn how to use ESBuild to bundle a Node.js app.

We'll be using:

- [ESBuild](https://esbuild.github.io/) for bundling.
- [pnpm](https://pnpm.io/) for package management.
- [Node.js](https://nodejs.org/en/) for running our code.
- [TypeScript](https://www.typescriptlang.org/) for type safety.
- [ES Modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) as our module system.
- [npm-run-all](https://www.npmjs.com/package/npm-run-all) for running multiple scripts at once.

## 0. Understanding the Tools

To make our Node app ready for production, we will need a few things:

- A `lint` script to ensure type safety in our code.
- A `dev` script to run our code locally and check for TypeScript errors.
- A `build` script to bundle our code for production.
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
pnpm add -D typescript esbuild @types/node npm-run-all
```

This will add `typescript`, `esbuild`, `@types/node`, and `npm-run-all` to our `package.json`.

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
    "verbatimModuleSyntax": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    /* Strictness */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    /* If NOT transpiling with TypeScript: */
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "noEmit": true,
    /* If your code doesn't run in the DOM: */
    "lib": ["es2022"]
  }
}
```

This configuration is drawn from Total TypeScript's [TSConfig Cheat Sheet](/tsconfig-cheat-sheet).

### 1.5 `.gitignore`

Add a `.gitignore` file with the following content:

```
node_modules
dist
```

`node_modules` contains all of the files we get from `npm`. `dist` contains all of the files we get from `esbuild`.

### 1.5 `src` folder

Create a `src` folder at the root of the project.

Inside the `src` folder, create an `index.ts` file with the following content:

```ts
console.log("Hello, world!");
```

## 2. Adding Our Scripts

### 2.1 `lint` script

Add a `lint` script to `package.json`:

```json
{
  // ...other properties
  "scripts": {
    "lint": "tsc"
  }
  // ...other properties
}
```

Try running this with `pnpm lint`. This will run TypeScript on your code, but it will not output any `.js` files.

Here, we are treating TypeScript as a linter to check the correctness of our code.

Try changing `console.log` to `console.lg` in `src/index.ts`. Then run `pnpm lint` again - it will report the incorrect code.

### 2.2 `build` script

Add a `build` script to `package.json`:

```json
{
  // ...other properties
  "scripts": {
    "build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --format=esm"
  }
  // ...other properties
}
```

This script bundles our code using `esbuild`.

`--bundle` indicates that it should output only one file containing our entire bundle.

`--platform=node` indicates that it should bundle for Node.js.

`--outfile=dist/index.js` indicates that it should output the bundle to `dist/index.js`.

`--format=esm` indicates that it should use ES Modules for imports and exports.

Try running this with `pnpm build`. This will output a `dist/index.js` file.

### 2.3 `start` script

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

- `tsc --watch` to check for TypeScript errors.
- `node --watch` to re-run our application when it changes.
- `esbuild --watch` to re-bundle our application when it changes.

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

#### 2.3.3 `esbuild --watch`

Add a `dev:esbuild` script to our `package.json`:

```json
{
  // ...other properties
  "scripts": {
    "dev:esbuild": "pnpm run build --watch"
  }
  // ...other properties
}
```

#### 2.3.4 `dev` script

Add a `dev` script to our `package.json`:

```json
{
  // ...other properties
  "scripts": {
    "dev": "run-p dev:*"
  }
  // ...other properties
}
```

This script runs all the scripts that start with `dev:` in parallel.

Try it out by running `pnpm dev`. You will see that type checking, bundling, and execution all happen simultaneously.

## 3. Final Thoughts

Congratulations! You now have a fully functional ESBuild/Node setup.

This setup can handle any Node.js code you throw at it, from `express` servers to Lambdas.

If you want to see a fully working example, check out [this repository](https://github.com/mattpocock/esbuild-node).
