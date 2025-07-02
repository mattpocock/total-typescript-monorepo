import { FileSystem } from "@effect/platform";
import { type AbsolutePath } from "@total-typescript/shared";
import { Console, Effect } from "effect";
import path from "node:path";
import {
  DEFAULT_SCANNER_CONFIG,
  type Exercise,
  type ExerciseSection,
  type ExerciseType,
  type OrphanedFile,
  type ScannerConfig,
  ValidationError,
} from "./types.js";

// ============================================================================
// Exercise Detection Engine
// ============================================================================

export const detectExercises = (
  directory: AbsolutePath,
  config: ScannerConfig = DEFAULT_SCANNER_CONFIG
) => Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  // Read directory contents
  const entries = yield* fs.readDirectory(directory);
  
  // Separate directories from files
  const directories: string[] = [];
  const files: string[] = [];
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    const entryPath = path.join(directory, entry);
    const stats = yield* fs.stat(entryPath);
    
    if (stats.type === "Directory") {
      directories.push(entry);
    } else {
      files.push(entry);
    }
  }

  // Find exercise sections (directories that match section pattern)
  const sectionDirs = directories.filter(dir => 
    config.sectionPattern.test(dir) && 
    !config.ignorePatterns.includes(dir)
  );

  // Parse each section
  const sections: ExerciseSection[] = [];
  for (const sectionDir of sectionDirs) {
    const sectionPath = path.join(directory, sectionDir) as AbsolutePath;
    const section = yield* parseExerciseSection(sectionPath, config);
    sections.push(section);
  }

  // Find orphaned files in the root directory
  const orphanedFiles = yield* detectOrphanedFiles(directory, files, config);

  return {
    sections: sections.sort((a, b) => a.number - b.number),
    orphanedFiles,
  };
});

// ============================================================================
// Section Parsing
// ============================================================================

const parseExerciseSection = (
  sectionPath: AbsolutePath,
  config: ScannerConfig
) => Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const sectionName = path.basename(sectionPath);
  
  // Extract section number and name
  const sectionMatch = sectionName.match(/^(\d{2,3})-(.+)$/);
  if (!sectionMatch) {
    return {
      path: sectionPath,
      name: sectionName,
      number: 0,
      exercises: [],
      validationErrors: [
        new ValidationError({
          type: 'section-naming',
          message: `Invalid section name format: ${sectionName}`,
          path: sectionPath,
          severity: 'high',
          suggestion: 'Use format: 01-section-name',
        }),
      ],
    };
  }

  const sectionNumber = parseInt(sectionMatch[1]!);
  const sectionDisplayName = sectionMatch[2]!.replace(/-/g, ' ');

  // Read section contents
  const entries = yield* fs.readDirectory(sectionPath);
  
  // Separate directories from files
  const directories: string[] = [];
  const files: string[] = [];
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    const entryPath = path.join(sectionPath, entry);
    const stats = yield* fs.stat(entryPath);
    
    if (stats.type === "Directory") {
      directories.push(entry);
    } else {
      files.push(entry);
    }
  }

  // Detect exercises
  const fileBasedExercises = yield* detectFileBasedExercises(sectionPath, files, config);
  const folderBasedExercises = yield* detectFolderBasedExercises(sectionPath, directories, config);

  const allExercises = [...fileBasedExercises, ...folderBasedExercises]
    .sort((a, b) => a.number - b.number);

  return {
    path: sectionPath,
    name: sectionDisplayName,
    number: sectionNumber,
    exercises: allExercises,
    validationErrors: [],
  };
});

// ============================================================================
// File-Based Exercise Detection
// ============================================================================

const detectFileBasedExercises = (
  sectionPath: AbsolutePath,
  files: string[],
  config: ScannerConfig
) => Effect.gen(function* () {
  const exercises: Exercise[] = [];
  const processedExercises = new Set<string>();

  // Filter for TypeScript files
  const tsFiles = files.filter(file => 
    config.allowedExtensions.some(ext => file.endsWith(ext))
  );

  for (const file of tsFiles) {
    const match = file.match(config.exercisePattern);
    if (!match) continue;

    const [, numberStr, name, type, extension] = match;
    const exerciseNumber = parseFloat(numberStr!);
    const exerciseKey = `${numberStr}-${name}`;

    // Skip if we've already processed this exercise
    if (processedExercises.has(exerciseKey)) continue;
    processedExercises.add(exerciseKey);

    // Find corresponding problem/solution files
    const problemFile = tsFiles.find(f => 
      f.includes(`${numberStr}-${name}.problem.${extension}`)
    );
    // Look for solution files with optional numbering (e.g., .solution.1.ts, .solution.2.ts, etc.)
    const solutionFile = tsFiles.find(f => {
      const solutionPattern = new RegExp(`${numberStr}-${name}\\.solution(?:\\.\\d+)?\\.${extension}$`);
      return solutionPattern.test(f);
    });

    if (!problemFile) continue; // Must have a problem file

    const exercise: Exercise = {
      type: 'file-based',
      number: exerciseNumber,
      name: name!.replace(/-/g, ' '),
      path: path.join(sectionPath, problemFile) as AbsolutePath,
      problemFile,
      solutionFile,
      validationErrors: yield* validateFileBasedExercise(
        exerciseNumber,
        name!,
        problemFile,
        solutionFile,
        sectionPath
      ),
    };

    exercises.push(exercise);
  }

  return exercises;
});

// ============================================================================
// Folder-Based Exercise Detection
// ============================================================================

const detectFolderBasedExercises = (
  sectionPath: AbsolutePath,
  directories: string[],
  config: ScannerConfig
) => Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const exercises: Exercise[] = [];

  for (const dir of directories) {
    const match = dir.match(/^(\d{3}(?:\.\d+)?)-([a-z0-9-]+)$/);
    if (!match) continue;

    const [, numberStr, name] = match;
    const exerciseNumber = parseFloat(numberStr!);
    const exercisePath = path.join(sectionPath, dir) as AbsolutePath;

    // Check for problem and solution files inside the folder
    const exerciseFiles = yield* fs.readDirectory(exercisePath);
    
    const problemFile = exerciseFiles.find((f: string) => 
      f.includes('.problem.') && config.allowedExtensions.some((ext: string) => f.endsWith(ext))
    );
    // Look for solution files with optional numbering (e.g., .solution.1.ts, .solution.2.ts, etc.)
    const solutionFile = exerciseFiles.find((f: string) => {
      const hasSolutionPattern = /\.solution(?:\.\d+)?\./.test(f);
      const hasValidExtension = config.allowedExtensions.some((ext: string) => f.endsWith(ext));
      return hasSolutionPattern && hasValidExtension;
    });

    if (!problemFile) continue; // Must have a problem file

    const exercise: Exercise = {
      type: 'folder-based',
      number: exerciseNumber,
      name: name!.replace(/-/g, ' '),
      path: exercisePath,
      problemFile,
      solutionFile,
      validationErrors: yield* validateFolderBasedExercise(
        exerciseNumber,
        name!,
        problemFile,
        solutionFile,
        exercisePath
      ),
    };

    exercises.push(exercise);
  }

  return exercises;
});

// ============================================================================
// Validation Logic
// ============================================================================

const validateFileBasedExercise = (
  number: number,
  name: string,
  problemFile: string,
  solutionFile: string | undefined,
  sectionPath: AbsolutePath
) => Effect.gen(function* () {
  const errors: ValidationError[] = [];

  // Check for decimal numbers
  if (number % 1 !== 0) {
    errors.push(new ValidationError({
      type: 'invalid-decimal-number',
      message: `Exercise ${number} uses decimal numbering`,
      path: path.join(sectionPath, problemFile),
      severity: 'high',
      suggestion: `Rename to ${Math.floor(number + 1).toString().padStart(3, '0')}-${name}`,
    }));
  }

  // Check for missing solution
  if (!solutionFile) {
    errors.push(new ValidationError({
      type: 'missing-solution',
      message: `Exercise ${number} is missing a solution file`,
      path: path.join(sectionPath, problemFile),
      severity: 'medium',
      suggestion: `Create ${problemFile.replace('.problem.', '.solution.')}`,
    }));
  }

  return errors;
});

const validateFolderBasedExercise = (
  number: number,
  name: string,
  problemFile: string,
  solutionFile: string | undefined,
  exercisePath: AbsolutePath
) => Effect.gen(function* () {
  const errors: ValidationError[] = [];

  // Check for decimal numbers
  if (number % 1 !== 0) {
    errors.push(new ValidationError({
      type: 'invalid-decimal-number',
      message: `Exercise ${number} uses decimal numbering`,
      path: exercisePath,
      severity: 'high',
      suggestion: `Rename folder to ${Math.floor(number + 1).toString().padStart(3, '0')}-${name}`,
    }));
  }

  // Check for missing solution
  if (!solutionFile) {
    errors.push(new ValidationError({
      type: 'missing-solution',
      message: `Exercise ${number} is missing a solution file`,
      path: exercisePath,
      severity: 'medium',
      suggestion: `Create a .solution. file in the folder`,
    }));
  }

  return errors;
});

// ============================================================================
// Orphaned File Detection
// ============================================================================

const detectOrphanedFiles = (
  directory: AbsolutePath,
  files: string[],
  config: ScannerConfig
) => Effect.gen(function* () {
  const orphanedFiles: OrphanedFile[] = [];

  for (const file of files) {
    // Skip ignored files
    if (config.ignorePatterns.some(pattern => file.includes(pattern))) {
      continue;
    }

    // Check if it's a TypeScript file that doesn't match exercise pattern
    if (config.allowedExtensions.some(ext => file.endsWith(ext))) {
      if (!config.exercisePattern.test(file)) {
        orphanedFiles.push({
          path: path.join(directory, file) as AbsolutePath,
          fileName: file,
          reason: 'Does not match exercise naming pattern',
          suggestion: 'Rename to follow 001-exercise-name.problem.ts format',
        });
      }
    }
  }

  return orphanedFiles;
});

// ============================================================================
// Utility Functions
// ============================================================================

export const countExercises = (sections: ExerciseSection[]): number => {
  return sections.reduce((total, section) => total + section.exercises.length, 0);
};

export const collectAllValidationErrors = (sections: ExerciseSection[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  for (const section of sections) {
    errors.push(...section.validationErrors);
    for (const exercise of section.exercises) {
      errors.push(...exercise.validationErrors);
    }
  }
  
  return errors;
};