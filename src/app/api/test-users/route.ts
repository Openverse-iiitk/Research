import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action !== 'create-test-users') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Test users data
    const testUsers = [
      {
        email: 'student.test@iiitkottayam.ac.in',
        username: 'teststudent',
        name: 'Test Student',
        role: 'student',
        department: 'Computer Science',
        phone: '+91-9876543210',
        email_verified: true,
        is_active: true
      },
      {
        email: 'teacher.test@iiitkottayam.ac.in', 
        username: 'testteacher',
        name: 'Dr. Test Teacher',
        role: 'teacher',
        department: 'Computer Science',
        phone: '+91-9876543211',
        email_verified: true,
        is_active: true
      },
      {
        email: 'admin.test@iiitkottayam.ac.in',
        username: 'testadmin', 
        name: 'Test Admin',
        role: 'admin',
        department: 'Administration',
        phone: '+91-9876543212',
        email_verified: true,
        is_active: true
      }
    ];

    const results = [];

    for (const user of testUsers) {
      // Use upsert to handle existing users
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert(user, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
        results.push({ email: user.email, success: false, error: error.message });
      } else {
        results.push({ email: user.email, success: true, id: data.id });
      }
    }

    // Get all test users to verify
    const { data: allTestUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, username, name, role, department, email_verified, is_active, created_at')
      .like('email', '%.test@iiitkottayam.ac.in')
      .order('role', { ascending: true });

    if (fetchError) {
      console.error('Error fetching test users:', fetchError);
    }

    return NextResponse.json({
      success: true,
      message: 'Test users creation attempted',
      results,
      testUsers: allTestUsers || []
    });

  } catch (error: any) {
    console.error('Test users creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create test users', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all test users
    const { data: testUsers, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, name, role, department, email_verified, is_active, created_at')
      .like('email', '%.test@iiitkottayam.ac.in')
      .order('role', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      testUsers: testUsers || [],
      count: testUsers?.length || 0
    });

  } catch (error: any) {
    console.error('Error fetching test users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test users', details: error.message },
      { status: 500 }
    );
  }
}
