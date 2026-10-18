// publishRelease of MOD-bridge-build (ITM-955) — the accepted text of docs/architecture/MOD-bridge-build.md, blob 279df7dc: "checks that each
// platform's build is there and that every checksum and detached signature still holds; reads again the due diligence of every package the app
// carries (ARC-052), and publishes nothing when a licence is no longer known to be compatible with Agent M's; writes `SHA256SUMS` and its
// signature; and publishes every file with its signature, and the feed, as the release `Agent M V` of the tag ... through Access's `publishRelease`
// ... It then compares the SHA-256 the server reports for each file with its own." Errors: BuildMissing { platform }, SignatureInvalid { file },
// LicenceNotCompatible { package } (nothing is published then), ChecksumMismatch { file }. The detached signature is "the Ed25519 signature of the
// file's bytes by the publisher's update key, in base64 on one line". The secret is read "from the release workflow's environment, never from a file".
// Run: node --test tests/bridge-build-publish-release.test.mjs
//
// Module: MOD-bridge-build
// Guards: THE BRIDGE IS ONE FILE PER PLATFORM; THE BRIDGE IS SIGNED BY ITS PUBLISHER; UC-044
// Level: unit
//
// The inputs are accepted interfaces. MOD-repository-hosts' `publishRelease` (MOD-repository-hosts.md:248) is not built yet: the tests hand
// publishRelease a fake host of its accepted signature (`publishRelease(tag, { name, notes, files })` -> Release, and `listTags(pattern)`).
// MOD-reuse-facts' `registryFacts` is built; an ES module's export cannot be replaced, so it is faked where it reads, at `fetch`: a fake npm
// registry that answers each package with the licence the test gives it. Three platform folders are made in a temporary folder, with an Ed25519 key
// made in the test; nothing reaches the network, and no test sleeps. Each test states its given / input / expect before it runs. The counter-proofs
// are recorded in the pull request.

import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { createHash, createPublicKey, generateKeyPairSync, sign, verify } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { publishRelease } from "../src/bridge-build/index.mjs";

const TAG = "v2026.10.0";
const VERSION = "2026.10.0";
const COMMIT = "9f1c2b7e0a5d4c3b2a1908f7e6d5c4b3a2918070";
const RUN_TIME = JSON.parse(readFileSync(new URL("../src/bridge-build/package.json", import.meta.url), "utf8")).dependencies;
const PACKAGES = Object.keys(RUN_TIME);

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

// The publisher's key, made in the test. The environment holds the private half, as the release workflow does.
const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const PRIVATE_PEM = privateKey.export({ type: "pkcs8", format: "pem" });
const signature = (bytes) => sign(null, bytes, privateKey).toString("base64");

// The three platforms' builds: what each platform's buildPlatform wrote into its folder — the files, `<file>.sig`'s content in
// `platform-build.json`, and that file itself.
const BUILDS = {
  macos: [`Agent-M-Bridge-${VERSION}-macos.dmg`, `Agent-M-Bridge-${VERSION}-macos.zip`, "latest-mac.yml"],
  windows: [`Agent-M-Bridge-${VERSION}-windows.exe`, "latest.yml"],
  linux: [`Agent-M-Bridge-${VERSION}-linux.AppImage`, "latest-linux.yml"],
};
const bytesOf = (name) => Buffer.from(`the bytes of ${name}`);

function makeFolders(root) {
  const folders = {};
  for (const [platform, names] of Object.entries(BUILDS)) {
    const folder = join(root, platform);
    mkdirSync(folder, { recursive: true });
    const files = names.map((name) => {
      const bytes = bytesOf(name);
      writeFileSync(join(folder, name), bytes);
      return { name, size: bytes.length, sha256: sha256(bytes), signature: signature(bytes) };
    });
    writeFileSync(join(folder, "platform-build.json"), JSON.stringify({ platform, version: VERSION, folder, files }));
    folders[platform] = folder;
  }
  return folders;
}

// A fake host of MOD-repository-hosts' accepted signature. `report(file)` is the SHA-256 the server says it holds for an uploaded file.
function fakeHost({ report = (file) => sha256(file.bytes) } = {}) {
  const calls = [];
  return {
    calls,
    async listTags(pattern) { return [{ name: TAG, commit: COMMIT }].filter((each) => !pattern || each.name === pattern); },
    async publishRelease(tag, release) {
      calls.push({ tag, release });
      return { tag, name: release.name, published: "2026-10-18", notes: release.notes,
        assets: release.files.map((file) => ({ name: file.name, size: file.bytes.length, url: `https://example.org/${file.name}`, sha256: report(file) })) };
    },
  };
}

// A fake npm registry for registryFacts: each package answers with its licence (MIT unless the test says otherwise), no repository.
function fakeRegistry(licences = {}) {
  return mock.method(globalThis, "fetch", async (address) => {
    const url = String(address);
    const body = url.startsWith("https://api.npmjs.org/") ? { downloads: 100 } : (() => {
      const name = decodeURIComponent(url.slice("https://registry.npmjs.org/".length));
      return { name, license: licences[name] ?? "MIT", "dist-tags": { latest: RUN_TIME[name] }, versions: { [RUN_TIME[name]]: {} }, time: { [RUN_TIME[name]]: "2025-08-20T00:00:00.000Z" } };
    })();
    return { ok: true, status: 200, statusText: "OK", async json() { return body; } };
  });
}

// One run's setting: the folders in a temporary folder, the key in the environment, the registry faked; `settle` undoes all three.
function setting({ licences, host, folders } = {}) {
  const root = mkdtempSync(join(tmpdir(), "bridge-build-"));
  const made = makeFolders(root);
  const before = process.env.BRIDGE_UPDATE_KEY;
  process.env.BRIDGE_UPDATE_KEY = PRIVATE_PEM;
  const registry = fakeRegistry(licences);
  return {
    host: host ?? fakeHost(), made,
    folders: (folders ?? ["macos", "windows", "linux"]).map((platform) => made[platform]),
    settle() {
      registry.mock.restore();
      if (before === undefined) delete process.env.BRIDGE_UPDATE_KEY; else process.env.BRIDGE_UPDATE_KEY = before;
      rmSync(root, { recursive: true, force: true });
    },
  };
}

const rejection = async (promise) => { try { await promise; } catch (error) { return error; } assert.fail("expected publishRelease to reject"); };

// TST-473955 · level: unit · module: MOD-bridge-build
// guards: THE BRIDGE IS ONE FILE PER PLATFORM; THE BRIDGE IS SIGNED BY ITS PUBLISHER; UC-044
// given: three platform folders, each with its files, their detached signatures and platform-build.json, all intact; every package of the app with an MIT licence in the fake registry; the update key in the environment; a fake host
// input: publishRelease(host, { tag: "v2026.10.0", folders })
// expect: the host's publishRelease is called once for the tag, as the release "Agent M 2026.10.0", with every one of the seven build files, each `<file>.sig` holding the recorded signature, `SHA256SUMS` — one line `<sha256>  <name>` per build file, in the order of the names — and `SHA256SUMS.sig`, a signature of those bytes that the public half of the key verifies; the notes name the version, the commit and each package with its licence; the result lists the uploaded names and the due diligence of each of the five packages
test("publishRelease — every file with its signature, SHA256SUMS and its signature are published as the release of the tag", async () => {
  const run = setting();
  try {
    const result = await publishRelease(run.host, { tag: TAG, folders: run.folders });
    assert.equal(run.host.calls.length, 1);
    const { tag, release } = run.host.calls[0];
    assert.equal(tag, TAG);
    assert.equal(release.name, `Agent M ${VERSION}`);
    const all = Object.values(BUILDS).flat();
    const byName = new Map(release.files.map((file) => [file.name, Buffer.from(file.bytes)]));
    assert.deepEqual([...byName.keys()].sort(), [...all, ...all.map((name) => `${name}.sig`), "SHA256SUMS", "SHA256SUMS.sig"].sort());
    for (const name of all) {
      assert.deepEqual(byName.get(name), bytesOf(name), `${name}: the bytes of the build`);
      assert.equal(byName.get(`${name}.sig`).toString("utf8"), signature(bytesOf(name)), `${name}.sig: the signature, in base64 on one line`);
    }
    const expectedSums = [...all].sort().map((name) => `${sha256(bytesOf(name))}  ${name}\n`).join("");
    assert.equal(byName.get("SHA256SUMS").toString("utf8"), expectedSums);
    assert.ok(verify(null, byName.get("SHA256SUMS"), createPublicKey(PRIVATE_PEM), Buffer.from(byName.get("SHA256SUMS.sig").toString("utf8"), "base64")), "SHA256SUMS.sig holds");
    assert.ok(verify(null, byName.get("SHA256SUMS"), publicKey, Buffer.from(byName.get("SHA256SUMS.sig").toString("utf8"), "base64")));
    assert.match(release.notes, new RegExp(VERSION.replaceAll(".", "\\.")));
    assert.ok(release.notes.includes(COMMIT), "the notes name the commit");
    for (const name of PACKAGES) assert.ok(release.notes.includes(name), `the notes name ${name}`);
    assert.match(release.notes, /MIT/);
    assert.deepEqual([...result.published].sort(), [...byName.keys()].sort());
    assert.deepEqual(result.facts.map((each) => each.candidate.name).sort(), [...PACKAGES].sort());
    assert.ok(result.facts.every((each) => each.licence === "compatible"));
  } finally { run.settle(); }
});

// TST-473956 · level: unit · module: MOD-bridge-build
// guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER; UC-044
// given: the intact three folders, and one byte of the Windows installer changed after it was signed, its recorded checksum left as it was
// input: publishRelease(host, { tag, folders })
// expect: it rejects with SignatureInvalid naming that file, and the host's publishRelease is never called
test("publishRelease — one changed byte of a file gives SignatureInvalid naming it, and nothing is published", async () => {
  const run = setting();
  try {
    const name = BUILDS.windows[0];
    const bytes = bytesOf(name);
    bytes[0] ^= 0xff;
    writeFileSync(join(run.made.windows, name), bytes);
    const error = await rejection(publishRelease(run.host, { tag: TAG, folders: run.folders }));
    assert.equal(error.name, "SignatureInvalid");
    assert.equal(error.file, name);
    assert.equal(run.host.calls.length, 0);
  } finally { run.settle(); }
});

// TST-473957 · level: unit · module: MOD-bridge-build
// guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER; UC-044
// given: the intact three folders, and the Linux feed changed and its checksum and size in platform-build.json made to match the changed bytes — so that only its detached signature no longer holds (the counter-proof of a check that skips the detached signatures)
// input: publishRelease(host, { tag, folders })
// expect: it rejects with SignatureInvalid naming the feed file, and the host's publishRelease is never called; a check that verified the checksum alone would publish it
test("publishRelease — a file whose checksum was rewritten to match still fails on its detached signature", async () => {
  const run = setting();
  try {
    const name = BUILDS.linux[1];
    const forged = Buffer.from("version: 9.9.9\n");
    writeFileSync(join(run.made.linux, name), forged);
    const recordPath = join(run.made.linux, "platform-build.json");
    const record = JSON.parse(readFileSync(recordPath, "utf8"));
    const entry = record.files.find((each) => each.name === name);
    Object.assign(entry, { size: forged.length, sha256: sha256(forged) });
    writeFileSync(recordPath, JSON.stringify(record));
    const error = await rejection(publishRelease(run.host, { tag: TAG, folders: run.folders }));
    assert.equal(error.name, "SignatureInvalid");
    assert.equal(error.file, name);
    assert.equal(run.host.calls.length, 0);
  } finally { run.settle(); }
});

// TST-473958 · level: unit · module: MOD-bridge-build
// guards: THE BRIDGE IS ONE FILE PER PLATFORM; UC-044
// given: the folders of macOS and Windows only; and, in a second case, all three folders with the Linux AppImage deleted from its folder
// input: publishRelease(host, { tag, folders })
// expect: the first rejects with BuildMissing naming platform "linux"; the second with BuildMissing naming platform "linux" as well; the host's publishRelease is never called
test("publishRelease — a platform without its folder, or a folder without its file, gives BuildMissing naming the platform", async () => {
  const absent = setting({ folders: ["macos", "windows"] });
  try {
    const error = await rejection(publishRelease(absent.host, { tag: TAG, folders: absent.folders }));
    assert.equal(error.name, "BuildMissing");
    assert.equal(error.platform, "linux");
    assert.equal(absent.host.calls.length, 0);
  } finally { absent.settle(); }
  const lacking = setting();
  try {
    rmSync(join(lacking.made.linux, BUILDS.linux[0]));
    const error = await rejection(publishRelease(lacking.host, { tag: TAG, folders: lacking.folders }));
    assert.equal(error.name, "BuildMissing");
    assert.equal(error.platform, "linux");
    assert.equal(lacking.host.calls.length, 0);
  } finally { lacking.settle(); }
});

// TST-473959 · level: unit · module: MOD-bridge-build
// guards: A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S; UC-044
// given: the intact three folders, and the fake registry giving ssh2 the licence GPL-3.0, which is not known to be compatible with Agent M's MIT
// input: publishRelease(host, { tag, folders })
// expect: it rejects with LicenceNotCompatible naming package "ssh2", and the host's publishRelease is never called
test("publishRelease — a licence no longer known to be compatible gives LicenceNotCompatible, and nothing is published", async () => {
  const run = setting({ licences: { ssh2: "GPL-3.0" } });
  try {
    const error = await rejection(publishRelease(run.host, { tag: TAG, folders: run.folders }));
    assert.equal(error.name, "LicenceNotCompatible");
    assert.equal(error.package, "ssh2");
    assert.equal(run.host.calls.length, 0);
  } finally { run.settle(); }
});

// TST-473960 · level: unit · module: MOD-bridge-build
// guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER; UC-044
// given: the intact three folders and a fake host whose server reports, for the macOS disk image, a SHA-256 other than the one of the bytes uploaded
// input: publishRelease(host, { tag, folders })
// expect: it rejects with ChecksumMismatch naming the disk image; the host's publishRelease was called once; and, with the server reporting every file's own SHA-256, the same run resolves
test("publishRelease — a server SHA-256 that differs from its own gives ChecksumMismatch naming the file", async () => {
  const dmg = BUILDS.macos[0];
  const run = setting({ host: fakeHost({ report: (file) => (file.name === dmg ? "0".repeat(64) : sha256(file.bytes)) }) });
  try {
    const error = await rejection(publishRelease(run.host, { tag: TAG, folders: run.folders }));
    assert.equal(error.name, "ChecksumMismatch");
    assert.equal(error.file, dmg);
    assert.equal(run.host.calls.length, 1);
  } finally { run.settle(); }
  const agreeing = setting();
  try {
    await publishRelease(agreeing.host, { tag: TAG, folders: agreeing.folders });
  } finally { agreeing.settle(); }
});

// TST-473961 · level: unit · module: MOD-bridge-build
// guards: NO SECRET IN THE REPOSITORY; THE BRIDGE IS SIGNED BY ITS PUBLISHER
// given: the update key only in the environment variable BRIDGE_UPDATE_KEY; console output recorded; and, in a second case, the variable unset
// input: publishRelease(host, { tag, folders }) in each case
// expect: with the key, nothing written to the console, nor any published file, nor the notes, holds the private key's text; without it, publishRelease rejects with SecretMissing naming BRIDGE_UPDATE_KEY, no message holds a key's text, and the host's publishRelease is never called
test("publishRelease — the update key is read from the environment and appears in no log, file or note", async () => {
  const logged = [];
  const spies = ["log", "info", "warn", "error", "debug"].map((level) => mock.method(console, level, (...parts) => logged.push(parts.join(" "))));
  const run = setting();
  try {
    await publishRelease(run.host, { tag: TAG, folders: run.folders });
    const body = PRIVATE_PEM.replace(/-----[^-]+-----|\s/g, "");
    const published = run.host.calls[0].release;
    for (const text of [...logged, published.notes, ...published.files.map((file) => Buffer.from(file.bytes).toString("latin1"))]) {
      assert.ok(!text.includes(body) && !text.includes("PRIVATE KEY"), "no text holds the key");
    }
    delete process.env.BRIDGE_UPDATE_KEY;
    const error = await rejection(publishRelease(run.host, { tag: TAG, folders: run.folders }));
    assert.equal(error.name, "SecretMissing");
    assert.equal(error.secret, "BRIDGE_UPDATE_KEY");
    assert.ok(!String(error.message).includes(body));
    assert.equal(run.host.calls.length, 1);
  } finally { run.settle(); for (const spy of spies) spy.mock.restore(); }
});
