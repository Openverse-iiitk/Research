import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser use (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'student' | 'teacher';
          name: string;
          department?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'student' | 'teacher';
          name: string;
          department?: string;
        };
        Update: {
          email?: string;
          role?: 'student' | 'teacher';
          name?: string;
          department?: string;
          updated_at?: string;
        };
      };
      posts: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
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
          views?: number;
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
          student_gpa: string;
          post_id: string;
          post_title: string;
          teacher_email: string;
          skills: string;
          reason: string;
          resume_url?: string;
          status: 'pending' | 'accepted' | 'rejected';
          applied_date: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          student_email: string;
          student_name: string;
          student_phone: string;
          student_year: string;
          student_gpa: string;
          post_id: string;
          post_title: string;
          teacher_email: string;
          skills: string;
          reason: string;
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
          tags: string[];
          published?: boolean;
          read_time: number;
        };
        Update: {
          title?: string;
          content?: string;
          excerpt?: string;
          tags?: string[];
          published?: boolean;
          read_time?: number;
          updated_at?: string;
        };
      };
    };
  };
}
