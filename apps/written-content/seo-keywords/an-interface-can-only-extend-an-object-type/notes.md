You're likely here because you've spotted this error:

> An interface can only extend an object type or intersection of object types with statically known members.

This error can happen because you're trying to extend a union type. For instance, this code will fail:

```ts twoslash
// @errors: 2312
type Example =
  | { a: string }
  | {
      b: string;
    };

interface Foo extends Example {
  c: string;
}
```

This is an error because interfaces can't extend union types. [Interfaces can't represent unions](/type-vs-interface-which-should-you-use), so it's not possible to create one using the `extends` keyword.

Instead, you can use an intersection type instead of `extends`:

```ts twoslash
type Example =
  | { a: string }
  | {
      b: string;
    };

type Foo = Example & {
  c: string;
};
```

Now, you'll have what you need - an object where you can either pass in `a` or `b`, but you must always pass in `c`.
