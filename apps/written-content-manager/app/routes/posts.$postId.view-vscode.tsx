import type { ActionFunctionArgs } from "@remix-run/node";
import { serverFunctions } from "~/modules/server-functions/server-functions";

export const action = async ({ params }: ActionFunctionArgs) => {
  const { postId } = params;

  await serverFunctions.posts.viewInVSCode({ id: postId! });

  return null;
};
