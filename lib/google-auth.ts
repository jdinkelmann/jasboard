import { google } from 'googleapis';
import { getGoogleTokens, updateGoogleTokens } from '../lib/config';

export function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client;
}

export async function getAuthenticatedClient() {
  const oauth2Client = getOAuth2Client();
  const tokens = await getGoogleTokens();

  if (!tokens) {
    throw new Error('No Google tokens available. Please authenticate first.');
  }

  oauth2Client.setCredentials(tokens);

  // Set up automatic token refresh
  oauth2Client.on('tokens', async (newTokens) => {
    if (newTokens.refresh_token) {
      await updateGoogleTokens({
        access_token: newTokens.access_token!,
        refresh_token: newTokens.refresh_token,
        expiry_date: newTokens.expiry_date!,
      });
    }
  });

  return oauth2Client;
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'select_account consent', // Force account selection and fresh consent
  });

  return url;
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  await updateGoogleTokens({
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token!,
    expiry_date: tokens.expiry_date!,
  });

  return tokens;
}
