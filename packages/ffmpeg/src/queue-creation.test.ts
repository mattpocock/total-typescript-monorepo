import { type AbsolutePath } from "@total-typescript/shared";
import { ConfigProvider, Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAutoEditedVideoQueueItems } from "./queue-creation.js";

const testConfig = ConfigProvider.fromMap(
  new Map([
    ["TRANSCRIPTION_DIRECTORY", "/test/transcriptions"],
    ["OBS_OUTPUT_DIRECTORY", "/test/obs-output"],
  ])
);

describe("createAutoEditedVideoQueueItems", () => {
  const baseOptions = {
    inputVideo: "/test/input/video.mp4" as AbsolutePath,
    videoName: "test-video",
    subtitles: true,
    dryRun: false,
    generateArticle: false,
  };

  it("should create only video queue item when generateArticle is false", async () => {
    const queueItems = await createAutoEditedVideoQueueItems(baseOptions).pipe(
      Effect.withConfigProvider(testConfig),
      Effect.runPromise
    );

    expect(queueItems).toHaveLength(1);

    const videoItem = queueItems[0]!;
    expect(videoItem.action.type).toBe("create-auto-edited-video");

    if (videoItem.action.type === "create-auto-edited-video") {
      expect(videoItem.action.inputVideo).toBe("/test/input/video.mp4");
      expect(videoItem.action.videoName).toBe("test-video");
      expect(videoItem.action.subtitles).toBe(true);
      expect(videoItem.action.dryRun).toBe(false);
    }
    expect(videoItem.status).toBe("ready-to-run");
    expect(videoItem.dependencies).toBeUndefined();
    expect(videoItem.id).toBeDefined();
    expect(videoItem.createdAt).toBeTypeOf("number");
  });

  it("should create 4 queue items with proper dependencies when generateArticle is true", async () => {
    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      generateArticle: true,
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    expect(queueItems).toHaveLength(4);

    // Check all items have unique IDs
    const ids = queueItems.map((item) => item.id);
    expect(new Set(ids)).toHaveLength(4);

    // Check action types in correct order
    expect(queueItems[0]!.action.type).toBe("create-auto-edited-video");
    expect(queueItems[1]!.action.type).toBe("analyze-transcript-for-links");
    expect(queueItems[2]!.action.type).toBe("links-request");
    expect(queueItems[3]!.action.type).toBe("generate-article-from-transcript");

    // Check dependency chain
    const videoId = queueItems[0]!.id;
    const transcriptAnalysisId = queueItems[1]!.id;
    const linksRequestId = queueItems[2]!.id;

    expect(queueItems[0]!.dependencies).toBeUndefined();
    expect(queueItems[1]!.dependencies).toEqual([videoId]);
    expect(queueItems[2]!.dependencies).toEqual([transcriptAnalysisId]);
    expect(queueItems[3]!.dependencies).toEqual([linksRequestId]);
  });

  it("should generate correct transcript and video paths", async () => {
    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      generateArticle: true,
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    const transcriptAnalysisItem = queueItems[1]!;
    const articleGenerationItem = queueItems[3]!;

    // Check transcript path
    if (transcriptAnalysisItem.action.type === "analyze-transcript-for-links") {
      expect(transcriptAnalysisItem.action.transcriptPath).toBe(
        "/test/transcriptions/video.txt"
      );
      expect(transcriptAnalysisItem.action.originalVideoPath).toBe(
        "/test/obs-output/video.mp4"
      );
    }

    if (
      articleGenerationItem.action.type === "generate-article-from-transcript"
    ) {
      expect(articleGenerationItem.action.transcriptPath).toBe(
        "/test/transcriptions/video.txt"
      );
      expect(articleGenerationItem.action.originalVideoPath).toBe(
        "/test/obs-output/video.mp4"
      );
    }
  });

  it("should handle different video options correctly", async () => {
    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      subtitles: false,
      dryRun: true,
      generateArticle: false,
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    const videoItem = queueItems[0]!;
    if (videoItem.action.type === "create-auto-edited-video") {
      expect(videoItem.action.subtitles).toBe(false);
      expect(videoItem.action.dryRun).toBe(true);
    }
  });

  it("should set correct dependency ID in article generation action", async () => {
    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      generateArticle: true,
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    const linksRequestId = queueItems[2]!.id;
    const articleGenerationItem = queueItems[3]!;

    if (
      articleGenerationItem.action.type === "generate-article-from-transcript"
    ) {
      expect(articleGenerationItem.action.linksDependencyId).toBe(
        linksRequestId
      );
    }
  });

  it("should handle complex video file paths correctly", async () => {
    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      inputVideo: "/complex/path/with spaces/video-file.mp4" as AbsolutePath,
      videoName: "complex-video-name",
      generateArticle: true,
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    const transcriptAnalysisItem = queueItems[1]!;

    if (transcriptAnalysisItem.action.type === "analyze-transcript-for-links") {
      expect(transcriptAnalysisItem.action.transcriptPath).toBe(
        "/test/transcriptions/video-file.txt"
      );
      expect(transcriptAnalysisItem.action.originalVideoPath).toBe(
        "/test/obs-output/video-file.mp4"
      );
    }
  });

  it("should initialize queue items with correct statuses", async () => {
    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      generateArticle: true,
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    // Video creation can run immediately
    expect(queueItems[0]!.status).toBe("ready-to-run");

    // Transcript analysis can run automatically (once dependencies are met)
    expect(queueItems[1]!.status).toBe("ready-to-run");

    // Links request requires user input
    expect(queueItems[2]!.status).toBe("requires-user-input");

    // Article generation can run automatically (once dependencies are met)
    expect(queueItems[3]!.status).toBe("ready-to-run");
  });

  it("should initialize links request with empty linkRequests array", async () => {
    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      generateArticle: true,
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    const linksRequestItem = queueItems[2]!;
    if (linksRequestItem.action.type === "links-request") {
      expect(linksRequestItem.action.linkRequests).toEqual([]);
    }
  });

  it("should use current timestamp for createdAt", async () => {
    const beforeTime = Date.now();

    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      generateArticle: true,
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    const afterTime = Date.now();

    queueItems.forEach((item) => {
      expect(item.createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(item.createdAt).toBeLessThanOrEqual(afterTime);
    });
  });

  it("should maintain action immutability between calls", async () => {
    const options = {
      ...baseOptions,
      generateArticle: true,
    };

    const queueItems1 = await createAutoEditedVideoQueueItems(options).pipe(
      Effect.withConfigProvider(testConfig),
      Effect.runPromise
    );

    const queueItems2 = await createAutoEditedVideoQueueItems(options).pipe(
      Effect.withConfigProvider(testConfig),
      Effect.runPromise
    );

    // IDs should be different (new UUIDs generated)
    expect(queueItems1[0]!.id).not.toBe(queueItems2[0]!.id);

    // But action content should be the same
    if (
      queueItems1[0]!.action.type === "create-auto-edited-video" &&
      queueItems2[0]!.action.type === "create-auto-edited-video"
    ) {
      expect(queueItems1[0]!.action.videoName).toBe(
        queueItems2[0]!.action.videoName
      );
    }

    if (
      queueItems1[1]!.action.type === "analyze-transcript-for-links" &&
      queueItems2[1]!.action.type === "analyze-transcript-for-links"
    ) {
      expect(queueItems1[1]!.action.transcriptPath).toBe(
        queueItems2[1]!.action.transcriptPath
      );
    }
  });

  it("should include code fields in article generation when no code is provided", async () => {
    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      generateArticle: true,
      // No codePath or codeContent provided
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    const articleGenerationItem = queueItems[3]!;
    expect(articleGenerationItem.action.type).toBe("generate-article-from-transcript");
    
    if (articleGenerationItem.action.type === "generate-article-from-transcript") {
      expect(articleGenerationItem.action.codePath).toBe("");
      expect(articleGenerationItem.action.codeContent).toBe("");
    }
    
    expect(articleGenerationItem.status).toBe("ready-to-run");
  });

  it("should include code fields in article generation when code is provided", async () => {
    const testCodePath = "/path/to/test-file.ts";
    const testCodeContent = "console.log('Hello, world!');";

    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      generateArticle: true,
      codePath: testCodePath,
      codeContent: testCodeContent,
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    const articleGenerationItem = queueItems[3]!;
    expect(articleGenerationItem.action.type).toBe("generate-article-from-transcript");
    
    if (articleGenerationItem.action.type === "generate-article-from-transcript") {
      expect(articleGenerationItem.action.codePath).toBe(testCodePath);
      expect(articleGenerationItem.action.codeContent).toBe(testCodeContent);
    }
    
    expect(articleGenerationItem.status).toBe("ready-to-run");
  });

  it("should handle partial code data gracefully", async () => {
    const queueItems = await createAutoEditedVideoQueueItems({
      ...baseOptions,
      generateArticle: true,
      codePath: "/path/to/file.ts",
      // No codeContent provided
    }).pipe(Effect.withConfigProvider(testConfig), Effect.runPromise);

    const articleGenerationItem = queueItems[3]!;
    
    if (articleGenerationItem.action.type === "generate-article-from-transcript") {
      expect(articleGenerationItem.action.codePath).toBe("/path/to/file.ts");
      expect(articleGenerationItem.action.codeContent).toBe("");
    }
    
    expect(articleGenerationItem.status).toBe("ready-to-run");
  });
});
