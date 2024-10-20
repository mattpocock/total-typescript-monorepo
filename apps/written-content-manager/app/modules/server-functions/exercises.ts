import { z } from "zod";
import { createServerFunction } from "./utils";

export const exercises = {
  moveSection: createServerFunction(
    z.object({ exerciseId: z.string().uuid(), sectionId: z.string().uuid() }),
    async ({ input, p }) => {
      return await p.exercise.update({
        where: {
          id: input.exerciseId,
        },
        data: {
          sectionId: input.sectionId,
        },
      });
    }
  ),

  create: createServerFunction(
    z.object({
      sectionId: z.string().uuid(),
      title: z.string(),
    }),
    async ({ input, p }) => {
      const exercise = await p.exercise.create({
        data: {
          order: 0,
          title: input.title,
          sectionId: input.sectionId,
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

      return exercise;
    }
  ),
};
