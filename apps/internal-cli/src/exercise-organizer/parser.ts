import { type AbsolutePath } from "@total-typescript/shared";
import { Effect } from "effect";
import path from "node:path";
import {
  collectAllValidationErrors,
  countExercises,
  detectExercises,
} from "./exercise-detector.js";
import {
  DEFAULT_SCANNER_CONFIG,
  type ExerciseParseResult,
  type ScannerConfig,
} from "./types.js";

// ============================================================================
// Main Exercise Directory Parser
// ============================================================================

export const parseExerciseDirectory = (
  directory: string | AbsolutePath,
  config: ScannerConfig = DEFAULT_SCANNER_CONFIG
) => Effect.gen(function* () {
  const absoluteDirectory = path.resolve(directory) as AbsolutePath;

  // Detect exercises in the directory
  const { sections, orphanedFiles } = yield* detectExercises(
    absoluteDirectory,
    config
  );

  // Collect all validation errors
  const validationErrors = collectAllValidationErrors(sections);

  // Count total exercises
  const totalExercises = countExercises(sections);

  const parseResult: ExerciseParseResult = {
    sections,
    orphanedFiles,
    validationErrors,
    hasErrors: validationErrors.length > 0 || orphanedFiles.length > 0,
    totalExercises,
  };

  return parseResult;
});

// ============================================================================
// Validation-only Mode
// ============================================================================

export const validateExerciseDirectory = (
  directory: string | AbsolutePath,
  config: ScannerConfig = DEFAULT_SCANNER_CONFIG
) => Effect.gen(function* () {
  const parseResult = yield* parseExerciseDirectory(directory, config);
  
  return {
    hasErrors: parseResult.hasErrors,
    errorCount: parseResult.validationErrors.length,
    orphanedFileCount: parseResult.orphanedFiles.length,
    totalExercises: parseResult.totalExercises,
    sections: parseResult.sections.length,
  };
});

// ============================================================================
// Utility Functions
// ============================================================================

export const getSummaryStats = (parseResult: ExerciseParseResult) => {
  const errorCount = parseResult.validationErrors.length;
  const warningCount = parseResult.validationErrors.filter(
    (error) => error.severity === 'medium' || error.severity === 'low'
  ).length;
  const criticalErrorCount = parseResult.validationErrors.filter(
    (error) => error.severity === 'high'
  ).length;

  return {
    totalSections: parseResult.sections.length,
    totalExercises: parseResult.totalExercises,
    errorCount,
    warningCount,
    criticalErrorCount,
    orphanedFileCount: parseResult.orphanedFiles.length,
    hasErrors: parseResult.hasErrors,
  };
};