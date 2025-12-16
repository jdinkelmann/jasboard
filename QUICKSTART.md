# JasBoard Quick Start

## Get Running in 5 Minutes

### 1. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll see the dashboard with mock data!

### 2. Check the Admin Interface

Visit [http://localhost:3000/admin](http://localhost:3000/admin) to see the configuration panel.

## What's Working Now

✅ **Complete UI** - All four widgets are displayed and working with mock data
✅ **Responsive Layout** - Optimized for portrait 1080x1920 display
✅ **Admin Interface** - Full configuration panel
✅ **Auto-refresh** - Widgets update on their configured intervals

## What Needs Real Implementation

The following are currently returning mock data - you'll need to implement real API integrations:

### 1. Weather API (`/app/api/weather/route.ts`)
- Option A: National Weather Service (free, no API key)
- Option B: OpenWeatherMap (requires API key)

### 2. Google Calendar (`/app/api/calendar/route.ts`)
- Set up Google OAuth (see README.md)
- Use the Google Calendar API via googleapis package

### 3. Google Photos (`/app/api/photos/route.ts`)
- Set up Google OAuth (see README.md)
- Use the Google Photos API via googleapis package

### 4. FAA METAR (`/app/api/metar/route.ts`)
- Use aviationweather.gov API
- Consider using a METAR parsing library

## Next Steps

1. **Test the mock interface** - Make sure you like the layout
2. **Set up Google OAuth** - Follow instructions in README.md
3. **Implement one API at a time** - Start with weather (easiest)
4. **Configure via admin** - Use the admin panel to set your preferences
5. **Deploy to Raspberry Pi** - When ready, follow deployment guide in README.md

## Tips

- The display page auto-refreshes data based on intervals set in admin
- Configuration is saved to `config.json` (already in .gitignore)
- All mock data is clearly marked with TODO comments in the API routes
- Portrait mode is optimized for 1080x1920 - adjust in Tailwind classes if needed

## Need Help?

Check these files:
- `CLAUDE.md` - Architecture and development guide
- `README.md` - Full documentation
- `.env.local.template` - Environment variables needed
