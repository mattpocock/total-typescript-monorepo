# CLAUDE.md

Matt Pocock's Total TypeScript monorepo - a workspace for creating TypeScript educational content, from video production to written content management.

## Commands

```bash
pnpm run build    # Build all packages and apps
pnpm run ci       # Full CI pipeline: build, test, lint
pnpm cli --help   # Video production CLI
```

When checking types, always run `pnpm run build` on the entire monorepo.

## Documentation

- **Effect-TS patterns**: `.claude/skills/effect-ts/SKILL.md`
- **Video workflow**: `docs/video-workflow.md`
- **Environment variables**: `.env.example`
- **DaVinci Resolve scripts**: `packages/resolve-scripts/README.md`

All environment variables must be defined in the root `.env` file.
