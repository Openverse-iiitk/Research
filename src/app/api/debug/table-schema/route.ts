import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to select all columns from projects table to see what exists
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    return NextResponse.json({ 
      sample_project: data?.[0] || null,
      available_columns: data?.[0] ? Object.keys(data[0]) : [],
      error: error?.message || null,
      message: 'Projects table sample and available columns'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
