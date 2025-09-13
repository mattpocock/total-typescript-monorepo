import { type AbsolutePath } from "@total-typescript/shared";
import { ConfigProvider, Effect } from "effect";
import { NodeFileSystem } from "@effect/platform-node";
import { render } from "ink";
import { parseExerciseDirectory, validateExerciseDirectory } from "./parser.js";
import {
  generateConsoleReport,
  generateJsonReport,
  generateMarkdownReport,
  reportValidationResult,
} from "./reporter.js";
import { type ExerciseOrganizerOptions, type ExerciseParseResult } from "./types.js";
import { TUIEntry } from "./tui/App.js";

// ============================================================================
// Main CLI Command Handler
// ============================================================================

export const runExerciseOrganizer = (
  directory: string | undefined,
  options: ExerciseOrganizerOptions
) => Effect.gen(function* () {
  // Use current directory if none specified
  const targetDirectory = directory || process.cwd();

  // Parse exercise directory
  const parseResult = yield* parseExerciseDirectory(targetDirectory);

  // Validation-only mode
  if (options.validate) {
    yield* reportValidationResult({
      hasErrors: parseResult.hasErrors,
      errorCount: parseResult.validationErrors.length,
      orphanedFileCount: parseResult.orphanedFiles.length,
      totalExercises: parseResult.totalExercises,
      sections: parseResult.sections.length,
    });
    return {
      hasErrors: parseResult.hasErrors,
      errorCount: parseResult.validationErrors.length,
      orphanedFileCount: parseResult.orphanedFiles.length,
      totalExercises: parseResult.totalExercises,
      sections: parseResult.sections.length,
    };
  }

  // If format is specified, generate report instead of TUI
  if (options.format && options.format !== 'tui') {
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
  }

  // Launch TUI (default mode)
  yield* launchTUI(parseResult);

  return {
    hasErrors: parseResult.hasErrors,
    errorCount: parseResult.validationErrors.length,
    orphanedFileCount: parseResult.orphanedFiles.length,
    totalExercises: parseResult.totalExercises,
    sections: parseResult.sections.length,
  };
});

// ============================================================================
// TUI Launcher
// ============================================================================

const launchTUI = (parseResult: ExerciseParseResult) => 
  Effect.gen(function* () {
    yield* Effect.sync(() => {
      const { unmount } = render(TUIEntry({ 
        parseResult,
        onExit: (exitCode) => {
          unmount();
          process.exit(exitCode);
        }
      }));
    });
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