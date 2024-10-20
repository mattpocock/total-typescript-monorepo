import { describe, expect, it } from "vitest";
import { p } from "../../../db";
import { serverFunctions } from "../server-functions";

describe("sections", () => {
  describe("reorderOne", () => {
    it("Should be able to move the section forward in the order", async () => {
      const course = await p.course.create({
        data: {
          title: "abc",
          type: "WORKSHOP",
        },
      });
      const section1 = await p.section.create({
        data: {
          title: "abc",
          order: 0,
          courseId: course.id,
        },
      });

      const section2 = await p.section.create({
        data: {
          title: "abc",
          order: 1,
          courseId: course.id,
        },
      });

      const section3 = await p.section.create({
        data: {
          title: "abc",
          order: 2,
          courseId: course.id,
        },
      });

      await serverFunctions.sections.reorderOne({
        id: section1.id,
        direction: "forward",
      });

      expect(
        await p.section.findMany({
          orderBy: {
            order: "asc",
          },
        })
      ).toMatchObject([
        {
          id: section2.id,
          order: 0,
        },
        {
          id: section1.id,
          order: 1,
        },
        {
          id: section3.id,
          order: 2,
        },
      ]);
    });

    it("Should be able to move the section back in the order", async () => {
      const course = await p.course.create({
        data: {
          title: "abc",
          type: "WORKSHOP",
        },
      });
      const section1 = await p.section.create({
        data: {
          title: "abc",
          order: 0,
          courseId: course.id,
        },
      });

      const section2 = await p.section.create({
        data: {
          title: "abc",
          order: 1,
          courseId: course.id,
        },
      });

      const section3 = await p.section.create({
        data: {
          title: "abc",
          order: 2,
          courseId: course.id,
        },
      });

      await serverFunctions.sections.reorderOne({
        id: section3.id,
        direction: "back",
      });

      expect(
        await p.section.findMany({
          orderBy: {
            order: "asc",
          },
        })
      ).toMatchObject([
        {
          id: section1.id,
          order: 0,
        },
        {
          id: section3.id,
          order: 1,
        },
        {
          id: section2.id,
          order: 2,
        },
      ]);
    });

    it("Should do nothing if there is nothing to swap with forward", async () => {
      const course = await p.course.create({
        data: {
          title: "abc",
          type: "WORKSHOP",
        },
      });
      const section1 = await p.section.create({
        data: {
          title: "abc",
          order: 0,
          courseId: course.id,
        },
      });

      await serverFunctions.sections.reorderOne({
        id: section1.id,
        direction: "forward",
      });

      expect(
        await p.section.findFirstOrThrow({ where: { id: section1.id } })
      ).toMatchObject({
        order: 0,
      });
    });

    it("Should do nothing if there is nothing to swap with back", async () => {
      const course = await p.course.create({
        data: {
          title: "abc",
          type: "WORKSHOP",
        },
      });
      const section1 = await p.section.create({
        data: {
          title: "abc",
          order: 0,
          courseId: course.id,
        },
      });

      await serverFunctions.sections.reorderOne({
        id: section1.id,
        direction: "back",
      });

      expect(
        await p.section.findFirstOrThrow({ where: { id: section1.id } })
      ).toMatchObject({
        order: 0,
      });
    });
  });

  describe("reorderAll", () => {
    it("Should reorder the sections", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section1 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const section2 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const section3 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      await serverFunctions.sections.reorderAll({
        courseId: course.id,
        sectionIds: [section2.id, section3.id, section1.id],
      });

      const courseInDb = await serverFunctions.courses.get({
        id: course.id,
      });

      expect(courseInDb.sections).toMatchObject([
        {
          id: section2.id,
        },
        {
          id: section3.id,
        },
        {
          id: section1.id,
        },
      ]);
    });

    it("Should fail if not all the sections are specified", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section1 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const section2 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      await expect(
        serverFunctions.sections.reorderAll({
          courseId: course.id,
          sectionIds: [section1.id],
        })
      ).rejects.toThrowError("Not all sections specified");
    });
  });

  describe("add", () => {
    it("Should add a section to the course", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const courseInDb = await serverFunctions.courses.get({
        id: course.id,
      });

      expect(courseInDb.sections).toMatchObject([
        {
          id: section.id,
          title: "abc",
        },
      ]);
    });

    it("Should create an analytics event", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const analytics = await serverFunctions.analytics.allCounts();

      expect(analytics.sectionsCreatedToday).toEqual(1);
    });

    it("Should append each section to the bottom of the list", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section1 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const section2 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const section3 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const courseInDb = await serverFunctions.courses.get({
        id: course.id,
      });

      expect(courseInDb.sections).toMatchObject([
        {
          id: section1.id,
          order: 0,
        },
        {
          id: section2.id,
          order: 1,
        },
        {
          id: section3.id,
          order: 2,
        },
      ]);
    });
  });
});
