# Empty Arrays in TypeScript

Let's take a look at this piece of code:

```tsx twoslash
import { useState } from "react";

const Component = () => {
  const [items, setItems] = useState([]);
  //     ^?

  return <div>{items}</div>;
};
```

```tsx twoslash
const foo = () => [];
//    ^?

const bar = [];
//    ^?

export const exportedBar = [];
//           ^?
```
