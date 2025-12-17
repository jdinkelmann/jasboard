import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '../../../../../lib/google-auth';

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    const redirectUrl = new URL('/admin', request.url);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL('/admin', request.url);
    redirectUrl.searchParams.set('error', 'no_code');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Exchange the authorization code for access and refresh tokens
    await exchangeCodeForTokens(code);

    // Redirect back to admin with success
    const redirectUrl = new URL('/admin', request.url);
    redirectUrl.searchParams.set('success', 'true');
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Failed to exchange code for tokens:', error);
    const redirectUrl = new URL('/admin', request.url);
    redirectUrl.searchParams.set('error', 'token_exchange_failed');
    return NextResponse.redirect(redirectUrl);
  }
}
