import { NextApiHandler } from "next";
import { takeCodeImage } from "../../takeCodeImage";
import { codeSnippetImageSchema } from "../../types";

export const config = {
  api: {
    responseLimit: false,
  },
};

const handler: NextApiHandler = async (req, res) => {
  const result = codeSnippetImageSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json(result.error);
  }

  const { encodedHtml } = result.data;

  const searchParams = new URLSearchParams({
    encodedHtml,
    index: result.data.index,
  });

  const base = {
    basic: "http://localhost:3000/snippet",
    "all-square": "http://localhost:3000/snippet/all-square",
  }[result.data.mode];

  const url = `${base}?${searchParams.toString()}`;

  try {
    const image = await takeCodeImage(url);

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(image);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export default handler;
