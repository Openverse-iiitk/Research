const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test user data
const testUsers = [
  {
    email: 'student.test@iiitkottayam.ac.in',
    password: 'TestStudent123!',
    username: 'teststudent',
    name: 'Test Student',
    role: 'student',
    department: 'Computer Science',
    phone: '+91-9876543210'
  },
  {
    email: 'teacher.test@iiitkottayam.ac.in', 
    password: 'TestTeacher123!',
    username: 'testteacher',
    name: 'Dr. Test Teacher',
    role: 'teacher',
    department: 'Computer Science',
    phone: '+91-9876543211'
  },
  {
    email: 'admin.test@iiitkottayam.ac.in',
    password: 'TestAdmin123!',
    username: 'testadmin',
    name: 'Test Admin',
    role: 'admin',
    department: 'Administration',
    phone: '+91-9876543212'
  }
];

async function createTestUsers() {
  console.log('Creating test users with authentication...\n');

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email} (${user.role})`);
      
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          username: user.username,
          name: user.name,
          role: user.role
        }
      });

      if (authError) {
        console.error(`❌ Auth error for ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Auth user created: ${authData.user?.id}`);

      // 2. Create user in custom users table
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: authData.user?.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          department: user.department,
          phone: user.phone,
          email_verified: true,
          is_active: true
        });

      if (dbError) {
        console.error(`❌ Database error for ${user.email}:`, dbError.message);
      } else {
        console.log(`✅ Database user created`);
      }

      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Password: ${user.password}`);
      console.log(`👤 Role: ${user.role}\n`);

    } catch (error) {
      console.error(`❌ Error creating ${user.email}:`, error);
    }
  }

  // Verify users were created
  console.log('\n📋 Verifying created users...');
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, username, name, role, department, email_verified, is_active')
    .like('email', '%.test@iiitkottayam.ac.in')
    .order('role');

  if (error) {
    console.error('❌ Error fetching users:', error);
  } else {
    console.table(users);
  }
}

// Run the script
createTestUsers().catch(console.error);
