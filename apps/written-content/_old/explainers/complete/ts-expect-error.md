# How to use `@ts-expect-error` effectively

`@ts-expect-error` lets you specify that an error _will_ occur on the next line of the file.

Without `@ts-expect-error`, this line of code errors:

```typescript twoslash
// @errors: 2322
const x: string = 12;
```

But with it, it quietens the error:

```typescript twoslash
// @ts-expect-error
const x: string = 12;
```

## Fixing the 'Unused `@ts-expect-error` directive' error

In fact, if `@ts-expect-error` _doesn't_ find an error, it will source an error itself:

```typescript twoslash
// @errors: 2578
// @ts-expect-error
```

This is helpful because it lets us use `@ts-expect-error` to [test our types](/how-to-test-your-types) by letting us be _sure_ that an error will occur.

## Including a description with `@ts-expect-error`

You might also run into this error:

> "Include a description after the `@ts-expect-error` directive to explain why the `@ts-expect-error` is necessary. The description must be 3 characters or longer."

This comes from a [TypeScript ESLint rule](https://typescript-eslint.io/rules/ban-ts-comment). It exists to force you to _explain_ why you're using expecting an error.

Imagine a line of code like this:

```typescript twoslash
const expectsString = (x: string) => {};

// ---cut---

// @ts-expect-error
expectsString(123);
```

It's not clear why we're passing this piece of code a number. Is it a mistake? Is it intentional? If it's intentional, why?

Adding a description to the `@ts-expect-error` directive helps us explain why we're expecting an error:

```typescript twoslash
const expectsString = (x: string) => {};

// ---cut---

// @ts-expect-error: Should expect string
expectsString(123);
```

## Descriptions aren't perfect

Though it's important to note that description doesn't help TypeScript narrow what the error is at all. We might be generating an error we didn't expect, such as misspelling the function:

```typescript twoslash
const expectsstring = (x: string) => {};

// @errors: 2552
expectsString(123);
```

In fact, there's no native way in TypeScript that you can narrow down the exact error thrown by a line of code. So, using `@ts-expect-error` with a loose description is your best bet.

## `@ts-expect-error` or `@ts-ignore`?

When you actually want to ignore an error, you'll be tempted to use `@ts-ignore`. It works similarly to `@ts-expect-error`, except for one thing: it won't error if it _doesn't_ find an error:

```typescript twoslash
// @ts-ignore
const x: string = 12;
```

Sometimes, you'll want to ignore an error that later down the line gets fixed. If you're using `@ts-ignore`, it'll just ignore the fact that the error is gone.

But with `@ts-expect-error`, you'll actually get a hint that the directive is now safe to remove. So if you're choosing between them, pick `@ts-expect-error`.
