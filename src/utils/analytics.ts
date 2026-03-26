import { projectId, publicAnonKey } from "./supabase/info";


const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

// Generate session ID (persists for browser session)
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Track page view
export const trackPageView = async (blogId: string, blogTitle: string) => {
  try {
    const sessionId = getSessionId();
    const referrer = document.referrer || 'direct';
    const userAgent = navigator.userAgent;
    
    const response = await fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        blog_id: blogId,
        blog_title: blogTitle,
        session_id: sessionId,
        referrer,
        user_agent: userAgent,
        page_url: window.location.href,
        event_type: 'pageview',
      }),
    });

    if (!response.ok) {
      console.warn('Analytics tracking failed');
    }
  } catch (error) {
    // Silent fail - don't break user experience
    console.warn('Analytics error:', error);
  }
};

// Track reading time when user leaves
export const trackReadingTime = async (
  blogId: string,
  readingTimeSeconds: number,
  scrollDepth: number
) => {
  try {
    const sessionId = getSessionId();
    
    await fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        blog_id: blogId,
        session_id: sessionId,
        reading_time: Math.round(readingTimeSeconds),
        scroll_depth: Math.round(scrollDepth),
        event_type: 'engagement',
      }),
    });
  } catch (error) {
    console.warn('Analytics error:', error);
  }
};

// Hook for tracking blog post analytics
export const useBlogAnalytics = (blogId: string, blogTitle: string) => {
  let startTime = Date.now();
  let maxScrollDepth = 0;

  // Track page view on mount
  const trackView = () => {
    trackPageView(blogId, blogTitle);
  };

  // Calculate scroll depth
  const updateScrollDepth = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;
    maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
  };

  // Track engagement on unmount
  const trackEngagement = () => {
    const readingTime = (Date.now() - startTime) / 1000;
    
    // Only track if user spent more than 3 seconds
    if (readingTime > 3) {
      trackReadingTime(blogId, readingTime, maxScrollDepth);
    }
  };

  return {
    trackView,
    updateScrollDepth,
    trackEngagement,
  };
};

// Analytics API for admin dashboard
export interface BlogAnalytics {
  blog_id: string;
  blog_title: string;
  total_views: number;
  unique_visitors: number;
  avg_reading_time: number;
  avg_scroll_depth: number;
  top_referrers: Array<{ referrer: string; count: number }>;
  geographic_data: Array<{ country: string; city: string; count: number }>;
  device_breakdown: { mobile: number; desktop: number; tablet: number };
  views_by_date: Array<{ date: string; views: number; unique: number }>;
}

export interface OverviewAnalytics {
  total_views: number;
  unique_visitors: number;
  total_posts_viewed: number;
  avg_reading_time: number;
  top_posts: Array<{
    blog_id: string;
    blog_title: string;
    views: number;
    unique_visitors: number;
  }>;
  views_by_date: Array<{ date: string; views: number; unique: number }>;
}

export const analyticsApi = {
  // Get analytics for specific blog post
  getBlogAnalytics: async (
    blogId: string,
    startDate?: string,
    endDate?: string
  ): Promise<BlogAnalytics> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `${API_BASE}/analytics/blog/${blogId}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch blog analytics:', error);
      throw error;
    }
  },

  // Get overview analytics for all blogs
  getOverviewAnalytics: async (
    startDate?: string,
    endDate?: string
  ): Promise<OverviewAnalytics> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `${API_BASE}/analytics/overview?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch overview analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch overview analytics:', error);
      throw error;
    }
  },

  // Get real-time active readers count
  getActiveReaders: async (): Promise<{ active_readers: number; by_blog: Array<{ blog_id: string; blog_title: string; count: number }> }> => {
    try {
      const response = await fetch(`${API_BASE}/analytics/realtime`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active readers');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch active readers:', error);
      throw error;
    }
  },
};