import { useEffect, useRef } from "react";

declare const Table: React.FC<{
  ref: React.Ref<HTMLTableElement>;
}>;

// ---cut---
// And even any custom components!
type Element = React.ElementRef<typeof Table>;
//   ^?
