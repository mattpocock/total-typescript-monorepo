# 3 Ways To Build A TypeScript Monorepo

## Project References

A root tsconfig.json with:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/package-a" },
    { "path": "./packages/package-b" }
  ]
}
```

Then, each package has its own `tsconfig.json`.

Run `tsc -b` to build all packages, and `tsc -b --watch` to run in dev mode.

### Pro's

- Each package's `tsconfig.json` can have different settings
- A single command can build _and_ typecheck all packages
- The code in the each package's `dist` is exactly the same as what gets sent to production - always a good thing

### Con's

- Need to run a command (`npm run build` or `npm run dev`) in order to get the types working in the repo
- Need to duplicate the project structure inside the root `tsconfig.json`
- Need to make sure that packages are correctly ordered inside `references` in the root `tsconfig.json`
- TypeScript's caching via `.tsbuildinfo` files can be relatively inconsistent - for instance, updating a dependency doesn't bust the cache.

## `paths`

A single `tsconfig.json` in the root with:

```json
{
  "compilerOptions": {
    // ... your compiler options
    "paths": {
      "@myorg/package-a": [
        "packages/package-a/src/index.ts"
      ],
      "@myorg/package-b": [
        "packages/package-b/src/index.ts"
      ]
    }
  }
}
```

### Pro's

- No need for individual `tsconfig.json` files in each repository
- Types work automatically in the repo, without needing a build step
- Building each package can be handled by a faster tool than `tsc`, like `esbuild`
- Can still run a single command to typecheck the repo

### Con's

- Still need to duplicate the project structure inside the root `tsconfig.json` - but `paths` instead of `references`
- Each project MUST have the same `tsconfig.json` settings
- Module resolution isn't linked to the `package.json` any more, so it's possible to make mistakes with `exports`/`main` etc
- Need to configure a build script in each package, and co-ordinate it in the root `package.json`
- Each package can always import from every other package, regardless of whether they have a dependency on it or not (this will be uncovered via unit tests, though)

## Turborepo And `tsc`

No root `tsconfig.json`, only individual `tsconfig.json` files in each package.

Each package has a `build` script in its `package.json`:

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

### Pro's

- Each package's `tsconfig.json` can have different settings
- Very reliable caching of outputs (more reliable than `.tsbuildinfo` files)
- No need to duplicate project structure in the root `tsconfig.json`
- The code in the each package's `dist` is exactly the same as what gets sent to production - always a good thing

### Con's

- Multiple instances of `tsc` at once means it's hard to get an overall picture of whether your app is broken
- Some packages will have separate `build` and `lint` scripts (for instance, a frontend framework will never use `tsc` to build)
- TBC
