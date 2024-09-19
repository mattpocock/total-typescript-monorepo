import { PrismaClient } from "@prisma/client";
import { beforeEach } from "vitest";

declare global {
  var testPrismaClient: PrismaClient;
  var tpc: PrismaClient;
}

globalThis.testPrismaClient = new PrismaClient({
  datasourceUrl: "postgresql://postgres@localhost:5432/postgres",
});

globalThis.tpc = testPrismaClient;

beforeEach(async () => {
  await tpc.$transaction([tpc.course.deleteMany()]);
});
