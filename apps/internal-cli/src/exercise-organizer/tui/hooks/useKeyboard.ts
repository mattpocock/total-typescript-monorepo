import { useInput } from 'ink';
import { useState, useCallback } from 'react';

// ============================================================================
// Keyboard Navigation Hook
// ============================================================================

export interface KeyboardHandler {
  (input: string, key: {
    leftArrow: boolean;
    rightArrow: boolean;
    upArrow: boolean;
    downArrow: boolean;
    return: boolean;
    escape: boolean;
    ctrl: boolean;
    shift: boolean;
    tab: boolean;
    backspace: boolean;
    delete: boolean;
  }): void;
}

export const useKeyboard = (handler: KeyboardHandler) => {
  useInput(handler);
};

// ============================================================================
// Navigation State Hook
// ============================================================================

export interface NavigationState {
  selectedIndex: number;
  selectedPath: string;
  mode: 'browse' | 'search' | 'help';
}

export const useNavigation = (totalItems: number) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedPath, setSelectedPath] = useState('');
  const [mode, setMode] = useState<'browse' | 'search' | 'help'>('browse');

  const moveUp = useCallback(() => {
    setSelectedIndex(prev => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex(prev => Math.min(totalItems - 1, prev));
  }, [totalItems]);

  const moveTo = useCallback((index: number) => {
    setSelectedIndex(Math.max(0, Math.min(totalItems - 1, index)));
  }, [totalItems]);

  const setSelectedPathById = useCallback((path: string) => {
    setSelectedPath(path);
  }, []);

  const setNavigationMode = useCallback((newMode: 'browse' | 'search' | 'help') => {
    setMode(newMode);
  }, []);

  return {
    selectedIndex,
    selectedPath,
    mode,
    moveUp,
    moveDown,
    moveTo,
    setSelectedPath: setSelectedPathById,
    setMode: setNavigationMode,
  };
};

// ============================================================================
// Keyboard Command Handlers
// ============================================================================

export const createKeyboardHandler = (
  navigation: ReturnType<typeof useNavigation>,
  callbacks: {
    onSelect?: () => void;
    onQuit?: () => void;
    onSearch?: () => void;
    onHelp?: () => void;
    onEscape?: () => void;
  }
): KeyboardHandler => {
  return (input, key) => {
    // Global commands
    if (input === 'q' && navigation.mode === 'browse') {
      callbacks.onQuit?.();
      return;
    }

    if (input === '?' && navigation.mode === 'browse') {
      callbacks.onHelp?.();
      return;
    }

    if (input === '/' && navigation.mode === 'browse') {
      callbacks.onSearch?.();
      return;
    }

    if (key.escape) {
      callbacks.onEscape?.();
      return;
    }

    // Navigation commands (only in browse mode)
    if (navigation.mode === 'browse') {
      if (key.upArrow || input === 'k') {
        navigation.moveUp();
        return;
      }

      if (key.downArrow || input === 'j') {
        navigation.moveDown();
        return;
      }

      if (key.return) {
        callbacks.onSelect?.();
        return;
      }
    }
  };
};

// ============================================================================
// Helper Functions
// ============================================================================

export const flattenTreeForNavigation = <T extends { children?: T[] }>(
  items: T[]
): T[] => {
  const flattened: T[] = [];
  
  const traverse = (item: T) => {
    flattened.push(item);
    if (item.children) {
      item.children.forEach(traverse);
    }
  };
  
  items.forEach(traverse);
  return flattened;
};

export const getNavigationPath = (
  selectedIndex: number,
  items: any[]
): string => {
  const item = items[selectedIndex];
  return item?.path || '';
};