/**
 * Keeps a public HTTPS tunnel to local Nest API (:4000) alive.
 * Writes atlas-runtime-config.json (http mode) and pushes it to Netlify
 * so the static app reads the live catalog while this PC stays online.
 *
 * Backends (corp-friendly first):
 *   1) Pinggy SSH over :443
 *   2) localhost.run SSH over :443
 *   3) localhost.run SSH over :22
 *   4) localtunnel (npx)
 */
import { spawn } from "node:child_process";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deployRuntimeConfig } from "./deploy-runtime-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = join(ROOT, "apps", "web", "public", "atlas-runtime-config.json");
const ROOT_CONFIG_PATH = join(ROOT, "atlas-runtime-config.json");
const SSH_KEY = join(homedir(), ".ssh", "atlas_localhost_run");
const LOCAL = "http://127.0.0.1:4000/api";
const RESTART_DELAY_MS = 2_500;
const PING_MS = 20_000;

/** @typedef {"pinggy443" | "lhr443" | "lhr22" | "localtunnel"} Backend */

/** @type {Backend[]} */
const BACKENDS = ["pinggy443", "lhr443", "lhr22", "localtunnel"];

let currentUrl = "";
let child = null;
let stopping = false;
let pingTimer = null;
let deployTimer = null;
let backendIndex = 0;

function log(...args) {
  console.log(`[api-tunnel] ${new Date().toLocaleTimeString()}`, ...args);
}

function scheduleDeploy() {
  if (deployTimer != null) clearTimeout(deployTimer);
  deployTimer = setTimeout(() => {
    deployTimer = null;
    try {
      const result = deployRuntimeConfig();
      if (result.ok && !result.skipped) {
        log("Netlify runtime config deployed");
      } else if (!result.ok) {
        log("Netlify deploy skipped/failed:", result.reason ?? "unknown");
      }
    } catch (err) {
      log("Netlify deploy error:", err?.message ?? err);
    }
  }, 2_500);
}

function writeConfig(apiBase) {
  const cleaned = apiBase.replace(/\/$/, "");
  if (cleaned === currentUrl) return;
  currentUrl = cleaned;
  const body = `${JSON.stringify(
    { apiMode: "http", apiUrl: cleaned },
    null,
    2,
  )}\n`;
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, body, "utf8");
  writeFileSync(ROOT_CONFIG_PATH, body, "utf8");
  log("runtime config →", cleaned);
  scheduleDeploy();
}

function grabUrl(text) {
  const patterns = [
    /https:\/\/[a-z0-9-]+\.a\.pinggy\.io/i,
    /https:\/\/[a-z0-9-]+\.pinggy\.link/i,
    /https:\/\/[a-z0-9-]+\.lhr\.(?:life|rocks)/i,
    /https:\/\/[a-f0-9]{8,}\.localhost\.run/i,
    /https:\/\/[a-z0-9-]+\.loca\.lt/i,
    /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i,
    /your url is:\s*(https:\/\/\S+)/i,
    /(?:http|https):\/\/[a-z0-9.-]+\.(?:pinggy|lhr|loca|localhost\.run)\S*/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const raw = (m[1] ?? m[0]).replace(/[)>'",]+$/g, "");
    if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  }
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
    fetch(`${url}/api/health`, { redirect: "follow" }).catch(() => {});
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

/**
 * @param {string[]} args
 * @param {string} label
 */
function runProcess(command, args, label, { shell = false } = {}) {
  return new Promise((resolve) => {
    log(`starting ${label} …`);
    const proc = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      shell,
      cwd: ROOT,
      env: process.env,
    });
    child = proc;
    let gotUrl = false;
    const onChunk = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      const url = grabUrl(text);
      if (url && !gotUrl) {
        gotUrl = true;
        writeConfig(url);
        startPing();
      }
    };
    proc.stdout.on("data", onChunk);
    proc.stderr.on("data", onChunk);
    proc.on("exit", (code) => {
      log(`${label} exited`, code);
      stopPing();
      if (child === proc) child = null;
      resolve({ code: code ?? 1, gotUrl });
    });
  });
}

function startPinggy443() {
  return runProcess(
    "ssh",
    [
      "-p",
      "443",
      "-o",
      "StrictHostKeyChecking=accept-new",
      "-o",
      "ConnectTimeout=25",
      "-o",
      "ServerAliveInterval=20",
      "-o",
      "ServerAliveCountMax=4",
      "-o",
      "ExitOnForwardFailure=yes",
      "-R",
      "0:127.0.0.1:4000",
      "a.pinggy.io",
    ],
    "pinggy :443",
  );
}

function startLhr443() {
  return runProcess(
    "ssh",
    [
      "-p",
      "443",
      "-o",
      "StrictHostKeyChecking=accept-new",
      "-o",
      "ConnectTimeout=20",
      "-o",
      "ServerAliveInterval=20",
      "-o",
      "ExitOnForwardFailure=yes",
      "-R",
      "80:127.0.0.1:4000",
      "nokey@ssh.localhost.run",
    ],
    "localhost.run :443",
  );
}

function startLhr22(useKey) {
  const args = [
    "-o",
    "StrictHostKeyChecking=accept-new",
    "-o",
    "ConnectTimeout=15",
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
  } else {
    args.push("nokey@localhost.run");
  }
  return runProcess("ssh", args, "localhost.run :22");
}

function startLocalTunnel() {
  return runProcess(
    "npx",
    ["--yes", "localtunnel", "--port", "4000"],
    "localtunnel",
    { shell: true },
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runBackend(backend) {
  switch (backend) {
    case "pinggy443":
      return startPinggy443();
    case "lhr443":
      return startLhr443();
    case "lhr22":
      return startLhr22(existsSync(SSH_KEY));
    case "localtunnel":
      return startLocalTunnel();
    default:
      return { code: 1, gotUrl: false };
  }
}

async function main() {
  mkdirSync(join(homedir(), ".ssh"), { recursive: true });
  log("watching local API at", LOCAL);

  while (!stopping) {
    if (!(await localApiUp())) {
      log("local :4000 down — waiting (run npm run dev:api)");
      await sleep(4000);
      continue;
    }

    const backend = BACKENDS[backendIndex % BACKENDS.length];
    const { gotUrl } = await runBackend(backend);
    if (stopping) break;

    // If this backend never produced a URL, rotate to the next one.
    if (!gotUrl) {
      backendIndex = (backendIndex + 1) % BACKENDS.length;
      log(`no public URL from ${backend} — next: ${BACKENDS[backendIndex]}`);
    } else {
      // Prefer sticking with a working backend after disconnect.
      log(`reconnect ${backend} in ${RESTART_DELAY_MS}ms`);
    }
    currentUrl = "";
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
