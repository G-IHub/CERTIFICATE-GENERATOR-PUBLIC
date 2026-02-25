import { 
  fetchWordPressPostsPublished, 
  fetchWordPressPostById,
  mapWordPressPostToBlog 
} from "./wordpressApi";

/**
 * Blog API
 * 
 * All blog posts are now managed exclusively on WordPress.com
 * URL: https://blogcertifyer.wordpress.com
 * 
 * Posts are fetched from WordPress REST API and displayed on Certifyer.
 * No backend storage - WordPress is the single source of truth.
 */

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
  source: 'wordpress';
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
  // Get all published blogs - fetches from WordPress only
  getAllPublished: async (): Promise<{ blogs: Blog[] }> => {
    try {
      console.log('📚 Fetching blog posts from WordPress...');
      
      // Fetch from WordPress
      const wpPosts = await fetchWordPressPostsPublished();

      if (wpPosts.length === 0) {
        console.log('ℹ️ No WordPress posts available. Create your first post at https://blogcertifyer.wordpress.com/wp-admin');
        return { blogs: [] };
      }

      // Map WordPress posts to our Blog interface
      const blogs: Blog[] = wpPosts.map(post => ({
        ...mapWordPressPostToBlog(post),
        source: 'wordpress' as const
      }));

      // Sort by date (newest first)
      blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`✅ Successfully loaded ${blogs.length} blog post${blogs.length !== 1 ? 's' : ''} from WordPress`);
      return { blogs };
    } catch (error) {
      console.error('❌ Error fetching blogs from WordPress:', error);
      return { blogs: [] };
    }
  },

  // Get all blogs (admin only - includes drafts) - WordPress only
  getAll: async (accessToken: string): Promise<{ blogs: Blog[] }> => {
    // For now, this returns the same as getAllPublished
    // WordPress.com API doesn't expose drafts without authentication
    // Admin should manage drafts directly on WordPress
    console.log('ℹ️ To manage drafts, visit: https://blogcertifyer.wordpress.com/wp-admin');
    return blogApi.getAllPublished();
  },

  // Get single blog by ID - WordPress only
  getById: async (id: string): Promise<{ blog: Blog }> => {
    try {
      // WordPress posts have 'wp-' prefix
      if (!id.startsWith('wp-')) {
        throw new Error('Invalid blog post ID. All posts are now on WordPress with wp- prefix.');
      }

      const wpId = parseInt(id.replace('wp-', ''));
      console.log(`🔍 Fetching WordPress post ${wpId}...`);
      
      const wpPost = await fetchWordPressPostById(wpId);
      
      if (!wpPost) {
        throw new Error('Blog post not found');
      }

      console.log(`✅ Successfully loaded post: ${wpPost.title.rendered}`);
      return { 
        blog: {
          ...mapWordPressPostToBlog(wpPost),
          source: 'wordpress'
        }
      };
    } catch (error: any) {
      console.error('❌ Error fetching blog post:', error.message);
      throw error;
    }
  },

  // Create new blog - Direct to WordPress
  create: async (accessToken: string, data: CreateBlogData): Promise<{ blog: Blog }> => {
    throw new Error('Please create blog posts directly on WordPress.com: https://blogcertifyer.wordpress.com/wp-admin');
  },

  // Update blog - Direct to WordPress
  update: async (accessToken: string, id: string, data: UpdateBlogData): Promise<{ blog: Blog }> => {
    throw new Error('Please edit blog posts directly on WordPress.com: https://blogcertifyer.wordpress.com/wp-admin');
  },

  // Delete blog - Direct to WordPress
  delete: async (accessToken: string, id: string): Promise<{ success: boolean }> => {
    throw new Error('Please delete blog posts directly on WordPress.com: https://blogcertifyer.wordpress.com/wp-admin');
  },
};