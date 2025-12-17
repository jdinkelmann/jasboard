import { NextResponse } from 'next/server';
import { readConfig } from '../../../lib/config';
import { format } from 'date-fns';

// Force dynamic rendering - depends on runtime config
export const dynamic = 'force-dynamic';
// Cache for 30 minutes
export const revalidate = 1800;

// Helper to convert weather condition to emoji
function getWeatherIcon(forecast: string): string {
  const lower = forecast.toLowerCase();
  if (lower.includes('thunder')) return '⛈️';
  if (lower.includes('rain') || lower.includes('shower')) return '🌧️';
  if (lower.includes('snow')) return '🌨️';
  if (lower.includes('cloud') && lower.includes('part')) return '⛅';
  if (lower.includes('cloud') || lower.includes('overcast')) return '☁️';
  if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
  if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
  return '🌤️';
}

export async function GET() {
  try {
    // Get location from config
    const config = await readConfig();
    const { lat, lon } = config.weatherLocation;

    // Step 1: Get the forecast URL for this location
    const pointsResponse = await fetch(
      `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
      {
        headers: {
          'User-Agent': 'JasBoard (personal use)',
        },
      }
    );

    if (!pointsResponse.ok) {
      throw new Error(`NWS points API error: ${pointsResponse.status}`);
    }

    const pointsData = await pointsResponse.json();
    const forecastUrl = pointsData.properties.forecast;
    const forecastHourlyUrl = pointsData.properties.forecastHourly;

    // Step 2: Get the forecast data
    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        'User-Agent': 'JasBoard (personal use)',
      },
    });

    if (!forecastResponse.ok) {
      throw new Error(`NWS forecast API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();
    const periods = forecastData.properties.periods;

    // Get current temperature from hourly forecast
    const hourlyResponse = await fetch(forecastHourlyUrl, {
      headers: {
        'User-Agent': 'JasBoard (personal use)',
      },
    });

    let currentTemp = periods[0].temperature;
    if (hourlyResponse.ok) {
      const hourlyData = await hourlyResponse.json();
      currentTemp = hourlyData.properties.periods[0].temperature;
    }

    // Format current weather
    const current = {
      temp: currentTemp,
      condition: periods[0].shortForecast,
      icon: getWeatherIcon(periods[0].shortForecast),
    };

    // Format 5-day forecast
    // NWS returns day/night periods, so we need to group them
    const dailyForecasts: any[] = [];
    const seenDays = new Set();

    for (const period of periods) {
      const dayName = period.name.split(' ')[0]; // "Monday Night" -> "Monday"

      if (seenDays.has(dayName)) continue;
      if (dailyForecasts.length >= 5) break;

      seenDays.add(dayName);

      // Find the corresponding night period for low temp
      const nightPeriod = periods.find(
        (p: any) => p.name === `${dayName} Night` || p.name === `Tonight`
      );

      dailyForecasts.push({
        day: format(new Date(period.startTime), 'EEE'),
        high: period.temperature,
        low: nightPeriod ? nightPeriod.temperature : period.temperature - 10,
        condition: period.shortForecast,
        icon: getWeatherIcon(period.shortForecast),
      });
    }

    return NextResponse.json({
      location: config.weatherLocation.name,
      current,
      forecast: dailyForecasts,
    });
  } catch (error) {
    console.error('Weather API error:', error);

    // Fallback to mock data on error
    const mockData = {
      current: {
        temp: 72,
        condition: 'Data Unavailable',
        icon: '❓',
      },
      forecast: [
        { day: 'Mon', high: 75, low: 62, condition: 'Unavailable', icon: '❓' },
        { day: 'Tue', high: 73, low: 60, condition: 'Unavailable', icon: '❓' },
        { day: 'Wed', high: 68, low: 58, condition: 'Unavailable', icon: '❓' },
        { day: 'Thu', high: 70, low: 59, condition: 'Unavailable', icon: '❓' },
        { day: 'Fri', high: 74, low: 61, condition: 'Unavailable', icon: '❓' },
      ],
    };

    return NextResponse.json(mockData);
  }
}
