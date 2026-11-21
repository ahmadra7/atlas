import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fromDir = join(root, "apps", "web", "out");
const manifestPath = join(root, ".static-root-files");
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

const previous = existsSync(manifestPath)
  ? readFileSync(manifestPath, "utf8").split("\n").filter(Boolean)
  : [];
for (const rel of previous) {
  const target = join(root, rel);
  if (!existsSync(target)) continue;
  rmSync(target, { recursive: true, force: true });
}

const copied = [];
const { readdirSync, statSync } = await import("node:fs");
for (const name of readdirSync(fromDir)) {
  if (reserved.has(name)) continue;
  const source = join(fromDir, name);
  const target = join(root, name);
  if (existsSync(target) && reserved.has(name)) continue;
  cpSync(source, target, { recursive: true });
  copied.push(name);
}

writeFileSync(manifestPath, `${copied.join("\n")}\n`);
console.log(`Copied ${copied.length} entries from apps/web/out to repo root.`);
