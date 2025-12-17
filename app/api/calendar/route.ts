import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthenticatedClient } from '../../../lib/google-auth';
import { readConfig } from '../../../lib/config';

// Cache for 15 minutes
export const revalidate = 900;

export async function GET() {
  try {
    // Get configuration
    const config = await readConfig();
    const calendarIds = config.calendarIds;

    // If no calendars configured, return empty array
    if (!calendarIds || calendarIds.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Get authenticated Google client
    const auth = await getAuthenticatedClient();
    const calendar = google.calendar({ version: 'v3', auth });

    // Fetch events from now to 30 days in the future
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const allEvents: any[] = [];

    // Fetch events from each configured calendar
    for (const calendarId of calendarIds) {
      try {
        const response = await calendar.events.list({
          calendarId,
          timeMin: now.toISOString(),
          timeMax: futureDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 100,
        });

        const items = response.data.items || [];

        // Transform events to our format
        const transformedEvents = items.map((event) => ({
          id: event.id || '',
          title: event.summary || 'Untitled Event',
          start: event.start?.dateTime || event.start?.date || '',
          end: event.end?.dateTime || event.end?.date || '',
          allDay: !event.start?.dateTime, // If no time, it's an all-day event
        }));

        allEvents.push(...transformedEvents);
      } catch (calError) {
        console.error(`Error fetching calendar ${calendarId}:`, calError);
        // Continue with other calendars even if one fails
      }
    }

    // Sort all events by start time
    allEvents.sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    return NextResponse.json({ events: allEvents });
  } catch (error) {
    console.error('Calendar API error:', error);

    // Return empty events on error (graceful degradation)
    return NextResponse.json({ events: [] });
  }
}
