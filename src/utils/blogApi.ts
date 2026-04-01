import { blogService } from "./blogService";

/**
 * Blog API
 * 
 * Fetches blog posts from Certifyer's internal blog management system
 * Platform Admin can create, edit, and publish blog posts from the Platform Admin Panel
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
  source?: 'internal';
}

export const blogApi = {
  // Get all published blogs (public endpoint - no auth required)
  getAllPublished: async (): Promise<{ blogs: Blog[] }> => {
    try {
      console.log('📚 Fetching published blogs from database...');
      
      const posts = await blogService.getAllPublished();
      
      // Map database blog posts to frontend Blog interface
      const blogs: Blog[] = posts.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.featured_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop',
        author: post.author,
        date: post.published_at || post.created_at,
        status: post.status,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        source: 'internal',
      }));
      
      console.log(`✅ Successfully loaded ${blogs.length} blog post${blogs.length !== 1 ? 's' : ''}`);
      return { blogs };
    } catch (error: any) {
      console.error('❌ Error fetching published blogs:', error);
      return { blogs: [] };
    }
  },

  // Get single blog by ID
  getById: async (id: string): Promise<{ blog: Blog }> => {
    try {
      console.log(`🔍 Fetching blog ${id} from database...`);
      
      const post = await blogService.getById(id);
      
      if (!post) {
        throw new Error('Blog post not found');
      }
      
      const blog: Blog = {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.featured_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop',
        author: post.author,
        date: post.published_at || post.created_at,
        status: post.status,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        source: 'internal',
      };
      
      console.log(`✅ Successfully loaded post: ${blog.title}`);
      return { blog };
    } catch (error: any) {
      console.error('❌ Error fetching blog post:', error.message);
      throw error;
    }
  },
};