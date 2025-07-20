-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  name TEXT NOT NULL,
  department TEXT,
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
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for posts table
CREATE POLICY "Anyone can view published posts" ON posts FOR SELECT USING (status = 'active');
CREATE POLICY "Teachers can view own posts" ON posts FOR SELECT USING (author_id::text = auth.uid()::text);
CREATE POLICY "Teachers can create posts" ON posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'teacher')
);
CREATE POLICY "Teachers can update own posts" ON posts FOR UPDATE USING (author_id::text = auth.uid()::text);
CREATE POLICY "Teachers can delete own posts" ON posts FOR DELETE USING (author_id::text = auth.uid()::text);

-- Create RLS policies for applications table
CREATE POLICY "Students can view own applications" ON applications FOR SELECT USING (student_id::text = auth.uid()::text);
CREATE POLICY "Teachers can view applications to their posts" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM posts WHERE id = applications.post_id AND author_id::text = auth.uid()::text)
);
CREATE POLICY "Students can create applications" ON applications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'student')
  AND student_id::text = auth.uid()::text
);
CREATE POLICY "Teachers can update application status" ON applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = applications.post_id AND author_id::text = auth.uid()::text)
);

-- Create RLS policies for blog_posts table
CREATE POLICY "Anyone can view published blog posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Authors can view own blog posts" ON blog_posts FOR SELECT USING (author_id::text = auth.uid()::text);
CREATE POLICY "Users can create blog posts" ON blog_posts FOR INSERT WITH CHECK (author_id::text = auth.uid()::text);
CREATE POLICY "Authors can update own blog posts" ON blog_posts FOR UPDATE USING (author_id::text = auth.uid()::text);
CREATE POLICY "Authors can delete own blog posts" ON blog_posts FOR DELETE USING (author_id::text = auth.uid()::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_deadline ON posts(deadline);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_post_id ON applications(post_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
