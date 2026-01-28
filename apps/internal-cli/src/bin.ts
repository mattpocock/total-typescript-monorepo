#!/usr/bin/env node

import { Command } from "commander";
import { config } from "dotenv";
import path from "node:path";
import packageJson from "../package.json" with { type: "json" };
import { register as registerAppendVideoToTimeline } from "./commands/append-video-to-timeline.js";
import { register as registerConcatenateVideos } from "./commands/concatenate-videos.js";
import { register as registerCreateTimeline } from "./commands/create-timeline.js";
import { register as registerCreateVideoFromClips } from "./commands/create-video-from-clips.js";
import { register as registerEditInterview } from "./commands/edit-interview.js";
import { register as registerExportInterview } from "./commands/export-interview.js";
import { register as registerGetClipsFromLatestVideo } from "./commands/get-clips-from-latest-video.js";
import { register as registerLogLatestObsVideo } from "./commands/log-latest-obs-video.js";
import { register as registerMoveInterviewToDavinciResolve } from "./commands/move-interview-to-davinci-resolve.js";
import { register as registerMoveRawFootageToLongTermStorage } from "./commands/move-raw-footage-to-long-term-storage.js";
import { register as registerNotify } from "./commands/notify.js";
import { register as registerProcessInformationRequests } from "./commands/process-information-requests.js";
import { register as registerProcessQueue } from "./commands/process-queue.js";
import { register as registerQueueAutoEditedVideoForCourse } from "./commands/queue-auto-edited-video-for-course.js";
import { register as registerQueueStatus } from "./commands/queue-status.js";
import { register as registerRetryQueueItem } from "./commands/retry-queue-item.js";
import { register as registerSendClipsToDavinciResolve } from "./commands/send-clips-to-davinci-resolve.js";
import { register as registerTranscribeClips } from "./commands/transcribe-clips.js";

config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

const program = new Command();

program.version(packageJson.version);

// Register commands
registerAppendVideoToTimeline(program);
registerConcatenateVideos(program);
registerCreateTimeline(program);
registerCreateVideoFromClips(program);
registerEditInterview(program);
registerExportInterview(program);
registerGetClipsFromLatestVideo(program);
registerLogLatestObsVideo(program);
registerMoveInterviewToDavinciResolve(program);
registerMoveRawFootageToLongTermStorage(program);
registerNotify(program);
registerProcessInformationRequests(program);
registerProcessQueue(program);
registerQueueAutoEditedVideoForCourse(program);
registerQueueStatus(program);
registerRetryQueueItem(program);
registerSendClipsToDavinciResolve(program);
registerTranscribeClips(program);

program.parse(process.argv);
