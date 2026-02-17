import { projectId, publicAnonKey } from "./supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogData {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  status: 'draft' | 'published';
}

export interface UpdateBlogData {
  title?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  author?: string;
  status?: 'draft' | 'published';
}

export const blogApi = {
  // Get all published blogs (public endpoint)
  getAllPublished: async (): Promise<{ blogs: Blog[] }> => {
    const response = await fetch(`${BASE_URL}/blogs/published`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch blogs" }));
      throw new Error(error.message || "Failed to fetch blogs");
    }

    return response.json();
  },

  // Get all blogs (admin only - includes drafts)
  getAll: async (accessToken: string): Promise<{ blogs: Blog[] }> => {
    const response = await fetch(`${BASE_URL}/blogs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch blogs" }));
      throw new Error(error.message || "Failed to fetch blogs");
    }

    return response.json();
  },

  // Get single blog by ID (public endpoint)
  getById: async (id: string): Promise<{ blog: Blog }> => {
    const response = await fetch(`${BASE_URL}/blogs/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Blog not found" }));
      throw new Error(error.message || "Blog not found");
    }

    return response.json();
  },

  // Create new blog (admin only)
  create: async (accessToken: string, data: CreateBlogData): Promise<{ blog: Blog }> => {
    const response = await fetch(`${BASE_URL}/blogs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create blog" }));
      throw new Error(error.message || "Failed to create blog");
    }

    return response.json();
  },

  // Update blog (admin only)
  update: async (accessToken: string, id: string, data: UpdateBlogData): Promise<{ blog: Blog }> => {
    const response = await fetch(`${BASE_URL}/blogs/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update blog" }));
      throw new Error(error.message || "Failed to update blog");
    }

    return response.json();
  },

  // Delete blog (admin only)
  delete: async (accessToken: string, id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${BASE_URL}/blogs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete blog" }));
      throw new Error(error.message || "Failed to delete blog");
    }

    return response.json();
  },
};