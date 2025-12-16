# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JasBoard is a personal information dashboard designed to run on a Raspberry Pi in portrait mode (1080x1920). It replaces DakBoard and displays:
- Shared Google Calendar events
- Weather information with forecast
- Google Photos slideshow
- FAA METAR aviation weather data

The system consists of two components:
1. **Display app** - Full-screen browser view for the Raspberry Pi
2. **Admin interface** - Web-based configuration accessible from any device on the local network

## Architecture Principles

- **Lightweight**: Must run efficiently on Raspberry Pi hardware
- **Browser-based**: Both display and admin run in standard web browsers
- **Local network**: Admin interface accessible only on home network for security
- **API-driven**: Integrates with Google Calendar API, Google Photos API, weather services, and FAA METAR feeds
- **Portrait-first**: UI designed for 1080x1920 portrait orientation

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Node.js 18+ (runs on Raspberry Pi 4)
- **Language**: TypeScript (recommended) or JavaScript
- **Styling**: Tailwind CSS (lightweight, easy responsive design for portrait mode)
- **Data fetching**: Next.js API routes for backend integration

### Project Structure

```
/app
  /page.tsx                 # Main display (portrait dashboard)
  /admin
    /page.tsx              # Admin configuration interface
  /api
    /calendar/route.ts     # Google Calendar API proxy
    /photos/route.ts       # Google Photos API proxy
    /weather/route.ts      # Weather API integration
    /metar/route.ts        # FAA METAR data fetching
/components
  /widgets
    /Calendar.tsx          # Calendar widget
    /Weather.tsx           # Weather display
    /Photos.tsx            # Photo slideshow
    /Metar.tsx            # METAR widget
/lib
  /google-auth.ts          # Google OAuth helpers
  /config.ts              # Configuration management
/public                    # Static assets
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (access at http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server (for Raspberry Pi)
npm run start

# Type checking (if using TypeScript)
npm run type-check

# Linting
npm run lint
```

### Raspberry Pi Deployment

```bash
# On Pi: Install dependencies and build
npm ci --production
npm run build

# Run in production mode
npm run start

# Or use PM2 for auto-restart
npm install -g pm2
pm2 start npm --name "jasboard" -- start
pm2 save
pm2 startup
```

## Key Integration Points

### Google Calendar API
- **API Route**: `/api/calendar/route.ts`
- Requires OAuth 2.0 authentication (credentials stored in `.env.local`)
- Use `googleapis` npm package
- Displays shared calendar events
- Should handle multiple calendars if needed
- Refresh tokens automatically using refresh token flow
- Cache responses with Next.js caching to reduce API calls

### Google Photos API
- **API Route**: `/api/photos/route.ts`
- Requires OAuth 2.0 authentication
- Use `googleapis` npm package
- Fetch photos from specific album IDs (configured in admin)
- Client-side rotation/slideshow logic
- Consider caching image URLs for offline operation

### Weather Data
- **API Route**: `/api/weather/route.ts`
- Use National Weather Service API (free, no key required) or OpenWeatherMap
- Location-based forecast (latitude/longitude from config)
- Return current conditions and 5-day forecast
- Update frequency: every 30-60 minutes
- Use Next.js Route Handler caching: `export const revalidate = 1800` (30 min)

### FAA METAR Data
- **API Route**: `/api/metar/route.ts`
- Fetch from https://aviationweather.gov/api/data/metar or https://www.aviationweather.gov/adds/dataserver_current/
- Parse METAR format for display (consider `metar-parser` npm package)
- Airport code from configuration (e.g., "KBOS")
- Update frequency: every 15-30 minutes
- Cache with revalidation

## Configuration Management

### Environment Variables (`.env.local`)
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXTAUTH_SECRET=...  # for admin authentication
ADMIN_PASSWORD=...   # simple password for admin access
```

### User Configuration (stored in JSON file or database)
The admin interface (`/admin`) allows configuring:
- Calendar IDs to display
- Photo album IDs
- Weather location (lat/lon or zip code)
- METAR airport code (e.g., "KBOS")
- Refresh intervals for each widget
- Display layout/widget positions
- Portrait mode orientation settings

Configuration persists in `config.json` or a lightweight database (SQLite) on the Pi.

## Raspberry Pi Deployment

### Auto-start on Boot
1. Next.js app runs with PM2: `pm2 start npm --name "jasboard" -- start`
2. Chromium launches in kiosk mode pointing to `http://localhost:3000`

Create autostart script at `~/.config/autostart/jasboard.desktop`:
```
[Desktop Entry]
Type=Application
Name=JasBoard
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:3000
```

### Kiosk Mode Setup
- Fullscreen browser with no chrome
- Disable screensaver/sleep
- Hide cursor after inactivity
- Auto-reload page on errors

### Performance Optimization
- Use Next.js Image component for optimized images
- Implement proper caching headers
- Lazy load off-screen content
- Use React.memo for widgets to prevent unnecessary re-renders
- Consider static generation where possible

## Security Considerations

- Admin interface should require authentication
- Only accessible on local network (no external exposure)
- API credentials stored securely (environment variables or encrypted config)
- Google OAuth tokens refreshed automatically
- HTTPS recommended even for local network

## Future Considerations

- Multiple display layouts/themes
- Additional data sources (news, stocks, etc.)
- Mobile app for quick admin access
- Multiple board configurations for different displays
