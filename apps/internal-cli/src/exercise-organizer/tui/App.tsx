import React, { useMemo, useCallback, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import type { ExerciseParseResult } from '../types.js';
import { useExerciseState } from './hooks/useExerciseState.js';
import { useNavigation, useKeyboard, createKeyboardHandler } from './hooks/useKeyboard.js';
import { useSearch } from './hooks/useSearch.js';
import { ExerciseTree } from './ExerciseTree.js';
import { StatusBar, SummaryBar } from './StatusBar.js';
import { LiveSearchInput } from './SearchBar.js';

// ============================================================================
// Main TUI Application Component
// ============================================================================

export interface ExerciseOrganizerAppProps {
  parseResult: ExerciseParseResult;
  onExit?: (exitCode: number) => void;
}

export const ExerciseOrganizerApp: React.FC<ExerciseOrganizerAppProps> = ({
  parseResult,
  onExit,
}) => {
  const { exit } = useApp();
  
  // Exercise state management
  const exerciseState = useExerciseState(parseResult);
  const { 
    treeItems, 
    toggleSection, 
    getSelectedItem, 
    getSectionSummary,
    totalItems 
  } = exerciseState;

  // Search functionality
  const search = useSearch(treeItems);
  const {
    searchTerm,
    isActive: isSearchActive,
    filteredItems,
    matchCount,
    activateSearch,
    deactivateSearch,
    updateSearchTerm,
  } = search;

  // Use filtered items for display
  const displayItems = useMemo(() => {
    return searchTerm ? filteredItems : treeItems;
  }, [searchTerm, filteredItems, treeItems]);

  // Navigation state
  const navigation = useNavigation(displayItems.length);
  const { selectedIndex, mode, setMode } = navigation;

  // Get currently selected item
  const selectedItem = useMemo(() => {
    return displayItems[selectedIndex];
  }, [displayItems, selectedIndex]);

  // Update navigation when items change
  useEffect(() => {
    if (selectedIndex >= displayItems.length) {
      navigation.moveTo(Math.max(0, displayItems.length - 1));
    }
  }, [displayItems.length, selectedIndex, navigation]);

  // Keyboard event handlers
  const handleSelect = useCallback(() => {
    if (!selectedItem) return;

    if (selectedItem.type === 'section') {
      toggleSection(selectedItem.path);
    }
  }, [selectedItem, toggleSection]);

  const handleSearch = useCallback(() => {
    setMode('search');
    activateSearch();
  }, [setMode, activateSearch]);

  const handleHelp = useCallback(() => {
    setMode(mode === 'help' ? 'browse' : 'help');
  }, [mode, setMode]);

  const handleEscape = useCallback(() => {
    if (mode === 'search') {
      deactivateSearch();
      setMode('browse');
    } else if (mode === 'help') {
      setMode('browse');
    }
  }, [mode, deactivateSearch, setMode]);

  const handleQuit = useCallback(() => {
    onExit?.(0);
    exit();
  }, [onExit, exit]);

  // Set up keyboard handling
  const keyboardHandler = useMemo(() => 
    createKeyboardHandler(navigation, {
      onSelect: handleSelect,
      onQuit: handleQuit,
      onSearch: handleSearch,
      onHelp: handleHelp,
      onEscape: handleEscape,
    }),
    [navigation, handleSelect, handleQuit, handleSearch, handleHelp, handleEscape]
  );

  useKeyboard(keyboardHandler);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalSections = parseResult.sections.length;
    const totalExercises = parseResult.totalExercises;
    const totalErrors = parseResult.validationErrors.filter(e => e.severity === 'high').length;
    const totalWarnings = parseResult.validationErrors.filter(e => e.severity === 'medium' || e.severity === 'low').length;

    return {
      totalSections,
      totalExercises,
      totalErrors,
      totalWarnings,
    };
  }, [parseResult]);

  return (
    <Box flexDirection="column" height="100%">
      {/* Header with summary */}
      <SummaryBar {...summaryStats} />

      {/* Search input (when active) */}
      <LiveSearchInput
        isActive={isSearchActive}
        onSearch={updateSearchTerm}
        onCancel={handleEscape}
        initialValue={searchTerm}
      />

      {/* Main content area */}
      <Box flexGrow={1} flexDirection="column">
        <ExerciseTree
          items={displayItems}
          selectedIndex={selectedIndex}
          onSelect={navigation.moveTo}
          onToggleSection={toggleSection}
          searchTerm={searchTerm}
          height={mode === 'help' ? 10 : 25}
        />
      </Box>

      {/* Status bar */}
      <StatusBar
        mode={mode}
        selectedItem={selectedItem}
        totalItems={displayItems.length}
        selectedIndex={selectedIndex}
        filteredCount={searchTerm ? displayItems.length : undefined}
        searchTerm={searchTerm}
        hasErrors={selectedItem?.hasErrors || false}
      />
    </Box>
  );
};

// ============================================================================
// App Entry Point with Error Boundary
// ============================================================================

export interface TUIEntryProps {
  parseResult: ExerciseParseResult;
  onExit?: (exitCode: number) => void;
}

export const TUIEntry: React.FC<TUIEntryProps> = (props) => {
  return (
    <ExerciseOrganizerApp {...props} />
  );
};

// ============================================================================
// Helper Components
// ============================================================================

export const LoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Loading exercises...' 
}) => {
  return (
    <Box justifyContent="center" padding={2}>
      <Box gap={1}>
        <Text>⏳</Text>
        <Text color="gray">{message}</Text>
      </Box>
    </Box>
  );
};

export const ErrorDisplay: React.FC<{ 
  error: string; 
  onRetry?: () => void; 
  onExit?: () => void; 
}> = ({ 
  error, 
  onRetry, 
  onExit 
}) => {
  useKeyboard((input) => {
    if (input === 'r' && onRetry) {
      onRetry();
    } else if (input === 'q' && onExit) {
      onExit();
    }
  });

  return (
    <Box flexDirection="column" padding={2}>
      <Box gap={1} marginBottom={1}>
        <Text color="red">❌ Error:</Text>
        <Text color="white">{error}</Text>
      </Box>
      
      <Box gap={2}>
        {onRetry && (
          <Text color="gray">Press 'r' to retry</Text>
        )}
        {onExit && (
          <Text color="gray">Press 'q' to quit</Text>
        )}
      </Box>
    </Box>
  );
};