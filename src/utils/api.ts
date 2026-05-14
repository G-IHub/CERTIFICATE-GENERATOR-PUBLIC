import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

// Helper to get auth headers
const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Use provided token, or try to get from localStorage, or fall back to public anon key
  const activeToken = token || localStorage.getItem('accessToken');
  
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
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

// ==================== CERTIFICATE API ====================

export const certificateApi = {
  generate: async (token: string, data: {
    organizationId: string;
    courseId?: string;
    certificateHeader?: string;
    courseName?: string;
    courseDescription?: string;
    completionDate?: string;
    template?: string;
    customTemplateConfig?: any;
    students?: Array<{ name: string; email?: string; completionDate?: string }>;
    signatories?: any[];
    restrictDownload?: boolean;
    allowedEmails?: string[];
    monetizationEnabled?: boolean;
    certificatePriceMinor?: number;
    certificateCurrency?: string;
    themeColors?: any;
  }) => {
    console.log('📤 Sending certificate generation request:', {
      ...data,
      restrictDownload: data.restrictDownload,
      allowedEmails: data.allowedEmails,
    });
    
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
      console.error('❌ Certificate generation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails,
        hasToken: !!token,
      });
      throw new Error(errorDetails.error || 'Failed to generate certificates');
    }
    
    const result = await response.json();
    console.log('📥 Certificate generation response:', result);
    return result;
  },

  getById: async (certificateId: string) => {
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      // Special handling for 402 Payment Required
      if (response.status === 402 && error.code === 'PAYMENT_REQUIRED' && error.details) {
        console.log('💰 Payment required for certificate:', error.details);
        // Return a special object indicating payment is required
        return {
          paymentRequired: true,
          certificate: {
            id: error.details.certificateId,
            courseName: error.details.courseName,
            certificateHeader: error.details.certificateHeader,
            monetizationEnabled: true,
            certificatePriceMinor: error.details.certificatePriceMinor ?? error.details.amountMinor ?? 0,
            certificatePriceUSDMinor: error.details.certificatePriceUSDMinor ?? 0,
            paymentStatus: 'unpaid',
          },
          error: error.error,
        };
      }
      
      throw new Error(error.error || 'Failed to get certificate');
    }
    
    const data = await response.json();
    console.log('📥 Certificate retrieved:', {
      id: data.id,
      restrictDownload: data.restrictDownload,
      allowedEmails: data.allowedEmails,
    });
    return data;
  },

  update: async (token: string, certificateId: string, data: {
    organizationId: string;
    certificateHeader?: string;
    courseName?: string;
    courseDescription?: string;
    completionDate?: string;
    template?: string;
    signatories?: any[];
    restrictDownload?: boolean;
    allowedEmails?: string[];
  }) => {
    console.log('📤 Sending certificate update request:', {
      certificateId,
      organizationId: data.organizationId,
      ...data,
    });
    
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}`, {
      method: 'PUT',
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
      throw new Error(errorDetails.error || 'Failed to update certificate');
    }
    
    const result = await response.json();
    console.log('📥 Certificate update response:', result);
    return result;
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

  updateMonetization: async (token: string, certificateId: string, data: {
    monetizationEnabled: boolean;
    certificatePriceMinor?: number;
    certificateCurrency?: string;
    themeColors?: any;
  }) => {
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}/monetization`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch (e) {
        // If response is not JSON, get text
        const text = await response.text();
        throw new Error(`Failed to update monetization: ${response.status} ${text || response.statusText}`);
      }
      throw new Error(errorDetails.error || 'Failed to update monetization');
    }
    
    // Handle successful response
    try {
      return await response.json();
    } catch (e) {
      // If response is not JSON but request was successful, try to get text
      const text = await response.text();
      console.error('Response is not JSON:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  },

  submitTestimonial: async (data: {
    certificateId: string;
    studentName: string;
    email?: string;
    testimonial: string;
    title?: string;
    organization?: string;
    impact?: string;
    courseName: string;
    organizationId: string;
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

// ==================== PRODUCT PAYMENT API (PAYSTACK) ====================

export const productPaymentApi = {
  // Initialize Paystack payment for a certificate/product purchase
  initialize: async (data: {
    productId: string;
    productType: 'certificate' | 'course' | 'pdf';
    buyerEmail: string;
    buyerName: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/monetization/payments/initialize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize payment');
    }
    return await response.json();
  },

  // Verify payment after Paystack redirect
  verify: async (reference: string) => {
    const response = await fetch(`${API_BASE_URL}/monetization/payments/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reference }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify payment');
    }
    return await response.json();
  },
};

// ==================== TEMPLATE API (GLOBAL TEMPLATE LIBRARY) ====================

export const templateApi = {
  // Get all templates (default + user-created) - now supports visibility filtering
  getAll: async (organizationId?: string) => {
    const url = new URL(`${API_BASE_URL}/templates`);
    if (organizationId) {
      url.searchParams.append('organizationId', organizationId);
    }
    
    const response = await fetch(url.toString(), {
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

  // Update template visibility (admin only)
  updateVisibility: async (token: string, templateId: string, data: {
    visibility_type: 'public' | 'organization';
    organization_id?: string;
    organization_ids?: string[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}/visibility`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update template visibility');
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