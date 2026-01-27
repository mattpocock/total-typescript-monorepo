# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is Matt Pocock's Total TypeScript monorepo - a comprehensive workspace for creating TypeScript educational content, from video production and processing to written content management. The monorepo supports the complete lifecycle: recording videos, auto-editing them, generating transcripts and articles, and managing interactive code examples.

## Quick Commands

### Development

```bash
pnpm run dev              # Watch mode for all packages
pnpm run build            # Build all packages and apps
pnpm run ci               # Full CI pipeline: build, test, lint
```

### Content Creation

```bash
pnpm run write            # Start writing workflow (preview server + content tools)
pnpm run write-new        # Create new content with fresh start
pnpm run new              # Create new written content
pnpm run manage           # Content management interface
```

### Video Production

```bash
pnpm cli create-auto-edited-video                              # Standard auto-editing workflow
pnpm cli create-auto-edited-video --generate-article           # With AI article generation
pnpm cli create-auto-edited-video --generate-article --alongside  # Save article with video
pnpm run append           # Append video to DaVinci Resolve timeline
```

### Testing

```bash
pnpm run test                                    # Run all tests
pnpm run test --filter=@total-typescript/shared  # Test specific package
vitest packages/ffmpeg/src/some-file.test.ts     # Run single test file
```

### Package-Specific Development

```bash
# Build specific package
cd packages/ffmpeg && pnpm run build

# Build with dependencies
pnpm run build --filter=@total-typescript/ffmpeg...
```

## Architecture Overview

### Effect-TS Patterns

This codebase extensively uses Effect-TS for functional programming with typed errors, dependency injection, and resource management. Key patterns:

1. **Services** (`Effect.Service`): Encapsulate business logic with dependency injection

   - Defined with `Effect.Service<ServiceName>()("ServiceName", { effect, dependencies })`
   - Access dependencies with `yield*` syntax
   - Methods use `Effect.fn("methodName")` for tracing

2. **Tagged Errors** (`Data.TaggedError`): Typed error handling

   - All error classes extend `Data.TaggedError`
   - Error names end with "Error"
   - Include context fields for debugging

3. **Workflows**: Orchestrate multiple services using `Effect.gen`

   - Coordinate between services
   - Handle errors with `Effect.mapError`, `Effect.catchTag`
   - Log important steps with `Effect.logInfo`

4. **Layers**: Compose application dependencies

   - Use `Layer.mergeAll()` to combine service layers
   - Prefer `Service.Default` layers
   - Provide to Effects with `Effect.provide(AppLayerLive)`

5. **Config**: Type-safe environment variables
   - Use `Config.string()`, `Config.number()`, etc.
   - Use `Config.redacted()` for secrets

### Typical Service Structure

```typescript
export class MyService extends Effect.Service<MyService>()("MyService", {
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const config = yield* Config.string("SOME_CONFIG");

    return {
      doSomething: Effect.fn("doSomething")(function* (param: string) {
        // Implementation
      }),
    };
  }),
  dependencies: [NodeFileSystem.layer],
}) {}
```

### Package Architecture

**Core Packages (`packages/`):**

- `@total-typescript/ffmpeg` - Video processing, AI workflows, article generation
- `@total-typescript/shared` - Common utilities and DaVinci Resolve integration
- `@total-typescript/twoslash-shared` - TypeScript code transformation with Twoslash
- `resolve-scripts` - DaVinci Resolve Lua automation scripts

**Key Applications (`apps/`):**

- `internal-cli` - Main CLI tool (`pnpm cli <command>`)
- `written-content` - Content management system
- `written-content-manager` - Web interface for content management
- `twoslash-preview-server` - Development server for code previews
- `remotion-subtitle-renderer` - Video subtitle rendering

### Video Processing Workflow

The ffmpeg package handles auto-editing with these features:

- **Silence removal**: Automatically detect and remove silent segments
- **Bad take detection**: Identify and exclude marked bad takes (phrases like "that was bad" trigger removal)
- **Subtitle generation**: AI-powered transcription with subtitle overlay
- **Article generation**: Create written content from video transcripts with AI
- **Queue system**: Process videos through multi-step workflows

### Article Generation System

When using `--generate-article`:

1. Video is processed and transcribed
2. AI analyzes transcript and generates link requests
3. User optionally provides code file path
4. User provides URLs for requested links
5. AI generates comprehensive article with code examples and links
6. Articles saved with numbered filenames (001-title.md) in `ARTICLE_STORAGE_PATH`
7. With `--alongside`: Article saved next to video with video's name

## Environment Configuration

**ALL environment variables must be defined in the root `.env` file.** Do not create `.env` files in individual packages.

### Key Environment Variables

```bash
# Video Processing
OBS_OUTPUT_DIRECTORY=/path/to/obs/recordings
DAVINCI_EXPORT_DIRECTORY=/path/to/exports
TRANSCRIPTION_DIRECTORY=/path/to/transcripts
EXPORT_DIRECTORY=/path/to/video/exports
SHORTS_EXPORT_DIRECTORY=/path/to/shorts

# Article Generation
ARTICLE_STORAGE_PATH=/path/to/articles
ARTICLES_TO_TAKE=5              # Number of recent articles for AI context
PADDED_NUMBER_LENGTH=3          # Article numbering format

# Queue Processing
QUEUE_LOCATION=/path/to/queue.json
QUEUE_LOCKFILE_LOCATION=/path/to/queue.lock

# AI Services
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key

# Database (for written-content apps)
WRITTEN_CONTENT_DATABASE_URL=postgresql://...
```

See `.env.example` for more details.

## Technology Stack

- **Package Manager**: pnpm 9.11.0 (workspaces)
- **Build System**: Turborepo 2.3.3
- **Node.js**: Version 22.17.0 (exact)
- **TypeScript**: 5.8.0-dev.20250124 (development version)
- **Functional Programming**: Effect-TS 3.16.8
- **Testing**: Vitest
- **AI Integration**: OpenAI, Anthropic (via ai-sdk)
- **Video Tools**: FFmpeg, DaVinci Resolve, Remotion
- **Database**: PostgreSQL with Prisma (written-content apps)

## Common Development Patterns

### Adding New Services

1. Create service with `Effect.Service` pattern
2. Define typed errors with `Data.TaggedError`
3. Use `Effect.fn` for all methods
4. Add service to `app-layer.ts`
5. Write tests with mocked layers

### Working with Files

```typescript
const fs = yield * FileSystem.FileSystem;
const content =
  yield *
  fs
    .readFileString(path)
    .pipe(Effect.mapError((e) => new FileReadError({ cause: e, path })));
```

### Handling Errors

```typescript
// Transform errors at boundaries
const result =
  yield *
  service
    .method(input)
    .pipe(
      Effect.mapError((e) => new WorkflowError({ cause: e, context: input })),
    );

// Use catchTag for specific error handling
const result =
  yield *
  service
    .method()
    .pipe(
      Effect.catchTag("FileNotFoundError", (e) => Effect.succeed(defaultValue)),
    );
```

### Parallel Processing

```typescript
const results =
  yield *
  Effect.all(
    items.map((item) => processItem(item)),
    { concurrency: 5 },
  );
```

## Monorepo Structure

```
total-typescript-monorepo/
├── packages/           # Shared libraries
├── apps/              # Applications and tools
├── .env               # All environment variables (root only)
├── turbo.json         # Build orchestration
├── pnpm-workspace.yaml # Workspace configuration
└── vitest.workspace.ts # Test configuration
```

Build outputs go to `dist/` directories within each package/app.

## DaVinci Resolve Integration

Lua scripts in `packages/resolve-scripts/` automate video editing:

- Timeline management and exports
- Clip manipulation (append, zoom, blur)
- Subtitle integration
- Render queue automation
- OBS video imports

Scripts are accessed through the shared package's DaVinci Resolve utilities.

- When checking types, always run pnpm run build on the entire monorepo. Running it on single packages won't give you a good enough insight as to what is happening.
