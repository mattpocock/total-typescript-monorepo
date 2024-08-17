import {
  SCRIPTKIT_VSCODE_LOCATION,
  type AbsolutePath,
} from "@total-typescript/shared";
import { readFile } from "fs/promises";
import { ResultAsync } from "neverthrow";
import { z } from "zod";

const vscodeResultSchema = z.object({
  activeTextEditorFilePath: z.string().nullable(),
});

export const getActiveEditorFilePath = ResultAsync.fromThrowable(
  async () => {
    const result = JSON.parse(
      await readFile(SCRIPTKIT_VSCODE_LOCATION, "utf-8"),
    );

    const activeEditorFilePath = vscodeResultSchema.parse(result)
      .activeTextEditorFilePath as AbsolutePath | null;

    if (!activeEditorFilePath) {
      throw new Error("Active Editor Filepath found to be null");
    }

    return activeEditorFilePath;
  },
  (e) => {
    return new Error("Active Editor Filepath not found", { cause: e });
  },
);
