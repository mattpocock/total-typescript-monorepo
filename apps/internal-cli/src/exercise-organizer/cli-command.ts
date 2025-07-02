import { type AbsolutePath } from "@total-typescript/shared";
import { ConfigProvider, Effect } from "effect";
import { NodeFileSystem } from "@effect/platform-node";
import { parseExerciseDirectory, validateExerciseDirectory } from "./parser.js";
import {
  generateConsoleReport,
  generateJsonReport,
  generateMarkdownReport,
  reportValidationResult,
} from "./reporter.js";
import { type ExerciseOrganizerOptions } from "./types.js";

// ============================================================================
// Main CLI Command Handler
// ============================================================================

export const runExerciseOrganizer = (
  directory: string | undefined,
  options: ExerciseOrganizerOptions
) => Effect.gen(function* () {
  // Use current directory if none specified
  const targetDirectory = directory || process.cwd();

  // Validation-only mode
  if (options.validate) {
    const result = yield* validateExerciseDirectory(targetDirectory);
    yield* reportValidationResult(result);
    return result;
  }

  // Full analysis mode
  const parseResult = yield* parseExerciseDirectory(targetDirectory);

  // Generate and output report based on format
  switch (options.format) {
    case 'json':
      const jsonReport = yield* generateJsonReport(parseResult);
      yield* Effect.log(jsonReport);
      break;
    
    case 'markdown':
      const markdownReport = yield* generateMarkdownReport(parseResult);
      yield* Effect.log(markdownReport);
      break;
    
    case 'table':
    default:
      yield* generateConsoleReport(parseResult);
      break;
  }

  return {
    hasErrors: parseResult.hasErrors,
    errorCount: parseResult.validationErrors.length,
    orphanedFileCount: parseResult.orphanedFiles.length,
    totalExercises: parseResult.totalExercises,
    sections: parseResult.sections.length,
  };
});

// ============================================================================
// Command Integration Helpers
// ============================================================================

export const createExerciseOrganizerCommand = () => {
  return {
    command: "exercise-organizer [directory]",
    aliases: ["eo", "exercises"],
    description: "Analyze and organize TypeScript exercise files",
    options: [
      {
        flags: "-v, --validate",
        description: "Validate exercises and exit with status code",
      },
      {
        flags: "--format <type>",
        description: "Output format: table, json, markdown",
        defaultValue: "table",
      },
      {
        flags: "--verbose",
        description: "Enable verbose output",
      },
    ],
    action: async (directory: string | undefined, options: ExerciseOrganizerOptions) => {
      const result = await runExerciseOrganizer(directory, options).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(NodeFileSystem.layer),
        Effect.runPromise
      );
      
      // Exit with non-zero code if there are errors (useful for CI)
      if (options.validate && result.hasErrors) {
        process.exit(1);
      }
      
      return result;
    },
  };
};

// ============================================================================
// Quick Analysis Functions (for testing and development)
// ============================================================================

export const quickAnalyze = (directory?: string) => 
  Effect.gen(function* () {
    const targetDirectory = directory || process.cwd();
    const parseResult = yield* parseExerciseDirectory(targetDirectory);
    yield* generateConsoleReport(parseResult);
    return parseResult;
  }).pipe(Effect.provide(NodeFileSystem.layer));

export const quickValidate = (directory?: string) =>
  Effect.gen(function* () {
    const targetDirectory = directory || process.cwd();
    const result = yield* validateExerciseDirectory(targetDirectory);
    yield* reportValidationResult(result);
    return result;
  }).pipe(Effect.provide(NodeFileSystem.layer));