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

    // Store theme preference in localStorage for persistence
    try {
      localStorage.setItem('jasboard-theme', themeId);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [theme, themeId]);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('jasboard-theme') as ThemeId | null;
      if (savedTheme && (savedTheme === 'default' || savedTheme === 'epaper' || savedTheme === 'wood')) {
        setThemeId(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  }, []);

  // Fetch theme from server config and apply custom background image
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          if (config.theme) {
            setThemeId(config.theme);
          }
          // Apply custom background image if provided
          if (config.backgroundImageUrl) {
            const root = document.documentElement;
            root.style.setProperty('--theme-bg-image', `url(${config.backgroundImageUrl})`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme from config:', error);
      }
    };

    fetchTheme();
  }, []);

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
