/**
 * Keeps a public tunnel to local :3000 alive.
 * On reconnect (or URL change), updates apps/mobile/src/webUrl.ts so Expo HMR
 * reloads the WebView without a manual scan.
 */
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEB_URL_FILE = join(ROOT, "apps/mobile/src/webUrl.ts");
const QR_URL_FILE = join(ROOT, "apps/mobile/web-public-url.txt");
const LOCAL = "http://127.0.0.1:3000/home";
const HEALTH_MS = 12_000;
const RESTART_DELAY_MS = 2_500;

let currentUrl = "";
let child = null;
let stopping = false;

function log(...args) {
  console.log(`[tunnel] ${new Date().toLocaleTimeString()}`, ...args);
}

function writeMobileUrl(baseUrl) {
  const home = `${baseUrl.replace(/\/$/, "")}/home`;
  if (home === currentUrl) return;
  currentUrl = home;
  const body = `/** Updated automatically by \`npm run tunnel:web\` — do not edit by hand. */\nexport const WEB_APP_URL = ${JSON.stringify(home)};\n`;
  writeFileSync(WEB_URL_FILE, body, "utf8");
  writeFileSync(QR_URL_FILE, home, "utf8");
  log("mobile URL →", home);
}

async function localWebUp() {
  try {
    const res = await fetch(LOCAL, { redirect: "follow" });
    return res.ok;
  } catch {
    return false;
  }
}

async function publicHealthy(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return res.status === 200;
  } catch {
    return false;
  }
}

function killChild() {
  if (!child || child.killed) return;
  try {
    child.kill("SIGTERM");
  } catch {
    /* ignore */
  }
  child = null;
}

function startSshTunnel() {
  return new Promise((resolve) => {
    log("starting localhost.run …");
    const proc = spawn(
      "ssh",
      [
        "-o",
        "StrictHostKeyChecking=accept-new",
        "-o",
        "ServerAliveInterval=15",
        "-o",
        "ServerAliveCountMax=3",
        "-o",
        "ExitOnForwardFailure=yes",
        "-R",
        "80:127.0.0.1:3000",
        "nokey@localhost.run",
      ],
      { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
    );
    child = proc;
    let buf = "";

    const onChunk = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      buf += text;
      const match = buf.match(/https:\/\/[a-z0-9]+\.lhr\.life/i);
      if (match) writeMobileUrl(match[0]);
    };

    proc.stdout.on("data", onChunk);
    proc.stderr.on("data", onChunk);
    proc.on("exit", (code) => {
      log("ssh exited", code);
      if (child === proc) child = null;
      resolve(code);
    });
  });
}

async function healthLoop() {
  while (!stopping) {
    await sleep(HEALTH_MS);
    if (!currentUrl || !child) continue;
    const ok = await publicHealthy(currentUrl);
    if (!ok) {
      log("public URL unhealthy (503/timeout) — restarting tunnel");
      killChild();
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync(join(ROOT, "apps/mobile/src"), { recursive: true });
  log("watching local web at", LOCAL);

  healthLoop();

  while (!stopping) {
    if (!(await localWebUp())) {
      log("local :3000 down — waiting (run npm run dev:web)");
      writeMobileUrl("http://127.0.0.1:3000");
      await sleep(4000);
      continue;
    }
    await startSshTunnel();
    if (stopping) break;
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
