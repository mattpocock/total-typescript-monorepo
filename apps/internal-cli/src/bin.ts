#!/usr/bin/env node

import { Command } from "commander";
import { config } from "dotenv";
import path from "node:path";
import packageJson from "../package.json" with { type: "json" };
import { register as registerClips } from "./commands/clips/index.js";
import { register as registerNotify } from "./commands/notify.js";
import { register as registerQueue } from "./commands/queue/index.js";
import { register as registerResolve } from "./commands/resolve/index.js";

config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

const program = new Command();

program.version(packageJson.version);

// Register commands
registerClips(program);
registerNotify(program);
registerQueue(program);
registerResolve(program);

program.parse(process.argv);
