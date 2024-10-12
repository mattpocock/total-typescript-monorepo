import { serverFunctions } from "~/modules/server-functions/server-functions";
import { createJsonAction } from "~/utils";

export const action = createJsonAction(async (json, args) => {
  await serverFunctions.collections.linkExistingPost({
    postId: json.postId,
    collectionId: args.params.collectionId!,
  });

  return {
    success: true,
  };
});
