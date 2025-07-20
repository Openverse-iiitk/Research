import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const testUsers = [
  {
    email: 'student.test@iiitkottayam.ac.in',
    password: 'TestStudent123!',
    username: 'teststudent',
    name: 'Test Student',
    role: 'student',
    department: 'Computer Science',
    phone: '+91-9876543210'
  },
  {
    email: 'teacher.test@iiitkottayam.ac.in', 
    password: 'TestTeacher123!',
    username: 'testteacher',
    name: 'Dr. Test Teacher',
    role: 'teacher',
    department: 'Computer Science',
    phone: '+91-9876543211'
  },
  {
    email: 'admin.test@iiitkottayam.ac.in',
    password: 'TestAdmin123!',
    username: 'testadmin',
    name: 'Test Admin',
    role: 'admin',
    department: 'Administration',
    phone: '+91-9876543212'
  }
];

export async function POST(request: NextRequest) {
  try {
    const results = [];

    for (const user of testUsers) {
      try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            username: user.username,
            name: user.name,
            role: user.role
          }
        });

        if (authError) {
          results.push({
            email: user.email,
            status: 'auth_error',
            error: authError.message
          });
          continue;
        }

        // 2. Create/update user in custom users table
        const { error: dbError } = await supabase
          .from('users')
          .upsert({
            id: authData.user?.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            department: user.department,
            phone: user.phone,
            email_verified: true,
            is_active: true
          });

        if (dbError) {
          results.push({
            email: user.email,
            status: 'db_error',
            error: dbError.message,
            authId: authData.user?.id
          });
        } else {
          results.push({
            email: user.email,
            status: 'success',
            role: user.role,
            authId: authData.user?.id
          });
        }

      } catch (error: any) {
        results.push({
          email: user.email,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      status: 'completed',
      results,
      credentials: {
        student: { email: 'student.test@iiitkottayam.ac.in', password: 'TestStudent123!' },
        teacher: { email: 'teacher.test@iiitkottayam.ac.in', password: 'TestTeacher123!' },
        admin: { email: 'admin.test@iiitkottayam.ac.in', password: 'TestAdmin123!' }
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create test users', details: error.message },
      { status: 500 }
    );
  }
}
