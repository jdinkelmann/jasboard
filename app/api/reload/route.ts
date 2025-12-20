import { NextResponse } from 'next/server';
import { writeConfig, readConfig } from '../../../lib/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const config = await readConfig();
    await writeConfig({ ...config, reloadRequested: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reload request error:', error);
    return NextResponse.json(
      { error: 'Failed to request reload' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const config = await readConfig();
    const shouldReload = config.reloadRequested === true;

    // Clear the flag if it was set
    if (shouldReload) {
      await writeConfig({ ...config, reloadRequested: false });
    }

    return NextResponse.json({ shouldReload });
  } catch (error) {
    console.error('Reload check error:', error);
    return NextResponse.json({ shouldReload: false });
  }
}
