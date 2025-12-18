'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeId, ThemeDefinition, getTheme, themeToCssVariables } from './definitions';

interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeDefinition;
  setTheme: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeId;
}

/**
 * ThemeProvider Component
 *
 * Manages theme state and applies CSS variables to the document
 */
export function ThemeProvider({ children, initialTheme = 'default' }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(initialTheme);
  const theme = useMemo(() => getTheme(themeId), [themeId]);

  // Apply CSS variables to document root whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = themeToCssVariables(theme);

    // Apply all CSS variables
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Add background image if specified (for Wood theme)
    if (theme.properties.backgroundImage) {
      root.style.setProperty('--theme-bg-image', `url(${theme.properties.backgroundImage})`);
    } else {
      root.style.removeProperty('--theme-bg-image');
    }
  }, [theme]); // Only depend on theme, not themeId (theme is derived from themeId)

  // Initialize theme from config on mount (runs once)
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // First try to load from server config
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          if (config.theme) {
            setThemeId(config.theme);
            // Store in localStorage for next time
            localStorage.setItem('jasboard-theme', config.theme);
          }
          // Apply custom background image if provided
          if (config.backgroundImageUrl) {
            const root = document.documentElement;
            root.style.setProperty('--theme-bg-image', `url(${config.backgroundImageUrl})`);
          }
        } else {
          // Fallback to localStorage if config fetch fails
          const savedTheme = localStorage.getItem('jasboard-theme') as ThemeId | null;
          if (savedTheme && (savedTheme === 'default' || savedTheme === 'epaper' || savedTheme === 'wood' || savedTheme === 'dashboard')) {
            setThemeId(savedTheme);
          }
        }
      } catch (error) {
        console.error('Failed to initialize theme:', error);
        // Fallback to localStorage on error
        try {
          const savedTheme = localStorage.getItem('jasboard-theme') as ThemeId | null;
          if (savedTheme && (savedTheme === 'default' || savedTheme === 'epaper' || savedTheme === 'wood' || savedTheme === 'dashboard')) {
            setThemeId(savedTheme);
          }
        } catch (e) {
          console.error('Failed to load from localStorage:', e);
        }
      }
    };

    initializeTheme();
  }, []); // Empty array = runs once on mount

  // Save theme to localStorage whenever it changes (but not on initial mount)
  useEffect(() => {
    try {
      localStorage.setItem('jasboard-theme', themeId);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [themeId]);

  const contextValue: ThemeContextValue = {
    themeId,
    theme,
    setTheme: setThemeId,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme Hook
 *
 * Access current theme and theme setter from any component
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
