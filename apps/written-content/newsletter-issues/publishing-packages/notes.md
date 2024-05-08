# Interviews

Mateusz Burzyński
Phry/Mark Eriksen
Anthony Fu
Artem?

# Basics

- Why would I publish a package to `npm`?

- What's the difference between a scoped package and a non-scoped package?

- What do I need to publish to `npm`?

- What is Matt's recommended setup for publishing packages?

Make a repo and article.

- Should you use `pnpm`, `npm` or `yarn`?

- What's the difference between `devDependencies`, `peerDependencies`, and `dependencies`?

## Useful Libraries

- 🦋 **[Changesets](https://github.com/changesets/changesets)** is a must-have. It automates changelogs and releases. It comes in several parts:

  - A [**CLI**](https://github.com/changesets/changesets/blob/main/packages/cli/README.md) for adding changesets, little `.md` files which indicate what changed in a package, and whether it was a patch, minor, or major change.
  - A [**GitHub Bot**](https://github.com/changesets/bot) for reminding folks to add changesets to their PR's.
  - A [**GitHub Action**](https://github.com/changesets/action) that lets you publish to `npm` by merging a PR.
  - Works great in a monorepo, or for single packages.
  - Read the [intro](https://github.com/changesets/changesets/blob/main/packages/cli/README.md) to get started.

- **[`tsup`](https://github.com/egoist/tsup)** can build your code for you. It can dual publish `esm` and `cjs`. It uses `esbuild` under the hood, so it's fast. An alternative is [**`tshy`**](https://github.com/isaacs/tshy), which uses `tsc` under the hood.

- **[`release-it`](https://github.com/release-it/release-it)**

- What libraries are no longer useful?

tsdx

- How should I document my packages?

- Which license should I use?

- How should I test my package?

# Intermediate

- How does the `exports` field work?

- Why do I always need to include `./package.json`?

- How do I handle multiple entrypoints?

- Should you publish with moduleResolution: 'NodeNext'?

- Do you need to dual publish to support both ESM and CommonJS?

- What is dual package hazard?

- How do you publish packages within a monorepo?

Dive into XState's publishing setup.

- How do you publish private packages?

- How do you take advantage of GitHub?
- Actions
- Discussions
- Code of Conduct
-

- Should you ship your `src` folder and do declaration maps?

# Wizard

- What is `peerDependenciesMeta`?

- What is `typesVersions`? How do you handle different TS versions?

- How do you publish a package for RSC?

- How do I debug when a package is going wrong?

- Should I care about `jsr`?

- https://jsr.io/
