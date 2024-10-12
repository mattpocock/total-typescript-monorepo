import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { editPostUrl, postsUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { createJsonAction } from "~/utils";

export const action = createJsonAction(async (json, args) => {
  const post = await serverFunctions.posts.delete({
    id: args.params.postId!,
  });

  return redirect(postsUrl());
});
