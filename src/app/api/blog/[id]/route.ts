import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface BlogRouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blog/[id] - Get a specific blog post
export async function GET(request: NextRequest, { params }: BlogRouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Increment views
    await supabase
      .from('blog_posts')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id);

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/blog/[id] - Update a blog post
export async function PUT(request: NextRequest, { params }: BlogRouteParams) {
  try {
    const { id } = await params;
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

    // Check if the user is the author of this blog post
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate read time
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        title,
        content,
        excerpt,
        tags: tags || [],
        published: published || false,
        read_time: readTime,
        pdf_url: pdf_url || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/blog/[id] - Delete a blog post
export async function DELETE(request: NextRequest, { params }: BlogRouteParams) {
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

    // Check if the user is the author of this blog post
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('author_id, pdf_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the PDF file if it exists
    if (existingPost.pdf_url) {
      const fileName = existingPost.pdf_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('blog-pdfs')
          .remove([`${user.id}/${fileName}`]);
      }
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
