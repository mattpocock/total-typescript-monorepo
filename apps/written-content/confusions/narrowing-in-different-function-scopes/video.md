```ts !!
declare const url: string;

// ---cut---
// Let's say we've got a 'name' coming from some
// search params...
```

```ts !!
declare const url: string;

// ---cut---
// The name could be a string, if it's defined,
// or null if it's not.
const name = new URLSearchParams(url).get("name");
//    ^?
```

```ts !!
declare const url: string;

const name = new URLSearchParams(url).get("name");

// ---cut---
// If we narrow it down, TypeScript is smart
// enough to know that it's a string.
if (name) {
  console.log(name);
  //          ^?
}
```

```ts !!
declare const url: string;

let name = new URLSearchParams(url).get("name");

declare const userNames: string[];

// ---cut---
// If we narrow it down, TypeScript is smart
// enough to know that it's a string.
if (name) {
  console.log(
    userNames.filter((userName) => userName.includes(name)),
  );
}
```
