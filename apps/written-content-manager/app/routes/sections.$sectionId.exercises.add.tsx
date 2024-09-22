import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { p } from "~/db";
import { exerciseUrl } from "~/routes";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const order = await p.exercise.count({
    where: {
      sectionId: params.sectionId!,
    },
  });

  const exercise = await p.exercise.create({
    data: {
      title,
      sectionId: params.sectionId!,
      order: order + 1,
      content,
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? exerciseUrl(exercise.id));
};
