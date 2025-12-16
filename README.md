# JasBoard

A personal information dashboard designed to run on a Raspberry Pi, replacing DakBoard with a custom, self-hosted solution.

## Features

- **Weather** - Current conditions and 5-day forecast
- **Google Calendar** - Shared calendar events
- **Google Photos** - Slideshow from your albums
- **FAA METAR** - Aviation weather for your local airport
- **Admin Interface** - Web-based configuration from any device

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the template and fill in your credentials:

```bash
cp .env.local.template .env.local
```

Edit `.env.local` and add:
- Google OAuth credentials (get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials))
- Admin password

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### 4. Configure Your Board

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Set up your:
   - Calendar IDs
   - Photo album IDs
   - Weather location
   - METAR airport code
   - Refresh intervals

## Google API Setup

### Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Google Calendar API
   - Google Photos Library API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID and Client Secret to `.env.local`

## Deploying to Raspberry Pi

### Build for Production

```bash
npm run build
```

### Transfer to Raspberry Pi

```bash
# Copy files to Pi
scp -r ./* pi@raspberrypi:/home/pi/jasboard/

# SSH into Pi
ssh pi@raspberrypi

# Install dependencies and build
cd ~/jasboard
npm ci --production
npm run build
```

### Run with PM2

```bash
# Install PM2
npm install -g pm2

# Start the app
pm2 start npm --name "jasboard" -- start

# Save PM2 config
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Auto-start Browser in Kiosk Mode

Create `~/.config/autostart/jasboard.desktop`:

```
[Desktop Entry]
Type=Application
Name=JasBoard
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:3000
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Project Structure

```
/app
  /page.tsx                 # Main display
  /admin/page.tsx          # Admin interface
  /api/*                   # API routes
/components/widgets        # Dashboard widgets
/lib                       # Utilities and helpers
```

## Next Steps

1. Implement real API integrations (currently using mock data)
2. Add authentication to admin interface
3. Implement Google OAuth flow
4. Add more customization options
5. Create additional widgets as needed

## License

MIT
