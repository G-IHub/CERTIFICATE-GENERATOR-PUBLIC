import { projectId, publicAnonKey } from "./supabase/info";

/**
 * Blog Service - KV Store Based
 * 
 * Stores blog posts in the KV store (kv_store_a611b057 table)
 * Key format: blog:post:{id}
 * Platform Admin creates, edits, and publishes blog posts
 */

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
  slug: string;
}

export interface CreateBlogData {
  title: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author: string;
  status: 'draft' | 'published';
}

export interface UpdateBlogData {
  title?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  author?: string;
  status?: 'draft' | 'published';
}

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Generate slug from title
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const blogService = {
  // Get all blog posts (admin - includes drafts)
  getAll: async (status: 'all' | 'draft' | 'published' = 'all'): Promise<BlogPost[]> => {
    try {
      const response = await fetch(`${API_BASE}/blog`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      let posts = data.posts || [];

      // Filter by status if needed
      if (status !== 'all') {
        posts = posts.filter((post: BlogPost) => post.status === status);
      }

      // Sort by created_at descending
      posts.sort((a: BlogPost, b: BlogPost) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return posts;
    } catch (error: any) {
      console.error('Failed to fetch blog posts:', error);
      throw error;
    }
  },

  // Get all published blog posts (public)
  getAllPublished: async (): Promise<BlogPost[]> => {
    try {
      const response = await fetch(`${API_BASE}/blog/published`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch published blog posts');
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error: any) {
      console.error('Failed to fetch published blog posts:', error);
      return [];
    }
  },

  // Get single blog post by ID
  getById: async (id: string): Promise<BlogPost | null> => {
    try {
      const response = await fetch(`${API_BASE}/blog/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Blog post not found');
      }

      const data = await response.json();
      return data.post;
    } catch (error: any) {
      console.error('Failed to fetch blog post:', error);
      throw error;
    }
  },

  // Create new blog post
  create: async (data: CreateBlogData): Promise<BlogPost> => {
    try {
      const response = await fetch(`${API_BASE}/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog post');
      }

      const result = await response.json();
      return result.post;
    } catch (error: any) {
      console.error('Failed to create blog post:', error);
      throw error;
    }
  },

  // Update blog post
  update: async (id: string, data: UpdateBlogData): Promise<BlogPost> => {
    try {
      const response = await fetch(`${API_BASE}/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update blog post');
      }

      const result = await response.json();
      return result.post;
    } catch (error: any) {
      console.error('Failed to update blog post:', error);
      throw error;
    }
  },

  // Delete blog post
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete blog post');
      }
    } catch (error: any) {
      console.error('Failed to delete blog post:', error);
      throw error;
    }
  },

  // Upload image as base64
  uploadImage: async (file: File): Promise<string> => {
    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Convert to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read image file'));
        };
        reader.readAsDataURL(file);
      });
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  },
};