import { expect, it } from "vitest";
import { p } from "../../app/db";

it("Should create a course", async () => {
  await p.course.create({
    data: {
      title: "Test Course",
      type: "WORKSHOP",
    },
  });

  const course = await p.course.findFirstOrThrow({
    where: {
      title: "Test Course",
    },
  });

  expect(course.title).toBe("Test Course");
  expect(course.type).toBe("WORKSHOP");
});

it("Should delete everything after every test", async () => {
  const courses = await p.course.findMany();
  expect(courses.length).toBe(0);
});
