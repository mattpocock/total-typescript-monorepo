```ts twoslash
type ContentType =
  | "application/json"
  | "application/xml"
  | "text/plain";

type Headers = {
  "Content-Type": ContentType | (string & {});
  // Other possible headers...
};
```
