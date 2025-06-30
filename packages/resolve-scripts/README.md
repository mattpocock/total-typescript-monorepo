# DaVinci Resolve Scripts

A collection of Lua scripts for automating DaVinci Resolve workflows, designed to streamline video editing and content creation processes.

## Overview

This package contains Lua scripts that integrate with DaVinci Resolve's scripting API to automate common video editing tasks, timeline management, and export workflows.

## Scripts

### Timeline Management

#### `create-timeline.lua`
Creates new timelines with predefined settings.

#### `export-timelines.lua`
Batch export multiple timelines with consistent settings.

#### `add-timeline-to-render-queue.lua`
Automatically adds the current timeline to the render queue with optimized settings.

### Clip Operations

#### `get-current-timeline-clip.lua`
Retrieves information about the currently selected clip.

#### `clip-and-append.lua`
Advanced clip manipulation for automated editing workflows.

#### `zoom-clip.lua`
Automatically adjusts clip zoom and positioning.

### Media Management

#### `get-files-from-current-bin.lua`
Lists all files in the currently selected media bin.

#### `import-file-to-bin.lua`
Imports files into specified media bins programmatically.

#### `create-project-with-latest-obs-video.lua`
Automatically creates new projects and imports the latest OBS recording.

### Effects and Enhancement

#### `add-gaussian-blur.lua`
Applies gaussian blur effects to selected clips.

#### `add-subtitles.lua`
Adds subtitle tracks and formatting to timelines.

## Installation

1. Copy the script files to your DaVinci Resolve scripts directory:
   - **Windows**: `%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Comp\`
   - **macOS**: `~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Comp/`
   - **Linux**: `~/.local/share/DaVinciResolve/Fusion/Scripts/Comp/`

2. Restart DaVinci Resolve

3. Access scripts via **Workspace → Scripts**

## Usage

### From DaVinci Resolve UI

1. Open DaVinci Resolve
2. Navigate to **Workspace → Scripts**
3. Select and run the desired script

### Programmatic Usage

Scripts can be triggered from the Total TypeScript monorepo:

```typescript
import { DAVINCI_RESOLVE_SCRIPTS_LOCATION } from '@total-typescript/shared';
import { execResolveScript } from '@total-typescript/shared';

// Execute a DaVinci Resolve script
await execResolveScript('create-timeline.lua');
```

## Script Documentation

Each script includes inline documentation. For comprehensive API reference, see `docs.txt` which contains the complete DaVinci Resolve scripting API documentation.

### Example: Creating a Timeline

```lua
-- create-timeline.lua
local resolve = Resolve()
local projectManager = resolve:GetProjectManager()
local project = projectManager:GetCurrentProject()

if project then
    local timeline = project:CreateTimeline("New Timeline")
    print("Created timeline: " .. timeline:GetName())
else
    print("No project loaded")
end
```

## Configuration

Some scripts may require configuration via environment variables or DaVinci Resolve project settings. Check individual script headers for specific requirements.

## Integration with Monorepo

These scripts are designed to work seamlessly with the Total TypeScript video processing pipeline:

1. **Content Creation**: Raw recordings are processed by `@total-typescript/ffmpeg`
2. **DaVinci Import**: Scripts automatically import processed content
3. **Timeline Setup**: Automated timeline creation and clip arrangement
4. **Export**: Batch export with consistent settings

## Troubleshooting

### Script Not Appearing
- Ensure scripts are in the correct directory
- Restart DaVinci Resolve
- Check file permissions

### API Errors
- Verify DaVinci Resolve version compatibility
- Ensure a project is loaded before running scripts
- Check the console output for detailed error messages

### Performance
- Some scripts may take time with large projects
- Consider running during off-peak hours for batch operations

## Requirements

- **DaVinci Resolve**: Version 17.0 or later
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Permissions**: Read/write access to DaVinci Resolve directories

## Related Packages

- `@total-typescript/shared`: Integration utilities
- `@total-typescript/ffmpeg`: Video processing pipeline