import { applyNodeslash } from "@total-typescript/nodeslash";
import Fastify from "fastify";

const server = Fastify();

server.post<{
  Body: string;
  Reply: { 200: string };
}>("/", {
  schema: {
    body: {
      type: "string",
    },
  },
  handler: async (req, reply) => {
    const { terminalOutput } = await applyNodeslash(req.body);

    reply
      .header("access-control-allow-origin", "*")
      .code(200)
      .send(terminalOutput);
  },
});

await server.listen({
  port: 3006,
});
