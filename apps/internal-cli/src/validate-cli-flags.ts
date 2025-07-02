import { Effect, Data } from "effect";

export interface CreateVideoOptions {
  upload?: boolean;
  subtitles?: boolean;
  generateArticle?: boolean;
  alongside?: boolean;
}

export class FlagValidationError extends Data.TaggedError("FlagValidationError")<{
  errorMessage: string;
  helpMessages: string[];
}> {}

export const validateCreateVideoFlags = (
  options: CreateVideoOptions
): Effect.Effect<void, FlagValidationError> => {
  // Validate that alongside flag is only used with generate-article
  if (options.alongside && !options.generateArticle) {
    return Effect.fail(
      new FlagValidationError({
        errorMessage: "❌ The --alongside flag can only be used with --generate-article.",
        helpMessages: [
          "💡 Use: pnpm cli create-auto-edited-video --generate-article --alongside"
        ],
      })
    );
  }

  // Validate that alongside and upload flags are not used together
  if (options.alongside && options.upload) {
    return Effect.fail(
      new FlagValidationError({
        errorMessage: "❌ The --alongside and --upload flags cannot be used together.",
        helpMessages: [
          "💡 Use either: pnpm cli create-auto-edited-video --generate-article --alongside",
          "💡 Or: pnpm cli create-auto-edited-video --generate-article --upload"
        ],
      })
    );
  }

  // If we reach here, validation passed
  return Effect.succeed(void 0);
};