import { serverFunctions } from "~/modules/server-functions/server-functions";
import { createJsonAction } from "~/utils";

export const action = createJsonAction(async (json, args) => {
  await serverFunctions.collections.removePost({
    collectionId: args.params.collectionId!,
    postId: args.params.postId!,
  });

  return { success: true };
});
