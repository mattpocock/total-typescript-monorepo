```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleDetection": "force"
  }
}
```

```jsx twoslash
// @errors: 7031
// @checkJs: true
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```jsx twoslash
// @checkJs: true
/**
 * @param {{ children?: import('react').Whatever }} props
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```jsx twoslash
// @checkJs: true
// @errors: 2536
/**
 * @template T
 * @param {T[]} array
 * @param {keyof T} key
 * @returns
 */
const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] ??= []).push(currentValue);
    return result;
  }, {});
};
```

```jsx twoslash
// @checkJs: true
/**
 * @template T
 * @param {T[]} array
 * @param {keyof T} key
 * @returns
 */
const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[/** @type {string} */ (currentValue[key])] ??=
      []).push(currentValue);
    return result;
  }, /** @type {Record<string, T[]>} */ ({}));
};
```

```jsx twoslash
// @checkJs: true
// @errors: 7053
/**
 * @template T
 * @param {T[]} array
 * @param {keyof T} key
 * @returns
 */
const groupBy = (array, key) => {
  return array.reduce(
    (result, currentValue) => {
      (result[/** @type {string} */ (currentValue[key])] ??=
        []).push(currentValue);
      return result;
    },
    /** @type {Record<string, T[]>} */ {}
  );
};
```

```ts twoslash
const groupBy = <T>(array: T[], key: keyof T) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key] as string] ??= []).push(
      currentValue
    );
    return result;
  }, {} as Record<string, T[]>);
};
```

```json
{
  "skipLibCheck": false
}
```

```ts
export type Role = "admin" | "user" | "guest";

export interface User extends WithId {
  name: string;
  email: string;
  role: Role;
}

export interface WithId {
  id: number;
}
```

```tsx twoslash
import { useState } from "react";

const [message, setMessage] = useState<string>();
```

```tsx twoslash
// @errors: 2352
import { useState } from "react";

// Not safe!
const [message, setMessage] = useState(1 as string);
```

```jsx twoslash
// @checkJs: true
import { useState } from "react";

const [value] = /** @type {typeof useState<string>} */ (
  useState
)();

console.log(value);
//          ^?
```
