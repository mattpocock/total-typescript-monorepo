TypeScript annoys me sometimes.

So, I decided to do something about it...

```typescript
const arr = [1, 2, 3, undefined];

const result = arr.filter(Boolean);

console.log(result); // Array<number | undefined>

// WHYYYYYYYYY
```

---

It's always bugged me that JSON.parse returns 'any'.

It means that, just by using an extremely common JS method, you're introducing a dangerous type into your codebase.

```typescript
// REAL LIFE

const result = JSON.parse("{}");

console.log(result); // any
```

---

It would be SO much safer if it could return unknown instead.

```typescript
// FANTASY WORLD

const result = JSON.parse("{}");

console.log(result); // unknown
```

---

TypeScript has tossed around a config option for this for a long time.

@orta even got close enough to offering a pull request.

But it ran out of steam.

https://github.com/microsoft/TypeScript/issues/46347

---

But I got to thinking - there's an alternative solution.

What if you could import a special library that made changes to TypeScript's global types?

```typescript
import "@total-typescript/ts-reset/json-parse";

const result = JSON.parse("{}");

console.log(result); // unknown
```

---

So - I shipped it.

ts-reset acts like a CSS reset, smoothing out TypeScript's hard edges and letting you opt-in to exactly which improvements you want.

You can install it right now, and start chucking away those any's.

https://github.com/total-typescript/ts-reset

---

Just a single import in any .ts or .tsx file, and it'll make the changes across your entire project.

npm i @total-typescript/ts-reset

```typescript
// Import all the recommended rules
import "@total-typescript/ts-reset";
```

---

Let's look at some of the other improvements that ts-reset ships.

I hate that .filter(Boolean) doesn't work how you expect.

But with ts-reset, it works EXACTLY how you expect - filtering out falsy values.

```typescript
// BEFORE
const filteredArray = [
  "a",
  "b",
  undefined,
].filter(Boolean); // (string | undefined)[]
```

```typescript
// AFTER
import "@total-typescript/ts-reset/filter-boolean";

const filteredArray = [
  "a",
  "b",
  undefined,
].filter(Boolean); // string[]
```

---

Fetching is dangerous - you don't know what you're getting back.

Response.json will now return unknown, not any, incentivising you to properly validate.

```typescript
// BEFORE
fetch("/")
  .then((res) => res.json())
  .then((json) => {
    console.log(json); // any
  });
```

```typescript
// AFTER
import "@total-typescript/ts-reset/fetch";

fetch("/")
  .then((res) => res.json())
  .then((json) => {
    console.log(json); // unknown
  });
```

---

Array.includes really sucks for when you're using arrays declared with 'as const'.

Well, not any more:

```typescript
// BEFORE
const users = ["matt", "sofia", "waqas"] as const;

// Argument of type '"bryan"' is not assignable to
// parameter of type '"matt" | "sofia" | "waqas"'.
users.includes("bryan");
```

```typescript
// AFTER
import "@total-typescript/ts-reset/array-includes";

const users = ["matt", "sofia", "waqas"] as const;

// .includes now takes a string as the first parameter
users.includes("bryan");
```
