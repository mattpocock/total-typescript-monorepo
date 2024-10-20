import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { editCollectionUrl } from "~/routes";
import { createFormDataAction } from "~/utils";

export const action = createFormDataAction(async (json, args) => {
  const collection = await serverFunctions.collections.create();

  return redirect(editCollectionUrl(collection.id));
});
