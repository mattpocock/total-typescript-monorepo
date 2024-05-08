---
title: Generic Constraints
description: You can use the extends keyword to constrain arguments passed to a generic type.
---

# Constraints in Generic Types

Once you've understood how to [declare a generic type](./declaring-generic-types.md), you might notice some errors creeping in that are tricky to solve. Here's a simple one that comes up when you try to use [template literals](./template-literals.md).

```typescript
type Prefix<T> = `prefix:${T}`;
// Type 'T' is not assignable to type
// 'string | number | bigint | boolean
// | null | undefined'.
```

What does this error mean? Well, you can technically [pass](./what-is-a-generic-type.md) any type into the `T` parameter currently.

```typescript
type Result = Prefix<{ whatever: ["I", "want"] }>;
```

If we were to try to pass this into our template literal ourselves, we'd see an error:

```typescript
type Result = `prefix:${{
  whatever: ["I", "want"];
}}`;
// Type '{ whatever: ["I", "want"]; }' is not
// assignable to type 'string | number | bigint
// | boolean | null | undefined'.
```

That's because you can only pass a into a template literal. This is expressed via a [union type](./union-types.md) in the error message. You can pass [strings, booleans and numbers](./basic-types.md). You can also pass [`bigint`](./bigint.md), and [`null | undefined`](./null-and-undefined.md).

Everything you pass to a template literal gets coerced to a string - but you can't pass random objects, or things that TypeScript doesn't know how to coerce.

So - in order for our generic `Prefix` type to work, we need to constrain `T` to one of those members. Let's start by constraining it to a `string`.

```typescript
type Prefix<T extends string> = `prefix:${T}`;
```

We use the `extends` keyword to mark that this generic is constrained to a `string`.

Now, we can't pass anything that isn't a string into `Prefix`:

```typescript
type Result = Prefix<{ whatever: ["I", "want"] }>;
// Type '{ whatever: ["I", "want"]; }' does not
// satisfy the constraint 'string'.
```

You can constrain a type parameter to any type you want, including a union type.

```typescript
type Prefix<
  T extends
    | string
    | number
    | boolean
    | bigint
    | null
    | undefined
> = `prefix:${T}`;
```

Here, we cover all the bases, ensuring that we can use `Prefix` on any type we want.
