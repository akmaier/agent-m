// Module: MOD-tunnels
// Guards: THE BRIDGE CREATES ITS OWN SSH KEY; NO SECRET IN THE REPOSITORY; UC-044
// Level: unit
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const ssh2Cache = join(tmpdir(), "agent-m-284-ssh2-1.17.0");
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
      import assert from "node:assert/strict";
      import { createRequire } from "node:module";
      const require = createRequire(import.meta.url);
      const crypto = require("node:crypto");
      const fixturePrivateKey = crypto.createPrivateKey({ key: {
        kty: "OKP",
        crv: "Ed25519",
        d: Buffer.from("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60", "hex").toString("base64url"),
        x: Buffer.from("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", "hex").toString("base64url")
      }, format: "jwk" });
      const fixturePublicKey = crypto.createPublicKey(fixturePrivateKey);
      if (fixturePublicKey.export({ type: "spki", format: "der" }).at(-32) === 0) throw new Error("fixture leading-zero public byte");
      const generateKeyPairSync = crypto.generateKeyPairSync;
      crypto.generateKeyPairSync = (type, options) => {
        assert.equal(type, "ed25519");
        return {
          privateKey: fixturePrivateKey.export(options.privateKeyEncoding),
          publicKey: fixturePublicKey.export(options.publicKeyEncoding)
        };
      };
      let ssh2;
      try {
        ssh2 = require("ssh2");
        if (require("ssh2/package.json").version !== "1.17.0") throw new Error("ssh2 version");
        const pair = ssh2.utils.generateKeyPairSync("ed25519");
        const privateKey = ssh2.utils.parseKey(pair.private);
        const publicKey = ssh2.utils.parseKey(pair.public);
        if (privateKey.type !== "ssh-ed25519" || privateKey.getPublicSSH().compare(publicKey.getPublicSSH()) !== 0) throw new Error("ssh2 correspondence");
      } finally {
        crypto.generateKeyPairSync = generateKeyPairSync;
      }
      console.log("ssh2-known-positive");
    `], { env: { ...process.env, NODE_PATH: join(ssh2Cache, "node_modules") } });
    assert.match(positive.stdout, /ssh2-known-positive/);
    return join(ssh2Cache, "node_modules");
  } catch (error) { runtimeFailure = error; throw error; }
}

function ensure(folder) {
  const script = `
    import { createHash } from "node:crypto";
    import { readFileSync, statSync } from "node:fs";
    import { join } from "node:path";
    import { createRequire } from "node:module";
    const { ensureKey } = await import(${JSON.stringify(source)});
    const result = await ensureKey(process.argv[1]);
    const require = createRequire(import.meta.url);
    const ssh2 = require("ssh2");
    const privateBytes = readFileSync(join(process.argv[1], "ssh", "id_ed25519"));
    const publicBytes = readFileSync(join(process.argv[1], "ssh", "id_ed25519.pub"));
    const privateKey = ssh2.utils.parseKey(privateBytes);
    const publicKey = ssh2.utils.parseKey(publicBytes);
    const expectedFingerprint = \`SHA256:\${createHash("sha256").update(publicKey.getPublicSSH()).digest("base64").replace(/=+$/, "")}\`;
    console.log(JSON.stringify({
      result,
      correspondence: privateKey.type === "ssh-ed25519" && privateKey.getPublicSSH().compare(publicKey.getPublicSSH()) === 0,
      fingerprint: expectedFingerprint,
      privateMode: statSync(join(process.argv[1], "ssh", "id_ed25519")).mode & 0o777,
      publicBytes: publicBytes.toString("base64"),
      privateBytes: privateBytes.toString("base64")
    }));
  `;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script, folder], {
    encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: runtime() }
  });
  assert.equal(result.status, 0, `ensureKey child failed: ${result.stderr}`);
  return JSON.parse(result.stdout);
}

function temporaryFolder() { return mkdtempSync(join(tmpdir(), "agent-m-284-key-")); }

// TST-284001
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE CREATES ITS OWN SSH KEY; UC-044
// given: a new controlled per-user data folder
// input: ensureKey(dataFolder)
// expect: an Ed25519 OpenSSH pair whose public data and SHA256 fingerprint are returned without a private key
test("TST-284001: ensureKey creates the Bridge Ed25519 pair with matching public data", () => {
  const folder = temporaryFolder();
  try {
    const created = ensure(folder);
    assert.equal(created.correspondence, true);
    assert.equal(created.result.publicKey, Buffer.from(created.publicBytes, "base64").toString("utf8"));
    assert.equal(created.result.fingerprint, created.fingerprint);
    assert.equal(Object.hasOwn(created.result, "privateKey"), false);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-284002
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE CREATES ITS OWN SSH KEY; UC-044
// given: a generated controlled data folder and a separate child process using it
// input: ensureKey(dataFolder) in each child
// expect: exact private and public bytes persist and the private file has owner-only access
test("TST-284002: ensureKey keeps the exact existing pair and private-file mode", () => {
  const folder = temporaryFolder();
  try {
    const first = ensure(folder);
    const second = ensure(folder);
    assert.equal(first.privateBytes, second.privateBytes);
    assert.equal(first.publicBytes, second.publicBytes);
    assert.equal(second.privateMode, 0o600);
    assert.deepEqual(second.result, first.result);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-284003
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE CREATES ITS OWN SSH KEY; UC-044
// given: a controlled directory that denies its owner writes
// input: ensureKey(dataFolder)
// expect: NotWritable names the supplied folder and no private key is created
test("TST-284003: ensureKey reports a controlled unwritable folder", () => {
  const folder = temporaryFolder();
  try {
    const script = `
      import { chmodSync, existsSync } from "node:fs";
      import { join } from "node:path";
      const { ensureKey } = await import(${JSON.stringify(source)});
      chmodSync(process.argv[1], 0o500);
      try { await ensureKey(process.argv[1]); }
      catch (error) { console.log(JSON.stringify({ name: error.name, folder: error.folder, message: error.message, created: existsSync(join(process.argv[1], "ssh", "id_ed25519")) })); process.exit(0); }
      throw new Error("ensureKey unexpectedly wrote an unwritable folder");
    `;
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", script, folder], { encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: runtime() } });
    assert.equal(result.status, 0, `NotWritable child failed: ${result.stderr}`);
    const refused = JSON.parse(result.stdout);
    assert.equal(refused.name, "NotWritable");
    assert.equal(refused.folder, folder);
    assert.equal(refused.created, false);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});
