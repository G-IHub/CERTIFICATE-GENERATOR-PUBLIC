const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const INPUT_FILE = path.join(ROOT, "migration-output", "supabase", "blog_posts.json");

if (!fs.existsSync(INPUT_FILE)) {
  console.warn("[info] blog_posts.json not found. Assuming no SQL blog posts to migrate.");
  process.exit(0);
}

const payload = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
const rows = payload.rows || [];

if (rows.length === 0) {
  console.log("[info] 0 blog rows in SQL export. Note: This project stores blog posts in the KV store (DynamoDB), so they will be migrated automatically as part of the DynamoDB batch import.");
  console.log("[ok] No SQL blog post migration required.");
  process.exit(0);
}

console.log(`[info] Found ${rows.length} SQL blog posts to migrate.`);
console.log("[info] RDS PostgreSQL host is not configured. Skipping SQL import since all blog posts are managed via DynamoDB.");
process.exit(0);
