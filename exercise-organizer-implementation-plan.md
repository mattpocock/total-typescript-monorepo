# Exercise Organizer CLI - Incremental Prototype Implementation Plan

## Overview

This plan breaks down the Exercise Organizer CLI implementation into 6 incremental phases, where **each phase delivers a fully working prototype** that can be tested and used. Each prototype builds upon the previous one, allowing for continuous feedback and course correction.

The approach ensures that at every stage, you have a functional tool that provides value, even if it doesn't have all the planned features yet.

---

## Phase 1: Working CLI Scanner & Reporter

**Deliverable**: A functional CLI that scans directories and reports exercise structure
**PR Size**: Medium (400-500 lines)
**Estimated Time**: 2-3 hours per agent
**Dependencies**: None

### 🎯 What You Get (Working Prototype)

A complete CLI command that:

- Scans any directory for TypeScript exercises
- Detects file-based and folder-based exercises
- Validates naming conventions
- Reports detailed analysis to console
- Identifies problems, solutions, and orphaned files
- Provides validation-only mode for CI/testing

### 📦 User Experience

```bash
# Scan current directory
tt exercise-organizer

# Scan specific directory
tt exercise-organizer /path/to/exercises

# Validation mode for CI
tt exercise-organizer --validate /path/to/exercises

# Example output:
📁 Section 01: TypeScript Fundamentals (12 exercises)
  ✅ 001-variables.problem.ts / 001-variables.solution.ts
  ✅ 002-functions.problem.ts / 002-functions.solution.ts
  ❌ 003.5-arrays.problem.ts (invalid decimal number)
  ⚠️  004-objects.problem.ts (missing solution)
  ✅ 005-types/
    ├── index.problem.ts
    └── index.solution.ts

🔍 Analysis Complete:
  - 47 exercises found across 4 sections
  - 3 validation errors
  - 1 orphaned file
  - Suggested: Run normalization to fix decimal numbers
```

### 📁 Files to Create

```
apps/internal-cli/src/exercise-organizer/
├── types.ts                 # Core types and interfaces
├── parser.ts               # File parsing logic
├── validator.ts            # Exercise validation
├── exercise-detector.ts    # Exercise pattern detection
├── cli-command.ts          # Main CLI command
├── reporter.ts             # Console output formatting
└── __tests__/
    ├── parser.test.ts      # Parser unit tests
    ├── validator.test.ts   # Validator unit tests
    ├── cli-command.test.ts # CLI integration tests
    └── fixtures/           # Test fixture files
```

### 🔧 Key Components

#### Complete CLI Integration

```typescript
// Add to bin.ts
program
  .command("exercise-organizer [directory]")
  .aliases(["eo", "exercises"])
  .description("Analyze and organize TypeScript exercise files")
  .option("-v, --validate", "Validate exercises and exit with status code")
  .option("--format <type>", "Output format: table, json, markdown", "table")
  .action(async (directory: string | undefined, options) => {
    const result = await runExerciseOrganizer(directory, options);
    process.exit(result.hasErrors ? 1 : 0);
  });
```

#### Full Data Models & Parsing

```typescript
export interface Exercise {
  type: "file-based" | "folder-based";
  number: number;
  name: string;
  path: AbsolutePath;
  problemFile: string;
  solutionFile?: string;
  validationErrors: ValidationError[];
}

export interface ExerciseSection {
  path: AbsolutePath;
  name: string;
  number: number;
  exercises: Exercise[];
  validationErrors: ValidationError[];
}

export const parseExerciseDirectory = Effect.gen(function* (dir: AbsolutePath) {
  const fs = yield* FileSystem.FileSystem;
  const files = yield* fs.readdir(dir);

  // Parse sections and exercises
  const sections = yield* parseSections(files);
  const orphanedFiles = yield* detectOrphanedFiles(files, sections);

  return {
    sections,
    orphanedFiles,
    validationErrors: sections.flatMap((s) => s.validationErrors),
    hasErrors: sections.some((s) => s.validationErrors.length > 0),
  };
});
```

### ✅ Success Criteria & Testing

- [ ] **End-to-End Functionality**: Can scan real exercise directories and produce accurate reports
- [ ] **CLI Integration**: Works seamlessly with existing `tt` command structure
- [ ] **Validation Mode**: Returns proper exit codes for CI integration
- [ ] **Error Handling**: Gracefully handles permission errors, missing directories, etc.
- [ ] **Performance**: Handles large directories (100+ exercises) efficiently
- [ ] **Output Quality**: Clear, actionable reports that highlight problems

---

## Phase 2: Interactive TUI Navigator

**Deliverable**: A working terminal UI for browsing exercises interactively
**PR Size**: Medium-Large (500-600 lines)
**Estimated Time**: 3-4 hours per agent
**Dependencies**: Phase 1

### 🎯 What You Get (Working Prototype)

Building on Phase 1, you now get:

- Full interactive terminal interface using Ink
- Navigate exercise hierarchy with keyboard
- View exercise details and validation errors
- Browse between sections and exercises
- Real-time filtering and search
- Help system and keyboard shortcuts

### 📦 User Experience

```bash
# Launch interactive mode (default when no --validate flag)
tt exercise-organizer

# Interactive TUI with:
# - Arrow keys or vim keys (j/k) for navigation
# - Enter to view exercise details
# - / to search exercises
# - ? for help
# - q to quit
```

```
┌─ Exercise Organizer - TypeScript Fundamentals ─────────────────────────┐
│                                                                        │
│ 📁 01-typescript-fundamentals/ (12 exercises)                         │
│   ✅ 001-variables.problem.ts → 001-variables.solution.ts            │
│ ► ✅ 002-functions.problem.ts → 002-functions.solution.ts            │
│   ❌ 003.5-arrays.problem.ts (invalid decimal number)                │
│   ⚠️  004-objects.problem.ts (missing solution)                      │
│                                                                        │
│ 📁 02-advanced-types/ (8 exercises)                                   │
│   ✅ 001-unions.problem.ts → 001-unions.solution.ts                  │
│                                                                        │
│ Filter: [      ] | ? Help | q Quit | 12/47 exercises                  │
└────────────────────────────────────────────────────────────────────────┘
```

### 📁 Additional Files

```
apps/internal-cli/src/exercise-organizer/
├── tui/
│   ├── App.tsx                    # Main TUI application
│   ├── ExerciseTree.tsx          # Exercise hierarchy display
│   ├── ExerciseDetail.tsx        # Exercise detail view
│   ├── StatusBar.tsx             # Status and help bar
│   ├── SearchBar.tsx             # Filtering interface
│   └── hooks/
│       ├── useKeyboard.ts        # Keyboard navigation
│       ├── useExerciseState.ts   # Exercise state management
│       └── useSearch.ts          # Search/filtering logic
└── __tests__/
    └── tui/                      # TUI component tests
```

### 🔧 Key Components

#### Interactive TUI App

```typescript
export const ExerciseOrganizerApp: React.FC<{
  parseResult: ExerciseParseResult;
}> = ({ parseResult }) => {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'browse' | 'search' | 'detail'>('browse');

  const filteredSections = useMemo(() =>
    filterSections(parseResult.sections, searchTerm),
    [parseResult.sections, searchTerm]
  );

  useKeyboard((input, key) => {
    switch (input) {
      case 'q': process.exit(0); break;
      case '/': setMode('search'); break;
      case '?': setMode('help'); break;
      default:
        if (key.upArrow || input === 'k') handleUp();
        if (key.downArrow || input === 'j') handleDown();
        if (key.return) handleSelect();
    }
  });

  return (
    <Box flexDirection="column" height="100%">
      <ExerciseTree
        sections={filteredSections}
        selectedPath={selectedPath}
        onSelect={setSelectedPath}
      />
      <SearchBar
        visible={mode === 'search'}
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <StatusBar
        mode={mode}
        exerciseCount={countExercises(filteredSections)}
      />
    </Box>
  );
};
```

### ✅ Success Criteria & Testing

- [ ] **Full Navigation**: Smooth keyboard navigation through exercise hierarchy
- [ ] **Search Works**: Real-time filtering of exercises by name/content
- [ ] **Visual Clarity**: Clear indication of exercise status (valid, errors, missing solutions)
- [ ] **Responsive UI**: Adapts to different terminal sizes
- [ ] **Performance**: No lag when navigating large exercise sets
- [ ] **User Experience**: Intuitive for both vim users and regular users

---

## Phase 3: Basic Exercise Operations

**Deliverable**: Interactive move and reorder operations with immediate feedback
**PR Size**: Medium-Large (500-600 lines)  
**Estimated Time**: 3-4 hours per agent
**Dependencies**: Phase 2

### 🎯 What You Get (Working Prototype)

Building on Phase 2, you now can:

- Move exercises between sections interactively
- Reorder exercises within sections
- See real-time preview before confirming operations
- Undo the last operation if something goes wrong
- Dry-run mode to see what would happen
- Safe file operations with validation

### 📦 User Experience

```bash
# Same command, now with move operations
tt exercise-organizer

# In TUI:
# - 'm' to enter move mode
# - Select target with arrow keys
# - Enter to confirm move
# - 'u' to undo last operation
# - 'r' to reorder exercises in current section
```

```
┌─ Move Mode: Select target for "002-functions.problem.ts" ──────────────┐
│                                                                        │
│ 📁 01-typescript-fundamentals/ (12 exercises)                         │
│   ✅ 001-variables.problem.ts → 001-variables.solution.ts            │
│ ► 🎯 [Move here as 003]                                               │
│   ❌ 003.5-arrays.problem.ts                                          │
│                                                                        │
│ 📁 02-advanced-types/ (8 exercises)                                   │
│ ► 🎯 [Move here as 009]                                               │
│                                                                        │
│ Preview: Moving "002-functions" to "01-fundamentals" as exercise 003   │
│ Files: 002-functions.problem.ts → 003-functions.problem.ts           │
│        002-functions.solution.ts → 003-functions.solution.ts          │
│                                                                        │
│ Enter: Confirm | Esc: Cancel | j/k: Navigate                          │
└────────────────────────────────────────────────────────────────────────┘
```

### 📁 Additional Files

```
apps/internal-cli/src/exercise-organizer/
├── operations/
│   ├── move-exercise.ts          # Exercise moving logic
│   ├── reorder-exercises.ts      # Reordering operations
│   ├── file-operations.ts       # Safe file system operations
│   ├── undo-manager.ts          # Undo/redo functionality
│   └── operation-preview.ts     # Preview changes before applying
├── tui/
│   ├── MoveMode.tsx             # Move operation interface
│   ├── ReorderMode.tsx          # Reordering interface
│   ├── ConfirmDialog.tsx        # Operation confirmation
│   └── PreviewPanel.tsx         # Change preview display
└── __tests__/
    └── operations/              # Operation testing
```

### 🔧 Key Components

#### Move Operations with Preview

```typescript
export const previewMoveOperation = Effect.gen(function* (
  exercise: Exercise,
  targetSection: ExerciseSection,
  targetIndex: number
) {
  // Calculate new file paths
  const newPaths = yield* calculateNewPaths(
    exercise,
    targetSection,
    targetIndex
  );

  // Check for conflicts
  const conflicts = yield* checkForConflicts(newPaths);

  // Estimate renumbering needed
  const renumberingNeeded = yield* calculateRenumbering(
    targetSection,
    targetIndex
  );

  return {
    operation: "move",
    exercise: exercise.name,
    from: exercise.section.name,
    to: targetSection.name,
    newPaths,
    conflicts,
    renumberingNeeded,
    safe: conflicts.length === 0,
  };
});

export const executeMoveOperation = Effect.gen(function* (
  preview: MoveOperationPreview
) {
  // Create backup for undo
  const backup = yield* createOperationBackup(preview);

  // Perform atomic file operations
  yield* moveFiles(preview.newPaths);

  // Update exercise numbering
  if (preview.renumberingNeeded.length > 0) {
    yield* renumberExercises(preview.renumberingNeeded);
  }

  // Register undo operation
  yield* registerUndoOperation(backup);

  return { success: true, backup };
});
```

### ✅ Success Criteria & Testing

- [ ] **Move Between Sections**: Successfully move exercises across different sections
- [ ] **Reorder Within Section**: Change exercise order within the same section
- [ ] **Preview Accuracy**: Preview exactly matches the actual operation results
- [ ] **Undo Functionality**: Can undo the last move operation reliably
- [ ] **File Safety**: All file operations are atomic (all succeed or all fail)
- [ ] **Visual Feedback**: Clear indication of what will happen before confirmation

---

## Phase 4: Enhanced Operations & Safety

**Deliverable**: Robust operations with full undo/redo, batch operations, and error recovery
**PR Size**: Medium (400-500 lines)
**Estimated Time**: 2-3 hours per agent
**Dependencies**: Phase 3

### 🎯 What You Get (Working Prototype)

Building on Phase 3, you now get:

- Full undo/redo stack (not just last operation)
- Batch operations (move multiple exercises at once)
- Automatic backup creation before major operations
- Error recovery and rollback on failed operations
- Operation history and audit trail
- Batch validation and conflict resolution

### 📦 User Experience

```bash
# Same command, now with enhanced operations
tt exercise-organizer

# New TUI features:
# - Ctrl+Z / Ctrl+Y for undo/redo
# - Space to select multiple exercises
# - 'b' for batch move mode
# - 'h' to view operation history
# - Automatic recovery on startup from incomplete operations
```

```
┌─ Batch Move Mode: 3 exercises selected ────────────────────────────────┐
│                                                                        │
│ Selected for batch move:                                               │
│ ✓ 002-functions.problem.ts (from 01-fundamentals)                     │
│ ✓ 005-arrays.problem.ts (from 01-fundamentals)                        │
│ ✓ 001-strings.problem.ts (from 02-advanced)                           │
│                                                                        │
│ Target: 📁 03-practice-exercises/                                      │
│ ► Will become: 009, 010, 011                                          │
│                                                                        │
│ Conflicts: None detected                                               │
│ Estimated time: <1 second                                             │
│                                                                        │
│ Enter: Execute batch move | Esc: Cancel | Space: Toggle selection     │
└────────────────────────────────────────────────────────────────────────┘
```

### 📁 Additional Files

```
apps/internal-cli/src/exercise-organizer/
├── operations/
│   ├── batch-operations.ts      # Multi-exercise operations
│   ├── operation-history.ts     # Operation audit trail
│   ├── backup-manager.ts        # Automatic backup creation
│   ├── error-recovery.ts        # Recovery from failed operations
│   └── conflict-resolver.ts     # Advanced conflict resolution
├── tui/
│   ├── BatchMode.tsx           # Batch operation interface
│   ├── HistoryView.tsx         # Operation history display
│   ├── SelectionManager.tsx    # Multi-selection UI
│   └── RecoveryDialog.tsx      # Error recovery interface
```

### 🔧 Key Components

#### Enhanced Undo/Redo System

```typescript
export class OperationHistory {
  private undoStack: Operation[] = [];
  private redoStack: Operation[] = [];

  async executeOperation(operation: Operation): Promise<OperationResult> {
    // Create backup before operation
    const backup = await this.createBackup(operation);

    try {
      const result = await operation.execute();

      // Add to undo stack on success
      this.undoStack.push({ ...operation, backup });
      this.redoStack = []; // Clear redo stack

      return result;
    } catch (error) {
      // Automatic rollback on failure
      await this.rollbackOperation(backup);
      throw error;
    }
  }

  async undo(): Promise<void> {
    const operation = this.undoStack.pop();
    if (!operation) return;

    await this.restoreFromBackup(operation.backup);
    this.redoStack.push(operation);
  }
}
```

#### Batch Operations

```typescript
export const executeBatchMove = Effect.gen(function* (
  exercises: Exercise[],
  targetSection: ExerciseSection,
  startIndex: number
) {
  // Validate entire batch first
  const batchValidation = yield* validateBatchOperation(
    exercises,
    targetSection
  );
  if (!batchValidation.safe) {
    return yield* Effect.fail(
      new BatchOperationError(batchValidation.conflicts)
    );
  }

  // Create comprehensive backup
  const backup = yield* createBatchBackup(exercises);

  try {
    // Execute all moves atomically
    for (const [index, exercise] of exercises.entries()) {
      yield* moveExercise(exercise, targetSection, startIndex + index);
    }

    // Update all affected sections
    yield* refreshAffectedSections([
      ...new Set(exercises.map((e) => e.section)),
    ]);

    // Register batch operation for undo
    yield* registerBatchOperation({ exercises, targetSection, backup });
  } catch (error) {
    // Rollback entire batch on any failure
    yield* rollbackBatchOperation(backup);
    throw error;
  }
});
```

### ✅ Success Criteria & Testing

- [ ] **Full Undo/Redo**: Navigate through complete operation history
- [ ] **Batch Operations**: Select and move multiple exercises efficiently
- [ ] **Atomic Batch**: Either all exercises move or none do (no partial failures)
- [ ] **Recovery System**: Gracefully recover from interrupted operations
- [ ] **Operation History**: View and understand all past operations
- [ ] **Error Handling**: Clear error messages and automatic rollback

---

## Phase 5: Normalization & Auto-Fix

**Deliverable**: Intelligent exercise normalization with one-click fixes
**PR Size**: Medium (400-500 lines)
**Estimated Time**: 2-3 hours per agent
**Dependencies**: Phase 4

### 🎯 What You Get (Working Prototype)

Building on Phase 4, you now get:

- Automatic detection of numbering issues
- One-click normalization (remove decimals, fix gaps)
- Smart conflict resolution strategies
- Preview mode showing exactly what will be normalized
- Bulk normalization across all sections
- Integration with existing move/undo system

### 📦 User Experience

```bash
# Same command, now with normalization features
tt exercise-organizer

# New TUI features:
# - 'n' to enter normalization mode
# - Auto-suggestions when issues detected
# - One-click "Fix All" functionality
# - Different normalization strategies
```

```
┌─ Normalization Mode: Issues Detected ──────────────────────────────────┐
│                                                                        │
│ 🔍 Analysis Results:                                                   │
│   • 3 exercises with decimal numbers (001.5, 002.5, 003.5)           │
│   • 2 numbering gaps (missing 006, 008)                               │
│   • 1 duplicate number (two exercises numbered 010)                   │
│                                                                        │
│ 🛠️  Recommended Actions:                                               │
│ ► 1. Normalize decimals (001.5 → 002, 002.5 → 003, 003.5 → 004)     │
│   2. Fill gaps sequentially (renumber 007→006, 009→007, 010→008)      │
│   3. Resolve duplicate 010 (rename second to 011)                     │
│                                                                        │
│ Strategy: ● Sequential  ○ Preserve Gaps  ○ Custom                     │
│                                                                        │
│ Enter: Execute All | Space: Toggle action | Tab: Change strategy      │
│ Preview showing 12 file renames, estimated time: 2 seconds            │
└────────────────────────────────────────────────────────────────────────┘
```

### 📁 Additional Files

```
apps/internal-cli/src/exercise-organizer/
├── normalization/
│   ├── normalize-exercises.ts    # Main normalization engine
│   ├── issue-detector.ts        # Detect numbering issues
│   ├── strategy-selector.ts     # Different normalization strategies
│   ├── preview-generator.ts     # Generate normalization preview
│   └── conflict-resolver.ts     # Resolve normalization conflicts
├── tui/
│   ├── NormalizeMode.tsx        # Normalization interface
│   ├── IssueDisplay.tsx         # Show detected issues
│   ├── StrategySelector.tsx     # Choose normalization strategy
│   └── NormalizePreview.tsx     # Preview normalization results
```

### 🔧 Key Components

#### Issue Detection System

```typescript
export const detectNormalizationIssues = Effect.gen(function* (
  sections: ExerciseSection[]
) {
  const issues: NormalizationIssue[] = [];

  for (const section of sections) {
    // Check for decimal numbers
    const decimalIssues = section.exercises
      .filter((ex) => ex.number % 1 !== 0)
      .map((ex) => ({
        type: "decimal" as const,
        exercise: ex,
        severity: "high" as const,
        suggestion: `Rename to ${Math.floor(ex.number + 1)}`,
      }));

    // Check for gaps in numbering
    const gapIssues = yield* detectNumberingGaps(section.exercises);

    // Check for duplicates
    const duplicateIssues = yield* detectDuplicateNumbers(section.exercises);

    issues.push(...decimalIssues, ...gapIssues, ...duplicateIssues);
  }

  return {
    issues,
    hasHighPriority: issues.some((i) => i.severity === "high"),
    estimatedFixes: issues.length,
  };
});
```

#### One-Click Normalization

```typescript
export const executeNormalizationPlan = Effect.gen(function* (
  plan: NormalizationPlan,
  strategy: NormalizationStrategy
) {
  // Create backup before major changes
  const backup = yield* createNormalizationBackup(plan);

  try {
    // Execute normalization steps in order
    for (const step of plan.steps) {
      switch (step.type) {
        case "rename":
          yield* renameExercise(step.exercise, step.newNumber);
          break;
        case "renumber":
          yield* renumberSection(step.section, step.startNumber);
          break;
        case "resolve-duplicate":
          yield* resolveDuplicate(step.exercises, strategy);
          break;
      }
    }

    // Verify normalization completed successfully
    const verification = yield* verifyNormalization(plan.sections);
    if (!verification.success) {
      throw new NormalizationError(verification.errors);
    }

    // Register for undo
    yield* registerNormalizationOperation({ plan, backup });
  } catch (error) {
    // Rollback on any failure
    yield* rollbackNormalization(backup);
    throw error;
  }
});
```

### ✅ Success Criteria & Testing

- [ ] **Issue Detection**: Accurately identifies all numbering problems
- [ ] **Strategy Options**: Multiple normalization approaches work correctly
- [ ] **One-Click Fix**: "Fix All" resolves all issues in one operation
- [ ] **Preview Accuracy**: Preview exactly matches normalization results
- [ ] **Integration**: Works seamlessly with undo/redo system
- [ ] **Performance**: Fast normalization even with 100+ exercises

---

## Phase 6: AI-Powered Suggestions & Advanced Features

**Deliverable**: Complete tool with AI naming suggestions and advanced analysis
**PR Size**: Large (600-800 lines)
**Estimated Time**: 4-5 hours per agent
**Dependencies**: Phase 5

### 🎯 What You Get (Final Complete Prototype)

Building on Phase 5, you now get the complete tool with:

- AI-powered naming suggestions for non-conforming files
- Intelligent pattern matching for problem/solution pairs
- Advanced analytics and insights about exercise structure
- Export functionality (reports, scripts, etc.)
- Configuration system for different exercise styles
- Full integration with existing Total TypeScript workflow

### 📦 User Experience

```bash
# Complete command with all features
tt exercise-organizer

# Advanced features:
# - 'a' for AI suggestions mode
# - 's' for statistics and analytics
# - 'c' for configuration
# - 'e' for export options
# - Full integration with workspace patterns
```

```
┌─ AI Suggestions: Smart Naming Detected ────────────────────────────────┐
│                                                                        │
│ 🤖 AI Analysis of Non-Conforming Files:                               │
│                                                                        │
│ 📄 "string-manipulation-exercise.ts"                                   │
│ ✨ Suggested: "015-string-manipulation.problem.ts"                     │
│ 🎯 Confidence: 94% (content analysis + naming patterns)               │
│ 📝 Reasoning: Contains TypeScript exercises, follows curriculum order  │
│                                                                        │
│ 📄 "array-methods-solution.ts"                                        │
│ ✨ Suggested: "012-array-methods.solution.ts"                         │
│ 🎯 Confidence: 98% (matches existing problem file pattern)            │
│ 📝 Reasoning: Pairs with "012-array-methods.problem.ts"               │
│                                                                        │
│ 📄 "bonus/advanced-generics.ts"                                       │
│ ✨ Suggested: Move to "04-advanced-types/020-generics.problem.ts"     │
│ 🎯 Confidence: 87% (content classification + section analysis)        │
│                                                                        │
│ Enter: Accept suggestions | j/k: Navigate | Space: Toggle | r: Refresh│
└────────────────────────────────────────────────────────────────────────┘
```

### 📁 Additional Files

```
apps/internal-cli/src/exercise-organizer/
├── ai-suggestions/
│   ├── ai-naming-service.ts      # AI integration for naming
│   ├── content-analyzer.ts       # Analyze file content for patterns
│   ├── suggestion-generator.ts   # Generate intelligent suggestions
│   ├── confidence-scorer.ts      # Score suggestion quality
│   └── pattern-matcher.ts        # Match files to exercise patterns
├── analytics/
│   ├── exercise-analytics.ts     # Exercise structure analysis
│   ├── curriculum-analyzer.ts    # Curriculum flow analysis
│   └── report-generator.ts       # Generate insights reports
├── export/
│   ├── export-manager.ts         # Export functionality
│   ├── script-generator.ts       # Generate automation scripts
│   └── report-exporter.ts        # Export analysis reports
├── config/
│   ├── workspace-config.ts       # Workspace-specific settings
│   └── pattern-config.ts         # Exercise pattern configuration
└── tui/
    ├── AiSuggestionsMode.tsx     # AI suggestions interface
    ├── AnalyticsView.tsx         # Analytics dashboard
    ├── ExportDialog.tsx          # Export options
    └── ConfigurationPanel.tsx    # Settings interface
```

### 🔧 Key Components

#### AI Naming Service

```typescript
export const generateNamingSuggestions = Effect.gen(function* (
  file: string,
  context: ExerciseContext
) {
  // Analyze file content
  const content = yield* FileSystem.readFileString(file);
  const contentAnalysis = yield* analyzeExerciseContent(content);

  // Generate suggestions using AI
  const aiService = yield* AiService;
  const suggestions = yield* aiService.generateNamingSuggestions({
    fileName: file,
    content: contentAnalysis,
    existingExercises: context.exercises,
    sectionContext: context.section,
  });

  // Score suggestions
  const scoredSuggestions = yield* scoreSuggestions(suggestions, context);

  return scoredSuggestions.sort((a, b) => b.confidence - a.confidence);
});

export const analyzeExerciseContent = Effect.gen(function* (content: string) {
  // Extract TypeScript patterns
  const hasProblems = /\/\/ TODO|\/\/ TASK|\/\/ FIX/.test(content);
  const hasSolutions = /\/\/ SOLUTION|\/\/ ANSWER/.test(content);
  const complexity = calculateComplexity(content);
  const topics = extractTypeScriptTopics(content);

  return {
    type: hasProblems ? "problem" : hasSolutions ? "solution" : "unknown",
    complexity,
    topics,
    estimatedDifficulty: calculateDifficulty(content),
  };
});
```

#### Advanced Analytics

```typescript
export const generateExerciseAnalytics = Effect.gen(function* (
  sections: ExerciseSection[]
) {
  const analytics = {
    overview: {
      totalSections: sections.length,
      totalExercises: sections.reduce((sum, s) => sum + s.exercises.length, 0),
      averageExercisesPerSection: 0,
      completionRate: 0,
    },
    curriculum: {
      difficultyProgression: yield* analyzeDifficultyProgression(sections),
      topicCoverage: yield* analyzeTopicCoverage(sections),
      gapsAndDuplicates: yield* findCurriculumGaps(sections),
    },
    health: {
      namingConsistency: yield* analyzeNamingConsistency(sections),
      fileOrganization: yield* analyzeFileOrganization(sections),
      solutionCoverage: yield* analyzeSolutionCoverage(sections),
    },
    recommendations: yield* generateRecommendations(sections),
  };

  return analytics;
});
```

### ✅ Success Criteria & Testing

- [ ] **AI Integration**: AI suggestions are accurate and helpful
- [ ] **Content Analysis**: Correctly identifies exercise types from content
- [ ] **Analytics Value**: Provides actionable insights about exercise structure
- [ ] **Export Functionality**: Can export useful reports and automation scripts
- [ ] **Configuration**: Adaptable to different exercise organizational patterns
- [ ] **Complete Workflow**: Seamlessly integrates with Total TypeScript development process

---

## Testing Strategy & Quality Assurance

### Continuous Testing Approach

Each phase includes comprehensive testing that builds on previous phases:

1. **Unit Tests**: Core functionality tested in isolation
2. **Integration Tests**: Cross-component functionality
3. **End-to-End Tests**: Complete user workflows
4. **Performance Tests**: Handling large exercise repositories
5. **User Acceptance Tests**: Real-world usage scenarios

### Quality Gates

Before proceeding to the next phase:

- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] User feedback incorporated
- [ ] Documentation updated
- [ ] No regressions in previous functionality

### Feedback Integration Points

At the end of each phase:

1. **Demo the working prototype** to stakeholders
2. **Gather feedback** on user experience and functionality
3. **Adjust subsequent phases** based on learnings
4. **Refine requirements** for remaining features
5. **Update timeline** if needed based on complexity discoveries

This approach ensures that you always have a working tool that provides value, while building confidence in the direction before investing in more complex features.
