import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { p } from "~/db";
import { editExerciseUrl } from "~/routes";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const exerciseWithLargestOrder = await p.exercise.findFirst({
    where: {
      sectionId: params.sectionId,
      deleted: false,
    },
    orderBy: {
      order: "desc",
    },
    select: {
      order: true,
    },
  });

  const exercise = await p.exercise.create({
    data: {
      title: formData.get("title") as string,
      learningGoal: formData.get("learningGoal") as string,
      sectionId: params.sectionId!,
      order: exerciseWithLargestOrder ? exerciseWithLargestOrder.order + 1 : 0,
      content: "",
    },
  });

  await p.analyticsEvent.create({
    data: {
      payload: {
        exerciseId: exercise.id,
      },
      type: "EXERCISE_CREATED",
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? editExerciseUrl(exercise.id));
};
