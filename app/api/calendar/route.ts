import { NextResponse } from 'next/server';
import { readConfig } from '../../../lib/config';
import ical from 'node-ical';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
// Cache for 15 minutes
export const revalidate = 900;

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
}

export async function GET() {
  try {
    // Get configuration
    const config = await readConfig();
    const iCalUrls = config.iCalUrls || [];

    // If no calendars configured, return empty array
    if (iCalUrls.length === 0) {
      return NextResponse.json({ events: [] });
    }

    const allEvents: CalendarEvent[] = [];

    // Fetch events from now to 30 days in the future
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Fetch and parse each iCal feed
    for (const iCalUrl of iCalUrls) {
      try {
        // Fetch the iCal feed (disable Next.js caching - feeds can be large)
        const response = await fetch(iCalUrl, {
          cache: 'no-store',
          headers: {
            'User-Agent': 'JasBoard/1.0',
          },
        });
        if (!response.ok) {
          console.error(`Failed to fetch iCal feed: ${iCalUrl}`, response.statusText);
          continue;
        }

        const iCalData = await response.text();

        // Parse the iCal data
        const events = await ical.async.parseICS(iCalData);

        // Transform events to our format
        for (const event of Object.values(events)) {
          if (event.type !== 'VEVENT') continue;

          const startDate = event.start ? new Date(event.start) : null;
          const endDate = event.end ? new Date(event.end) : null;

          // Skip events outside our date range
          if (!startDate || startDate > futureDate || (endDate && endDate < now)) {
            continue;
          }

          // Determine if it's an all-day event
          const allDay = event.start && typeof event.start === 'object' &&
                        !event.start.toISOString().includes('T');

          allEvents.push({
            id: event.uid || `${iCalUrl}-${startDate?.getTime()}`,
            title: event.summary || 'Untitled Event',
            start: startDate?.toISOString() || '',
            end: endDate?.toISOString() || startDate?.toISOString() || '',
            allDay: allDay,
          });
        }
      } catch (feedError) {
        console.error(`Error parsing iCal feed ${iCalUrl}:`, feedError);
        // Continue with other feeds even if one fails
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
