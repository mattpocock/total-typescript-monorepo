import { describe, expect, it } from "vitest";
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

  describe("get", () => {
    it("Should retrieve all sections and exercises", async () => {
      const courseInDb = await p.course.create({
        data: {
          title: "abc",
          type: "WORKSHOP",
          sections: {
            create: {
              order: 0,
              title: "My Section",
              exercises: {
                create: {
                  order: 0,
                  title: "My Exercise",
                },
              },
            },
          },
        },
      });

      const result = await serverFunctions.courses.get({ id: courseInDb.id });

      expect(result).toMatchObject({
        id: courseInDb.id,
        title: "abc",
        sections: [
          {
            title: "My Section",
            exercises: [
              // Should have one exercise, but
              // we don't retrieve the title
              {},
            ],
          },
        ],
      });
    });

    it("Should not retrieve deleted sections", async () => {
      const courseInDb = await p.course.create({
        data: {
          title: "abc",
          type: "WORKSHOP",
          sections: {
            create: {
              order: 0,
              title: "My Section",
              deleted: true,
            },
          },
        },
      });

      const result = await serverFunctions.courses.get({ id: courseInDb.id });

      expect(result).toMatchObject({
        sections: [],
      });
    });

    it("Should not retrieve deleted exercises", async () => {
      const courseInDb = await p.course.create({
        data: {
          title: "abc",
          type: "WORKSHOP",
          sections: {
            create: {
              order: 0,
              title: "My Section",
              exercises: {
                create: {
                  order: 0,
                  title: "My Exercise",
                  deleted: true,
                },
              },
            },
          },
        },
      });

      const result = await serverFunctions.courses.get({ id: courseInDb.id });

      expect(result).toMatchObject({
        sections: [
          {
            exercises: [],
          },
        ],
      });
    });

    it("Should retrieve deleted courses", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      await serverFunctions.courses.delete({
        id: course.id,
      });

      const courseInDb = await serverFunctions.courses.get({
        id: course.id,
      });

      expect(courseInDb).toMatchObject({
        id: course.id,
        title: "abc",
        deleted: true,
      });
    });
  });

  describe("create", () => {
    it("Should create a course", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
        type: "WORKSHOP",
        repoSlug: "abc-slug",
      });

      const courseInDb = await serverFunctions.courses.get({
        id: course.id,
      });

      expect(courseInDb).toMatchObject({
        id: course.id,
        title: "abc",
        type: "WORKSHOP",
        repoSlug: "abc-slug",
      });
    });
  });

  describe("update", () => {
    it("Should update a course", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
        type: "WORKSHOP",
      });

      await serverFunctions.courses.update({
        id: course.id,
        title: "new-abc",
        repoSlug: "new-abc-slug",
        type: "TUTORIAL",
      });

      const courseInDb = await serverFunctions.courses.get({
        id: course.id,
      });

      expect(courseInDb).toMatchObject({
        id: course.id,
        title: "new-abc",
        repoSlug: "new-abc-slug",
        type: "TUTORIAL",
      });
    });
  });

  describe("delete", () => {
    it("Should delete the course", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
        type: "WORKSHOP",
      });

      await serverFunctions.courses.delete({
        id: course.id,
      });

      expect(await serverFunctions.courses.list()).toHaveLength(0);
    });
  });
});
