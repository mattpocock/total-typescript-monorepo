```tsx !!
// @errors: 2322

// Let's say we have some props we want to pass
// to a button component...
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// And we save the type in a variable...
let buttonType = "button";
```

```tsx !!
// @errors: 2322
type ButtonProps = {
  type: "button" | "submit" | "reset";
};
// ---cut---
let buttonType = "button";

// When we try to pass this to the button props,
// we get an error. Why?
const buttonProps: ButtonProps = {
  type: buttonType,
};
```

```tsx !!
// @errors: 2322
type ButtonProps = {
  type: "button" | "submit" | "reset";
};
// ---cut---
// It's because our buttonType is inferred as string,
// not the specific 'button' type.
let buttonType = "button";
//  ^?
```

```tsx !!
// @errors: 2322
type ButtonProps = {
  type: "button" | "submit" | "reset";
};
// ---cut---
let buttonType = "button";

// That's because, at any time, we could mutate
// it to a different string value.
buttonType = "foobar";
```

```tsx !!
// @errors: 2322
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
// But if we change it to a const, it's inferred
// as the specific 'button' type.
const buttonType = "button";
//    ^?
```

```tsx !!
// @errors: 2322
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
const buttonType = "button";

// And we can pass it to the button props
// without any errors.
const buttonProps: ButtonProps = {
  type: buttonType,
};
```

```tsx !!
// @errors: 2322
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
// But what if, instead of a variable, we
// save the type in an object property?
const defaultProps = {
  type: "button",
};

// Ah, it's erroring again.
const buttonProps: ButtonProps = {
  type: defaultProps.type,
};
```

```tsx !!
// @errors: 2322
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
const defaultProps = {
  type: "button",
};

// const vs let doesn't matter here, because
// either way the object property itself
// is mutable.
defaultProps.type = "foobar";
```

```tsx !!
// @errors: 2322, 2540
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
// One way to achieve this is to freeze
// the object at runtime with Object.freeze:
const defaultProps = Object.freeze({
  type: "button",
});

defaultProps.type = "foobar";
```

```tsx !!
// @errors: 2322, 2540
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
// But a smarter way is to use 'as const'.
// This has no runtime impact, and the same
// effect on the types.
const defaultProps = {
  type: "button",
} as const;

defaultProps.type = "foobar";
```

```tsx !!
// @errors: 2322, 2540
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
// With 'as const', it all works.
// defaultProps.type is inferred as 'button',
// so it can be passed to the button props.
const defaultProps = {
  type: "button",
} as const;

const buttonProps: ButtonProps = {
  type: defaultProps.type,
};
```

```tsx !!
// @errors: 2322, 2540
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
// If you didn't care about making it
// readonly, you could also just type
// defaultProps itself:
const defaultProps: ButtonProps = {
  type: "button",
};

const buttonProps: ButtonProps = {
  type: defaultProps.type,
};
```

```tsx !!
// @errors: 2322, 2540
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
// Or, use satisfies:
const defaultProps = {
  type: "button",
} satisfies ButtonProps;

const buttonProps: ButtonProps = {
  type: defaultProps.type,
};
```

```tsx !!
// @errors: 2322, 2540
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
// But, to sum up: let and const infer
// differently because of their mutability.
const type = "button";
//    ^?

let looseType = "button";
//  ^?
```

```tsx !!
// @errors: 2322, 2540
type ButtonProps = {
  type: "button" | "submit" | "reset";
};

// ---cut---
// And object properties are mutable, so
// they infer loosely. You can hint that they
// are readonly with 'as const':
const looseObj = { type: "button" };
//    ^?

const constObj = { type: "button" } as const;
//    ^?
```
