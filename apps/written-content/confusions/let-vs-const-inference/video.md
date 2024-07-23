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

const buttonType = "button";

// And we can pass it to the button props
// without any errors.
const buttonProps: ButtonProps = {
  type: buttonType,
};
```
