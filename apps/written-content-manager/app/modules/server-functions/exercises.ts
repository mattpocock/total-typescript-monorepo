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
};
