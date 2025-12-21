'use client';

import { useEffect, useState } from 'react';
import { format, parseISO, eachDayOfInterval, isSameDay, startOfWeek, addWeeks } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/calendar');
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Failed to fetch calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Refresh every 15 minutes
    const interval = setInterval(fetchEvents, 15 * 60 * 1000);

    // Update current date every minute
    const dateInterval = setInterval(() => setCurrentDate(new Date()), 60000);

    return () => {
      clearInterval(interval);
      clearInterval(dateInterval);
    };
  }, []);

  // Get calendar days for rolling 4-week view
  const calendarStart = startOfWeek(currentDate); // Start of current week
  const calendarEnd = addWeeks(calendarStart, 4); // 4 weeks from start
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd }).slice(0, 28); // Exactly 4 weeks (28 days)

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start);
      return isSameDay(eventDate, day);
    });
  };

  const formatDayEventTimes = (start: string) => {
    // Try parsing with AM/PM
  let d = parseISO(start);

  // If parsing fails (missing AM/PM), assume PM for example or define your rule
  if (!d) {
    d = parseISO(start + " PM");
  }

  const minutes = format(d, "mm");

  if (minutes === "00") {
    // collapse minutes → "3p"
    return format(d, "haaaaa").toLowerCase();
  }

  // keep minutes → "2:45p"
  return format(d, "h:mmaaaaa").toLowerCase();
  };

  if (loading) {
    return (
      <div
        className="rounded-lg p-4 h-full animate-pulse backdrop-blur-theme"
        style={{
          background: 'var(--theme-calendar-bg)',
          borderRadius: 'var(--theme-border-radius)',
          opacity: 'var(--theme-widget-opacity)',
        }}
      >
        <div className="grid grid-cols-7 gap-1 h-full">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="rounded opacity-50"
              style={{ background: 'var(--theme-calendar-grid-border)' }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();

  return (
    <div
      className="h-full flex flex-col overflow-hidden rounded-lg backdrop-blur-theme"
      style={{
        background: 'var(--theme-calendar-bg)',
        color: 'var(--theme-calendar-text)',
        borderRadius: 'var(--theme-border-radius)',
        opacity: 'var(--theme-widget-opacity)',
      }}
    >
      {/* Date range header */}
      <div className="text-center py-2 text-lg font-semibold">
        {format(calendarStart, 'MMMM d')} - {format(addWeeks(calendarStart, 4), 'MMMM d, yyyy')}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Day headers */}
        <div
          className="grid grid-cols-7 gap-px border-b"
          style={{
            background: 'var(--theme-calendar-grid-border)',
            borderColor: 'var(--theme-calendar-grid-border)',
          }}
        >
          {weekDays.map((day, i) => (
            <div
              key={i}
              className="text-center py-2 text-sm font-semibold opacity-70"
              style={{ background: 'var(--theme-calendar-bg)' }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div
          className="flex-1 grid grid-cols-7 gap-px overflow-auto"
          style={{ background: 'var(--theme-calendar-grid-border)' }}
        >
          {calendarDays.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={i}
                className="p-1 flex flex-col min-h-[80px]"
                style={{ background: 'var(--theme-calendar-bg)' }}
              >
                {/* Date number */}
                <div className="flex justify-center mb-3 mt-1">
                  {isToday ? (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--theme-calendar-today)' }}
                    >
                      <span className="text-3xl font-bold">{format(day, 'd')}</span>
                    </div>
                  ) : (
                    <span className="text-4xl opacity-90">
                      {format(day, 'd')}
                    </span>
                  )}
                </div>

                {/* Events for this day */}
                <div className="flex-1 overflow-hidden text-sm space-y-0.5 mb-3 px-2">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="leading-tight mb-1"
                      style={{ color: 'var(--theme-calendar-event)' }}
                    >
                      {!event.allDay && (
                        <>
                          <span style={{ backgroundColor: '#fff', width: '8px', height: '8px', display: 'inline-block', top: '4px', position: 'relative', marginRight: '3px' }} className='rounded-full'>&nbsp;</span>
                          {formatDayEventTimes(event.start)}{' '}
                        </>
                      )}
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
