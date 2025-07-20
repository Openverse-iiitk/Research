import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ApplicationRouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/applications/[id] - Get a specific application
export async function GET(request: NextRequest, { params }: ApplicationRouteParams) {
  try {
    const { id } = await params;

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

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        projects:project_id (
          title,
          author_name,
          author_email,
          deadline
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if user has permission to view this application
    if (data.student_id !== user.id && data.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ application: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/applications/[id] - Update application status
export async function PUT(request: NextRequest, { params }: ApplicationRouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

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

    // Get the application and check if user is the teacher
    const { data: existingApplication, error: fetchError } = await supabase
      .from('applications')
      .select('teacher_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (existingApplication.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Only the project teacher can update application status' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ application: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/applications/[id] - Delete an application
export async function DELETE(request: NextRequest, { params }: ApplicationRouteParams) {
  try {
    const { id } = await params;

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

    // Get the application and check if user is the student who submitted it
    const { data: existingApplication, error: fetchError } = await supabase
      .from('applications')
      .select('student_id, resume_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (existingApplication.student_id !== user.id) {
      return NextResponse.json({ error: 'Only the applicant can delete their application' }, { status: 403 });
    }

    // Delete the resume file if it exists
    if (existingApplication.resume_url) {
      const fileName = existingApplication.resume_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('resumes')
          .remove([`${user.id}/${fileName}`]);
      }
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
