#!/usr/bin/env node

import { Command } from "commander";
import { commands } from "./commands.js";

const program = new Command();

program.version("0.0.1");

commands.forEach((command) => {
  program
    .command(command.cliCommand)
    .action(command.run)
    .description(command.description);
});

program.parse(process.argv);
