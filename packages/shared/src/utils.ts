import { exec } from "./exec.js";
import type { AbsolutePath } from "./types.js";

export const revealInFileExplorer = async (file: AbsolutePath) => {
  if (process.platform === "win32") {
    await exec`explorer /select,${file}`;
  } else if (process.platform === "darwin") {
    await exec`open -R ${file}`;
  }
};

export const exitProcessWithError = (message: string) => {
  console.error(message);
  process.exit(1);
};
