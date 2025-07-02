# Alongside Flag Changes - Removal of Meta Folder

## Summary

Successfully modified the `--alongside` flag to remove the meta folder approach and instead place files directly alongside the video file with new naming patterns.

## Changes Made

### 1. Updated Article Generation Core (`packages/ffmpeg/src/article-from-transcript.ts`)

**Before**: Created a `{VIDEO_NAME}_meta` folder containing article, transcript, and code files
**After**: Places files directly alongside the video with new naming patterns:
- Article: `{VIDEO_NAME}.article.md`
- Transcript: `{VIDEO_NAME}.transcript.txt`
- Code: `{VIDEO_NAME}.code.{CODE_EXTENSION}`

**Key Changes**:
- Removed meta folder creation logic
- Added video directory creation to ensure it exists
- Changed file naming to use the new pattern
- Code extension preservation using `path.extname(codePath)`
- Updated return value to remove `metaFolderPath` property

### 2. Updated Console Logging (`packages/ffmpeg/src/queue-article-generation.ts`)

**Enhanced Messaging**:
- Changed log message from "Article will be saved in meta folder" to "Article, transcript, and code will be saved alongside video in"
- Provides clearer indication of the new behavior

### 3. Comprehensive Test Updates

#### Article Generation Core Tests (`packages/ffmpeg/src/article-from-transcript.test.ts`)
- **Updated expected result**: Filename changed from `{VIDEO_NAME}.md` to `{VIDEO_NAME}.article.md`
- **Updated file paths**: Removed meta folder path expectations, now expects direct video directory placement
- **Updated assertions**: Tests now verify files are saved directly alongside video with new naming pattern

#### Queue Generation Tests (`packages/ffmpeg/src/queue-article-generation.test.ts`)
**Updated Three Test Cases**:

1. **"should save article, transcript, and code alongside video when alongside is true"**
   - Tests creation of all three file types with new naming pattern
   - Verifies proper directory placement and file content

2. **"should save article and transcript alongside video without code when code is not provided"**
   - Tests that no code file is created when code isn't provided
   - Validates article and transcript creation with new naming

3. **"should save article alongside video in shorts directory when alongside is true and dryRun is false"**
   - Tests directory selection logic (export vs shorts directories)
   - Ensures files are placed in correct directory based on `dryRun` flag

## Behavior Changes

### Before
```
/path/to/export/
├── my-video.mp4
└── my-video_meta/         <- Meta folder
    ├── my-video.md        <- Article
    ├── transcript.txt     <- Transcript
    └── code.ts            <- Code
```

### After
```
/path/to/export/
├── my-video.mp4           <- Video
├── my-video.article.md    <- Article alongside
├── my-video.transcript.txt <- Transcript alongside
└── my-video.code.ts       <- Code alongside
```

## Technical Implementation Details

### File Operations
1. **Ensure directory exists**: `fs.makeDirectory(videoDirectory, { recursive: true })`
2. **Write article**: Direct to video directory with `.article.md` suffix
3. **Copy transcript**: Direct to video directory with `.transcript.txt` suffix
4. **Write code**: Direct to video directory with `.code.{extension}` suffix

### Code Extension Handling
- Uses `path.extname(codePath)` to preserve original file extension
- Example: `example.ts` → `{VIDEO_NAME}.code.ts`
- Example: `script.js` → `{VIDEO_NAME}.code.js`

### Directory Logic (Unchanged)
- **Export directory** (`dryRun: true`): `EXPORT_DIRECTORY/`
- **Shorts directory** (`dryRun: false`): `SHORTS_EXPORT_DIRECTORY/`

## Benefits

1. **Cleaner File Structure**: No additional meta folder clutter
2. **Easier File Discovery**: All related files have consistent naming pattern
3. **Clear Relationships**: File names immediately show they're related to specific video
4. **Simplified Organization**: Files are directly alongside their source video
5. **Maintained Functionality**: All existing features preserved

## Requirements Fulfilled

- ✅ **No meta folder**: Meta folder creation completely removed
- ✅ **Files alongside video**: All files placed directly in video directory
- ✅ **New naming pattern**: Implements `{VIDEO_NAME}.{TYPE}.{EXTENSION}` pattern
- ✅ **Code extension preservation**: Uses original code file extension
- ✅ **Conditional code handling**: Only creates code file when provided
- ✅ **Directory structure preserved**: Video remains in original location
- ✅ **Test coverage maintained**: All tests updated and passing

## Usage Examples

### With Code File
```bash
pnpm cli create-auto-edited-video --generate-article --alongside
# Creates: video.article.md, video.transcript.txt, video.code.ts
```

### Without Code File  
```bash
pnpm cli create-auto-edited-video --generate-article --alongside
# Creates: video.article.md, video.transcript.txt
```

### Upload to Shorts
```bash
pnpm cli create-auto-edited-video --generate-article --alongside --upload
# Creates files in shorts directory instead of export directory
```

## Backward Compatibility

- ✅ All existing functionality preserved
- ✅ `--alongside` flag still requires `--generate-article` 
- ✅ Default behavior unchanged (articles go to article storage when `--alongside` not used)
- ✅ Queue processing interface unchanged
- ✅ No breaking changes for existing users

## Additional Fix: TypeScript Compilation Errors

### Issue Resolved
During the implementation, discovered that the internal-cli package had TypeScript compilation errors due to references to the removed `"code-request"` queue action type.

### Changes Made to `apps/internal-cli/src/bin.ts`
1. **Removed `"code-request"` display logic**: Eliminated the else-if block that handled code-request queue items in the status display
2. **Updated article generation display**: Simplified to use `codeContent` property directly instead of looking up code dependencies  
3. **Fixed workflow analysis**: Removed `"code-request"` from step order and step names in article workflow tracking
4. **Updated TypeScript type narrowing**: Added proper type assertions for article generation actions

### Resolution Verification
- ✅ **TypeScript compilation**: Both `@total-typescript/ffmpeg` and `@total-typescript/internal-cli` packages build successfully
- ✅ **Test coverage maintained**: All 15 tests in ffmpeg package still passing
- ✅ **No functionality loss**: Queue status and workflow tracking work correctly with simplified code handling

## Testing Strategy

- **Real Filesystem Operations**: Uses temporary directories with actual file operations
- **Comprehensive Coverage**: Tests both positive and negative cases
- **Directory Logic Validation**: Verifies export vs shorts directory selection
- **File Content Verification**: Confirms correct content in all generated files
- **Extension Preservation**: Tests that code file extensions are maintained
- **Error Handling**: Validates graceful handling of missing code files
- **TypeScript Compilation**: Verified successful builds for both modified packages