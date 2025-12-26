import { NextResponse } from 'next/server';
import { readConfig } from '../../../lib/config';
import { format } from 'date-fns';

// Force dynamic rendering - depends on runtime config
export const dynamic = 'force-dynamic';
// Cache for 30 minutes
export const revalidate = 1800;

// Tomorrow.io API key (hardcoded for now, move to env later)
const TOMORROW_API_KEY = 'qsKTql4jZCxnTeQKQsNGQFLZGVqIA0br';

// Helper to convert Tomorrow.io weather code to emoji
function getWeatherIcon(weatherCode: number): string {
  // Clear & Cloudy
  if (weatherCode === 1000) return '☀️'; // Clear, Sunny
  if (weatherCode === 1100) return '🌤️'; // Mostly Clear
  if (weatherCode === 1101) return '⛅'; // Partly Cloudy
  if (weatherCode === 1102) return '🌥️'; // Mostly Cloudy
  if (weatherCode === 1001) return '☁️'; // Cloudy

  // Fog
  if (weatherCode === 2000 || weatherCode === 2100) return '🌫️'; // Fog

  // Rain
  if (weatherCode === 4000 || weatherCode === 4200) return '🌧️'; // Drizzle, Light Rain
  if (weatherCode === 4001 || weatherCode === 4201) return '🌧️'; // Rain, Heavy Rain

  // Snow
  if (weatherCode >= 5000 && weatherCode <= 5101) return '🌨️'; // Snow

  // Freezing Rain / Ice
  if (weatherCode >= 6000 && weatherCode <= 6201) return '🌧️'; // Freezing Rain
  if (weatherCode >= 7000 && weatherCode <= 7102) return '🧊'; // Ice Pellets

  // Thunderstorm
  if (weatherCode === 8000) return '⛈️'; // Thunderstorm

  return '🌤️'; // Default
}

// Helper to get weather condition description
function getWeatherDescription(weatherCode: number): string {
  const descriptions: { [key: number]: string } = {
    1000: 'Clear',
    1100: 'Mostly Clear',
    1101: 'Partly Cloudy',
    1102: 'Mostly Cloudy',
    1001: 'Cloudy',
    2000: 'Fog',
    2100: 'Light Fog',
    4000: 'Drizzle',
    4200: 'Light Rain',
    4001: 'Rain',
    4201: 'Heavy Rain',
    5001: 'Flurries',
    5100: 'Light Snow',
    5000: 'Snow',
    5101: 'Heavy Snow',
    6000: 'Freezing Drizzle',
    6001: 'Freezing Rain',
    6200: 'Light Freezing Rain',
    6201: 'Heavy Freezing Rain',
    7000: 'Ice Pellets',
    7102: 'Light Ice Pellets',
    7101: 'Heavy Ice Pellets',
    8000: 'Thunderstorm',
  };

  return descriptions[weatherCode] || 'Unknown';
}

export async function GET() {
  try {
    // Get location from config
    const config = await readConfig();
    const { lat, lon, name } = config.weatherLocation;

    // Fetch weather from Tomorrow.io (imperial = Fahrenheit)
    const url = `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${TOMORROW_API_KEY}&timesteps=daily&units=imperial`;

    const response = await fetch(url, {
      cache: 'no-store', // Don't cache the fetch to avoid issues
    });

    if (!response.ok) {
      // Handle rate limiting (429) and other errors
      if (response.status === 429) {
        console.error('Tomorrow.io rate limit exceeded. Using cached/fallback data.');
      }
      throw new Error(`Tomorrow.io API error: ${response.status}`);
    }

    const data = await response.json();
    const dailyTimeline = data.timelines.daily;

    // Use today's average temp and weather code for current conditions
    // This avoids a second API call and stays within rate limits
    const currentTemp = Math.round(dailyTimeline[0].values.temperatureAvg);
    const currentCode = dailyTimeline[0].values.weatherCodeMax;

    // Format current weather
    const current = {
      temp: currentTemp,
      condition: getWeatherDescription(currentCode),
      icon: getWeatherIcon(currentCode),
    };

    // Format 5-day forecast
    const dailyForecasts = dailyTimeline.slice(0, 5).map((day: any, index: number) => {
      const date = new Date(day.time);
      const dayName = index === 0 ? 'Today' : format(date, 'EEE');

      return {
        day: dayName,
        high: Math.round(day.values.temperatureMax),
        low: Math.round(day.values.temperatureMin),
        condition: getWeatherDescription(day.values.weatherCodeMax),
        icon: getWeatherIcon(day.values.weatherCodeMax),
      };
    });

    return NextResponse.json({
      location: name,
      current,
      forecast: dailyForecasts,
    });
  } catch (error) {
    console.error('Weather API error:', error);

    // Fallback to mock data on error (Fahrenheit)
    const mockData = {
      current: {
        temp: 68,
        condition: 'Data Unavailable',
        icon: '❓',
      },
      forecast: [
        { day: 'Today', high: 72, low: 59, condition: 'Unavailable', icon: '❓' },
        { day: 'Fri', high: 70, low: 58, condition: 'Unavailable', icon: '❓' },
        { day: 'Sat', high: 66, low: 54, condition: 'Unavailable', icon: '❓' },
        { day: 'Sun', high: 68, low: 55, condition: 'Unavailable', icon: '❓' },
        { day: 'Mon', high: 72, low: 59, condition: 'Unavailable', icon: '❓' },
      ],
    };

    return NextResponse.json(mockData);
  }
}
