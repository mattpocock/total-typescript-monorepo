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
