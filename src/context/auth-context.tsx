"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isValidEmailDomain, validateEmailDomain } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  setupUsernamePassword: (username: string, password: string, name: string, role: UserRole, department?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<CustomUser>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUser({
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
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string; needsSetup?: boolean }> => {
    try {
      // Get the proper redirect URL based on environment
      const getRedirectURL = () => {
        // Use the configured app URL or window origin as fallback
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        return `${appUrl}/auth/callback`;
      };

      const redirectTo = getRedirectURL();
      console.log('OAuth redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hd: 'iiitkottayam.ac.in' // Domain hint for Google
          }
        }
      });

      if (error) {
        throw error;
      }

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
