# Total TypeScript Monorepo

A comprehensive video content creation and processing monorepo designed for TypeScript education and tutorial creation.

## Overview

This monorepo contains tools and workflows for creating high-quality TypeScript educational content, from recording and editing videos to generating interactive code examples and managing written content.

## 🏗️ Architecture

### Packages (`packages/`)

Core reusable libraries:

- **[@total-typescript/twoslash-shared](./packages/twoslash-shared/)** - TypeScript code transformation with Twoslash syntax highlighting
- **[@total-typescript/shared](./packages/shared/)** - Common utilities and DaVinci Resolve integration
- **[@total-typescript/ffmpeg](./packages/ffmpeg/)** - Comprehensive video processing and AI workflows
- **[resolve-scripts](./packages/resolve-scripts/)** - DaVinci Resolve Lua automation scripts

### Applications (`apps/`)

Specialized applications and tools:

- **written-content** - Content management system for articles and tutorials
- **written-content-manager** - Web interface for managing written content
- **twoslash-preview-server** - Development server for Twoslash code previews
- **twoslash-to-simple-markdown** - Convert Twoslash code to simplified markdown
- **remotion-subtitle-renderer** - Video subtitle rendering with Remotion
- **twoslash-lint** - Linting and validation for TypeScript code samples
- **internal-cli** - Internal command-line tools for content creation

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 (exact)
- **pnpm**: Version 9.11.0+
- **FFmpeg**: For video processing
- **DaVinci Resolve**: For video editing (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd total-typescript-monorepo

# Install dependencies
pnpm install

# Build all packages
pnpm run build
```

## 📜 Available Scripts

### Development

```bash
# Watch mode for development
pnpm run dev

# Start writing workflow (preview server + content tools)
pnpm run write

# Create new content with fresh start
pnpm run write-new

# Content management interface
pnpm run manage
```

### Content Creation

```bash
# Create new written content
pnpm run new

# Reset/clear scratch content
pnpm run scratch

# Run AI playground
pnpm run ai
```

### Build & CI

```bash
# Build all packages and apps
pnpm run build

# Run full CI pipeline (build, test, lint)
pnpm run ci

# Release new versions
pnpm run release
```

### Video Production

```bash
# Append video to DaVinci Resolve timeline
pnpm run append
```

## 🎬 Video Production Workflow

1. **Recording**: Capture screen recordings with OBS or similar
2. **Processing**: Use `@total-typescript/ffmpeg` for auto-editing and subtitle generation
3. **DaVinci Integration**: Import and enhance with `resolve-scripts`
4. **Export**: Automated rendering and export workflows

### Auto-Editing Features

- **Silence Removal**: Automatically detect and remove silent segments
- **Bad Take Detection**: Identify and exclude marked bad takes
- **Subtitle Generation**: AI-powered transcription and subtitle overlay
- **Batch Processing**: Handle multiple videos with consistent settings

## 📚 Code Example Workflow

1. **Authoring**: Write TypeScript examples with Twoslash comments
2. **Validation**: Use `twoslash-lint` to ensure code correctness
3. **Rendering**: Generate syntax-highlighted HTML with `twoslash-shared`
4. **Preview**: Test output with `twoslash-preview-server`

## 🔧 Configuration

### Environment Variables

```bash
# Video processing directories
export EXPORT_DIRECTORY="/path/to/video/exports"
export SHORTS_EXPORT_DIRECTORY="/path/to/shorts"
export TRANSCRIPTION_DIRECTORY="/path/to/transcripts"

# AI API keys
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
```

### Workspace Configuration

The monorepo uses:
- **Turbo**: For build orchestration and caching
- **pnpm workspaces**: For dependency management
- **Changesets**: For version management and releases
- **Vitest**: For testing across packages

## 📦 Package Dependencies

```json
{
  "packageManager": "pnpm@9.11.0",
  "engines": {
    "node": "=20"
  }
}
```

### Key Dependencies

- **TypeScript**: 5.8.0-dev.20250124 (development version)
- **Turbo**: 2.3.3 (build system)
- **Effect**: Functional programming and error handling
- **Vitest**: Testing framework

## 🤖 AI Integration

The monorepo leverages AI for content creation:

- **Content Analysis**: Determine optimal calls-to-action
- **Transcription**: Convert speech to text for subtitles
- **Article Generation**: Create written content from video transcripts
- **Code Enhancement**: Improve TypeScript examples

## 🔗 Integration Points

### DaVinci Resolve
- Lua scripts for timeline automation
- Project template management
- Batch export workflows

### TypeScript Tooling
- Advanced type checking with Twoslash
- Interactive code examples
- Syntax highlighting and error reporting

### Content Management
- Markdown-based article system
- Version control for educational content
- Preview and validation workflows

## 🛠️ Development

### Building Packages

```bash
# Build specific package
cd packages/ffmpeg
pnpm run build

# Build with dependencies
pnpm run build --filter=@total-typescript/ffmpeg...
```

### Testing

```bash
# Run all tests
pnpm run test

# Test specific package
pnpm run test --filter=@total-typescript/shared
```

### Adding New Packages

1. Create package directory in `packages/` or `apps/`
2. Add `package.json` with proper naming convention
3. Update workspace configuration if needed
4. Add to build pipeline in `turbo.json`

## 📖 Documentation

Each package contains its own README with detailed usage instructions:

- [Twoslash Shared](./packages/twoslash-shared/README.md)
- [Shared Utilities](./packages/shared/README.md)
- [FFmpeg Tools](./packages/ffmpeg/README.md)
- [Resolve Scripts](./packages/resolve-scripts/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Update relevant documentation
5. Submit a pull request

## 📄 License

ISC - See individual packages for specific licensing information.

## 👨‍💻 Author

Matt Pocock - Total TypeScript