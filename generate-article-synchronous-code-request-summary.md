# Generate Article Workflow: Synchronous Code Request Implementation

## Summary

Successfully converted the generate article workflow from using an asynchronous code request to a synchronous code request that happens at video submission time. This ensures users provide the code file when they have the most context available.

## Key Changes Made

### 1. CLI Command (`apps/internal-cli/src/bin.ts`)

**Before**: Code was requested asynchronously via a separate `code-request` queue item that users had to process with `pnpm cli process-info-requests`.

**After**: Code is requested synchronously when the user runs `create-auto-edited-video --generate-article`:

```typescript
// If article generation is enabled, ask for code file synchronously
let codeContent = "";
let codePath = "";

if (options.generateArticle) {
  yield* Console.log("📝 Article generation enabled");
  
  const fs = yield* FileSystem.FileSystem;
  const providedCodePath = yield* askQuestion.askQuestion(
    "📂 Code file path (optional, press Enter to skip): ",
    { optional: true }
  );

  if (providedCodePath.trim()) {
    codePath = providedCodePath.trim();
    const codeExists = yield* fs.exists(codePath);
    
    if (codeExists) {
      codeContent = yield* fs.readFileString(codePath);
      yield* Console.log(`✅ Code file loaded: ${codePath} (${codeContent.length} characters)`);
    } else {
      yield* Console.log(`⚠️  Warning: Code file ${codePath} does not exist`);
      codePath = ""; // Reset path if file doesn't exist
    }
  } else {
    yield* Console.log(`ℹ️  No code file provided - continuing without code examples`);
  }
}
```

### 2. Queue Creation (`packages/ffmpeg/src/queue-creation.ts`)

**Before**: Created 5 queue items including a separate `code-request` item:
1. Video creation
2. Transcript analysis  
3. Code request (async)
4. Links request
5. Article generation

**After**: Creates 4 queue items with code passed directly:
1. Video creation
2. Transcript analysis
3. Links request  
4. Article generation (with code included)

**Key Changes**:
- Added `codeContent` and `codePath` to the `CreateAutoEditedVideoQueueItemsOptions` interface
- Removed the `code-request` queue item entirely
- Updated `generate-article-from-transcript` action to include `codeContent` and `codePath` properties

### 3. Queue Types (`packages/ffmpeg/src/queue/queue.ts`)

**Before**:
```typescript
| {
    type: "code-request";
    transcriptPath: AbsolutePath;
    originalVideoPath: AbsolutePath;
    temporaryData?: {
      codePath?: string;
      codeContent?: string;
    };
  }
| {
    type: "generate-article-from-transcript";
    transcriptPath: AbsolutePath;
    originalVideoPath: AbsolutePath;
    linksDependencyId: string;
    codeDependencyId: string;
    videoName: string;
    dryRun: boolean;
    alongside: boolean;
  }
```

**After**:
```typescript
| {
    type: "generate-article-from-transcript";
    transcriptPath: AbsolutePath;
    originalVideoPath: AbsolutePath;
    linksDependencyId: string;
    videoName: string;
    dryRun: boolean;
    alongside: boolean;
    codeContent: string;
    codePath: string;
  }
```

### 4. Article Generation (`packages/ffmpeg/src/queue-article-generation.ts`)

**Before**: Used `codeDependencyId` to look up code from a separate queue item's temporary data.

**After**: Uses directly provided `codeContent` and `codePath` parameters:

```typescript
export const generateArticleFromTranscriptQueue = Effect.fn(
  "generateArticleFromTranscriptQueue"
)(function* (opts: {
  transcriptPath: AbsolutePath;
  originalVideoPath: AbsolutePath;
  linksDependencyId: string;
  queueState: QueueState;
  videoName?: string;
  dryRun?: boolean;
  alongside?: boolean;
  codeContent?: string; // NEW
  codePath?: string;    // NEW
}) {
  // ... implementation uses codeContent directly
})
```

### 5. Queue Processing

**Before**: Had special handling for `code-request` items in the `processInformationRequests` function.

**After**: Removed all `code-request` processing logic since we no longer create those queue items.

### 6. Information Requests

**Before**: `getOutstandingInformationRequests` looked for both `links-request` and `code-request` items.

**After**: Only looks for `links-request` items:

```typescript
const informationRequests = queueState.queue.filter(
  (item) =>
    item.action.type === "links-request" &&
    item.status === "requires-user-input" &&
    // Check dependencies...
);
```

## Benefits

### 1. **Better User Experience**
- Users provide code context at the optimal time (when submitting the video)
- No need to remember to run separate `process-info-requests` command
- Immediate feedback if code file doesn't exist

### 2. **Simplified Workflow**
- Reduced from 5 queue items to 4 queue items
- Eliminated complex dependency chain involving code requests
- Removed async user input step

### 3. **Better Context**
- Users have maximum context when providing code file path
- No context switching between video submission and code provision
- More natural workflow progression

## User Flow Comparison

### Before (Asynchronous)
1. `pnpm cli create-auto-edited-video --generate-article`
2. Video gets queued for processing
3. Separately: `pnpm cli process-info-requests` 
4. User provides code file path (with less context)
5. Article generation completes

### After (Synchronous)  
1. `pnpm cli create-auto-edited-video --generate-article`
2. **Immediately prompted for code file path**
3. Video and article generation queue together
4. Article generation completes automatically

## Backward Compatibility

- All existing functionality remains unchanged
- Interactive `article-from-transcript` command still works
- No breaking changes to non-article generation workflows
- Environment and configuration requirements unchanged

## Files Modified

1. `apps/internal-cli/src/bin.ts` - Added synchronous code request
2. `packages/ffmpeg/src/queue-creation.ts` - Updated queue item creation
3. `packages/ffmpeg/src/queue/queue.ts` - Removed code-request type, updated processing
4. `packages/ffmpeg/src/queue-article-generation.ts` - Updated function signatures
5. Updated test files to match new behavior

## Testing

- Updated all test files to remove `code-request` references
- Tests now validate the new synchronous code provision pattern
- Maintained test coverage for all article generation scenarios

This implementation successfully addresses the user's concern about asking for code at the optimal time when users have the most context available.