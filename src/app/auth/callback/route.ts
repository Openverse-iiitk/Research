import { NextRequest, NextResponse } from 'next/server';
import { supabase, isValidEmailDomain } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const testMode = searchParams.get('test');
  const next = searchParams.get('next') ?? '/';

  console.log('Auth callback received:', { 
    code: !!code, 
    error,
    error_description,
    testMode,
    origin,
    url: request.url,
    searchParams: Object.fromEntries(searchParams),
    userAgent: request.headers.get('user-agent')
  });

  // Handle test mode
  if (testMode === 'true') {
    console.log('Test mode detected - simulating OAuth flow');
    return NextResponse.redirect(`${origin}/login?message=oauth_test_completed&details=OAuth flow configuration appears correct`);
  }

  if (code) {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/login?error=auth_failed&details=${encodeURIComponent(error.message)}`);
      }

      if (data.user && data.session) {
        console.log('User authenticated:', { 
          email: data.user.email, 
          id: data.user.id,
          provider: data.user.app_metadata?.provider 
        });
        
        // Validate email domain
        if (!isValidEmailDomain(data.user.email || '')) {
          console.log('Invalid domain for email:', data.user.email);
          // Sign out the user and redirect with error
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=invalid_domain&email=${encodeURIComponent(data.user.email || '')}`);
        }

        // Check if user profile exists in our database
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log('User lookup result:', { 
          existingUser: !!existingUser, 
          userError: userError?.message,
          errorCode: userError?.code 
        });

        if (userError && userError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Error checking user profile:', userError);
          return NextResponse.redirect(`${origin}/login?error=db_error&details=${encodeURIComponent(userError.message)}`);
        }

        // If user doesn't exist in our database, create a basic profile
        if (!existingUser) {
          console.log('User not found in database, creating basic profile');
          
          try {
            // Get user metadata from signup data or fallback to defaults
            const userName = data.user.user_metadata?.name || 
                           data.user.user_metadata?.full_name || 
                           data.user.email?.split('@')[0] || 
                           'Unknown User';
            const userRole = data.user.user_metadata?.role || 'student';
            const userDepartment = data.user.user_metadata?.department;

            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email,
                name: userName,
                role: userRole,
                department: userDepartment,
                google_uid: data.user.app_metadata?.provider === 'google' ? data.user.id : null,
                email_verified: true,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Error creating user profile:', insertError);
              // Don't fail the auth flow, just redirect to setup
              console.log('Profile creation failed, redirecting to setup');
              return NextResponse.redirect(`${origin}/auth/setup`);
            }

            console.log('Basic user profile created successfully');
            // Redirect to setup to complete profile (username, role, etc.)
            return NextResponse.redirect(`${origin}/auth/setup`);
          } catch (createError) {
            console.error('Unexpected error creating user profile:', createError);
            return NextResponse.redirect(`${origin}/auth/setup`);
          }
        }

        // User exists, check if they need to complete setup
        if (!existingUser.username || !existingUser.name) {
          console.log('User exists but profile incomplete, redirecting to setup');
          return NextResponse.redirect(`${origin}/auth/setup`);
        }

        // User exists and profile is complete, redirect to dashboard
        const redirectTo = existingUser.role === 'teacher' ? '/teacher' : '/projects';
        console.log('Login successful, redirecting to:', redirectTo);
        return NextResponse.redirect(`${origin}${next !== '/' ? next : redirectTo}`);
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=unexpected&details=${encodeURIComponent(String(error))}`);
    }
  }

  // Handle OAuth errors from Google
  if (error) {
    console.log('OAuth error received:', { error, error_description });
    return NextResponse.redirect(`${origin}/login?error=oauth_error&details=${encodeURIComponent(error_description || error)}`);
  }

  // No code provided, redirect to error page
  console.log('No auth code provided - this usually means redirect URL mismatch in Google OAuth settings');
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
