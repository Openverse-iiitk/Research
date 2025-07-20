import { supabase } from './supabase';
import { Database } from './supabase';

// Type aliases for better readability
type User = Database['public']['Tables']['users']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Application = Database['public']['Tables']['applications']['Row'];
type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

// User operations
export const userAPI = {
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data;
  },

  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
    
    return data;
  },

  async getByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
    
    return data;
  },

  async create(userData: Database['public']['Tables']['users']['Insert']): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['users']['Update']): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data;
  }
};

// Project operations
export const projectAPI = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    
    return data || [];
  },

  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }
    
    return data;
  },

  async getByAuthor(authorId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects by author:', error);
      return [];
    }
    
    return data || [];
  },

  async create(projectData: Database['public']['Tables']['projects']['Insert']): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['projects']['Update']): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      return null;
    }
    
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    
    return true;
  },

  async incrementViews(id: string): Promise<void> {
    await supabase.rpc('increment_project_views', { project_id: id });
  }
};

// Application operations
export const applicationAPI = {
  async getByStudent(studentId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        projects!inner(title, author_name, deadline)
      `)
      .eq('student_id', studentId)
      .order('applied_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching applications by student:', error);
      return [];
    }
    
    return data || [];
  },

  async getByTeacher(teacherId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        projects!inner(title)
      `)
      .eq('teacher_id', teacherId)
      .order('applied_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching applications by teacher:', error);
      return [];
    }
    
    return data || [];
  },

  async getByProject(projectId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('project_id', projectId)
      .order('applied_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching applications by project:', error);
      return [];
    }
    
    return data || [];
  },

  async create(applicationData: Database['public']['Tables']['applications']['Insert']): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating application:', error);
      return null;
    }
    
    return data;
  },

  async updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected'): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating application status:', error);
      return null;
    }
    
    return data;
  },

  async checkExistingApplication(studentId: string, projectId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', studentId)
      .eq('project_id', projectId)
      .single();
    
    return !error && !!data;
  }
};

// Blog post operations
export const blogAPI = {
  async getPublished(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching published blog posts:', error);
      return [];
    }
    
    return data || [];
  },

  async getById(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
    
    return data;
  },

  async getByAuthor(authorId: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching blog posts by author:', error);
      return [];
    }
    
    return data || [];
  },

  async create(blogData: Database['public']['Tables']['blog_posts']['Insert']): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(blogData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating blog post:', error);
      return null;
    }
    
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['blog_posts']['Update']): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating blog post:', error);
      return null;
    }
    
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
    
    return true;
  },

  async incrementViews(id: string): Promise<void> {
    await supabase.rpc('increment_blog_views', { blog_id: id });
  }
};

// File upload operations
export const fileAPI = {
  async uploadFile(bucket: string, path: string, file: File): Promise<{ url: string | null; error: string | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        return { url: null, error: error.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { url: publicUrl, error: null };
    } catch (error: any) {
      console.error('Unexpected error uploading file:', error);
      return { url: null, error: error.message };
    }
  },

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  },

  async getFileUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
};

// Utility functions for file validation
export const fileValidation = {
  validatePDF(file: File): { valid: boolean; error?: string } {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'File must be a PDF' };
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      return { valid: false, error: 'File size must be less than 2MB' };
    }
    
    return { valid: true };
  },

  validateImage(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be JPEG, PNG, or WebP' };
    }
    
    if (file.size > 1 * 1024 * 1024) { // 1MB limit
      return { valid: false, error: 'File size must be less than 1MB' };
    }
    
    return { valid: true };
  }
};
