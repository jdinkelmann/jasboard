'use client';

import { useEffect, useState } from 'react';

interface WeatherData {
  location?: string;
  current: {
    temp: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather');
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 animate-pulse">
        <div className="h-32 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <p className="text-gray-400">Weather unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg p-6 shadow-lg">
      {/* Location header */}
      {weather.location && (
        <div className="text-blue-100 text-sm mb-2">{weather.location}</div>
      )}

      {/* Current weather */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-6xl font-bold">{weather.current.temp}°</div>
          <div className="text-xl text-blue-100">{weather.current.condition}</div>
        </div>
        <div className="text-7xl">{weather.current.icon}</div>
      </div>

      {/* 5-day forecast */}
      <div className="grid grid-cols-5 gap-4">
        {weather.forecast.map((day, index) => (
          <div key={index} className="text-center">
            <div className="font-semibold text-blue-100">{day.day}</div>
            <div className="text-3xl my-2">{day.icon}</div>
            <div className="text-sm">
              <span className="font-bold">{day.high}°</span>
              <span className="text-blue-200 ml-1">{day.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
