# 3 Ways To Build A TypeScript Monorepo

## Project References

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

## Turborepo And `tsc`

### Pro's

- Just like project references, can
