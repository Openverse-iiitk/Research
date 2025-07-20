import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/blog - Get all published blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const author = searchParams.get('author');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    let query = supabase
      .from('blog_posts')
      .select('*');

    // Filter by published status unless explicitly including unpublished
    if (!includeUnpublished) {
      query = query.eq('published', true);
    }

    // Filter by author
    if (author) {
      query = query.eq('author_email', author);
    }

    // Filter by tag
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Search in title and content
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching blog posts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/blog - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, tags, published, pdf_url } = body;

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

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Calculate read time (assuming 200 words per minute)
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        content,
        excerpt,
        author_id: user.id,
        author_email: userProfile.email,
        author_name: userProfile.name,
        tags: tags || [],
        published: published || false,
        read_time: readTime,
        pdf_url: pdf_url || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
