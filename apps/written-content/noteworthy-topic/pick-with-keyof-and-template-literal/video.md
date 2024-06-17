---
width: 1200
height: 1340
posted: 2024-06-21
---

```ts !!
// Imagine we've got some props...
type Props = {
  onClick: (event: MouseEvent) => void;
  onDblClick: (event: MouseEvent) => void;
  onDrag: (event: DragEvent) => void;
  type: string;
  className: string;
};

// ...and we're extracting out the keys.
type EventKeys = keyof Props;
```

```ts !!
type Props = {
  onClick: (event: MouseEvent) => void;
  onDblClick: (event: MouseEvent) => void;
  onDrag: (event: DragEvent) => void;
  type: string;
  className: string;
};

type EventKeys = keyof Props;

// We create an array of those keys...
const keys: EventKeys[] = [
  "onClick",
  "onDblClick",
  "onDrag",
];
```

```ts !!
type Props = {
  onClick: (event: MouseEvent) => void;
  onDblClick: (event: MouseEvent) => void;
  onDrag: (event: DragEvent) => void;
  type: string;
  className: string;
};

type EventKeys = keyof Props;

// ...but we only want the keys that start
// with 'on' to be allowed.
const keys: EventKeys[] = [
  "onClick",
  "onDblClick",
  "onDrag",
  "type", // ⛔️ Should not be allowed!
];
```

```ts !!
// @noErrors
type Props = {
  onClick: (event: MouseEvent) => void;
  onDblClick: (event: MouseEvent) => void;
  onDrag: (event: DragEvent) => void;
  type: string;
  className: string;
};

// We can intersect the keys with
// `on${string}`...
type EventKeys = keyof Props & `on${string}`;

const keys: EventKeys[] = [
  "onClick",
  "onDblClick",
  "onDrag",
  "type",
];
```

```ts !!
// @noErrors
type Props = {
  onClick: (event: MouseEvent) => void;
  onDblClick: (event: MouseEvent) => void;
  onDrag: (event: DragEvent) => void;
  type: string;
  className: string;
};

// ...which means that only keys that start
// with 'on' are allowed.
type EventKeys = keyof Props & `on${string}`;
//   ^?

const keys: EventKeys[] = [
  "onClick",
  "onDblClick",
  "onDrag",
  "type",
];
```

```ts !!
// @errors: 2322
type Props = {
  onClick: (event: MouseEvent) => void;
  onDblClick: (event: MouseEvent) => void;
  onDrag: (event: DragEvent) => void;
  type: string;
  className: string;
};

type EventKeys = keyof Props & `on${string}`;

const keys: EventKeys[] = [
  "onClick",
  "onDblClick",
  "onDrag",
  // And now it errors correctly!
  "type",
];
```
