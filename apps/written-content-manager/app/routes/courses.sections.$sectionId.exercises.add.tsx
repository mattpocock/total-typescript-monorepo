import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { p } from "~/db";
import { editExerciseUrl } from "~/routes";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const order = await p.exercise.count({
    where: {
      sectionId: params.sectionId!,
      deleted: false,
    },
  });

  const exercise = await p.exercise.create({
    data: {
      title: formData.get("title") as string,
      learningGoal: formData.get("learningGoal") as string,
      sectionId: params.sectionId!,
      order: order + 1,
      content: "",
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? editExerciseUrl(exercise.id));
};
