TypeScript libraries are getting so complex that devs are unit testing their types.

But there's almost no advice on there on how to do it well.

Let's change that:

```typescript
it("Should return a type of string", () => {
  const result = returnsAString();

  type Assertions = [
    Expect<Equal<typeof result, string>>
  ];
});
```

---

Testing your types should feel just like testing any other part of your codebase.

Let's say you're testing whether a function should return a string.

Here's how you'd write it in a runtime test:

```typescript
it("Should return a string", () => {
  const result = returnsAString();

  expect(typeof result).toBe("string");
});
```

---

And here's how you'd write it in a type test.

It looks a little more confusing if you're not used to the syntax. But the idea is the same.

We 'Expect' that typeof result is 'Equal' to the type 'string'.

And we put it in a tuple in case we want to add multiple assertions to the same test.

```typescript
it("Should return a type of string", () => {
  const result = returnsAString();

  type Assertions = [
    Expect<Equal<typeof result, string>>
  ];
});
```

---

Where did the 'Expect' and 'Equal' types come from?

They're two types that, by convention, are used in lots of codebases to test types.

I use them all over Total TypeScript, as well as to test ts-reset:

https://github.com/total-typescript/ts-reset/blob/main/src/tests/utils.ts

```ts
export type Expect<T extends true> = T;

export type Equal<X, Y> = (<T>() => T extends X
  ? 1
  : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;
```

---

How do we know that our tests are passing?

Simple, run `tsc` on our tests.

If we get an error, we'll know that our test is failing.

```typescript
it("Should return a type of string", () => {
  const result = returnsAString();

  type Assertions = [
    // Type 'false' does not satisfy the constraint 'true'.
    Expect<Equal<typeof result, number>>
  ];
});
```

---

This setup works all the way up to complex types. The Equal type helper can test unions, intersections, EVERYTHING that TypeScript can throw at you:

```typescript
it("Should return a type covering all unions", () => {
  const result = returnsAComplexType();

  type Assertions = [
    Expect<
      Equal<
        typeof result,
        | {
            foo: string;
          }
        | number
        | string
      >
    >
  ];
});
```

---

You can even test behaviour inside nested functions by using a type _inside_ that function's scope:

```typescript
it("Should infer a type of number", () => {
  const arr = [1, 2, 3];

  mapper(arr, (item) => {
    type Assertions = [
      Expect<Equal<typeof item, number>>
    ];
  });
});
```

---

This setup means that your 'type tests' can be colocated with your normal tests.

But if you don't want that, you can separate them into their own file.

This is what XState does, for instance:

https://github.com/statelyai/xstate/blob/534f31d0f8942574bd460ea22a914c41a8aee6f3/packages/core/test/typegenTypes.test.ts

---

If the code that you're type-testing uses side effects, you can write a custom doNotExecute helper to prevent the code from running.

```typescript
function doNotExecute(fn: () => any) {}

it("Should return a type of string", () => {
  doNotExecute(() => {
    const result = returnsAString();

    type Assertions = [
      // Type 'false' does not satisfy the constraint 'true'.
      Expect<Equal<typeof result, number>>
    ];
  });
});
```

---

But how about errors? How do you assert that something should throw an error in TypeScript?

You can use // @ts-expect-error to assert that a line should throw an error.

```typescript
it("Should throw a type error if you an array", () => {
  // @ts-expect-error
  expectsObject([]);
});
```

---

@ts-expect-error is not exactly a precise tool. You can't tell it to expect a _specific_ error, like you can with eslint-disable or similar tools.

So - watch out that you know exactly what error you intend to suppress.

Some folks leave a description after the @ts-expect-error to make it clear what error they're suppressing:

```typescript
it("Should throw a type error if you an array", () => {
  // @ts-expect-error - Expect an object
  expectsObject([]);
});
```

---

So - you know how to test, but _what_ should you test?

The examples I've given are extremely simplified. You probably don't want to be testing that if a function expects a string, you can't pass a number.

---

But as soon as you introduce generics into your library, you probably want to start testing them.

For instance, you'll want to check that a typed Object.keys function returns the correct type:

```typescript
it("Should return the correct type", () => {
  const result = typedObjectKeys({ a: 1, b: 2 });

  type Assertions = [
    Expect<Equal<typeof result, Array<"a" | "b">>>
  ];
});
```

---

Pretty much every library should have some level of type testing. But apps might also need to test their types.

If you've built any kind of complicated abstraction, you'll want to test that it behaves as expected. Making sure that the types work - even with just a couple of basic tests - is usually well worth it.

---

The approach I've shown is a DIY approach. You don't need to install any libraries to get going.

BUT there are first-class solutions to this problem. If you're interested, you should check our Vitest's type testing tools, and tsd.

https://github.com/SamVerschueren/tsd

https://vitest.dev/guide/testing-types.html

---

If you like this thread, and think I should turn it into a video, then make sure to give the top tweet a like - and share it in your company's Slack.
