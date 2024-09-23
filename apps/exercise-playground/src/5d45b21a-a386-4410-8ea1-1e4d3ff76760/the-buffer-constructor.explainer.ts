// http://localhost:3004/courses/exercises/5d45b21a-a386-4410-8ea1-1e4d3ff76760/edit

import { it } from "vitest";

// These two buffers are the same! Sneaky buggers
const sneakyBuffer = new Buffer(3);
const obviouslyUnsafeBuffer = Buffer.allocUnsafe(3);
