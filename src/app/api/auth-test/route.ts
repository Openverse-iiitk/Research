import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test basic auth functionality
    const { data: session } = await supabase.auth.getSession();
    
    // Check if we can access the auth admin functions
    const authResponse = await supabase.auth.getUser();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      authConfig: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      session: !!session,
      authStatus: authResponse.error ? authResponse.error.message : 'Connected',
      environment: process.env.NODE_ENV,
      recommendations: [
        'Check Supabase Dashboard > Authentication > Settings',
        'Verify "Enable email confirmations" is enabled',
        'Check SMTP settings in Authentication > Settings > SMTP',
        'Verify email templates are configured',
        'Check site URL and redirect URLs'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
      timestamp: new Date().toISOString()
    });
  }
}
