# Video Production Workflow

This document describes the video processing pipeline used for creating TypeScript educational content.

## Auto-Editing Workflow

The main CLI command `pnpm cli create-auto-edited-video` processes raw OBS recordings through several stages:

1. **Silence Removal** - Automatically detects and removes silent segments
2. **Bad Take Detection** - Identifies and excludes marked bad takes (triggered by phrases like "that was bad")
3. **Subtitle Generation** - AI-powered transcription creates subtitle overlays
4. **Export** - Final video output with subtitles burned in

## Article Generation

When using `--generate-article`:

1. Video is processed and transcribed
2. AI analyzes transcript and generates link requests
3. User optionally provides code file path
4. User provides URLs for requested links
5. AI generates comprehensive article with code examples and links
6. Articles saved with numbered filenames (e.g., `001-title.md`)

Use `--alongside` to save the article next to the video file instead.

## DaVinci Resolve Integration

Lua scripts in `packages/resolve-scripts/` automate DaVinci Resolve operations:

- Timeline management and exports
- Clip manipulation (append, zoom, blur)
- Subtitle integration
- Render queue automation
- OBS video imports

## Related Commands

- `pnpm run append` - Append video to DaVinci Resolve timeline
- `pnpm cli` - Access all CLI commands
