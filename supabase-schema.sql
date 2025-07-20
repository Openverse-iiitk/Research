-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create users table with comprehensive auth support
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT,
  google_uid TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  name TEXT NOT NULL,
  department TEXT,
  phone TEXT,
  profile_image_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create research projects table (renamed from posts for clarity)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL, -- Markdown content
  requirements TEXT[] DEFAULT '{}',
  duration TEXT NOT NULL,
  location TEXT NOT NULL,
  max_students INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  department TEXT NOT NULL,
  deadline DATE NOT NULL,
  stipend TEXT,
  views INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  student_year TEXT NOT NULL,
  student_gpa DECIMAL(3,2),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_email TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  cover_letter TEXT NOT NULL, -- Markdown content
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown content
  excerpt TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  read_time INTEGER DEFAULT 5,
  views INTEGER DEFAULT 0,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  duration TEXT NOT NULL,
  location TEXT NOT NULL,
  max_students INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  department TEXT NOT NULL,
  deadline DATE NOT NULL,
  stipend TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  student_year TEXT NOT NULL,
  student_gpa TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  post_title TEXT NOT NULL,
  teacher_email TEXT NOT NULL,
  skills TEXT NOT NULL,
  reason TEXT NOT NULL,
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  applied_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  read_time INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for projects table
CREATE POLICY "Anyone can view published projects" ON projects FOR SELECT USING (status = 'active');
CREATE POLICY "Teachers can view own projects" ON projects FOR SELECT USING (author_id::text = auth.uid()::text);
CREATE POLICY "Teachers can create projects" ON projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'teacher')
  AND author_id::text = auth.uid()::text
);
CREATE POLICY "Teachers can update own projects" ON projects FOR UPDATE USING (author_id::text = auth.uid()::text);
CREATE POLICY "Teachers can delete own projects" ON projects FOR DELETE USING (author_id::text = auth.uid()::text);

-- Create RLS policies for applications table
CREATE POLICY "Students can view own applications" ON applications FOR SELECT USING (student_id::text = auth.uid()::text);
CREATE POLICY "Teachers can view applications to their projects" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = applications.project_id AND author_id::text = auth.uid()::text)
);
CREATE POLICY "Students can create applications" ON applications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'student')
  AND student_id::text = auth.uid()::text
);
CREATE POLICY "Teachers can update application status" ON applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE id = applications.project_id AND author_id::text = auth.uid()::text)
);

-- Create RLS policies for blog_posts table
CREATE POLICY "Anyone can view published blog posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Authors can view own blog posts" ON blog_posts FOR SELECT USING (author_id::text = auth.uid()::text);
CREATE POLICY "Users can create blog posts" ON blog_posts FOR INSERT WITH CHECK (author_id::text = auth.uid()::text);
CREATE POLICY "Authors can update own blog posts" ON blog_posts FOR UPDATE USING (author_id::text = auth.uid()::text);
CREATE POLICY "Authors can delete own blog posts" ON blog_posts FOR DELETE USING (author_id::text = auth.uid()::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_google_uid ON users(google_uid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_author_id ON projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_department ON projects(department);

CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_teacher_id ON applications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to increment project views
CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE projects 
    SET views = views + 1 
    WHERE id = project_id;
END;
$$ language 'plpgsql';

-- Create function to increment blog post views
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE blog_posts 
    SET views = views + 1 
    WHERE id = blog_id;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets for file uploads (run these via Supabase dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog-pdfs', 'blog-pdfs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Create storage policies (to be run after buckets are created)
-- Storage policies for avatars (public bucket)
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload avatar images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update own avatar images" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own avatar images" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for blog PDFs (private bucket)
-- CREATE POLICY "Blog PDFs are accessible to authenticated users" ON storage.objects FOR SELECT USING (bucket_id = 'blog-pdfs' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authors can upload blog PDFs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for resumes (private bucket)
-- CREATE POLICY "Users can access own resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Teachers can access resumes of applicants to their projects" ON storage.objects FOR SELECT USING (
--   bucket_id = 'resumes' AND 
--   EXISTS (
--     SELECT 1 FROM applications a 
--     JOIN projects p ON a.project_id = p.id 
--     WHERE p.author_id::text = auth.uid()::text 
--     AND storage.filename(name) = split_part(a.resume_url, '/', -1)
--   )
-- );
-- CREATE POLICY "Students can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
