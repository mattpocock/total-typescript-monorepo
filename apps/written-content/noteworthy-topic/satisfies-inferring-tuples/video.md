---
width: 1300
height: 1000
---

```ts !!
// Imagine we have a set of options in
// an array.
const options = [
  { label: "View", value: "VIEW" },
  { label: "Full access", value: "FULL_ACCESS" },
];
```

```ts !!
const options = [
  { label: "View", value: "VIEW" },
  { label: "Full access", value: "FULL_ACCESS" },
];

// TypeScript actually lets us access options
// that don't exist in the array.
console.log(options[2]);
```

```ts !!
// @errors: 2493
const options = [
  { label: "View", value: "VIEW" },
  { label: "Full access", value: "FULL_ACCESS" },
] as const;

// We can fix this with an as const...
console.log(options[2]);
```

```ts !!
// Or, we can use this lesser known trick. We
// declare this AtLeastOneMember type...
type AtLeastOneMember = [unknown, ...unknown[]];

const options = [
  { label: "View", value: "VIEW" },
  { label: "Full access", value: "FULL_ACCESS" },
];

console.log(options[2]);
```

```ts !!
// @errors: 2493
// And then use it with 'satisfies' to type
// the array properly.
type AtLeastOneMember = [unknown, ...unknown[]];

const options = [
  { label: "View", value: "VIEW" },
  { label: "Full access", value: "FULL_ACCESS" },
] satisfies AtLeastOneMember;

console.log(options[2]);
```

```ts !!
// @errors: 2493
type AtLeastOneMember = [unknown, ...unknown[]];

// And if we add another member, the
// error goes away!
const options = [
  { label: "View", value: "VIEW" },
  { label: "Full access", value: "FULL_ACCESS" },
  { label: "Edit", value: "EDIT" },
] satisfies AtLeastOneMember;

console.log(options[2]);
```
