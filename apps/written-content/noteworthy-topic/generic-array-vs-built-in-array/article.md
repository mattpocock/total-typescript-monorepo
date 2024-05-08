When you're declaring an array type in TypeScript, you've got one of two options: `Array<T>` or `T[]`.

Dominik ([@TKDodo](https://twitter.com/TkDodo) on Twitter), one of the maintainers of [React Query](https://tanstack.com/query/v3/), recently posted [an article](https://tkdodo.eu/blog/array-types-in-type-script) on which option you should choose.

He strongly advocated for `Array<T>`, but I think the picture is a little more complex.

## Short Explanation

- `Array<T>` and `T[]` are functionally identical in your code.

```ts twoslash
const firstTest = (arr: Array<string>) => {};

const secondTest = (arr: string[]) => {};

// Both behave the same!
firstTest(["hello", "world"]);
secondTest(["hello", "world"]);
```

- Using `keyof` with `T[]` can lead to unexpected results.

```ts twoslash
// @errors: 2322
type Person = {
  id: string;
  name: string;
};

const result: keyof Person[] = ["id", "name"];
```

The fix is to use `Array<T>` instead:

```ts twoslash
type Person = {
  id: string;
  name: string;
};

// ---cut---

const result: Array<keyof Person> = [
  "id",
  "name",
];
```

- Dominik argues that `Array<string>` is more readable than `string[]`. This is subjective - it's like the difference between reading "array of strings" or "string array".

- When hovering values or displaying errors, TypeScript uses the `T[]` syntax. Inexperienced TS devs might experience cognitive load when translating between `Array<T>` in their code and `T[]` in their errors.

```ts twoslash
const array = [1, 2];
//    ^?
```

- Overall, I disagree with Dominik that `Array<T>` is always the better choice. There are enough caveats to either approach that I won't be making a recommendation one way or the other.

- But - you should be consistent. You can use [this ESLint rule](https://typescript-eslint.io/rules/array-type/) to enforce one or the other in your codebase. And if I had to choose, I would choose `T[]`.

## Long Explanation

### No Functional Differences

Developers love a syntactical argument - especially when there is little functional difference between the two options.

`Array<T>` and `T[]` behave exactly the same, as noted above - with one small exception.

```ts twoslash
// @errors: 1265
type Test1 = [...Array<string>, ...Array<string>];

type Test2 = [...string[], ...string[]];
```

Here, we're getting an error using the `T[]` syntax when trying to use it in a _rest_ position. But even this behavior might disappear in a future TS version, as [this PR](https://github.com/microsoft/TypeScript/pull/55446) demonstrates.

So, we can treat the two as functionally the same.

### `keyof`

If you're going to make a firm judgment on which syntax to use, you need to consider the `keyof` operator.

As described above, `keyof` with `T[]` can lead to unexpected results.

```ts twoslash
// @errors: 2322

type Person = {
  id: string;
  name: string;
};

const result: keyof Person[] = ["id", "name"];
```

You would think here that `keyof Person` would resolve _before_ the `[]` operator kicks in, meaning you'd end up with a type like `('id' | 'name')[]`.

But unfortunately, the `[]` resolves _first_, so you end up performing a `keyof` on `Person[]`.

You can fix this by wrapping `keyof Person` in parentheses:

```ts twoslash
type Person = {
  id: string;
  name: string;
};

// ---cut---

const result: (keyof Person)[] = ["id", "name"];
```

Or, you can use `Array<T>` instead:

```ts twoslash
type Person = {
  id: string;
  name: string;
};

// ---cut---

const result: Array<keyof Person> =
  //    ^?
  ["id", "name"];
```

### Readability

Dominik argues that `Array<T>` is more readable than `T[]`. You might agree with this - but I would argue that it's subjective.

I don't want to offer an opinion here - but I want to make sure your opinion is well-informed.

#### Readonly Arrays

If you want to stay consistent with `Array<T>`, you'll probably also want to use the `ReadonlyArray<T>` type:

```ts twoslash
// @errors: 2339

const array: ReadonlyArray<string> = [
  "hello",
  "world",
];

array.push("foo");
```

We can compare this to the `readonly T[]` syntax:

```ts twoslash
// @errors: 2339
const array2: readonly string[] = [
  "hello",
  "world",
];

array2.push("foo");
```

Which do you prefer? I find this one pretty hard to differentiate.

#### Arrays of Arrays

For handling arrays of arrays, you'll also want to consider `Array<Array<T>>`:

```ts twoslash
// @errors: 2322

const array: Array<Array<string>> = [
  ["hello", "world"],
  ["foo", "bar"],
];
```

We can compare it to the `T[][]` syntax:

```ts twoslash
// @errors: 2322

const array2: string[][] = [
  ["hello", "world"],
  ["foo", "bar"],
];
```

Which do you prefer?

### TypeScript Uses `T[]`

TypeScript _does_ offer an opinion on which it prefers. In hovers and errors, TypeScript will always use the `T[]` syntax.

```ts twoslash
// @errors: 2322
const array = [1, 2];
//    ^?

const asConstArray = [1, 2] as const;
//    ^?

const arrayOfArrays = [
  //  ^?
  [1, 2],
  [3, 4],
];

const stringArray = ["hello", "world"];

const numArray: number[] = stringArray;
```

This means that if you're using `Array<T>` in your code, less experienced TypeScript developers will experience some cognitive load translating between the two syntaxes.

This is a big reason why, to me at least, `T[]` feels more natural - it's more present in the language, encouraged by the compiler, and used everywhere in the docs.

### Conclusion

After all of this deep thought, I don't think there's a clear winner here.

I have personally lost hours of my life trying to figure out why `keyof T[]` wasn't working as expected.

But I can also see a strong argument that `T[]` is the more intuitive choice because of how embedded it is within TypeScript as a whole.

It really comes down to one question: would I reject a PR containing the one we didn't use? No.

Use whichever you like. Use a linter to stay consistent. And don't worry about it too much.
