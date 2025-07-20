import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/applications - Get applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const studentId = searchParams.get('studentId');
    const teacherId = searchParams.get('teacherId');
    const status = searchParams.get('status');

    // Get the current user from Supabase auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('applications')
      .select(`
        *,
        projects:project_id (
          title,
          author_name,
          author_email,
          deadline
        )
      `);

    // Filter based on parameters
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (teacherId) {
      // Get applications for projects owned by this teacher
      query = query.eq('teacher_id', teacherId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // If no specific filters, show only applications related to the current user
    if (!projectId && !studentId && !teacherId) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userProfile?.role === 'student') {
        query = query.eq('student_id', user.id);
      } else if (userProfile?.role === 'teacher') {
        query = query.eq('teacher_id', user.id);
      }
    }

    // Order by applied_at desc
    query = query.order('applied_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/applications - Create a new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      project_id, 
      cover_letter, 
      skills, 
      resume_url 
    } = body;

    // Get the current user from Supabase auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile and check if user is a student
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (userProfile.role !== 'student') {
      return NextResponse.json({ error: 'Only students can submit applications' }, { status: 403 });
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.status !== 'active') {
      return NextResponse.json({ error: 'Project is not accepting applications' }, { status: 400 });
    }

    // Check if student has already applied to this project
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', user.id)
      .eq('project_id', project_id)
      .single();

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this project' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        student_id: user.id,
        student_email: userProfile.email,
        student_name: userProfile.name,
        student_phone: userProfile.phone || '',
        student_year: userProfile.year || '',
        student_gpa: userProfile.gpa || 0,
        project_id,
        project_title: project.title,
        teacher_id: project.author_id,
        teacher_email: project.author_email,
        cover_letter,
        skills: skills || [],
        resume_url: resume_url || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
