import { config } from "dotenv";
import path from "path";
import { z } from "zod";

config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

const envSchema = z.object({
  OBS_OUTPUT_DIRECTORY: z.string(),
  DAVINCI_EXPORT_DIRECTORY: z.string(),
  LONG_TERM_FOOTAGE_STORAGE_DIRECTORY: z.string(),
  DROPBOX_DIRECTORY: z.string(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Error parsing .env file");
  console.error(result.error.message);
  process.exit(1);
}

export const env = result.data;
