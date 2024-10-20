import { z } from "zod";
import { createServerFunction } from "./utils";

export const sections = {
  add: createServerFunction(
    z.object({ courseId: z.string().uuid(), title: z.string() }),
    async ({ input, p }) => {
      const sectionWithHighestOrder = await p.section.findFirst({
        where: {
          courseId: input.courseId,
        },
        select: {
          order: true,
        },
        orderBy: {
          order: "desc",
        },
      });

      const section = await p.section.create({
        data: {
          order: sectionWithHighestOrder
            ? sectionWithHighestOrder.order + 1
            : 0,
          title: input.title,
          courseId: input.courseId,
        },
      });
      await p.analyticsEvent.create({
        data: {
          type: "SECTION_CREATED",
          payload: {
            sectionId: section.id,
          },
        },
      });

      return section;
    }
  ),
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
