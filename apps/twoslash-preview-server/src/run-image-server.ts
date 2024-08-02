import {
  FRONTEND_APP_PORT,
  htmlRendererSchema,
  IMAGE_SERVER_PORT,
} from "@total-typescript/twoslash-shared";
import fastq from "fastq";
import { createServer } from "http";
import { takeCodeImage } from "./takeCodeImage.js";

const CONCURRENCY = 2;

const screenshotQueue = fastq.promise(takeCodeImage, CONCURRENCY);

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.end("No url");
    return;
  }

  const url = new URL(`http://localhost:${IMAGE_SERVER_PORT}${req.url}`);

  // If url is /render, send an image
  if (url.pathname === "/render") {
    const params = Object.fromEntries(url.searchParams);

    const result = htmlRendererSchema.safeParse(params);

    if (!result.success) {
      res.writeHead(400).end(result.error.message);
      return;
    }

    const urlToTakeScreenshotOf = `http://localhost:${FRONTEND_APP_PORT}/html-renderer?${new URLSearchParams(
      params,
    )}`;

    const image = await screenshotQueue.push(urlToTakeScreenshotOf);

    res.writeHead(200, {
      "Content-Type": "image/png",
      // Cache for 5 minutes
      "Cache-Control": "max-age=6000, public",
    });
    res.write(image);
    res.end();
    return;
  }

  res.writeHead(404).end("Not found");
});

export const runImageServer = async () => {
  server.listen(IMAGE_SERVER_PORT);
};
