import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { p } from "~/db";
import { sectionUrl } from "~/routes";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { sectionId } = params;

  const body = await request.json();

  const exercises = body as { id: string }[];

  await p.$transaction(
    exercises.map((e, index) => {
      return p.exercise.update({
        where: {
          id: e.id,
        },
        data: {
          order: index,
        },
      });
    })
  );

  return redirect(sectionUrl(sectionId!));
};
