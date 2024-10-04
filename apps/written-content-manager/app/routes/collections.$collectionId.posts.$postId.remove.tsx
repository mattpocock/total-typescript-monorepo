import { trpc } from "~/trpc/client";
import { createJsonAction } from "~/utils";

export const clientAction = createJsonAction(async (json, args) => {
  await trpc.collections.removePost.mutate({
    collectionId: args.params.collectionId!,
    postId: args.params.postId!,
  });

  return { success: true };
});
