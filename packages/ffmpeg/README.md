# @total-typescript/ffmpeg

A comprehensive FFmpeg toolkit for automated video processing, subtitle generation, and content creation workflows.

## Features

- 🎬 **Auto-Edited Videos**: Automatically remove silence and bad takes from recordings
- 📝 **Subtitle Generation**: AI-powered transcription and subtitle rendering
- 🔍 **Silence Detection**: Intelligent detection of speaking vs silent segments
- 📊 **Chapter Extraction**: Parse video markers and metadata
- 🎭 **DaVinci Integration**: Seamless workflow with DaVinci Resolve
- 🤖 **AI Integration**: OpenAI and Anthropic APIs for content processing
- ⚡ **Effect-TS**: Built with Effect for robust error handling and composition

## Installation

```bash
pnpm add @total-typescript/ffmpeg
```

## Core Workflows

### Auto-Edited Video Creation

```typescript
import { WorkflowsService } from "@total-typescript/ffmpeg";

const workflow = yield * WorkflowsService;

const result =
  yield *
  workflow.createAutoEditedVideoWorkflow({
    inputVideo: "/path/to/raw-recording.mp4" as AbsolutePath,
    outputFilename: "edited-video",
    subtitles: true,
    dryRun: false,
  });
```

### Subtitle Rendering

```typescript
import { renderSubtitles } from "@total-typescript/ffmpeg";

yield *
  renderSubtitles({
    inputPath: "/path/to/video.mp4" as AbsolutePath,
    outputPath: "/path/to/output-with-subs.mp4" as AbsolutePath,
    ctaDurationInFrames: 300,
    durationInFrames: 18000,
    originalFileName: "my-video",
  });
```

### Silence Detection

```typescript
import { findSilenceInVideo } from "@total-typescript/ffmpeg";

const { speakingClips } =
  yield *
  findSilenceInVideo(inputVideo, {
    threshold: -30, // dB threshold for silence
    silenceDuration: 0.5, // minimum silence duration
    startPadding: 0.3, // padding before speech
    endPadding: 0.3, // padding after speech
    fps: 30,
    ffmpeg: ffmpegService,
  });
```

## Core Services

### FFmpegCommandsService

Low-level FFmpeg operations:

```typescript
import { FFmpegCommandsService } from "@total-typescript/ffmpeg";

const ffmpeg = yield * FFmpegCommandsService;

// Extract audio from video
yield * ffmpeg.extractAudioFromVideo(videoPath, audioPath);

// Get video FPS
const fps = yield * ffmpeg.getFPS(videoPath);

// Create video clips
yield * ffmpeg.createClip(inputVideo, outputClip, startTime, duration);

// Generate subtitles from audio
const subtitles = yield * ffmpeg.createSubtitleFromAudio(audioPath);
```

### Transcript Storage

```typescript
import { TranscriptStorageService } from "@total-typescript/ffmpeg";

const storage = yield * TranscriptStorageService;

yield *
  storage.storeTranscript({
    transcript: "Video transcript content...",
    filename: "my-video",
  });
```

## AI Integration

### Article Generation

```typescript
import { articleFromTranscript } from "@total-typescript/ffmpeg";

// Generate articles from video transcripts
const article = yield * articleFromTranscript(transcript);
```

## Configuration

Set up environment variables:

```bash
export EXPORT_DIRECTORY="/path/to/exports"
export SHORTS_EXPORT_DIRECTORY="/path/to/shorts"
export TRANSCRIPTION_DIRECTORY="/path/to/transcripts"
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
```

## Package Structure

- **`workflows.ts`**: High-level video processing workflows
- **`ffmpeg-commands.ts`**: Core FFmpeg command wrappers
- **`silence-detection.ts`**: Audio analysis and clip detection
- **`subtitle-rendering.ts`**: Subtitle generation and overlay
- **`chapter-extraction.ts`**: Video marker and metadata parsing
- **`services.ts`**: Effect services for transcript storage and user interaction
- **`davinci-integration.ts`**: DaVinci Resolve workflow integration
- **`queue/`**: Background job processing system

## Dependencies

- **Effect**: Functional programming and error handling
- **@ai-sdk/openai** & **@ai-sdk/anthropic**: AI model integrations
- **@total-typescript/shared**: Shared utilities
- **OpenAI**: Direct OpenAI API access
- **Zod**: Runtime type validation

## Development

```bash
# Build the package
pnpm run build

# Run tests
pnpm run test
```

## Error Handling

The package includes comprehensive error types:

- `NoSpeakingClipsError`: No speech detected in video
- `FileAlreadyExistsError`: Output file conflicts
- `CouldNotCreateSpeakingOnlyVideoError`: Processing failures
- `FFMPegWithComplexFilterError`: FFmpeg command failures

## Related Packages

- `@total-typescript/shared`: Common utilities and types
- `packages/resolve-scripts`: DaVinci Resolve automation scripts
