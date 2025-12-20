'use client';

import Weather from '../../components/widgets/Weather';
import Calendar from '../../components/widgets/Calendar';
import Metar from '../../components/widgets/Metar';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
      setDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen w-full text-white p-4 overflow-y-auto">
      <div className="max-w-[1080px] mx-auto flex flex-col gap-4">
        {/* Top section: Time and Date */}
        <section className="flex-shrink-0 py-6">
          <div className="text-6xl font-bold mb-2">{time}</div>
          <div className="text-xl text-gray-200">{date}</div>
        </section>

        {/* Weather widget */}
        

        {/* Calendar in middle - takes most space */}
        <section className="flex-grow min-h-0">
          <Calendar />
        </section>

        {/* Bottom section: METAR */}
        <section className="flex-shrink-0 grid grid-cols-2 gap-4 h-64">
          <Weather />
          <Metar />
        </section>
      </div>
    </main>
  );
}
