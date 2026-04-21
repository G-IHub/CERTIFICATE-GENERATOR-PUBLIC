import { Hono } from "npm:hono@4";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Helper to generate IDs
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Helper to generate slugs
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// Shared handler for GET all posts (handles both / and no-slash via router)
const getAllPosts = async (c: any) => {
  try {
    const posts = await kv.getByPrefix("blog:post:");
    // Sort descending by created_at
    posts.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return c.json({ posts });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
};

// GET / and GET "" - Get all blog posts (supports draft and published)
app.get("/", getAllPosts);
app.get("", getAllPosts);

// GET /published - Get all published blog posts
app.get("/published", async (c) => {
  try {
    const allPosts = await kv.getByPrefix("blog:post:");
    const posts = allPosts.filter((p: any) => p.status === "published");
    posts.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return c.json({ posts });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// GET /:id - Get a single blog post
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const post = await kv.get(`blog:post:${id}`);

    if (!post) {
      return c.json({ error: "Blog post not found" }, 404);
    }

    return c.json({ post });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Shared handler for POST new post
const createPost = async (c: any) => {
  try {
    const data = await c.req.json();

    if (!data.title || !data.content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    const id = generateId();
    const slug = generateSlug(data.title);

    const post = {
      id,
      ...data,
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at:
        data.status === "published" ? new Date().toISOString() : null,
    };

    await kv.set(`blog:post:${id}`, post);

    return c.json({ post });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
};

// POST / and POST "" - Create a new blog post
app.post("/", createPost);
app.post("", createPost);

// PUT /:id - Update an existing blog post
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();

    const existingPost = await kv.get(`blog:post:${id}`);

    if (!existingPost) {
      return c.json({ error: "Blog post not found" }, 404);
    }

    const post = {
      ...existingPost,
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Update slug if title changed, though not strictly required
    if (data.title && data.title !== existingPost.title) {
      post.slug = generateSlug(data.title);
    }

    // Set published_at if status changed to published
    if (data.status === "published" && existingPost.status !== "published") {
      post.published_at = new Date().toISOString();
    }

    await kv.set(`blog:post:${id}`, post);

    return c.json({ post });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// DELETE /:id - Delete a blog post
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const post = await kv.get(`blog:post:${id}`);
    if (!post) {
      return c.json({ error: "Blog post not found" }, 404);
    }

    await kv.del(`blog:post:${id}`);

    return c.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

export default app;
