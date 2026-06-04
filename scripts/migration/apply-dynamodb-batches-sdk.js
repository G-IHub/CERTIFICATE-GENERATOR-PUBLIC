const fs = require("fs");
const path = require("path");
const { DynamoDBClient, BatchWriteItemCommand } = require("@aws-sdk/client-dynamodb");

const ROOT = path.resolve(__dirname, "..", "..");
const BATCH_DIR = path.join(ROOT, "migration-output", "aws", "dynamodb-batches");
const MANIFEST = path.join(BATCH_DIR, "manifest.json");
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

if (!fs.existsSync(MANIFEST)) {
  console.error("[error] Manifest not found:", MANIFEST);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const batchFiles = manifest.batchFiles || [];
const tableName = manifest.tableName || "certifyer-dev-kv";

// Configure client with env credentials, or default provider if not provided
const clientConfig = {
  region: process.env.AWS_REGION || "us-east-1",
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
  };
  console.log("[info] Using AWS credentials from .env");
} else {
  console.log("[info] AWS credentials not found in .env, falling back to default SDK credentials provider");
}

const dynamoClient = new DynamoDBClient(clientConfig);

// Helper to delay execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAwsBatch(filePath) {
  const fileContent = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let requestItems = fileContent.RequestItems;

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt += 1;
    console.log(`[info] Applying ${path.basename(filePath)} (attempt ${attempt}/${maxRetries})`);

    try {
      const command = new BatchWriteItemCommand({ RequestItems: requestItems });
      const response = await dynamoClient.send(command);

      const unprocessed = response.UnprocessedItems || {};
      const tableUnprocessed = unprocessed[tableName] || [];

      if (tableUnprocessed.length > 0) {
        console.warn(`[warn] ${tableUnprocessed.length} unprocessed items returned; will retry remaining after backoff.`);
        requestItems = unprocessed; // Setup for retry
      } else {
        console.log(`[ok] Batch applied successfully: ${path.basename(filePath)}`);
        return true;
      }
    } catch (err) {
      console.error(`[warn] Error executing batch write on attempt ${attempt}:`, err.message);
      if (attempt === maxRetries) {
        console.error("[error] Failed to apply batch after maximum retries:", filePath, err.message);
        return false;
      }
    }

    const backoffMs = Math.min(30000, 2000 * Math.pow(2, attempt));
    console.log(`[info] Backing off ${backoffMs}ms before retry...`);
    await sleep(backoffMs);
  }

  return false;
}

(async function main() {
  console.log(`[info] Applying ${batchFiles.length} batch files to DynamoDB table: ${tableName}`);

  for (const f of batchFiles) {
    const filePath = path.join(BATCH_DIR, f);
    if (!fs.existsSync(filePath)) {
      console.error("[error] Batch file missing:", filePath);
      process.exit(1);
    }

    const ok = await runAwsBatch(filePath);
    if (!ok) {
      console.error("[error] Stopping due to failed batch. Inspect logs and retry the failed file.");
      process.exit(1);
    }
  }

  console.log("[done] All batches applied successfully.");
})();
