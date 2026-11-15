import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Netlify (and other static hosts) have no Nest API.
 * Force mock client so search/popular/inventory work offline in the exported site.
 * Local `next dev` still uses apps/web/.env.local (http → 127.0.0.1:4000).
 */
const env = {
  ...process.env,
  NEXT_PUBLIC_ATLAS_API_MODE: "mock",
  NEXT_PUBLIC_ATLAS_API_URL: "",
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npm", ["run", "build", "-w", "@atlas/web"]);
run("node", ["scripts/copy-static-root.mjs"]);
