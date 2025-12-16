import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/google-auth';
import { readConfig } from '@/lib/config';

// Cache for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    // Get configuration
    const config = await readConfig();
    const selectedPhotos = config.selectedPhotos || [];

    // If no photos selected, return empty array
    if (selectedPhotos.length === 0) {
      return NextResponse.json({ photos: [] });
    }

    // Shuffle photos for variety
    const shuffled = [...selectedPhotos].sort(() => Math.random() - 0.5);

    return NextResponse.json({ photos: shuffled });
  } catch (error) {
    console.error('Photos API error:', error);

    // Return empty photos on error (graceful degradation)
    return NextResponse.json({ photos: [] });
  }
}
