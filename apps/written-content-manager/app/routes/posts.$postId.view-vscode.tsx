import type { ActionFunctionArgs } from "@remix-run/node";
import { ensureDir, execAsync } from "@total-typescript/shared";
import { writeFile } from "fs/promises";
import path from "path";
import { editPostUrl } from "~/routes";
import { getPostsDir, getVSCodeFilesForPost } from "~/vscode-utils";

export const action = async ({ params }: ActionFunctionArgs) => {
  const { postId } = params;

  const postsDir = getPostsDir(postId!);

  await ensureDir(postsDir);

  const files = await getVSCodeFilesForPost(postId!);

  if (files.length === 0) {
    const playgroundFile = path.join(postsDir, "playground.ts");
    await writeFile(
      playgroundFile,
      `// http://localhost:3004${editPostUrl(postId!)}`
    );

    const notesFile = path.join(postsDir, "notes.md");
    await writeFile(
      notesFile,
      [`# Notes`, ``, `http://localhost:3004${editPostUrl(postId!)}`].join("\n")
    );

    const threadFile = path.join(postsDir, "thread.md");
    await writeFile(threadFile, ``);
    await execAsync(`code "${threadFile}"`);
  } else {
    await execAsync(`code "${files[0]}"`);
  }

  return null;
};
