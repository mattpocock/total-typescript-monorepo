import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

// ============================================================================
// Search Bar Component
// ============================================================================

export interface SearchBarProps {
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  matchCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  visible,
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = 'Type to search exercises...',
  matchCount,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useInput((input, key) => {
    if (!visible) return;

    if (key.return) {
      onSubmit?.();
      return;
    }

    if (key.escape) {
      onCancel?.();
      return;
    }

    if (key.backspace || key.delete) {
      const newValue = localValue.slice(0, -1);
      setLocalValue(newValue);
      onChange(newValue);
      return;
    }

    // Handle regular character input
    if (input && !key.ctrl && !key.meta) {
      const newValue = localValue + input;
      setLocalValue(newValue);
      onChange(newValue);
    }
  }, { isActive: visible });

  if (!visible) {
    return null;
  }

  return (
    <Box 
      borderStyle="single" 
      borderColor="yellow"
      paddingX={1}
      flexDirection="column"
    >
      <Box gap={1}>
        <Text color="yellow">Search:</Text>
        <Text color="white">
          {localValue || <Text color="gray">{placeholder}</Text>}
          <Text color="white" backgroundColor="white"> </Text>
        </Text>
        {matchCount !== undefined && (
          <Text color="gray">
            ({matchCount} match{matchCount !== 1 ? 'es' : ''})
          </Text>
        )}
      </Box>
      
      <Box gap={2} marginTop={1}>
        <Text color="gray">Enter: Search</Text>
        <Text color="gray">ESC: Cancel</Text>
        <Text color="gray">Backspace: Delete</Text>
      </Box>
    </Box>
  );
};

// ============================================================================
// Search Input Component with Live Feedback
// ============================================================================

export interface LiveSearchInputProps {
  isActive: boolean;
  onSearch: (term: string) => void;
  onCancel: () => void;
  initialValue?: string;
}

export const LiveSearchInput: React.FC<LiveSearchInputProps> = ({
  isActive,
  onSearch,
  onCancel,
  initialValue = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useInput((input, key) => {
    if (!isActive) return;

    if (key.escape) {
      setSearchTerm('');
      onCancel();
      return;
    }

    if (key.return) {
      onSearch(searchTerm);
      return;
    }

    if (key.backspace || key.delete) {
      const newTerm = searchTerm.slice(0, -1);
      setSearchTerm(newTerm);
      onSearch(newTerm); // Live search
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      const newTerm = searchTerm + input;
      setSearchTerm(newTerm);
      onSearch(newTerm); // Live search
    }
  }, { isActive });

  if (!isActive) {
    return null;
  }

  return (
    <Box borderStyle="double" borderColor="yellow" paddingX={1}>
      <Text color="yellow">Search: </Text>
      <Text color="white">
        {searchTerm}
        <Text backgroundColor="yellow" color="black"> </Text>
      </Text>
    </Box>
  );
};

// ============================================================================
// Quick Search Suggestions
// ============================================================================

export interface QuickSearchProps {
  visible: boolean;
  onSelectPattern: (pattern: string) => void;
  onCancel: () => void;
}

export const QuickSearchSuggestions: React.FC<QuickSearchProps> = ({
  visible,
  onSelectPattern,
  onCancel,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const suggestions = [
    { pattern: 'error', label: 'Show exercises with errors', description: 'Find validation errors' },
    { pattern: 'missing', label: 'Show missing solutions', description: 'Find exercises without solutions' },
    { pattern: '.problem.', label: 'Show problem files', description: 'Filter to problem files only' },
    { pattern: '.solution.', label: 'Show solution files', description: 'Filter to solution files only' },
    { pattern: '001', label: 'Show exercise 001', description: 'Find specific exercise number' },
  ];

  useInput((input, key) => {
    if (!visible) return;

    if (key.escape) {
      onCancel();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(suggestions.length - 1, prev + 1));
      return;
    }

    if (key.return) {
      const selected = suggestions[selectedIndex];
      if (selected) {
        onSelectPattern(selected.pattern);
      }
      return;
    }
  }, { isActive: visible });

  if (!visible) {
    return null;
  }

  return (
    <Box 
      flexDirection="column" 
      borderStyle="single" 
      borderColor="cyan"
      padding={1}
    >
      <Text color="cyan" bold>Quick Search Patterns</Text>
      
      {suggestions.map((suggestion, index) => (
        <Box key={suggestion.pattern} gap={1}>
          <Text color={index === selectedIndex ? 'black' : 'white'}
                backgroundColor={index === selectedIndex ? 'cyan' : undefined}>
            {index === selectedIndex ? '► ' : '  '}
            {suggestion.label}
          </Text>
          <Text color="gray">- {suggestion.description}</Text>
        </Box>
      ))}
      
      <Box marginTop={1} gap={2}>
        <Text color="gray">↑/↓: Navigate</Text>
        <Text color="gray">Enter: Select</Text>
        <Text color="gray">ESC: Cancel</Text>
      </Box>
    </Box>
  );
};