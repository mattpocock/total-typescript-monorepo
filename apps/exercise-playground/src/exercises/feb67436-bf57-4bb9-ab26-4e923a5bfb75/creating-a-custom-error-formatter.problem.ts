// http://localhost:3004/courses/exercises/feb67436-bf57-4bb9-ab26-4e923a5bfb75/edit

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { expect, it } from "vitest";
import { z } from "zod";

const t = initTRPC.context().create({
  errorFormatter(opts) {
    const { shape, error } = opts;

    return "Oh dear";
  },
});

const publicProcedure = t.procedure;

const appRouter = t.router({
  sayHello: publicProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
      })
    )
    .query(({ input }) => {
      return `Hello ${input.firstName} ${input.lastName}`;
    }),
});

const server = createHTTPServer({
  router: appRouter,
});

server.listen(3008);

const client = createTRPCClient<typeof appRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3008",
    }),
  ],
});

it("Should error if the incorrect input is passed", async () => {
  await expect(
    client.sayHello.query({
      FIRST_NAME: "Matt",
      LAST_NAME: "Pocock",
    })
  ).rejects.toThrowError("Oh dear");
});
