import React from 'react';
import { Box, Text } from 'ink';
import type { ExerciseTreeItem } from './hooks/useExerciseState.js';

// ============================================================================
// Exercise Tree Component
// ============================================================================

export interface ExerciseTreeProps {
  items: ExerciseTreeItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onToggleSection?: (sectionPath: string) => void;
  searchTerm?: string;
  height?: number;
}

export const ExerciseTree: React.FC<ExerciseTreeProps> = ({
  items,
  selectedIndex,
  onSelect,
  onToggleSection,
  searchTerm,
  height = 20,
}) => {
  // Calculate visible items based on height and selected index
  const visibleItems = getVisibleItems(items, selectedIndex, height);

  return (
    <Box 
      flexDirection="column" 
      borderStyle="single"
      paddingX={1}
      height={height}
    >
      {visibleItems.length === 0 ? (
        <Box padding={2} justifyContent="center">
          <Text color="gray">No exercises found</Text>
        </Box>
      ) : (
        visibleItems.map((item, index) => (
          <ExerciseTreeItem
            key={item.id}
            item={item}
            isSelected={item.originalIndex === selectedIndex}
            onSelect={() => onSelect(item.originalIndex)}
            onToggleSection={onToggleSection}
            searchTerm={searchTerm}
          />
        ))
      )}
    </Box>
  );
};

// ============================================================================
// Individual Tree Item Component
// ============================================================================

interface ExerciseTreeItemProps {
  item: ExerciseTreeItem & { originalIndex: number };
  isSelected: boolean;
  onSelect: () => void;
  onToggleSection?: (sectionPath: string) => void;
  searchTerm?: string;
}

const ExerciseTreeItem: React.FC<ExerciseTreeItemProps> = ({
  item,
  isSelected,
  onSelect,
  onToggleSection,
  searchTerm,
}) => {
  const handleClick = () => {
    if (item.type === 'section' && onToggleSection) {
      onToggleSection(item.path);
    }
    onSelect();
  };

  const getItemColor = () => {
    if (isSelected) return 'black';
    
    switch (item.status) {
      case 'error': return 'red';
      case 'warning': return 'yellow';
      case 'valid': return 'white';
      default: return 'white';
    }
  };

  const getBackgroundColor = () => {
    return isSelected ? getSelectionBackgroundColor(item) : undefined;
  };

  const formatDisplayName = () => {
    if (!searchTerm) return item.displayName;
    return highlightSearchTerm(item.displayName, searchTerm);
  };

  const getIndentation = () => {
    return '  '.repeat(item.level);
  };

  return (
    <Box>
      <Text
        color={getItemColor()}
        backgroundColor={getBackgroundColor()}
      >
        {isSelected ? '► ' : '  '}
        {getIndentation()}
        {formatDisplayName()}
      </Text>
      {item.type === 'exercise' && item.exercise && (
        <ExerciseMetadata exercise={item.exercise} isSelected={isSelected} />
      )}
    </Box>
  );
};

// ============================================================================
// Exercise Metadata Display
// ============================================================================

interface ExerciseMetadataProps {
  exercise: NonNullable<ExerciseTreeItem['exercise']>;
  isSelected: boolean;
}

const ExerciseMetadata: React.FC<ExerciseMetadataProps> = ({
  exercise,
  isSelected,
}) => {
  if (!isSelected) return null;

  return (
    <Box flexDirection="column" marginLeft={4} paddingY={1}>
      <Box gap={1}>
        <Text color="gray">Type:</Text>
        <Text color="white">{exercise.type}</Text>
        <Text color="gray">Number:</Text>
        <Text color="white">{exercise.number}</Text>
      </Box>
      
      <Box gap={1}>
        <Text color="gray">Problem:</Text>
        <Text color="cyan">{exercise.problemFile}</Text>
      </Box>
      
      {exercise.solutionFile && (
        <Box gap={1}>
          <Text color="gray">Solution:</Text>
          <Text color="green">{exercise.solutionFile}</Text>
        </Box>
      )}
      
      {exercise.validationErrors.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="red">Validation Errors:</Text>
          {exercise.validationErrors.slice(0, 3).map((error, index) => (
            <Text key={index} color="red">
              • {error.message}
            </Text>
          ))}
          {exercise.validationErrors.length > 3 && (
            <Text color="red">
              ... and {exercise.validationErrors.length - 3} more
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

interface VisibleItem extends ExerciseTreeItem {
  originalIndex: number;
}

const getVisibleItems = (
  items: ExerciseTreeItem[], 
  selectedIndex: number, 
  height: number
): VisibleItem[] => {
  const maxItems = Math.max(1, height - 2); // Account for borders
  
  // If we have fewer items than max, show all
  if (items.length <= maxItems) {
    return items.map((item, index) => ({ ...item, originalIndex: index }));
  }
  
  // Calculate start index to keep selected item in view
  let startIndex = Math.max(0, selectedIndex - Math.floor(maxItems / 2));
  const endIndex = Math.min(items.length, startIndex + maxItems);
  
  // Adjust start index if we're near the end
  if (endIndex - startIndex < maxItems) {
    startIndex = Math.max(0, endIndex - maxItems);
  }
  
  return items
    .slice(startIndex, endIndex)
    .map((item, index) => ({ ...item, originalIndex: startIndex + index }));
};

const getSelectionBackgroundColor = (item: ExerciseTreeItem): string => {
  switch (item.status) {
    case 'error': return 'red';
    case 'warning': return 'yellow';
    case 'valid': return 'cyan';
    default: return 'cyan';
  }
};

const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '[$1]');
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// ============================================================================
// Section Summary Component
// ============================================================================

export interface SectionSummaryProps {
  section: NonNullable<ExerciseTreeItem['section']>;
  isExpanded: boolean;
}

export const SectionSummary: React.FC<SectionSummaryProps> = ({
  section,
  isExpanded,
}) => {
  const exerciseCount = section.exercises.length;
  const errorCount = section.exercises.filter(ex => ex.validationErrors.length > 0).length;
  const missingCount = section.exercises.filter(ex => !ex.solutionFile).length;

  return (
    <Box gap={1}>
      <Text color="gray">
        {isExpanded ? '▼' : '▶'} {exerciseCount} exercises
      </Text>
      {errorCount > 0 && (
        <Text color="red">
          • {errorCount} error{errorCount !== 1 ? 's' : ''}
        </Text>
      )}
      {missingCount > 0 && (
        <Text color="yellow">
          • {missingCount} missing
        </Text>
      )}
    </Box>
  );
};