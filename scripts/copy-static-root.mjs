import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fromDir = join(root, "apps", "web", "out");
const manifestPath = join(root, ".static-root-files");
const rootConfigPath = join(root, "atlas-runtime-config.json");
const reserved = new Set([
  ".git",
  ".github",
  ".gitignore",
  ".nvmrc",
  ".static-root-files",
  "AGENTS.md",
  "HOME-URL.txt",
  "README.md",
  "apps",
  "docs",
  "netlify.toml",
  "netlify",
  "node_modules",
  "package-lock.json",
  "package.json",
  "packages",
  "scripts",
  "vercel.json",
]);

if (!existsSync(fromDir)) {
  throw new Error("Missing apps/web/out. Run npm run build -w @atlas/web first.");
}

/** Keep live tunnel URL across publish:static (mock build must not clobber it). */
function readPreservedLiveConfig() {
  const fromEnv = process.env.ATLAS_LIVE_API_URL?.trim();
  if (fromEnv) {
    return {
      apiMode: "http",
      apiUrl: fromEnv.replace(/\/$/, ""),
    };
  }
  if (!existsSync(rootConfigPath)) return null;
  try {
    const cfg = JSON.parse(readFileSync(rootConfigPath, "utf8"));
    if (cfg.apiMode === "http" && typeof cfg.apiUrl === "string" && cfg.apiUrl.trim()) {
      return {
        apiMode: "http",
        apiUrl: cfg.apiUrl.replace(/\/$/, ""),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

const preservedLive = readPreservedLiveConfig();

const previous = existsSync(manifestPath)
  ? readFileSync(manifestPath, "utf8").split("\n").filter(Boolean)
  : [];
for (const rel of previous) {
  const target = join(root, rel);
  if (!existsSync(target)) continue;
  // Never wipe a live runtime config mid-publish; restore after copy.
  if (rel === "atlas-runtime-config.json" && preservedLive) continue;
  rmSync(target, { recursive: true, force: true });
}

const copied = [];
const { readdirSync, statSync } = await import("node:fs");
for (const name of readdirSync(fromDir)) {
  if (reserved.has(name)) continue;
  const source = join(fromDir, name);
  const target = join(root, name);
  if (existsSync(target) && reserved.has(name)) continue;
  if (name === "atlas-runtime-config.json" && preservedLive) {
    copied.push(name);
    continue;
  }
  cpSync(source, target, { recursive: true });
  copied.push(name);
}

if (preservedLive) {
  writeFileSync(
    rootConfigPath,
    `${JSON.stringify(preservedLive, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `Preserved live runtime config → ${preservedLive.apiUrl}`,
  );
}

writeFileSync(manifestPath, `${copied.join("\n")}\n`);
console.log(`Copied ${copied.length} entries from apps/web/out to repo root.`);
