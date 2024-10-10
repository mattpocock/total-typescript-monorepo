import { redirect } from "@remix-run/react";
import { editPostUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { createJsonAction } from "~/utils";

export const clientAction = createJsonAction(async (_, args) => {
  const result = await trpc.collections.addNewPost.mutate({
    collectionId: args.params.collectionId!,
  });

  return redirect(editPostUrl(result.socialPostId));
});
