# Effect Error Handling Patterns

## Error Transformation with mapError

Use `Effect.mapError` to transform errors into your own tagged error types:

```typescript
yield* Effect.tryPromise(() => someAsyncOperation())
  .pipe(
    Effect.mapError((e) => new MyOperationError({ cause: e }))
  );
```

## Safe Effect Execution with Either

Use `Effect.either` to convert failures into successful Either values:

```typescript
const result = yield* riskyOperation().pipe(Effect.either);

if (Either.isLeft(result)) {
  yield* Effect.logError("Operation failed", result.left);
  // Handle error
} else {
  // Use result.right
  const successValue = result.right;
}
```

## Error Recovery with catchAll

```typescript
const recoveredOperation = riskyOperation().pipe(
  Effect.catchAll((error) => {
    if (error._tag === "RetryableError") {
      return retryOperation();
    } else {
      return Effect.fail(error); // Re-throw non-retryable errors
    }
  })
);
```

## Conditional Error Handling with catchTag

```typescript
const handleSpecificErrors = operation().pipe(
  Effect.catchTag("NetworkError", (error) => {
    yield* Effect.logWarning("Network error, retrying...");
    return retryWithBackoff();
  }),
  Effect.catchTag("ValidationError", (error) => {
    yield* Effect.logError("Validation failed", { error });
    return Effect.fail(new WorkflowError({ cause: error }));
  })
);
```

## Error Propagation in Workflows

```typescript
const workflow = Effect.gen(function* () {
  // These operations can fail and errors will propagate automatically
  const config = yield* loadConfig().pipe(
    Effect.mapError((e) => new ConfigLoadError({ cause: e }))
  );
  
  const data = yield* fetchData(config).pipe(
    Effect.mapError((e) => new DataFetchError({ cause: e }))
  );
  
  const processed = yield* processData(data).pipe(
    Effect.mapError((e) => new ProcessingError({ cause: e }))
  );
  
  return processed;
});
```

## Retry Patterns

```typescript
import { Schedule } from "effect";

const retriedOperation = riskyOperation().pipe(
  Effect.retry(
    Schedule.exponential("100 millis").pipe(
      Schedule.compose(Schedule.recurs(3)) // Retry up to 3 times
    )
  ),
  Effect.mapError((e) => new MaxRetriesExceededError({ cause: e }))
);
```

## Resource Cleanup with ensuring

```typescript
const safeResourceOperation = Effect.gen(function* () {
  const resource = yield* acquireResource();
  
  const result = yield* useResource(resource).pipe(
    Effect.mapError((e) => new ResourceUsageError({ cause: e }))
  );
  
  return result;
}).pipe(
  Effect.ensuring(
    releaseResource().pipe(
      Effect.catchAll((e) => {
        // Log cleanup errors but don't fail the main operation
        return Effect.logError("Failed to cleanup resource", e);
      })
    )
  )
);
```

## Validation with Effect.fail

```typescript
const validateInput = (input: unknown) => Effect.gen(function* () {
  if (typeof input !== "string") {
    return yield* Effect.fail(
      new ValidationError({ 
        message: "Input must be a string",
        received: typeof input 
      })
    );
  }
  
  if (input.length === 0) {
    return yield* Effect.fail(
      new ValidationError({ 
        message: "Input cannot be empty" 
      })
    );
  }
  
  return input;
});
```

## Error Aggregation in Parallel Operations

```typescript
const parallelWithErrorHandling = Effect.gen(function* () {
  // Use Effect.allSuccesses to collect both successes and failures
  const results = yield* Effect.allSuccesses([
    operation1().pipe(Effect.either),
    operation2().pipe(Effect.either),
    operation3().pipe(Effect.either),
  ]);
  
  const successes = results.filter(Either.isRight).map((r) => r.right);
  const failures = results.filter(Either.isLeft).map((r) => r.left);
  
  if (failures.length > 0) {
    yield* Effect.logWarning(`${failures.length} operations failed`);
  }
  
  return { successes, failures };
});
```

## Service-Level Error Handling

```typescript
export class RobustService extends Effect.Service<RobustService>()("RobustService", {
  effect: Effect.gen(function* () {
    return {
      robustOperation: Effect.fn("robustOperation")(function* (input: string) {
        // Validate input
        if (!input) {
          return yield* Effect.fail(new InvalidInputError({ input }));
        }
        
        // Perform operation with error handling
        const result = yield* dangerousOperation(input).pipe(
          Effect.retry(Schedule.recurs(2)),
          Effect.mapError((e) => new OperationFailedError({ cause: e, input })),
          Effect.catchTag("OperationFailedError", (error) => {
            // Fallback operation
            yield* Effect.logWarning("Primary operation failed, using fallback");
            return fallbackOperation(input);
          })
        );
        
        return result;
      }),
    };
  }),
}) {}
```

## Testing Error Scenarios

```typescript
// Test that specific errors are thrown
test("should handle validation errors", async () => {
  const result = await Effect.runPromise(
    validateInput("").pipe(Effect.either)
  );
  
  expect(Either.isLeft(result)).toBe(true);
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("ValidationError");
  }
});
```

## Best Practices

1. **Use Tagged Errors**: Always use `Data.TaggedError` for custom errors
2. **Transform at Boundaries**: Use `mapError` to transform external errors
3. **Handle Specifically**: Use `catchTag` for specific error handling
4. **Log Appropriately**: Log errors at appropriate levels (error, warning, debug)
5. **Cleanup Resources**: Use `ensuring` for resource cleanup
6. **Validate Early**: Validate inputs early and fail fast
7. **Provide Context**: Include relevant context in error objects
8. **Test Error Paths**: Test both success and failure scenarios