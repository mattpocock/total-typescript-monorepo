# API Reference

## `upgrade`

- Run inside the root folder of a repo

1. Takes a snapshot to `./snap.md`
1. Upgrades `typescript`, `vitest`, and `@total-typescript/exercise-cli` to the latest version
1. Takes another snapshot
1. Compares the previous snapshot to the new snapshot
1. If there are differences, it stages the new snapshot to commit to allow you to compare them in VSCode.
