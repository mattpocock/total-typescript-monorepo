# Exercise Organizer CLI - Multi-Step Implementation Plan

## Overview

This plan breaks down the Exercise Organizer CLI implementation into 8 strategic phases, each designed to be completed by a single agent within a manageable PR scope. Each phase builds upon the previous ones while maintaining independent functionality.

---

## Phase 1: Core Exercise Parsing & Data Models
**PR Size**: Medium (400-500 lines)
**Estimated Time**: 2-3 hours per agent
**Dependencies**: None

### 🎯 Goals
- Establish foundational data structures
- Implement exercise file parsing logic
- Create validation framework
- Set up basic TypeScript types

### 📁 Files to Create
```
apps/internal-cli/src/exercise-organizer/
├── types.ts                 # Core types and interfaces
├── parser.ts               # File parsing logic
├── validator.ts            # Exercise validation
├── exercise-detector.ts    # Exercise pattern detection
└── __tests__/
    ├── parser.test.ts      # Parser unit tests
    ├── validator.test.ts   # Validator unit tests
    └── fixtures/           # Test fixture files
```

### 🔧 Key Components

#### Types & Data Models
```typescript
// Exercise types (file-based vs folder-based)
export type Exercise = FileBasedExercise | FolderBasedExercise;

export interface ExerciseSection {
  path: AbsolutePath;
  name: string;
  number: number;
  exercises: Exercise[];
  validationErrors: ValidationError[];
}

export interface ExerciseParseResult {
  sections: ExerciseSection[];
  orphanedFiles: string[];
  validationErrors: ValidationError[];
}
```

#### Core Functions
```typescript
// Parse directory structure into exercise data
export const parseExerciseDirectory: (dir: AbsolutePath) => Effect<ExerciseParseResult>

// Validate exercise naming conventions
export const validateExercise: (exercise: Exercise) => ValidationError[]

// Detect exercise type from file patterns  
export const detectExerciseType: (filePath: string) => ExerciseType | null
```

### ✅ Success Criteria
- [ ] Parse file-based and folder-based exercises correctly
- [ ] Detect naming convention violations
- [ ] Identify problem/solution pairs accurately
- [ ] Handle edge cases (missing solutions, duplicates, etc.)
- [ ] 95%+ test coverage for parsing logic
- [ ] Clean TypeScript types with no compilation errors

### 🧪 Testing Strategy
- Unit tests for all parsing functions
- Fixture-based testing with real exercise directory structures
- Edge case testing (malformed names, missing files, etc.)
- Performance testing with large directory trees

---

## Phase 2: Basic CLI Command & Directory Scanning  
**PR Size**: Small-Medium (200-300 lines)
**Estimated Time**: 1-2 hours per agent
**Dependencies**: Phase 1

### 🎯 Goals
- Integrate with existing CLI structure
- Add basic `exercise-organizer` command
- Implement directory scanning workflow
- Provide console output and error reporting

### 📁 Files to Modify/Create
```
apps/internal-cli/src/bin.ts                    # Add new command
apps/internal-cli/src/exercise-organizer/
├── cli-command.ts          # Command implementation
└── __tests__/
    └── cli-command.test.ts # CLI integration tests
```

### 🔧 Key Components

#### CLI Integration
```typescript
// Add to bin.ts
program
  .command("exercise-organizer [directory]")
  .aliases(["eo", "exercises"])
  .description("Launch exercise organizer TUI for managing TypeScript exercises")
  .option("-d, --dry-run", "Analyze without making changes")
  .option("-v, --validate", "Validate exercises and exit")
  .action(async (directory: string | undefined, options: ExerciseOrganizerOptions) => {
    // Implementation using Effect patterns
  });
```

#### Command Implementation
```typescript
export const exerciseOrganizerCommand = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const targetDirectory = directory || process.cwd();
  
  // Parse directory structure
  const parseResult = yield* parseExerciseDirectory(targetDirectory);
  
  // Validate and report results
  if (options.validate) {
    yield* reportValidationResults(parseResult);
    return;
  }
  
  // Launch TUI (placeholder for Phase 3)
  yield* Console.log("Exercise organizer analysis complete!");
});
```

### ✅ Success Criteria
- [ ] CLI command integrates seamlessly with existing `tt` commands
- [ ] Directory scanning works for complex nested structures
- [ ] Validation-only mode provides clear error reporting
- [ ] Help text and command aliases work correctly
- [ ] Follows existing CLI patterns and error handling
- [ ] Effect-based architecture maintained

### 🧪 Testing Strategy
- CLI integration tests
- Directory scanning with various structures
- Validation mode testing
- Error handling verification

---

## Phase 3: Terminal User Interface (TUI) Foundation
**PR Size**: Large (600-700 lines) 
**Estimated Time**: 3-4 hours per agent
**Dependencies**: Phase 2

### 🎯 Goals
- Implement TUI using Ink (React for terminal)
- Create hierarchical exercise display
- Add keyboard navigation
- Build foundation for interactive operations

### 📁 Files to Create
```
apps/internal-cli/src/exercise-organizer/
├── tui/
│   ├── App.tsx                    # Main TUI component
│   ├── ExerciseTree.tsx          # Exercise tree display
│   ├── StatusBar.tsx             # Status and help bar
│   ├── ErrorDisplay.tsx          # Error highlighting
│   └── hooks/
│       ├── useKeyboard.ts        # Keyboard navigation
│       └── useExerciseState.ts   # Exercise state management
└── __tests__/
    └── tui/
        ├── App.test.tsx          # TUI component tests
        └── hooks.test.ts         # Hooks testing
```

### 🔧 Key Dependencies
```bash
# Add to package.json
"ink": "^4.4.1",
"react": "^18.2.0",
"@types/react": "^18.2.0"
```

### 🔧 Key Components

#### Main TUI App
```typescript
export const ExerciseOrganizerApp: React.FC<{
  parseResult: ExerciseParseResult;
  targetDirectory: string;
}> = ({ parseResult, targetDirectory }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'navigate' | 'move'>('navigate');
  
  // Keyboard handling
  useKeyboard((input, key) => {
    if (key.upArrow || input === 'k') handleUp();
    if (key.downArrow || input === 'j') handleDown();
    if (input === 'q') process.exit(0);
  });

  return (
    <Box flexDirection="column">
      <ExerciseTree 
        sections={parseResult.sections}
        selectedIndex={selectedIndex}
      />
      <StatusBar mode={mode} />
    </Box>
  );
};
```

#### Exercise Tree Display
```typescript
export const ExerciseTree: React.FC<{
  sections: ExerciseSection[];
  selectedIndex: number;
}> = ({ sections, selectedIndex }) => {
  return (
    <Box flexDirection="column">
      {sections.map((section, index) => (
        <SectionDisplay 
          key={section.path}
          section={section}
          isSelected={index === selectedIndex}
        />
      ))}
    </Box>
  );
};
```

### ✅ Success Criteria
- [ ] TUI renders exercise hierarchy correctly
- [ ] Keyboard navigation works (arrow keys, vim keys)
- [ ] Exercise validation errors highlighted in red
- [ ] Status bar shows available commands
- [ ] Clean, readable terminal interface
- [ ] Responsive to different terminal sizes

### 🧪 Testing Strategy
- Component testing with React Testing Library
- Keyboard navigation simulation
- Error display verification
- Visual regression testing (if possible)

---

## Phase 4: Exercise Operations (Move, Reorder)
**PR Size**: Medium-Large (500-600 lines)
**Estimated Time**: 3-4 hours per agent  
**Dependencies**: Phase 3

### 🎯 Goals
- Implement exercise moving operations
- Add reordering within sections
- Build file system operation safety
- Create undo/redo functionality

### 📁 Files to Create/Modify
```
apps/internal-cli/src/exercise-organizer/
├── operations/
│   ├── move-exercise.ts          # Exercise moving logic
│   ├── reorder-exercises.ts      # Reordering operations
│   ├── file-operations.ts       # Safe file system ops
│   └── undo-stack.ts            # Undo/redo management
├── tui/
│   ├── MoveMode.tsx             # Move operation UI
│   └── ConfirmDialog.tsx        # Confirmation dialogs
└── __tests__/
    └── operations/
        ├── move-exercise.test.ts
        ├── file-operations.test.ts  
        └── undo-stack.test.ts
```

### 🔧 Key Components

#### Move Operations
```typescript
export const moveExercise = Effect.gen(function* (
  exercise: Exercise,
  targetSection: ExerciseSection,
  targetIndex: number
) {
  // Validate move operation
  yield* validateMoveOperation(exercise, targetSection);
  
  // Create backup
  yield* createOperationBackup([exercise]);
  
  // Perform atomic file operations
  yield* moveExerciseFiles(exercise, targetSection, targetIndex);
  
  // Update exercise numbering
  yield* renumberExercises(targetSection);
  
  // Add to undo stack
  yield* addToUndoStack({
    type: 'move',
    exercise,
    originalSection: exercise.section,
    targetSection,
    targetIndex,
  });
});
```

#### Safe File Operations
```typescript
export const moveExerciseFiles = Effect.gen(function* (
  exercise: Exercise,
  targetSection: ExerciseSection,
  targetIndex: number
) {
  const fs = yield* FileSystem.FileSystem;
  
  // For file-based exercises: move individual files
  if (exercise.type === 'file-based') {
    for (const file of exercise.files) {
      const newPath = generateNewFilePath(file, targetSection, targetIndex);
      yield* fs.move(file.path, newPath);
    }
  }
  
  // For folder-based exercises: move entire folder
  if (exercise.type === 'folder-based') {
    const newPath = generateNewFolderPath(exercise, targetSection, targetIndex);
    yield* fs.move(exercise.path, newPath);
  }
});
```

### ✅ Success Criteria
- [ ] Move exercises between sections safely
- [ ] Reorder exercises within sections
- [ ] Maintain exercise integrity (problem/solution pairs)
- [ ] Atomic file operations (all or nothing)
- [ ] Undo/redo functionality works correctly
- [ ] User confirmation for destructive operations
- [ ] Progress indicators for long operations

### 🧪 Testing Strategy
- File operation testing with temporary directories
- Edge case testing (permission errors, disk space)
- Undo/redo stack validation
- Atomic operation verification
- Cross-platform compatibility testing

---

## Phase 5: Normalization & Renumbering
**PR Size**: Medium (400-500 lines)
**Estimated Time**: 2-3 hours per agent
**Dependencies**: Phase 4

### 🎯 Goals
- Implement exercise normalization (remove decimals)
- Add sequential renumbering functionality  
- Create dry-run preview mode
- Handle numbering conflicts intelligently

### 📁 Files to Create
```
apps/internal-cli/src/exercise-organizer/
├── normalization/
│   ├── normalize-exercises.ts    # Main normalization logic
│   ├── renumber-exercises.ts     # Renumbering operations
│   ├── conflict-resolution.ts   # Handle numbering conflicts
│   └── dry-run-preview.ts       # Preview changes
├── tui/
│   ├── NormalizeMode.tsx        # Normalization UI
│   └── PreviewDialog.tsx        # Dry-run preview display
└── __tests__/
    └── normalization/
        ├── normalize-exercises.test.ts
        ├── renumber-exercises.test.ts
        └── conflict-resolution.test.ts
```

### 🔧 Key Components

#### Normalization Logic
```typescript
export const normalizeExercises = Effect.gen(function* (
  sections: ExerciseSection[],
  options: NormalizationOptions
) {
  // Analyze current numbering
  const conflicts = yield* detectNumberingConflicts(sections);
  
  // Generate renumbering plan
  const renumberingPlan = yield* generateRenumberingPlan(sections, options);
  
  // Preview mode: return plan without executing
  if (options.dryRun) {
    return { plan: renumberingPlan, conflicts };
  }
  
  // Execute renumbering
  yield* executeRenumberingPlan(renumberingPlan);
  
  // Update exercise data structures
  yield* refreshExerciseData(sections);
});
```

#### Conflict Resolution
```typescript
export const resolveNumberingConflicts = Effect.gen(function* (
  conflicts: NumberingConflict[],
  strategy: ConflictResolutionStrategy
) {
  switch (strategy) {
    case 'sequential':
      return yield* resolveSequentially(conflicts);
    case 'preserve-gaps':
      return yield* resolvePreservingGaps(conflicts);
    case 'manual':
      return yield* resolveManually(conflicts);
  }
});
```

#### Dry-Run Preview
```typescript
export const generateNormalizationPreview = Effect.gen(function* (
  sections: ExerciseSection[]
) {
  const changes: FileRenameOperation[] = [];
  
  for (const section of sections) {
    for (const exercise of section.exercises) {
      const normalizedNumber = Math.floor(exercise.number);
      if (exercise.number !== normalizedNumber) {
        const renameOps = yield* generateRenameOperations(exercise, normalizedNumber);
        changes.push(...renameOps);
      }
    }
  }
  
  return {
    totalChanges: changes.length,
    operations: changes,
    estimatedTime: estimateOperationTime(changes),
  };
});
```

### ✅ Success Criteria
- [ ] Remove decimal numbers correctly (001.5 → 002)
- [ ] Renumber exercises sequentially
- [ ] Handle global numbering conflicts across sections
- [ ] Dry-run mode shows accurate preview
- [ ] Preserve exercise order during normalization
- [ ] Handle edge cases (gaps, duplicates, invalid numbers)

### 🧪 Testing Strategy
- Complex numbering scenario testing
- Dry-run accuracy verification
- Conflict resolution validation
- File system operation testing
- Performance testing with large exercise sets

---

## Phase 6: AI-Powered File Suggestions Foundation
**PR Size**: Large (600-800 lines)
**Estimated Time**: 4-5 hours per agent
**Dependencies**: Phase 5

### 🎯 Goals
- Detect non-conforming files
- Implement pattern matching for problem/solution pairs
- Create AI service integration for intelligent suggestions
- Build confidence scoring system

### 📁 Files to Create
```
apps/internal-cli/src/exercise-organizer/
├── ai-suggestions/
│   ├── file-detector.ts          # Detect non-conforming files
│   ├── pattern-matcher.ts        # Problem/solution pair matching
│   ├── suggestion-generator.ts   # Generate rename suggestions
│   ├── confidence-scorer.ts      # Score suggestion confidence
│   └── suggestion-types.ts       # Types for suggestions
├── services/
│   └── ai-naming-service.ts      # AI integration for naming
└── __tests__/
    └── ai-suggestions/
        ├── file-detector.test.ts
        ├── pattern-matcher.test.ts
        ├── suggestion-generator.test.ts
        └── confidence-scorer.test.ts
```

### 🔧 Key Components

#### File Detection
```typescript
export const detectNonConformingFiles = Effect.gen(function* (
  directory: AbsolutePath
) {
  const fs = yield* FileSystem.FileSystem;
  const allFiles = yield* fs.readDirectory(directory);
  
  const nonConforming: NonConformingFile[] = [];
  
  for (const file of allFiles) {
    const exerciseType = detectExerciseType(file);
    if (!exerciseType) {
      nonConforming.push({
        path: file,
        reason: 'invalid-naming-convention',
        confidence: 'high'
      });
    }
  }
  
  return nonConforming;
});
```

#### Pattern Matching
```typescript
export const findProblemSolutionPairs = Effect.gen(function* (
  files: NonConformingFile[]
) {
  const pairs: PotentialExercisePair[] = [];
  
  for (const file of files) {
    const candidates = findPairCandidates(file, files);
    
    for (const candidate of candidates) {
      const similarity = calculateFilenameSimilarity(file.path, candidate.path);
      const relationship = detectRelationship(file, candidate);
      
      if (similarity > 0.7 && relationship !== 'none') {
        pairs.push({
          problem: relationship === 'problem' ? file : candidate,
          solution: relationship === 'solution' ? file : candidate,
          confidence: calculatePairConfidence(similarity, relationship),
        });
      }
    }
  }
  
  return pairs;
});
```

#### AI Integration
```typescript
export const generateAIRenameSuggestions = Effect.gen(function* (
  file: NonConformingFile,
  context: ExerciseContext
) {
  const ai = yield* AIService;
  
  const prompt = `
    Analyze this file and suggest an appropriate exercise name following the pattern:
    {NUMBER}-{DESCRIPTION}.{TYPE}.{EXTENSION}
    
    File: ${file.path}
    Context: ${JSON.stringify(context)}
    Existing exercises: ${context.existingExercises.map(e => e.name).join(', ')}
    
    Suggest appropriate number, description, and type (problem/solution/explainer).
  `;
  
  const response = yield* ai.generateContent({ prompt });
  return parseAISuggestion(response);
});
```

### ✅ Success Criteria
- [ ] Accurately detect files that don't follow naming conventions
- [ ] Identify problem/solution pairs with >85% accuracy
- [ ] Generate intelligent exercise number suggestions
- [ ] Convert various naming formats to dash-case
- [ ] Score suggestions with meaningful confidence levels
- [ ] Handle edge cases (orphaned files, unclear relationships)

### 🧪 Testing Strategy
- Pattern matching accuracy testing
- AI service integration testing
- Confidence scoring validation
- Large dataset testing with real exercise files
- Cross-validation with manual categorization

---

## Phase 7: AI Suggestions UI & User Interaction
**PR Size**: Medium-Large (500-600 lines)
**Estimated Time**: 3-4 hours per agent
**Dependencies**: Phase 6

### 🎯 Goals
- Build AI suggestions review interface
- Implement batch and individual review modes
- Add suggestion editing and conflict resolution
- Create user-friendly interaction flow

### 📁 Files to Create/Modify
```
apps/internal-cli/src/exercise-organizer/
├── tui/
│   ├── SuggestionsMode.tsx       # AI suggestions interface
│   ├── SuggestionReview.tsx      # Individual suggestion review
│   ├── BatchApplyDialog.tsx      # Batch operation interface
│   └── SuggestionEditor.tsx      # Edit suggestions manually
├── ai-suggestions/
│   ├── user-interaction.ts       # User interaction workflow
│   ├── batch-operations.ts       # Batch apply/reject logic
│   └── conflict-resolver.ts      # Handle filename conflicts
└── __tests__/
    └── tui/
        ├── SuggestionsMode.test.tsx
        ├── SuggestionReview.test.tsx
        └── BatchApplyDialog.test.tsx
```

### 🔧 Key Components

#### Suggestions Review Interface
```typescript
export const SuggestionsMode: React.FC<{
  suggestions: FileSuggestion[];
  onApply: (suggestions: FileSuggestion[]) => void;
  onReject: (suggestions: FileSuggestion[]) => void;
}> = ({ suggestions, onApply, onReject }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState<'batch' | 'individual'>('batch');
  
  const highConfidenceCount = suggestions.filter(s => s.confidence > 0.8).length;
  const mediumConfidenceCount = suggestions.filter(s => s.confidence > 0.6 && s.confidence <= 0.8).length;
  
  return (
    <Box flexDirection="column">
      <Text bold>AI Suggestions ({suggestions.length} files, {calculateExerciseCount(suggestions)} exercises)</Text>
      
      {reviewMode === 'batch' && (
        <BatchSuggestionView 
          suggestions={suggestions}
          highConfidenceCount={highConfidenceCount}
          mediumConfidenceCount={mediumConfidenceCount}
        />
      )}
      
      {reviewMode === 'individual' && (
        <IndividualSuggestionReview 
          suggestion={suggestions[currentIndex]}
          currentIndex={currentIndex}
          totalCount={suggestions.length}
        />
      )}
      
      <SuggestionControls
        mode={reviewMode}
        onModeChange={setReviewMode}
        onApplyAll={() => onApply(suggestions.filter(s => s.confidence > 0.8))}
        onReviewEach={() => setReviewMode('individual')}
        onSkipLowConfidence={() => onApply(suggestions.filter(s => s.confidence > 0.6))}
      />
    </Box>
  );
};
```

#### Individual Review Component
```typescript
export const IndividualSuggestionReview: React.FC<{
  suggestion: FileSuggestion;
  currentIndex: number;
  totalCount: number;
}> = ({ suggestion, currentIndex, totalCount }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState(suggestion);
  
  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text color="dim">Suggestion Review ({currentIndex + 1} of {totalCount})</Text>
      
      <Box marginY={1}>
        <Text>Original: {suggestion.originalPath}</Text>
        
        {suggestion.alternatives.map((alt, index) => (
          <Box key={index} marginTop={1}>
            <Text color={getConfidenceColor(alt.confidence)}>
              {index + 1}. {alt.suggestedPath} [{Math.round(alt.confidence * 100)}%]
            </Text>
          </Box>
        ))}
      </Box>
      
      {suggestion.reasoning && (
        <Box marginY={1}>
          <Text color="dim">Reasoning: {suggestion.reasoning}</Text>
        </Box>
      )}
      
      <SuggestionActions
        suggestion={suggestion}
        editMode={editMode}
        onEdit={() => setEditMode(true)}
        onAccept={(index) => handleAcceptSuggestion(suggestion, index)}
        onReject={() => handleRejectSuggestion(suggestion)}
        onSkip={() => handleSkipSuggestion(suggestion)}
      />
    </Box>
  );
};
```

#### Batch Operations
```typescript
export const executeBatchSuggestions = Effect.gen(function* (
  suggestions: FileSuggestion[],
  options: BatchApplyOptions
) {
  // Filter suggestions based on confidence threshold
  const filteredSuggestions = suggestions.filter(s => s.confidence >= options.minConfidence);
  
  // Check for conflicts
  const conflicts = yield* detectSuggestionConflicts(filteredSuggestions);
  
  if (conflicts.length > 0 && !options.autoResolveConflicts) {
    return yield* promptForConflictResolution(conflicts);
  }
  
  // Execute renames in transaction
  yield* executeRenameTransaction(filteredSuggestions);
  
  // Update exercise data
  yield* refreshExerciseData();
  
  return {
    applied: filteredSuggestions.length,
    conflicts: conflicts.length,
    errors: 0
  };
});
```

### ✅ Success Criteria
- [ ] Intuitive suggestions review interface
- [ ] Batch apply with confidence filtering
- [ ] Individual suggestion editing
- [ ] Conflict detection and resolution
- [ ] Progress indicators for batch operations
- [ ] Clear visual confidence indicators
- [ ] Undo functionality for applied suggestions

### 🧪 Testing Strategy
- User interaction simulation
- Batch operation testing
- Conflict resolution verification
- UI component testing
- Error handling validation

---

## Phase 8: Integration, Testing & Polish
**PR Size**: Medium (400-500 lines)
**Estimated Time**: 2-3 hours per agent
**Dependencies**: All previous phases

### 🎯 Goals
- Integrate all features into cohesive TUI
- Add comprehensive error handling
- Implement help system and documentation
- Performance optimization and testing

### 📁 Files to Create/Modify
```
apps/internal-cli/src/exercise-organizer/
├── tui/
│   ├── HelpDialog.tsx           # Help system
│   ├── KeyboardShortcuts.tsx    # Keyboard reference
│   └── ErrorBoundary.tsx       # Error handling
├── performance/
│   ├── optimization.ts          # Performance optimizations
│   └── caching.ts              # Caching layer
├── help/
│   ├── help-content.ts         # Help text content
│   └── keyboard-shortcuts.ts   # Shortcut definitions
└── __tests__/
    ├── integration/
    │   ├── full-workflow.test.ts    # End-to-end tests
    │   ├── performance.test.ts      # Performance tests
    │   └── error-handling.test.ts   # Error scenarios
    └── e2e/
        └── exercise-organizer.e2e.ts # Complete workflow test
```

### 🔧 Key Components

#### Integrated TUI Controller
```typescript
export const ExerciseOrganizerController = Effect.gen(function* (
  initialDirectory: AbsolutePath,
  options: CLIOptions
) {
  // Initialize state
  const [state, setState] = useState<OrganizerState>({
    mode: 'navigate',
    parseResult: null,
    selectedIndex: 0,
    undoStack: [],
    redoStack: [],
    suggestions: [],
  });
  
  // Load initial data
  const parseResult = yield* parseExerciseDirectory(initialDirectory);
  setState(prev => ({ ...prev, parseResult }));
  
  // Setup keyboard handling
  const keyboardHandler = createKeyboardHandler({
    onNavigate: handleNavigation,
    onMove: handleMoveMode,
    onNormalize: handleNormalization,
    onSuggestions: handleSuggestionsMode,
    onHelp: showHelp,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onQuit: handleQuit,
  });
  
  // Render TUI with current state
  return <ExerciseOrganizerTUI state={state} onKeyboard={keyboardHandler} />;
});
```

#### Help System
```typescript
export const HelpDialog: React.FC<{
  currentMode: OrganizerMode;
  onClose: () => void;
}> = ({ currentMode, onClose }) => {
  const shortcuts = getKeyboardShortcutsForMode(currentMode);
  
  return (
    <Box flexDirection="column" borderStyle="double" padding={1}>
      <Text bold>Exercise Organizer - Help</Text>
      
      <Box marginY={1}>
        <Text color="yellow">Current Mode: {currentMode}</Text>
      </Box>
      
      <Box flexDirection="column">
        {shortcuts.map(shortcut => (
          <Box key={shortcut.key} justifyContent="space-between">
            <Text color="cyan">{shortcut.key.padEnd(15)}</Text>
            <Text>{shortcut.description}</Text>
          </Box>
        ))}
      </Box>
      
      <Box marginTop={1}>
        <Text color="dim">Press 'q' to close help, 'Esc' to exit current mode</Text>
      </Box>
    </Box>
  );
};
```

#### Performance Optimization
```typescript
export const optimizeExerciseData = Effect.gen(function* (
  parseResult: ExerciseParseResult
) {
  // Cache frequently accessed data
  const cache = yield* createExerciseCache(parseResult);
  
  // Optimize large directory operations
  const optimizedSections = yield* Effect.forEach(
    parseResult.sections,
    section => optimizeSection(section),
    { concurrency: 'inherit' }
  );
  
  // Create search indices for quick lookup
  const searchIndex = yield* createSearchIndex(optimizedSections);
  
  return {
    sections: optimizedSections,
    cache,
    searchIndex,
    validationErrors: parseResult.validationErrors,
  };
});
```

#### Error Handling & Recovery
```typescript
export const ExerciseOrganizerErrorBoundary: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);
  
  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>Exercise Organizer Error</Text>
        <Text color="red">{error.message}</Text>
        
        <Box marginTop={1}>
          <Text color="dim">
            This error has been logged. Please check your exercise directory structure
            and try again. Press 'r' to retry or 'q' to quit.
          </Text>
        </Box>
        
        <ErrorRecoveryActions
          error={error}
          onRetry={() => setError(null)}
          onQuit={() => process.exit(1)}
        />
      </Box>
    );
  }
  
  return <>{children}</>;
};
```

### ✅ Success Criteria
- [ ] All features work together seamlessly
- [ ] Comprehensive help system with context-aware shortcuts
- [ ] Robust error handling with graceful degradation
- [ ] Performance optimized for large exercise directories
- [ ] Complete keyboard navigation without mouse dependency
- [ ] Clear visual feedback for all operations
- [ ] Cross-platform compatibility (Windows, macOS, Linux)
- [ ] Memory usage optimization
- [ ] Comprehensive end-to-end testing

### 🧪 Testing Strategy
- Full workflow integration testing
- Performance benchmarking with large datasets
- Error scenario simulation
- Cross-platform compatibility testing
- Memory leak detection
- User acceptance testing
- Accessibility testing (screen readers, high contrast)

---

## 🎯 Overall Success Metrics

### Functional Requirements
- [ ] Parse complex exercise directory structures (100+ exercises)
- [ ] Accurately identify validation errors with specific error messages
- [ ] Enable seamless exercise reordering within and between sections
- [ ] Safely normalize numbering while preserving exercise integrity
- [ ] Generate AI suggestions with >85% user acceptance rate
- [ ] Handle batch renaming operations without data loss
- [ ] Provide undo/redo functionality for all operations

### Performance Requirements
- [ ] Load and parse directories with 1000+ files in <2 seconds
- [ ] Smooth TUI navigation with <50ms response time
- [ ] Memory usage <100MB for typical exercise directories
- [ ] File operations complete in <5 seconds for most use cases

### User Experience Requirements
- [ ] Intuitive navigation requiring minimal learning curve
- [ ] Clear visual feedback for all operations and states
- [ ] Comprehensive help system accessible via 'h' key
- [ ] Graceful error handling with actionable error messages

### Technical Quality Requirements
- [ ] 95%+ test coverage for core logic
- [ ] Zero TypeScript compilation errors
- [ ] Effect-based functional programming patterns maintained
- [ ] Integration with existing internal-cli architecture
- [ ] Cross-platform file system compatibility

---

## 🚀 Deployment Strategy

### Phase-by-Phase Rollout
1. **Phases 1-2**: Core functionality available, validation-only mode
2. **Phases 3-4**: Full TUI with basic operations
3. **Phases 5-6**: Normalization and AI suggestions
4. **Phases 7-8**: Complete feature set with polish

### Feature Flags
- Enable AI suggestions via environment variable
- Debug mode for verbose logging
- Performance profiling mode
- Safe mode (read-only operations)

### Rollback Plan
- Each phase maintains backward compatibility
- Feature flags allow disabling problematic features
- Undo functionality provides operation-level rollback
- Backup creation before destructive operations

---

## 📚 Documentation Requirements

### User Documentation
- [ ] Command-line interface documentation
- [ ] Keyboard shortcuts reference
- [ ] Exercise naming convention guide
- [ ] Troubleshooting guide

### Developer Documentation
- [ ] Architecture overview
- [ ] Contributing guide
- [ ] Testing strategy documentation
- [ ] Performance optimization guide

### Integration Documentation
- [ ] Effect-based patterns used
- [ ] Service layer integration
- [ ] Error handling patterns
- [ ] Extension points for future features

---

This plan provides a comprehensive roadmap for implementing the Exercise Organizer CLI while ensuring each phase can be completed by a single agent within a manageable PR scope. Each phase builds upon the previous ones while maintaining independent, testable functionality.