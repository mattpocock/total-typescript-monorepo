import { z } from "zod";
import { createServerFunction } from "./utils";
import {
  getDoesAudioExistForExercise,
  getExerciseDir,
  getVSCodeFilesForExercise,
} from "~/vscode-utils";
import path from "node:path";
import { sanitizeForVSCodeFilename } from "~/utils";
import type { AbsolutePath } from "@total-typescript/shared";
import { editExerciseUrl } from "~/routes";

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
    async ({ input, p, fs }) => {
      const exerciseWithHighestOrder = await p.exercise.findFirst({
        where: {
          sectionId: input.sectionId,
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
          order: exerciseWithHighestOrder
            ? exerciseWithHighestOrder.order + 1
            : 0,
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

  get: createServerFunction(
    z.object({ id: z.string().uuid() }),
    async ({ input, p, fs }) => {
      const exercise = await p.exercise.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        select: {
          section: {
            select: {
              id: true,
              title: true,
              order: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          id: true,
          title: true,
          deleted: true,
          description: true,
          learningGoal: true,
          audioTranscript: true,
          readyForRecording: true,
          notes: true,
          order: true,
        },
      });

      const files = await getVSCodeFilesForExercise(input.id);

      const audioExists = await getDoesAudioExistForExercise(input.id);

      return {
        ...exercise,
        files: files.map((file) => ({
          path: path.basename(file),
          fullPath: file,
          content: fs.readFileSync(file, "utf-8"),
        })),
        audioExists,
      };
    }
  ),

  createExplainerFile: createServerFunction(
    z.object({ id: z.string().uuid() }),
    async ({ input, p, fs }) => {
      const files = await getVSCodeFilesForExercise(input.id);

      if (files.length > 0) {
        throw new Error("Explainer file already exists");
      }

      const path = await import("node:path");

      const exercisePath = getExerciseDir(input.id);

      const exercise = await p.exercise.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        select: {
          title: true,
        },
      });

      const explainerFile = path.join(
        exercisePath,
        `${sanitizeForVSCodeFilename(exercise.title)}.explainer.ts`
      ) as AbsolutePath;

      const firstLine = `// http://localhost:3004${editExerciseUrl(input.id)}`;

      await fs.writeFile(explainerFile, firstLine);

      await fs.openInVSCode(explainerFile);

      return { filePath: explainerFile };
    }
  ),

  getPrevExercise: createServerFunction(
    z.object({
      id: z.string().uuid(),
    }),
    async ({ input, p }) => {
      const exercise = await p.exercise.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          section: {
            select: {
              id: true,
              course: {
                select: {
                  id: true,
                },
              },
              order: true,
            },
          },
          order: true,
        },
      });

      const [prevExercise, lastExerciseInPrevSection] = await p.$transaction([
        p.exercise.findFirst({
          where: {
            deleted: false,
            title: {
              not: "",
            },
            sectionId: exercise.section.id,
            order: {
              lt: exercise.order,
            },
          },
          orderBy: {
            order: "desc",
          },
          select: {
            id: true,
            title: true,
          },
        }),
        p.exercise.findFirst({
          where: {
            deleted: false,
            title: {
              not: "",
            },
            section: {
              courseId: exercise.section.course.id,
              order: {
                lt: exercise.section.order,
              },
            },
          },
          orderBy: [
            {
              section: {
                order: "desc",
              },
            },
            {
              order: "desc",
            },
          ],
          select: {
            id: true,
            title: true,
          },
        }),
      ]);

      return prevExercise ?? lastExerciseInPrevSection;
    }
  ),

  getNextExercise: createServerFunction(
    z.object({
      id: z.string().uuid(),
    }),
    async ({ input, p }) => {
      const exercise = await p.exercise.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          section: {
            select: {
              id: true,
              course: {
                select: {
                  id: true,
                },
              },
              order: true,
            },
          },
          order: true,
        },
      });

      const [nextExercise, firstExerciseInNextSection] = await p.$transaction([
        p.exercise.findFirst({
          where: {
            deleted: false,
            title: {
              not: "",
            },
            sectionId: exercise.section.id,
            order: {
              gt: exercise.order,
            },
          },
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            title: true,
          },
        }),
        p.exercise.findFirst({
          where: {
            deleted: false,
            title: {
              not: "",
            },
            section: {
              courseId: exercise.section.course.id,
              order: {
                gt: exercise.section.order,
              },
            },
          },
          orderBy: [
            {
              section: {
                order: "asc",
              },
            },
            {
              order: "asc",
            },
          ],
          select: {
            id: true,
            title: true,
          },
        }),
      ]);

      return nextExercise ?? firstExerciseInNextSection;
    }
  ),
};
