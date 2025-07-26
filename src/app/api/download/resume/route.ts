import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/download/resume?applicationId=<id> - Download a resume file for an application
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
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

    // Get user profile and check if user is a teacher
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can download resumes' }, { status: 403 });
    }

    // Get application details with project info to verify teacher access
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        resume_url,
        projects:project_id (
          id,
          author_email
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify that the teacher owns this project
    const project = Array.isArray(application.projects) ? application.projects[0] : application.projects;
    if (!project || project.author_email !== user.email) {
      return NextResponse.json({ error: 'You can only download resumes for your own projects' }, { status: 403 });
    }

    if (!application.resume_url) {
      return NextResponse.json({ error: 'No resume file found for this application' }, { status: 404 });
    }

    // Extract the file path from the resume_url
    // Resume URLs are typically in format: https://...supabase.co/storage/v1/object/public/resumes/user_id/filename
    const urlParts = application.resume_url.split('/');
    const bucketIndex = urlParts.findIndex((part: string) => part === 'resumes');
    
    if (bucketIndex === -1 || bucketIndex + 2 >= urlParts.length) {
      return NextResponse.json({ error: 'Invalid resume URL format' }, { status: 400 });
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Download the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading resume:', downloadError);
      return NextResponse.json({ error: 'Failed to download resume file' }, { status: 500 });
    }

    if (!fileData) {
      return NextResponse.json({ error: 'Resume file not found' }, { status: 404 });
    }

    // Get filename from path
    const fileName = filePath.split('/').pop() || 'resume.pdf';

    // Return the file with appropriate headers
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Unexpected error downloading resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
