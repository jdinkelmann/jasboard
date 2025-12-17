import { NextResponse } from 'next/server';
import { getGoogleTokens } from '../../../../lib/config';

export async function GET() {
  try {
    const tokens = await getGoogleTokens();
    const authenticated = !!tokens && !!tokens.access_token;

    return NextResponse.json({ authenticated });
  } catch (error) {
    console.error('Failed to check auth status:', error);
    return NextResponse.json({ authenticated: false });
  }
}
