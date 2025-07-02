import { Console, Effect } from "effect";
import {
  type ExerciseParseResult,
  type ExerciseReport,
  type ExerciseSection,
  type OrphanedFile,
  type ReportSection,
  type ValidationError,
} from "./types.js";
import { getSummaryStats } from "./parser.js";

// ============================================================================
// Console Reporter
// ============================================================================

export const generateConsoleReport = (parseResult: ExerciseParseResult) => 
  Effect.gen(function* () {
    const report = generateReport(parseResult);
    
    yield* Console.log("\n" + "=".repeat(80));
    yield* Console.log("📚 Exercise Organizer - Analysis Report");
    yield* Console.log("=".repeat(80));

    // Report each section
    for (const section of report.sections) {
      yield* reportSection(section);
    }

    // Report summary
    yield* reportSummary(report.summary);

    return report;
  });

export const generateJsonReport = (parseResult: ExerciseParseResult) => 
  Effect.succeed(JSON.stringify(generateReport(parseResult), null, 2));

export const generateMarkdownReport = (parseResult: ExerciseParseResult) =>
  Effect.gen(function* () {
    const report = generateReport(parseResult);
    let markdown = "# Exercise Organizer Report\n\n";
    
    // Summary
    markdown += "## Summary\n\n";
    markdown += `- **Total Sections**: ${report.summary.totalSections}\n`;
    markdown += `- **Total Exercises**: ${report.summary.totalExercises}\n`;
    markdown += `- **Errors**: ${report.summary.errorCount}\n`;
    markdown += `- **Warnings**: ${report.summary.warningCount}\n\n`;

    // Sections
    for (const section of report.sections) {
      markdown += `## ${section.title}\n\n`;
      for (const item of section.items) {
        const icon = getItemIcon(item.type);
        markdown += `${icon} ${item.message}\n`;
        if (item.details) {
          markdown += `   ${item.details}\n`;
        }
        if (item.path) {
          markdown += `   Path: \`${item.path}\`\n`;
        }
        markdown += "\n";
      }
    }

    return markdown;
  });

// ============================================================================
// Report Generation
// ============================================================================

const generateReport = (parseResult: ExerciseParseResult): ExerciseReport => {
  const stats = getSummaryStats(parseResult);
  const sections: ReportSection[] = [];

  // Exercise Sections Report
  if (parseResult.sections.length > 0) {
    const exerciseSection: ReportSection = {
      title: "📁 Exercise Sections",
      items: parseResult.sections.map(section => ({
        type: section.validationErrors.length > 0 ? 'error' : 'success',
        message: `${section.name} (${section.exercises.length} exercises)`,
        details: section.validationErrors.length > 0 
          ? `${section.validationErrors.length} validation error(s)`
          : undefined,
        path: section.path,
      })),
      summary: `Found ${parseResult.sections.length} section(s)`,
    };
    sections.push(exerciseSection);
  }

  // Validation Errors Report
  if (parseResult.validationErrors.length > 0) {
    const errorSection: ReportSection = {
      title: "❌ Validation Errors",
      items: parseResult.validationErrors.map(error => ({
        type: error.severity === 'high' ? 'error' : 'warning',
        message: error.message,
        details: error.suggestion ? `Suggestion: ${error.suggestion}` : undefined,
        path: error.path,
      })),
      summary: `${parseResult.validationErrors.length} validation error(s) found`,
    };
    sections.push(errorSection);
  }

  // Orphaned Files Report
  if (parseResult.orphanedFiles.length > 0) {
    const orphanedSection: ReportSection = {
      title: "🔍 Orphaned Files",
      items: parseResult.orphanedFiles.map(file => ({
        type: 'warning' as const,
        message: file.fileName,
        details: `${file.reason}${file.suggestion ? `. Suggestion: ${file.suggestion}` : ''}`,
        path: file.path,
      })),
      summary: `${parseResult.orphanedFiles.length} orphaned file(s) found`,
    };
    sections.push(orphanedSection);
  }

  // Success message if no issues
  if (!parseResult.hasErrors) {
    const successSection: ReportSection = {
      title: "✅ All Good!",
      items: [{
        type: 'success',
        message: "No validation errors found",
        details: "All exercises are properly structured and named",
      }],
    };
    sections.push(successSection);
  }

  return {
    sections,
    summary: {
      totalSections: stats.totalSections,
      totalExercises: stats.totalExercises,
      errorCount: stats.errorCount,
      warningCount: stats.warningCount,
    },
    hasErrors: parseResult.hasErrors,
  };
};

// ============================================================================
// Console Output Formatters
// ============================================================================

const reportSection = (section: ReportSection) => Effect.gen(function* () {
  yield* Console.log(`\n${section.title}`);
  yield* Console.log("-".repeat(section.title.length));

  if (section.items.length === 0) {
    yield* Console.log("  (No items)");
    return;
  }

  for (const item of section.items) {
    const icon = getItemIcon(item.type);
    yield* Console.log(`  ${icon} ${item.message}`);
    
    if (item.details) {
      yield* Console.log(`      ${item.details}`);
    }
    
    if (item.path) {
      yield* Console.log(`      📂 ${item.path}`);
    }
  }

  if (section.summary) {
    yield* Console.log(`\n  Summary: ${section.summary}`);
  }
});

const reportSummary = (summary: ExerciseReport['summary']) => 
  Effect.gen(function* () {
    yield* Console.log("\n🔍 Analysis Complete");
    yield* Console.log("-".repeat(20));
    yield* Console.log(`  • ${summary.totalSections} sections found`);
    yield* Console.log(`  • ${summary.totalExercises} exercises found`);
    
    if (summary.errorCount > 0) {
      yield* Console.log(`  • ${summary.errorCount} validation errors`);
    }
    
    if (summary.warningCount > 0) {
      yield* Console.log(`  • ${summary.warningCount} warnings`);
    }

    if (summary.errorCount === 0 && summary.warningCount === 0) {
      yield* Console.log("  • No issues found ✨");
    } else {
      yield* Console.log(`\n💡 Tip: Run normalization to fix common issues`);
    }
    
    yield* Console.log("");
  });

// ============================================================================
// Helper Functions
// ============================================================================

const getItemIcon = (type: 'success' | 'warning' | 'error' | 'info'): string => {
  switch (type) {
    case 'success': return '✅';
    case 'warning': return '⚠️ ';
    case 'error': return '❌';
    case 'info': return 'ℹ️ ';
    default: return '•';
  }
};

// ============================================================================
// Validation Mode Reporter
// ============================================================================

export const reportValidationResult = (
  result: { hasErrors: boolean; errorCount: number; orphanedFileCount: number; totalExercises: number; sections: number }
) => Effect.gen(function* () {
  if (result.hasErrors) {
    yield* Console.error(`❌ Validation failed:`);
    yield* Console.error(`  • ${result.errorCount} validation errors`);
    yield* Console.error(`  • ${result.orphanedFileCount} orphaned files`);
    yield* Console.error(`  • Found in ${result.sections} sections with ${result.totalExercises} exercises`);
  } else {
    yield* Console.log(`✅ Validation passed:`);
    yield* Console.log(`  • ${result.totalExercises} exercises in ${result.sections} sections`);
    yield* Console.log(`  • No validation errors found`);
  }
});