import { NextResponse } from 'next/server';
import { readConfig, writeConfig } from '../../../../lib/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Read current config
    const config = await readConfig();

    // Remove Google tokens
    const { googleTokens, ...configWithoutTokens } = config;

    // Write config back without tokens
    await writeConfig(configWithoutTokens);

    return NextResponse.json({ success: true, message: 'Google authentication reset' });
  } catch (error) {
    console.error('Auth reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset authentication' },
      { status: 500 }
    );
  }
}
