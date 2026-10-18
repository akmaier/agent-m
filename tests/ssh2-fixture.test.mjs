// Module: MOD-desktop-shell
// Guards: THE BRIDGE CREATES ITS OWN SSH KEY; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; NO SECRET IN THE REPOSITORY
// Level: unit
// Coverage of tests/ssh2-fixture.mjs (ITM-902): the one place the tests of MOD-desktop-shell and MOD-tunnels get the SSH package.
// Run: node --test tests/ssh2-fixture.test.mjs

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const helper = new URL("./ssh2-fixture.mjs", import.meta.url).href;

// A stand-in ssh2 package: the version and the exports are the ones the helper's known positive reads.
function fakeSsh2(folder, version, exportsSource = "exports.Server = function Server() {}; exports.utils = { generateKeyPairSync() {} };") {
  const directory = join(folder, "node_modules", "ssh2");
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "package.json"), JSON.stringify({ name: "ssh2", version, main: "index.js" }));
  writeFileSync(join(directory, "index.js"), exportsSource);
  return join(folder, "node_modules");
}

function scratch() { return mkdtempSync(join(tmpdir(), "agent-m-902-")); }

// TST-902001 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE CREATES ITS OWN SSH KEY
// given: the repository's test files
// input: git grep for the quoted ssh2 install argument under tests
// expect: exactly one file is named, tests/ssh2-fixture.mjs
test("TST-902001: the install of the SSH package stands in the helper alone", () => {
  const pattern = '"ssh2@' + '1.17.0"';
  const found = spawnSync("git", ["grep", "-l", "-F", pattern, "--", "tests"], { encoding: "utf8", cwd: new URL("..", import.meta.url) });
  assert.equal(found.status, 0, found.stderr);
  assert.deepEqual(found.stdout.trim().split("\n"), ["tests/ssh2-fixture.mjs"]);
});

// TST-902002 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE CREATES ITS OWN SSH KEY
// given: a staged src/bridge-build/node_modules holding ssh2 1.17.0, and an empty cache folder
// input: the helper is called with the cache folder and the staged folder
// expect: it returns the staged node_modules, and the cache folder is left untouched (no install ran)
test("TST-902002: the helper takes the staged package and installs nothing", async () => {
  const { ssh2NodePath } = await import(helper);
  const base = scratch(), cache = join(base, "cache");
  try {
    const staged = fakeSsh2(join(base, "staged"), "1.17.0");
    assert.equal(ssh2NodePath(cache, staged), staged);
    assert.equal(existsSync(cache), false);
  } finally { rmSync(base, { recursive: true, force: true }); }
});

// TST-902003 · level: unit · module: MOD-tunnels
// guards: THE BRIDGE CREATES ITS OWN SSH KEY
// given: no staged package, and a cache folder that already holds ssh2 1.17.0
// input: the helper is called with that cache folder
// expect: it returns the cache's node_modules and runs no install
test("TST-902003: without a staged package the helper falls back to the caller's cache", async () => {
  const { ssh2NodePath } = await import(helper);
  const base = scratch(), cache = join(base, "cache");
  try {
    const cached = fakeSsh2(cache, "1.17.0");
    assert.equal(ssh2NodePath(cache, join(base, "absent", "node_modules")), cached);
  } finally { rmSync(base, { recursive: true, force: true }); }
});

// TST-902004 · level: unit · module: MOD-tunnels
// guards: THE BRIDGE CREATES ITS OWN SSH KEY
// given: no staged package, and a cache holding ssh2 of another version
// input: the helper is called with that cache folder
// expect: it throws, naming the known positive, and does not return a path
test("TST-902004: a selected package of another version fails the known positive", async () => {
  const { ssh2NodePath } = await import(helper);
  const base = scratch(), cache = join(base, "cache");
  try {
    fakeSsh2(cache, "1.16.0");
    assert.throws(() => ssh2NodePath(cache, join(base, "absent", "node_modules")), /known positive/);
  } finally { rmSync(base, { recursive: true, force: true }); }
});
