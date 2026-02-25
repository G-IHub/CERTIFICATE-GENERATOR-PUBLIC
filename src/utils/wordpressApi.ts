/**
 * WordPress.com REST API Integration
 * Fetches blog posts from WordPress.com site
 */

const WORDPRESS_BASE_URL = "https://public-api.wordpress.com/wp/v2/sites/blogcertifyer.wordpress.com";

export interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'author'?: Array<{
      name: string;
    }>;
  };
}

/**
 * Strips HTML tags from a string
 */
function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Fetches all published posts from WordPress.com
 */
export async function fetchWordPressPostsPublished(): Promise<WordPressPost[]> {
  try {
    console.log(`📡 Fetching from WordPress: ${WORDPRESS_BASE_URL}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const url = `${WORDPRESS_BASE_URL}/posts?_embed&per_page=100`;
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ WordPress API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const posts = await response.json();
    console.log(`✅ SUCCESS! Fetched ${posts.length} posts from WordPress`);
    
    if (posts.length > 0) {
      console.log('📝 First post:', posts[0].title.rendered);
    }
    
    return posts;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`⏱️ WordPress fetch timeout`);
    } else {
      console.error(`❌ Failed to fetch WordPress posts:`, error);
    }
    return [];
  }
}

/**
 * Fetches a single post from WordPress.com by ID
 */
export async function fetchWordPressPostById(id: number): Promise<WordPressPost | null> {
  try {
    console.log(`📡 Fetching post ${id} from WordPress`);
    const response = await fetch(
      `${WORDPRESS_BASE_URL}/posts/${id}?_embed`,
      {
        method: 'GET',
        mode: 'cors',
      }
    );

    if (!response.ok) {
      console.error('WordPress API error:', response.status, response.statusText);
      return null;
    }

    const post = await response.json();
    console.log('✅ Fetched post from WordPress:', post.title.rendered);
    return post;
  } catch (error) {
    console.error(`Failed to fetch post ${id}:`, error);
    return null;
  }
}

/**
 * Fetches a single post from WordPress.com by slug
 */
export async function fetchWordPressPostBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_BASE_URL}/posts?_embed&slug=${slug}`,
      {
        method: 'GET',
        mode: 'cors',
      }
    );

    if (!response.ok) {
      console.error('WordPress API error:', response.status, response.statusText);
      return null;
    }

    const posts = await response.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error('Failed to fetch WordPress post by slug:', error);
    return null;
  }
}

/**
 * Maps WordPress post to our Blog interface
 */
export function mapWordPressPostToBlog(wp: WordPressPost): {
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
} {
  // Get featured image URL
  const featuredImage = wp._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const defaultImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop';
  
  // Get author name
  const authorName = wp._embedded?.['author']?.[0]?.name || 'Certifyer Team';

  return {
    id: `wp-${wp.id}`, // Prefix with 'wp-' to distinguish from backend posts
    title: wp.title.rendered,
    excerpt: stripHtml(wp.excerpt.rendered),
    content: wp.content.rendered, // Keep HTML for rendering
    image: featuredImage || defaultImage,
    author: authorName,
    date: wp.date,
    status: 'published',
    createdAt: wp.date,
    updatedAt: wp.modified,
    source: 'wordpress',
  };
}