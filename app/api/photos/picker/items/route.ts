import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '../../../../../lib/google-auth';
import { readConfig, updateConfig } from '../../../../../lib/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Get authenticated Google client
    const auth = await getAuthenticatedClient();
    const tokens = await auth.getAccessToken();

    // Fetch media items from the session
    const response = await fetch(
      `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Picker media items error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to get media items: ${response.statusText}`);
    }

    const data = await response.json();
    const items = data.mediaItems || [];

    // Transform to our photo format
    const selectedPhotos = items
      .filter((item: any) => item.mediaFile?.mimeType?.startsWith('image/'))
      .map((item: any) => ({
        id: item.id,
        url: item.mediaFile?.baseUrl,
        alt: item.mediaFile?.filename || 'Photo',
        mimeType: item.mediaFile?.mimeType,
      }));

    // Save selected photos to config
    const config = await readConfig();
    await updateConfig({
      ...config,
      selectedPhotos,
    });

    return NextResponse.json({
      photos: selectedPhotos,
      count: selectedPhotos.length,
    });
  } catch (error) {
    console.error('Picker items API error:', error);
    return NextResponse.json(
      { error: 'Failed to get media items' },
      { status: 500 }
    );
  }
}
