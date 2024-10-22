import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { exec, type ExecOptions } from "child_process";

export interface NodeSlashResult {
  terminalOutput: string;
  isError: boolean;
}

export const execAsync = (command: string, opts?: ExecOptions) => {
  return new Promise<{
    stdout: string;
    stderr: string;
  }>((resolve, reject) => {
    exec(command, opts, (e, stdout, stderr) => {
      if (e) {
        resolve({ stdout: "", stderr: e.message });
      }

      resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
    });
  });
};

const cleanStderr = (stderr: string) => {
  return stderr
    .split("\n")
    .filter((line) => !line.includes("file://"))
    .join("\n");
};

export const applyNodeslash = async (
  code: string
): Promise<NodeSlashResult> => {
  const workingDirectory = await mkdtemp(path.join(tmpdir(), "nodeslash-"));

  const packageJsonFile = path.join(workingDirectory, "package.json");

  await writeFile(packageJsonFile, JSON.stringify({ type: "module" }));

  const codeFile = path.join(workingDirectory, "index.js");

  await writeFile(codeFile, code);

  const { stdout, stderr } = await execAsync(
    `node --experimental-strip-types index.js`,
    { cwd: workingDirectory }
  );

  return {
    isError: !!stderr,
    terminalOutput: (stdout + cleanStderr(stderr)).trim(),
  };
};
