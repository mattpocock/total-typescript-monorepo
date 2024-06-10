import { rendererClassic } from "@shikijs/twoslash";
import { createTransformerFactory } from "@shikijs/twoslash/core";
import { createTwoslashFromCDN } from "twoslash-cdn";
import { createStorage } from "unstorage";
import { codeToHtml } from "shiki";
import type { CompilerOptions } from "typescript";
import fsDriver from "unstorage/drivers/fs";
import path = require("path");

const storage = createStorage({
  driver: (fsDriver as any)({
    base: path.resolve(process.cwd(), ".twoslash-lint", "cache"),
  }),
});

const compilerOptions: CompilerOptions = {
  target: 9 /* ES2022 */,
  strict: true,
  allowJs: true,
  checkJs: true,
  noEmit: true,
  module: 99 /* ESNext */,
  moduleResolution: 100 /* Bundler */,
  jsx: 2 /* React */,
};

const twoslash = createTwoslashFromCDN({
  storage,
  compilerOptions,
});

export const transformerTwoslash = createTransformerFactory(twoslash.runSync)({
  renderer: rendererClassic(),
  throws: true,
  twoslashOptions: {
    compilerOptions,
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
    await twoslash.prepareTypes(opts.code);
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
