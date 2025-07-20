import { NextRequest, NextResponse } from 'next/server';
import { supabase, isValidEmailDomain } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      if (data.user) {
        // Validate email domain
        if (!isValidEmailDomain(data.user.email || '')) {
          // Sign out the user and redirect with error
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=invalid_domain`);
        }

        // Check if user profile exists
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Error checking user profile:', userError);
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        // If user doesn't exist, redirect to setup
        if (!existingUser) {
          return NextResponse.redirect(`${origin}/auth/setup`);
        }

        // User exists, redirect to dashboard or next page
        const redirectTo = existingUser.role === 'teacher' ? '/teacher' : '/projects';
        return NextResponse.redirect(`${origin}${next !== '/' ? next : redirectTo}`);
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  // No code provided, redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
