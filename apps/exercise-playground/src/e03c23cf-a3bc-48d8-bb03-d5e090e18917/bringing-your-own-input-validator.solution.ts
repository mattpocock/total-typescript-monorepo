// http://localhost:3004/courses/exercises/e03c23cf-a3bc-48d8-bb03-d5e090e18917/edit

import type { Equal, Expect } from "@total-typescript/helpers";
import { initTRPC, TRPCError } from "@trpc/server";
import { expect, it } from "vitest";

const t = initTRPC.create();

const publicProcedure = t.procedure;

const appRouter = t.router({
  greetMe: publicProcedure
    .input((input) => {
      if (
        typeof input === "object" &&
        input &&
        "name" in input &&
        typeof input.name === "string"
      ) {
        return {
          name: input.name,
        };
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You must pass a name",
      });
    })
    .query(({ input }) => {
      type test = Expect<Equal<typeof input, { name: string }>>;

      return `Hello, ${input.name}!`;
    }),
});

it("Should force you to pass a name to the greetMe procedure", async () => {
  const caller = t.createCallerFactory(appRouter)({});

  await expect(
    caller.greetMe(
      // @ts-expect-error - missing name
      {}
    )
  ).rejects.toStrictEqual(
    new TRPCError({
      code: "BAD_REQUEST",
      message: "You must pass a name",
    })
  );

  await expect(caller.greetMe({ name: "Alice" })).resolves.toBe(
    "Hello, Alice!"
  );
});
