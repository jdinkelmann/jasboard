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
      <div
        className="rounded-lg p-4 h-full animate-pulse backdrop-blur-theme"
        style={{
          background: 'var(--theme-metar-bg)',
          borderRadius: 'var(--theme-border-radius)',
          opacity: 'var(--theme-widget-opacity)',
        }}
      >
        <div className="h-full rounded opacity-50"></div>
      </div>
    );
  }

  if (!metar) {
    return (
      <div
        className="rounded-lg p-4 h-full flex items-center justify-center backdrop-blur-theme"
        style={{
          background: 'var(--theme-metar-bg)',
          color: 'var(--theme-metar-text)',
          borderRadius: 'var(--theme-border-radius)',
          opacity: 'var(--theme-widget-opacity)',
        }}
      >
        <p className="opacity-70">METAR unavailable</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-4 h-full overflow-auto backdrop-blur-theme"
      style={{
        background: 'var(--theme-metar-bg)',
        color: 'var(--theme-metar-text)',
        borderRadius: 'var(--theme-border-radius)',
        opacity: 'var(--theme-widget-opacity)',
      }}
    >
      <div className="mb-2">
        <h3 className="text-2xl font-bold">{metar.station}</h3>
        <p className="text-xs opacity-80">{metar.time}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <div className="opacity-80">Temp</div>
          <div className="font-bold text-lg">{metar.temperature}°C</div>
        </div>
        <div>
          <div className="opacity-80">Wind</div>
          <div className="font-bold text-lg">{metar.windSpeed} kt</div>
        </div>
        <div>
          <div className="opacity-80">Visibility</div>
          <div className="font-bold">{metar.visibility} SM</div>
        </div>
        <div>
          <div className="opacity-80">Conditions</div>
          <div className="font-bold">{metar.conditions}</div>
        </div>
      </div>

      <div
        className="text-xs rounded p-2 font-mono break-all opacity-90"
        style={{ background: 'rgba(0, 0, 0, 0.2)' }}
      >
        {metar.rawMetar}
      </div>
    </div>
  );
}
