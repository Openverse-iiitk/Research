import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testMode = searchParams.get('test');

  if (testMode === 'oauth') {
    return NextResponse.json({
      status: 'OAuth test endpoint',
      instructions: [
        '1. Ensure Supabase redirect URLs use ** pattern: http://localhost:3001/**',
        '2. Check Google Console has exact redirect URIs: http://localhost:3001/auth/callback',
        '3. Wait 5-10 minutes after making changes for propagation',
        '4. Clear browser cache and test OAuth flow'
      ],
      currentConfig: {
        expectedRedirectURL: `${request.nextUrl.origin}/auth/callback`,
        supabaseURL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
        environment: process.env.NODE_ENV
      }
    });
  }

  return NextResponse.json({
    status: 'OAuth configuration test',
    message: 'Add ?test=oauth to see configuration details'
  });
}
