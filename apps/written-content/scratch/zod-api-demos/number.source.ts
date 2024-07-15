import { z } from "zod";

const uuid = z.string().uuid();
const nanoid = z.string().nanoid();
const cuid = z.string().cuid();
const cuid2 = z.string().cuid2();
const ulid = z.string().ulid();
