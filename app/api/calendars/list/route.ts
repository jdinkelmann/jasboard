import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthenticatedClient } from '../../../../lib/google-auth';

// Force dynamic rendering - requires authentication
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get authenticated Google client
    const auth = await getAuthenticatedClient();
    const calendar = google.calendar({ version: 'v3', auth });

    // Fetch list of calendars
    const response = await calendar.calendarList.list();
    const calendars = response.data.items || [];

    // Transform to simpler format
    const calendarList = calendars.map((cal) => ({
      id: cal.id || '',
      summary: cal.summary || 'Untitled Calendar',
      description: cal.description || '',
      primary: cal.primary || false,
      backgroundColor: cal.backgroundColor,
      accessRole: cal.accessRole,
    }));

    return NextResponse.json({ calendars: calendarList });
  } catch (error) {
    console.error('Calendar list API error:', error);

    // If not authenticated, return error
    if ((error as any)?.message?.includes('No Google tokens')) {
      return NextResponse.json(
        { error: 'Not authenticated. Please connect your Google account first.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch calendars' },
      { status: 500 }
    );
  }
}
