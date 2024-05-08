---
title: Template Literals
description: Template literals are a way to manipulate string literals in TypeScript, using backticks instead of quotes.
---

# Template Literals

Since TypeScript 4.1, we've had access to an extroardinary feature for manipulating string [literals](./literal-types.md) in TypeScript. Let's look at them in detail.

```typescript
type Name = `${"Matt"} ${"Pocock"}`;
//   Matt Pocock
```

In this example, we create a type called `Name`, and pass in two string literals into the template literal. This looks very similar to something we might find in JavaScript.

But because this is on the type level, we can do some very interesting things with it. For instance, [declaring a generic type](./declaring-generic-types.md) gives us the ability to create a dynamic member of the Pocock family:

```typescript
type CreatePocockMember<
  TFirstName extends string
> = `${TFirstName} Pocock`;

type Matt = CreatePocockMember<"Matt">; // Matt Pocock
type Colin = CreatePocockMember<"Colin">; // Colin Pocock
type Teri = CreatePocockMember<"Teri">; // Teri Pocock
```

We use a [generic constraint](./constraints-in-generic-types.md) to make sure that `TFirstName` is [`string`](./basic-types.md), then pass that in before `Pocock`.

## Unions in template literals

One fascinating aspect of template literals is that they distribute any [union members](./union-types.md) that are passed to them into new strings.

For instance, let's say we wanted to create a LOT of members of the Pocock family:

```typescript
type PocockMember = `${
  | "Matt"
  | "Colin"
  | "Teri"} ${"Pocock"}`;
// "Matt Pocock" | "Colin Pocock" | "Teri Pocock"
```

We can go even further, and provide them with some knighthoods:

```typescript
type PocockMember = `${
  | "Matt"
  | "Colin"
  | "Teri"} ${"Pocock"} ${"MBE" | "OBE"}`;
// "Matt Pocock MBE" | "Colin Pocock MBE" | "Teri Pocock MBE"
// "Matt Pocock OBE" | "Colin Pocock OBE" | "Teri Pocock OBE"
```

For more reading, the [string manipulation utility types](./string-manipulation-utility-types.md) are fascinating.
