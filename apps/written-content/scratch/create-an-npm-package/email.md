I just wrote a [massive guide to creating and publishing a package on npm](https://www.totaltypescript.com/how-to-create-an-npm-package).

It goes from an empty directory to a production-ready setup.

Here are the important bits:

## Basic Fields

Here are the basic fields you need in your package.json.

They get parsed by npm, and get displayed on the site. If you miss one of these, someone is bound to complain.

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
  "author": {
    "name": "Matt Pocock",
    "email": "team@totaltypescript.com",
    "url": "https://totaltypescript.com"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/mattpocock/tt-package-demo.git"
  }
}
```

## Choosing A License

choosealicense.com is a great spot for picking a license for your package. Most times, MIT will do fine. But there are plenty of good options:

https://choosealicense.com/licenses/

## `files` vs `.npmignore`

You'll want a `files` field in your package.json. This tells npm which files to include in your package. Things like `README.md` are included by default, but you'll need to add your built files.

This is like `.npmignore`, but better.

```json
{
  "files": ["dist"]
}
```

The reason it's better than `.npmignore`? Your built outputs change much less frequently than your source files.

In my experience, when you use `files` you end up with much fewer accidental inclusions, which can bloat the install size of your package.

## Transpiling with `tsc`

I strongly recommend using `tsc` as your transpiler. It's fast, has very low setup cost, and makes your CI process much simpler.

If you go this route, this is the tsconfig you'll want:

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
    "declaration": true
  }
}
```

I also strongly recommend you only ship ESM files - not CJS. They make your build process simpler and allow for easier debugging by your consumers.

For Node apps that run CJS, they can now use --experimental-require-module to load your ESM files.

To set this up, use "type": "module" in your package.json.

```json
{
  "type": "module"
}
```

## Dual Publishing

If you do want to dual publish to help support CJS users, tsup is the way to go.

You can add a `tsup.config.ts` file, and make your build process as simple as running `tsup`:

```ts twoslash
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist",
  clean: true,
});
```

```json
{
  "scripts": {
    "build": "tsup"
  }
}
```

This will create a `dist/index.js` (for ESM) and a `dist/index.cjs` (for CJS). But how do you tell your consumers which one to use?

The `exports` field comes into its own here. It lets you point to the right file for the right environment.

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

Crucially, `tsup` also creates declaration files for each of your outputs.

index.js -> index.d.ts
index.cjs -> index.d.cts

This means you don't need to specify `types` in your package.json. TypeScript can automatically find the declaration file it needs.

## `@arethetypeswrong/cli`

`@arethetypeswrong/cli` is a MUST include. It checks that these package exports are correct.

Add this script to your package.json.

You'll get this beautiful output, showing which versions of Node (and which bundlers) can resolve your package.

```json
{
  "scripts": {
    "check-exports": "attw --pack ."
  },
  "devDependencies": {
    "@arethetypeswrong/cli": "^0.15.4"
  }
}
```

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

## Prettier Checking

Surprisingly few packages have prettier checking as part of their CI. It's a great way to make sure that the codebase is ALWAYS formatted properly:

```json
{
  "scripts": {
    "prettier": "prettier --check ."
  },
  "devDependencies": {
    "prettier": "^3.3.3"
  }
}
```

If you liked these tips, there is EVEN MORE in the [full guide](https://www.totaltypescript.com/how-to-create-an-npm-package).

It covers setting up CI with GitHub actions, releases with changesets, and testing with vitest.

What questions do you have about creating and publishing an npm package? What could I add to the guide to make it more helpful?
