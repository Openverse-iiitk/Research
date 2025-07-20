-- Supabase Storage Setup for Research Connect
-- Run this in your Supabase SQL Editor after setting up the main schema

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('blog-pdfs', 'blog-pdfs', false),
  ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for blog PDFs (private bucket)
CREATE POLICY "Blog PDFs are accessible to authenticated users" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'blog-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Authors can upload blog PDFs" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'blog-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authors can update own blog PDFs" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'blog-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authors can delete own blog PDFs" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'blog-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for resumes (private bucket)
CREATE POLICY "Users can access own resumes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Teachers can access resumes of applicants to their projects" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'resumes' AND 
  EXISTS (
    SELECT 1 FROM applications a 
    JOIN projects p ON a.project_id = p.id 
    WHERE p.author_id = auth.uid() 
    AND storage.filename(name) = split_part(a.resume_url, '/', -1)
  )
);

CREATE POLICY "Students can upload resumes" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'student')
);

CREATE POLICY "Students can update own resumes" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can delete own resumes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update users table to ensure proper constraints
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT check_email_domain 
  CHECK (email LIKE '%@iiitkottayam.ac.in');

-- Add some useful indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_google_uid ON users(google_uid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_author_id ON projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_teacher_id ON applications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at);

CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- Enable realtime for tables (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
