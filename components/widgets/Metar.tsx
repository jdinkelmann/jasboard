'use client';

import { useEffect, useState } from 'react';

interface MetarData {
  station: string;
  name: string;
  rawMetar: string;
  temperature: number;
  dewpoint: number;
  windSpeed: string;
  windDirection: number;
  visibility: number;
  altimeter: string | null;
  conditions: string;
  flightCategory: string;
  clouds: Array<{ cover: string; base: number }>;
  time: string;
  precipitation: number;
}

// Format cloud layers for display - show first significant layer (BKN/OVC)
function formatClouds(clouds: Array<{ cover: string; base: number }>): string {
  if (!clouds || clouds.length === 0) return 'Clear';

  // Find first BKN or OVC layer
  const significantLayer = clouds.find(cloud =>
    cloud.cover === 'BKN' || cloud.cover === 'OVC'
  );

  if (!significantLayer) return 'Clear';

  const coverType = significantLayer.cover === 'BKN' ? 'Broken' : 'Overcast';
  const altitude = significantLayer.base.toLocaleString();

  return `${coverType} ${altitude} ft`;
}

// Get background color based on flight category (standard aviation colors)
function getFlightCategoryColor(category: string): string {
  switch (category) {
    case 'VFR':
      return 'linear-gradient(to bottom right, #16a34a, #22c55e)'; // Green
    case 'MVFR':
      return 'linear-gradient(to bottom right, #2563eb, #3b82f6)'; // Blue
    case 'IFR':
      return 'linear-gradient(to bottom right, #dc2626, #ef4444)'; // Red
    case 'LIFR':
      return 'linear-gradient(to bottom right, #c026d3, #d946ef)'; // Magenta
    default:
      return 'var(--theme-metar-bg)'; // Fallback to theme color
  }
}

export default function Metar() {
  const [metar, setMetar] = useState<MetarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetar = async () => {
      try {
        const response = await fetch('/api/metar');
        console.log('METAR response:', response);
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

  const backgroundColor = getFlightCategoryColor(metar.flightCategory);

  return (
    <div
      className="rounded-lg p-4 h-full overflow-auto backdrop-blur-theme"
      style={{
        background: backgroundColor,
        color: 'var(--theme-metar-text)',
        borderRadius: 'var(--theme-border-radius)',
        opacity: 'var(--theme-widget-opacity)',
      }}
    >
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">{metar.station}</h3>
          <span className="text-sm font-bold px-2 py-1 rounded bg-black/20">
            {metar.flightCategory}
          </span>
        </div>
        <p className="text-xs opacity-80">{metar.name}</p>
        <p className="text-xs opacity-80">{new Date(metar.time).toLocaleTimeString()}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div>
          <div className="opacity-80">Temp</div>
          <div className="font-bold text-lg">{metar.temperature}°C</div>
        </div>
        <div>
          <div className="opacity-80">Wind</div>
          <div className="font-bold text-lg">{metar.windSpeed} kt</div>
        </div>
        <div>
          <div className="opacity-80">Altimeter</div>
          <div className="font-bold">{metar.altimeter ? `${metar.altimeter}"` : 'N/A'}</div>
        </div>
        <div>
          <div className="opacity-80">Visibility</div>
          <div className="font-bold">{metar.visibility} SM</div>
        </div>
        <div>
          <div className="opacity-80">Clouds</div>
          <div className="font-bold font-mono text-xs">{formatClouds(metar.clouds)}</div>
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
