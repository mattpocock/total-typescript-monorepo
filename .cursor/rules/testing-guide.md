# Testing Guide

## Testing Framework

The Total TypeScript Monorepo uses **Vitest** as the primary testing framework across all packages and apps. Vitest is configured through a workspace setup that automatically discovers and runs tests in all packages and applications.

## Test Configuration

### Workspace Setup
- **Main config**: `vitest.workspace.ts` - Configures testing across `packages/*` and `apps/*`
- **Individual configs**: Each package/app has its own `package.json` with test scripts
- **Global pattern**: Test files use `.test.ts` suffix and are located in `src/` or `tests/` directories

### Test Types

1. **Unit Tests**: Testing individual functions and utilities
2. **Integration Tests**: Testing workflows and service interactions  
3. **Database Tests**: Testing Prisma models and database operations (with test database)
4. **Type Tests**: Testing TypeScript type definitions and transformations

## Running Tests

### Global Commands (from root)

```bash
# Run all tests across the entire monorepo
pnpm test

# Run tests as part of the CI pipeline (includes build + lint)
pnpm run ci

# Run tests in watch mode during development
pnpm run dev
```

### Package-Specific Commands

```bash
# Run tests for a specific package
cd packages/shared
pnpm test

# Run tests for a specific app
cd apps/written-content-manager  
pnpm test
```

### Turbo Commands

```bash
# Run tests using Turbo (with caching and parallel execution)
turbo test

# Run tests for specific packages only
turbo test --filter=@total-typescript/shared
turbo test --filter=written-content-manager

# Run tests with dependencies
turbo test --filter=@total-typescript/ffmpeg...
```

## Test Examples & Patterns

### Standard Unit Tests
```typescript
// packages/shared/src/tests/utils.test.ts
import { expect, it } from "vitest";
import { returnMarkdownHeadingsAndContents } from "../utils.js";

it("Should return the correct sections for a markdown string", () => {
  const result = returnMarkdownHeadingsAndContents(markdown);
  expect(result).toEqual([/* expected result */]);
});
```

### Effect-Based Tests (using Effect library)
```typescript
// packages/ffmpeg/src/queue-creation.test.ts
import { ConfigProvider, Effect } from "effect";
import { describe, expect, it } from "vitest";

const testConfig = ConfigProvider.fromMap(new Map([
  ["TRANSCRIPTION_DIRECTORY", "/test/transcriptions"],
  ["OBS_OUTPUT_DIRECTORY", "/test/obs-output"],
]));

it("should create queue items", async () => {
  const result = await someEffect.pipe(
    Effect.withConfigProvider(testConfig),
    Effect.runPromise
  );
  expect(result).toHaveLength(1);
});
```

### Database Tests (Remix app)
```typescript
// apps/written-content-manager/app/modules/server-functions/tests/
import { describe, expect, it } from "vitest";
import { p } from "../../../db"; // Prisma client
import { serverFunctions } from "../server-functions";

it("Should create and retrieve data", async () => {
  const course = await p.course.create({
    data: { title: "Test Course", type: "WORKSHOP" }
  });
  
  const result = await serverFunctions.courses.list();
  expect(result).toMatchObject([{ id: course.id }]);
});
```

## Test Coverage

### Written Content Manager
- **Setup**: Uses test database with automatic cleanup
- **Coverage**: Configured with 100% threshold for core modules
- **Location**: `tests/setup-tests.ts` handles database setup and mocking

### Key Test Areas
1. **Queue Processing**: Video processing workflows and article generation
2. **Server Functions**: Database operations and business logic
3. **Type Utilities**: TypeScript utility functions and transformations
4. **File Operations**: Content management and file processing
5. **AI Integration**: Mocked AI service interactions

## Development Testing

### Watch Mode
```bash
# Run specific tests in watch mode
cd packages/ffmpeg
pnpm test --watch

# Run tests for changed files only
turbo test --filter=...[HEAD^]
```

### Debug Configuration
The repo includes VSCode launch configuration for debugging tests:
- **Vitest debugger**: Available in `.vscode/launch.json`
- **tsx debugger**: For debugging TypeScript files directly

## Environment Setup for Tests

### Database Tests
- **Requirement**: PostgreSQL localhost connection
- **Environment**: `DATABASE_URL` must target localhost
- **Safety**: Tests automatically verify localhost to prevent production data issues

### File System Tests  
- **Temporary directories**: Tests create/cleanup temp directories
- **Mock services**: File operations are often mocked for isolation
- **Effect integration**: Uses Effect's FileSystem layer for testable file operations

## Common Test Patterns

1. **Config injection**: Using Effect's ConfigProvider for test configuration
2. **Service mocking**: Mocking AI and external services  
3. **Database cleanup**: Automatic cleanup between tests
4. **Async testing**: Extensive use of async/await with Effect.runPromise
5. **Type testing**: Using Vitest's built-in type testing utilities