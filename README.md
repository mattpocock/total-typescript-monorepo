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

# Create auto-edited video with automatic article generation
pnpm cli create-auto-edited-video --generate-article

# Create auto-edited video (standard workflow)
pnpm cli create-auto-edited-video
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
- **Article Generation**: Automatically create written content from video transcripts

### Article Generation Workflow

The `--generate-article` flag enables automatic article creation from video transcripts through a sophisticated AI-powered workflow:

#### Complete Workflow Steps
1. **Video Submission**: User provides video name and optional code file when submitting
2. **Video Processing**: Standard auto-editing and transcript generation
3. **Transcript Analysis**: AI analyzes transcript content and generates link requests
4. **Link Collection**: User provides relevant external resources and documentation
5. **Article Generation**: AI creates comprehensive article with code examples and links

#### Usage Examples

```bash
# Basic article generation
pnpm cli create-auto-edited-video --generate-article

# Combined with other options
pnpm cli create-auto-edited-video --generate-article --upload --no-subtitles
```

#### Interactive Steps
- **Code File**: Prompted synchronously during video submission for optimal context
- **Link Requests**: AI generates contextual link requests based on transcript content (processed later)
- **Link URLs**: User provides URLs for documentation, references, and resources (processed later)

#### Output
- **Video**: Processed and edited video file
- **Transcript**: Text transcript of the video content
- **Article**: Markdown article with structured content, code examples, and external links
- **Automatic Naming**: Articles are numbered and named based on AI-generated titles

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
export OBS_OUTPUT_DIRECTORY="/path/to/obs/recordings"

# Article generation
export ARTICLE_STORAGE_PATH="/path/to/articles"
export ARTICLES_TO_TAKE="5"              # Number of recent articles for context
export PADDED_NUMBER_LENGTH="3"          # Article numbering format (001, 002, etc.)

# Queue processing
export QUEUE_LOCATION="/path/to/queue.json"
export QUEUE_LOCKFILE_LOCATION="/path/to/queue.lock"

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
- **Article Generation**: Create written content from video transcripts with contextual awareness
- **Link Discovery**: Automatically identify and request relevant external resources
- **Code Enhancement**: Improve TypeScript examples and integrate code snippets
- **Title Generation**: Create SEO-friendly article titles from content analysis

### AI-Powered Article Creation

The article generation system uses advanced AI to:
- **Analyze Transcripts**: Extract key concepts and technical topics
- **Generate Link Requests**: Identify documentation and resources mentioned in content
- **Create Structured Content**: Build comprehensive articles with proper formatting
- **Maintain Context**: Use recent articles to ensure consistent style and approach
- **Integrate Code**: Seamlessly incorporate TypeScript examples and explanations

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

## �️ Troubleshooting

### Article Generation Issues

**Queue Processing**
```bash
# Check queue status
cat /path/to/queue.json

# Clear stuck queue (careful!)
rm /path/to/queue.json /path/to/queue.lock
```

**Common Issues**
- **Transcript not found**: Ensure `TRANSCRIPTION_DIRECTORY` is correct and transcript exists
- **AI service errors**: Verify `ANTHROPIC_API_KEY` is set and valid
- **Code file missing**: Path provided during code request must exist and be readable
- **Article generation fails**: Check `ARTICLE_STORAGE_PATH` permissions and disk space

**Debugging**
```bash
# Enable debug logging
DEBUG=1 pnpm cli create-auto-edited-video --generate-article

# Process individual queue steps
pnpm cli process-queue           # Process automated items
pnpm cli process-info-requests   # Handle user input items
```

### Error Recovery

**Failed Article Generation**
- Article generation failures don't affect video processing
- Manually retry with `pnpm cli article-from-transcript`
- Check AI service quotas and API limits

**Queue Corruption**
- Queue items are designed to be recoverable
- Failed items are marked with error details
- Manual intervention may be required for complex dependency failures

## �📄 License

ISC - See individual packages for specific licensing information.

## 👨‍💻 Author

Matt Pocock - Total TypeScript