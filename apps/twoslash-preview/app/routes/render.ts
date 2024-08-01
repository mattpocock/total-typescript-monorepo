import type { LoaderFunctionArgs } from "@remix-run/node";
import { takeCodeImage } from "~/takeCodeImage";
import { htmlRendererSchema } from "~/types";

export const loader = async (args: LoaderFunctionArgs) => {
  const url = new URL(args.request.url);

  const searchParams = Object.fromEntries(url.searchParams);

  htmlRendererSchema.parse(searchParams);

  const urlToTakeScreenshotOf = `http://localhost:3003/html-renderer?${new URLSearchParams(
    searchParams,
  )}`;

  const image = await takeCodeImage(urlToTakeScreenshotOf);

  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
