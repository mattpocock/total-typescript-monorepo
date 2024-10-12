import { z } from "zod";
import { createServerFunction } from "./utils";
import { getVSCodeFilesForPost } from "~/vscode-utils";
import path from "path";
import { readFileSync } from "fs";
import { Checkbox } from "~/schema";

export const courses = {
  list: createServerFunction(z.object({}), async ({ input, p }) => {
    const courses = await p.course.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    const exerciseCounts = await p.$transaction(
      courses.map((c) => {
        return p.exercise.count({
          where: {
            section: {
              courseId: c.id,
            },
            deleted: false,
          },
        });
      })
    );

    return courses.map((c, index) => ({
      ...c,
      exerciseCount: exerciseCounts[index]!,
    }));
  }),
};
