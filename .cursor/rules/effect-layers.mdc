# Effect Layer Pattern

## When to use Layers

Use `Layer` to compose and manage dependencies in your Effect application. Layers provide a way to wire up services and their dependencies in a type-safe manner.

## Basic Layer Composition

```typescript
import { Layer } from "effect";
import { NodeFileSystem } from "@effect/platform-node";

export const AppLayerLive = Layer.mergeAll(
  // Custom services
  MyService.Default,
  AnotherService.Default,
  ThirdService.Default,
  
  // Platform layers
  NodeFileSystem.layer,
  
  // External service layers
  DatabaseLayer,
);
```

## Layer Dependencies

Services automatically contribute their dependencies to the layer:

```typescript
// This service requires FileSystem and Config
export class FileService extends Effect.Service<FileService>()("FileService", {
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const basePath = yield* Config.string("BASE_PATH");
    
    return {
      readFile: Effect.fn("readFile")(function* (filename: string) {
        return yield* fs.readFileString(path.join(basePath, filename));
      }),
    };
  }),
  dependencies: [NodeFileSystem.layer], // Explicit platform dependency
}) {}

// When using FileService in a layer, its dependencies are included
export const AppLayer = Layer.mergeAll(
  FileService.Default, // Includes NodeFileSystem.layer automatically
  OtherService.Default,
);
```

## Service Default Layers

Most services provide a `Default` layer that includes the service and its dependencies:

```typescript
// Preferred - uses Default layer
export const AppLayer = Layer.mergeAll(
  MyService.Default,
  AnotherService.Default,
);

// Avoid - manual layer creation unless needed
export const ManualLayer = Layer.mergeAll(
  Layer.effect(MyService, myServiceImplementation),
  Layer.effect(AnotherService, anotherServiceImplementation),
);
```

## Platform Layers

Common platform layers to include:

```typescript
import { NodeFileSystem } from "@effect/platform-node";
import { NodeHttpServer } from "@effect/platform-node";

export const AppLayer = Layer.mergeAll(
  // Your services
  MyService.Default,
  
  // Platform layers
  NodeFileSystem.layer,    // For file system operations
  NodeHttpServer.layer,    // For HTTP server
);
```

## Test Layers

Create separate layers for testing with mocked services:

```typescript
export const TestLayer = Layer.mergeAll(
  // Mock implementations
  Layer.succeed(FileService, {
    readFile: Effect.succeed("mocked file content"),
    writeFile: Effect.succeed(undefined),
  }),
  
  Layer.succeed(DatabaseService, {
    query: Effect.succeed([]),
    save: Effect.succeed({ id: "test" }),
  }),
);
```

## Environment-Specific Layers

```typescript
// Production layer
export const ProdLayer = Layer.mergeAll(
  ProductionDatabaseLayer,
  RealApiService.Default,
  LoggingService.Default,
);

// Development layer
export const DevLayer = Layer.mergeAll(
  LocalDatabaseLayer,
  MockApiService.Default,
  VerboseLoggingService.Default,
);

// Choose layer based on environment
export const AppLayer = process.env.NODE_ENV === "production" 
  ? ProdLayer 
  : DevLayer;
```

## Running Effects with Layers

```typescript
// Provide layer to effect before running
const program = Effect.gen(function* () {
  const service = yield* MyService;
  return yield* service.doSomething();
});

// Run with layer
Effect.runPromise(program.pipe(Effect.provide(AppLayerLive)));
```

## Layer Scoping

```typescript
// Scoped layer - resources are cleaned up automatically
export const ScopedResourceLayer = Layer.scoped(
  MyResource,
  Effect.gen(function* () {
    const resource = yield* acquireResource();
    yield* Effect.addFinalizer(() => releaseResource(resource));
    return resource;
  })
);
```

## Layer Composition Patterns

### Sequential Dependencies
```typescript
// ServiceB depends on ServiceA
export const LayerWithDependencies = Layer.mergeAll(
  ServiceA.Default,
  ServiceB.Default, // ServiceB.dependencies includes ServiceA
);
```

### Conditional Layers
```typescript
const conditionalLayer = Config.string("FEATURE_FLAG").pipe(
  Effect.map((flag) => 
    flag === "enabled" 
      ? FeatureEnabledLayer 
      : FeatureDisabledLayer
  ),
  Layer.unwrapEffect
);
```

## Best Practices

1. **Use Default Layers**: Prefer `Service.Default` over manual layer creation
2. **Group Related Services**: Create logical groupings of related services
3. **Platform Layers Last**: Include platform layers (NodeFileSystem, etc.) at the end
4. **Test Layers**: Create separate test layers with mocked implementations
5. **Environment Awareness**: Use different layers for different environments
6. **Dependency Management**: Let services declare their own dependencies