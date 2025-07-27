import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the request body
    const body = await request.json();
    console.log('Received body:', body);
    
    // Try to create a test project with outcome
    const testProject = {
      title: 'Test Project',
      description: 'Test Description', 
      requirements: ['Test requirement'],
      duration: '3 months',
      location: 'Test Location',
      max_students: 1,
      deadline: '2025-12-31',
      stipend: 'Paid',
      outcome: 'Test outcome',
      status: 'active',
      author_id: body.author_id || '8f32378f-62c9-48e0-ac79-9f1056415f56', // Use existing teacher ID
      author_email: 'teacher.test@iiitkottayam.ac.in',
      author_name: 'teacher.test',
      department: 'Computer Science',
      tags: ['test']
    };

    console.log('Inserting project:', testProject);

    const { data, error } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
      .single();

    return NextResponse.json({ 
      success: !error,
      data: data,
      error: error?.message || null,
      testProject: testProject,
      message: 'Test project creation'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}
