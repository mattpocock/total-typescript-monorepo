import { Effect } from "effect";

const invalidChars = /[\\/:*?"<>|]/;

class InvalidFilenameError extends Error {
  readonly _tag = "InvalidFilenameError";
}

export function validateWindowsFilename(filename: string) {
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
