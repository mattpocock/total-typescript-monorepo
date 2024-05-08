## `npx tsm init`

1. Adds `tsm` to the `devDependencies` of the monorepo root
2. Adds `tsm` to the `dev` script of the monorepo root
3. Adds `tsm build` to the `build` script of the monorepo root
4. Runs `*.tsbuildinfo` to the `.gitignore` of the monorepo root

## `tsm`

1. Detects if inside a monorepo package
1. Finds the root of the monorepo
1. Detects if it's a pnpm, yarn or npm monorepo
1. Creates a temporary `tsconfig.json` file with the `paths` set to the monorepo packages
1. Does any required linting on the monorepo packages
1. Runs `tsc -b --watch` with the temporary `tsconfig.json` file

## `tsm (pnpm|yarn|npm) <cmd>`

## `tsm run <cmd>`

## `tsm build`

Same for `tsm` but without the `--watch` flag
