import * as fs from "fs/promises";
import { ResultAsync, safeTry } from "neverthrow";
import { TOTAL_TYPESCRIPT_REPOS_LOCATION } from "@total-typescript/shared";

export const migrations = [];

const readdir = ResultAsync.fromThrowable(
  fs.readdir,
  (e) => new Error("readdir error", { cause: e }),
);

export const getRepos = (): ResultAsync<string[], Error> => {
  return safeTry(async function* () {
    const repos = yield* readdir(TOTAL_TYPESCRIPT_REPOS_LOCATION).safeUnwrap();
    return repos;
  });
};
