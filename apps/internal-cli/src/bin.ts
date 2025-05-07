#!/usr/bin/env node

import { Command } from "commander";
import { commands } from "./commands.js";
import { toDashCase } from "@total-typescript/shared";
import packageJson from "../package.json" with { type: "json" };
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";

const program = new Command();

program.version(packageJson.version);

commands.forEach((command) => {
  let cliCommand = command.cliCommand;

  if (command.args) {
    cliCommand += ` ${command.args
      .map((arg) => {
        return `<${toDashCase(arg)}>`;
      })
      .join(" ")}`;
  }

  program
    .command(cliCommand)
    .action(command.run)
    .description(command.description);
});

program
  .command("append-video-to-timeline [video]")
  .aliases(["a", "append"])
  .description("Append video to the current timeline")
  .action(async (video: string | undefined) => {
    await appendVideoToTimeline(video);
  });

program.parse(process.argv);
