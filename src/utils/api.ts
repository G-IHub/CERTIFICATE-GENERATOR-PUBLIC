import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

// Helper to get auth headers
const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }
  
  return headers;
};

// ==================== AUTH API ====================

export const authApi = {
  signUp: async (data: {
    email: string;
    password: string;
    fullName: string;
    organizationName?: string;
  }, retries = 3) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for cold starts
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sign up failed');
      }
      
      const result = await response.json();
      return result;
    } catch (error: any) {
      // Retry on timeout or network errors (cold start handling)
      if (retries > 0 && (error.name === 'AbortError' || error.message === 'Failed to fetch')) {
        const waitTime = 3000; // 3 seconds between retries
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return authApi.signUp(data, retries - 1);
      }
      
      throw error;
    }
  },

  signIn: async (data: { email: string; password: string }, retries = 3) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for cold starts
      
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sign in failed');
      }
      
      const result = await response.json();
      return result;
    } catch (error: any) {
      // Retry on timeout or network errors (cold start handling)
      if (retries > 0 && (error.name === 'AbortError' || error.message === 'Failed to fetch')) {
        const waitTime = 3000; // 3 seconds between retries
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return authApi.signIn(data, retries - 1);
      }
      
      throw error;
    }
  },

  signOut: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign out failed');
    }
    
    return await response.json();
  },

  getSession: async (token: string, retries = 2) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'GET',
        headers: getAuthHeaders(token),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || 'Failed to get session';
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error: any) {
      // Retry on timeout or network errors (cold start handling)
      if (retries > 0 && (error.name === 'AbortError' || error.message === 'Failed to fetch')) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        return authApi.getSession(token, retries - 1);
      }
      
      throw error;
    }
  },
};

// ==================== ORGANIZATION API ====================

export const organizationApi = {
  create: async (token: string, data: { name: string }) => {
    const response = await fetch(`${API_BASE_URL}/organizations`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create organization');
    }
    
    return await response.json();
  },

  getAll: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/organizations`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get organizations');
    }
    
    return await response.json();
  },

  update: async (token: string, organizationId: string, updates: any) => {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update organization');
    }
    
    return await response.json();
  },

  getSettings: async (token: string, organizationId: string) => {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/settings`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get organization settings');
    }
    
    return await response.json();
  },

  updateSettings: async (token: string, organizationId: string, settings: any) => {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update organization settings');
    }
    
    return await response.json();
  },

  uploadFile: async (token: string, file: File, type: string, organizationId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('organizationId', organizationId);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }
    
    return await response.json();
  },
};

// ==================== PROGRAM API ====================

export const programApi = {
  create: async (token: string, data: { organizationId: string; program: any }) => {
    const response = await fetch(`${API_BASE_URL}/programs`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create program');
    }
    
    return await response.json();
  },

  update: async (token: string, organizationId: string, programId: string, updates: any) => {
    const response = await fetch(`${API_BASE_URL}/programs/${organizationId}/${programId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update program');
    }
    
    return await response.json();
  },

  delete: async (token: string, organizationId: string, programId: string) => {
    const response = await fetch(`${API_BASE_URL}/programs/${organizationId}/${programId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete program');
    }
    
    return await response.json();
  },
};

// ==================== CERTIFICATE API ====================

export const certificateApi = {
  generate: async (token: string, data: {
    organizationId: string;
    programId?: string;
    certificateHeader?: string;
    courseName?: string;
    courseDescription?: string;
    completionDate?: string;
    template?: string;
    customTemplateConfig?: any;
    students?: Array<{ name: string; email?: string; completionDate?: string }>;
  }) => {
    const response = await fetch(`${API_BASE_URL}/certificates`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch (e) {
        errorDetails = { error: `Server returned ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorDetails.error || 'Failed to generate certificates');
    }
    
    const result = await response.json();
    return result;
  },

  getById: async (certificateId: string) => {
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get certificate');
    }
    
    const data = await response.json();
    return data;
  },

  getForOrganization: async (token: string, organizationId: string) => {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/certificates`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get certificates');
    }
    
    return await response.json();
  },

  delete: async (token: string, certificateId: string) => {
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete certificate');
    }
    
    return await response.json();
  },

  deleteBulk: async (token: string, certificateIds: string[]) => {
    const response = await fetch(`${API_BASE_URL}/certificates`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ certificateIds }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete certificates');
    }
    
    return await response.json();
  },

  submitTestimonial: async (data: {
    certificateId: string;
    studentName: string;
    testimonial: string;
    courseName: string;
    organizationId: string;
    programId: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/certificates/${data.certificateId}/testimonial`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit testimonial');
    }
    
    return await response.json();
  },
};

// ==================== TESTIMONIAL API ====================

export const testimonialApi = {
  create: async (data: {
    certificateId: string;
    studentName: string;
    email?: string;
    rating: number;
    text: string;
    isPublic?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/testimonials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create testimonial');
    }
    
    return await response.json();
  },

  getForOrganization: async (token: string, organizationId: string) => {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/testimonials`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get testimonials');
    }
    
    return await response.json();
  },
};

// ==================== ANALYTICS API ====================

export const analyticsApi = {
  getForOrganization: async (token: string, organizationId: string) => {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/analytics`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get analytics');
    }
    
    return await response.json();
  },
};

// ==================== TEMPLATE API (GLOBAL TEMPLATE LIBRARY) ====================

export const templateApi = {
  // Get all templates (default + user-created) - no auth required for viewing
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get templates');
    }
    
    return await response.json();
  },

  // Get a specific template by ID - no auth required
  getById: async (templateId: string) => {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get template');
    }
    
    return await response.json();
  },

  // Create a new template (user-created) - requires auth
  create: async (token: string, template: any) => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ template }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create template');
    }
    
    return await response.json();
  },

  // Update a template (only custom templates) - requires auth
  update: async (token: string, templateId: string, updates: any) => {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update template');
    }
    
    return await response.json();
  },

  // Delete a template (only custom templates) - requires auth
  delete: async (token: string, templateId: string) => {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete template');
    }
    
    return await response.json();
  },

  // Seed default templates (admin only, one-time use)
  seed: async () => {
    const response = await fetch(`${API_BASE_URL}/templates/seed`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to seed templates');
    }
    
    return await response.json();
  },

  // Force reseed - clears and reseeds all default templates
  forceReseed: async () => {
    const response = await fetch(`${API_BASE_URL}/templates/force-reseed`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to force reseed templates');
    }
    
    return await response.json();
  },
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  
  return await response.json();
};