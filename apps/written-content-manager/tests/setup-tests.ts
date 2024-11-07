import {
  afterEach,
  beforeAll,
  beforeEach,
  vitest,
  type MockInstance,
} from "vitest";
import { p } from "../app/db";
import { createTmpDir } from "~/modules/server-functions/tests/test-utils";
import { rm } from "fs/promises";
import { fs } from "~/fs";

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
  "contentWorkflowRunStep",
  "contentWorkflowRun",
  "contentWorkflowStep",
  "contentWorkflow",
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

beforeEach(async () => {
  globalThis.testPaths = {
    exercisePlaygroundPath: (await createTmpDir()).dir,
    postsPlaygroundPath: (await createTmpDir()).dir,
    reposDir: (await createTmpDir()).dir,
  };
});

afterEach(async () => {
  if (globalThis.testPaths) {
    await Promise.all(
      Object.values(globalThis.testPaths).map((path) =>
        rm(path, { recursive: true })
      )
    );
  }
});

let openInVSCodeMock: MockInstance;

beforeEach(() => {
  openInVSCodeMock = vitest.spyOn(fs, "openInVSCode").mockResolvedValue();
});

afterEach(() => {
  openInVSCodeMock.mockRestore();
});
