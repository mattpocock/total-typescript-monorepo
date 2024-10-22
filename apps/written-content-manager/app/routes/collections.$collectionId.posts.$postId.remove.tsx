import { serverFunctions } from "~/modules/server-functions/server-functions";
import { createFormDataAction } from "~/utils";

export const action = createFormDataAction(async (json, args) => {
  console.log(args.params);
  await serverFunctions.collections.removePost({
    collectionId: args.params.collectionId!,
    postId: args.params.postId!,
  });

  return { success: true };
});
