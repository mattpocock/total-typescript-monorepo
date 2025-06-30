# Effect Service Pattern

## When to use Effect.Service

Use `Effect.Service` to create reusable, injectable services that encapsulate related functionality. Services provide dependency injection and make code more testable and modular.

## Basic Service Pattern

```typescript
import { Effect } from "effect";

export class MyService extends Effect.Service<MyService>()("MyService", {
  effect: Effect.gen(function* () {
    // Service initialization
    const dependency = yield* SomeDependency;
    
    return {
      // Service methods
      doSomething: Effect.fn("doSomething")(function* (param: string) {
        // Implementation
        return result;
      }),
      
      anotherMethod: Effect.fn("anotherMethod")(function* () {
        // Implementation
      }),
    };
  }),
  dependencies: [SomeDependency.Default], // Optional dependencies
}) {}
```

## Service with Configuration

```typescript
export class ConfigurableService extends Effect.Service<ConfigurableService>()("ConfigurableService", {
  effect: Effect.gen(function* () {
    const apiKey = yield* Config.redacted(Config.string("API_KEY"));
    const baseUrl = yield* Config.string("BASE_URL");
    
    return {
      makeRequest: Effect.fn("makeRequest")(function* (endpoint: string) {
        // Use configuration
        const url = `${baseUrl}/${endpoint}`;
        // Implementation
      }),
    };
  }),
}) {}
```

## Service Dependencies

### Explicit Dependencies
```typescript
export class DependentService extends Effect.Service<DependentService>()("DependentService", {
  effect: Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem;
    const config = yield* Config.string("SOME_CONFIG");
    
    return {
      processFile: Effect.fn("processFile")(function* (path: string) {
        // Use dependencies
      }),
    };
  }),
  dependencies: [NodeFileSystem.layer], // Platform dependencies
}) {}
```

### Service-to-Service Dependencies
```typescript
export class HighLevelService extends Effect.Service<HighLevelService>()("HighLevelService", {
  effect: Effect.gen(function* () {
    const lowLevelService = yield* LowLevelService;
    
    return {
      complexOperation: Effect.fn("complexOperation")(function* () {
        const result = yield* lowLevelService.simpleOperation();
        // Process result
        return processedResult;
      }),
    };
  }),
  dependencies: [LowLevelService.Default],
}) {}
```

## Service Methods with Effect.fn

Always use `Effect.fn` for service methods to provide proper tracing and debugging:

```typescript
return {
  methodName: Effect.fn("methodName")(function* (params) {
    // Implementation
  }),
};
```

## Service Naming Convention

- Use PascalCase for service class names
- End service names with "Service"
- Use descriptive names that indicate the service's responsibility
- Service identifier (first parameter) should match the class name

## Service Usage in Layers

```typescript
// In app-layer.ts
export const AppLayerLive = Layer.mergeAll(
  MyService.Default,
  ConfigurableService.Default,
  DependentService.Default,
  // Platform layers
  NodeFileSystem.layer,
);
```

## Service Usage in Effects

```typescript
const someWorkflow = Effect.gen(function* () {
  const myService = yield* MyService;
  const result = yield* myService.doSomething("parameter");
  return result;
});
```

## Testing Services

Services can be easily mocked for testing by providing alternative implementations:

```typescript
const TestService = Layer.succeed(MyService, {
  doSomething: Effect.succeed("mocked result"),
});
```