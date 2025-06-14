import path from "path";

export const DAVINCI_RESOLVE_SCRIPTS_LOCATION = path.resolve(
  import.meta.dirname ?? "", // Added as a hack for now
  "..",
  "..",
  "resolve-scripts",
  "scripts"
);
