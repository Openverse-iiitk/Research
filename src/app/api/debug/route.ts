import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test database connection - simple select
    const { data: testUsers, error: tablesError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (tablesError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: tablesError.message,
        code: tablesError.code
      }, { status: 500 });
    }

    // Test environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      googleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    };

    // Test auth service
    const { data: authCheck, error: authError } = await supabase.auth.getSession();

    return NextResponse.json({
      status: 'success',
      database: {
        connected: true,
        userTableExists: true,
        hasUsers: testUsers && testUsers.length > 0
      },
      environment: envCheck,
      auth: {
        serviceAvailable: !authError,
        error: authError?.message
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'System check failed',
      error: error.message
    }, { status: 500 });
  }
}
