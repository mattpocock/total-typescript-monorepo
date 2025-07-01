import { FileSystem } from "@effect/platform";
import { type AbsolutePath } from "@total-typescript/shared";
import { Data, Effect } from "effect";
import { AIService } from "./services.js";

export const analyzeTranscriptForLinks = Effect.fn("analyzeTranscriptForLinks")(
  function* (opts: {
    transcriptPath: AbsolutePath;
    originalVideoPath: AbsolutePath;
  }) {
    const { transcriptPath } = opts;
    const fs = yield* FileSystem.FileSystem;
    const ai = yield* AIService;

    yield* Effect.logDebug(
      `Analyzing transcript for links: ${transcriptPath}`
    );

    // Read the transcript content
    const transcriptContent = yield* fs.readFileString(transcriptPath).pipe(
      Effect.mapError((error) => {
        return new TranscriptReadError({
          transcriptPath,
          cause: error,
        });
      })
    );

    // Handle empty transcript
    if (!transcriptContent.trim()) {
      yield* Effect.logWarning(`Empty transcript found: ${transcriptPath}`);
      return [];
    }

    // Use AI service to generate link requests
    const linkRequests = yield* ai.askForLinks({
      transcript: transcriptContent,
    }).pipe(
      Effect.mapError((error) => {
        return new TranscriptAnalysisError({
          transcriptPath,
          cause: error,
        });
      })
    );

    yield* Effect.logDebug(
      `Generated ${linkRequests?.length || 0} link requests for ${transcriptPath}`
    );

    return linkRequests || [];
  }
);

export class TranscriptReadError extends Data.TaggedError(
  "TranscriptReadError"
)<{
  transcriptPath: AbsolutePath;
  cause: unknown;
}> {}

export class TranscriptAnalysisError extends Data.TaggedError(
  "TranscriptAnalysisError"
)<{
  transcriptPath: AbsolutePath;
  cause: unknown;
}> {}