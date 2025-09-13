import { useState, useMemo, useCallback } from 'react';
import type { ExerciseParseResult, ExerciseSection, Exercise } from '../../types.js';

// ============================================================================
// Exercise State Management Hook
// ============================================================================

export interface ExerciseTreeItem {
  type: 'section' | 'exercise';
  id: string;
  displayName: string;
  path: string;
  section?: ExerciseSection;
  exercise?: Exercise;
  level: number;
  hasErrors: boolean;
  status: 'valid' | 'warning' | 'error';
}

export const useExerciseState = (parseResult: ExerciseParseResult) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(parseResult.sections.map(s => s.path))
  );

  // Convert the parsed result into a flat tree structure for navigation
  const treeItems = useMemo((): ExerciseTreeItem[] => {
    const items: ExerciseTreeItem[] = [];

    parseResult.sections.forEach(section => {
      // Add section item
      const sectionItem: ExerciseTreeItem = {
        type: 'section',
        id: `section-${section.path}`,
        displayName: `📁 ${String(section.number).padStart(2, '0')}-${section.name}`,
        path: section.path,
        section,
        level: 0,
        hasErrors: section.validationErrors.length > 0 || 
                   section.exercises.some(ex => ex.validationErrors.length > 0),
        status: section.validationErrors.length > 0 ? 'error' : 
                section.exercises.some(ex => ex.validationErrors.length > 0) ? 'warning' : 'valid',
      };

      items.push(sectionItem);

      // Add exercises if section is expanded
      if (expandedSections.has(section.path)) {
        section.exercises.forEach(exercise => {
          const exerciseItem: ExerciseTreeItem = {
            type: 'exercise',
            id: `exercise-${exercise.path}`,
            displayName: formatExerciseDisplay(exercise),
            path: exercise.path,
            exercise,
            section,
            level: 1,
            hasErrors: exercise.validationErrors.length > 0,
            status: exercise.validationErrors.length > 0 ? 'error' : 
                    !exercise.solutionFile ? 'warning' : 'valid',
          };

          items.push(exerciseItem);
        });
      }
    });

    return items;
  }, [parseResult.sections, expandedSections]);

  const toggleSection = useCallback((sectionPath: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionPath)) {
        newSet.delete(sectionPath);
      } else {
        newSet.add(sectionPath);
      }
      return newSet;
    });
  }, []);

  const expandAllSections = useCallback(() => {
    setExpandedSections(new Set(parseResult.sections.map(s => s.path)));
  }, [parseResult.sections]);

  const collapseAllSections = useCallback(() => {
    setExpandedSections(new Set());
  }, []);

  const getSelectedItem = useCallback((index: number): ExerciseTreeItem | undefined => {
    return treeItems[index];
  }, [treeItems]);

  const getSectionSummary = useCallback((section: ExerciseSection) => {
    const exerciseCount = section.exercises.length;
    const errorCount = section.exercises.filter(ex => ex.validationErrors.length > 0).length;
    const missingCount = section.exercises.filter(ex => !ex.solutionFile).length;

    return {
      exerciseCount,
      errorCount,
      missingCount,
      statusText: `(${exerciseCount} exercises${errorCount > 0 ? `, ${errorCount} errors` : ''}${missingCount > 0 ? `, ${missingCount} missing solutions` : ''})`
    };
  }, []);

  return {
    treeItems,
    expandedSections,
    toggleSection,
    expandAllSections,
    collapseAllSections,
    getSelectedItem,
    getSectionSummary,
    totalItems: treeItems.length,
  };
};

// ============================================================================
// Helper Functions
// ============================================================================

const formatExerciseDisplay = (exercise: Exercise): string => {
  const number = String(Math.floor(exercise.number)).padStart(3, '0');
  const hasDecimal = exercise.number % 1 !== 0;
  const displayNumber = hasDecimal ? exercise.number.toString() : number;
  
  const statusIcon = getExerciseStatusIcon(exercise);
  const solutionIndicator = exercise.solutionFile ? 
    ` → ${exercise.solutionFile}` : '';

  return `  ${statusIcon} ${displayNumber}-${exercise.name}${solutionIndicator}`;
};

const getExerciseStatusIcon = (exercise: Exercise): string => {
  if (exercise.validationErrors.length > 0) {
    return '❌';
  }
  if (!exercise.solutionFile) {
    return '⚠️ ';
  }
  return '✅';
};

// ============================================================================
// Tree Navigation Utilities
// ============================================================================

export const findItemIndexByPath = (
  items: ExerciseTreeItem[], 
  path: string
): number => {
  return items.findIndex(item => item.path === path);
};

export const getParentSection = (
  items: ExerciseTreeItem[], 
  exerciseIndex: number
): ExerciseTreeItem | undefined => {
  const item = items[exerciseIndex];
  if (!item || item.type !== 'exercise') return undefined;

  // Find the preceding section
  for (let i = exerciseIndex - 1; i >= 0; i--) {
    const candidate = items[i];
    if (candidate?.type === 'section' && candidate.section?.path === item.section?.path) {
      return candidate;
    }
  }

  return undefined;
};

export const getNextExercise = (
  items: ExerciseTreeItem[], 
  currentIndex: number
): number => {
  for (let i = currentIndex + 1; i < items.length; i++) {
    if (items[i]?.type === 'exercise') {
      return i;
    }
  }
  return currentIndex;
};

export const getPreviousExercise = (
  items: ExerciseTreeItem[], 
  currentIndex: number
): number => {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (items[i]?.type === 'exercise') {
      return i;
    }
  }
  return currentIndex;
};