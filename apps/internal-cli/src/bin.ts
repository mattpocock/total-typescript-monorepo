#!/usr/bin/env node

import { Command } from "commander";
import { commands } from "./commands.js";
import { toDashCase } from "@total-typescript/shared";
import packageJson from "../package.json" with { type: "json" };

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

program.parse(process.argv);
