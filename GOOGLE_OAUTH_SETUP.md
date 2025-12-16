# Google OAuth Setup Guide

To use Google Calendar and Google Photos features in JasBoard, you need to set up Google OAuth credentials.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "JasBoard" (or any name you prefer)
4. Click "Create"

## Step 2: Enable APIs

1. In your new project, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Google Calendar API**
   - **Google Photos Library API**

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in required fields:
   - App name: "JasBoard"
   - User support email: Your email
   - Developer contact: Your email
5. Click "Save and Continue"
6. On "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/photoslibrary.readonly`
8. Click "Save and Continue"
9. On "Test users", add your Google email address
10. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Name it "JasBoard"
5. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
   
   For production on Raspberry Pi, also add (replace with your Pi's IP):
   ```
   http://192.168.1.X:3000/api/auth/google/callback
   ```

6. Click "Create"
7. Copy your **Client ID** and **Client Secret**

## Step 5: Create .env.local File

1. In your JasBoard project root, create a file named `.env.local`
2. Add your credentials:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

3. Save the file

⚠️ **Important**: Never commit `.env.local` to git! It's already in `.gitignore`.

## Step 6: Restart Development Server

If your dev server is running, restart it:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 7: Connect Your Google Account

1. Go to http://localhost:3000/admin
2. Click "Connect Google Account"
3. Sign in with your Google account
4. Grant permissions to JasBoard
5. You'll be redirected back to the admin page

## Step 8: Configure Calendar IDs

1. In the admin page, scroll to "Google Calendar"
2. Add your calendar IDs (one per line):
   - `primary` - for your main calendar
   - Or specific calendar IDs from Google Calendar settings

To find calendar IDs:
1. Go to [Google Calendar](https://calendar.google.com)
2. Click the three dots next to a calendar
3. Select "Settings and sharing"
4. Scroll to "Integrate calendar"
5. Copy the "Calendar ID"

## Troubleshooting

### "OAuth error: access_denied"
- Make sure you added your email as a test user in the OAuth consent screen
- Try disconnecting and reconnecting

### "No Google tokens available"
- Complete the OAuth flow by clicking "Connect Google Account" in admin
- Make sure the redirect URI matches exactly in Google Console

### Calendar shows no events
- Add calendar IDs in the admin page
- Make sure the calendars have events
- Check browser console for errors

## For Production (Raspberry Pi)

When deploying to Raspberry Pi:

1. Update `.env.local` on the Pi with production redirect URI:
   ```
   GOOGLE_REDIRECT_URI=http://YOUR_PI_IP:3000/api/auth/google/callback
   ```

2. Add this URI to Google Console authorized redirect URIs

3. Re-run the OAuth flow from the admin page
