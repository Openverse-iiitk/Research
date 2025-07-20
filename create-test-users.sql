-- Test Users Creation Script
-- Run this in your Supabase SQL Editor or via psql

-- Create a test student user
INSERT INTO users (
  email,
  username, 
  name,
  role,
  department,
  phone,
  email_verified,
  is_active
) VALUES (
  'student.test@iiitkottayam.ac.in',
  'teststudent',
  'Test Student',
  'student',
  'Computer Science',
  '+91-9876543210',
  true,
  true
) ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  phone = EXCLUDED.phone,
  email_verified = EXCLUDED.email_verified,
  is_active = EXCLUDED.is_active;

-- Create a test teacher user
INSERT INTO users (
  email,
  username,
  name, 
  role,
  department,
  phone,
  email_verified,
  is_active
) VALUES (
  'teacher.test@iiitkottayam.ac.in',
  'testteacher',
  'Dr. Test Teacher',
  'teacher',
  'Computer Science',
  '+91-9876543211',
  true,
  true
) ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  phone = EXCLUDED.phone,
  email_verified = EXCLUDED.email_verified,
  is_active = EXCLUDED.is_active;

-- Create an admin user for testing
INSERT INTO users (
  email,
  username,
  name,
  role,
  department, 
  phone,
  email_verified,
  is_active
) VALUES (
  'admin.test@iiitkottayam.ac.in',
  'testadmin',
  'Test Admin',
  'admin',
  'Administration',
  '+91-9876543212',
  true,
  true
) ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  phone = EXCLUDED.phone,
  email_verified = EXCLUDED.email_verified,
  is_active = EXCLUDED.is_active;

-- Verify the users were created
SELECT id, email, username, name, role, department, email_verified, is_active, created_at 
FROM users 
WHERE email LIKE '%.test@iiitkottayam.ac.in'
ORDER BY role, email;
