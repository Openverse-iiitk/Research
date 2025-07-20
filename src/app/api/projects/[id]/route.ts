import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ProjectRouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Get a specific project
export async function GET(request: NextRequest, { params }: ProjectRouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Increment views
    await supabase
      .from('projects')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id);

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request: NextRequest, { params }: ProjectRouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      description, 
      requirements, 
      duration, 
      location, 
      max_students, 
      deadline, 
      stipend, 
      status,
      tags 
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

    // Check if the user is the author of this project
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (existingProject.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        title,
        description,
        requirements: requirements || [],
        duration,
        location,
        max_students: max_students || 1,
        deadline,
        stipend,
        status,
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: NextRequest, { params }: ProjectRouteParams) {
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

    // Check if the user is the author of this project
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (existingProject.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete related applications first (cascade should handle this, but being explicit)
    await supabase
      .from('applications')
      .delete()
      .eq('project_id', id);

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
