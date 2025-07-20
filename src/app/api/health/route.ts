import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    // Test auth service
    const { data: authHealth, error: authError } = await supabase.auth.getSession();

    const healthData = {
      timestamp: new Date().toISOString(),
      database: {
        connected: !healthError,
        error: healthError?.message || null,
        response: healthCheck || null
      },
      auth: {
        connected: !authError,
        error: authError?.message || null,
        hasSession: !!authHealth?.session
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'configured' : 'missing'
      }
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        error: 'Health check failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
