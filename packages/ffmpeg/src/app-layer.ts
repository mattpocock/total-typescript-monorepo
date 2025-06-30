import { Layer } from "effect";
import { FFmpegCommandsService } from "./ffmpeg-commands.js";
import { ReadStreamLayerLive } from "./layers.js";
import { AskQuestionLayerLive } from "./layers.js";
import { ArticleStorageService, OpenAIService } from "./services.js";
import { OBSIntegrationService } from "./services.js";
import { TranscriptStorageService } from "./services.js";
import { AIService } from "./services.js";
import { NodeFileSystem } from "@effect/platform-node";
import { LinksStorageService } from "./services.js";
import { WorkflowsService } from "./workflows.js";

export const AppLayerLive = Layer.mergeAll(
  OpenAIService.Default,
  FFmpegCommandsService.Default,
  ReadStreamLayerLive,
  AskQuestionLayerLive,
  ArticleStorageService.Default,
  OBSIntegrationService.Default,
  TranscriptStorageService.Default,
  AIService.Default,
  NodeFileSystem.layer,
  LinksStorageService.Default,
  WorkflowsService.Default
);
