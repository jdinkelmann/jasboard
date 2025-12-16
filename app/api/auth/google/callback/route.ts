import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // TODO: Implement Google OAuth callback
  // This will handle the OAuth redirect from Google

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect('/admin?error=oauth_failed');
  }

  if (!code) {
    return NextResponse.redirect('/admin?error=no_code');
  }

  // TODO: Exchange code for tokens and store them
  // const tokens = await exchangeCodeForTokens(code);
  // await saveTokens(tokens);

  return NextResponse.redirect('/admin?success=true');
}
