import { NextRequest, NextResponse } from 'next/server';
import { supabase, isValidEmailDomain } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log('Auth callback received:', { 
    code: !!code, 
    origin,
    searchParams: Object.fromEntries(searchParams),
    userAgent: request.headers.get('user-agent')
  });

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
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Unknown User',
                google_uid: data.user.id,
                email_verified: true,
                is_active: true,
                role: 'student', // Default role, user can change this in setup
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

  // No code provided, redirect to error page
  console.log('No auth code provided');
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
