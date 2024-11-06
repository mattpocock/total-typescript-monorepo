import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { createFormDataAction } from "~/utils";

export const action = createFormDataAction(async (json, args) => {
  await serverFunctions.concepts.delete({
    id: args.params.conceptId!,
  });
  return redirect("/concepts");
});
