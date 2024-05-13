import { LoaderFunctionArgs } from "@remix-run/node";
import { AbsolutePath } from "@total-typescript/shared";
import { readFileSync } from "fs";

export const loader = async (args: LoaderFunctionArgs) => {
  const path = args.params.path as AbsolutePath;

  const fileContents = readFileSync(path);

  return new Response(fileContents, {
    headers: {
      "Content-Type": "video/mp4",
    },
  });
};
