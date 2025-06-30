import { Layer } from "effect";
import { FFmpegCommandsService } from "./ffmpeg-commands.js";
import { OpenAILayerLive } from "./layers.js";
import { ReadStreamLayerLive } from "./layers.js";
import { AskQuestionLayerLive } from "./layers.js";
import { ArticleStorageService } from "./services.js";
import { OBSIntegrationService } from "./services.js";
import { TranscriptStorageService } from "./services.js";
import { AIService } from "./services.js";
import { NodeFileSystem } from "@effect/platform-node";
import { LinksStorageService } from "./services.js";
import { WorkflowsService } from "./workflows.js";

export const AppLayerLive = Layer.mergeAll(
  FFmpegCommandsService.Default,
  OpenAILayerLive,
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
