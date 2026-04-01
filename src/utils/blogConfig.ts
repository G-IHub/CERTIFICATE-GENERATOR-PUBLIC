/**
 * Blog Configuration
 * 
 * Toggle between WordPress and mock data sources
 */

/**
 * USE_MOCK_BLOG_DATA Configuration
 * 
 * Set to true to use local mock data (for development/testing)
 * Set to false to use Certifyer's internal blog management system
 * 
 * IMPORTANT: Internal blog system is now active!
 * Admins can create and manage blog posts from the Admin Dashboard > Blog tab
 */
export const USE_MOCK_BLOG_DATA = false; // Using internal blog management system

/**
 * Blog Display Configuration
 */
export const BLOG_CONFIG = {
  postsPerPage: 10,
  excerptLength: 150,
  landingPagePostCount: 3, // Number of posts to show on landing page
  defaultAuthor: 'Certifyer Team',
  defaultImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop',
};