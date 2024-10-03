import { expect, it } from "vitest";

it("Should create a course", async () => {
  await testPrismaClient.course.create({
    data: {
      title: "Test Course",
      type: "WORKSHOP",
    },
  });

  const course = await testPrismaClient.course.findFirstOrThrow({
    where: {
      title: "Test Course",
    },
  });

  expect(course.title).toBe("Test Course");
  expect(course.type).toBe("WORKSHOP");
});

it("Should delete everything after every test", async () => {
  const courses = await testPrismaClient.course.findMany();
  expect(courses.length).toBe(0);
});
