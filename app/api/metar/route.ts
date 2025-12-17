import { NextResponse } from 'next/server';
import { readConfig } from '../../../lib/config';
import { format } from 'date-fns';

// Force dynamic rendering - depends on runtime config
export const dynamic = 'force-dynamic';
// Cache for 15 minutes
export const revalidate = 900;

// Simple METAR parser (basic parsing - can be enhanced with a library if needed)
function parseMetar(rawMetar: string) {
  const parts = rawMetar.split(' ');

  // Extract temperature (format: temp/dewpoint like 07/M03)
  const tempDewpoint = parts.find((p) => p.includes('/'));
  let temperature = 0;
  let dewpoint = 0;
  if (tempDewpoint) {
    const [temp, dew] = tempDewpoint.split('/');
    temperature = parseInt(temp.replace('M', '-'));
    dewpoint = parseInt(dew.replace('M', '-'));
  }

  // Extract wind (format: 31008KT or 26011G18KT with gusts)
  const windMatch = parts.find((p) => p.match(/^\d{5}(G\d{2})?KT/));
  let windDirection = 0;
  let windSpeed = 0;
  if (windMatch) {
    windDirection = parseInt(windMatch.substring(0, 3));
    windSpeed = parseInt(windMatch.substring(3, 5));
  }

  // Extract visibility (format: 10SM)
  const visMatch = parts.find((p) => p.includes('SM'));
  let visibility = 10;
  if (visMatch) {
    visibility = parseInt(visMatch.replace('SM', ''));
  }

  // Determine conditions from weather codes
  let conditions = 'Clear';
  if (rawMetar.includes('RA')) conditions = 'Rain';
  else if (rawMetar.includes('SN')) conditions = 'Snow';
  else if (rawMetar.includes('FG')) conditions = 'Fog';
  else if (rawMetar.includes('BR')) conditions = 'Mist';
  else if (rawMetar.includes('OVC')) conditions = 'Overcast';
  else if (rawMetar.includes('BKN')) conditions = 'Broken Clouds';
  else if (rawMetar.includes('SCT')) conditions = 'Scattered Clouds';
  else if (rawMetar.includes('FEW')) conditions = 'Few Clouds';

  return {
    temperature,
    dewpoint,
    windSpeed,
    windDirection,
    visibility,
    conditions,
  };
}

export async function GET() {
  try {
    // Get station code from config
    const config = await readConfig();
    const station = config.metarStation;

    // Fetch METAR from Aviation Weather Center
    const response = await fetch(
      `https://aviationweather.gov/api/data/metar?ids=${station}&format=raw`,
      {
        headers: {
          'User-Agent': 'JasBoard (personal use)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`METAR API error: ${response.status}`);
    }

    const rawMetar = await response.text();

    // Parse the METAR
    const parsed = parseMetar(rawMetar.trim());

    // Extract observation time from METAR (format: DDHHmmZ)
    const timeMatch = rawMetar.match(/\d{6}Z/);
    let timeString = format(new Date(), 'HH:mm') + 'Z';
    if (timeMatch) {
      const day = timeMatch[0].substring(0, 2);
      const hour = timeMatch[0].substring(2, 4);
      const minute = timeMatch[0].substring(4, 6);
      timeString = `${hour}:${minute}Z (Day ${day})`;
    }

    return NextResponse.json({
      station,
      rawMetar: rawMetar.trim(),
      temperature: parsed.temperature,
      dewpoint: parsed.dewpoint,
      windSpeed: parsed.windSpeed,
      windDirection: parsed.windDirection,
      visibility: parsed.visibility,
      conditions: parsed.conditions,
      time: timeString,
    });
  } catch (error) {
    console.error('METAR API error:', error);

    // Fallback to mock data on error
    return NextResponse.json({
      station: 'KBOS',
      rawMetar: 'METAR data unavailable',
      temperature: 0,
      dewpoint: 0,
      windSpeed: 0,
      windDirection: 0,
      visibility: 10,
      conditions: 'Unavailable',
      time: format(new Date(), 'HH:mm') + 'Z',
    });
  }
}
