# Information Requests Queue Implementation

## Overview
I have successfully implemented the ability to add and process information requests in the queue system. Information requests are items with `action.type === "links-request"` that have a status of `"requires-user-input"`.

## New Functions Added

### In `packages/ffmpeg/src/queue/queue.ts`:

1. **`getOutstandingInformationRequests()`**
   - Returns all queue items that are information requests with `"requires-user-input"` status
   - Filters the queue to find only `"links-request"` type items that need user input

2. **`processInformationRequests()`**
   - Checks for outstanding information requests
   - If found, processes only those items (ignoring other queue items)
   - Prompts user for each link request and stores the responses
   - Updates each processed item to `"completed"` status
   - Uses queue locking to prevent concurrent processing

## New CLI Command

### `process-information-requests` (aliases: `pir`, `info-requests`)

**Usage:**
```bash
# Check for and process outstanding information requests
pnpm cli process-information-requests

# Using short alias
pnpm cli pir
```

**Behavior:**
- Checks if there are any outstanding information requests in the queue
- If none found, displays message and exits
- If found, displays count and processes each one interactively
- Only processes information requests, leaving other queue items untouched

## Implementation Details

1. **Queue Filtering**: The new functionality specifically targets `"links-request"` items with `"requires-user-input"` status
2. **Isolation**: Processing information requests doesn't affect other queue items like video processing jobs
3. **User Interaction**: Prompts user for each link request and stores the responses in the links storage service
4. **Queue Locking**: Uses the existing queue lock mechanism to prevent concurrent processing
5. **Error Handling**: Properly handles cases where no information requests are found
6. **Modified `processQueue`**: The main `processQueue` function now **ignores** items with `"requires-user-input"` status entirely, leaving them only for the dedicated `processInformationRequests` function
7. **Modified `getNextQueueItem`**: Also updated to skip items with `"requires-user-input"` status to maintain consistency
8. **Status-based Filtering**: Exclusion is now based on status (`"requires-user-input"`) rather than action type, making it more general and future-proof

## Testing

Added comprehensive tests to verify:
- `getOutstandingInformationRequests()` correctly filters queue items
- `processInformationRequests()` processes only information requests while leaving other items unchanged
- Links are properly stored when processing information requests
- Non-information-request queue items remain unprocessed

## Integration

The new functions are automatically exported through the existing `export * from "./queue/queue.js";` in the ffmpeg package index, making them available to the CLI without additional export changes.

## Example Workflow

1. Information requests get added to the queue (via existing mechanisms)
2. User runs `pnpm cli process-information-requests`
3. CLI checks for outstanding information requests
4. If found, user is prompted for each link request
5. Responses are stored and queue items are marked as completed
6. Other queue items (like video processing) remain untouched

## Important Behavior Changes

### 1. Queue Processing Logic
**Before**: The `processQueue` function would process information requests when `hasUserInput: true` was set.

**After**: The `processQueue` function now **completely ignores** items with `"requires-user-input"` status. These items can only be processed using the dedicated `process-information-requests` CLI command.

### 2. Status Terminology
**Before**: Queue items used `"idle"` status for items ready to process.

**After**: Queue items now use `"ready-to-run"` status for items ready to process (more descriptive).

### 3. Function Signatures
**Before**: `processQueue({ hasUserInput: boolean })` and `getNextQueueItem(queueState, { hasUserInput: boolean })`

**After**: `processQueue()` and `getNextQueueItem(queueState)` - no longer need hasUserInput parameter.

This ensures clear separation of concerns:
- `processQueue` handles video processing and other items with `"ready-to-run"` status
- `processInformationRequests` handles only items with `"requires-user-input"` status

This implementation provides exactly what was requested: a way to check for and process only information requests in the queue, without affecting other queue items.