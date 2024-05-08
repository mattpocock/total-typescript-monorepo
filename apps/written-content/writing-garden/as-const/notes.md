## Quick Explanation

- `as const` can be used to mark a value as deeply readonly - i.e., it can't be mutated in any way.

- You might be used to `as` meaning some kind of [type assertion](/concepts/type-assertions) - a lie to TypeScript. Confusingly, this use of `as` is completely type-safe. You're simply giving TypeScript more information about your code.

- It's different from `Object.freeze` in two ways. First, it only runs at compile-time, so it disappears at runtime. Second, `Object.freeze` only works on the top level. `as const` works on the entire object.

```ts twoslash
// @errors: 2540
const obj = {
  foo: {
    bar: 42,
  },
} as const;

// Error!
obj.foo.bar = 43;

const freezedObj = Object.freeze({
  foo: {
    bar: 42,
  },
});

// Works!
freezedObj.foo.bar = 43;
```

- It's useful on objects, but can also be used on arrays to turn them into readonly tuples:

```ts twoslash
// @errors: 2339
const arr = [1, 2, 3] as const;

arr.push(4);
```

- Objects and arrays marked with `as const` get inferred as their literal types, not the wider types. This can be useful for creating type-safe enums without needing the `enum` keyword.

```ts twoslash
const obj = {
  foo: {
    bar: 42,
  },
};

// Inferred as number
console.log(obj.foo.bar);
//                  ^?

const obj2 = {
  foo: {
    bar: 42,
  },
} as const;

// Inferred as its literal!
console.log(obj2.foo.bar);
//                   ^?
```

- `as const` can also be used to force values to infer as narrowly as possible - for instance, inside objects:

```ts twoslash
const buttonProps = {
  type: "button" as const,
  onClick: () => {
    console.log("clicked");
  },
} as const;

// Inferred as "button", not string
console.log(buttonProps.type);
//                        ^?
```

- It can also be used to encourage a function that returns an array to infer as a tuple:

```ts twoslash
declare const useState: () => [
  string,
  (newState: string) => void
];

const useStateWrapped = () => {
  const [state, setState] = useState();

  return [state, setState] as const;
};
```

## Isn't `as` Bad?

`as` is often used to lie to TypeScript. For instance, you can lie that an empty object is a DOM node, and call functions on it:

```ts twoslash
const node = {} as HTMLAudioElement;

node.play();
```

TypeScript won't complain, but this will throw an error at runtime.

But `as const` is different. It's not a lie - it's just giving TypeScript more information about your code. It's like a type annotation, but for values instead of types.
