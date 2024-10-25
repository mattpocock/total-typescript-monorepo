// http://localhost:3004/courses/exercises/fec3bbe4-1fd7-4f2b-8bd7-7cef2d088369/edit

import { initTRPC } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { Equal, Expect } from "@total-typescript/helpers";

const t = initTRPC.context().create({
  transformer: superjson,
});

const publicProcedure = t.procedure;

const appRouter = t.router({
  getServerTime: publicProcedure.query(() => {
    return new Date();
  }),
  getUniqueNames: publicProcedure.query(() => {
    return new Set(["Matt", "Pocock"]);
  }),
});

const client = createTRPCClient<typeof appRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3008",
      transformer: superjson,
    }),
  ],
});

const server = createHTTPServer({
  router: appRouter,
});

server.listen(3008);

describe("getServerTime", () => {
  it(`Should return the server's time as a date`, async () => {
    const result = await client.getServerTime.query();

    type test = Expect<Equal<typeof result, Date>>;

    expect(result).toBeInstanceOf(Date);
  });
});

describe("getUniqueNames", () => {
  it(`Should return a set of unique names`, async () => {
    const result = await client.getUniqueNames.query();

    type test = Expect<Equal<typeof result, Set<string>>>;

    expect(result).toEqual(new Set(["Matt", "Pocock"]));
  });
});
