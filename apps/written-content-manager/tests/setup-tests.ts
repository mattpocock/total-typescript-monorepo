import { PrismaClient } from "@prisma/client";
import { beforeEach } from "vitest";

declare global {
  var testPrismaClient: PrismaClient;
  var p: PrismaClient;
}

globalThis.testPrismaClient = new PrismaClient({
  datasourceUrl: "postgresql://postgres@localhost:5432/postgres",
});

globalThis.p = testPrismaClient;

beforeEach(async () => {
  await p.$transaction([p.course.deleteMany(), p.section.deleteMany()]);
});
