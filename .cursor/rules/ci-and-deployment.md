# CI and Deployment Guide

## CI Overview

The Total TypeScript Monorepo uses **GitHub Actions** for continuous integration with two primary workflows that handle quality assurance and package publishing.

## CI Workflows

### 1. CI Checks (`.github/workflows/ci.yml`)

**Trigger**: Every push to any branch

**What it does**:
1. **Environment Setup**:
   - Uses Ubuntu latest runner
   - Sets up Node.js 22.x with pnpm cache
   - Installs dependencies with `pnpm install --no-frozen-lockfile`

2. **Runs Full CI Pipeline**:
   - Executes `pnpm run ci` command
   - Sets environment variable: `EXTERNAL_DRIVE_ROOT="/example-root"`

**The `pnpm run ci` command executes**:
```bash
turbo build test lint
```

This runs three critical checks in parallel across all packages:
- **`build`**: Compiles all TypeScript and builds all packages/apps
- **`test`**: Runs the complete Vitest test suite  
- **`lint`**: Runs linting across the entire monorepo

### 2. Publish Workflow (`.github/workflows/publish.yml`)

**Trigger**: Push to `main` branch only

**What it does**:
1. **Release Management**: Uses Changesets for version management
2. **Package Publishing**: Automatically publishes to npm registry
3. **Release PR Creation**: Creates pull requests for version bumps

**Requirements**:
- `GITHUB_TOKEN`: Automatically provided by GitHub
- `NPM_TOKEN`: Required secret for npm publishing

## Running CI Locally

### Full CI Pipeline
```bash
# Run the exact same checks as CI
pnpm run ci

# This is equivalent to:
turbo build test lint
```

### Individual CI Steps
```bash
# Build all packages and apps
pnpm run build
# or
turbo build

# Run all tests  
pnpm test
# or  
turbo test

# Run linting
turbo lint
```

### Turbo Configuration

The CI pipeline leverages Turborepo's task configuration from `turbo.json`:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist", "*.tsbuildinfo", ".next", "build"],
      "cache": true
    },
    "test": {
      "dependsOn": ["^build"], 
      "cache": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "cache": true
    }
  }
}
```

**Key features**:
- **Dependency management**: Tests and linting depend on builds completing first
- **Caching**: All tasks cache results for faster subsequent runs
- **Parallel execution**: Tasks run in parallel where dependencies allow

## Development CI Workflow

### Quick Validation
```bash
# Fast check before committing
turbo build test lint --filter=...[HEAD^]
```

### Package-Specific CI
```bash
# Run CI for specific package and its dependencies
turbo build test lint --filter=@total-typescript/shared...

# Run CI for specific app
turbo build test lint --filter=written-content-manager
```

### Watch Mode Development
```bash
# Run build/test in watch mode during development
pnpm run dev

# This runs:
turbo watch build
```

## CI Environment & Requirements

### Node.js Version
- **Required**: Node.js 22.x (exact version specified in package.json engines)
- **Package Manager**: pnpm 9.11.0+
- **TypeScript**: 5.8.0-dev (development version for latest features)

### Environment Variables
- **`EXTERNAL_DRIVE_ROOT`**: Set to "/example-root" in CI for path resolution
- **`DATABASE_URL`**: Required for apps with database integration (must target localhost for tests)

### Dependencies
CI automatically installs all dependencies including:
- Development tools (TypeScript, Vitest, linting tools)
- Build tools (Turborepo, Vite, tsc)
- Runtime dependencies (Effect, React, Prisma, etc.)

## Troubleshooting CI

### Common CI Failures

1. **Build Failures**: Usually TypeScript compilation errors
   ```bash
   # Check build locally
   turbo build --verbose
   ```

2. **Test Failures**: Check individual test files
   ```bash
   # Run tests with verbose output
   turbo test --verbose
   ```

3. **Lint Failures**: Code style or quality issues
   ```bash
   # Run linting locally  
   turbo lint --verbose
   ```

### Cache Issues
```bash
# Clear Turbo cache if builds are inconsistent
turbo prune
```

### Package Resolution
```bash
# Reinstall dependencies if package resolution fails
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Release Process

The monorepo uses **Changesets** for version management:

1. **Create changeset**: `pnpm changeset` (adds semantic version info)
2. **Version bump**: Automatic via GitHub Actions on main branch
3. **Publish**: Automatic npm publishing for public packages
4. **Release PR**: Automatic creation of version bump PRs

### Manual Release (if needed)
```bash
# Build and release manually
pnpm run ci && pnpm changeset publish
```