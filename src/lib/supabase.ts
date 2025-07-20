import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Client for browser use (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
// Only create this on the server side
export const supabaseAdmin = typeof window === 'undefined' && supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : null;

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username?: string;
          password_hash?: string;
          google_uid?: string;
          role: 'student' | 'teacher' | 'admin';
          name: string;
          department?: string;
          phone?: string;
          profile_image_url?: string;
          email_verified: boolean;
          is_active: boolean;
          last_login_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string;
          password_hash?: string;
          google_uid?: string;
          role?: 'student' | 'teacher' | 'admin';
          name: string;
          department?: string;
          phone?: string;
          profile_image_url?: string;
          email_verified?: boolean;
          is_active?: boolean;
          last_login_at?: string;
        };
        Update: {
          email?: string;
          username?: string;
          password_hash?: string;
          google_uid?: string;
          role?: 'student' | 'teacher' | 'admin';
          name?: string;
          department?: string;
          phone?: string;
          profile_image_url?: string;
          email_verified?: boolean;
          is_active?: boolean;
          last_login_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          requirements: string[];
          duration: string;
          location: string;
          max_students: number;
          status: 'draft' | 'active' | 'closed';
          author_id: string;
          author_email: string;
          author_name: string;
          department: string;
          deadline: string;
          stipend?: string;
          views: number;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          requirements?: string[];
          duration: string;
          location: string;
          max_students?: number;
          status?: 'draft' | 'active' | 'closed';
          author_id: string;
          author_email: string;
          author_name: string;
          department: string;
          deadline: string;
          stipend?: string;
          views?: number;
          tags?: string[];
        };
        Update: {
          title?: string;
          description?: string;
          requirements?: string[];
          duration?: string;
          location?: string;
          max_students?: number;
          status?: 'draft' | 'active' | 'closed';
          deadline?: string;
          stipend?: string;
          views?: number;
          tags?: string[];
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          student_id: string;
          student_email: string;
          student_name: string;
          student_phone: string;
          student_year: string;
          student_gpa: number;
          project_id: string;
          project_title: string;
          teacher_id: string;
          teacher_email: string;
          skills: string[];
          cover_letter: string;
          resume_url?: string;
          status: 'pending' | 'accepted' | 'rejected';
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          student_email: string;
          student_name: string;
          student_phone: string;
          student_year: string;
          student_gpa: number;
          project_id: string;
          project_title: string;
          teacher_id: string;
          teacher_email: string;
          skills?: string[];
          cover_letter: string;
          resume_url?: string;
          status?: 'pending' | 'accepted' | 'rejected';
        };
        Update: {
          status?: 'pending' | 'accepted' | 'rejected';
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string;
          author_id: string;
          author_email: string;
          author_name: string;
          tags: string[];
          published: boolean;
          read_time: number;
          views: number;
          pdf_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt: string;
          author_id: string;
          author_email: string;
          author_name: string;
          tags?: string[];
          published?: boolean;
          read_time?: number;
          views?: number;
          pdf_url?: string;
        };
        Update: {
          title?: string;
          content?: string;
          excerpt?: string;
          tags?: string[];
          published?: boolean;
          read_time?: number;
          views?: number;
          pdf_url?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Utility functions for domain restriction
export const ALLOWED_EMAIL_DOMAIN = '@iiitkottayam.ac.in';

export function isValidEmailDomain(email: string): boolean {
  return email.endsWith(ALLOWED_EMAIL_DOMAIN);
}

export function validateEmailDomain(email: string): string | null {
  if (!isValidEmailDomain(email)) {
    return `Only ${ALLOWED_EMAIL_DOMAIN} email addresses are allowed.`;
  }
  return null;
}
