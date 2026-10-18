// Module: MOD-desktop-shell, MOD-tunnels
// Shared fixture of the tests of both modules that need the pinned SSH package (ssh2 1.17.0): the one place that installs it.
// It takes the copy CI stages in src/bridge-build/node_modules; otherwise the caller's own cache folder, installed into only
// when that lacks it. Each caller names its own cache folder, so files that run in parallel never install into one folder.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const stagedFolder = fileURLToPath(new URL("../src/bridge-build/node_modules", import.meta.url));

// Returns the NODE_PATH that holds ssh2 1.17.0. `staged` is the staged folder; only the helper's own test passes another.
export function ssh2NodePath(cacheFolder, staged = stagedFolder) {
  const has = (nodePath) => existsSync(join(nodePath, "ssh2", "package.json"));
  const cached = join(cacheFolder, "node_modules");
  const nodePath = has(staged) ? staged : cached;
  if (nodePath === cached && !has(cached)) {
    const installed = spawnSync("npm", ["install", "--no-save", "--prefix", cacheFolder, "ssh2@1.17.0"], { encoding: "utf8", timeout: 40_000 });
    if (installed.status !== 0) throw new Error(`ssh2 staging failed: status=${installed.status}; signal=${installed.signal}; error=${installed.error?.code ?? "none"}; stderr=${installed.stderr}`);
  }
  const script = "const ssh2=require('ssh2');if(require('ssh2/package.json').version!=='1.17.0'||typeof ssh2.Server!=='function'||typeof ssh2.utils.generateKeyPairSync!=='function')throw Error('ssh2 known positive');console.log('ssh2-known-positive')";
  const positive = spawnSync(process.execPath, ["-e", script], { encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: nodePath } });
  if (positive.status !== 0 || !/ssh2-known-positive/.test(positive.stdout)) throw new Error(`ssh2 known positive failed: ${positive.stderr}`);
  return nodePath;
}
