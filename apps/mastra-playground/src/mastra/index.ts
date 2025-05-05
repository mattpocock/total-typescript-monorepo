import { Mastra } from "@mastra/core";
import { fileSystemAgent } from "./agents/file-system-agent";
import { writerAgent } from "./agents/writer";
import { AgentNetwork } from "@mastra/core/network";
import { anthropic } from "@ai-sdk/anthropic";

const mainNetwork = new AgentNetwork({
  agents: [writerAgent, fileSystemAgent],
  model: anthropic("claude-3-5-sonnet-20240620"),
  instructions: `
    Coordinate specialized agents to complete tasks.
    You have access to a file system agent.
    You have access to a writer agent.
  `,
  name: "main",
});
export const mastra = new Mastra({
  agents: {
    fileSystem: fileSystemAgent,
    writer: writerAgent,
  },
  networks: {
    main: mainNetwork,
  },
});
