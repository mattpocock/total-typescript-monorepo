```ts !!
// Let's imagine we have some columns declared
// like this...
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
];
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
];

// And we want to transform it to an object
// type like this.
type Target = {
  notes: string;
  id: number;
};
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something", // Linked!
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
];

// 'notes' should be linked to the result
// of its renderCell function:
type Target = {
  notes: string; // Linked!
  id: number;
};
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123, // Linked!
  },
];

// And the same for 'id':
type Target = {
  notes: string;
  id: number; // Linked!
};
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
];

// We'll start by extracting out the type of
// the columns with typeof:
type Column = typeof columns;
//   ^?
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
];

// But this gets the entire array. We want
// the type of each element in the array.
type Column = typeof columns;
//   ^?
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
];

// To do that, we can index into typeof columns
// with [number]. This turns it into a union
// type containing each member.
type Column = (typeof columns)[number];
//   ^?
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
];

type Column = (typeof columns)[number];

// This is better, but we don't currently have
// access to the 'field' key in each column:
// it's just typed as string.
type Field = Column["field"];
//   ^?
```

```ts !!
// We can fix this by adding 'as const' to
// the columns definition:
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

type Column = (typeof columns)[number];

type Field = Column["field"];
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
// Now, Column is inferred in its most specific form:
type Column = (typeof columns)[number];
//   ^?
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// And we gain access to 'notes' and 'id'
// to eventually create our object.
type Field = Column["field"];
//   ^?
```

```ts !!
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
// Column is typed as a union, and we're
// going to iterate over each member
// of the union to create our object.
type Column = (typeof columns)[number];
```

```ts !!
// @noErrors
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// To do that, we'll need a mapped type:
type Mapped = {
  [K in keyof Something]: Something[K];
};
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// The question is, what do we iterate over?
// If we try to iterate over each Column,
// we'll get an error - because the key of
// a mapped type needs to be string, number
// or symbol.
type Mapped = {
  [K in Column]: K;
};
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// One thing we could try is iterating over
// Column['field'] and creating a mapped type
// based on those keys:
type Mapped = {
  [K in Column["field"]]: K;
};
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

type Mapped = {
  [K in Column["field"]]: K;
};

// This looks pretty good - but the
// values of the object don't look right.
type Show = Mapped;
//   ^?
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// We can get this working by changing the value
// to be this complicated Extract setup:
type Mapped = {
  [K in Column["field"]]: ReturnType<
    Extract<Column, { field: K }>["renderCell"]
  >;
};

type Show = Mapped;
//   ^?
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

type Mapped = {
  [K in Column["field"]]: ReturnType<
    Extract<Column, { field: K }>["renderCell"]
  >;
};
// ---cut---
type Column = (typeof columns)[number];

// This works by extracting the member of Column
// that matches the field property:
type Example = Extract<Column, { field: "id" }>;
//   ^?
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

type Mapped = {
  [K in Column["field"]]: ReturnType<
    Extract<Column, { field: K }>["renderCell"]
  >;
};
// ---cut---
type Column = (typeof columns)[number];

// Then, grabbing renderCell from it:
type Example = Extract<
  Column,
  { field: "id" }
>["renderCell"];

type Show = Example;
//          ^?
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

type Mapped = {
  [K in Column["field"]]: ReturnType<
    Extract<Column, { field: K }>["renderCell"]
  >;
};
// ---cut---
type Column = (typeof columns)[number];

// And using ReturnType to grab the returned
// type of that function:
type Example = ReturnType<
  Extract<Column, { field: "id" }>["renderCell"]
>;

type Show = Example;
//          ^?
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// But there is a simpler solution!
type Mapped = {
  [K in Column["field"]]: ReturnType<
    Extract<Column, { field: K }>["renderCell"]
  >;
};
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// We _can_ iterate over Column, as long as we then
// remap the key using 'as' to a valid key:
type Mapped = {
  [Col in Column as Col["field"]]: Col;
};
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// This is the same setup as we had before,
// except Col is now the type of the Column object,
// not just 'field':
type Mapped = {
  [Col in Column as Col["field"]]: Col;
};
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// This means we can just grab renderCell
// directly on Col:
type Mapped = {
  [Col in Column as Col["field"]]: Col["renderCell"];
};
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// And then use ReturnType on it:
type Mapped = {
  [Col in Column as Col["field"]]: ReturnType<
    Col["renderCell"]
  >;
};
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

type Mapped = {
  [Col in Column as Col["field"]]: ReturnType<
    Col["renderCell"]
  >;
};

// And with that change, we've done it.
type Show = Mapped;
//   ^?
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// Here's the first approach, using Extract:
type Mapped = {
  [K in Column["field"]]: ReturnType<
    Extract<Column, { field: K }>["renderCell"]
  >;
};

type Show = Mapped;
//   ^?
```

```ts !!
// @errors: 2322
const columns = [
  {
    field: "notes",
    renderCell: () => "something",
  },
  {
    field: "id",
    renderCell: () => 123123,
  },
] as const;

// ---cut---
type Column = (typeof columns)[number];

// And here's the second, using key remapping:
type Mapped = {
  [Col in Column as Col["field"]]: ReturnType<
    Col["renderCell"]
  >;
};

type Show = Mapped;
//   ^?
```
