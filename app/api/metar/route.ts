import { NextResponse } from 'next/server';
import { readConfig } from '../../../lib/config';

// Force dynamic rendering - depends on runtime config
export const dynamic = 'force-dynamic';
// Cache for 15 minutes
export const revalidate = 900;

// Simple METAR parser (basic parsing - can be enhanced with a library if needed)
function getConditions(condition: string) {

  // Determine conditions from weather codes
  let conditions = 'Clear';
  if (condition.includes('RA')) conditions = 'Rain';
  else if (condition.includes('SN')) conditions = 'Snow';
  else if (condition.includes('FG')) conditions = 'Fog';
  else if (condition.includes('BR')) conditions = 'Mist';
  else if (condition.includes('OVC')) conditions = 'Overcast';
  else if (condition.includes('BKN')) conditions = 'Broken Clouds';
  else if (condition.includes('SCT')) conditions = 'Scattered Clouds';
  else if (condition.includes('FEW')) conditions = 'Few Clouds';

  return conditions;
}

export async function GET() {
  let station = 'KARB'; // Default station

  try {
    // Get station code from config
    const config = await readConfig();
    station = config.metarStation;

    // Fetch METAR from Aviation Weather Center
    const response = await fetch(`https://aviationweather.gov/api/data/metar?ids=${station}&format=json`);

    if (!response.ok) {
      throw new Error(`METAR API error: ${response.status}`);
    }

    const metarArray = await response.json();

    // API returns an array - get the first (and usually only) result
    if (!metarArray || metarArray.length === 0) {
      throw new Error(`No METAR data found for station ${station}`);
    }

    const metar = metarArray[0];

    return NextResponse.json({
      station: metar.icaoId,
      name: metar.name,
      rawMetar: metar.rawOb,
      temperature: Math.ceil(metar.temp),
      dewpoint: Math.ceil(metar.dewp),
      windSpeed: metar.wgst ? `${metar.wspd} (G${metar.wgst})` : `${metar.wspd}`,
      windDirection: metar.wdir,
      visibility: metar.visib,
      altimeter: metar.altim ? (metar.altim * 0.02953).toFixed(2) : null, // Convert hPa to inHg
      conditions: getConditions(metar.wxString) || 'Clear',
      flightCategory: metar.fltCat,
      clouds: metar.clouds || [],
      time: metar.reportTime,
      precipitation: metar.precip,
    });
  } catch (error) {
    console.error('METAR API error:', error);

    // Fallback to mock data on error
    return NextResponse.json({
      station,
      name: 'Station data unavailable',
      rawMetar: 'METAR data unavailable',
      temperature: 0,
      dewpoint: 0,
      windSpeed: '0',
      windDirection: 0,
      visibility: 10,
      altimeter: null,
      conditions: 'Unavailable',
      flightCategory: 'UNKN',
      clouds: [],
      time: new Date().toISOString(),
      precipitation: 0,
    });
  }
}
