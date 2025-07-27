// Project and Application API wrapper to replace data-store localStorage usage
import { projectAPI, applicationAPI, userAPI } from './api';
import { Database } from './supabase';
import { supabase } from './supabase';

// Frontend types that match data-store.ts
export interface TeacherPost {
  outcome: string;
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
  role: 'student' | 'teacher' | 'admin';
  name: string;
  phone?: string;
  department?: string;
}

// API types
type ApiProject = Database['public']['Tables']['projects']['Row'];
type ApiApplication = Database['public']['Tables']['applications']['Row'];
type ApiUser = Database['public']['Tables']['users']['Row'];

// Convert API project to frontend format
function convertApiProjectToTeacherPost(apiProject: ApiProject): TeacherPost {
  return {
    id: apiProject.id,
    title: apiProject.title,
    description: apiProject.description,
    requirements: Array.isArray(apiProject.requirements) ? apiProject.requirements : [],
    duration: apiProject.duration,
    location: apiProject.location,
    maxStudents: apiProject.max_students,
    status: apiProject.status,
    createdDate: apiProject.created_at,
    authorEmail: apiProject.author_email,
    authorName: apiProject.author_name,
    department: apiProject.department,
    stipend: apiProject.stipend || undefined,
    deadline: apiProject.deadline,
    applications: [], // Load separately if needed
    views: apiProject.views,
    outcome: apiProject.outcome || ''
  };
}

// Convert API application to frontend format
function convertApiApplicationToStudentApplication(apiApp: ApiApplication): StudentApplication {
  return {
    id: apiApp.id,
    studentEmail: apiApp.student_email,
    studentName: apiApp.student_name,
    studentPhone: apiApp.student_phone,
    projectId: apiApp.project_id,
    projectTitle: apiApp.project_title,
    appliedDate: apiApp.applied_at,
    status: apiApp.status,
    coverLetter: apiApp.cover_letter,
    skills: Array.isArray(apiApp.skills) ? apiApp.skills : [],
    gpa: apiApp.student_gpa,
    year: apiApp.student_year,
    resumeFile: undefined, // File objects don't persist
    resumeFileName: apiApp.resume_url ? apiApp.resume_url.split('/').pop() : undefined
  };
}

// Convert frontend TeacherPost to API format
function convertTeacherPostToApiProject(post: Omit<TeacherPost, 'id' | 'createdDate' | 'applications' | 'views'>, authorId: string): Database['public']['Tables']['projects']['Insert'] {
  return {
    title: post.title,
    description: post.description,
    requirements: post.requirements,
    duration: post.duration,
    location: post.location,
    max_students: post.maxStudents,
    status: post.status,
    author_id: authorId,
    author_email: post.authorEmail,
    author_name: post.authorName,
    department: post.department,
    deadline: post.deadline,
    stipend: post.stipend,
    outcome: post.outcome,
    tags: [], // Projects don't have tags in current schema
    views: 0
  };
}

// File validation function
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

// Project management functions
export async function getAllPosts(): Promise<TeacherPost[]> {
  try {
    const apiProjects = await projectAPI.getAll();
    return apiProjects.map(convertApiProjectToTeacherPost);
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
}

export async function getActiveStudentPosts(): Promise<TeacherPost[]> {
  try {
    const apiProjects = await projectAPI.getAll();
    return apiProjects
      .filter(project => project.status === 'active')
      .map(convertApiProjectToTeacherPost);
  } catch (error) {
    console.error('Error fetching active student posts:', error);
    return [];
  }
}

export async function getPostsByTeacher(teacherEmail: string): Promise<TeacherPost[]> {
  try {
    // First get the teacher's user ID
    const teacher = await userAPI.getByEmail(teacherEmail);
    if (!teacher) {
      console.error('Teacher not found:', teacherEmail);
      return [];
    }
    
    const apiProjects = await projectAPI.getByAuthor(teacher.id);
    return apiProjects.map(convertApiProjectToTeacherPost);
  } catch (error) {
    console.error('Error fetching posts by teacher:', error);
    return [];
  }
}

export async function getPostById(postId: string): Promise<TeacherPost | null> {
  try {
    const apiProject = await projectAPI.getById(postId);
    if (apiProject) {
      return convertApiProjectToTeacherPost(apiProject);
    }
    return null;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }
}

export async function createPost(post: Omit<TeacherPost, 'id' | 'createdDate' | 'applications' | 'views'>): Promise<TeacherPost | null> {
  try {
    // Get the current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication session found');
    }

    // Use the API route instead of direct Supabase call to handle authentication
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        title: post.title,
        description: post.description,
        requirements: post.requirements,
        duration: post.duration,
        location: post.location,
        max_students: post.maxStudents,
        status: post.status,
        deadline: post.deadline,
        stipend: post.stipend,
        outcome: post.outcome,
        department: post.department,
        tags: []
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create post');
    }

    const { project } = await response.json();
    return convertApiProjectToTeacherPost(project);
  } catch (error) {
    console.error('Error creating post:', error);
    throw error; // Re-throw the error so it can be handled by the calling function
  }
}

export async function updatePost(postId: string, updates: Partial<TeacherPost>): Promise<TeacherPost | null> {
  try {
    const apiUpdates: Database['public']['Tables']['projects']['Update'] = {};
    
    if (updates.title !== undefined) apiUpdates.title = updates.title;
    if (updates.description !== undefined) apiUpdates.description = updates.description;
    if (updates.requirements !== undefined) apiUpdates.requirements = updates.requirements;
    if (updates.duration !== undefined) apiUpdates.duration = updates.duration;
    if (updates.location !== undefined) apiUpdates.location = updates.location;
    if (updates.maxStudents !== undefined) apiUpdates.max_students = updates.maxStudents;
    if (updates.status !== undefined) apiUpdates.status = updates.status;
    if (updates.deadline !== undefined) apiUpdates.deadline = updates.deadline;
    if (updates.stipend !== undefined) apiUpdates.stipend = updates.stipend;
    if (updates.outcome !== undefined) apiUpdates.outcome = updates.outcome;
    
    const result = await projectAPI.update(postId, apiUpdates);
    return result ? convertApiProjectToTeacherPost(result) : null;
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
}

export async function deletePost(postId: string): Promise<boolean> {
  try {
    return await projectAPI.delete(postId);
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}

export async function incrementPostViews(postId: string): Promise<void> {
  try {
    await projectAPI.incrementViews(postId);
  } catch (error) {
    console.error('Error incrementing post views:', error);
  }
}

// Application management functions
export async function getAllApplications(): Promise<StudentApplication[]> {
  try {
    // Note: API doesn't have getAll for applications, would need to implement
    console.warn('getAllApplications not implemented - use specific queries instead');
    return [];
  } catch (error) {
    console.error('Error fetching all applications:', error);
    return [];
  }
}

export async function getApplicationsByStudent(studentEmail: string): Promise<StudentApplication[]> {
  try {
    const student = await userAPI.getByEmail(studentEmail);
    if (!student) {
      return [];
    }
    
    const apiApplications = await applicationAPI.getByStudent(student.id);
    return apiApplications.map(convertApiApplicationToStudentApplication);
  } catch (error) {
    console.error('Error fetching applications by student:', error);
    return [];
  }
}

export async function getApplicationsByProject(projectId: string): Promise<StudentApplication[]> {
  try {
    const apiApplications = await applicationAPI.getByProject(projectId);
    return apiApplications.map(convertApiApplicationToStudentApplication);
  } catch (error) {
    console.error('Error fetching applications by project:', error);
    return [];
  }
}

export async function getApplicationsByTeacher(teacherEmail: string): Promise<StudentApplication[]> {
  try {
    const teacher = await userAPI.getByEmail(teacherEmail);
    if (!teacher) {
      return [];
    }
    
    const apiApplications = await applicationAPI.getByTeacher(teacher.id);
    return apiApplications.map(convertApiApplicationToStudentApplication);
  } catch (error) {
    console.error('Error fetching applications by teacher:', error);
    return [];
  }
}

export async function createApplication(application: Omit<StudentApplication, 'id' | 'appliedDate' | 'status'>): Promise<StudentApplication | null> {
  try {
    // Get student and project data
    const student = await userAPI.getByEmail(application.studentEmail);
    if (!student) {
      throw new Error('Student not found');
    }
    
    const project = await projectAPI.getById(application.projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Check if application already exists
    const exists = await applicationAPI.checkExistingApplication(student.id, application.projectId);
    if (exists) {
      throw new Error('You have already applied to this project');
    }

    // Upload resume if provided
    let resumeUrl: string | undefined = undefined;
    if (application.resumeFile) {
      try {
        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        // Upload resume file
        const formData = new FormData();
        formData.append('file', application.resumeFile);

        const uploadResponse = await fetch('/api/upload/resume', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Failed to upload resume');
        }

        const uploadResult = await uploadResponse.json();
        resumeUrl = uploadResult.url;
      } catch (uploadError) {
        console.warn('Resume upload failed:', uploadError);
        // Don't fail the entire application if resume upload fails
        // Just proceed without the resume
      }
    }
    
    const apiData: Database['public']['Tables']['applications']['Insert'] = {
      student_id: student.id,
      student_email: application.studentEmail,
      student_name: application.studentName,
      student_phone: application.studentPhone,
      student_year: application.year,
      student_gpa: application.gpa,
      project_id: application.projectId,
      project_title: application.projectTitle,
      teacher_id: project.author_id,
      teacher_email: project.author_email,
      cover_letter: application.coverLetter,
      skills: application.skills,
      resume_url: resumeUrl
    };
    
    const result = await applicationAPI.create(apiData);
    return result ? convertApiApplicationToStudentApplication(result) : null;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

export async function updateApplicationStatus(applicationId: string, status: 'pending' | 'accepted' | 'rejected'): Promise<StudentApplication | null> {
  try {
    const result = await applicationAPI.updateStatus(applicationId, status);
    return result ? convertApiApplicationToStudentApplication(result) : null;
  } catch (error) {
    console.error('Error updating application status:', error);
    return null;
  }
}

// User management functions
export async function getUser(email: string): Promise<User | null> {
  try {
    const apiUser = await userAPI.getByEmail(email);
    if (!apiUser) return null;
    
    return {
      email: apiUser.email,
      role: apiUser.role || 'student',
      name: apiUser.name || '',
      phone: apiUser.phone || undefined,
      department: apiUser.department || undefined
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function updateUser(email: string, updates: Partial<User>): Promise<User | null> {
  try {
    const existingUser = await userAPI.getByEmail(email);
    if (!existingUser) return null;
    
    const apiUpdates: Database['public']['Tables']['users']['Update'] = {};
    if (updates.name !== undefined) apiUpdates.name = updates.name;
    if (updates.phone !== undefined) apiUpdates.phone = updates.phone;
    if (updates.department !== undefined) apiUpdates.department = updates.department;
    if (updates.role !== undefined) apiUpdates.role = updates.role;
    
    const result = await userAPI.update(existingUser.id, apiUpdates);
    if (!result) return null;
    
    return {
      email: result.email,
      role: result.role || 'student',
      name: result.name || '',
      phone: result.phone || undefined,
      department: result.department || undefined
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// File conversion utility
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// No longer needed - removes localStorage sync function
export const syncUserToLocalStorage = (authUser: any) => {
  // This function is deprecated - API handles user data directly
  console.log('syncUserToLocalStorage is deprecated - using API directly');
};
