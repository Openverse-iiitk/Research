// Blog API wrapper to replace localStorage usage
import { blogAPI } from './api';
import { Database } from './supabase';

// Frontend BlogPost interface (matches blog-store.ts)
export interface BlogPost {
  id: string;
  title: string;
  content: string; // Markdown content
  excerpt: string;
  author: string;
  authorEmail: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
  readTime: number; // estimated read time in minutes
}

// API BlogPost type from database
type ApiBlogPost = Database['public']['Tables']['blog_posts']['Row'];

// Convert API blog post to frontend format
function convertApiToFrontend(apiPost: ApiBlogPost): BlogPost {
  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    excerpt: apiPost.excerpt,
    author: apiPost.author_name || apiPost.author_id, // Use name if available, fallback to ID
    authorEmail: apiPost.author_email || '',
    tags: Array.isArray(apiPost.tags) ? apiPost.tags : [],
    createdAt: apiPost.created_at,
    updatedAt: apiPost.updated_at,
    published: apiPost.published,
    readTime: apiPost.read_time || calculateReadTime(apiPost.content)
  };
}

// Convert frontend blog post to API format
function convertFrontendToApi(frontendPost: Partial<BlogPost>, authorId: string): Database['public']['Tables']['blog_posts']['Insert'] {
  return {
    title: frontendPost.title || '',
    content: frontendPost.content || '',
    excerpt: frontendPost.excerpt || '',
    author_id: authorId,
    author_name: frontendPost.author || '',
    author_email: frontendPost.authorEmail || '',
    tags: frontendPost.tags || [],
    published: frontendPost.published || false,
    read_time: frontendPost.readTime || (frontendPost.content ? calculateReadTime(frontendPost.content) : 0)
  };
}

// Calculate estimated read time in minutes
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// API wrapper functions to replace blog-store.ts functions
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const apiPosts = await blogAPI.getAll();
    return apiPosts.map(convertApiToFrontend);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const apiPosts = await blogAPI.getPublished();
    return apiPosts.map(convertApiToFrontend);
  } catch (error) {
    console.error('Error fetching published blog posts:', error);
    return [];
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const apiPost = await blogAPI.getById(id);
    return apiPost ? convertApiToFrontend(apiPost) : null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function getBlogPostsByAuthor(authorEmail: string): Promise<BlogPost[]> {
  try {
    // Note: API uses author_id, we might need to look up user by email first
    const apiPosts = await blogAPI.getByAuthor(authorEmail);
    return apiPosts.map(convertApiToFrontend);
  } catch (error) {
    console.error('Error fetching blog posts by author:', error);
    return [];
  }
}

export async function createBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readTime'>, authorId: string): Promise<boolean> {
  try {
    const apiData = convertFrontendToApi(postData, authorId);
    const result = await blogAPI.create(apiData);
    return result !== null;
  } catch (error) {
    console.error('Error creating blog post:', error);
    return false;
  }
}

export async function updateBlogPost(id: string, updates: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'author' | 'authorEmail'>>): Promise<boolean> {
  try {
    const apiUpdates: Database['public']['Tables']['blog_posts']['Update'] = {};
    
    if (updates.title !== undefined) {
      apiUpdates.title = updates.title;
    }
    if (updates.content !== undefined) {
      apiUpdates.content = updates.content;
      apiUpdates.read_time = calculateReadTime(updates.content);
    }
    if (updates.excerpt !== undefined) {
      apiUpdates.excerpt = updates.excerpt;
    }
    if (updates.tags !== undefined) {
      apiUpdates.tags = updates.tags;
    }
    if (updates.published !== undefined) {
      apiUpdates.published = updates.published;
    }
    if (updates.readTime !== undefined) {
      apiUpdates.read_time = updates.readTime;
    }
    
    const result = await blogAPI.update(id, apiUpdates);
    return result !== null;
  } catch (error) {
    console.error('Error updating blog post:', error);
    return false;
  }
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  try {
    return await blogAPI.delete(id);
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }
}

// Generate a unique ID (for compatibility, though API handles this)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
