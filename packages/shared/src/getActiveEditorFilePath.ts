import {
  SCRIPTKIT_VSCODE_LOCATION,
  type AbsolutePath,
} from "@total-typescript/shared";
import { readFile } from "fs/promises";
import { z } from "zod";

const vscodeResultSchema = z.object({
  activeTextEditorFilePath: z.string().nullable(),
});

export const getActiveEditorFilePath = async () => {
  const result = JSON.parse(await readFile(SCRIPTKIT_VSCODE_LOCATION, "utf-8"));

  const activeEditorFilePath = vscodeResultSchema.parse(result)
    .activeTextEditorFilePath as AbsolutePath | null;

  return activeEditorFilePath;
};
