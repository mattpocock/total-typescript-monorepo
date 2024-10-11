import { PrismaClient } from "@prisma/client";
import { beforeEach } from "vitest";

if (!process.env.DATABASE_URL?.includes("localhost")) {
  throw new Error("DATABASE_URL is not targeting localhost");
}

declare global {
  var testPrismaClient: PrismaClient;
  var p: PrismaClient;
}

globalThis.testPrismaClient = new PrismaClient({
  datasourceUrl: "postgresql://postgres@localhost:5432/postgres",
});

globalThis.p = testPrismaClient;

const allTables = [
  "exercise",
  "section",
  "course",
  "analyticsEvent",
  "socialPostToSocialPostCollection",
  "socialPost",
  "socialPostCollection",
] as const;

beforeEach(async () => {
  await p.$transaction(
    allTables.map((table) => (p[table] as any).deleteMany())
  );
});
