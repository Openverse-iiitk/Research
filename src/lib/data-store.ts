// Mock database simulation using localStorage
// In a real app, this would be replaced with actual API calls
import { supabase } from './supabase';

export interface TeacherPost {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  duration: string;
  location: string;
  maxStudents: number;
  status: 'draft' | 'active' | 'closed';
  createdDate: string;
  authorEmail: string;
  authorName: string;
  department: string;
  stipend?: string;
  deadline: string;
  applications: StudentApplication[];
  views: number;
}

export interface StudentApplication {
  id: string;
  studentEmail: string;
  studentName: string;
  studentPhone: string;
  projectId: string;
  projectTitle: string;
  appliedDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  coverLetter: string;
  skills: string[];
  gpa: number;
  year: string;
  resumeFile?: File;
  resumeFileName?: string;
}

export interface User {
  email: string;
  role: 'student' | 'teacher';
  name: string;
  phone?: string;
  department?: string;
}

// Local storage keys
const POSTS_KEY = 'research_posts';
const APPLICATIONS_KEY = 'student_applications';
const USERS_KEY = 'users_data';

// Initialize with some sample data if not exists
const initializeData = () => {
  if (!localStorage.getItem(POSTS_KEY)) {
    const samplePosts: TeacherPost[] = [
      {
        id: '1',
        title: 'AI-Powered Medical Diagnosis System',
        description: 'Developing machine learning models for early disease detection using medical imaging data. This project involves working with state-of-the-art deep learning techniques.',
        requirements: ['Python', 'TensorFlow', 'Computer Vision', 'Healthcare'],
        duration: '6 months',
        location: 'AI Lab, IIIT Kottayam',
        maxStudents: 2,
        status: 'active',
        createdDate: '2025-01-10',
        authorEmail: 'teacher@iiitk.ac.in',
        authorName: 'Dr. Sarah Johnson',
        department: 'Computer Science & Engineering',
        stipend: '₹15,000/month',
        deadline: '2025-02-15',
        applications: [],
        views: 45
      }
    ];
    localStorage.setItem(POSTS_KEY, JSON.stringify(samplePosts));
  }

  if (!localStorage.getItem(APPLICATIONS_KEY)) {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([]));
  }

  if (!localStorage.getItem(USERS_KEY)) {
    const sampleUsers: User[] = [
      {
        email: 'student.test@iiitkottayam.ac.in',
        role: 'student',
        name: 'Test Student',
        phone: '+91 9876543210',
        department: 'Computer Science'
      },
      {
        email: 'teacher.test@iiitkottayam.ac.in',
        role: 'teacher',
        name: 'Dr. Test Teacher',
        phone: '+91 9876543211',
        department: 'Computer Science'
      },
      {
        email: 'admin.test@iiitkottayam.ac.in',
        role: 'teacher', // Admins can act as teachers
        name: 'Test Admin',
        phone: '+91 9876543212',
        department: 'Administration'
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(sampleUsers));
  }
};

// Posts management
export const getAllPosts = (): TeacherPost[] => {
  initializeData();
  const posts = localStorage.getItem(POSTS_KEY);
  return posts ? JSON.parse(posts) : [];
};

export const getActiveStudentPosts = (): TeacherPost[] => {
  return getAllPosts().filter(post => post.status === 'active');
};

export const getPostsByTeacher = (teacherEmail: string): TeacherPost[] => {
  return getAllPosts().filter(post => post.authorEmail === teacherEmail);
};

export const createPost = async (post: Omit<TeacherPost, 'id' | 'createdDate' | 'applications' | 'views'>): Promise<TeacherPost> => {
  initializeData();
  const posts = getAllPosts();
  const newPost: TeacherPost = {
    ...post,
    id: Date.now().toString(),
    createdDate: new Date().toISOString().split('T')[0],
    applications: [],
    views: 0
  };
  
  // Save to localStorage for local compatibility
  posts.push(newPost);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  
  // Also save to Supabase database
  try {
    console.log('Saving post to Supabase:', newPost);
    
    // Get the author's user ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', newPost.authorEmail)
      .single();
    
    if (userError) {
      console.error('Error finding user for post:', userError);
      // Continue without author_id
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: newPost.title,
        description: newPost.description,
        requirements: newPost.requirements,
        duration: newPost.duration,
        location: newPost.location,
        max_students: newPost.maxStudents,
        status: newPost.status,
        author_id: userData?.id, // May be null if user lookup failed
        author_email: newPost.authorEmail,
        author_name: newPost.authorName,
        department: newPost.department,
        deadline: newPost.deadline,
        stipend: newPost.stipend,
        views: newPost.views
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving post to Supabase:', error);
      // Continue with localStorage version
    } else {
      console.log('Post saved to Supabase successfully:', data);
      // Update the local post with the Supabase ID
      newPost.id = data.id;
      const updatedPosts = posts.map(p => p.id === Date.now().toString() ? newPost : p);
      localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
    }
  } catch (error) {
    console.error('Exception saving post to Supabase:', error);
    // Continue with localStorage version
  }
  
  return newPost;
};

export const updatePost = (postId: string, updates: Partial<TeacherPost>): TeacherPost | null => {
  const posts = getAllPosts();
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex === -1) return null;
  
  posts[postIndex] = { ...posts[postIndex], ...updates };
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return posts[postIndex];
};

export const deletePost = (postId: string): boolean => {
  const posts = getAllPosts();
  const filteredPosts = posts.filter(post => post.id !== postId);
  if (filteredPosts.length === posts.length) return false;
  
  localStorage.setItem(POSTS_KEY, JSON.stringify(filteredPosts));
  return true;
};

export const incrementPostViews = (postId: string): void => {
  const posts = getAllPosts();
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].views = (posts[postIndex].views || 0) + 1;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }
};

// Applications management
export const getAllApplications = (): StudentApplication[] => {
  initializeData();
  const applications = localStorage.getItem(APPLICATIONS_KEY);
  return applications ? JSON.parse(applications) : [];
};

export const getApplicationsByStudent = (studentEmail: string): StudentApplication[] => {
  return getAllApplications().filter(app => app.studentEmail === studentEmail);
};

export const getApplicationsByProject = (projectId: string): StudentApplication[] => {
  return getAllApplications().filter(app => app.projectId === projectId);
};

export const getApplicationsByTeacher = (teacherEmail: string): StudentApplication[] => {
  const teacherPosts = getPostsByTeacher(teacherEmail);
  const postIds = teacherPosts.map(post => post.id);
  return getAllApplications().filter(app => postIds.includes(app.projectId));
};

export const createApplication = (application: Omit<StudentApplication, 'id' | 'appliedDate' | 'status'>): StudentApplication => {
  initializeData();
  const applications = getAllApplications();
  
  // Check if student already applied to this project
  const existingApp = applications.find(app => 
    app.studentEmail === application.studentEmail && app.projectId === application.projectId
  );
  
  if (existingApp) {
    throw new Error('You have already applied to this project');
  }

  // Handle file storage - File objects can't be serialized to JSON
  // In a real application, files would be uploaded to a server
  // For demo purposes, we'll store the filename and note the limitation
  const processedApplication = { ...application };
  if (processedApplication.resumeFile) {
    processedApplication.resumeFileName = processedApplication.resumeFile.name;
    // Note: File object will be lost during localStorage serialization
    // In production, this would be uploaded to a server and we'd store the URL
  }
  
  const newApplication: StudentApplication = {
    ...processedApplication,
    id: Date.now().toString(),
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  };
  
  applications.push(newApplication);
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
  return newApplication;
};

export const updateApplicationStatus = (applicationId: string, status: 'pending' | 'accepted' | 'rejected'): StudentApplication | null => {
  const applications = getAllApplications();
  const appIndex = applications.findIndex(app => app.id === applicationId);
  if (appIndex === -1) return null;
  
  applications[appIndex].status = status;
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
  return applications[appIndex];
};

// User management
export const getUser = (email: string): User | null => {
  initializeData();
  const users = localStorage.getItem(USERS_KEY);
  const parsedUsers: User[] = users ? JSON.parse(users) : [];
  return parsedUsers.find(user => user.email === email) || null;
};

export const updateUser = (email: string, updates: Partial<User>): User | null => {
  initializeData();
  const users = localStorage.getItem(USERS_KEY);
  const parsedUsers: User[] = users ? JSON.parse(users) : [];
  const userIndex = parsedUsers.findIndex(user => user.email === email);
  
  if (userIndex === -1) return null;
  
  parsedUsers[userIndex] = { ...parsedUsers[userIndex], ...updates };
  localStorage.setItem(USERS_KEY, JSON.stringify(parsedUsers));
  return parsedUsers[userIndex];
};

// File validation
export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'Please upload a PDF file only.' };
  }
  
  // Check file size (2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 2MB.' };
  }
  
  return { isValid: true };
};

// Sync authenticated user to localStorage
export const syncUserToLocalStorage = (authUser: any) => {
  if (!authUser) return;
  
  initializeData();
  const users = localStorage.getItem(USERS_KEY);
  const parsedUsers: User[] = users ? JSON.parse(users) : [];
  
  // Check if user already exists
  const existingUserIndex = parsedUsers.findIndex(user => user.email === authUser.email);
  
  const userData: User = {
    email: authUser.email,
    role: authUser.role || 'student',
    name: authUser.name || authUser.username || 'User',
    phone: authUser.phone,
    department: authUser.department || 'Unknown Department'
  };
  
  if (existingUserIndex !== -1) {
    // Update existing user
    parsedUsers[existingUserIndex] = userData;
  } else {
    // Add new user
    parsedUsers.push(userData);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(parsedUsers));
  console.log('User synced to localStorage:', userData);
};

// Convert File to base64 for storage (in real app, upload to cloud storage)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
