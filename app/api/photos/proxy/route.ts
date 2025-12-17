import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '../../../../lib/google-auth';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'url parameter is required' },
        { status: 400 }
      );
    }

    // Get authenticated Google client
    const auth = await getAuthenticatedClient();
    const tokens = await auth.getAccessToken();

    // Add size parameters to the URL for optimization
    // w2000 = width 2000px, which is good for 1080x1920 portrait display
    const urlWithParams = `${imageUrl}=w2000-h2000`;

    // Fetch the image with authentication
    const response = await fetch(urlWithParams, {
      headers: {
        'Authorization': `Bearer ${tokens.token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch image:', {
        status: response.status,
        url: imageUrl,
      });
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
}
