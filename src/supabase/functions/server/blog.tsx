import { Hono } from "npm:hono@4";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

export default app;

/**
 * Upload blog image to Supabase Storage
 */
export async function uploadBlogImage(c: any) {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const bucketName = "make-a611b057-blog-images";

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === bucketName);

    if (!bucketExists) {
      console.log(`📦 Creating blog images bucket: ${bucketName}`);
      const { error: bucketError } = await supabase.storage.createBucket(
        bucketName,
        { public: true },
      );

      if (bucketError) {
        console.error("❌ Error creating bucket:", bucketError);
        return c.json({ error: "Failed to create storage bucket", details: bucketError.message }, 500);
      }
    }

    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "file is required" }, 400);
    }

    const ext = file.name.split(".").pop();
    const filename = `platform/${crypto.randomUUID()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, uint8Array, { contentType: file.type, upsert: false });

    if (error) {
      return c.json({ error: "Failed to upload image", details: error.message }, 500);
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filename);

    return c.json({ url: urlData.publicUrl, filename: data.path, message: "Image uploaded successfully" });
  } catch (error) {
    return c.json({ error: "Failed to upload image", details: String(error) }, 500);
  }
}

/**
 * Get all blog posts for an organization
 */
export async function getBlogPosts(c: any) {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const orgId = c.req.query("orgId");
    let query = supabase.from("blog_posts_a611b057").select("*").order("created_at", { ascending: false });
    if (orgId) query = query.eq("organization_id", orgId);
    const { data, error } = await query;
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ posts: data ?? [] });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPost(c: any) {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const id = c.req.param("id");
    const { data, error } = await supabase
      .from("blog_posts_a611b057")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    if (!data) return c.json({ error: "Post not found" }, 404);
    return c.json({ post: data });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
}
