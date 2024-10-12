import { describe, expect, it, vitest } from "vitest";
import { p } from "../../../db";
import { serverFunctions } from "../server-functions";

describe("courses", () => {
  describe("list", () => {
    it("Should list all courses and associated exercises", async () => {
      const course = await p.course.create({
        data: {
          title: "Course",
          type: "WORKSHOP",
          sections: {
            create: {
              order: 0,
              title: "Section",
              exercises: {
                createMany: {
                  data: [
                    {
                      order: 0,
                      title: "Exercise 1",
                    },
                    {
                      order: 1,
                      title: "Exercise 2",
                    },
                  ],
                },
              },
            },
          },
        },
      });

      const result = await serverFunctions.courses.list();

      expect(result).toMatchObject([
        {
          id: course.id,
          exerciseCount: 2,
        },
      ]);
    });
  });
});
