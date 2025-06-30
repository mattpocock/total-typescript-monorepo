# @total-typescript/twoslash-shared

A TypeScript library for transforming code with Twoslash syntax highlighting and type checking.

## Features

- 🎨 **Syntax Highlighting**: Transform TypeScript code into beautifully highlighted HTML using Shiki
- 🔍 **Type Checking**: Leverage Twoslash for inline TypeScript type checking and error reporting
- 📦 **CDN Integration**: Uses `twoslash-cdn` for efficient type loading and caching
- ⚡ **Dual Mode**: Supports both standard syntax highlighting and Twoslash-enhanced transformations

## Installation

```bash
pnpm add @total-typescript/twoslash-shared
```

## Usage

### Basic Code Transformation

```typescript
import { transformCode } from '@total-typescript/twoslash-shared';

// Standard syntax highlighting
const result = await transformCode({
  code: 'const hello = "world";',
  lang: 'typescript',
  mode: undefined
});

if (result.success) {
  console.log(result.codeHtml); // Highlighted HTML
}
```

### Twoslash Mode

```typescript
// Enhanced TypeScript checking with Twoslash
const result = await transformCode({
  code: 'const hello: string = "world";',
  lang: 'typescript', 
  mode: 'twoslash'
});

if (result.success) {
  console.log(result.codeHtml); // HTML with type information
} else {
  console.error(result.title, result.description);
}
```

### Code File Processing

```typescript
import { getCodeSamplesFromFile, getLangFromCodeFence } from '@total-typescript/twoslash-shared';

// Extract code samples from markdown files
const samples = getCodeSamplesFromFile(markdownContent);

// Detect language from code fence
const lang = getLangFromCodeFence('```typescript');
```

## API Reference

### `transformCode(options)`

Transforms code with optional Twoslash processing.

**Parameters:**
- `code`: The source code to transform
- `lang`: Programming language for syntax highlighting
- `mode`: Optional mode (`'twoslash'` for enhanced checking)

**Returns:** `Promise<ApplyShikiSuccess | ApplyShikiFailure>`

### Utility Functions

- `getCodeSamplesFromFile()`: Extract code blocks from files
- `getLangFromCodeFence()`: Parse language from markdown code fences

## Dependencies

- **Shiki**: Modern syntax highlighter
- **@shikijs/twoslash**: TypeScript-aware highlighting
- **twoslash-cdn**: CDN-based type loading
- **Zod**: Runtime type validation

## Development

```bash
# Build the package
pnpm run build

# Run tests
pnpm run test
```