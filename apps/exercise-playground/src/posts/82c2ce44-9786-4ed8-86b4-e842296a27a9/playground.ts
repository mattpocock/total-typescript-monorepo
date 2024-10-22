// http://localhost:3004/posts/82c2ce44-9786-4ed8-86b4-e842296a27a9/edit

import { mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

await mkdtemp(path.join(tmpdir(), "playground-"));
