```ts twoslash
// Declare the columns as const
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

// Grab the type of the each column as a union type
type Column = (typeof columns)[number];

// Use a mapped type, mapping over the columns
// and using the `field` property as the key
type ColumnMap = {
  [Col in Column as Col["field"]]: Col["renderCell"];
};

type Example = ColumnMap;
//             ^?
```

```ts twoslash
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

type ToTuple<
  T extends readonly any[],
  Accum extends readonly any[] = [],
> = T extends readonly [
  { field: infer TField },
  ...infer TRest,
]
  ? ToTuple<TRest, [...Accum, TField]>
  : Accum;

type Result = ToTuple<typeof columns>;
//   ^?
```
