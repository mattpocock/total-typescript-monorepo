export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

const invalidChars = /[\\/:*?"<>|]/;

export function validateWindowsFilename(filename: string): ValidationResult {
  // Check for invalid characters
  if (invalidChars.test(filename)) {
    return {
      isValid: false,
      error:
        'Filename contains invalid characters. Cannot contain: \\ / : * ? " < > |',
    };
  }

  // Check for trailing period or space
  if (filename.endsWith(".") || filename.endsWith(" ")) {
    return {
      isValid: false,
      error: "Filename cannot end with a period or space",
    };
  }

  // Check length
  if (filename.length > 255) {
    return {
      isValid: false,
      error: "Filename cannot be longer than 255 characters",
    };
  }

  return { isValid: true };
}
