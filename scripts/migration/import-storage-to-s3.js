const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const ROOT = path.resolve(__dirname, "..", "..");
const ENV_FILE = path.join(ROOT, ".env");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnv(ENV_FILE);

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("[error] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const awsConfig = {
  region: process.env.AWS_REGION || "us-east-1",
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  awsConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
  };
}

const s3Client = new S3Client(awsConfig);

const BUCKET_MAPPING = {
  "make-a611b057-uploads": process.env.S3_UPLOADS_BUCKET || "certifyer-dev-uploads",
  "blog-images": process.env.S3_BLOG_IMAGES_BUCKET || "certifyer-dev-blog-images",
};

async function listAllFiles(bucket, folder = "") {
  const files = [];
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 100 });
  if (error) {
    if (error.message && error.message.includes("does not exist")) {
      console.warn(`[warn] Bucket ${bucket} does not exist in Supabase storage.`);
      return [];
    }
    throw error;
  }

  for (const item of data || []) {
    const itemPath = folder ? `${folder}/${item.name}` : item.name;
    // Check if it is a folder (folders have null metadata or no id in standard listing)
    if (!item.id || item.metadata === null) {
      const subFiles = await listAllFiles(bucket, itemPath);
      files.push(...subFiles);
    } else {
      files.push({
        path: itemPath,
        size: item.metadata.size,
        mimetype: item.metadata.mimetype,
      });
    }
  }
  return files;
}

async function migrateFile(supabaseBucket, s3Bucket, fileInfo) {
  console.log(`[info] Downloading ${fileInfo.path} from Supabase (${fileInfo.size} bytes)...`);
  const { data, error } = await supabase.storage.from(supabaseBucket).download(fileInfo.path);

  if (error) {
    console.error(`[error] Failed to download ${fileInfo.path}:`, error.message);
    return false;
  }

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log(`[info] Uploading ${fileInfo.path} to S3 bucket ${s3Bucket}...`);
  try {
    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: fileInfo.path,
      Body: buffer,
      ContentType: fileInfo.mimetype || "application/octet-stream",
    });

    await s3Client.send(command);
    console.log(`[ok] Migrated successfully: ${fileInfo.path}`);
    return true;
  } catch (err) {
    console.error(`[error] Failed to upload ${fileInfo.path} to S3:`, err.message);
    return false;
  }
}

async function main() {
  console.log("[info] Starting storage migration to S3...");

  for (const [supabaseBucket, s3Bucket] of Object.entries(BUCKET_MAPPING)) {
    console.log(`[info] Listing files in Supabase bucket: ${supabaseBucket}...`);
    try {
      const files = await listAllFiles(supabaseBucket);
      console.log(`[info] Found ${files.length} files in ${supabaseBucket}.`);

      let successCount = 0;
      for (const file of files) {
        // Skip hidden/system files if any
        if (file.path.startsWith(".emptyKeep")) continue;

        const success = await migrateFile(supabaseBucket, s3Bucket, file);
        if (success) successCount++;
      }
      console.log(`[done] Bucket ${supabaseBucket} migration complete: ${successCount}/${files.length} migrated.`);
    } catch (err) {
      console.error(`[error] Failed to migrate bucket ${supabaseBucket}:`, err.message);
    }
  }

  console.log("[done] Storage migration complete.");
}

main().catch((err) => {
  console.error("[error] Migration failed:", err.message);
  process.exit(1);
});
