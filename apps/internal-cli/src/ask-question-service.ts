import { Context, Effect } from "effect";
import readline from "node:readline/promises";

type AskQuestionServiceShape = {
  askQuestion: (question: string) => Effect.Effect<string>;
};

export class AskQuestionService extends Context.Tag("AskQuestionService")<
  AskQuestionService,
  AskQuestionServiceShape
>() {}

export const realAskQuestionService = AskQuestionService.of({
  askQuestion: (question) => {
    return Effect.promise(async (signal) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await rl.question(question, {
        signal,
      });

      rl.close();

      return answer;
    });
  },
});
