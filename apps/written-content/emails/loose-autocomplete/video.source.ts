// @errors: 2322
type Color =
  | "primary"
  | "secondary"
  | "tertiary"
  | (string & {});

// This means we get the best of both worlds: autocomplete,
// with the correct widening of the type.
const example: Color = "primary";

const shouldAlsoBeFine: Color = "#fff";
