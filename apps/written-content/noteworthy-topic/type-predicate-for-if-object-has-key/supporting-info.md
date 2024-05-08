From Eskimojo in my Discord

```ts twoslash
const Errors = {
  400: "Bad Request",
  404: "Not Found",
} as const;

declare const responseStatus: number;

const hasKey = <T extends object>(
  obj: T,
  key: PropertyKey
): key is keyof T => key in obj;

if (hasKey(Errors, responseStatus)) {
  const errorName = Errors[responseStatus];
}
```
