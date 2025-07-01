# Fix: Empty Links Request Bug

## Problem
When the links are requested, if no links are required (empty `linkRequests` array), the queue item was still marked as requiring user information. This meant that `processInformationRequests` would try to ask the user for input even when no links were actually needed.

## Root Cause
The `processInformationRequests` function in `packages/ffmpeg/src/queue/queue.ts` didn't check if the `linkRequests` array was empty before processing. It would always try to ask the user for links, even when the array was empty.

## Solution
Added a check in `processInformationRequests` to handle empty `linkRequests` arrays:

1. **Before processing**: Check if `queueItem.action.linkRequests.length === 0`
2. **If empty**: Mark the item as completed immediately without asking for user input
3. **If not empty**: Continue with the existing flow to ask for user input

## Changes Made

### 1. Updated `processInformationRequests` function
- Added conditional logic to check for empty `linkRequests` arrays
- If empty: log "No links required - marking as completed" and complete the item
- If not empty: proceed with existing user input flow
- Both paths call `linkStorage.addLinks()` (with empty array for empty requests)

### 2. Added comprehensive tests
- `Should mark links-request items as completed when linkRequests array is empty`
- `Should process mixed links-request items (some empty, some with links)`

## Test Results
- ✅ All existing tests continue to pass
- ✅ New tests verify the fix works correctly
- ✅ Mixed scenarios (some empty, some with links) work as expected

## Behavior After Fix
- **Empty linkRequests**: Item marked as "completed" immediately, no user interaction required
- **Non-empty linkRequests**: Existing behavior unchanged - user prompted for each link
- **Mixed scenarios**: Each item processed according to its content (empty vs non-empty)

This fix ensures that queue items with empty link requests don't unnecessarily block the queue waiting for user input that isn't actually needed.