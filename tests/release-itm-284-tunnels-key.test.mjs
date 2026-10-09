// Independent release coverage for ITM-284's delivered Bridge-owned key prerequisite.
// Run: node --test tests/release-itm-284-tunnels-key.test.mjs
//
// Module: MOD-tunnels
// Level: release
// Guards: THE BRIDGE CREATES ITS OWN SSH KEY; NO SECRET IN THE REPOSITORY; UC-044

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const ssh2Cache = join(tmpdir(), "agent-m-284-release-ssh2-1.17.0");
const source = new URL("../src/tunnels/index.mjs", import.meta.url).href;
let runtimeFailure;

function run(command, arguments_, options = {}) {
  const result = spawnSync(command, arguments_, { encoding: "utf8", timeout: 40_000, ...options });
  if (result.status !== 0) throw new Error(`${command} ${arguments_.join(" ")} failed; status=${result.status}; signal=${result.signal}; error=${result.error?.code ?? "none"}; stderr=${result.stderr}`);
  return result;
}

function runtime() {
  if (runtimeFailure) throw runtimeFailure;
  try {
    if (!existsSync(join(ssh2Cache, "node_modules", "ssh2", "package.json"))) {
      run("npm", ["install", "--no-save", "--prefix", ssh2Cache, "ssh2@1.17.0"]);
    }
    const positive = run(process.execPath, ["--input-type=module", "-e", `
      import { createRequire } from "node:module";
      const require = createRequire(import.meta.url);
      const ssh2 = require("ssh2");
      if (require("ssh2/package.json").version !== "1.17.0") throw new Error("ssh2 version");
      const pair = ssh2.utils.generateKeyPairSync("ed25519");
      const privateKey = ssh2.utils.parseKey(pair.private);
      const publicKey = ssh2.utils.parseKey(pair.public);
      if (privateKey.type !== "ssh-ed25519" || privateKey.getPublicSSH().compare(publicKey.getPublicSSH()) !== 0) throw new Error("ssh2 correspondence");
      console.log("ssh2-known-positive");
    `], { env: { ...process.env, NODE_PATH: join(ssh2Cache, "node_modules") } });
    assert.match(positive.stdout, /ssh2-known-positive/);
    return join(ssh2Cache, "node_modules");
  } catch (error) { runtimeFailure = error; throw error; }
}

function child(script, folder) {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script, folder], {
    encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: runtime() }
  });
  assert.equal(result.status, 0, `ordinary Node child failed: ${result.stderr}`);
  return JSON.parse(result.stdout);
}

function inspect(folder) {
  return child(`
    import { createHash } from "node:crypto";
    import { readFileSync, statSync } from "node:fs";
    import { createRequire } from "node:module";
    import { join } from "node:path";
    const { ensureKey } = await import(${JSON.stringify(source)});
    const result = await ensureKey(process.argv[1]);
    const require = createRequire(import.meta.url);
    const ssh2 = require("ssh2");
    const privateBytes = readFileSync(join(process.argv[1], "ssh", "id_ed25519"));
    const publicBytes = readFileSync(join(process.argv[1], "ssh", "id_ed25519.pub"));
    const privateKey = ssh2.utils.parseKey(privateBytes);
    const publicKey = ssh2.utils.parseKey(publicBytes);
    const fingerprint = \`SHA256:\${createHash("sha256").update(publicKey.getPublicSSH()).digest("base64").replace(/=+$/, "")}\`;
    console.log(JSON.stringify({
      result,
      correspondence: privateKey.type === "ssh-ed25519" && privateKey.getPublicSSH().compare(publicKey.getPublicSSH()) === 0,
      fingerprint,
      privateMode: statSync(join(process.argv[1], "ssh", "id_ed25519")).mode & 0o777,
      privateBytes: privateBytes.toString("base64"),
      publicBytes: publicBytes.toString("base64")
    }));
  `, folder);
}

function temporaryFolder() { return mkdtempSync(join(tmpdir(), "agent-m-284-release-key-")); }

// TST-284901
// level: release
// module: MOD-tunnels
// guards: THE BRIDGE CREATES ITS OWN SSH KEY; NO SECRET IN THE REPOSITORY; UC-044
// given: a new controlled Bridge per-user data folder and real ssh2@1.17.0 in an ordinary Node child
// input: public ensureKey(dataFolder)
// expect: the returned public key and SHA256 fingerprint describe a matching Ed25519 pair, while no private key is returned
test("TST-284901: public ensureKey exposes only matching public Bridge key data", () => {
  const folder = temporaryFolder();
  try {
    const observed = inspect(folder);
    assert.equal(observed.correspondence, true, "failure node: delivered ensureKey writes a real matching Ed25519 pair");
    assert.equal(observed.result.publicKey, Buffer.from(observed.publicBytes, "base64").toString("utf8"));
    assert.equal(observed.result.fingerprint, observed.fingerprint);
    assert.deepEqual(Object.keys(observed.result).sort(), ["fingerprint", "publicKey"]);
    assert.equal(JSON.stringify(observed.result).includes(Buffer.from(observed.privateBytes, "base64").toString("utf8")), false);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-284902
// level: release
// module: MOD-tunnels
// guards: THE BRIDGE CREATES ITS OWN SSH KEY; UC-044
// given: a generated controlled data folder reopened by a separate ordinary Node child
// input: public ensureKey(dataFolder) before and after the child boundary
// expect: exact private/public bytes, public result and SHA256 fingerprint persist, and the private key remains 0600
test("TST-284902: public ensureKey keeps the exact owner-only pair across Node children", () => {
  const folder = temporaryFolder();
  try {
    const first = inspect(folder);
    const second = inspect(folder);
    assert.equal(second.privateBytes, first.privateBytes, "failure node: existing private bytes are reused after a child boundary");
    assert.equal(second.publicBytes, first.publicBytes, "failure node: existing public bytes are reused after a child boundary");
    assert.equal(second.privateMode, 0o600);
    assert.deepEqual(second.result, first.result);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-284903
// level: release
// module: MOD-tunnels
// guards: THE BRIDGE CREATES ITS OWN SSH KEY; UC-044
// given: a controlled supplied data folder that denies owner writes
// input: public ensureKey(dataFolder)
// expect: NotWritable names exactly the supplied folder and creates no private key there
test("TST-284903: public ensureKey refuses an unwritable supplied folder without creating a key", () => {
  const folder = temporaryFolder();
  try {
    const refused = child(`
      import { chmodSync, existsSync } from "node:fs";
      import { join } from "node:path";
      const { ensureKey } = await import(${JSON.stringify(source)});
      chmodSync(process.argv[1], 0o500);
      try { await ensureKey(process.argv[1]); }
      catch (error) {
        console.log(JSON.stringify({ name: error.name, folder: error.folder, created: existsSync(join(process.argv[1], "ssh", "id_ed25519")) }));
        process.exit(0);
      }
      throw new Error("ensureKey unexpectedly wrote the denied folder");
    `, folder);
    assert.equal(refused.name, "NotWritable", "failure node: mkdir/write access denial is mapped by public ensureKey");
    assert.equal(refused.folder, folder);
    assert.equal(refused.created, false);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});
