import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: any) {
            try {
              cookiesToSet.forEach(({ name, value, options }: any) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('OAuth callback error:', error);
        // Redirect to login with error
        return NextResponse.redirect(new URL('/login?error=oauth_callback_failed', request.url));
      }

      if (data?.session?.user) {
        console.log('OAuth callback successful for user:', data.session.user.email);
        
        // Add a small delay to allow the auth state change to propagate
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('OAuth callback exception:', error);
      return NextResponse.redirect(new URL('/login?error=oauth_callback_failed', request.url));
    }
  }

  // Ensure the redirect path is internal and safe
  const safePath = next.startsWith('/') ? next : '/';
  
  // Use relative redirect to stay within the same domain
  return NextResponse.redirect(new URL(safePath, request.url));
}
