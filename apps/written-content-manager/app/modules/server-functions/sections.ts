import { z } from "zod";
import { createServerFunction } from "./utils";

export const sections = {
  reorder: createServerFunction(
    z.object({
      direction: z.enum(["forward", "back"]),
      id: z.string().uuid(),
    }),
    async ({ input, p }) => {
      const section = await p.section.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });

      const sectionToSwapWith = await p.section.findFirst({
        where: {
          courseId: section.courseId,
          order:
            input.direction === "forward"
              ? {
                  gt: section.order,
                }
              : {
                  lt: section.order,
                },
        },
        orderBy: {
          order: input.direction === "forward" ? "asc" : "desc",
        },
      });

      if (!sectionToSwapWith) return section;

      const [modifiedSection] = await p.$transaction([
        p.section.update({
          where: {
            id: section.id,
          },
          data: {
            order: sectionToSwapWith.order,
          },
        }),
        p.section.update({
          where: {
            id: sectionToSwapWith.id,
          },
          data: {
            order: section.order,
          },
        }),
      ]);

      return modifiedSection;
    }
  ),
};
