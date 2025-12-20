'use client';

import Default from './themes/default';
import Paper from './themes/paper';
import Wood from './themes/wood';
import Dashboard from './themes/dashboard';
import { useTheme } from '../lib/themes/ThemeContext';
import { ComponentType, useEffect } from 'react';

// Map theme IDs to their corresponding components
const THEME_COMPONENTS: Record<string, ComponentType> = {
  default: Default,
  epaper: Paper,
  wood: Wood,
  dashboard: Dashboard,
};

/**
 * JasBoard Main Display
 *
 * Portrait layout (1080x1920) with theme support
 * Renders different component layouts based on selected theme
 */
export default function Home() {
  const { themeId } = useTheme();

  // Check for reload request every 10 seconds
  useEffect(() => {
    const checkReload = async () => {
      try {
        const response = await fetch('/api/reload');
        if (response.ok) {
          const data = await response.json();
          if (data.shouldReload) {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Failed to check reload status:', error);
      }
    };

    const interval = setInterval(checkReload, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Get the component for the current theme, fallback to Default
  const ThemeComponent = THEME_COMPONENTS[themeId] || Default;

  return <ThemeComponent />;
}
