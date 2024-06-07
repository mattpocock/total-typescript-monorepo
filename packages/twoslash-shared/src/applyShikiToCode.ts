import { rendererClassic } from "@shikijs/twoslash";
import { createTransformerFactory } from "@shikijs/twoslash/core";
import { createTwoslashFromCDN } from "twoslash-cdn";
import { createStorage } from "unstorage";
import { codeToHtml } from "shiki";

const storage = createStorage();

const LANGS = ["typescript", "ts", "js", "json", "tsx", "html", "bash"];

const twoslash = createTwoslashFromCDN({
  storage,
  compilerOptions: {
    lib: ["dom", "dom.iterable", "es2022"],
    target: 9 /* ES2022 */,
    strict: true,
  },
});

export const transformerTwoslash = createTransformerFactory(twoslash.runSync)({
  renderer: rendererClassic(),
  throws: true,
  langs: LANGS,
  twoslashOptions: {
    compilerOptions: {
      lib: ["dom", "dom.iterable", "es2022"],
      target: 9 /* ES2022 */,
      strict: true,
    },
  },
});

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
      transformers: [transformerTwoslash],
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
