'use client';

import Default from './themes/default';
import Paper from './themes/paper';
import Wood from './themes/wood';
import Dashboard from './themes/dashboard';
import { useTheme } from '../lib/themes/ThemeContext';
import { ComponentType } from 'react';

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

  // Get the component for the current theme, fallback to Default
  const ThemeComponent = THEME_COMPONENTS[themeId] || Default;

  return <ThemeComponent />;
}
