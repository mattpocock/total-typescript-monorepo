# Optional Chaining for Assignments Lands in Stage 1

In TypeScript, if you try to assign to a property of a possibly undefined object, you'll get an error:

> 'X' is possibly undefined.

```ts twoslash
declare const obj: { foo?: string } | undefined;
// @errors: 18048

// ---cut---
obj.foo = "bar";
```

You might think that you can use the optional chaining syntax to fix this:

```ts twoslash
// @errors: 2779
declare const obj: { foo?: string } | undefined;

// ---cut---
obj?.foo = "bar";
```

But you end up with an error:

> The left-hand side of an assignment expression may not be an optional property access.

This is because optional chaining is only for reading properties (or deleting properties), not for assigning to them.

But today, the [optional chaining for assignments proposal](https://github.com/nicolo-ribaudo/proposal-optional-chaining-assignment) has landed in Stage 1 of TC39.

If this proposal gets adopted into JavaScript, the code below will no longer error.

```ts twoslash
// @errors: 2779
declare const obj: { foo?: string } | undefined;

// ---cut---
obj?.foo = "bar";
```
