# Article Generation Workflow Implementation Plan

## Overview

This plan implements a new option for the `create auto-edited video` workflow that automatically generates articles from video transcripts using a queue-based approach. The implementation will span multiple PRs to ensure manageable context windows.

## Current Infrastructure Analysis

### Existing Components
- ✅ Queue system with dependencies and action types
- ✅ Video creation workflow with transcript storage
- ✅ Article generation from transcript functionality (interactive)
- ✅ Links storage service and AI link request generation
- ✅ Information request processing for links
- ✅ Article and transcript storage services

### Current Flow
1. User runs `create auto-edited video` command
2. Queue item created for video processing
3. Video processed, transcript stored (if subtitles disabled)
4. Separate interactive `article-from-transcript` command exists

## New Workflow Design

### Enhanced Flow
1. User runs `create auto-edited video --generate-article` command
2. Video creation queue item added (unchanged)
3. **NEW**: Transcript analysis queue item added (depends on video completion)
4. **NEW**: Code request queue item added (depends on transcript analysis)
5. **NEW**: Links request queue item added (depends on code request)
6. **NEW**: Article generation queue item added (depends on links completion)

## Implementation Plan

### Phase 1: Queue System Extensions
**PR Size**: Medium (Single context window)
**Estimated Lines**: ~300-400

#### Files to Modify:
- `packages/ffmpeg/src/queue/queue.ts`
- `packages/ffmpeg/src/queue/queue.test.ts`

#### Changes:
1. **Add new queue action types**:
   ```typescript
   | {
       type: "analyze-transcript-for-links";
       transcriptPath: AbsolutePath;
       originalVideoPath: AbsolutePath;
     }
   | {
       type: "code-request";
       transcriptPath: AbsolutePath;
       originalVideoPath: AbsolutePath;
     }
   | {
       type: "generate-article-from-transcript";
       transcriptPath: AbsolutePath;
       originalVideoPath: AbsolutePath;
       linksDependencyId: string;
       codeDependencyId: string;
     }
   ```

2. **Extend queue item structure** to support temporary data storage:
   ```typescript
   export type QueueItem = {
     id: string;
     createdAt: number;
     completedAt?: number;
     action: QueueItemAction;
     dependencies?: string[];
     status: "ready-to-run" | "completed" | "failed" | "requires-user-input";
     error?: string;
     // NEW: Temporary data storage for workflow context
     temporaryData?: {
       codePath?: string;
       codeContent?: string;
       linkRequests?: string[];
     };
   };
   ```

3. **Extend `processQueue` function** to handle new action types
4. **Add comprehensive unit tests** for new queue actions and dependencies
5. **Update TypeScript types** for queue system

#### Key Functions to Implement:
- Queue processing for transcript analysis
- Queue processing for code requests (user input)
- Queue processing for article generation  
- Temporary data storage and retrieval in queue items
- Dependency chain validation tests
- Error handling for failed queue items

---

### Phase 2: CLI Integration
**PR Size**: Small-Medium (Single context window)
**Estimated Lines**: ~150-200

#### Files to Modify:
- `apps/internal-cli/src/bin.ts`

#### Changes:
1. **Add `--generate-article` flag** to `create-auto-edited-video` command
2. **Modify command action** to conditionally add article generation queue items
3. **Update command description** and help text

#### Implementation Details:
- Flag should be optional (default: false)
- When enabled, adds 4 additional queue items with proper dependencies:
  1. Video creation (existing, unchanged)
  2. Transcript analysis (depends on video)
  3. Code request (depends on transcript analysis)
  4. Links request (depends on code request)  
  5. Article generation (depends on links request)

---

### Phase 3: Transcript Analysis and Code Request Services
**PR Size**: Medium (Single context window)
**Estimated Lines**: ~300-350

#### Files to Create/Modify:
- `packages/ffmpeg/src/transcript-analysis.ts` (new)
- `packages/ffmpeg/src/transcript-analysis.test.ts` (new)
- `packages/ffmpeg/src/queue/queue.ts` (modify - add code request processing)
- `packages/ffmpeg/src/index.ts` (export new functions)

#### Changes:
1. **Create `analyzeTranscriptForLinks` function**:
   - Takes transcript path and original video path
   - Uses AI service to generate link requests
   - Returns link requests for queue processing
   - Non-interactive (queue-friendly)

2. **Add code request processing to queue**:
   - Extend `processInformationRequests` to handle code requests
   - New action type: `"code-request"` with status `"requires-user-input"`
   - Prompt user for code file path (optional, can be empty)
   - Read code file content and store in queue item's temporaryData
   - Handle empty/invalid file paths gracefully (store empty string)
   - Update queue item status to `"completed"` when done

3. **Add error handling**:
   - File not found errors
   - AI service failures
   - Empty transcript handling
   - Invalid code file paths

4. **Add comprehensive unit tests**:
   - Happy path scenarios
   - Error conditions
   - Mock AI service responses
   - Code request processing tests

#### Key Functions:
```typescript
export const analyzeTranscriptForLinks = Effect.fn("analyzeTranscriptForLinks")(
  function* (opts: {
    transcriptPath: AbsolutePath;
    originalVideoPath: AbsolutePath;
  }) {
    // Implementation
  }
);

// New queue action type for code requests
type CodeRequestAction = {
  type: "code-request";
  transcriptPath: AbsolutePath;
  originalVideoPath: AbsolutePath;
};
```

---

### Phase 4: Queue-Based Article Generation
**PR Size**: Medium-Large (Single context window)
**Estimated Lines**: ~350-400

#### Files to Create/Modify:
- `packages/ffmpeg/src/queue-article-generation.ts` (new)
- `packages/ffmpeg/src/queue-article-generation.test.ts` (new)
- `packages/ffmpeg/src/article-from-transcript.ts` (modify)

#### Changes:
1. **Create queue-friendly article generation**:
   - Non-interactive version of existing functionality
   - Uses stored links instead of prompting user
   - Retrieves code content from queue temporaryData
   - Handles missing links and code gracefully

2. **Modify existing `generateArticleFromTranscript`**:
   - Extract common logic into shared utilities
   - Support both interactive and queue modes
   - Maintain backward compatibility

3. **Add queue integration**:
   - Function to process article generation queue items
   - Link dependency resolution
   - Code content retrieval from dependency queue items
   - Error handling and retry logic

4. **Add dependency data retrieval**:
   - Helper functions to get code content from completed queue items
   - Link collection from stored links service
   - Graceful handling when dependencies are missing

#### Key Functions:
```typescript
export const generateArticleFromTranscriptQueue = Effect.fn(
  "generateArticleFromTranscriptQueue"
)(function* (opts: {
  transcriptPath: AbsolutePath;
  originalVideoPath: AbsolutePath;
  codeDependencyId: string;
  linksDependencyId: string;
}) {
  // Queue-optimized implementation
  // Retrieves code from queue temporaryData
  // Uses stored links from LinksStorageService
});

const getCodeFromQueueItem = Effect.fn("getCodeFromQueueItem")(
  function* (queueItemId: string): Effect<string | undefined> {
    // Helper to retrieve code content from completed queue item
  }
);
```

---

### Phase 5: Integration and Testing
**PR Size**: Medium (Single context window)
**Estimated Lines**: ~200-250

#### Files to Modify:
- `packages/ffmpeg/src/queue/queue.ts` (integrate new processors)
- `packages/ffmpeg/src/workflows.ts` (update createAutoEditedVideoWorkflow)
- Integration tests

#### Changes:
1. **Update main queue processor** to handle new action types
2. **Add integration tests** for complete workflow
3. **Update workflow service** if needed
4. **Add end-to-end test scenarios**

#### Test Scenarios:
- Complete workflow with article generation (with code)
- Complete workflow with article generation (without code)
- Workflow with code request failures
- Workflow with link request failures
- Workflow with article generation failures
- Dependency chain validation
- TemporaryData storage and retrieval

---

### Phase 6: Documentation and Error Handling
**PR Size**: Small (Single context window)
**Estimated Lines**: ~100-150

#### Files to Create/Modify:
- `README.md` updates
- Error handling improvements
- CLI help text updates

#### Changes:
1. **Update documentation**:
   - New CLI flag documentation
   - Queue workflow explanation
   - Troubleshooting guide

2. **Enhance error handling**:
   - Better error messages
   - Recovery strategies
   - User-friendly error reporting

3. **Add logging and monitoring**:
   - Progress indicators
   - Debug logging
   - Performance metrics

## Technical Considerations

### Queue Dependencies
```
create-auto-edited-video (id: video-1)
    ↓
analyze-transcript-for-links (id: analysis-1, depends: [video-1])
    ↓
code-request (id: code-1, depends: [analysis-1])
    ↓  
links-request (id: links-1, depends: [code-1])
    ↓
generate-article-from-transcript (id: article-1, depends: [links-1, code-1])
```

### Temporary Data Flow
```
code-request (id: code-1) → temporaryData: { codePath, codeContent }
    ↓
generate-article-from-transcript retrieves code from code-1.temporaryData
```

### Error Handling Strategy
- **Video creation fails**: Stop entire workflow
- **Transcript analysis fails**: Continue without article
- **Code request fails**: Generate article without code
- **Links request fails**: Generate article without links
- **Article generation fails**: Log error, continue workflow

### Configuration
- New environment variables for article generation settings
- Feature flags for enabling/disabling functionality
- Configurable timeouts and retry logic

## Testing Strategy

### Unit Tests
- All new functions isolated
- Mock services and dependencies
- Error condition coverage
- Edge case handling

### Integration Tests  
- Complete workflow scenarios
- Queue dependency validation
- Service interaction testing
- Error propagation testing

### End-to-End Tests
- CLI command with new flag
- Full workflow execution
- User interaction simulation
- File system validation

## Backward Compatibility

### Existing Functionality
- ✅ All existing commands work unchanged
- ✅ Existing queue items process normally
- ✅ Interactive article generation preserved
- ✅ No breaking changes to APIs

### Migration Strategy
- Feature is opt-in via CLI flag
- Existing workflows unaffected
- Gradual rollout possible
- Easy rollback if needed

## Success Criteria

### Functional Requirements
- [ ] CLI flag `--generate-article` works correctly
- [ ] Queue processes all new action types (analyze-transcript, code-request, generate-article)
- [ ] Dependencies enforced properly
- [ ] Code requests processed correctly (user prompted for file path)
- [ ] Code content stored in queue temporaryData
- [ ] Articles generated automatically with code and links
- [ ] Links integrated correctly
- [ ] Error handling robust for all steps

### Non-Functional Requirements  
- [ ] All changes fit in single context windows
- [ ] Comprehensive test coverage (>95%)
- [ ] No performance degradation
- [ ] Clear documentation
- [ ] Maintainable code structure

## Rollout Plan

### Development Phase
1. Implement phases 1-6 sequentially
2. Code review for each PR
3. Unit test validation
4. Integration testing

### Testing Phase
1. Manual testing of complete workflow
2. Performance testing
3. Error scenario validation
4. User acceptance testing

### Deployment Phase
1. Feature flag deployment
2. Gradual user rollout
3. Monitoring and logging
4. Full deployment after validation

## Risk Mitigation

### Technical Risks
- **Queue system complexity**: Comprehensive testing and validation
- **AI service failures**: Robust error handling and fallbacks
- **File system operations**: Proper error handling and cleanup
- **Dependency management**: Clear dependency tracking and validation

### User Experience Risks
- **Complex CLI**: Clear documentation and help text
- **Long processing times**: Progress indicators and async processing
- **Failed article generation**: Graceful degradation and error messages

## Implementation Notes

### Code Organization
- Keep queue logic separate from business logic
- Use existing service patterns for information requests (code requests follow links pattern)
- Follow Effect-based functional programming
- Maintain consistent error handling
- TemporaryData should be cleaned up after workflow completion
- Code content stored in queue state, not permanently persisted

### Performance Considerations
- Async processing for long-running operations
- Proper resource cleanup
- Memory usage optimization
- Queue processing efficiency

### Monitoring and Observability
- Detailed logging for debugging
- Performance metrics collection
- Error tracking and alerting
- User activity monitoring

---

This plan provides a comprehensive roadmap for implementing the article generation feature while ensuring each phase can be completed within a single LLM context window and maintains high code quality and testability.