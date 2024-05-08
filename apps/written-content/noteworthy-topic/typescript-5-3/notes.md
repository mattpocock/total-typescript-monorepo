# Import Attributes

```ts
// .json is guaranteed to be a JSON file, not a
// malicious JavaScript file with a .json extension.
import data from "./data.json" with { type: "json" };
```

```ts
const obj = await import("./data.json", {
  with: { type: "json" },
});
```

# `switch (true)` Narrowing

```ts twoslash
function myFunc(input: unknown) {
  switch (true) {
    case typeof input === "string":
    case typeof input === "number":
      return input;
    //       ^?

    case typeof input === "object" && !!input:
      return input;
    //       ^?
  }
}
```

```ts twoslash
function myFunc(input: unknown) {
  if (
    typeof input === "string" ||
    typeof input === "number"
  ) {
    return input;
    //     ^?
  } else if (typeof input === "object" && !!input) {
    return input;
    //     ^?
  }
}
```

# Interactive Inlay Hints
