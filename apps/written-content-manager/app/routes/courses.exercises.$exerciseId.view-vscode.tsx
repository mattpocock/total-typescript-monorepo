import type { ActionFunctionArgs } from "@remix-run/node";
import { execAsync } from "@total-typescript/shared";
import { getVSCodeFiles } from "~/vscode-utils";

export const action = async ({ params }: ActionFunctionArgs) => {
  const { exerciseId } = params;

  const files = await getVSCodeFiles(exerciseId!);

  if (files.length === 0) {
    throw new Response("No files found", { status: 404 });
  } else {
    await execAsync(`code "${files[0]}"`);
  }

  return null;
};
