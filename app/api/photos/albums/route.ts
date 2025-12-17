import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '../../../../lib/google-auth';

// Force dynamic rendering - requires authentication
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getAuthenticatedClient();
    const tokens = await auth.getAccessToken();

    // Fetch all albums
    const response = await fetch(
      'https://photoslibrary.googleapis.com/v1/albums',
      {
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Photos API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch albums: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const albums = data.albums || [];

    // Return simplified album info
    const albumList = albums.map((album: any) => ({
      id: album.id,
      title: album.title,
      mediaItemsCount: album.mediaItemsCount || 0,
    }));

    return NextResponse.json({ albums: albumList });
  } catch (error) {
    console.error('Albums API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}
