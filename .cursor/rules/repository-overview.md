# Total TypeScript Monorepo Overview

## What This Repository Is

This is Matt Pocock's **Total TypeScript Monorepo** - a comprehensive video content creation and processing system specifically designed for TypeScript education and tutorial creation. It's the complete infrastructure behind Total TypeScript's educational content pipeline.

## What It Does

The monorepo provides a full-stack solution for creating high-quality TypeScript educational content, covering the entire workflow from video recording to content delivery:

### Core Capabilities

- **Video Production**: Auto-editing, silence removal, subtitle generation, and batch processing
- **Content Management**: Markdown-based article system with web interface
- **Interactive Examples**: TypeScript code snippets with Twoslash syntax highlighting
- **Educational Tools**: Font generation, image processing, and preview servers
- **DaVinci Resolve Integration**: Lua automation scripts for professional video editing
- **AI-Powered Workflows**: Automatic article generation from video transcripts

### Primary Use Cases

1. **Educational Video Creation**: Record, process, and edit TypeScript tutorial videos
2. **Interactive Content**: Create executable TypeScript examples with error highlighting
3. **Article Generation**: Transform video transcripts into comprehensive written content
4. **Content Organization**: Manage courses, sections, and exercises through a web interface

## Key Technologies

- **Build System**: Turborepo with pnpm workspaces
- **Languages**: TypeScript 5.8.0-dev, React, Lua
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI and Anthropic APIs
- **Video Processing**: FFmpeg, DaVinci Resolve, Remotion
- **Web Framework**: Remix for content management interface
- **Testing**: Vitest across all packages
- **UI**: TailwindCSS with Radix UI components

## Target Audience

- TypeScript educators and content creators
- Tutorial producers who need automated video processing
- Educational content teams requiring sophisticated tooling
- Developers building similar educational platforms

This is not a typical application - it's a specialized content creation pipeline optimized for high-quality TypeScript education at scale.