CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  slug TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published blog posts are viewable by everyone"
  ON blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Blog images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can update blog images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can delete blog images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');
