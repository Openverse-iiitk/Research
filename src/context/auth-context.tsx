"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isValidEmailDomain, validateEmailDomain } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Helper function to get the correct URL for different environments
const getURL = () => {
  // In the browser, always use the current domain to prevent redirecting to build URLs
  if (typeof window !== 'undefined') {
    return window.location.origin + '/';
  }
  
  // For server-side rendering, use environment variables
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    (process.env.NODE_ENV === 'production' ? 'https://research-iiitk.vercel.app/' : 'http://localhost:3000/');
  url = url.includes('http') ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

type UserRole = 'student' | 'teacher' | 'admin';

interface CustomUser {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  name: string;
  department?: string;
  phone?: string;
  profile_image_url?: string;
  email_verified: boolean;
  is_active: boolean;
}

interface AuthContextType {
  user: CustomUser | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; needsSetup?: boolean }>;
  signInWithPassword: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string, role: UserRole, department?: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  setupUsernamePassword: (username: string, password: string, name: string, role: UserRole, department?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<CustomUser>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        
        if (!isMounted) {
          return;
        }
        
        setSession(session);
        setCurrentSessionId(session?.access_token || null);
        
        if (session?.user) {
          console.log('Fetching user profile for session user:', session.user.email);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No session user, clearing user state');
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setCurrentSessionId(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with race condition prevention
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
        
        if (!isMounted || isProcessingAuth) {
          console.log('Skipping auth change - not mounted or already processing');
          return;
        }
        
        // Skip if this is the same session we already processed
        const newSessionId = session?.access_token || null;
        if (newSessionId === currentSessionId && event !== 'SIGNED_OUT') {
          console.log('Skipping duplicate session processing');
          return;
        }
        
        setIsProcessingAuth(true);
        setCurrentSessionId(newSessionId);
        
        try {
          setSession(session);
          
          if (session?.user) {
            console.log('Auth change: Fetching user profile for:', session.user.email);
            await fetchUserProfile(session.user.id);
          } else {
            console.log('Auth change: No user, clearing state');
            setUser(null);
          }
        } catch (error) {
          console.error('Error processing auth state change:', error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
            setIsProcessingAuth(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove isInitialized dependency to prevent loops

  // Handle post-login redirects based on user role
  useEffect(() => {
    if (!isLoading && user && session && isInitialized) {
      const currentPath = window.location.pathname;
      
      // Only redirect if user is currently on login or register page
      if (currentPath === '/login' || currentPath === '/register') {
        const redirectPath = getRedirectPath(user.role);
        console.log(`Redirecting ${user.role} user to ${redirectPath}`);
        
        // Use replace to avoid adding to history stack
        setTimeout(() => {
          router.replace(redirectPath);
        }, 100); // Small delay to ensure state is settled
      }
    }
  }, [user, session, isLoading, isInitialized, router]);

  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/projects'; // Students go to projects page to find opportunities
      case 'admin':
        return '/teacher'; // Admins can access teacher dashboard
      default:
        return '/projects';
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      // First, get the email from Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser?.user?.email) {
        console.error('Error getting auth user:', authError);
        return;
      }

      console.log('Looking up user profile for:', authUser.user.email, 'with auth ID:', userId);

      // Try to find user by auth ID first (most reliable)
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // If not found by ID, try by email
      if (error?.code === 'PGRST116') {
        const { data: emailData, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.user.email)
          .single();
        
        data = emailData;
        error = emailError;
      }

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If user doesn't exist in custom table, create them
        if (error.code === 'PGRST116') {
          console.log('User not found in custom table, creating...');
          await createUserFromAuth(authUser.user);
          return;
        }
        
        // For other errors, create a basic user object from auth data
        console.log('Database error, creating basic user from auth data');
        
        // Determine role based on email format (numbers in prefix = student, no numbers = teacher)
        const emailPrefix = authUser.user.email?.split('@')[0] || '';
        const hasNumberBeforeAt = /\d/.test(emailPrefix);
        const defaultRole = hasNumberBeforeAt ? 'student' : 'teacher';
        
        const basicUser: CustomUser = {
          id: authUser.user.id,
          email: authUser.user.email,
          username: authUser.user.email.split('@')[0],
          role: defaultRole,
          name: authUser.user.user_metadata?.full_name || authUser.user.email.split('@')[0],
          department: 'Unknown',
          phone: undefined,
          profile_image_url: undefined,
          email_verified: Boolean(authUser.user.email_confirmed_at),
          is_active: true
        };
        setUser(basicUser);
        return;
      }

      if (data) {
        console.log('User profile found:', data);
        const userData = {
          id: data.id,
          email: data.email,
          username: data.username,
          role: data.role,
          name: data.name,
          department: data.department,
          phone: data.phone,
          profile_image_url: data.profile_image_url,
          email_verified: data.email_verified,
          is_active: data.is_active
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const createUserFromAuth = async (authUser: any) => {
    try {
      console.log('Creating user from auth:', authUser.email);
      
      // Check if user already exists to prevent duplicate creation
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (existingUser) {
        console.log('User already exists, updating state');
        const userData = {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          role: existingUser.role,
          name: existingUser.name,
          department: existingUser.department,
          phone: existingUser.phone,
          profile_image_url: existingUser.profile_image_url,
          email_verified: existingUser.email_verified,
          is_active: existingUser.is_active
        };
        setUser(userData);
        return;
      }
      
      // Determine role based on email format (numbers in prefix = student, no numbers = teacher)
      const emailPrefix = authUser.email?.split('@')[0] || '';
      const hasNumberBeforeAt = /\d/.test(emailPrefix);
      const defaultRole = hasNumberBeforeAt ? 'student' : 'teacher';
      
      // Check if this is one of our test users or apply the number-based rule
      let userData: any = {
        id: authUser.id,
        email: authUser.email,
        username: authUser.email?.split('@')[0] || 'user',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        role: defaultRole,
        department: 'Computer Science',
        email_verified: Boolean(authUser.email_confirmed_at),
        is_active: true
      };

      // Match with existing test users
      if (authUser.email === 'student.test@iiitkottayam.ac.in') {
        userData = {
          ...userData,
          username: 'teststudent',
          name: 'Test Student',
          role: 'student'
        };
      } else if (authUser.email === 'teacher.test@iiitkottayam.ac.in') {
        userData = {
          ...userData,
          username: 'testteacher',
          name: 'Dr. Test Teacher',
          role: 'teacher'
        };
      } else if (authUser.email === 'admin.test@iiitkottayam.ac.in') {
        userData = {
          ...userData,
          username: 'testadmin',
          name: 'Test Admin',
          role: 'admin'
        };
      }

      // Use upsert to handle race conditions
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating user:', error);
        
        // If upsert failed, try to fetch the user that might have been created by another process
        const { data: fallbackUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (fallbackUser) {
          console.log('Found user created by another process');
          const userData = {
            id: fallbackUser.id,
            email: fallbackUser.email,
            username: fallbackUser.username,
            role: fallbackUser.role,
            name: fallbackUser.name,
            department: fallbackUser.department,
            phone: fallbackUser.phone,
            profile_image_url: fallbackUser.profile_image_url,
            email_verified: fallbackUser.email_verified,
            is_active: fallbackUser.is_active
          };
          setUser(userData);
        }
        return;
      }

      if (data) {
        console.log('User created/updated successfully:', data);
        const userData = {
          id: data.id,
          email: data.email,
          username: data.username,
          role: data.role,
          name: data.name,
          department: data.department,
          phone: data.phone,
          profile_image_url: data.profile_image_url,
          email_verified: data.email_verified,
          is_active: data.is_active
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in createUserFromAuth:', error);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string; needsSetup?: boolean }> => {
    try {
      console.log('OAuth flow starting...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${getURL()}auth/callback`,
        },
      });

      if (error) {
        console.error('OAuth initiation error:', error);
        throw error;
      }

      console.log('OAuth initiation successful, redirecting to Google...');
      return { success: true };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with Google' 
      };
    }
  };

  const signInWithPassword = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, get the email from username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Invalid username or password' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Password sign-in error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in' 
      };
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate email domain
      const domainError = validateEmailDomain(email);
      if (domainError) {
        return { success: false, error: domainError };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in' 
      };
    }
  };

  const signUpWithEmail = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    department?: string
  ): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    try {
      // Validate email domain
      const domainError = validateEmailDomain(email);
      if (domainError) {
        return { success: false, error: domainError };
      }

      // Get the proper redirect URL based on environment
      const getRedirectURL = () => {
        const { origin } = window.location;
        return `${origin}/auth/callback`;
      };

      const redirectTo = getRedirectURL();

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

      if (error) {
        throw error;
      }

      if (data.user && !data.session) {
        // Email confirmation required
        return { 
          success: true, 
          needsConfirmation: true 
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign up' 
      };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate email domain
      const domainError = validateEmailDomain(email);
      if (domainError) {
        return { success: false, error: domainError };
      }

      // Get the proper redirect URL for password reset
      const getRedirectURL = () => {
        const { origin } = window.location;
        return `${origin}/auth/reset-password`;
      };

      const redirectTo = getRedirectURL();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to reset password' 
      };
    }
  };

  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Password update error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update password' 
      };
    }
  };

  const setupUsernamePassword = async (
    username: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    department?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!session?.user?.email) {
        return { success: false, error: 'No authenticated session found' };
      }

      // Validate email domain
      const domainError = validateEmailDomain(session.user.email);
      if (domainError) {
        return { success: false, error: domainError };
      }

      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUser) {
        return { success: false, error: 'Username is already taken' };
      }

      // Update password in Supabase Auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password
      });

      if (passwordError) {
        throw passwordError;
      }

      // Create/update user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          username: username,
          name: name,
          role: role,
          department: department,
          google_uid: session.user.id,
          email_verified: true,
          is_active: true
        });

      if (profileError) {
        throw profileError;
      }

      // Refresh user profile
      await fetchUserProfile(session.user.id);

      return { success: true };
    } catch (error: any) {
      console.error('Setup username/password error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to setup account' 
      };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<CustomUser>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user?.id) {
        return { success: false, error: 'No user logged in' };
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Refresh user profile
      await fetchUserProfile(user.id);

      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoggedIn: !!session && !!user,
    isLoading,
    signInWithGoogle,
    signInWithPassword,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    updatePassword,
    setupUsernamePassword,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};