import {
  Config,
  WebpackOverrideFn,
} from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";
import type { CodeHikeConfig } from "codehike/mdx";

const chConfig: CodeHikeConfig = {
  syntaxHighlighting: {
    theme: "dark-plus",
  },
};

const enableMdx: WebpackOverrideFn = async (
  currentConfiguration,
) => {
  const { remarkCodeHike, recmaCodeHike } =
    await import("codehike/mdx");
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules
          ? currentConfiguration.module.rules
          : []),
        {
          test: /\.mdx?$/,
          use: [
            {
              loader: "@mdx-js/loader",
              options: {
                remarkPlugins: [
                  [remarkCodeHike, chConfig],
                ],
                recmaPlugins: [
                  [recmaCodeHike, chConfig],
                ],
              },
            },
          ],
        },
      ],
    },
  };
};

Config.overrideWebpackConfig(
  async (currentConfiguration) => {
    return enableMdx(
      await enableTailwind(currentConfiguration),
    );
  },
);

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
