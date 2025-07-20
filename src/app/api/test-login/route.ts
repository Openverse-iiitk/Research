import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check users in database
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, username, role, name')
      .in('email', ['student.test@iiitkottayam.ac.in', 'teacher.test@iiitkottayam.ac.in']);

    if (error) {
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Test users in database',
      users: users || [],
      instructions: [
        '1. Try logging in with: student.test@iiitkottayam.ac.in / TestStudent123!',
        '2. Try logging in with: teacher.test@iiitkottayam.ac.in / TestTeacher123!',
        '3. Students should redirect to homepage, teachers to /teacher dashboard',
        '4. Check console for auth redirect logs'
      ]
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
