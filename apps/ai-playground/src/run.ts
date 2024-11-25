import { execSync } from "child_process";
import enquirer from "enquirer";
import { readdir } from "fs/promises";
import path from "path";

const dir = path.join(import.meta.dirname, "examples");

const files = await readdir(dir);

const fileToRun = await enquirer
  .prompt<{ file: string }>({
    choices: files.map((file) => ({
      name: file,
    })),
    message: "Which file should be run?",
    type: "select",
    name: "file",
  })
  .then((res) => path.join(dir, res.file));

execSync(`pnpm braintrust eval ${fileToRun}`, {
  cwd: dir,
  stdio: "inherit",
});
