import { beforeAll, beforeEach } from "vitest";
import { p } from "../app/db";

if (!process.env.DATABASE_URL?.includes("localhost")) {
  throw new Error("DATABASE_URL is not targeting localhost");
}

const allTables = [
  "exerciseVideoTake",
  "exercise",
  "section",
  "course",
  "analyticsEvent",
  "socialPostToSocialPostCollection",
  "socialPost",
  "socialPostCollection",
] as const;

const clearAllTables = async () => {
  await p.$transaction(
    allTables.map((table) => (p[table] as any).deleteMany())
  );
};

beforeAll(async () => {
  await p.$connect();
  await clearAllTables();
});

beforeEach(async () => await clearAllTables());
