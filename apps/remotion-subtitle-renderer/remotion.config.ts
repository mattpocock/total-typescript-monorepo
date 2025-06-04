/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva444p10le");
Config.setCodec("prores");
Config.setProResProfile("4444");

// WSL2-specific optimizations
Config.setConcurrency(4); // Conservative for WSL2
Config.setOverwriteOutput(true);
Config.setChromiumHeadlessMode(true);
Config.setChromiumOpenGlRenderer("swiftshader");
Config.setChromiumDisableWebSecurity(true);

Config.overrideWebpackConfig(enableTailwind);
