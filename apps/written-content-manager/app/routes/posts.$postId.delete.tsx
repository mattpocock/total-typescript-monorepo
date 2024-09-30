import { redirect } from "@remix-run/react";
import { editPostUrl, postsUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { createJsonAction } from "~/utils";

export const clientAction = createJsonAction(async (json, args) => {
  const post = await trpc.posts.delete.mutate({
    id: args.params.postId!,
  });

  return redirect(postsUrl());
});
