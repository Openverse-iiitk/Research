# Test User Credentials

## Quick Answer: Test User Passwords

Since you created the users via SQL, they exist in your database but **not** in Supabase Auth, so they can't log in yet. Here are the credentials for test users:

### 🎓 Student Account
- **Email:** `student.test@iiitkottayam.ac.in`
- **Password:** `TestStudent123!` 
- **Username:** `teststudent`
- **Role:** `student`

### 👨‍🏫 Teacher Account  
- **Email:** `teacher.test@iiitkottayam.ac.in`
- **Password:** `TestTeacher123!`
- **Username:** `testteacher` 
- **Role:** `teacher`

### 👑 Admin Account
- **Email:** `admin.test@iiitkottayam.ac.in`
- **Password:** `TestAdmin123!`
- **Username:** `testadmin`
- **Role:** `admin`

## ⚠️ Important: They Can't Log In Yet!

The SQL script only created database records, but these users don't have authentication credentials in Supabase Auth. To make them actually work:

### Option 1: Create them properly with auth (Recommended)
Run this API endpoint I created: `POST http://localhost:3001/api/create-test-users`

### Option 2: Manual signup via your app
1. Go to your registration page
2. Sign up with the emails above using the passwords
3. The system will link them to existing database records

### Option 3: Use Supabase dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Manually create users with the emails and passwords above
3. The IDs should match your database records

## 🧪 Quick Test
Once they're created properly, you can test:
- Login at: `http://localhost:3001/login`
- Use email + password (not username yet, since email auth is implemented)
- Check different role-based features

## 🔧 Next Steps
1. Fix the OAuth configuration (see oauth-fix-guide.md)
2. Create proper test users with authentication
3. Test all authentication flows (email, OAuth, password reset)
