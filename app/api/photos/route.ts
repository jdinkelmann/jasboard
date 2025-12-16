import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/google-auth';
import { readConfig } from '@/lib/config';

// Cache for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    // Get configuration
    const config = await readConfig();
    const albumIds = config.photoAlbumIds;

    // If no albums configured, return empty array
    if (!albumIds || albumIds.length === 0) {
      return NextResponse.json({ photos: [] });
    }

    // Get authenticated Google client
    const auth = await getAuthenticatedClient();

    const allPhotos: any[] = [];

    // Fetch photos from each configured album
    for (const albumId of albumIds) {
      try {
        // Use fetch instead of googleapis for Photos Library API
        // The googleapis library doesn't have great support for Photos Library API
        const tokens = await auth.getAccessToken();

        const response = await fetch(
          'https://photoslibrary.googleapis.com/v1/mediaItems:search',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokens.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              albumId,
              pageSize: 50,
            }),
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch album ${albumId}:`, response.statusText);
          continue;
        }

        const data = await response.json();
        const items = data.mediaItems || [];

        // Transform photos to our format
        // Add =w800-h600 to get appropriately sized images
        const transformedPhotos = items
          .filter((item: any) => item.mimeType?.startsWith('image/'))
          .map((item: any) => ({
            id: item.id,
            url: `${item.baseUrl}=w800-h600`,
            alt: item.filename || 'Photo',
          }));

        allPhotos.push(...transformedPhotos);
      } catch (albumError) {
        console.error(`Error fetching album ${albumId}:`, albumError);
        // Continue with other albums even if one fails
      }
    }

    // Shuffle photos for variety
    const shuffled = allPhotos.sort(() => Math.random() - 0.5);

    return NextResponse.json({ photos: shuffled });
  } catch (error) {
    console.error('Photos API error:', error);

    // Return empty photos on error (graceful degradation)
    return NextResponse.json({ photos: [] });
  }
}
