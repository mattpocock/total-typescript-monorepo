import { AskQuestionService } from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import { Effect } from "effect";

export const promptForFilename = () => {
  return Effect.gen(function* () {
    const askQuestionService = yield* AskQuestionService;

    const question = "Enter the name for your video (without extension): ";

    const answer = yield* askQuestionService.askQuestion(question);

    return answer;
  });
};

export const promptForVideoSelection = (
  videos: Array<{ title: string; value: AbsolutePath; mtime: Date }>
) => {
  return Effect.gen(function* () {
    const askQuestionService = yield* AskQuestionService;

    const question = "Choose a video to transcribe:";

    const answer = yield* askQuestionService.select(question, videos);

    return answer;
  });
};
