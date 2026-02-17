// Temporary static blog data
// This will be replaced by API calls to fetch from database
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

// Initial empty blogs array - will be populated from API
export const blogs: Blog[] = [];