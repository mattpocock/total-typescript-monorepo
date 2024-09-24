import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { p } from "~/db";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { exerciseId } = params;

  await p.exercise.update({
    where: {
      id: exerciseId,
    },
    data: {
      deleted: true,
    },
  });

  await p.analyticsEvent.create({
    data: {
      payload: {
        exerciseId,
      },
      type: "EXERCISE_DELETED",
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  if (redirectTo) {
    return redirect(redirectTo);
  }

  return true;
};
