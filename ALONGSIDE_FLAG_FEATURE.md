# Alongside Flag Feature

## Summary

Added a new `--alongside` flag to the `create-auto-edited-video` command that allows saving generated articles alongside the finished video instead of in the separate article storage directory.

## Usage

```bash
# Default behavior - saves to article storage directory with numbered filename
pnpm cli create-auto-edited-video --generate-article

# New behavior - saves alongside the video with video's name
pnpm cli create-auto-edited-video --generate-article --alongside

# Works with other flags
pnpm cli create-auto-edited-video --generate-article --alongside --upload --no-subtitles
```

## Behavior

### Default Article Generation (`--generate-article` only)
- Articles saved to: `ARTICLE_STORAGE_PATH`
- Filename format: `001-article-title.md`, `002-next-article.md`, etc.
- Purpose: Iterative improvement of article generation over time

### Alongside Article Generation (`--generate-article --alongside`)
- Articles saved to: Same directory as finished video
- Filename format: `{videoName}.md` (matches video name)
- Purpose: Quick reference alongside finished video for scratch workflows

## Technical Implementation

### Files Modified

1. **`apps/internal-cli/src/bin.ts`**
   - Added `--alongside` flag option
   - Added validation to ensure alongside is only used with generate-article
   - Updated queue item creation to pass alongside parameter

2. **`packages/ffmpeg/src/queue-creation.ts`**
   - Added `alongside` parameter to `CreateAutoEditedVideoQueueItemsOptions`
   - Updated queue item creation to include `alongside`, `videoName`, and `dryRun` in article generation action

3. **`packages/ffmpeg/src/queue/queue.ts`**
   - Updated `generate-article-from-transcript` queue item type to include new fields
   - Queue processing already handles the new structure automatically

4. **`packages/ffmpeg/src/article-from-transcript.ts`**
   - Enhanced `generateArticleCore` with `storageMode` parameter
   - Added support for `alongside-video` storage mode
   - Determines video directory based on `dryRun` flag (export vs shorts directory)

5. **`packages/ffmpeg/src/queue-article-generation.ts`**
   - Updated functions to accept and handle alongside parameters
   - Added logic to determine video directory and save article with video name

### Directory Logic

The alongside functionality determines where to save the article based on the video location:

- **Dry Run** (`--no-upload`): Video in `EXPORT_DIRECTORY` → Article saved to `EXPORT_DIRECTORY/{videoName}.md`
- **Upload** (`--upload`): Video in `SHORTS_EXPORT_DIRECTORY` → Article saved to `SHORTS_EXPORT_DIRECTORY/{videoName}.md`

## Benefits

1. **Workflow Flexibility**: Choose between improvement-focused storage vs quick-reference alongside storage
2. **Easy Discovery**: Articles are right next to their corresponding videos
3. **Scratch Mode**: Perfect for workflows where you want a lightly edited transcript with the video
4. **No Breaking Changes**: Default behavior remains unchanged

## Example Output

### Default Mode
```
/path/to/articles/
├── 001-typescript-generics-explained.md
├── 002-react-hooks-deep-dive.md
└── 003-effect-error-handling.md
```

### Alongside Mode
```
/path/to/exports/
├── my-awesome-video.mp4
├── my-awesome-video.md
├── another-video.mp4
└── another-video.md

/path/to/shorts/
├── uploaded-video.mp4
└── uploaded-video.md
```

## Validation

- The `--alongside` flag can only be used with `--generate-article`
- Clear error message and help text if used incorrectly
- Automatic directory detection based on upload flag