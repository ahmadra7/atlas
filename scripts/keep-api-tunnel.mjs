/**
 * Keeps a public HTTPS tunnel to local Nest API (:4000) alive.
 * Writes apps/web/public/atlas-runtime-config.json so Netlify static
 * can call the live catalog (admin edits) while this PC stays online.
 */
import { spawn } from "node:child_process";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = join(ROOT, "apps", "web", "public", "atlas-runtime-config.json");
const ROOT_CONFIG_PATH = join(ROOT, "atlas-runtime-config.json");
const SSH_KEY = join(homedir(), ".ssh", "atlas_localhost_run");
const LOCAL = "http://127.0.0.1:4000/api";
const RESTART_DELAY_MS = 2_000;
const PING_MS = 20_000;

let currentUrl = "";
let child = null;
let stopping = false;
let pingTimer = null;

function log(...args) {
  console.log(`[api-tunnel] ${new Date().toLocaleTimeString()}`, ...args);
}

function writeConfig(apiBase) {
  if (apiBase === currentUrl) return;
  currentUrl = apiBase;
  const body = `${JSON.stringify(
    { apiMode: "http", apiUrl: apiBase },
    null,
    2,
  )}\n`;
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, body, "utf8");
  writeFileSync(ROOT_CONFIG_PATH, body, "utf8");
  log("runtime config →", apiBase);
}

function grabUrl(text) {
  const lhr = text.match(/https:\/\/[a-z0-9]+\.lhr\.(?:life|rocks)/i);
  if (lhr) return lhr[0].replace(/\/$/, "");
  const random = text.match(/https:\/\/[a-f0-9]{8,}\.localhost\.run/i);
  if (random) return random[0].replace(/\/$/, "");
  return null;
}

async function localApiUp() {
  try {
    const res = await fetch(LOCAL, { redirect: "follow" });
    return res.ok || res.status === 404 || res.status === 401;
  } catch {
    return false;
  }
}

function stopPing() {
  if (pingTimer != null) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
}

function startPing() {
  stopPing();
  pingTimer = setInterval(() => {
    const url = currentUrl;
    if (!url) return;
    fetch(`${url}/api`, { redirect: "follow" }).catch(() => {});
  }, PING_MS);
}

function killChild() {
  if (!child) return;
  try {
    child.kill();
  } catch {
    /* ignore */
  }
  child = null;
}

function startSsh(useKey) {
  const args = [
    "-o",
    "StrictHostKeyChecking=accept-new",
    "-o",
    "ServerAliveInterval=20",
    "-o",
    "ServerAliveCountMax=4",
    "-o",
    "TCPKeepAlive=yes",
    "-o",
    "ExitOnForwardFailure=yes",
    "-R",
    "80:127.0.0.1:4000",
  ];
  if (useKey && existsSync(SSH_KEY)) {
    args.push(
      "-i",
      SSH_KEY,
      "-o",
      "IdentitiesOnly=yes",
      "-o",
      "PreferredAuthentications=publickey",
      "localhost.run",
    );
    log("starting localhost.run with SSH key …");
  } else {
    args.push("nokey@localhost.run");
    log("starting localhost.run as nokey …");
  }
  return new Promise((resolve) => {
    const proc = spawn("ssh", args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    child = proc;
    const onChunk = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      const url = grabUrl(text);
      if (url) {
        writeConfig(url);
        startPing();
      }
    };
    proc.stdout.on("data", onChunk);
    proc.stderr.on("data", onChunk);
    proc.on("exit", (code) => {
      log("tunnel exited", code);
      stopPing();
      if (child === proc) child = null;
      resolve(code);
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync(join(homedir(), ".ssh"), { recursive: true });
  log("watching local API at", LOCAL);
  let preferKey = existsSync(SSH_KEY);

  while (!stopping) {
    if (!(await localApiUp())) {
      log("local :4000 down — waiting (run npm run dev:api)");
      await sleep(4000);
      continue;
    }
    const code = await startSsh(preferKey);
    if (stopping) break;
    if (preferKey && code === 255) {
      log("key auth failed — next attempt uses nokey");
      preferKey = false;
    }
    currentUrl = "";
    log(`reconnect in ${RESTART_DELAY_MS}ms`);
    await sleep(RESTART_DELAY_MS);
  }
}

process.on("SIGINT", () => {
  stopping = true;
  killChild();
  process.exit(0);
});
process.on("SIGTERM", () => {
  stopping = true;
  killChild();
  process.exit(0);
});

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
