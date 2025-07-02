import { type AbsolutePath } from "@total-typescript/shared";
import { Data } from "effect";

// ============================================================================
// Core Exercise Types
// ============================================================================

export type ExerciseType = 'file-based' | 'folder-based';

export type ValidationErrorType = 
  | 'invalid-decimal-number'
  | 'missing-solution'
  | 'duplicate-number'
  | 'invalid-naming'
  | 'orphaned-file'
  | 'section-naming'
  | 'file-structure';

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly type: ValidationErrorType;
  readonly message: string;
  readonly path: string;
  readonly severity: 'low' | 'medium' | 'high';
  readonly suggestion?: string;
}> {}

export interface Exercise {
  readonly type: ExerciseType;
  readonly number: number;
  readonly name: string;
  readonly path: AbsolutePath;
  readonly problemFile: string;
  readonly solutionFile?: string;
  readonly validationErrors: ValidationError[];
}

export interface ExerciseSection {
  readonly path: AbsolutePath;
  readonly name: string;
  readonly number: number;
  readonly exercises: Exercise[];
  readonly validationErrors: ValidationError[];
}

export interface OrphanedFile {
  readonly path: AbsolutePath;
  readonly fileName: string;
  readonly reason: string;
  readonly suggestion?: string;
}

export interface ExerciseParseResult {
  readonly sections: ExerciseSection[];
  readonly orphanedFiles: OrphanedFile[];
  readonly validationErrors: ValidationError[];
  readonly hasErrors: boolean;
  readonly totalExercises: number;
}

// ============================================================================
// CLI Options and Configuration
// ============================================================================

export interface ExerciseOrganizerOptions {
  readonly validate?: boolean;
  readonly format?: 'table' | 'json' | 'markdown';
  readonly verbose?: boolean;
}

export interface ScannerConfig {
  readonly maxDepth: number;
  readonly allowedExtensions: readonly string[];
  readonly sectionPattern: RegExp;
  readonly exercisePattern: RegExp;
  readonly ignorePatterns: readonly string[];
}

// ============================================================================
// Reporter Types
// ============================================================================

export interface ReportSection {
  readonly title: string;
  readonly items: ReportItem[];
  readonly summary?: string;
}

export interface ReportItem {
  readonly type: 'success' | 'warning' | 'error' | 'info';
  readonly message: string;
  readonly details?: string;
  readonly path?: string;
}

export interface ExerciseReport {
  readonly sections: ReportSection[];
  readonly summary: {
    readonly totalSections: number;
    readonly totalExercises: number;
    readonly errorCount: number;
    readonly warningCount: number;
  };
  readonly hasErrors: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_SCANNER_CONFIG: ScannerConfig = {
  maxDepth: 3,
  allowedExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  sectionPattern: /^\d{2,3}-[a-z0-9-]+$/,
  exercisePattern: /^(\d{3}(?:\.\d+)?)-([a-z0-9-]+)\.(problem|solution)\.(ts|tsx|js|jsx)$/,
  ignorePatterns: ['node_modules', '.git', 'dist', 'build', '__pycache__', '.DS_Store'],
} as const;