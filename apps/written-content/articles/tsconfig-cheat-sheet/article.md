`tsconfig.json` scares everyone. It's a huge file with a TON of potential options.

But really, there are only a few configuration options you need to care about. Let's figure them out, and cheatsheet them.

## The Package

This article is so popular that I've bundled its recommendations into a library! It's called `@total-typescript/tsconfig`, and you can check it out [here](https://github.com/total-typescript/tsconfig).

## Quickstart

Want just the code? Here you go:

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
    "sourceMap": true,

    /* AND if you're building for a library: */
    "declaration": true,

    /* AND if you're building for a library in a monorepo: */
    "composite": true,
    "declarationMap": true,

    /* If NOT transpiling with TypeScript: */
    "module": "preserve",
    "noEmit": true,

    /* If your code runs in the DOM: */
    "lib": ["es2022", "dom", "dom.iterable"],

    /* If your code doesn't run in the DOM: */
    "lib": ["es2022"]
  }
}
```

## Full Explanation

### Base Options

Here are the base options I recommend for all projects.

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "es2022",
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

- [`esModuleInterop`](https://www.typescriptlang.org/tsconfig#esModuleInterop): Helps mend a few of the fences between CommonJS and ES Modules.
- [`skipLibCheck`](https://www.typescriptlang.org/tsconfig#skipLibCheck): Skips checking the types of `.d.ts` files. This is important for performance, because otherwise all `node_modules` will be checked.
- [`target`](https://www.typescriptlang.org/tsconfig#target): The version of JavaScript you're targeting. I recommend `es2022` over `esnext` for stability.
- [`allowJs`](https://www.typescriptlang.org/tsconfig#allowJs) and [`resolveJsonModule`](https://www.typescriptlang.org/tsconfig#resolveJsonModule): Allows you to import `.js` and `.json` files. Always useful.
- [`moduleDetection`](https://www.typescriptlang.org/tsconfig#moduleDetection): This option forces TypeScript to consider all files as modules. This helps to avoid '[cannot redeclare block-scoped variable](https://www.totaltypescript.com/cannot-redeclare-block-scoped-variable)' errors.
- [`isolatedModules`](https://www.typescriptlang.org/tsconfig#isolatedModules): This option prevents a few TS features which are unsafe when treating modules as isolated files.
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax): This option forces you to use `import type` and `export type`, leading to more predictable behavior and fewer unnecessary imports. With `module: NodeNext`, it also enforces you're using the correct import syntax for ESM or CJS.

### Strictness

Here are the strictness options I recommend for all projects.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

- [`strict`](https://www.typescriptlang.org/tsconfig#strict): Enables all strict type checking options. Indispensable.
- [`noUncheckedIndexedAccess`](https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess): Prevents you from accessing an array or object without first checking if it's defined. This is a great way to prevent runtime errors, and should _really_ be included in `strict`.
- [`noImplicitOverride`](https://www.typescriptlang.org/tsconfig#noImplicitOverride): Makes the `override` keyword actually useful in classes.

Many folks recommended the strictness options in [`tsconfig/bases`](https://github.com/tsconfig/bases/blob/031273b815ff7f672c7c9057fb7d19ef363054b1/bases/strictest.json), a wonderful repo which catalogs TSConfig options. These options include lots of rules which I consider too 'noisy', like [`noImplicitReturns`](https://www.typescriptlang.org/tsconfig#noImplicitReturns), [`noUnusedLocals`](https://www.typescriptlang.org/tsconfig#noUnusedLocals), [`noUnusedParameters`](https://www.typescriptlang.org/tsconfig#noUnusedParameters), and [`noFallthroughCasesInSwitch`](https://www.typescriptlang.org/tsconfig#noFallthroughCasesInSwitch). I recommend you add these rules to your `tsconfig.json` only if you want them.

### Transpiling with TypeScript

If you're transpiling your code (creating JavaScript files) with `tsc`, you'll want these options.

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "outDir": "dist"
  }
}
```

- [`module`](https://www.typescriptlang.org/tsconfig#module): Tells TypeScript what module syntax to use. `NodeNext` is the best option for Node. [`moduleResolution: NodeNext`](https://www.typescriptlang.org/tsconfig#moduleResolution) is implied from this option.
- [`outDir`](https://www.typescriptlang.org/tsconfig#outDir): Tells TypeScript where to put the compiled JavaScript files. `dist` is my preferred convention, but it's up to you.

#### Building for a Library

If you're building for a library, you'll want `declaration: true`.

```json
{
  "compilerOptions": {
    "declaration": true
  }
}
```

- [`declaration`](https://www.typescriptlang.org/tsconfig#declaration): Tells TypeScript to emit `.d.ts` files. This is needed so that libraries can get autocomplete on the `.js` files you're creating.

#### Building for a Library in a Monorepo

If you're building for a library in a monorepo, you'll also want these options.

```json
{
  "compilerOptions": {
    "declaration": true,
    "composite": true,
    "sourceMap": true,
    "declarationMap": true
  }
}
```

- [`composite`](https://www.typescriptlang.org/tsconfig#composite): Tells TypeScript to emit `.tsbuildinfo` files. This tells TypeScript that your project is part of a monorepo, and also helps it to cache builds to run faster.
- [`sourceMap`](https://www.typescriptlang.org/tsconfig#sourceMap) and [`declarationMap`](https://www.typescriptlang.org/tsconfig#declarationMap): Tells TypeScript to emit source maps and declaration maps. These are needed so that when consumers of your libraries are debugging, they can jump to the original source code using go-to-definition.

### Not Transpiling with TypeScript

If you're _not_ transpiling your code with `tsc`, i.e. using TypeScript as more of a linter, you'll want these options.

```json
{
  "compilerOptions": {
    "module": "preserve",
    "noEmit": true
  }
}
```

- [`module`](https://www.typescriptlang.org/tsconfig#module): `preserve` is the best option because it most closely mimics how bundlers treat modules. [`moduleResolution: Bundler`](https://www.typescriptlang.org/tsconfig#moduleResolution) is implied from this option.
- [`noEmit`](https://www.typescriptlang.org/tsconfig#noEmit): Tells TypeScript not to emit any files. This is important when you're using a bundler so you don't emit useless `.js` files.

### Running in the DOM

If your code runs in the DOM, you'll want these options.

```json
{
  "compilerOptions": {
    "lib": ["es2022", "dom", "dom.iterable"]
  }
}
```

- [`lib`](https://www.typescriptlang.org/tsconfig#lib): Tells TypeScript what built-in types to include. `es2022` is the best option for stability. `dom` and `dom.iterable` give you types for `window`, `document` etc.

### Not Running in the DOM

If your code _doesn't_ run in the DOM, you'll want `lib: ["es2022"]`.

```json
{
  "compilerOptions": {
    "lib": ["es2022"]
  }
}
```

These are the same as above, but without the `dom` and `dom.iterable` typings.

## Changelog

I've been updating this cheatsheet as TypeScript evolves, and as I refine my view of what belongs in a reusable `tsconfig.json`. Here's the changelog:

- **2024-04-23**: Added `verbatimModuleSyntax` to the base options. With the introduction of `module: Preserve`, `verbatimModuleSyntax` is much more useful. Many applications do 'fake ESM', where they write imports and exports but transpile to CommonJS. Next.js is a common example. Before `module: Preserve`, `verbatimModuleSyntax` would error on every single import or export statement because it was expecting a module. With `module: Preserve`, its scope is narrowed making sure `import/export type` is used correctly.
- **2024-04-23**: Added `noImplicitOverride` to the strictness options. Never knew about this option, or the `override` keyword, until I discovered it while researching my book. `noImplicitOverride` is a very small improvement at no cost, so why not?

## What Did I Miss?

Hopefully, I've given you a bit of inspiration for the next time you need to configure TypeScript.

Did I miss anything? Let me know:

<FeedbackFormButton />
