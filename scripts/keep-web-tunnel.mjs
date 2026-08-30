/**
 * Keeps a public HTTPS tunnel to local :3000 alive.
 *
 * Phone-facing: localhost.run (SSH). Cloudflare quick tunnels often 1033 on
 * Iranian phones, so they are not used as the primary URL.
 *
 * A dedicated SSH key (not nokey@) keeps the same free domain across reconnects
 * for longer. Anonymous nokey tunnels rotate and idle-timeout.
 *
 * HTTP pings through the public URL stop localhost.run's inactivity timeout.
 * If SSH drops, this process reconnects. If the host rotates the domain in
 * the same session, URL files are rewritten immediately.
 */
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEB_URL_FILE = join(ROOT, "apps/mobile/src/webUrl.ts");
const QR_URL_FILE = join(ROOT, "apps/mobile/web-public-url.txt");
const REPO_URL_FILE = join(ROOT, "HOME-URL.txt");
const DESKTOP_URL_FILE = join(homedir(), "Desktop", "Atlas-Home-URL.txt");
const SSH_KEY = join(homedir(), ".ssh", "atlas_localhost_run");
const LOCAL = "http://127.0.0.1:3000/home";
const RESTART_DELAY_MS = 2_000;
const PING_MS = 20_000;

let currentUrl = "";
let child = null;
let stopping = false;
let pingTimer = null;

function log(...args) {
  console.log(`[tunnel] ${new Date().toLocaleTimeString()}`, ...args);
}

function writeUrlFiles(homeUrl) {
  if (homeUrl === currentUrl) return;
  currentUrl = homeUrl;
  const body = `/** Updated automatically by \`npm run tunnel:web\` — do not edit by hand. */\nexport const WEB_APP_URL = ${JSON.stringify(homeUrl)};\n`;
  writeFileSync(WEB_URL_FILE, body, "utf8");
  writeFileSync(QR_URL_FILE, homeUrl, "utf8");
  const note = [
    homeUrl,
    "",
    "این فایل همیشه آخرین لینک باز را دارد.",
    "لپ‌تاپ باید روشن بماند و npm run tunnel:web در حال اجرا باشد.",
    "",
  ].join("\n");
  writeFileSync(REPO_URL_FILE, note, "utf8");
  try {
    writeFileSync(DESKTOP_URL_FILE, note, "utf8");
  } catch {
    /* desktop may be missing */
  }
  log("public URL →", homeUrl);
}

async function localWebUp() {
  try {
    const res = await fetch(LOCAL, { redirect: "follow" });
    return res.ok;
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
    void fetch(url, { redirect: "follow", cache: "no-store" }).catch(() => {
      /* idle ping — do not kill the tunnel if this PC cannot fetch */
    });
  }, PING_MS);
}

function killChild() {
  stopPing();
  if (!child || child.killed) return;
  try {
    child.kill();
  } catch {
    /* ignore */
  }
  child = null;
}

function grabUrl(text) {
  const lhr = text.match(/https:\/\/[a-z0-9]+\.lhr\.(?:life|rocks)/i);
  if (lhr) return `${lhr[0].replace(/\/$/, "")}/home`;
  const random = text.match(/https:\/\/[a-f0-9]{8,}\.localhost\.run/i);
  if (random) return `${random[0].replace(/\/$/, "")}/home`;
  return null;
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
    "80:127.0.0.1:3000",
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
  return startProcess("ssh", args);
}

function startProcess(command, args) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    child = proc;
    const onChunk = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      const url = grabUrl(text);
      if (url) {
        writeUrlFiles(url);
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
  mkdirSync(join(ROOT, "apps/mobile/src"), { recursive: true });
  mkdirSync(join(homedir(), ".ssh"), { recursive: true });
  log("watching local web at", LOCAL);
  log("SSH key", existsSync(SSH_KEY) ? SSH_KEY : "missing");

  let preferKey = existsSync(SSH_KEY);

  while (!stopping) {
    if (!(await localWebUp())) {
      log("local :3000 down — waiting (run npm run dev:web)");
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
