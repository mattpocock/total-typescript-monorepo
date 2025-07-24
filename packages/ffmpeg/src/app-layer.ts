import { NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";
import { FFmpegCommandsService } from "./ffmpeg-commands.js";
import {
  AIService,
  ArticleStorageService,
  AskQuestionService,
  LinksStorageService,
  OBSIntegrationService,
  ReadStreamService,
  TranscriptStorageService,
} from "./services.js";
import { WorkflowsService } from "./workflows.js";
import { OBSWatcherService } from "./obs-watcher-service.js";

export const AppLayerLive = Layer.mergeAll(
  FFmpegCommandsService.Default,
  ReadStreamService.Default,
  AskQuestionService.Default,
  ArticleStorageService.Default,
  OBSIntegrationService.Default,
  TranscriptStorageService.Default,
  AIService.Default,
  NodeFileSystem.layer,
  LinksStorageService.Default,
  WorkflowsService.Default,
  OBSWatcherService.Default
);
