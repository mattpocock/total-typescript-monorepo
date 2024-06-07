import { rendererClassic, transformerTwoslash } from "@shikijs/twoslash";
import type { CodeSnippet } from "@total-typescript/twoslash-shared";
import { codeToHtml } from "shiki";

export type ApplyShikiSuccess = {
  success: true;
  html: string;
};

export type ApplyShikiFailure = {
  success: false;
  title: string;
  description: string;
  recommendation: string;
};

export const applyShikiToCode = async (opts: {
  code: string;
  lang: string;
}): Promise<ApplyShikiSuccess | ApplyShikiFailure> => {
  try {
    const result = await codeToHtml(opts.code, {
      lang: opts.lang,
      theme: "dark-plus",
      transformers: [
        transformerTwoslash({
          throws: true,
          renderer: rendererClassic(),
        }),
      ],
    });

    return {
      success: true,
      html: result.toString(),
    };
  } catch (e: any) {
    if (e?.title && e?.description && e?.recommendation) {
      return {
        success: false,
        title: e.title,
        description: e.description,
        recommendation: e.recommendation,
      };
    }

    throw e;
  }
};
