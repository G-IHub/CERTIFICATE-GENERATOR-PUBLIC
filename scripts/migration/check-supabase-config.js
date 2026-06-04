const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const ENV_FILE = path.join(ROOT, ".env");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

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

function getRefFromUrl(url) {
  try {
    return new URL(url).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

function statusLine(name, pass, details) {
  const mark = pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${name}: ${details}`);
}

function run() {
  loadDotEnv(ENV_FILE);

  const supabaseUrl = process.env.SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const urlRef = getRefFromUrl(supabaseUrl);
  const anonRef = decodeJwtRef(anonKey);
  const serviceRef = decodeJwtRef(serviceKey);

  if (!supabaseUrl) {
    statusLine("SUPABASE_URL", false, "Missing SUPABASE_URL in .env");
  } else {
    statusLine(
      "SUPABASE_URL",
      true,
      `Project ref from URL: ${urlRef || "unknown"}`,
    );
  }

  statusLine(
    "SUPABASE_ANON_KEY",
    !!anonRef,
    anonRef ? `Project ref from key: ${anonRef}` : "Could not decode anon key",
  );

  statusLine(
    "SUPABASE_SERVICE_ROLE_KEY",
    !!serviceRef,
    serviceRef
      ? `Project ref from key: ${serviceRef}`
      : "Could not decode service role key",
  );

  const refs = [urlRef, anonRef, serviceRef].filter(Boolean);
  const allMatch = refs.length >= 2 && refs.every((ref) => ref === refs[0]);

  statusLine(
    "Overall alignment",
    allMatch,
    allMatch
      ? `All refs aligned to ${refs[0]}`
      : `Refs mismatch. URL=${urlRef || "n/a"}, ANON=${anonRef || "n/a"}, SERVICE=${serviceRef || "n/a"}`,
  );

  if (!allMatch) {
    process.exit(1);
  }
}

run();
