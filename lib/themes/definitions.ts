/**
 * Theme Definitions for JasBoard
 *
 * Defines three distinct themes:
 * 1. Default - Current dark design with gradient colors
 * 2. E-paper - White background with soft pastel colors
 * 3. Wood - Immersive nature background with semi-transparent widgets
 */

export type ThemeId = 'default' | 'epaper' | 'wood' | 'dashboard';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    // Page background
    pageBackground: string;
    pageText: string;

    // Calendar widget
    calendarBackground: string;
    calendarText: string;
    calendarGridBorder: string;
    calendarTodayHighlight: string;
    calendarEventText: string;

    // Weather widget
    weatherBackground: string;
    weatherText: string;
    weatherAccent: string;

    // METAR widget
    metarBackground: string;
    metarText: string;
    metarAccent: string;

    // Photos widget placeholder
    photosBackground: string;
    photosText: string;
    photosBorder: string;
  };

  // Additional theme-specific properties
  properties: {
    widgetOpacity: number; // 1 = fully opaque, 0.9 = 90% opaque
    widgetBackdropBlur: string; // e.g., '12px', '0px'
    borderRadius: string; // e.g., '8px', '12px'
    backgroundImage?: string; // Optional background image path
  };
}

/**
 * Default Theme - Current dark design
 */
export const defaultTheme: ThemeDefinition = {
  id: 'default',
  name: 'Default',
  description: 'Dark background with vibrant gradient widgets',
  colors: {
    pageBackground: '#000000',
    pageText: '#ffffff',

    calendarBackground: '#000000',
    calendarText: '#ffffff',
    calendarGridBorder: '#374151', // gray-700
    calendarTodayHighlight: '#dc2626', // red-600
    calendarEventText: '#d1d5db', // gray-300

    weatherBackground: 'linear-gradient(to bottom right, #1e3a8a, #1d4ed8)', // blue-900 to blue-700
    weatherText: '#ffffff',
    weatherAccent: '#dbeafe', // blue-100

    metarBackground: 'linear-gradient(to bottom right, #581c87, #7e22ce)', // purple-900 to purple-700
    metarText: '#ffffff',
    metarAccent: '#e9d5ff', // purple-200

    photosBackground: '#111827', // gray-900
    photosText: '#9ca3af', // gray-400
    photosBorder: '#374151', // gray-700
  },
  properties: {
    widgetOpacity: 1,
    widgetBackdropBlur: '0px',
    borderRadius: '8px',
  },
};

/**
 * E-paper Theme - White background with pastel colors
 */
export const epaperTheme: ThemeDefinition = {
  id: 'epaper',
  name: 'E-paper',
  description: 'Clean white background with soft pastel colors',
  colors: {
    pageBackground: '#ffffff',
    pageText: '#1f2937', // gray-800

    calendarBackground: '#e0f2fe', // sky-100
    calendarText: '#1f2937', // gray-800
    calendarGridBorder: '#bae6fd', // sky-200
    calendarTodayHighlight: '#fb7185', // rose-400
    calendarEventText: '#374151', // gray-700

    weatherBackground: 'linear-gradient(to bottom right, #dbeafe, #bfdbfe)', // blue-100 to blue-200
    weatherText: '#1e3a8a', // blue-900
    weatherAccent: '#0ea5e9', // sky-500

    metarBackground: 'linear-gradient(to bottom right, #fce7f3, #fbcfe8)', // pink-100 to pink-200
    metarText: '#831843', // pink-900
    metarAccent: '#ec4899', // pink-500

    photosBackground: '#f3f4f6', // gray-100
    photosText: '#6b7280', // gray-500
    photosBorder: '#d1d5db', // gray-300
  },
  properties: {
    widgetOpacity: 1,
    widgetBackdropBlur: '0px',
    borderRadius: '6px',
  },
};

/**
 * Wood Theme - Immersive background with transparent widgets
 */
export const woodTheme: ThemeDefinition = {
  id: 'wood',
  name: 'Wood',
  description: 'Immersive nature background with semi-transparent widgets',
  colors: {
    pageBackground: '#1a1410', // fallback dark brown
    pageText: '#f5f5f4', // stone-100

    calendarBackground: 'rgba(62, 39, 35, 0.85)', // brown-900 with transparency
    calendarText: '#fef3c7', // amber-100
    calendarGridBorder: 'rgba(120, 53, 15, 0.5)', // brown-700 with transparency
    calendarTodayHighlight: '#fb923c', // orange-400
    calendarEventText: '#fde68a', // yellow-200

    weatherBackground: 'rgba(20, 83, 45, 0.85)', // green-900 with transparency
    weatherText: '#d1fae5', // green-100
    weatherAccent: '#6ee7b7', // green-300

    metarBackground: 'rgba(120, 53, 15, 0.85)', // amber-900 with transparency
    metarText: '#fef3c7', // amber-100
    metarAccent: '#fcd34d', // amber-300

    photosBackground: 'rgba(87, 83, 78, 0.85)', // stone-700 with transparency
    photosText: '#e7e5e4', // stone-200
    photosBorder: 'rgba(168, 162, 158, 0.5)', // stone-400 with transparency
  },
  properties: {
    widgetOpacity: 0.9,
    widgetBackdropBlur: '12px',
    borderRadius: '12px',
    backgroundImage: '/images/mountain-bg.svg',
  },
};

/**
 * Dashboard Theme - Customizable background with dark semi-transparent widgets
 */
export const dashboardTheme: ThemeDefinition = {
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Customizable background image with dark semi-transparent widgets',
  colors: {
    pageBackground: '#0a0a0a', // Very dark fallback
    pageText: '#ffffff',

    calendarBackground: 'rgba(0, 0, 0, 0.6)', // Semi-transparent dark
    calendarText: '#ffffff',
    calendarGridBorder: 'rgba(255, 255, 255, 0.15)',
    calendarTodayHighlight: '#ef4444', // red-500
    calendarEventText: '#e5e7eb', // gray-200

    weatherBackground: 'rgba(0, 0, 0, 0.65)', // Slightly darker for contrast
    weatherText: '#ffffff',
    weatherAccent: '#bfdbfe', // blue-200

    metarBackground: 'rgba(0, 0, 0, 0.65)',
    metarText: '#ffffff',
    metarAccent: '#fcd34d', // amber-300

    photosBackground: 'rgba(0, 0, 0, 0.6)',
    photosText: '#e5e7eb', // gray-200
    photosBorder: 'rgba(255, 255, 255, 0.15)',
  },
  properties: {
    widgetOpacity: 1, // Cards handle their own opacity
    widgetBackdropBlur: '8px',
    borderRadius: '10px',
    backgroundImage: undefined, // Will be set from config
  },
};

/**
 * All available themes
 */
export const themes: Record<ThemeId, ThemeDefinition> = {
  default: defaultTheme,
  epaper: epaperTheme,
  wood: woodTheme,
  dashboard: dashboardTheme,
};

/**
 * Get theme by ID with fallback to default
 */
export function getTheme(id: ThemeId | undefined): ThemeDefinition {
  if (!id || !themes[id]) {
    return defaultTheme;
  }
  return themes[id];
}

/**
 * Get all theme IDs
 */
export function getThemeIds(): ThemeId[] {
  return Object.keys(themes) as ThemeId[];
}

/**
 * Convert theme to CSS variables
 */
export function themeToCssVariables(theme: ThemeDefinition): Record<string, string> {
  return {
    '--theme-page-bg': theme.colors.pageBackground,
    '--theme-page-text': theme.colors.pageText,

    '--theme-calendar-bg': theme.colors.calendarBackground,
    '--theme-calendar-text': theme.colors.calendarText,
    '--theme-calendar-grid-border': theme.colors.calendarGridBorder,
    '--theme-calendar-today': theme.colors.calendarTodayHighlight,
    '--theme-calendar-event': theme.colors.calendarEventText,

    '--theme-weather-bg': theme.colors.weatherBackground,
    '--theme-weather-text': theme.colors.weatherText,
    '--theme-weather-accent': theme.colors.weatherAccent,

    '--theme-metar-bg': theme.colors.metarBackground,
    '--theme-metar-text': theme.colors.metarText,
    '--theme-metar-accent': theme.colors.metarAccent,

    '--theme-photos-bg': theme.colors.photosBackground,
    '--theme-photos-text': theme.colors.photosText,
    '--theme-photos-border': theme.colors.photosBorder,

    '--theme-widget-opacity': theme.properties.widgetOpacity.toString(),
    '--theme-backdrop-blur': theme.properties.widgetBackdropBlur,
    '--theme-border-radius': theme.properties.borderRadius,
  };
}
