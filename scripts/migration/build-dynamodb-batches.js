const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const INPUT_FILE = path.join(
  ROOT,
  "migration-output",
  "supabase",
  "kv_store_a611b057.json",
);
const OUTPUT_DIR = path.join(
  ROOT,
  "migration-output",
  "aws",
  "dynamodb-batches",
);
const MAX_BATCH_SIZE = 25;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toAttrValue(value) {
  if (value === null || value === undefined) {
    return { NULL: true };
  }

  if (typeof value === "string") {
    return { S: value };
  }

  if (typeof value === "number") {
    return { N: String(value) };
  }

  if (typeof value === "boolean") {
    return { BOOL: value };
  }

  if (Array.isArray(value)) {
    return { L: value.map((item) => toAttrValue(item)) };
  }

  if (typeof value === "object") {
    const mapped = {};
    for (const [k, v] of Object.entries(value)) {
      mapped[k] = toAttrValue(v);
    }
    return { M: mapped };
  }

  return { S: String(value) };
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function run() {
  const tableName =
    process.argv[2] || process.env.DYNAMODB_TABLE_NAME || "certifyer-dev-kv";

  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input export file not found: ${INPUT_FILE}`);
  }

  const payload = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  const rows = Array.isArray(payload.rows) ? payload.rows : [];

  if (rows.length === 0) {
    throw new Error("No KV rows found in export payload.");
  }

  const putRequests = rows.map((row) => ({
    PutRequest: {
      Item: {
        key: { S: String(row.key) },
        value: toAttrValue(row.value),
      },
    },
  }));

  const batches = chunk(putRequests, MAX_BATCH_SIZE);
  ensureDir(OUTPUT_DIR);

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceFile: INPUT_FILE,
    tableName,
    rowCount: rows.length,
    batchFiles: [],
  };

  batches.forEach((batch, idx) => {
    const fileName = `batch-${String(idx + 1).padStart(4, "0")}.json`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    const body = {
      RequestItems: {
        [tableName]: batch,
      },
    };
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");
    manifest.batchFiles.push(fileName);
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  console.log(
    `[ok] Generated ${batches.length} DynamoDB batch file(s) in ${OUTPUT_DIR}`,
  );
  console.log(`[info] Target table: ${tableName}`);
  console.log("[next] Apply each file with:");
  console.log(
    "aws dynamodb batch-write-item --request-items file://migration-output/aws/dynamodb-batches/batch-0001.json",
  );
}

try {
  run();
} catch (err) {
  console.error("[error]", err.message);
  process.exit(1);
}
