import {
  HTML_RENDERER_FROM_CODE_URL,
  HTML_RENDERER_FROM_FILE_URL,
  htmlRendererFromCodeSchema,
  htmlRendererFromFileUrlSchema,
  IMAGE_SERVER_PORT,
} from "@total-typescript/twoslash-shared";
import fastify from "fastify";
import fastq from "fastq";
import { takeCodeImage } from "./take-code-image.js";
import type { AbsolutePath } from "@total-typescript/shared";

const CONCURRENCY = 2;

let getPath: () => AbsolutePath | undefined = () => undefined;

const screenshotQueue = fastq.promise(takeCodeImage, CONCURRENCY);

const fastifyServer = fastify();

fastifyServer.get("/render-from-uri", async (req, reply) => {
  const result = htmlRendererFromFileUrlSchema.safeParse(req.params);

  if (!result.success) {
    reply.status(400).send(result.error.message);
    return;
  }

  const urlToTakeScreenshotOf = `${HTML_RENDERER_FROM_FILE_URL}?${new URLSearchParams(
    req.params as Record<string, string>
  )}`;

  const image = await screenshotQueue.push(urlToTakeScreenshotOf);

  reply
    .status(200)
    .headers({
      "Content-Type": "image/png",
      // Cache for 5 minutes
      "Cache-Control": "max-age=6000, public",
    })
    .send(image);
});

fastifyServer.get("/render-from-code", async (req, reply) => {
  const result = htmlRendererFromCodeSchema.safeParse(req.params);

  if (!result.success) {
    reply.status(400).send(result.error.message);
    return;
  }

  const urlToTakeScreenshotOf = `${HTML_RENDERER_FROM_CODE_URL}?${new URLSearchParams(
    req.params as Record<string, string>
  )}`;

  const image = await screenshotQueue.push(urlToTakeScreenshotOf);

  reply
    .status(200)
    .headers({
      "Content-Type": "image/png",
      // Cache for 5 minutes
      "Cache-Control": "max-age=6000, public",
    })
    .send(image);
});

fastifyServer.get("/active-path", async (req, reply) => {
  const path = getPath();

  reply.status(200).send(path || undefined);
});

export const runImageServer = async (
  _getPath: () => AbsolutePath | undefined
) => {
  getPath = _getPath;
  await fastifyServer.listen({
    port: IMAGE_SERVER_PORT,
  });
};
