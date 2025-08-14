import React from 'react';
import { Box, Text } from 'ink';
import type { ExerciseTreeItem } from './hooks/useExerciseState.js';

// ============================================================================
// Status Bar Component
// ============================================================================

export interface StatusBarProps {
  mode: 'browse' | 'search' | 'help';
  selectedItem?: ExerciseTreeItem;
  totalItems: number;
  selectedIndex: number;
  filteredCount?: number;
  searchTerm?: string;
  hasErrors: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  mode,
  selectedItem,
  totalItems,
  selectedIndex,
  filteredCount,
  searchTerm,
  hasErrors,
}) => {
  const renderModeSpecificContent = () => {
    switch (mode) {
      case 'search':
        return (
          <Box gap={1}>
            <Text color="yellow">Search:</Text>
            <Text color="white">{searchTerm || ''}</Text>
            {filteredCount !== undefined && (
              <Text color="gray">
                ({filteredCount}/{totalItems} items)
              </Text>
            )}
          </Box>
        );
      
      case 'help':
        return (
          <Box gap={1}>
            <Text color="blue">Help Mode</Text>
            <Text color="gray">Press ESC to return</Text>
          </Box>
        );
      
      case 'browse':
      default:
        return (
          <Box gap={1}>
            <Text color="gray">
              {selectedIndex + 1}/{totalItems}
            </Text>
            {selectedItem && (
              <Text color="white">
                {selectedItem.type === 'section' ? '📁' : '📄'} {selectedItem.displayName}
              </Text>
            )}
            {hasErrors && <Text color="red">• Has Errors</Text>}
          </Box>
        );
    }
  };

  const renderKeyboardHelp = () => {
    if (mode === 'help') {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color="cyan" bold>Keyboard Shortcuts</Text>
          <Text color="gray">Navigation:</Text>
          <Text>  ↑/↓ or j/k    Navigate up/down</Text>
          <Text>  Enter         Select/toggle section</Text>
          <Text>  /             Search exercises</Text>
          <Text>  ?             Show/hide help</Text>
          <Text>  q             Quit</Text>
          <Text>  ESC           Cancel/back</Text>
          <Text color="gray">Status Icons:</Text>
          <Text>  ✅            Exercise with solution</Text>
          <Text>  ⚠️             Missing solution file</Text>
          <Text>  ❌            Validation errors</Text>
          <Text>  📁            Section folder</Text>
        </Box>
      );
    }

    return (
      <Box gap={2}>
        <Text color="gray">
          / Search
        </Text>
        <Text color="gray">
          ? Help
        </Text>
        <Text color="gray">
          q Quit
        </Text>
      </Box>
    );
  };

  return (
    <Box 
      flexDirection="column" 
      borderStyle="single" 
      borderTop={true}
      paddingX={1}
    >
      {mode === 'help' ? (
        renderKeyboardHelp()
      ) : (
        <Box justifyContent="space-between">
          {renderModeSpecificContent()}
          {renderKeyboardHelp()}
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// Status Indicator Components
// ============================================================================

export interface StatusIndicatorProps {
  hasErrors: boolean;
  exerciseCount: number;
  errorCount?: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  hasErrors,
  exerciseCount,
  errorCount,
}) => {
  const statusColor = hasErrors ? 'red' : 'green';
  const statusIcon = hasErrors ? '⚠️' : '✅';

  return (
    <Box gap={1}>
      <Text color={statusColor}>{statusIcon}</Text>
      <Text color="white">{exerciseCount} exercises</Text>
      {errorCount && errorCount > 0 && (
        <Text color="red">({errorCount} errors)</Text>
      )}
    </Box>
  );
};

// ============================================================================
// Summary Bar Component
// ============================================================================

export interface SummaryBarProps {
  totalSections: number;
  totalExercises: number;
  totalErrors: number;
  totalWarnings: number;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({
  totalSections,
  totalExercises,
  totalErrors,
  totalWarnings,
}) => {
  return (
    <Box 
      borderStyle="single" 
      borderBottom={true}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box gap={2}>
        <Text color="cyan" bold>Exercise Organizer</Text>
        <Text color="gray">
          {totalSections} sections, {totalExercises} exercises
        </Text>
      </Box>
      
      <Box gap={2}>
        {totalErrors > 0 && (
          <Text color="red">
            {totalErrors} error{totalErrors !== 1 ? 's' : ''}
          </Text>
        )}
        {totalWarnings > 0 && (
          <Text color="yellow">
            {totalWarnings} warning{totalWarnings !== 1 ? 's' : ''}
          </Text>
        )}
        {totalErrors === 0 && totalWarnings === 0 && (
          <Text color="green">All good ✅</Text>
        )}
      </Box>
    </Box>
  );
};