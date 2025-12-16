import { NextResponse } from 'next/server';

// Cache for 15 minutes
export const revalidate = 900;

export async function GET() {
  try {
    // TODO: Implement Google Calendar API integration
    // For now, return mock data spread throughout the month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const mockEvents = {
      events: [
        {
          id: '1',
          title: '6:30pm Evan Band',
          start: new Date(year, month, 16, 18, 30).toISOString(),
          end: new Date(year, month, 16, 20, 0).toISOString(),
          allDay: false,
        },
        {
          id: '2',
          title: 'Regular for space',
          start: new Date(year, month, 17, 14, 0).toISOString(),
          end: new Date(year, month, 17, 15, 0).toISOString(),
          allDay: false,
        },
        {
          id: '3',
          title: '12:00pm Holiday social',
          start: new Date(year, month, 21, 12, 0).toISOString(),
          end: new Date(year, month, 21, 14, 0).toISOString(),
          allDay: false,
        },
        {
          id: '4',
          title: '10:00am Holiday recital',
          start: new Date(year, month, 21, 10, 0).toISOString(),
          end: new Date(year, month, 21, 11, 0).toISOString(),
          allDay: false,
        },
        {
          id: '5',
          title: '6:30pm Evan Band',
          start: new Date(year, month, 22, 18, 30).toISOString(),
          end: new Date(year, month, 22, 20, 0).toISOString(),
          allDay: false,
        },
        {
          id: '6',
          title: '6:30pm Evan Band',
          start: new Date(year, month, 23, 18, 30).toISOString(),
          end: new Date(year, month, 23, 20, 0).toISOString(),
          allDay: false,
        },
        {
          id: '7',
          title: 'Sections',
          start: new Date(year, month, 24, 10, 0).toISOString(),
          end: new Date(year, month, 24, 11, 0).toISOString(),
          allDay: false,
        },
        {
          id: '8',
          title: '4:00pm Evan band lesson',
          start: new Date(year, month, 25, 16, 0).toISOString(),
          end: new Date(year, month, 25, 17, 0).toISOString(),
          allDay: false,
        },
        {
          id: '9',
          title: '12:00pm Filming recital',
          start: new Date(year, month, 27, 12, 0).toISOString(),
          end: new Date(year, month, 27, 13, 0).toISOString(),
          allDay: false,
        },
        {
          id: '10',
          title: 'Sections',
          start: new Date(year, month, 27, 14, 0).toISOString(),
          end: new Date(year, month, 27, 15, 0).toISOString(),
          allDay: false,
        },
        {
          id: '11',
          title: '10:00am Christmas cookies Jampland',
          start: new Date(year, month, 28, 10, 0).toISOString(),
          end: new Date(year, month, 28, 12, 0).toISOString(),
          allDay: false,
        },
        {
          id: '12',
          title: 'Sections',
          start: new Date(year, month, 29, 14, 0).toISOString(),
          end: new Date(year, month, 29, 15, 0).toISOString(),
          allDay: false,
        },
      ],
    };

    return NextResponse.json(mockEvents);
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
