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

  if (loading) {
    return (
      <div className="bg-black rounded-lg p-4 h-full animate-pulse">
        <div className="grid grid-cols-7 gap-1 h-full">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();

  return (
    <div className="bg-black text-white h-full flex flex-col overflow-hidden">
      {/* Date range header */}
      <div className="text-center py-2 text-lg font-semibold">
        {format(calendarStart, 'MMM d')} - {format(addWeeks(calendarStart, 4), 'MMM d, yyyy')}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px bg-gray-800 border-b border-gray-700">
          {weekDays.map((day, i) => (
            <div key={i} className="bg-black text-center py-2 text-sm font-semibold text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="flex-1 grid grid-cols-7 gap-px bg-gray-800 overflow-auto">
          {calendarDays.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={i}
                className="bg-black p-1 flex flex-col min-h-[80px]"
              >
                {/* Date number */}
                <div className="flex justify-center mb-1">
                  {isToday ? (
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-xl font-bold">{format(day, 'd')}</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-semibold text-gray-300">
                      {format(day, 'd')}
                    </span>
                  )}
                </div>

                {/* Events for this day */}
                <div className="flex-1 overflow-hidden text-xs space-y-0.5">
                  {dayEvents.map((event) => (
                    <div key={event.id} className="text-gray-300 truncate leading-tight">
                      {!event.allDay && format(parseISO(event.start), 'h:mma')} {event.title}
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
