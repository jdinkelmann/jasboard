import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/google-auth';

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

    // Check session status
    const response = await fetch(
      `https://photospicker.googleapis.com/v1/sessions/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Picker session status error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to get session status: ${response.statusText}`);
    }

    const session = await response.json();

    return NextResponse.json({
      mediaItemsSet: session.mediaItemsSet || false,
      pollingConfig: session.pollingConfig,
    });
  } catch (error) {
    console.error('Picker status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get session status' },
      { status: 500 }
    );
  }
}
