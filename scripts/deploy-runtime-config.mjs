/**
 * Push atlas-runtime-config.json to Netlify (via git) so the static app
 * picks up a live API tunnel URL without a Next rebuild.
 *
 * Usage:
 *   node scripts/deploy-runtime-config.mjs
 *   ATLAS_SKIP_RUNTIME_DEPLOY=1  → no-op
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT_CONFIG = join(ROOT, "atlas-runtime-config.json");
const PUBLIC_CONFIG = join(
  ROOT,
  "apps",
  "web",
  "public",
  "atlas-runtime-config.json",
);
const FILES = [
  "atlas-runtime-config.json",
  "apps/web/public/atlas-runtime-config.json",
];

function log(...args) {
  console.log(`[runtime-deploy] ${new Date().toLocaleTimeString()}`, ...args);
}

function run(cmd, args) {
  return spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });
}

function readLiveConfig() {
  if (!existsSync(ROOT_CONFIG)) return null;
  try {
    const cfg = JSON.parse(readFileSync(ROOT_CONFIG, "utf8"));
    if (cfg.apiMode === "http" && typeof cfg.apiUrl === "string" && cfg.apiUrl) {
      return cfg;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function deployRuntimeConfig() {
  if (process.env.ATLAS_SKIP_RUNTIME_DEPLOY === "1") {
    log("skipped (ATLAS_SKIP_RUNTIME_DEPLOY=1)");
    return { ok: true, skipped: true };
  }

  const cfg = readLiveConfig();
  if (!cfg) {
    log("no live http config — nothing to deploy");
    return { ok: false, reason: "not-live" };
  }

  if (!existsSync(PUBLIC_CONFIG)) {
    log("missing public config copy:", PUBLIC_CONFIG);
    return { ok: false, reason: "missing-public" };
  }

  const add = run("git", ["add", "--", ...FILES]);
  if (add.status !== 0) {
    log("git add failed:", add.stderr || add.stdout);
    return { ok: false, reason: "git-add" };
  }

  const porcelain = run("git", ["status", "--porcelain", "--", ...FILES]);
  const dirty = (porcelain.stdout || "").trim();
  if (!dirty) {
    log("already up to date on git for", cfg.apiUrl);
    return { ok: true, skipped: true, apiUrl: cfg.apiUrl };
  }

  const msg = `chore: point Netlify at live API ${cfg.apiUrl}`;
  const commit = run("git", ["commit", "-m", msg]);
  if (commit.status !== 0) {
    log("git commit failed:", commit.stderr || commit.stdout);
    return { ok: false, reason: "git-commit" };
  }

  const push = run("git", ["push"]);
  if (push.status !== 0) {
    log("git push failed:", push.stderr || push.stdout);
    return { ok: false, reason: "git-push" };
  }

  log("pushed live config →", cfg.apiUrl);
  return { ok: true, apiUrl: cfg.apiUrl };
}

if (process.argv[1]?.includes("deploy-runtime-config")) {
  const result = deployRuntimeConfig();
  if (!result.ok && !result.skipped) process.exit(1);
}
