import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testMode = searchParams.get('test');

  if (testMode === 'oauth') {
    // This endpoint simulates what happens when Google OAuth redirects back
    // You can use this to test the callback logic
    const mockCode = 'test_authorization_code_' + Date.now();
    
    // Redirect to the actual callback with a test code
    const callbackUrl = new URL('/auth/callback', request.url);
    callbackUrl.searchParams.set('code', mockCode);
    callbackUrl.searchParams.set('test', 'true');
    
    return NextResponse.redirect(callbackUrl.toString());
  }

  return NextResponse.json({
    message: 'OAuth test endpoint',
    instructions: {
      'Test OAuth Flow': 'Visit /api/test-oauth?test=oauth to simulate OAuth callback',
      'Note': 'This is for testing purposes only and will not create a real session'
    },
    currentTime: new Date().toISOString(),
    redirectUrls: {
      local: 'http://localhost:3001/auth/callback',
      production: 'https://research-iiitk.vercel.app/auth/callback'
    }
  });
}
