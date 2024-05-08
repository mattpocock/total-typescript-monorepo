Type assertions let you lie to TypeScript about what type a value is. This can be useful when you know more about a value than TypeScript does, or when you need a quick shortcut to keep the compiler quiet.

## The `as` Keyword

You can use the `as` keyword to force TypeScript to convert a value to a different type.

```ts twoslash
const element = document.getElementById(
  "my-element"
) as HTMLDivElement;

console.log(element.innerText);
//                  ^?
```

### `as` Has Limits

When using `as`, the objects being compared need to be somewhat related to each other. It will error if you try to push it too far.

This occurs with primitives:

```ts twoslash
// @errors: 2352
const str = 123 as string;
```

But also with objects that don't have any shared properties:

```ts twoslash
// @errors: 2352
type Dog = {
  bark: () => void;
};

const dog = {
  meow: () => {
    console.log("meow");
  },
} as Dog;
```

### The Double `as`: `as unknown as X`

You can always force something to be of a certain type when you use `as unknown as X`. This is because `unknown` is assignable to any type, so you can use it to "reset" the type of a value.

```ts twoslash
const str = 123 as unknown as string;

type Dog = {
  bark: () => void;
};

const dog = {
  meow: () => {
    console.log("meow");
  },
} as unknown as Dog;
```

This works because `unknown` is the _top type_ in TypeScript - so is somewhat related to all types. This also works with `never`, the bottom type, and `any` - a somewhat game-breaking type.

```ts twoslash
const str = 123 as any as string;
const str2 = 123 as never as string;
```
