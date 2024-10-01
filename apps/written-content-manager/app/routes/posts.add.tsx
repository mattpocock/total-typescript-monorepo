import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { p } from "~/db";
import { editPostUrl } from "~/routes";

export const action = async ({ request }: ActionFunctionArgs) => {
  const post = await p.socialPost.create({
    data: {
      title: "",
    },
  });

  await p.analyticsEvent.create({
    data: {
      payload: {
        postId: post.id,
      },
      type: "POST_CREATED",
    },
  });

  return redirect(editPostUrl(post.id));
};
