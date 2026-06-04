const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const BATCH_DIR = path.join(
  ROOT,
  "migration-output",
  "aws",
  "dynamodb-batches",
);
const MANIFEST = path.join(BATCH_DIR, "manifest.json");

if (!fs.existsSync(MANIFEST)) {
  console.error("[error] Manifest not found:", MANIFEST);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const batchFiles = manifest.batchFiles || [];
const tableName = manifest.tableName || "certifyer-dev-kv";

function runAwsBatch(filePath) {
  const args = [
    "dynamodb",
    "batch-write-item",
    "--request-items",
    `file://${filePath}`,
    "--output",
    "json",
  ];
  const maxRetries = 5;
  let attempt = 0;
  let lastErr = null;

  while (attempt < maxRetries) {
    attempt += 1;
    console.log(
      `[info] Applying ${path.basename(filePath)} (attempt ${attempt}/${maxRetries})`,
    );
    const res = spawnSync("aws", args, { encoding: "utf8" });

    if (res.error) {
      lastErr = res.error;
      console.error("[warn] aws CLI execution error:", res.error.message);
    } else if (res.status !== 0) {
      lastErr = new Error(res.stderr || `Exit ${res.status}`);
      console.error(
        "[warn] aws CLI returned non-zero:",
        res.stderr || res.stdout,
      );
    } else {
      // parse JSON output to detect UnprocessedItems
      try {
        const out = JSON.parse(res.stdout || "{}");
        const unprocessed = out.UnprocessedItems || {};
        const tableUnprocessed = unprocessed[tableName] || [];
        if (tableUnprocessed && tableUnprocessed.length > 0) {
          console.warn(
            `[warn] ${tableUnprocessed.length} unprocessed items returned; will retry after backoff.`,
          );
          lastErr = new Error("UnprocessedItems present");
        } else {
          console.log(
            "[ok] Batch applied successfully:",
            path.basename(filePath),
          );
          return true;
        }
      } catch (e) {
        // If parsing fails, treat as success if status=0
        console.log(
          "[ok] aws CLI returned non-error but output unparsed; assuming success.",
        );
        return true;
      }
    }

    // exponential backoff
    const backoffMs = Math.min(30000, 2000 * Math.pow(2, attempt));
    console.log(`[info] Backing off ${backoffMs}ms before retry...`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, backoffMs);
  }

  console.error(
    "[error] Failed to apply batch after retries:",
    filePath,
    lastErr && lastErr.message,
  );
  return false;
}

(async function main() {
  console.log(
    `[info] Applying ${batchFiles.length} batch files to DynamoDB table: ${tableName}`,
  );

  for (const f of batchFiles) {
    const filePath = path.join(BATCH_DIR, f);
    if (!fs.existsSync(filePath)) {
      console.error("[error] Batch file missing:", filePath);
      process.exit(1);
    }

    const ok = runAwsBatch(filePath);
    if (!ok) {
      console.error(
        "[error] Stopping due to failed batch. Inspect logs and retry the failed file.",
      );
      process.exit(1);
    }
  }

  console.log("[done] All batches applied successfully.");
})();
