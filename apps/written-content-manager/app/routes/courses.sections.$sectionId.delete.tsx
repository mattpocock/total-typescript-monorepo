import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { p } from "~/db";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { sectionId } = params;

  await p.section.delete({
    where: {
      id: sectionId,
    },
  });

  await p.analyticsEvent.create({
    data: {
      payload: {
        sectionId,
      },
      type: "SECTION_DELETED",
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  if (redirectTo) {
    return redirect(redirectTo);
  }

  return true;
};
