import { NextResponse } from 'next/server';
import { readConfig } from '../../../lib/config';
import * as cheerio from 'cheerio';
import { Workout } from '../../../lib/types/wod';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

async function scrapeDarebeeWOD(): Promise<Workout | null> {
  try {
    const response = await fetch('https://darebee.com/wod.html', {
      headers: { 'User-Agent': 'JasBoard/1.0' }
    });

    if (!response.ok) throw new Error('Failed to fetch');

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse DAREBEE workout structure
    // Note: These selectors may need adjustment based on actual DAREBEE HTML structure
    const title = $('.workout-title').text().trim() || $('h1').first().text().trim();
    const imageUrl = $('.workout-image img').attr('src') || $('img').first().attr('src');
    const exercises = $('.exercise-list li')
      .map((i, el) => ({
        name: $(el).find('.exercise-name').text().trim() || $(el).text().trim(),
        reps: $(el).find('.reps').text().trim(),
      }))
      .get();

    const workout: Workout = {
      id: `darebee-${new Date().toISOString().split('T')[0]}`,
      date: new Date().toISOString().split('T')[0],
      title: title || 'Daily Workout',
      description: 'DAREBEE Workout of the Day',
      imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://darebee.com${imageUrl}`) : undefined,
      difficulty: 'all',
      type: 'mixed',
      duration: 20,
      exercises: exercises.length > 0 ? exercises : [],
      source: 'darebee',
      sourceUrl: 'https://darebee.com/wod.html',
    };

    return workout;
  } catch (error) {
    console.error('DAREBEE scraping error:', error);
    return null;
  }
}

// Fallback workout if scraping fails
const fallbackWorkout: Workout = {
  id: 'fallback-basic',
  date: new Date().toISOString().split('T')[0],
  title: 'Basic Bodyweight Workout',
  description: 'A simple full-body workout',
  difficulty: 'all',
  type: 'mixed',
  duration: 20,
  exercises: [
    { name: 'Push-ups', reps: '10-15' },
    { name: 'Squats', reps: '15-20' },
    { name: 'Plank', duration: '30-60 seconds' },
    { name: 'Lunges', reps: '10 each leg' },
    { name: 'Mountain Climbers', reps: '20' },
  ],
  source: 'darebee',
  sourceUrl: 'https://darebee.com',
};

export async function GET() {
  try {
    const config = await readConfig();

    // Check if WOD is enabled (has users)
    if (!config.wodUsers || config.wodUsers.length === 0) {
      return NextResponse.json({
        workout: null,
        message: 'No WOD users configured'
      });
    }

    // Try to scrape DAREBEE
    let workout = await scrapeDarebeeWOD();

    // Use fallback if scraping failed
    if (!workout || workout.exercises.length === 0) {
      workout = fallbackWorkout;
    }

    // Get user statuses from config or storage
    const userStatuses = config.wodUsers.map(user => ({
      userId: user.id,
      workoutId: workout!.id,
      date: workout!.date,
      completed: false, // TODO: Read from persistent storage
      streak: 0, // TODO: Calculate from history
    }));

    return NextResponse.json({
      workout,
      userStatuses,
    });
  } catch (error) {
    console.error('WOD API error:', error);
    return NextResponse.json({
      workout: fallbackWorkout,
      userStatuses: [],
    });
  }
}

// POST endpoint for marking workout complete
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, workoutId, completed } = body;

    // TODO: Store completion status in persistent storage
    // For now, just return success

    return NextResponse.json({
      success: true,
      userId,
      completed,
    });
  } catch (error) {
    console.error('WOD completion error:', error);
    return NextResponse.json(
      { error: 'Failed to update workout status' },
      { status: 500 }
    );
  }
}
