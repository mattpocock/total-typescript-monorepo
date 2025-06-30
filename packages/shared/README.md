# @total-typescript/shared

Shared utilities and types for the Total TypeScript monorepo, including DaVinci Resolve integration helpers.

## Features

- 🎬 **DaVinci Resolve Integration**: Utilities for working with DaVinci Resolve automation
- 📁 **Path Constants**: Pre-configured paths for scripts and resources
- 🔧 **Common Utilities**: Shared functions and types used across the monorepo
- ⚡ **Effect Integration**: Built with Effect-TS for robust error handling and composition

## Installation

```bash
pnpm add @total-typescript/shared
```

## Usage

### DaVinci Resolve Scripts

```typescript
import { DAVINCI_RESOLVE_SCRIPTS_LOCATION } from '@total-typescript/shared';

// Access the location of DaVinci Resolve Lua scripts
console.log(DAVINCI_RESOLVE_SCRIPTS_LOCATION);
// Points to: ../../resolve-scripts/scripts
```

### Utility Functions

```typescript
import { execAsync } from '@total-typescript/shared';

// Execute shell commands asynchronously
const result = await execAsync('ls -la');
```

### Types and Constants

```typescript
import type { AbsolutePath } from '@total-typescript/shared';

// Use the AbsolutePath type for type-safe file paths
const videoPath: AbsolutePath = '/path/to/video.mp4' as AbsolutePath;
```

## Package Structure

- **`constants.ts`**: Shared constants including DaVinci Resolve script paths
- **`types.ts`**: Common TypeScript types and interfaces
- **`utils.ts`**: Utility functions for common operations
- **`davinci-resolve.ts`**: DaVinci Resolve specific integrations

## Dependencies

- **Effect**: Functional programming library for TypeScript
- **@effect/platform**: Platform-specific Effect utilities
- **Zod**: Runtime type validation

## Development

```bash
# Build the package
pnpm run build

# Run tests
pnpm run test
```

## Related Packages

This package works closely with:
- `@total-typescript/ffmpeg` - Video processing workflows
- `packages/resolve-scripts` - DaVinci Resolve Lua scripts
- Other packages in the Total TypeScript monorepo