import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { editCollectionUrl } from "~/routes";

export const action = async (args: ActionFunctionArgs) => {
  const collection = await serverFunctions.posts.addNewCollection({
    id: args.params.postId!,
  });

  return redirect(editCollectionUrl(collection.id));
};
