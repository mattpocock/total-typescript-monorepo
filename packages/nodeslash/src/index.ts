import type { ExecOptions } from "child_process";

export interface NodeSlashResult {
  terminalOutput: string;
  isError: boolean;
  code: string;
}

export const execAsync = async (command: string, opts?: ExecOptions) => {
  const { exec } = await import("child_process");

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
  const { mkdtemp, writeFile } = await import("fs/promises");
  const path = await import("path");
  const { tmpdir } = await import("os");
  const workingDirectory = await mkdtemp(path.join(tmpdir(), "nodeslash-"));

  const packageJsonFile = path.join(workingDirectory, "package.json");

  await writeFile(packageJsonFile, JSON.stringify({ type: "module" }));

  const codeFile = path.join(workingDirectory, "index.js");

  await writeFile(codeFile, code);

  const { stdout, stderr } = await execAsync(
    `node --experimental-strip-types --no-warnings index.js`,
    { cwd: workingDirectory }
  );

  const terminalOutput =
    stdout || stderr
      ? [`Matts-Air:playground matt$`, stdout + cleanStderr(stderr)]
          .join("\n")
          .trim()
      : "";

  return {
    isError: !!stderr,
    terminalOutput,
    code,
  };
};
