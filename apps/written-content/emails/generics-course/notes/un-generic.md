```ts twoslash
// This is a generic type
type GenericType<T> = T & {};

// This is a ______ type
type WhatShouldICallThis = string | number;
```

```ts twoslash
// This is a generic function
const genericFunction = <T>(arg: T) => arg;

// This is a ______ function
const normalFunction = (arg: string) => arg;
```
