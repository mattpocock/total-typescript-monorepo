import {
  FRONTEND_APP_PORT,
  htmlRendererFromCodeSchema,
  htmlRendererFromFileUrlSchema,
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

  // If url is /render-from-uri, send an image
  if (url.pathname === "/render-from-uri") {
    const params = Object.fromEntries(url.searchParams);

    const result = htmlRendererFromFileUrlSchema.safeParse(params);

    if (!result.success) {
      res.writeHead(400).end(result.error.message);
      return;
    }

    const urlToTakeScreenshotOf = `http://localhost:${FRONTEND_APP_PORT}/html-renderer-from-file-uri?${new URLSearchParams(
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
  } else if (url.pathname === "/render-from-code") {
    const params = Object.fromEntries(url.searchParams);

    const result = htmlRendererFromCodeSchema.safeParse(params);

    if (!result.success) {
      res.writeHead(400).end(result.error.message);
      return;
    }

    const urlToTakeScreenshotOf = `http://localhost:${FRONTEND_APP_PORT}/html-renderer-from-code?${new URLSearchParams(
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
