import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/projects - Get all active projects
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const author = searchParams.get('author');
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search');

    let query = supabase
      .from('projects')
      .select('*');

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by author
    if (author) {
      query = query.eq('author_email', author);
    }

    // Search in title and description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received project creation request:', body);
    
    const { 
      title, 
      description, 
      requirements, 
      duration, 
      location, 
      max_students, 
      deadline, 
      stipend, 
      status = 'draft',
      outcome,
      department,
      tags 
    } = body;

    // Get the current user from Supabase auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Create a Supabase client with the anon key for RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile and check if user is a teacher
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Profile error:', profileError);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (userProfile.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can create projects' }, { status: 403 });
    }

    const projectData = {
      title,
      description,
      requirements: requirements || [],
      duration,
      location,
      max_students: max_students || 1,
      deadline,
      stipend,
      outcome: outcome || null,
      status,
      author_id: user.id,
      author_email: userProfile.email,
      author_name: userProfile.name,
      department: department || userProfile.department || 'Unknown',
      tags: tags || []
    };

    console.log('Inserting project data:', projectData);

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Successfully created project:', data);
    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
