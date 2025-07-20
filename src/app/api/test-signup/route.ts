import { NextRequest, NextResponse } from 'next/server';
import { supabase, validateEmailDomain } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, department } = await request.json();
    
    console.log('Test signup request:', { email, name, role, department });
    
    // Validate email domain
    const domainError = validateEmailDomain(email);
    if (domainError) {
      return NextResponse.json({
        success: false,
        error: domainError,
        step: 'domain_validation'
      });
    }

    // Get the proper redirect URL based on environment
    const { origin } = new URL(request.url);
    const redirectTo = `${origin}/auth/callback`;
    
    console.log('Signup redirect URL:', redirectTo);

    // Sign up with email confirmation
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          name: name,
          role: role,
          department: department,
        }
      }
    });

    console.log('Supabase signup response:', { 
      data: data ? {
        user: !!data.user,
        session: !!data.session,
        userId: data.user?.id,
        email: data.user?.email,
        confirmed: data.user?.email_confirmed_at
      } : null,
      error: error ? {
        message: error.message,
        status: error.status
      } : null
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        step: 'supabase_signup',
        details: error
      });
    }

    if (data.user && !data.session) {
      // Email confirmation required
      return NextResponse.json({ 
        success: true, 
        needsConfirmation: true,
        userId: data.user.id,
        step: 'email_confirmation_required'
      });
    }

    if (data.user && data.session) {
      // User logged in immediately (email confirmation disabled)
      return NextResponse.json({ 
        success: true, 
        needsConfirmation: false,
        userId: data.user.id,
        step: 'immediate_login'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unexpected response from Supabase',
      step: 'unexpected_response',
      data
    });

  } catch (error) {
    console.error('Test signup error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      step: 'server_error'
    });
  }
}
