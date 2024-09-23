import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { p } from "~/db";
import { courseUrl } from "~/routes";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { courseId } = params;

  const body = await request.json();

  const sections = body as { id: string }[];

  await p.$transaction(
    sections.map((e, index) => {
      return p.section.update({
        where: {
          id: e.id,
        },
        data: {
          order: index,
        },
      });
    })
  );

  return redirect(courseUrl(courseId!));
};
