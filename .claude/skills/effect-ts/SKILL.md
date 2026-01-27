# Effect-TS Patterns

Use this skill whenever writing Effect-TS code in this codebase.

## Services

Define services using `Effect.Service`. Services encapsulate business logic with dependency injection.

```typescript
export class MyService extends Effect.Service<MyService>()("MyService", {
  effect: Effect.gen(function* () {
    // Access dependencies
    const fs = yield* FileSystem.FileSystem;
    const config = yield* Config.string("SOME_CONFIG");
    const otherService = yield* OtherService;

    return {
      doSomething: Effect.fn("doSomething")(function* (param: string) {
        // Implementation using Effect.gen
      }),
    };
  }),
  dependencies: [NodeFileSystem.layer, OtherService.Default],
}) {}
```

Key points:

- Use `yield*` to access dependencies
- Define methods with `Effect.fn("methodName")` for tracing
- List dependencies in the `dependencies` array
- Access the service elsewhere with `yield* MyService`

## Tagged Errors

Define errors using `Data.TaggedError`. Always suffix error class names with "Error".

```typescript
export class FileReadError extends Data.TaggedError("FileReadError")<{
  cause: Error;
  path: string;
}> {}

export class QuestionNotAnsweredError extends Data.TaggedError(
  "QuestionNotAnsweredError",
)<{
  question: string;
}> {}
```

Key points:

- Include context fields for debugging
- Use descriptive, specific error names
- Error tag string must match class name

## Error Handling

Transform errors at boundaries:

```typescript
const content =
  yield *
  fs
    .readFileString(path)
    .pipe(Effect.mapError((e) => new FileReadError({ cause: e, path })));
```

Handle specific errors with `catchTag`:

```typescript
const result =
  yield *
  service
    .method()
    .pipe(
      Effect.catchTag("FileNotFoundError", (e) => Effect.succeed(defaultValue)),
    );
```

## Workflows

Orchestrate multiple services using `Effect.gen`:

```typescript
const myWorkflow = Effect.gen(function* () {
  const serviceA = yield* ServiceA;
  const serviceB = yield* ServiceB;

  yield* Effect.logInfo("Starting workflow");

  const resultA = yield* serviceA.doSomething();
  const resultB = yield* serviceB.process(resultA);

  return resultB;
});
```

## Layers

Compose application dependencies:

```typescript
const AppLayerLive = Layer.mergeAll(
  ServiceA.Default,
  ServiceB.Default,
  NodeFileSystem.layer,
);

// Run program with dependencies
Effect.runPromise(program.pipe(Effect.provide(AppLayerLive)));
```

## Config

Access environment variables with type safety:

```typescript
const apiKey = yield * Config.string("API_KEY");
const port = yield * Config.number("PORT");
const secret = yield * Config.redacted("SECRET_KEY"); // For sensitive values
```

## Parallel Processing

Run effects concurrently:

```typescript
const results =
  yield *
  Effect.all(
    items.map((item) => processItem(item)),
    { concurrency: 5 },
  );
```

Use `Effect.fork` for fine-grained parallelism:

```typescript
const fpsFork = yield * Effect.fork(ffmpeg.getFPS(videoPath));
const resolutionFork = yield * Effect.fork(ffmpeg.getResolution(videoPath));

// Do other work...

const fps = yield * fpsFork;
const resolution = yield * resolutionFork;
```
