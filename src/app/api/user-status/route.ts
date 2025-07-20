import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Create admin client to check users
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get recent users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    // Get users from our custom table
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      authUsers: authUsers?.users?.length || 0,
      dbUsers: dbUsers?.length || 0,
      recentAuthUsers: authUsers?.users?.slice(0, 3)?.map(u => ({
        id: u.id,
        email: u.email,
        email_confirmed_at: u.email_confirmed_at,
        last_sign_in_at: u.last_sign_in_at,
        created_at: u.created_at
      })) || [],
      recentDbUsers: dbUsers?.slice(0, 3)?.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        role: u.role,
        email_verified: u.email_verified
      })) || [],
      errors: {
        auth: authError?.message,
        db: dbError?.message
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
