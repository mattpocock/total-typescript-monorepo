# Exercise Organizer CLI - Product Requirements Document

## 1. Overview

### 1.1 Product Name

`exercise-organizer` (or `eo` for short command)

### 1.2 Purpose

A CLI tool for organizing and managing TypeScript tutorial exercises and media files in the total-typescript-monorepo. The tool provides a Terminal User Interface (TUI) for visualizing, validating, and reorganizing exercise files that follow specific naming conventions.

### 1.3 Target Users

- Content creators managing TypeScript tutorial materials
- Developers organizing educational content
- Internal users of the total-typescript-monorepo

## 2. Exercise Definition & File Structure

### 2.1 Exercise Types

#### 2.1.1 File-based Exercises

Exercises consisting of individual files following the pattern:

```
{NUMBER}-{DESCRIPTION}.{TYPE}.{EXTENSION}
{NUMBER}-{DESCRIPTION}.{TYPE}.{SOLUTION_NUMBER}.{EXTENSION}
```

Where:

- `NUMBER`: 3-digit number with optional decimal (e.g., `001`, `001.6`, `012.5`)
- `DESCRIPTION`: Dash-case description (e.g., `some-description`)
- `TYPE`: One of `problem`, `solution`, or `explainer`
- `SOLUTION_NUMBER`: Optional numeric identifier for multiple solutions (e.g., `1`, `2`)
- `EXTENSION`: File extension (e.g., `ts`, `mp4`, `js`)

**Examples:**

```
001-basic-types.problem.ts
001-basic-types.solution.ts
001-basic-types.solution.2.ts
002-advanced-generics.problem.mp4
002-advanced-generics.solution.mp4
```

#### 2.1.2 Folder-based Exercises

Exercises where the folder itself represents the exercise unit:

```
{NUMBER}-{DESCRIPTION}/
├── problem.ts
├── solution.ts
└── other-files...
```

**Example:**

```
002-some-exercise/
├── problem.ts
├── solution.ts
└── helper.ts
```

### 2.2 Section Structure

Sections are folders that contain multiple exercises:

```
{NUMBER}-{SECTION_NAME}/
├── {NUMBER}-exercise-1.problem.ts
├── {NUMBER}-exercise-1.solution.ts
├── {NUMBER}-exercise-2/
│   ├── problem.ts
│   └── solution.ts
```

### 2.3 Validation Rules

#### 2.3.1 Exercise Integrity

- Problem/solution pairs must have matching numbers and descriptions
- Multiple solutions must be numbered sequentially
- All files in a folder-based exercise must stay together

#### 2.3.2 Numbering Rules

- Within each directory level, exercise numbers must be unique
- Across different sections, exercises should have unique numbers globally
- Numbers should be sequential (no gaps) after normalization

## 3. Functional Requirements

### 3.1 Core Features

#### 3.1.1 Directory Analysis

- **F1**: Recursively scan directory for exercises and sections
- **F2**: Parse and validate exercise naming conventions
- **F3**: Identify exercise types (file-based vs folder-based)
- **F4**: Detect naming violations and formatting errors

#### 3.1.2 TUI Display

- **F5**: Display hierarchical view of all sections and exercises
- **F6**: Show all exercises expanded by default (no accordion)
- **F7**: Highlight invalid exercises with red warning indicators
- **F8**: Provide keyboard navigation (arrow keys, vim keys)

#### 3.1.3 Exercise Operations

- **F9**: Move exercises up/down within the same section
- **F10**: Move exercises between different sections
- **F11**: Maintain exercise integrity during moves (keep files together)

#### 3.1.4 Normalization

- **F12**: Remove decimal numbers and renumber sequentially
- **F13**: Fix section numbering conflicts
- **F14**: Preserve exercise order during normalization
- **F15**: Dry-run mode to preview changes before applying

#### 3.1.5 AI-Powered File Suggestions

- **F16**: Detect files that don't follow exercise naming conventions
- **F17**: Generate intelligent renaming suggestions using AI/pattern matching
- **F18**: Identify problem/solution pairs from file names and content
- **F19**: Suggest appropriate exercise numbers based on existing sequence
- **F20**: Batch apply AI suggestions with user confirmation

### 3.2 CLI Interface

#### 3.2.1 Command Structure

```bash
# Launch TUI in current directory
eo

# Launch TUI in specific directory
eo /path/to/exercises
```

#### 3.2.2 TUI Commands

- `↑/↓` or `j/k`: Navigate between exercises
- `↑/↓` or `J/K` (with modifier): Move exercise up/down
- `m`: Move exercise to different section
- `n`: Normalize numbering
- `v`: Validate current structure
- `s`: Show AI suggestions for non-conforming files
- `a`: Apply AI suggestions interactively
- `q`: Quit
- `h`: Help/command reference

### 3.3 Error Handling & Validation

#### 3.3.1 Validation Errors

- **E1**: Missing problem/solution pairs
- **E2**: Duplicate exercise numbers within same directory
- **E3**: Invalid naming format
- **E4**: Orphaned solution files without problems
- **E5**: Non-sequential numbering across sections
- **E6**: Files that don't conform to exercise naming conventions

#### 3.3.2 Error Display

- Red highlighting for invalid exercises
- Detailed error messages in status bar
- Validation summary showing total errors found

## 4. AI-Powered File Suggestions

### 4.1 Overview

The AI suggestion system analyzes files that don't conform to exercise naming conventions and provides intelligent renaming recommendations. This feature dramatically reduces manual work when importing existing educational content.

### 4.2 Detection Patterns

#### 4.2.1 Common Non-Conforming Patterns

The system should recognize and suggest fixes for these common patterns:

**Problem/Solution Pairs:**

- `Cool Exercise.mp4` → `001-cool-exercise.problem.mp4`
- `Cool Exercise Solution.mp4` → `001-cool-exercise.solution.mp4`
- `Basic Types - Problem.ts` → `002-basic-types.problem.ts`
- `Basic Types - Answer.ts` → `002-basic-types.solution.ts`

**Alternative Solution Indicators:**

- `Advanced Generics (Method 1).ts` → `003-advanced-generics.solution.1.ts`
- `Advanced Generics (Method 2).ts` → `003-advanced-generics.solution.2.ts`
- `Union Types - Solution A.ts` → `004-union-types.solution.1.ts`
- `Union Types - Solution B.ts` → `004-union-types.solution.2.ts`

**Explanatory Content:**

- `How Generics Work.md` → `005-how-generics-work.explainer.md`
- `Understanding Types - Explanation.mp4` → `006-understanding-types.explainer.mp4`

### 4.3 AI Logic & Pattern Matching

#### 4.3.1 Problem/Solution Detection

The AI should identify pairs by:

- **Filename similarity**: Levenshtein distance, common prefixes
- **Keywords**: "solution", "answer", "solved", "complete", "final"
- **File relationships**: Same directory, similar timestamps, matching extensions
- **Content analysis**: For text files, detect code patterns that suggest problem vs solution

#### 4.3.2 Exercise Number Assignment

- Analyze existing numbered exercises in the directory
- Suggest next available sequential number
- Maintain gaps if user has intentional spacing
- Handle decimal numbering conflicts intelligently

#### 4.3.3 Description Generation

- Convert title case to dash-case: "Cool Exercise" → "cool-exercise"
- Remove common suffixes: "- Problem", " Solution", " (Final)"
- Normalize spaces and special characters
- Preserve meaningful technical terms

### 4.4 Suggestion Confidence Scoring

#### 4.4.1 High Confidence (90-100%)

- Clear problem/solution keywords in filename
- Strong filename similarity between pairs
- Consistent file extensions
- Sequential naming patterns detected

#### 4.4.2 Medium Confidence (70-89%)

- Partial keyword matches
- Similar filenames with minor differences
- Content analysis supports relationship
- Some ambiguity in exercise type

#### 4.4.3 Low Confidence (50-69%)

- Weak filename similarity
- Unclear exercise relationships
- Multiple possible interpretations
- Requires manual review

### 4.5 User Interaction Flow

#### 4.5.1 Suggestion Review Interface

```
📁 /path/to/exercises
┌─ AI Suggestions (12 files, 6 exercises) ─────────────────┐
│                                                          │
│ ✓ Cool Exercise.mp4                                      │
│   → 001-cool-exercise.problem.mp4               [95%]   │
│                                                          │
│ ✓ Cool Exercise Solution.mp4                             │
│   → 001-cool-exercise.solution.mp4              [95%]   │
│                                                          │
│ ? Advanced Types Demo.ts                                 │
│   → 002-advanced-types-demo.problem.ts          [70%]   │
│   → 002-advanced-types-demo.explainer.ts        [65%]   │
│                                                          │
│ [A]pply All  [R]eview Each  [S]kip Low Confidence       │
└──────────────────────────────────────────────────────────┘
```

#### 4.5.2 Individual Review Mode

```
┌─ Suggestion Review (3 of 12) ─────────────────────────────┐
│                                                           │
│ Original: Advanced Types Demo.ts                          │
│                                                           │
│ Suggestions:                                              │
│ 1. 002-advanced-types-demo.problem.ts           [70%]    │
│ 2. 002-advanced-types-demo.explainer.ts         [65%]    │
│                                                           │
│ Reasoning: File contains incomplete code patterns         │
│ suggesting it's a problem file, but no clear solution    │
│ pair found in directory.                                  │
│                                                           │
│ [1] Option 1  [2] Option 2  [E]dit  [S]kip  [Q]uit      │
└───────────────────────────────────────────────────────────┘
```

### 4.6 Conflict Resolution

#### 4.6.1 Duplicate Numbers

When suggested numbers conflict with existing exercises:

- Automatically find next available number
- Offer to renumber existing sequence
- Show impact of renumbering decision

#### 4.6.2 Existing Files

When suggested filename already exists:

- Propose alternative numbering (e.g., `.1`, `.2` suffix)
- Suggest merging if files are similar
- Allow manual filename editing

#### 4.6.3 Orphaned Files

For files that can't be paired or classified:

- Mark as "requires manual review"
- Suggest most likely exercise type based on content
- Provide option to exclude from suggestions

## 5. Technical Requirements

### 5.1 Implementation

#### 5.1.1 Technology Stack

- **Language**: TypeScript/Node.js
- **TUI Library**: `@clack/prompts` or `ink` for React-like TUI
- **File System**: Node.js `fs` module with async operations
- **CLI Framework**: `commander.js` or `yargs`
- **AI/NLP**: Local pattern matching (no external AI APIs for privacy)
- **String Similarity**: `fuzzball` or `string-similarity` for filename matching

#### 4.1.2 Project Structure

```
src/
├── cli.ts              # Main CLI entry point
├── tui/               # TUI components
│   ├── main-view.ts   # Main exercise list view
│   ├── move-dialog.ts # Exercise moving interface
│   ├── suggest-view.ts # AI suggestions interface
│   └── help-view.ts   # Help screen
├── core/              # Core logic
│   ├── parser.ts      # Exercise parsing logic
│   ├── validator.ts   # Validation rules
│   ├── normalizer.ts  # Numbering normalization
│   ├── ai-suggester.ts # AI-powered file suggestions
│   └── file-ops.ts    # File system operations
├── types/             # TypeScript types
│   ├── exercise.ts    # Exercise and section types
│   └── suggestion.ts  # AI suggestion types
└── utils/             # Utility functions
    ├── path-utils.ts
    └── string-utils.ts # Text processing utilities
```

### 4.2 Data Models

#### 4.2.1 Exercise Model

```typescript
interface Exercise {
  id: string;
  number: number;
  description: string;
  type: "file-based" | "folder-based";
  files: ExerciseFile[];
  path: string;
  isValid: boolean;
  errors: ValidationError[];
}

interface ExerciseFile {
  path: string;
  type: "problem" | "solution" | "explainer";
  solutionNumber?: number;
  extension: string;
}
```

#### 4.2.2 Section Model

```typescript
interface Section {
  id: string;
  number: number;
  name: string;
  path: string;
  exercises: Exercise[];
  subsections: Section[];
  isValid: boolean;
  errors: ValidationError[];
}
```

#### 4.2.3 AI Suggestion Model

```typescript
interface FileSuggestion {
  originalPath: string;
  suggestedPath: string;
  confidence: number; // 0-1 scale
  reasoning: string;
  type: "rename" | "split" | "merge";
  relatedFiles?: string[]; // For problem/solution pairs
}

interface SuggestionBatch {
  suggestions: FileSuggestion[];
  totalFiles: number;
  estimatedTime: string;
  conflicts: SuggestionConflict[];
}

interface SuggestionConflict {
  type: "duplicate_number" | "existing_file" | "invalid_pairing";
  files: string[];
  resolution: string;
}
```

### 4.3 Performance Requirements

- **P1**: Handle directories with 1000+ exercises efficiently
- **P2**: Instant navigation response time (<100ms)
- **P3**: File operations should be atomic and safe
- **P4**: Provide progress indicators for long operations

## 5. User Experience Requirements

### 5.1 Visual Design

- Clean, readable terminal interface
- Consistent color scheme (red for errors, green for valid, blue for info)
- Clear hierarchy visualization with indentation
- Status bar showing current mode and available commands

### 5.2 Usability

- Intuitive keyboard shortcuts
- Undo functionality for move operations
- Confirmation dialogs for destructive operations
- Helpful error messages with suggested fixes

### 5.3 Accessibility

- Support for screen readers
- High contrast mode option
- Keyboard-only navigation
- Configurable key bindings

## 6. Integration Requirements

### 6.1 Monorepo Integration

- Package should be part of internal CLI tools
- Shared configuration with other monorepo tools
- Consistent logging and error reporting
- Integration with existing build processes

### 6.2 File System Safety

- Backup creation before bulk operations
- Atomic file moves to prevent corruption
- Rollback capability for failed operations
- Respect .gitignore and other ignore files

## 7. Future Enhancements

### 7.1 Phase 2 Features

- Advanced AI pattern learning from user corrections
- Custom naming convention templates
- Bulk exercise creation templates
- Import/export exercise configurations
- Integration with Git for change tracking
- Exercise dependency management

### 7.2 Phase 3 Features

- Web-based interface for remote management
- Collaborative editing features
- Exercise analytics and usage tracking
- Integration with learning management systems

## 8. Acceptance Criteria

### 8.1 Core Functionality

- ✅ Successfully parse and display complex directory structures
- ✅ Accurately identify and highlight validation errors
- ✅ Enable seamless exercise reordering within and between sections
- ✅ Safely normalize numbering while preserving exercise integrity
- ✅ Generate accurate AI suggestions with >85% user acceptance rate
- ✅ Handle batch renaming operations without data loss

### 8.2 User Experience

- ✅ Intuitive navigation requiring minimal learning curve
- ✅ Clear visual feedback for all operations
- ✅ Reliable undo/redo functionality
- ✅ Comprehensive help system

### 8.3 Technical Quality

- ✅ 100% test coverage for core logic
- ✅ Handle edge cases gracefully
- ✅ Cross-platform compatibility (Windows, macOS, Linux)
- ✅ Performance benchmarks met for large directories

## 9. Success Metrics

- Reduction in time spent manually organizing exercises by 80%
- Reduction in time spent renaming non-conforming files by 95%
- AI suggestion accuracy rate of 85%+ based on user acceptance
- Zero data loss incidents during file operations
- User adoption rate of 90% among target users
- Average task completion time under 30 seconds for common operations
- Average suggestion review time under 2 minutes for 50+ files
