import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/google-auth';

export async function POST() {
  try {
    // Get authenticated Google client
    const auth = await getAuthenticatedClient();
    const tokens = await auth.getAccessToken();

    // Create a picker session
    const response = await fetch(
      'https://photospicker.googleapis.com/v1/sessions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Picker session creation error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to create picker session: ${response.statusText}`);
    }

    const session = await response.json();

    return NextResponse.json({
      sessionId: session.id,
      pickerUri: session.pickerUri,
      pollingConfig: session.pollingConfig,
    });
  } catch (error) {
    console.error('Picker session API error:', error);
    return NextResponse.json(
      { error: 'Failed to create picker session' },
      { status: 500 }
    );
  }
}
