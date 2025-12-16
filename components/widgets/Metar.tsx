'use client';

import { useEffect, useState } from 'react';

interface MetarData {
  station: string;
  rawMetar: string;
  temperature: number;
  dewpoint: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  conditions: string;
  time: string;
}

export default function Metar() {
  const [metar, setMetar] = useState<MetarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetar = async () => {
      try {
        const response = await fetch('/api/metar');
        const data = await response.json();
        setMetar(data);
      } catch (error) {
        console.error('Failed to fetch METAR:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetar();
    // Refresh every 15 minutes
    const interval = setInterval(fetchMetar, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 h-full animate-pulse">
        <div className="h-full bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (!metar) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 h-full flex items-center justify-center">
        <p className="text-gray-400">METAR unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg p-4 h-full overflow-auto">
      <div className="mb-2">
        <h3 className="text-2xl font-bold">{metar.station}</h3>
        <p className="text-xs text-purple-200">{metar.time}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <div className="text-purple-200">Temp</div>
          <div className="font-bold text-lg">{metar.temperature}°C</div>
        </div>
        <div>
          <div className="text-purple-200">Wind</div>
          <div className="font-bold text-lg">{metar.windSpeed} kt</div>
        </div>
        <div>
          <div className="text-purple-200">Visibility</div>
          <div className="font-bold">{metar.visibility} SM</div>
        </div>
        <div>
          <div className="text-purple-200">Conditions</div>
          <div className="font-bold">{metar.conditions}</div>
        </div>
      </div>

      <div className="text-xs bg-purple-950 bg-opacity-50 rounded p-2 font-mono break-all">
        {metar.rawMetar}
      </div>
    </div>
  );
}
