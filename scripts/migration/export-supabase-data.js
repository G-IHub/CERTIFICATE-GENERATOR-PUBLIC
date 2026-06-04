const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.join(ROOT, "migration-output", "supabase");
const PAGE_SIZE = 1000;
const ENV_FILE = path.join(ROOT, ".env");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const idx = line.indexOf("=");
    if (idx <= 0) {
      continue;
    }

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

function decodeJwtRef(jwt) {
  try {
    const parts = String(jwt || "").split(".");
    if (parts.length < 2) return null;
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return decoded.ref || null;
  } catch {
    return null;
  }
}

function getProjectRefFromUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

async function fetchAllRows(client, tableName, orderByField) {
  const rows = [];
  let offset = 0;

  while (true) {
    const { data, error } = await client
      .from(tableName)
      .select("*")
      .order(orderByField, { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(
        `Failed to fetch ${tableName} (offset ${offset}): ${error.message}`,
      );
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);
    offset += data.length;

    if (data.length < PAGE_SIZE) {
      break;
    }
  }

  return rows;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

async function run() {
  loadDotEnv(ENV_FILE);

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing required env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.",
    );
  }

  const urlRef = getProjectRefFromUrl(supabaseUrl);
  const keyRef = decodeJwtRef(serviceRoleKey);
  if (urlRef && keyRef && urlRef !== keyRef) {
    console.warn(
      `[warn] SUPABASE_URL project ref (${urlRef}) does not match service role key ref (${keyRef}).`,
    );
    console.warn(
      "[warn] Export may fail or read from an unexpected project if credentials are mixed.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  ensureDir(OUT_DIR);

  console.log("[1/2] Exporting kv_store_a611b057...");
  const kvRows = await fetchAllRows(supabase, "kv_store_a611b057", "key");
  const kvOut = {
    exportedAt: new Date().toISOString(),
    sourceProjectRef: urlRef,
    table: "kv_store_a611b057",
    count: kvRows.length,
    rows: kvRows,
  };
  writeJson(path.join(OUT_DIR, "kv_store_a611b057.json"), kvOut);
  console.log(`[ok] Exported ${kvRows.length} KV rows.`);

  console.log("[2/2] Exporting blog_posts...");
  try {
    const blogRows = await fetchAllRows(supabase, "blog_posts", "created_at");
    const blogOut = {
      exportedAt: new Date().toISOString(),
      sourceProjectRef: urlRef,
      table: "blog_posts",
      count: blogRows.length,
      rows: blogRows,
    };
    writeJson(path.join(OUT_DIR, "blog_posts.json"), blogOut);
    console.log(`[ok] Exported ${blogRows.length} blog rows.`);
  } catch (err) {
    console.warn(`[warn] Could not export blog_posts table (might not exist or be unused): ${err.message}`);
    const blogOut = {
      exportedAt: new Date().toISOString(),
      sourceProjectRef: urlRef,
      table: "blog_posts",
      count: 0,
      rows: [],
    };
    writeJson(path.join(OUT_DIR, "blog_posts.json"), blogOut);
  }

  console.log("[done] Supabase export completed.");
  console.log(`[path] ${OUT_DIR}`);
}

run().catch((err) => {
  console.error("[error]", err.message);
  process.exit(1);
});
