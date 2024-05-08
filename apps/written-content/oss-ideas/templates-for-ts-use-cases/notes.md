Proper tsconfigs and package.json setups for things like:

- Node apps
- Publishing packages

The idea is to use the fewest dependencies as possible.

Perhaps could also be installed by a CLI, like shadcn/ui.

Focus on:

- Beautiful CLI
- As few dependencies as possible
- Priority on the esbuild set of packages, like tsx, tsup, vitest etc.
- Automatic installation
- Rely on a small set of npm scripts: `dev`, `build`, `ci`, `lint`
- If migrating isn't possible, print out a markdown file with exact instructions (and commands) for how to perform the action manually.
- Should work with npm, yarn or pnpm

Setups:

Node app

- Add testing
- Add new test
- Strictness (noUncheckedIndexedAccess)
- Add bin & CLI
- Add GitHub Action
- Add Turborepo

Package

- Need to find a solution to ESM/CJS/exports
- Playground
- Add new entrypoint
- Add React
- Add testing (Vitest)
- Add new test
- Add demo app (Vite)
- Add GitHub Action
