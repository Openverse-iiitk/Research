import { NextRequest, NextResponse } from 'next/server';
import { supabase, isValidEmailDomain } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log('Auth callback received:', { code: !!code, searchParams: Object.fromEntries(searchParams) });

  if (code) {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/login?error=auth_failed&details=${encodeURIComponent(error.message)}`);
      }

      if (data.user) {
        console.log('User authenticated:', { email: data.user.email, id: data.user.id });
        
        // Validate email domain
        if (!isValidEmailDomain(data.user.email || '')) {
          console.log('Invalid domain for email:', data.user.email);
          // Sign out the user and redirect with error
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=invalid_domain&email=${encodeURIComponent(data.user.email || '')}`);
        }

        // Check if user profile exists
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log('User lookup result:', { existingUser: !!existingUser, userError: userError?.message });

        if (userError && userError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Error checking user profile:', userError);
          return NextResponse.redirect(`${origin}/login?error=db_error&details=${encodeURIComponent(userError.message)}`);
        }

        // If user doesn't exist, redirect to setup
        if (!existingUser) {
          console.log('User not found, redirecting to setup');
          return NextResponse.redirect(`${origin}/auth/setup`);
        }

        // User exists, redirect to dashboard or next page
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
