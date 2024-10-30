import type { ActionFunctionArgs } from "@remix-run/node";
import { redirectDocument } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { editPostUrl } from "~/routes";

export const action = async () => {
  const post = await serverFunctions.posts.create({
    title: "",
  });

  return redirectDocument(editPostUrl(post.id));
};
