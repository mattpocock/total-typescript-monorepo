import { SCRIPTKIT_VSCODE_LOCATION } from "@total-typescript/shared";
import { readJson } from "fs-extra";
import { z } from "zod";

const vscodeResultSchema = z.object({
  activeTextEditorFilePath: z.string().nullable(),
});

export const getActiveEditorFilePath = async (): Promise<string | null> => {
  const result = await readJson(SCRIPTKIT_VSCODE_LOCATION);

  const activeEditorFilePath =
    vscodeResultSchema.parse(result).activeTextEditorFilePath;

  return activeEditorFilePath;
};
