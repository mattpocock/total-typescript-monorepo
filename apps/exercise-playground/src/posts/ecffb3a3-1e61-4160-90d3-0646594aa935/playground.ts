// http://localhost:3004/posts/ecffb3a3-1e61-4160-90d3-0646594aa935/edit

import Fastify from "fastify";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { setTimeout } from "timers/promises";

const server = Fastify();

server.get("/", async (req, reply) => {
  const iterable = async function* () {
    while (true) {
      await setTimeout(500);
      yield "Hello, world!";
      console.log("Yielded");
    }
  };
  reply.header("Content-Type", "application/octet-stream");

  await pipeline(Readable.from(iterable()), reply.raw);
});

await server.listen({
  port: 3008,
});
