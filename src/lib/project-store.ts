import { create } from 'zustand';
import { projectAPI, applicationAPI } from './api';
import { Database } from './supabase';

type Project = Database['public']['Tables']['projects']['Row'];
type Application = Database['public']['Tables']['applications']['Row'];

interface ProjectState {
  // Projects
  projects: Project[];
  selectedProject: Project | null;
  myProjects: Project[];
  isLoading: boolean;
  error: string | null;

  // Applications
  myApplications: Application[];
  projectApplications: Application[];
  isApplicationLoading: boolean;
  applicationError: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  fetchMyProjects: (authorId: string) => Promise<void>;
  createProject: (projectData: Database['public']['Tables']['projects']['Insert']) => Promise<{ success: boolean; error?: string }>;
  updateProject: (id: string, updates: Database['public']['Tables']['projects']['Update']) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Application actions
  fetchMyApplications: (studentId: string) => Promise<void>;
  fetchProjectApplications: (projectId: string) => Promise<void>;
  createApplication: (applicationData: Database['public']['Tables']['applications']['Insert']) => Promise<{ success: boolean; error?: string }>;
  updateApplicationStatus: (id: string, status: 'pending' | 'accepted' | 'rejected') => Promise<{ success: boolean; error?: string }>;
  
  // Utility actions
  clearError: () => void;
  clearApplicationError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  myProjects: [],
  isLoading: false,
  error: null,
  
  myApplications: [],
  projectApplications: [],
  isApplicationLoading: false,
  applicationError: null,

  // Project actions
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectAPI.getAll();
      set({ projects, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectAPI.getById(id);
      if (project) {
        // Increment view count
        await projectAPI.incrementViews(id);
        set({ selectedProject: project, isLoading: false });
      } else {
        set({ error: 'Project not found', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMyProjects: async (authorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const myProjects = await projectAPI.getByAuthor(authorId);
      set({ myProjects, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectAPI.create(projectData);
      if (project) {
        const { myProjects } = get();
        set({ 
          myProjects: [project, ...myProjects],
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error: 'Failed to create project', isLoading: false });
        return { success: false, error: 'Failed to create project' };
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateProject: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectAPI.update(id, updates);
      if (project) {
        const { myProjects } = get();
        const updatedProjects = myProjects.map(p => p.id === id ? project : p);
        set({ 
          myProjects: updatedProjects,
          selectedProject: project,
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error: 'Failed to update project', isLoading: false });
        return { success: false, error: 'Failed to update project' };
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await projectAPI.delete(id);
      if (success) {
        const { myProjects } = get();
        const filteredProjects = myProjects.filter(p => p.id !== id);
        set({ 
          myProjects: filteredProjects,
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error: 'Failed to delete project', isLoading: false });
        return { success: false, error: 'Failed to delete project' };
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Application actions
  fetchMyApplications: async (studentId: string) => {
    set({ isApplicationLoading: true, applicationError: null });
    try {
      const applications = await applicationAPI.getByStudent(studentId);
      set({ myApplications: applications, isApplicationLoading: false });
    } catch (error: any) {
      set({ applicationError: error.message, isApplicationLoading: false });
    }
  },

  fetchProjectApplications: async (projectId: string) => {
    set({ isApplicationLoading: true, applicationError: null });
    try {
      const applications = await applicationAPI.getByProject(projectId);
      set({ projectApplications: applications, isApplicationLoading: false });
    } catch (error: any) {
      set({ applicationError: error.message, isApplicationLoading: false });
    }
  },

  createApplication: async (applicationData) => {
    set({ isApplicationLoading: true, applicationError: null });
    try {
      // Check if application already exists
      const exists = await applicationAPI.checkExistingApplication(
        applicationData.student_id, 
        applicationData.project_id
      );
      
      if (exists) {
        set({ 
          applicationError: 'You have already applied to this project', 
          isApplicationLoading: false 
        });
        return { success: false, error: 'You have already applied to this project' };
      }

      const application = await applicationAPI.create(applicationData);
      if (application) {
        const { myApplications } = get();
        set({ 
          myApplications: [application, ...myApplications],
          isApplicationLoading: false 
        });
        return { success: true };
      } else {
        set({ applicationError: 'Failed to create application', isApplicationLoading: false });
        return { success: false, error: 'Failed to create application' };
      }
    } catch (error: any) {
      set({ applicationError: error.message, isApplicationLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateApplicationStatus: async (id, status) => {
    set({ isApplicationLoading: true, applicationError: null });
    try {
      const application = await applicationAPI.updateStatus(id, status);
      if (application) {
        const { projectApplications } = get();
        const updatedApplications = projectApplications.map(app => 
          app.id === id ? application : app
        );
        set({ 
          projectApplications: updatedApplications,
          isApplicationLoading: false 
        });
        return { success: true };
      } else {
        set({ applicationError: 'Failed to update application status', isApplicationLoading: false });
        return { success: false, error: 'Failed to update application status' };
      }
    } catch (error: any) {
      set({ applicationError: error.message, isApplicationLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
  clearApplicationError: () => set({ applicationError: null })
}));
