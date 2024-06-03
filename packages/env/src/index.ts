import { config } from "dotenv";
import path from "path";
import { z } from "zod";

config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

const envSchema = z.object({
  OBS_OUTPUT_MODE: z
    .enum(["desktop", "external-drive"])
    .default("external-drive"),
  EXTERNAL_DRIVE_ROOT: z.string(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Error parsing .env file");
  console.error(result.error.message);
  process.exit(1);
}

export const env = result.data;
