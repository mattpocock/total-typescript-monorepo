// Nominal types

type AbsolutePath = string;
type RelativePath = string;

const absolutePath: AbsolutePath = "/path/to/file";
const relativePath: RelativePath = "../../file";

const acceptsAbsolutePath = (path: AbsolutePath) => path;

acceptsAbsolutePath(relativePath); // How do we make this error?
