import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllPosts } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    // Since this is server-side, we can only check Supabase database
    // localStorage is not available on the server
    
    // Get posts from Supabase
    const { data: supabasePosts, error } = await supabase
      .from('projects')
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
    }
    
    return NextResponse.json({
      note: 'localStorage is not available on server-side, showing only Supabase data',
      supabase: {
        count: supabasePosts?.length || 0,
        posts: supabasePosts?.map((p: any) => ({
          id: p.id,
          title: p.title,
          author_email: p.author_email,
          author_name: p.author_name,
          status: p.status
        })) || [],
        error: error?.message
      }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch debug info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
