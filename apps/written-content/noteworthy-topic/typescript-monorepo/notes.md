git init

pnpm init

Change private to true in root package.json

Add pnpm-workspace.yaml

```
packages:
  - "packages/*"
  - "apps/*"
```

Add .gitignore

```
node_modules
```

pnpm add -w typescript

Create packages/shared directory

(cd packages/shared && pnpm init)

Create tsconfig.json inside packages/shared:
