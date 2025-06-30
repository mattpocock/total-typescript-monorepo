# Total TypeScript Monorepo - Apps and Packages Guide

## Overview

This is Matt Pocock's Total TypeScript monorepo - a comprehensive workspace for TypeScript educational content creation, video production, and tooling. The monorepo uses `pnpm` workspaces with `turbo` for build orchestration.

## Repository Structure

- **Root**: Configuration files, scripts, and monorepo setup
- **packages/**: Shared libraries and utilities
- **apps/**: Standalone applications and tools

## Packages (Shared Libraries)

### @total-typescript/shared
**Purpose**: Core shared utilities and types used across the monorepo
- **Technologies**: TypeScript, Zod, Effect
- **Exports**: Constants, types, utilities, DaVinci Resolve integrations
- **Key Features**:
  - Common type definitions
  - Utility functions
  - DaVinci Resolve video editing integrations
  - Effect-based functional programming utilities

### @total-typescript/twoslash-shared
**Purpose**: Shared utilities for TypeScript code snippets with Twoslash integration
- **Technologies**: Shiki, Twoslash, Rehype, CDN storage
- **Key Features**:
  - Code transformation utilities
  - TypeScript code fence processing
  - Syntax highlighting with Shiki
  - Twoslash integration for TypeScript examples
  - Code sample extraction from files

### @total-typescript/ffmpeg
**Purpose**: FFmpeg video processing utilities with AI integration
- **Technologies**: FFmpeg, OpenAI, Anthropic AI, Effect
- **Key Features**:
  - Video processing and manipulation
  - AI-powered content generation
  - Integration with OpenAI and Anthropic APIs
  - Front-matter processing for content files
  - Parallel processing with p-limit

### resolve-scripts
**Purpose**: DaVinci Resolve automation scripts for video editing workflows
- **Technologies**: Lua scripting for DaVinci Resolve
- **Key Features**:
  - Timeline export automation
  - Clip manipulation (zoom, append, blur effects)
  - Subtitle integration
  - Render queue management
  - OBS video import workflows
  - Project creation automation

### _example-package
**Purpose**: Template/example package for creating new packages in the monorepo

## Apps (Standalone Applications)

### written-content
**Purpose**: TypeScript learning content and examples repository
- **Technologies**: TypeScript, React, Vite, Vitest, multiple validation libraries
- **Key Features**:
  - Educational TypeScript content creation
  - Integration with multiple validation libraries (Zod, ArkType, Valibot, Joi, TypeBox)
  - Support for React Query examples
  - Email content generation from markdown
  - Scratch mode for experimental content

### written-content-manager
**Purpose**: Full-stack web application for managing TypeScript educational content
- **Technologies**: Remix, React, Prisma, PostgreSQL, TailwindCSS, AI integration
- **Key Features**:
  - Database-driven content management (PostgreSQL with Prisma)
  - AI-powered content assistance (Anthropic)
  - Modern UI with Radix UI components and TailwindCSS
  - Monaco Editor for code editing
  - Date management and content organization
  - XState for complex state management
  - Docker integration for local development

### @total-typescript/twoslash-preview-server
**Purpose**: Development server for previewing TypeScript code snippets with Twoslash
- **Technologies**: Node.js, WebSockets, Puppeteer, Fastify
- **Key Features**:
  - Hot reloading for Twoslash content
  - File watching with Chokidar
  - WebSocket connections for real-time updates
  - Browser automation with Puppeteer
  - Fast web server with Fastify

### @total-typescript/twoslash-to-simple-markdown
**Purpose**: CLI tool for converting Twoslash TypeScript snippets to simple markdown
- **Technologies**: Node.js CLI, Commander, Fast-glob
- **Key Features**:
  - Batch processing of markdown files
  - TypeScript code snippet simplification
  - Command-line interface
  - File pattern matching with glob support

### @total-typescript/twoslash-lint
**Purpose**: Linting tool for TypeScript code snippets with Twoslash
- **Technologies**: Node.js CLI, Chokidar, Commander
- **Key Features**:
  - Code quality checking for TypeScript snippets
  - File watching for continuous linting
  - Batch processing capabilities
  - CLI interface for integration with workflows

### remotion-subtitle-renderer
**Purpose**: Video subtitle rendering using Remotion
- **Technologies**: Remotion, React 19, TailwindCSS v4
- **Key Features**:
  - Programmatic video generation
  - Subtitle overlay rendering
  - Modern React and TailwindCSS integration
  - Media parsing capabilities

### @total-typescript/internal-cli
**Purpose**: Internal command-line tools for monorepo management and workflows
- **Technologies**: Node.js CLI, Commander, Effect, dotenv
- **Key Features**:
  - Video timeline management
  - Integration with FFmpeg package
  - Environment configuration
  - Internal workflow automation
  - Effect-based functional programming

### _example-app
**Purpose**: Template/example application for creating new apps in the monorepo

## Key Workflows and Scripts

### Content Creation Workflow
- `pnpm write`: Watch mode for content creation with twoslash preview and written-content
- `pnpm new`: Create new content topics
- `pnpm scratch`: Create experimental/scratch content

### Content Management Workflow
- `pnpm manage`: Run the content manager with preview server
- Database migrations for content storage
- AI-assisted content creation

### Video Production Workflow
- DaVinci Resolve automation with Lua scripts
- Remotion for programmatic video generation
- FFmpeg integration for video processing
- Subtitle rendering and overlay

### Development Workflow
- `pnpm dev`: Watch mode for development
- `pnpm ci`: Continuous integration pipeline
- Turbo for efficient builds and caching
- TypeScript 5.8 dev version for latest features

## Technology Stack Summary

- **Package Management**: pnpm workspaces
- **Build System**: Turborepo
- **Languages**: TypeScript, Lua, React
- **Validation**: Zod, ArkType, Valibot, Joi, TypeBox
- **Database**: PostgreSQL with Prisma
- **AI Integration**: OpenAI, Anthropic
- **Video**: DaVinci Resolve, Remotion, FFmpeg
- **Web Framework**: Remix, Fastify
- **UI**: TailwindCSS, Radix UI
- **State Management**: XState
- **Testing**: Vitest
- **Code Quality**: TypeScript, ESLint, Prettier

## Development Environment

- Node.js 20 (exact version required)
- pnpm 9.11.0
- TypeScript 5.8.0-dev for latest features
- Effect library for functional programming
- Docker for local database development

This monorepo is designed to support the complete lifecycle of TypeScript educational content - from writing and managing content to creating videos and publishing materials.