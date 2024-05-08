import {
  SCRIPTKIT_VSCODE_LOCATION,
  type AbsolutePath,
} from "@total-typescript/shared";
import { readJSON } from "fs-extra/esm";
import { z } from "zod";

const vscodeResultSchema = z.object({
  activeTextEditorFilePath: z.string().nullable(),
});

export const getActiveEditorFilePath = async () => {
  const result = await readJSON(SCRIPTKIT_VSCODE_LOCATION);

  const activeEditorFilePath = vscodeResultSchema.parse(result)
    .activeTextEditorFilePath as AbsolutePath | null;

  return activeEditorFilePath;
};
