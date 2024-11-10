import { buildApplication, buildCommand, run } from "@stricli/core";
import { run as summarize } from "./run.ts";

const command = buildCommand({
  docs: {
    brief: "Summarize a website",
  },
  parameters: {
    flags: {
      website: {
        kind: "parsed",
        parse: String,
        brief: "The URL of the website to summarize",
      },
    },
  },
  async func(flags: { website: string }) {
    await summarize(flags.website);
  },
});

const application = buildApplication(command, {
  name: "summarize-website",
});

await run(application, process.argv.slice(2), { process });
