import { z } from "zod";
import { createServerFunction } from "./utils";

export const videos = {
  handleUploadedTake: createServerFunction(
    z.object({ exerciseId: z.string().uuid(), uri: z.string() }),
    async ({ input, p }) => {
      return p.exerciseVideoTake.create({
        data: {
          uri: input.uri,
          exerciseId: input.exerciseId,
        },
      });
    }
  ),
  listTakes: createServerFunction(
    z.object({ exerciseId: z.string().uuid() }),
    async ({ input, p }) => {
      return p.exerciseVideoTake.findMany({
        where: {
          exerciseId: input.exerciseId,
        },
        orderBy: [
          {
            isFinal: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });
    }
  ),
  deleteTake: createServerFunction(
    z.object({ id: z.string().uuid() }),
    async ({ input, p }) => {
      return p.exerciseVideoTake.delete({
        where: {
          id: input.id,
        },
      });
    }
  ),
  markTakeAsFinal: createServerFunction(
    z.object({ id: z.string().uuid() }),
    async ({ input, p }) => {
      const take = await p.exerciseVideoTake.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });

      const [, takeAfterUpdate] = await p.$transaction([
        p.exerciseVideoTake.updateMany({
          where: {
            id: {
              not: take.id,
            },
            exerciseId: take.exerciseId,
          },
          data: {
            isFinal: false,
          },
        }),
        p.exerciseVideoTake.update({
          data: {
            isFinal: true,
          },
          where: {
            id: take.id,
          },
        }),
        p.analyticsEvent.create({
          data: {
            type: "EXERCISE_VIDEO_RECORDING_MARKED_AS_FINAL",
            payload: {
              exerciseId: take.exerciseId,
            },
          },
        }),
      ]);

      return takeAfterUpdate;
    }
  ),
};
