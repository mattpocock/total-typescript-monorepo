import { z } from "zod";

export const Checkbox = z.enum(["on", "off"]).transform((val) => val === "on");
