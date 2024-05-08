# The `Prettify` Helper

The `Prettify` helper is a utility type that takes an object type and makes the hover overlay more readable.

```typescript
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
```

It's known by various names - `Id`, `Compute`, `Unwrap` - but each uses this same implementation.

It's also not globally available in TypeScript - you'll need to define it yourself using the code above.

## Example

Let's imagine that you've got a type with multiple intersections:

```typescript
type Intersected = {
  a: string;
} & {
  b: number;
} & {
  c: boolean;
};
```

If you hover over `Intersected`, you'll see the following:

```typescript
/**
 * { a: string; } & { b: number; } & { c: boolean; }
 */
```

This is a little ugly. But we can wrap it in `Prettify` to make it more readable:

```typescript
type Intersected = Prettify<
  {
    a: string;
  } & {
    b: number;
  } & {
    c: boolean;
  }
>;

/**
 * {
 *   a: string;
 *   b: number;
 *   c: boolean;
 * }
 */
```

Much better. This also works on more complex computations, as the [Remix team discovered](https://twitter.com/pcattori/status/1660648097985224705).

## Why This Works

It's not clear why using a mapped type and intersecting it with `{}` actually works. It's a quirk of the TypeScript compiler.

Oddly, intersecting it with `unknown` also works:

```typescript
type Prettify<T> = {
  [K in keyof T]: T[K];
} & unknown;
```

Does this make it likely to break in the future? No - TypeScript has tests to ensure that this code won't break, so you can consider `Prettify` safe to use.
