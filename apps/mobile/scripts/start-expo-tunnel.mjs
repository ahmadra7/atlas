import { spawn, execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hostFile = join(root, "expo-tunnel-host.txt");
if (!existsSync(hostFile)) {
  console.error("Missing expo-tunnel-host.txt — start cloudflared first.");
  process.exit(1);
}
const host = readFileSync(hostFile, "utf8").trim();
const proxy = `https://${host}`;

try {
  const out = execSync(
    `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess"`,
    { encoding: "utf8" },
  ).trim();
  if (out) {
    process.kill(Number(out));
    console.log("stopped metro pid", out);
  }
} catch {
  /* ignore */
}

await new Promise((r) => setTimeout(r, 1500));
console.log("EXPO_PACKAGER_PROXY_URL=", proxy);

const child = spawn("npx", ["expo", "start", "--port", "8081"], {
  cwd: root,
  env: {
    ...process.env,
    EXPO_PACKAGER_PROXY_URL: proxy,
    REACT_NATIVE_PACKAGER_HOSTNAME: host,
  },
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
