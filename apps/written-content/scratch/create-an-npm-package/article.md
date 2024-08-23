In this guide, we'll go through every single step you need to take to publish a package to npm.

This is not a minimal guide. We'll be setting up a fully production-ready package from an empty directory. This will include:

- [Git](https://git-scm.com/) for version control
- [TypeScript](https://www.typescriptlang.org/) for writing our code and keeping it type-safe
- [Prettier](https://prettier.io/) for formatting our code
- [@arethetypeswrong/cli](https://arethetypeswrong.github.io/) for checking our exports
- [tsup](https://tsup.egoist.sh/) for compiling our TypeScript code into CJS and ESM
- [Vitest](https://vitest.js.org/) for running our tests
- [GitHub Actions](https://docs.github.com/en/actions) for running our CI process
- [Changesets](https://github.com/changesets/changesets) for versioning and publishing our package

If you want to see the finished product, check out this [demo repo](https://github.com/mattpocock/tt-package-demo).

With that, let's get started!

## 1. Git

In this section, we'll create a new git repository, set up a `.gitignore`, create an initial commit, create a new repository on GitHub, and push our code to GitHub.

### 1.1: Initialize the repo

Run the following command to initialize a new git repository:

```bash
git init
```

### 1.2: Set up a `.gitignore`

Create a `.gitignore` file in the root of your project and add the following:

```bash
node_modules
```

### 1.3: Create an initial commit

Run the following command to create an initial commit:

```bash
git add .
git commit -m "Initial commit"
```

### 1.4: Create a new repository on GitHub

Using the [GitHub CLI](https://cli.github.com/), run the following command to create a new repository. I've chosen the name `tt-package-demo` for this example:

```bash
gh repo create tt-package-demo --source=. --public
```

### 1.5: Push to GitHub

Run the following command to push your code to GitHub:

```bash
git push --set-upstream origin main
```

## 2: `package.json`

In this section, we'll create a `package.json` file, add a `license` field, create a `LICENSE` file, and add a `README.md` file.

### 2.1: Create a `package.json` file

Create a `package.json` file with these values:

```json
{
  "name": "tt-package-demo",
  "version": "0.0.1",
  "description": "A demo package for Total TypeScript",
  "keywords": ["demo", "typescript"],
  "homepage": "https://github.com/mattpocock/tt-package-demo",
  "bugs": {
    "url": "https://github.com/mattpocock/tt-package-demo/issues"
  },
  "author": "Matt Pocock <team@totaltypescript.com> (https://totaltypescript.com)",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/mattpocock/tt-package-demo.git"
  },
  "files": ["dist"],
  "type": "module"
}
```

- `name` is the name by which people will install your package. It must be unique on npm. You can create [organization scopes](https://docs.npmjs.com/about-organization-scopes-and-packages) (such as `@total-typescript/demo`) for free, these can help make it unique.
- `version` is the version of your package. It should follow [semantic versioning](https://semver.org/): the `0.0.1` format. Each time you publish a new version, you should increment this number.
- `description` and `keywords` are short descriptions of your package. They're listed in searches in the npm registry.
- `homepage` is the URL of your package's homepage. The GitHub repo is a good default, or a docs site if you have one.
- `bugs` is the URL where people can report issues with your package.
- `author` is you! You can add optionally add your email and website. If you have multiple contributors, you can specify them as an array of `contributors` with the same formatting.
- `repository` is the URL of your package's repository. This creates a link on the npm registry to your GitHub repo.
- `files` is an array of files that should be included when people install your package. In this case, we're including the `dist` folder. `README.md`, `package.json` and `LICENSE` are included by default.
- `type` is set to `module` to indicate that your package uses ECMAScript modules, not CommonJS modules.

### 2.2: Add the `license` field

Add a `license` field to your `package.json`. Choose a license [here](https://choosealicense.com/licenses/). I've chosen [MIT](https://choosealicense.com/licenses/mit/).

```json
{
  "license": "MIT"
}
```

### 2.3: Add a `LICENSE` file

Create a file called `LICENSE` (no extension) containing the text of your license. For MIT, this is:

```txt
MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Change the `[year]` and `[fullname]` placeholders to the current year and your name.

### 2.4: Add a `README.md` file

Create a `README.md` file with a description of your package. Here's an example:

```md
# tt-package-demo

A demo package for Total TypeScript.
```

This will be shown on the npm registry when people view your package.

## 3: TypeScript

In this section, we'll install TypeScript, set up a `tsconfig.json`, create a source file, create an index file, set up a `build` script, run our build, add `dist` to `.gitignore`, set up a `ci` script, and configure our `tsconfig.json` for the DOM.

### 3.1: Install TypeScript

Run the following command to install TypeScript:

```bash
npm install --save-dev typescript
```

We add `--save-dev` to install TypeScript as a development dependency. This means it won't be included when people install your package.

### 3.2: Set up a `tsconfig.json`

Create a `tsconfig.json` with the following values:

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
    "verbatimModuleSyntax": true,

    /* Strictness */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    /* If transpiling with TypeScript: */
    "module": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,

    /* AND if you're building for a library: */
    "declaration": true,

    /* AND if you're building for a library in a monorepo: */
    "declarationMap": true
  }
}
```

These options are explained in detail in my [TSConfig Cheat Sheet](https://www.totaltypescript.com/tsconfig-cheat-sheet).

### 3.3: Configure your `tsconfig.json` for the DOM

If your code runs in the DOM (i.e. requires access to `document`, `window`, or `localStorage` etc), skip this step.

If your code doesn't require access to DOM API's, add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ...other options
    "lib": ["es2022"]
  }
}
```

This prevents the DOM typings from being available in your code.

If you're not sure, skip this step.

### 3.4: Create A Source File

Create a `src/utils.ts` file with the following content:

```ts
export const add = (a: number, b: number) => a + b;
```

### 3.5: Create An Index File

Create a `src/index.ts` file with the following content:

```ts
export * from "./utils.js";
```

The `.js` extension will look odd. [This article](https://www.totaltypescript.com/relative-import-paths-need-explicit-file-extensions-in-ecmascript-imports) explains more.

### 3.6: Set up a `build` script

Add a `scripts` object to your `package.json` with the following content:

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

This will compile your TypeScript code to JavaScript.

### 3.7: Running Your Build

Run the following command to compile your TypeScript code:

```bash
npm run build
```

This will create a `dist` folder with your compiled JavaScript code.

### 3.8: Add `dist` to `.gitignore`

Add the `dist` folder to your `.gitignore` file:

```bash
dist
```

This will prevent your compiled code from being included in your git repository.

### 3.9: Set up a `ci` script

Add a `ci` script to your `package.json` with the following content:

```json
{
  "scripts": {
    "ci": "npm run build"
  }
}
```

This gives us a quick shortcut for running all required operations on CI.

## 4: Prettier

In this section, we'll install Prettier, set up a `.prettierrc`, set up a `format` script, run the `format` script, set up a `check-format` script, add the `check-format` script to our `CI` script, and run the `CI` script.

Prettier is a code formatter that automatically formats your code to a consistent style. This makes your code easier to read and maintain.

### 4.1: Install Prettier

Run the following command to install Prettier:

```bash
npm install --save-dev prettier
```

### 4.2: Set up a `.prettierrc`

Create a `.prettierrc` file with the following content:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2
}
```

You can add more options to this file to customize Prettier's behavior. You can find a full list of options [here](https://prettier.io/docs/en/options.html).

### 4.3: Set up a `format` script

Add a `format` script to your `package.json` with the following content:

```json
{
  "scripts": {
    "format": "prettier --write ."
  }
}
```

This will format all files in your project using Prettier.

### 4.4: Run the `format` script

Run the following command to format all files in your project:

```bash
npm run format
```

You might notice some files change. Commit them with:

```bash
git add .
git commit -m "Format code with Prettier"
```

### 4.5: Set up a `check-format` script

Add a `check-format` script to your `package.json` with the following content:

```json
{
  "scripts": {
    "check-format": "prettier --check ."
  }
}
```

This will check if all files in your project are formatted correctly.

### 4.6: Adding to our `CI` script

Add the `check-format` script to your `ci` script in your `package.json`:

```json
{
  "scripts": {
    "ci": "npm run build && npm run check-format"
  }
}
```

This will run the `check-format` script as part of your CI process.

## 5: `exports`, `main` and `@arethetypeswrong/cli`

In this section, we'll install `@arethetypeswrong/cli`, set up a `check-exports` script, run the `check-exports` script, set up a `main` field, run the `check-exports` script again, set up a `ci` script, and run the `ci` script.

`@arethetypeswrong/cli` is a tool that checks if your package exports are correct. This is important because these are easy to get wrong, and can cause issues for people using your package.

### 5.1: Install `@arethetypeswrong/cli`

Run the following command to install `@arethetypeswrong/cli`:

```bash
npm install --save-dev @arethetypeswrong/cli
```

### 5.2: Set up a `check-exports` script

Add a `check-exports` script to your `package.json` with the following content:

```json
{
  "scripts": {
    "check-exports": "attw --pack ."
  }
}
```

This will check if all exports from your package are correct.

### 5.3: Run the `check-exports` script

Run the following command to check if all exports from your package are correct:

```bash
npm run check-exports
```

You should notice various errors:

```txt
┌───────────────────┬──────────────────────┐
│                   │ "tt-package-demo"    │
├───────────────────┼──────────────────────┤
│ node10            │ 💀 Resolution failed │
├───────────────────┼──────────────────────┤
│ node16 (from CJS) │ 💀 Resolution failed │
├───────────────────┼──────────────────────┤
│ node16 (from ESM) │ 💀 Resolution failed │
├───────────────────┼──────────────────────┤
│ bundler           │ 💀 Resolution failed │
└───────────────────┴──────────────────────┘
```

This indicates that no version of Node, or any bundler, can use our package.

Let's fix this.

### 5.4: Setting `main`

Add a `main` field to your `package.json` with the following content:

```json
{
  "main": "dist/index.js"
}
```

This tells Node where to find the entry point of your package.

### 5.5: Try `check-exports` again

Run the following command to check if all exports from your package are correct:

```bash
npm run check-exports
```

You should notice only one warning:

```txt
┌───────────────────┬──────────────────────────────┐
│                   │ "tt-package-demo"            │
├───────────────────┼──────────────────────────────┤
│ node10            │ 🟢                           │
├───────────────────┼──────────────────────────────┤
│ node16 (from CJS) │ ⚠️ ESM (dynamic import only) │
├───────────────────┼──────────────────────────────┤
│ node16 (from ESM) │ 🟢 (ESM)                     │
├───────────────────┼──────────────────────────────┤
│ bundler           │ 🟢                           │
└───────────────────┴──────────────────────────────┘
```

This is telling us that our package is compatible with systems running ESM. People using CJS (often in legacy systems) will need to import it using a dynamic import.

We can choose to fix this later if we wish.

### 5.6: Adding to our `CI` script

Add the `check-exports` script to your `ci` script in your `package.json`:

```json
{
  "scripts": {
    "ci": "npm run build && npm run check-format && npm run check-exports"
  }
}
```

## 6: Using `tsup` to Dual Publish

If you want to publish both CJS and ESM code, you can use `tsup`. This is a tool built on top of `esbuild` that compiles your TypeScript code into both formats.

My personal recommendation would be to skip this step, and only ship ES Modules. This makes your setup significantly simpler, and avoids many of the pitfalls of dual publishing, like [Dual Package Hazard](https://github.com/GeoffreyBooth/dual-package-hazard).

But if you want to, go ahead.

### 6.1: Install `tsup`

Run the following command to install `tsup`:

```bash
npm install --save-dev tsup
```

### 6.2: Create a `tsup.config.ts` file

Create a `tsup.config.ts` file with the following content:

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist",
  clean: true,
});
```

- `entryPoints` is an array of entry points for your package. In this case, we're using `src/index.ts`.
- `format` is an array of formats to output. We're using `cjs` (CommonJS) and `esm` (ECMAScript modules).
- `dts` is a boolean that tells `tsup` to generate declaration files.
- `outDir` is the output directory for the compiled code.
- `clean` tells `tsup` to clean the output directory before building.

### 6.3: Change the `build` script

Change the `build` script in your `package.json` to the following:

```json
{
  "scripts": {
    "build": "tsup"
  }
}
```

We'll now be running `tsup` to compile our code instead of `tsc`.

### 6.4: Add an `exports` field

Add an `exports` field to your `package.json` with the following content:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

The `exports` field tells programs consuming your package how to find the CJS and ESM versions of your package. In this case, we're pointing folks using `import` to `dist/index.js` and folks using `require` to `dist/index.cjs`.

### 6.5: Try `check-exports` again

Run the following command to check if all exports from your package are correct:

```bash
npm run check-exports
```

Now, everything is green:

```txt
┌───────────────────┬───────────────────┐
│                   │ "tt-package-demo" │
├───────────────────┼───────────────────┤
│ node10            │ 🟢                │
├───────────────────┼───────────────────┤
│ node16 (from CJS) │ 🟢 (CJS)          │
├───────────────────┼───────────────────┤
│ node16 (from ESM) │ 🟢 (ESM)          │
├───────────────────┼───────────────────┤
│ bundler           │ 🟢                │
└───────────────────┴───────────────────┘
```

### 6.6: Turn TypeScript into a linter

We're no longer running `tsc` to compile our code. And `tsup` doesn't actually check our code for errors - it just turns it into JavaScript.

This means that our `ci` script won't error if we have TypeScript errors in our code. Eek.

Let's fix this.

#### 6.6.1: Add `noEmit` to `tsconfig.json`

Add a `noEmit` field to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ...other options
    "noEmit": true
  }
}
```

#### 6.6.2: Remove unused fields from `tsconfig.json`

Remove the following fields from your `tsconfig.json`:

- `outDir`
- `rootDir`
- `sourceMap`
- `declaration`
- `declarationMap`

They are no longer needed in our new 'linting' setup.

#### 6.6.3: Change `module` to `Preserve`

Optionally, you can now change `module` to `Preserve` in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ...other options
    "module": "Preserve"
  }
}
```

This means you'll no longer need to import your files with `.js` extensions. This means that `index.ts` can look like this instead:

```ts
export * from "./utils";
```

#### 6.6.4: Add a `lint` script

Add a `lint` script to your `package.json` with the following content:

```json
{
  "scripts": {
    "lint": "tsc"
  }
}
```

This will run TypeScript as a linter.

#### 6.6.5: Add `lint` to your `ci` script

Add the `lint` script to your `ci` script in your `package.json`:

```json
{
  "scripts": {
    "ci": "npm run build && npm run check-format && npm run check-exports && npm run lint"
  }
}
```

Now, we'll get TypeScript errors as part of our CI process.

## 7: Testing with Vitest

In this section, we'll install `vitest`, create a test, set up a `test` script, run the `test` script, set up a `dev` script, and add the `test` script to our `CI` script.

`vitest` is a modern test runner for ESM and TypeScript. It's like Jest, but better.

### 7.1: Install `vitest`

Run the following command to install `vitest`:

```bash
npm install --save-dev vitest
```

### 7.2: Create a test

Create a `src/utils.test.ts` file with the following content:

```ts
import { hello } from "./utils.js";
import { test, expect } from "vitest";

test("hello", () => {
  expect(hello("world")).toBe("Hello, world!");
});
```

This is a simple test that checks if the `hello` function returns the correct value.

### 7.3: Set up `test` script

Add a `test` script to your `package.json` with the following content:

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

`vitest run` runs all tests in your project once, without watching.

### 7.4: Run the `test` script

Run the following command to run your tests:

```bash
npm run test
```

You should see the following output:

```txt
 ✓ src/utils.test.ts (1)
   ✓ hello

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

This indicates that your test passed successfully.

### 7.5: Set up `dev` script

A common workflow is to run your tests in watch mode while developing. Add a `dev` script to your `package.json` with the following content:

```json
{
  "scripts": {
    "dev": "vitest"
  }
}
```

This will run your tests in watch mode.

### 7.6: Adding to our `CI` script

Add the `test` script to your `ci` script in your `package.json`:

```json
{
  "scripts": {
    "ci": "npm run build && npm run check-format && npm run check-exports && npm run lint && npm run test"
  }
}
```

## 8. Set up our CI with GitHub Actions

In this section, we'll create a GitHub Actions workflow that runs our CI process on every commit and pull request.

This is a crucial step in ensuring that our package is always in a working state.

### 8.1: Creating our workflow

Create a `.github/workflows/ci.yml` file with the following content:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install

      - name: Run CI
        run: npm run ci
```

This file is what GitHub uses as its instructions for running your CI process.

- `name` is the name of the workflow.
- `on` specifies when the workflow should run. In this case, it runs on pull requests and pushes to the `main` branch.
- `concurrency` prevents multiple instances of the workflow from running at the same time, using `cancel-in-progress` to cancel any existing runs.
- `jobs` is a set of jobs to run. In this case, we have one job called `ci`.
- `actions/checkout@v4` checks out the code from the repository.
- `actions/setup-node@v4` sets up Node.js and npm.
- `npm install` installs the project's dependencies.
- `npm run ci` runs the project's CI script.

If any part of our CI process fails, the workflow will fail and GitHub will let us know by showing a red cross next to our commit.

### 8.2: Testing our workflow

Push your changes to GitHub and check the Actions tab in your repository. You should see your workflow running.

This will give us a warning on every commit made, and every PR made to the repository.

## 9. Publishing with Changesets

In this section, we'll install `@changesets/cli`, initialize Changesets, make changeset releases public, set `commit` to `true`, set up a `local-release` script, add a changeset, commit your changes, run the `local-release` script, and finally see your package on npm.

Changesets is a tool that helps you version and publish your package. It's an incredible tool that I recommend to anyone publishing packages to npm.

### 9.1: Install `@changesets/cli`

Run the following command to initialise Changesets:

```bash
npm install --save-dev @changesets/cli
```

### 9.2: Initialize Changesets

Run the following command to initialize Changesets:

```bash
npx changeset init
```

This will create a `.changeset` folder in your project, containing a `config.json` file. This is also where your changesets will live.

### 9.3: Make changeset releases public

In `.changeset/config.json`, change the `access` field to `public`:

```json
// .changeset/config.json
{
  "access": "public"
}
```

Without changing this field, `changesets` won't publish your package to npm.

### 9.4: Set `commit` to `true`:

In `.changeset/config.json`, change the `commit` field to `true`:

```json
// .changeset/config.json
{
  "commit": true
}
```

This will commit the changeset to your repository after versioning.

### 9.5: Set up a `local-release` script

Add a `local-release` script to your `package.json` with the following content:

```json
{
  "scripts": {
    "local-release": "npm run ci && changeset version && changeset publish"
  }
}
```

This script will run your CI process and then publish your package to npm. This will be the command you run when you want to release a new version of your package from your local machine.

### 9.6: Add a changeset

Run the following command to add a changeset:

```bash
npx changeset
```

This will open an interactive prompt where you can add a changeset. Changesets are a way to group changes together and give them a version number.

Mark this release as a `patch` release, and give it a description like "Initial release".

This will create a new file in the `.changeset` folder with the changeset.

### 9.7: Commit your changes

Commit your changes to your repository:

```bash
git add .
git commit -m "Prepare for initial release"
```

### 9.8: Run the `local-release` script

Run the following command to release your package:

```bash
npm run local-release
```

This will run your CI process, version your package, and publish it to npm.

It will have created a `CHANGELOG.md` file in your repository, detailing the changes in this release. This will be updated each time you release.

### 9.9: See your package on npm

Go to:

```txt
http://npmjs.com/package/<your package name>
```

You should see your package there! You've done it! You've published to npm!

## Summary

You now have a fully set up package. You've set up:

- A TypeScript project with the latest settings
- Prettier, which both formats your code and checks that it's formatted correctly
- `@arethetypeswrong/cli`, which checks that your package exports are correct
- `tsup`, which compiles your TypeScript code to JavaScript
- `vitest`, which runs your tests
- GitHub Actions, which runs your CI process
- Changesets, which versions and publishes your package

For further reading, I'd recommend setting up the [Changesets GitHub action](https://github.com/changesets/action) and [PR bot](https://github.com/changesets/bot) to automatically recommend contributors add changesets to their PR's. They are both phenomenal.

And if you've got any more questions, let me know!

<FeedbackFormButton />
