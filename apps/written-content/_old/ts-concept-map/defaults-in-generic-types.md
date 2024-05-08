---
title: Defaults in Generic Types
description: You can provide defaults to generic types using an equals sign. This helps make generic types more flexible.
---

# Defaults in Generic Types

When you're [declaring generic types](./declaring-generic-types.md), you'll notice how similar they are to functions in JavaScript. And just like functions, you'll start to wonder if you can provide some default parameters:

```typescript
const myFunc = (
  id: string,
  shouldConcat = false
) => {};

myFunc("123");

myFunc("345", true);
```

Here, `shouldConcat` doesn't need to be passed to `myFunc`. It has a default argument of `false`.

To express this in a [generic type](./what-is-a-generic-type.md), the syntax would look like this:

```typescript
type MyFunc<TId, TShouldConcat = false> = [
  TId,
  TShouldConcat
];
```

The `TShouldConcat` (prefixed with `T` for [reasons](./why-is-t-the-convention.md)) argument now doesn't need to be passed, and defaults to `false` if not passed.

```typescript
type Result = MyFunc<"123">;
// ["123", false]

type Result2 = MyFunc<"345", true>;
// ["345", true]
```

## Defaults must go last

One wrinkle with defaults in TypeScript is that they _must_ go last in the order.

```typescript
type MyFunc<TShouldConcat = false, TId> = [
  TId,
  TShouldConcat
];
// Required type parameters may not follow optional type parameters.
```

## Defaults don't affect constraints

One interesting thing about defaults is that TypeScript doesn't infer a [constraint](./constraints-in-generic-types.md) from them. At the [runtime level](./runtime-level-vs-type-level.md), you're forced to pass a version of the generic which is assignable to a widened version of the default:

```typescript
const myFunc = (shouldConcat = false) => {};

myFunc("123");
// Argument of type '"123"' is not assignable to parameter of type 'boolean | undefined'.
```

But when using defaults in type arguments, you aren't constrained at all.

```typescript
type MyFunc<TShouldConcat = false> =
  TShouldConcat;

// No error!
type Result = MyFunc<{
  iCanPassWhatever: true;
}>;
```

If you want `TShouldConcat` to be constrained to a boolean, you need to manually specify it.

```typescript
type MyFunc<
  TShouldConcat extends boolean = false
> = TShouldConcat;
```
