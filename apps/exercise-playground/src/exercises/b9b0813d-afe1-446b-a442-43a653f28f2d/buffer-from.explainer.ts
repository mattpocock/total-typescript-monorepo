// http://localhost:3004/courses/exercises/b9b0813d-afe1-446b-a442-43a653f28f2d/edit

import { it } from "vitest";

const bufferFromString = Buffer.from("abc", "utf-8");

const bufferFromArray = Buffer.from([0, 1, 2, 3, 4]);

const bufferFromBuffer = Buffer.from(bufferFromArray);

const bufferFromUint8Array = Buffer.from(new Uint8Array([0, 1, 2, 3, 4]));
