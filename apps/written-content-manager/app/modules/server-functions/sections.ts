import { z } from "zod";
import { createServerFunction } from "./utils";

export const sections = {
  create: createServerFunction(
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
  reorderAll: createServerFunction(
    z.object({
      courseId: z.string().uuid(),
      sectionIds: z.array(z.string().uuid()).min(1),
    }),
    async ({ input, p }) => {
      const sectionsCount = await p.section.count({
        where: {
          courseId: input.courseId,
        },
      });

      if (input.sectionIds.length !== sectionsCount) {
        throw new Error("Not all sections specified");
      }

      await p.$transaction(
        input.sectionIds.map((id, index) => {
          return p.section.update({
            where: {
              id,
            },
            data: {
              order: index,
            },
          });
        })
      );
    }
  ),
  reorderOne: createServerFunction(
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
