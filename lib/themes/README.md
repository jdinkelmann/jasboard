# JasBoard Theme System

This directory contains the theme system for JasBoard, enabling runtime theme switching without page reloads.

## Architecture

### Files

- **definitions.ts** - Theme color definitions and utility functions
- **ThemeContext.tsx** - React Context provider for theme state management

### How It Works

1. **Theme Definitions** (`definitions.ts`)
   - Defines three themes: Default, E-paper, and Wood
   - Each theme specifies colors for all widgets and page elements
   - Exports utility functions for theme management

2. **ThemeProvider** (`ThemeContext.tsx`)
   - Wraps the entire app in `app/layout.tsx`
   - Applies CSS variables to `document.documentElement` when theme changes
   - Syncs with localStorage and server config
   - Provides `useTheme()` hook for components

3. **CSS Variables** (`app/globals.css`)
   - All theme colors defined as CSS custom properties
   - Widgets use these variables via inline styles
   - Allows instant theme switching without re-rendering

4. **Tailwind Integration** (`tailwind.config.ts`)
   - Extended color palette references CSS variables
   - Enables using theme colors in Tailwind utilities (optional)

## Available Themes

### Default
- **Background:** Black (#000000)
- **Calendar:** Black background with gray borders
- **Weather:** Blue gradient (blue-900 to blue-700)
- **METAR:** Purple gradient (purple-900 to purple-700)
- **Photos:** Dark gray (#111827)
- **Best for:** Dim lighting, kiosk mode, current users

### E-paper
- **Background:** White (#ffffff)
- **Calendar:** Sky blue (#e0f2fe) with soft borders
- **Weather:** Light blue gradient (blue-100 to blue-200)
- **METAR:** Pink gradient (pink-100 to pink-200)
- **Photos:** Light gray (#f3f4f6)
- **Best for:** Bright rooms, high contrast, readability

### Wood
- **Background:** Mountain landscape SVG image
- **Widgets:** Semi-transparent (90% opacity) with 12px backdrop blur
- **Calendar:** Brown tones with transparency
- **Weather:** Green tones with transparency
- **METAR:** Warm amber tones with transparency
- **Photos:** Stone gray with transparency
- **Best for:** Immersive experience, nature aesthetic

## Usage

### Admin Panel
1. Navigate to `/admin`
2. Select theme from dropdown in "Theme" section
3. Click "Save Configuration"
4. Visit main dashboard to see changes

### Programmatic Access

```typescript
import { useTheme } from '@/lib/themes/ThemeContext';

function MyComponent() {
  const { themeId, theme, setTheme } = useTheme();

  // Current theme ID
  console.log(themeId); // 'default' | 'epaper' | 'wood'

  // Current theme object
  console.log(theme.colors.weatherBackground);

  // Change theme
  setTheme('epaper');
}
```

### Using Theme Colors in Components

Use inline styles with CSS variables:

```tsx
<div
  style={{
    background: 'var(--theme-weather-bg)',
    color: 'var(--theme-weather-text)',
    borderRadius: 'var(--theme-border-radius)',
  }}
>
  Weather Widget
</div>
```

Or use Tailwind classes (if configured):

```tsx
<div className="bg-theme-weather-bg text-theme-weather-text rounded-theme">
  Weather Widget
</div>
```

## Adding New Themes

1. **Define theme** in `definitions.ts`:

```typescript
export const myNewTheme: ThemeDefinition = {
  id: 'mynew',
  name: 'My New Theme',
  description: 'Description here',
  colors: {
    // Define all required colors
  },
  properties: {
    widgetOpacity: 1,
    widgetBackdropBlur: '0px',
    borderRadius: '8px',
  },
};
```

2. **Add to themes object**:

```typescript
export const themes: Record<ThemeId, ThemeDefinition> = {
  default: defaultTheme,
  epaper: epaperTheme,
  wood: woodTheme,
  mynew: myNewTheme,
};
```

3. **Update TypeScript types**:

```typescript
export type ThemeId = 'default' | 'epaper' | 'wood' | 'mynew';
```

4. **Add to admin dropdown** in `app/admin/page.tsx`:

```tsx
<option value="mynew">My New Theme - Description</option>
```

## Performance Considerations

- **CSS Variables:** Very fast, no React re-renders needed
- **localStorage:** Theme persists across sessions
- **Server Config:** Theme syncs with config.json
- **Backdrop Blur:** Wood theme uses GPU-accelerated blur (minimal impact on Pi 4)
- **Background Images:** SVG backgrounds are lightweight and scalable

## Customization

### Custom Background Image (Wood Theme)

Replace `/public/images/mountain-bg.svg` with your own image:
- Supported formats: JPG, PNG, SVG
- Recommended size: 1080x1920 (portrait)
- Keep file size under 500KB for Raspberry Pi performance

### Adjust Widget Opacity

Edit `properties.widgetOpacity` in theme definition:
- 1.0 = fully opaque
- 0.9 = 90% opaque (default for Wood theme)
- 0.7 = 70% opaque (more transparent)

### Adjust Backdrop Blur

Edit `properties.widgetBackdropBlur` in theme definition:
- '0px' = no blur
- '12px' = moderate blur (default for Wood theme)
- '24px' = heavy blur (may impact performance on Pi)

## Troubleshooting

### Theme not applying
- Check browser console for errors
- Verify ThemeProvider is in `app/layout.tsx`
- Clear localStorage: `localStorage.removeItem('jasboard-theme')`

### Colors look wrong
- Check CSS variable names match between definitions.ts and globals.css
- Verify inline styles use correct variable names
- Inspect element to see computed CSS values

### Background image not showing (Wood theme)
- Verify image exists at `/public/images/mountain-bg.svg`
- Check browser network tab for 404 errors
- Ensure image path doesn't start with `/public` (Next.js serves from `/`)

### Performance issues
- Reduce backdrop blur on Wood theme
- Optimize background image size
- Consider static theme (avoid runtime switching)
