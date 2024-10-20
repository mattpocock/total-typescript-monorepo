import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { postsUrl } from "~/routes";
import { createFormDataAction } from "~/utils";

export const action = createFormDataAction(async (json, args) => {
  const post = await serverFunctions.posts.delete({
    id: args.params.postId!,
  });

  return redirect(postsUrl());
});
