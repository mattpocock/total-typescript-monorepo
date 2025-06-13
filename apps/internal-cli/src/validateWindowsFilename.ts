import { Effect } from "effect";

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

const invalidChars = /[\\/:*?"<>|]/;

export class InvalidFilenameError extends Error {
  readonly _tag = "InvalidFilenameError";
  constructor(public override message: string) {
    super();
  }
}

export function validateWindowsFilename(
  filename: string
): Effect.Effect<string, InvalidFilenameError> {
  // Check for invalid characters
  if (invalidChars.test(filename)) {
    return Effect.fail(
      new InvalidFilenameError(
        'Filename contains invalid characters. Cannot contain: \\ / : * ? " < > |'
      )
    );
  }

  // Check for trailing period or space
  if (filename.endsWith(".") || filename.endsWith(" ")) {
    return Effect.fail(
      new InvalidFilenameError("Filename cannot end with a period or space")
    );
  }

  // Check length
  if (filename.length > 255) {
    return Effect.fail(
      new InvalidFilenameError("Filename cannot be longer than 255 characters")
    );
  }

  return Effect.succeed(filename);
}
