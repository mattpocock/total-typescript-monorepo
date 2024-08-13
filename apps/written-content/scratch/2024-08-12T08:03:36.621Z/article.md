"it's unreadable"
"a maintenance nightmare"
"please don't do this"

Your complex types don't need to be complex to use.

Let me show you 🧵

```ts twoslash
// BAD - incomprehensible unless you're
// a TypeScript Wizard
type Color = "primary" | "secondary" | (string & {});
```

```ts twoslash
type StringWithAutocompleteOptions<T extends string> =
  | T
  | (string & {});

// ---cut---
// GOOD - reusable and beginner-friendly
type Color = StringWithAutocompleteOptions<
  "primary" | "secondary"
>;
```

---

Let's start with the bad example. This `Color` type gives you autocomplete options for `primary` and `secondary`, but also allows any string.

But the `string & {}` is pretty brutal to read.

```ts twoslash
// Lets you autocomplete "primary" and "secondary"
// while still allowing any string
type Color = "primary" | "secondary" | (string & {});
```

---

To an inexperienced dev, `string & {}` might look like some kind of formatting error.

But if they clean it up, they'll lose the desired behavior:

```ts twoslash
// No more autocomplete! Just typed as string:
type Color = "primary" | "secondary" | string;
//   ^?
```

---

So, we need to communicate intent with this type. We could save `string & {}` in a type alias.

But as an API, this kind of sucks. We still have our guts exposed a bit. Ideally we would hide the implementation of `AutocompletableString` a bit better.

```ts twoslash
/**
 * Union with any type to allow any string,
 * while providing autocomplete options.
 */
type AutocompletableString = string & {};

type Color =
  | "primary"
  | "secondary"
  | AutocompletableString;
```

---

If anything, this feels like a problem a _function_ should solve. A function that takes in a type and returns a type.

Luckily, TypeScript has such a thing: generic types.

To dive deep, here's the section on them in my book:

https://www.totaltypescript.com/books/total-typescript-essentials/designing-your-types-in-typescript#generic-types

---

To use a generic type here, we'd first define a type with a type parameter.

That's all a generic type is, just a type (`StringWithAutocompleteOptions`) with a parameter (`TOptions`).

```ts twoslash
type StringWithAutocompleteOptions<TOptions> =
  // We'll get to 'any' later
  any;
```

---

Already, we can 'call' this type with a type argument.

But we're not done yet - we're still just returning `any` from the type.

```ts twoslash
type StringWithAutocompleteOptions<TOptions> =
  // We'll get to this later
  any;

// ---cut---
// Passing a type argument to
// StringWithAutocompleteOptions:
type Color = StringWithAutocompleteOptions<
  "primary" | "secondary"
>;

type Show = Color;
//   ^?
```

---

Instead, let's use `TOptions` as our placeholder for `primary` and `secondary`, and union it with `string & {}`.

Now it works! `primary | secondary` gets put in the `TOptions` placeholder, and gets unioned with `string & {}`.

```ts twoslash
type StringWithAutocompleteOptions<TOptions> =
  | (string & {})
  | TOptions;

type Color = StringWithAutocompleteOptions<
  "primary" | "secondary"
>;

type Show = Color;
//   ^?
```

---

We should also add a type parameter constraint to `TOptions` to ensure it's a string.

Now it'll error helpfully if we pass a number instead:

For more info, check out the book:

https://www.totaltypescript.com/books/total-typescript-essentials/designing-your-types-in-typescript#type-parameter-constraints

```ts twoslash
// @errors: 2344
type StringWithAutocompleteOptions<
  TOptions extends string,
> = (string & {}) | TOptions;

type Color = StringWithAutocompleteOptions<123>;
```

---

It's subjective, but this API looks much better than `AutocompletableString`.

'Calling' a 'function' feels much better than just passing another member to a union.

```ts twoslash
// @noErrors
// Not a fan - still hard to grok when scanning through
type Color =
  | "primary"
  | "secondary"
  | AutocompletableString;

// Better - readable and reusable
type Color = StringWithAutocompleteOptions<
  "primary" | "secondary"
>;
```

---

So if you're struggling to get a bit of TypeScript magic through a PR review, consider capturing it in a generic type.

It's a great way to encapsulate complexity and make your code more beginner-friendly.
