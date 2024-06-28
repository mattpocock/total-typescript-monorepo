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
