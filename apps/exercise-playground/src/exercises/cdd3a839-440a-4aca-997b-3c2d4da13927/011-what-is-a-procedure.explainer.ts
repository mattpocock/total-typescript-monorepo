import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

const publicProcedure = t.procedure;

// 1. We can define reusable procedures that can be used across multiple routes
const loggedProcedure = publicProcedure.use(async (opts) => {
  // Logs the start time of the request
  const start = Date.now();

  // Runs the request
  const result = await opts.next();

  // Logs the duration of the request
  const durationMs = Date.now() - start;
  // Prepares meta ready for logging
  const meta = { path: opts.path, type: opts.type, durationMs };

  // Logs the result of the request, using console.log for OK requests
  // and console.error for non-OK requests
  result.ok
    ? console.log("OK request timing:", meta)
    : console.error("Non-OK request timing", meta);

  return result;
});

export const router = t.router({
  // 2. myFirstQuery now inherits from loggedProcedure, meaning
  // that it will be logged when it is called
  myFirstQuery: loggedProcedure.input(z.string()).query(({ input }) => {
    return `Hello, ${input}!`;
  }),
});