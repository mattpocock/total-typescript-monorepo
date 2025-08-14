import { useState, useMemo, useCallback } from 'react';
import type { ExerciseTreeItem } from './useExerciseState.js';

// ============================================================================
// Search and Filtering Hook
// ============================================================================

export interface SearchState {
  searchTerm: string;
  isActive: boolean;
  matchCount: number;
}

export const useSearch = (allItems: ExerciseTreeItem[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return allItems;
    }

    const searchLower = searchTerm.toLowerCase();
    
    return allItems.filter(item => {
      // Always include sections if any of their exercises match
      if (item.type === 'section') {
        const hasMatchingExercises = allItems.some(otherItem => 
          otherItem.type === 'exercise' && 
          otherItem.section?.path === item.path &&
          matchesSearchTerm(otherItem, searchLower)
        );
        
        return matchesSearchTerm(item, searchLower) || hasMatchingExercises;
      }

      // For exercises, check if they match or their parent section matches
      if (item.type === 'exercise') {
        const parentSection = allItems.find(parentItem => 
          parentItem.type === 'section' && 
          parentItem.path === item.section?.path
        );
        
        return matchesSearchTerm(item, searchLower) || 
               (parentSection && matchesSearchTerm(parentSection, searchLower));
      }

      return false;
    });
  }, [allItems, searchTerm]);

  const activateSearch = useCallback(() => {
    setIsActive(true);
  }, []);

  const deactivateSearch = useCallback(() => {
    setIsActive(false);
    setSearchTerm('');
  }, []);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const matchCount = useMemo(() => {
    if (!searchTerm.trim()) return 0;
    return filteredItems.filter(item => 
      item.type === 'exercise' && 
      matchesSearchTerm(item, searchTerm.toLowerCase())
    ).length;
  }, [filteredItems, searchTerm]);

  return {
    searchTerm,
    isActive,
    filteredItems,
    matchCount,
    activateSearch,
    deactivateSearch,
    updateSearchTerm,
    clearSearch,
  };
};

// ============================================================================
// Search Matching Logic
// ============================================================================

const matchesSearchTerm = (item: ExerciseTreeItem, searchLower: string): boolean => {
  const itemName = item.displayName.toLowerCase();
  const itemPath = item.path.toLowerCase();
  
  // Check basic name and path matching
  if (itemName.includes(searchLower) || itemPath.includes(searchLower)) {
    return true;
  }

  // Check exercise-specific fields
  if (item.exercise) {
    const exerciseName = item.exercise.name.toLowerCase();
    const problemFile = item.exercise.problemFile.toLowerCase();
    const solutionFile = item.exercise.solutionFile?.toLowerCase() || '';
    
    if (exerciseName.includes(searchLower) || 
        problemFile.includes(searchLower) || 
        solutionFile.includes(searchLower)) {
      return true;
    }

    // Check for number matching
    const numberStr = item.exercise.number.toString();
    if (numberStr.includes(searchLower)) {
      return true;
    }
  }

  // Check section-specific fields
  if (item.section) {
    const sectionName = item.section.name.toLowerCase();
    const sectionNumber = item.section.number.toString();
    
    if (sectionName.includes(searchLower) || sectionNumber.includes(searchLower)) {
      return true;
    }
  }

  return false;
};

// ============================================================================
// Search Utilities
// ============================================================================

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '[$1]'); // Simple highlighting with brackets
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getSearchStats = (
  filteredItems: ExerciseTreeItem[],
  allItems: ExerciseTreeItem[]
): {
  filteredExerciseCount: number;
  totalExerciseCount: number;
  filteredSectionCount: number;
  totalSectionCount: number;
} => {
  const filteredExerciseCount = filteredItems.filter(item => item.type === 'exercise').length;
  const totalExerciseCount = allItems.filter(item => item.type === 'exercise').length;
  const filteredSectionCount = filteredItems.filter(item => item.type === 'section').length;
  const totalSectionCount = allItems.filter(item => item.type === 'section').length;

  return {
    filteredExerciseCount,
    totalExerciseCount,
    filteredSectionCount,
    totalSectionCount,
  };
};

// ============================================================================
// Quick Search Patterns
// ============================================================================

export const QUICK_SEARCH_PATTERNS = {
  errors: 'validation errors or missing solutions',
  missing: 'missing solution files',
  decimals: 'decimal exercise numbers',
  duplicates: 'duplicate exercise numbers',
} as const;

export const applyQuickSearchPattern = (
  pattern: keyof typeof QUICK_SEARCH_PATTERNS,
  allItems: ExerciseTreeItem[]
): ExerciseTreeItem[] => {
  switch (pattern) {
    case 'errors':
      return allItems.filter(item => item.hasErrors);
    
    case 'missing':
      return allItems.filter(item => 
        item.type === 'exercise' && !item.exercise?.solutionFile
      );
    
    case 'decimals':
      return allItems.filter(item => 
        item.type === 'exercise' && 
        item.exercise && 
        item.exercise.number % 1 !== 0
      );
    
    case 'duplicates':
      // This would require more complex logic to detect duplicates
      // For now, return empty array
      return [];
    
    default:
      return allItems;
  }
};