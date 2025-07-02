# Total TypeScript Monorepo Structure

## Architecture Overview

This monorepo uses **pnpm workspaces** with **Turborepo** for build orchestration. The structure follows a clear separation between reusable packages and standalone applications.

## Root Structure

```
/
├── packages/          # Reusable libraries and utilities
├── apps/             # Standalone applications and tools
├── turbo.json        # Turborepo configuration
├── package.json      # Root dependencies and scripts
├── vitest.workspace.ts # Testing configuration
└── pnpm-workspace.yaml # Workspace configuration
```

## Packages Directory (`packages/`)

**Core reusable libraries shared across applications:**

### `@total-typescript/shared`
- **Purpose**: Common utilities, types, and DaVinci Resolve integrations
- **Key Exports**: Constants, types, utility functions, Effect-based helpers
- **Technologies**: TypeScript, Zod, Effect

### `@total-typescript/twoslash-shared`
- **Purpose**: TypeScript code transformation with Twoslash syntax highlighting
- **Key Features**: Code fence processing, syntax highlighting with Shiki, CDN storage
- **Technologies**: Shiki, Twoslash, Rehype

### `@total-typescript/ffmpeg`
- **Purpose**: Video processing utilities with AI integration
- **Key Features**: FFmpeg workflows, AI-powered content generation, parallel processing
- **Technologies**: FFmpeg, OpenAI, Anthropic AI, Effect, p-limit

### `resolve-scripts`
- **Purpose**: DaVinci Resolve automation scripts
- **Key Features**: Timeline export, clip manipulation, subtitle integration, render queue management
- **Technologies**: Lua scripting for DaVinci Resolve

### `_example-package`
- **Purpose**: Template for creating new packages in the monorepo

## Apps Directory (`apps/`)

**Standalone applications and specialized tools:**

### `written-content`
- **Purpose**: Content management system for articles and tutorials
- **Features**: Markdown content creation, TypeScript example integration
- **Technologies**: TypeScript, React, Vite, Vitest, validation libraries (Zod, ArkType, Valibot, Joi, TypeBox)

### `written-content-manager`
- **Purpose**: Full-stack web interface for content management
- **Features**: Database-driven content, AI assistance, Monaco Editor, XState workflows
- **Technologies**: Remix, React, Prisma, PostgreSQL, TailwindCSS, Radix UI

### `@total-typescript/twoslash-preview-server`
- **Purpose**: Development server for previewing TypeScript code snippets
- **Features**: Hot reloading, WebSocket connections, browser automation
- **Technologies**: Node.js, WebSockets, Puppeteer, Fastify, Chokidar

### `@total-typescript/twoslash-to-simple-markdown`
- **Purpose**: CLI tool for converting Twoslash snippets to simple markdown
- **Features**: Batch processing, TypeScript code simplification
- **Technologies**: Node.js CLI, Commander, Fast-glob

### `@total-typescript/twoslash-lint`
- **Purpose**: Linting tool for TypeScript code snippets
- **Features**: Code quality checking, file watching, batch processing
- **Technologies**: Node.js CLI, Chokidar, Commander

### `remotion-subtitle-renderer`
- **Purpose**: Video subtitle rendering using Remotion
- **Features**: Programmatic video generation, subtitle overlays
- **Technologies**: Remotion, React 19, TailwindCSS v4

### `@total-typescript/internal-cli`
- **Purpose**: Internal command-line tools for monorepo management
- **Features**: Video timeline management, FFmpeg integration, workflow automation
- **Technologies**: Node.js CLI, Commander, Effect, dotenv

### `_example-app`
- **Purpose**: Template for creating new applications in the monorepo

## Key Configuration Files

- **`turbo.json`**: Defines build tasks, dependencies, and caching strategies
- **`vitest.workspace.ts`**: Configures testing across all packages and apps
- **`pnpm-workspace.yaml`**: Defines workspace structure for pnpm
- **`package.json`**: Root scripts for development workflows

## Development Workflows

- **Content Creation**: `pnpm write`, `pnpm new`, `pnpm scratch`
- **Content Management**: `pnpm manage` (launches content manager + preview server)
- **Video Production**: DaVinci Resolve automation + Remotion + FFmpeg integration
- **Development**: `pnpm dev` (watch mode), `pnpm ci` (full CI pipeline)

## Dependencies & Requirements

- **Node.js**: Version 22 (exact requirement)
- **pnpm**: Version 9.11.0+
- **TypeScript**: 5.8.0-dev for latest features
- **Effect**: Functional programming library used throughout
- **Docker**: For local database development (PostgreSQL)