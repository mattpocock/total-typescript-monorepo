# Content Organizer CLI - Product Requirements Document

## 1. Overview

### 1.1 Product Name

`content-organizer` (part of `@total-typescript/internal-cli`)

### 1.2 Purpose

A CLI command for organizing and managing TypeScript educational content and media files in the Total TypeScript monorepo. The tool provides a Terminal User Interface (TUI) for visualizing, validating, and reorganizing content files that follow the established naming conventions used throughout the repository.

### 1.3 Target Users

- Content creators managing TypeScript educational materials
- Internal users of the Total TypeScript monorepo
- Developers organizing educational content for courses and tutorials

## 2. Content Definition & File Structure

### 2.1 Current Content Types

Based on the existing repository structure:

#### 2.1.1 Educational Content Files

Content consisting of markdown files with optional TypeScript source files:

```
{TOPIC_NAME}.md
{TOPIC_NAME}.source.ts
```

Where:
- `TOPIC_NAME`: Dash-case description (e.g., `discriminated-unions`, `excess-object-properties`)
- `.md`: Main educational content in markdown format
- `.source.ts`: Optional TypeScript source code examples

**Examples:**
```
discriminated-unions.md
discriminated-unions.source.ts
excess-object-properties.md
excess-object-properties.source.ts
never.md
never.source.ts
```

#### 2.1.2 Topic-based Directory Structure

Content is organized in topic-based directories:

```
youtube-videos/
├── essential-tips/
│   ├── discriminated-unions.md
│   ├── discriminated-unions.source.ts
│   └── excess-object-properties.md
├── generics-tips/
│   └── use-statuses.md
└── react-and-typescript-tips/
```

### 2.2 Directory Organization

Sections are logical groupings that contain related content:

```
{SECTION_NAME}/
├── topic-1.md
├── topic-1.source.ts
├── topic-2.md
└── topic-3/
    ├── subtopic.md
    └── subtopic.source.ts
```

### 2.3 Validation Rules

#### 2.3.1 Content Integrity

- Markdown files may have optional accompanying `.source.ts` files
- File names must use dash-case convention
- Content should be properly categorized in logical directories
- No orphaned source files without corresponding markdown content

#### 2.3.2 Naming Rules

- Within each directory, content names should be descriptive and unique
- File names should follow kebab-case convention
- Avoid special characters or spaces in file names

## 3. Functional Requirements

### 3.1 Core Features

#### 3.1.1 Directory Analysis

- **F1**: Recursively scan directories for content files (`.md`, `.ts`, `.mp4`, etc.)
- **F2**: Parse and validate content naming conventions
- **F3**: Identify content types and relationships (markdown + source pairs)
- **F4**: Detect naming violations and organizational issues

#### 3.1.2 TUI Display

- **F5**: Display hierarchical view of all sections and content
- **F6**: Show content files with their relationships (markdown + source pairs)
- **F7**: Highlight validation issues with clear indicators
- **F8**: Provide keyboard navigation using established patterns

#### 3.1.3 Content Operations

- **F9**: Move content between directories
- **F10**: Rename content files while maintaining relationships
- **F11**: Maintain content integrity during moves (keep related files together)

#### 3.1.4 Organization & Cleanup

- **F12**: Suggest better organization for misplaced content
- **F13**: Fix naming convention violations
- **F14**: Reorganize content based on topic relationships
- **F15**: Dry-run mode to preview changes before applying

#### 3.1.5 AI-Powered Content Suggestions

- **F16**: Detect files that don't follow naming conventions
- **F17**: Generate intelligent organization suggestions
- **F18**: Identify content relationships and groupings
- **F19**: Suggest appropriate directory placement
- **F20**: Batch apply organization suggestions with user confirmation

### 3.2 CLI Interface

#### 3.2.1 Command Structure

```bash
# Launch content organizer in current directory
tt organize

# Launch organizer in specific directory
tt organize /path/to/content

# Launch with specific content type focus
tt organize --type youtube-videos
```

#### 3.2.2 TUI Commands

- `↑/↓` or `j/k`: Navigate between content items
- `↑/↓` or `J/K` (with modifier): Move content up/down
- `m`: Move content to different directory
- `r`: Rename content
- `o`: Organize/suggest improvements
- `v`: Validate current structure
- `s`: Show AI suggestions for improvements
- `a`: Apply AI suggestions interactively
- `q`: Quit
- `h`: Help/command reference

### 3.3 Error Handling & Validation

#### 3.3.1 Validation Errors

- **E1**: Files not following naming conventions
- **E2**: Orphaned source files without markdown content
- **E3**: Inconsistent directory organization
- **E4**: Content in inappropriate directories
- **E5**: Missing or broken content relationships

#### 3.3.2 Error Display

- Clear highlighting for problematic content
- Detailed error messages with suggestions
- Validation summary showing total issues found

## 4. AI-Powered Content Suggestions

### 4.1 Overview

The AI suggestion system analyzes content organization and provides intelligent recommendations for improving structure, naming, and categorization.

### 4.2 Content Analysis Patterns

#### 4.2.1 Content Relationship Detection

The system should recognize and suggest fixes for:

**Related Content Grouping:**
- `Basic Types.md` → `basic-types.md` (in appropriate directory)
- `Advanced Generics Tutorial.mp4` → `advanced-generics.md` (with proper structure)
- Content that belongs together in topic directories

**Naming Convention Fixes:**
- `Cool Exercise.md` → `cool-exercise.md`
- `TypeScript Tips - Part 1.md` → `typescript-tips-part-1.md`
- `Understanding_Types.md` → `understanding-types.md`

#### 4.2.2 Directory Organization

- Suggest moving content to more appropriate directories
- Identify when new topic directories should be created
- Recommend restructuring based on content themes

### 4.3 Content Analysis Logic

#### 4.3.1 Content Type Detection

The AI should identify content by:
- **File extension**: `.md`, `.ts`, `.mp4`, etc.
- **Content analysis**: For text files, detect educational patterns
- **Naming patterns**: Common educational content naming
- **Directory context**: Understand current organizational structure

#### 4.3.2 Organization Suggestions

- Analyze content themes and topics
- Suggest logical groupings and directory structures
- Recommend naming improvements for clarity
- Identify content that should be moved or reorganized

## 5. Technical Requirements

### 5.1 Implementation

#### 5.1.1 Technology Stack

- **Language**: TypeScript with Effect-TS functional programming patterns
- **CLI Framework**: Commander.js (consistent with existing `@total-typescript/internal-cli`)
- **TUI Library**: `@clack/prompts` or `prompts` (already used in the monorepo)
- **Effect-TS**: For typed errors, dependency injection, and workflows
- **File System**: Effect Platform FileSystem with proper error handling
- **String Processing**: Built-in string utilities, no external NLP dependencies

#### 5.1.2 Project Structure

```
apps/internal-cli/src/
├── commands/
│   └── organize.ts         # Content organization command
├── content-organizer/      # Content organizer implementation
│   ├── services/
│   │   ├── content-parser.ts      # Content file parsing
│   │   ├── content-validator.ts   # Validation logic  
│   │   ├── content-organizer.ts   # Organization operations
│   │   └── ai-suggester.ts        # Content suggestions
│   ├── workflows/
│   │   ├── organize-workflow.ts   # Main organization workflow
│   │   └── validation-workflow.ts # Content validation
│   ├── tui/
│   │   ├── main-view.ts          # Main content list view
│   │   ├── organize-dialog.ts    # Content organization interface
│   │   └── suggestions-view.ts   # AI suggestions interface
│   ├── types/
│   │   ├── content.ts            # Content and directory types
│   │   └── suggestion.ts         # AI suggestion types
│   └── errors/
│       └── content-errors.ts     # Tagged errors for content operations
```

### 5.2 Effect-TS Integration

#### 5.2.1 Service Pattern

```typescript
export class ContentOrganizerService extends Effect.Service<ContentOrganizerService>()(
  "ContentOrganizerService",
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      
      return {
        analyzeContent: Effect.fn("analyzeContent")(function* (path: string) {
          // Implementation using Effect patterns
        }),
        
        organizeContent: Effect.fn("organizeContent")(function* (suggestions: Suggestion[]) {
          // Implementation
        }),
      };
    }),
    dependencies: [NodeFileSystem.layer],
  }
) {}
```

#### 5.2.2 Tagged Errors

```typescript
export class ContentNotFoundError extends Data.TaggedError("ContentNotFoundError")<{
  path: string;
}> {}

export class InvalidContentStructureError extends Data.TaggedError("InvalidContentStructureError")<{
  cause: Error;
  path: string;
}> {}
```

#### 5.2.3 Workflow Pattern

```typescript
const organizeContentWorkflow = (contentPath: string) =>
  Effect.gen(function* () {
    const organizer = yield* ContentOrganizerService;
    const validator = yield* ContentValidatorService;
    
    const content = yield* organizer.analyzeContent(contentPath);
    const issues = yield* validator.validateContent(content);
    
    if (issues.length > 0) {
      const suggestions = yield* organizer.generateSuggestions(issues);
      return yield* organizer.applySuggestions(suggestions);
    }
    
    return content;
  });
```

### 5.3 Data Models

#### 5.3.1 Content Model

```typescript
interface ContentItem {
  id: string;
  name: string;
  type: "markdown" | "typescript" | "video" | "other";
  path: string;
  relatedFiles: ContentFile[];
  isValid: boolean;
  errors: ValidationError[];
}

interface ContentFile {
  path: string;
  type: "main" | "source" | "media";
  extension: string;
}
```

#### 5.3.2 Directory Model

```typescript
interface ContentDirectory {
  id: string;
  name: string;
  path: string;
  content: ContentItem[];
  subdirectories: ContentDirectory[];
  isValid: boolean;
  errors: ValidationError[];
}
```

### 5.4 Performance Requirements

- **P1**: Handle content directories with 500+ files efficiently
- **P2**: Instant navigation response time (<100ms)
- **P3**: File operations should use Effect patterns for safety
- **P4**: Provide progress indicators for long operations

## 6. Integration Requirements

### 6.1 Monorepo Integration

- **I1**: Integrate as a command in the existing `@total-typescript/internal-cli`
- **I2**: Use shared utilities from `@total-typescript/shared` package
- **I3**: Follow established Effect-TS patterns used throughout the monorepo
- **I4**: Leverage existing services and layers where appropriate
- **I5**: Consistent error handling and logging with other tools

### 6.2 Shared Package Usage

- **I6**: Use `@total-typescript/shared` for common utilities
- **I7**: Leverage file system utilities from existing packages
- **I8**: Share configuration patterns with other CLI commands
- **I9**: Use established TypeScript configurations and build processes

### 6.3 File System Safety

- **I10**: Use Effect FileSystem for all file operations
- **I11**: Implement proper error handling with tagged errors
- **I12**: Atomic operations to prevent data corruption
- **I13**: Respect .gitignore and other ignore files
- **I14**: Backup capabilities for destructive operations

## 7. User Experience Requirements

### 7.1 Visual Design

- Clean, readable terminal interface consistent with existing CLI tools
- Clear visual hierarchy with proper indentation
- Status indicators and progress feedback
- Helpful error messages with actionable suggestions

### 7.2 Usability

- Intuitive keyboard shortcuts consistent with CLI conventions
- Confirmation dialogs for destructive operations
- Undo functionality where possible
- Context-sensitive help and command references

## 8. Future Enhancements

### 8.1 Phase 2 Features

- Integration with existing content creation workflows (`pnpm write`, `pnpm new`)
- Content template suggestions based on existing patterns
- Integration with video processing workflows
- Content analytics and usage tracking

### 8.2 Phase 3 Features

- Integration with `written-content-manager` web application
- Content relationship mapping and visualization
- Automated content quality checks
- Integration with publishing workflows

## 9. Acceptance Criteria

### 9.1 Core Functionality

- ✅ Successfully parse and display content directory structures
- ✅ Accurately identify and highlight organizational issues
- ✅ Enable seamless content reorganization and renaming
- ✅ Safely reorganize content while preserving file relationships
- ✅ Generate accurate organization suggestions with >80% user acceptance rate
- ✅ Handle batch operations without data loss

### 9.2 Integration

- ✅ Seamlessly integrate with existing `@total-typescript/internal-cli`
- ✅ Follow established Effect-TS patterns and error handling
- ✅ Use shared utilities and maintain consistency with other tools
- ✅ Respect existing monorepo conventions and build processes

### 9.3 User Experience

- ✅ Provide intuitive navigation and operation
- ✅ Clear feedback for all operations
- ✅ Helpful error messages and suggestions
- ✅ Consistent behavior with other CLI tools in the monorepo
