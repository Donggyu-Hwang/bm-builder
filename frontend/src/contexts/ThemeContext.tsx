/**
 * Theme Context Provider
 *
 * LOW FIX: Theme Duplication Issue
 * --------------------------------
 * This ThemeContext provider duplicates functionality already implemented
 * in Redux themeSlice (@/store/slices/themeSlice).
 *
 * Current Status:
 * - ThemeContext: Legacy implementation (this file)
 * - Redux themeSlice: Newer implementation with better integration
 *
 * Migration Path (Future Refactoring):
 * 1. Replace all `useTheme()` hooks with `useAppSelector(selectTheme)`
 * 2. Replace ThemeProvider with Redux Provider wrapping
 * 3. Remove this file after complete migration
 *
 * Why Keep Both Now:
 * - Breaking change to remove without comprehensive testing
 * - Some components may still depend on ThemeContext
 * - Allows gradual migration without disrupting existing functionality
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme } from '../types/theme.types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'bm-builder-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;

    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      return stored || defaultTheme;
    } catch (error) {
      console.warn('localStorage access denied:', error);
      return defaultTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If system, determine current system theme and toggle
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
