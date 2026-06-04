const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const INPUT_FILE = path.join(ROOT, "supabase", "functions", "make-server-a611b057", "index.ts");
const OUTPUT_DIR = path.join(ROOT, "src", "aws", "server");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "index.ts");

if (!fs.existsSync(INPUT_FILE)) {
  console.error("[error] Input file not found:", INPUT_FILE);
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

let content = fs.readFileSync(INPUT_FILE, "utf8");

console.log("[info] Translating Deno imports to Node.js Hono imports...");
// Replace imports
content = content.replace('import { Hono } from "npm:hono@4";', 'import { Hono } from "hono";');
content = content.replace('import { cors } from "npm:hono/cors";', 'import { cors } from "hono/cors";');
content = content.replace('import { logger } from "npm:hono/logger";', 'import { logger } from "hono/logger";');
content = content.replace('import { createClient } from "jsr:@supabase/supabase-js@2";', 'import { createClient } from "@supabase/supabase-js";\nimport * as storage from "../storage_s3";');
content = content.replace('import * as kv from "./kv_store.tsx";', 'import * as kv from "./kv_store";');
content = content.replace('import * as blog from "./blog.tsx";', 'import * as blog from "./blog";');
content = content.replace('import * as analytics from "./analytics.tsx";', 'import * as analytics from "./analytics";');

console.log("[info] Translating Deno.env to process.env...");
// Replace Deno.env.get with process.env
content = content.replace(/Deno\.env\.get\("([^"]+)"\)!/g, 'process.env["$1"]');
content = content.replace(/Deno\.env\.get\("([^"]+)"\)\s*\?\?\s*""/g, 'process.env["$1"] ?? ""');
content = content.replace(/Deno\.env\.get\("([^"]+)"\)/g, 'process.env["$1"]');

console.log("[info] Replacing Supabase Storage upload and signed URL logic with S3...");
// Replace certificate uploads
const targetUploadSupabase = `    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type || "image/png",
        upsert: true,
      });`;

const replacementUploadS3 = `    // Upload file to S3
    let uploadError = null;
    try {
      await storage.upload(bucketName, fileName, fileBuffer, file.type || "image/png");
    } catch (err) {
      uploadError = err;
    }`;

content = content.replace(targetUploadSupabase, replacementUploadS3);

const targetSignedUrlSupabase = `    // Get signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 31536000); // 1 year in seconds`;

const replacementSignedUrlS3 = `    // Get signed URL (valid for 1 year) from S3
    let signedUrlData = null;
    let signedUrlError = null;
    try {
      const signedUrl = await storage.getSignedUrl(bucketName, fileName, 31536000);
      signedUrlData = { signedURL: signedUrl };
    } catch (err) {
      signedUrlError = err;
    }`;

content = content.replace(targetSignedUrlSupabase, replacementSignedUrlS3);

// Replace getSignedUrl
const targetGetSignedUrlFunction = `// Generate a signed Supabase Storage URL
const getSignedUrl = async (storagePath: string): Promise<string> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const bucket = "digital-products";
  const url = \`\${supabaseUrl}/storage/v1/object/sign/\${bucket}/\${encodeURIComponent(storagePath)}\`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${serviceKey}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  if (!res.ok) return "";
  const data = await res.json();
  return \`\${supabaseUrl}/storage/v1\${data.signedURL}\`;
};`;

const replacementGetSignedUrlFunction = `// Generate a signed S3 Storage URL
const getSignedUrl = async (storagePath: string): Promise<string> => {
  const bucket = process.env.S3_DIGITAL_PRODUCTS_BUCKET || "certifyer-dev-digital-products";
  try {
    return await storage.getSignedUrl(bucket, storagePath, 3600);
  } catch (e) {
    console.error("Error generating S3 pre-signed URL:", e);
    return "";
  }
};`;

content = content.replace(targetGetSignedUrlFunction, replacementGetSignedUrlFunction);

// Replace digital-products upload
const targetDigitalProductsUpload = `    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("digital-products")
      .upload(storagePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });`;

const replacementDigitalProductsUpload = `    let uploadError = null;
    try {
      const bucket = process.env.S3_DIGITAL_PRODUCTS_BUCKET || "certifyer-dev-digital-products";
      await storage.upload(bucket, storagePath, fileBuffer, file.type || "application/octet-stream");
    } catch (err) {
      uploadError = err;
    }`;

content = content.replace(targetDigitalProductsUpload, replacementDigitalProductsUpload);

// Replace initializeStorageBuckets
const targetInitializeStorageBuckets = `// Initialize storage buckets on startup
const initializeStorageBuckets = async () => {
  try {
    console.log("🪣 Initializing storage buckets...");
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(
        bucketName,
        {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        },
      );

      if (createBucketError) {
        console.log("Error creating bucket:", createBucketError);
        return c.json({ error: "Failed to create storage bucket" }, 500);
      }
    }
  } catch (error) {
    console.error("❌ Error initializing storage buckets:", error);
  }
};`;

const replacementInitializeStorageBuckets = `// Initialize storage S3 buckets on startup
const initializeStorageBuckets = async () => {
  try {
    console.log("🪣 Initializing S3 storage buckets...");
    await storage.createBucketIfNotExists(process.env.S3_UPLOADS_BUCKET || "certifyer-dev-uploads");
    await storage.createBucketIfNotExists(process.env.S3_BLOG_IMAGES_BUCKET || "certifyer-dev-blog-images");
    await storage.createBucketIfNotExists(process.env.S3_DIGITAL_PRODUCTS_BUCKET || "certifyer-dev-digital-products");
  } catch (error) {
    console.error("❌ Error initializing S3 storage buckets:", error);
  }
};`;

content = content.replace(targetInitializeStorageBuckets, replacementInitializeStorageBuckets);

fs.writeFileSync(OUTPUT_FILE, content, "utf8");
console.log("[done] Server translated successfully to:", OUTPUT_FILE);
