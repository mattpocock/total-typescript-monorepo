import { trpc } from "~/trpc/client";
import { createJsonAction } from "~/utils";

export const clientAction = createJsonAction(async (json, args) => {
  await trpc.collections.addPost.mutate({
    postId: json.postId,
    collectionId: args.params.collectionId!,
  });

  return {
    hey: true,
  };
});
