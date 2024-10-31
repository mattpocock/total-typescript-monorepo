import { errAsync, ResultAsync } from "neverthrow";
import type { AbsolutePath } from "./types.js";

export const getActiveEditorFilePath = (): ResultAsync<AbsolutePath, Error> => {
  return errAsync(new Error("getActiveEditorFilePath is no longer working"));
};
