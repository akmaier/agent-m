// The Bridge app's packages at exact versions (ITM-459) — MOD-bridge-build's `package.json` and `package-lock.json` in `src/bridge-build/`, as the accepted text of
// docs/architecture/MOD-bridge-build.md states them (Parts: "the Bridge app's packages at exact versions: electron, electron-builder and electron-updater
// (ARC-050); imapflow, nodemailer and postal-mime (ARC-051); ssh2 (ARC-052)"; Data: "The app's packages are installed from the lockfile without optional
// dependencies, so neither `cpu-features` nor `nan` is there"). For UC-044 and AGENT M'S SOURCE CODE LIVES IN SRC.
// Run: node --test tests/bridge-build-packages.test.mjs
//
// Module: MOD-bridge-build
// Guards: UC-044; AGENT M'S SOURCE CODE LIVES IN SRC
// Level: unit
//
// These tests read files only: the two files of the module and the three decisions, ARC-050, ARC-051 and ARC-052. Nothing is installed and nothing is downloaded; the
// packages are not present when the tests run, and no test runs npm. The exact version of each package is read from the decision that chose it: the row
// `| <package> — chosen |` of its table of candidates, column "Latest release", which the due diligence read on 2026-10-05 and the decision adopted (the row gives
// the version and its date: `44.5.1, 2026-09-30`). The module file does not say which section of the manifest holds a package. The tests read it from how the app
// uses them: what the app needs at run time (Data: "the packages above that the app needs at run time") is in `dependencies` — electron-updater, imapflow, nodemailer,
// postal-mime, ssh2 —, and what builds the app is in `devDependencies` — electron, which electron-builder refuses in `dependencies`, and electron-builder. The lockfile
// is read as npm writes it, `lockfileVersion` 3: `packages["node_modules/<name>"]` with `version`, `resolved` and `integrity`, and `packages[""]` for the root. A package
// that is `optional` in the lockfile is not installed by `npm ci --omit=optional`, which is how the module file installs them. Each test states its input and its
// expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");
const manifest = () => JSON.parse(read("../src/bridge-build/package.json"));
const lockfile = () => JSON.parse(read("../src/bridge-build/package-lock.json"));

const RUN_TIME = ["electron-updater", "imapflow", "nodemailer", "postal-mime", "ssh2"];
const BUILD_TIME = ["electron", "electron-builder"];
const DECISIONS = { "electron": "ARC-050-the-bridge-is-an-electron-app.md", "electron-builder": "ARC-050-the-bridge-is-an-electron-app.md",
  "electron-updater": "ARC-050-the-bridge-is-an-electron-app.md", "imapflow": "ARC-051-imap-and-smtp-in-the-bridge.md",
  "nodemailer": "ARC-051-imap-and-smtp-in-the-bridge.md", "postal-mime": "ARC-051-imap-and-smtp-in-the-bridge.md", "ssh2": "ARC-052-ssh-in-the-bridge.md" };

// The version a decision records for the package it chose: the "Latest release" cell (the sixth) of the row `| <name> — chosen |`, up to its comma.
function recorded(name) {
  const row = read(`../docs/architecture/${DECISIONS[name]}`).split("\n").find((line) => line.startsWith(`| ${name} — chosen |`));
  assert.ok(row, `${name}: the decision has a row for it`);
  const cell = row.split("|").slice(1, -1).map((each) => each.trim())[4];
  const version = /^(\d+\.\d+\.\d+),/.exec(cell)?.[1];
  assert.ok(version, `${name}: the cell "${cell}" gives a version`);
  return version;
}

// TST-472058 · level: unit · module: MOD-bridge-build
// guards: AGENT M'S SOURCE CODE LIVES IN SRC; UC-044
// given: the three decisions, which record seven versions; the module's package.json
// input: the manifest's `dependencies` and `devDependencies`
// expect: each of the seven packages in exactly one of the two sections, at exactly the version its decision records, with no range — no ^, ~, comparison, `*`, tag or other specifier —, run-time packages in `dependencies`, build-time packages in `devDependencies`, and no package beside the seven
test("package.json — the seven packages at the exact version each decision records, no range, in their sections", () => {
  const expected = Object.fromEntries([...RUN_TIME, ...BUILD_TIME].map((name) => [name, recorded(name)]));
  assert.deepEqual(Object.values(expected).sort(), ["1.17.0", "10.0.15", "2.2.5", "26.15.3", "4.0.4", "44.5.1", "6.8.9"].sort(), "known positive: the decisions are read");
  const { dependencies = {}, devDependencies = {} } = manifest();
  assert.deepEqual(dependencies, Object.fromEntries(RUN_TIME.map((name) => [name, expected[name]])));
  assert.deepEqual(devDependencies, Object.fromEntries(BUILD_TIME.map((name) => [name, expected[name]])));
  for (const version of [...Object.values(dependencies), ...Object.values(devDependencies)]) assert.match(version, /^\d+\.\d+\.\d+$/, "an exact version");
});

// TST-472059 · level: unit · module: MOD-bridge-build
// guards: AGENT M'S SOURCE CODE LIVES IN SRC; UC-044
// given: the module's package-lock.json, as npm writes a lockfile of version 3
// input: lockfile().packages for each of the seven packages and for the root
// expect: the root asks for the manifest's packages at the manifest's versions; each of the seven is installed at exactly the version its decision records, from the npm registry (`resolved` an https address of registry.npmjs.org naming that version), with an `integrity` of sha512 in the 88-character form of a 64-byte digest in base64
test("package-lock.json — the same seven versions, each resolved from the registry with its integrity", () => {
  const lock = lockfile();
  assert.equal(lock.lockfileVersion, 3);
  const root = lock.packages[""];
  assert.deepEqual([root.dependencies, root.devDependencies], [manifest().dependencies, manifest().devDependencies]);
  for (const name of [...RUN_TIME, ...BUILD_TIME]) {
    const entry = lock.packages[`node_modules/${name}`];
    assert.ok(entry, `${name} is in the lockfile`);
    assert.equal(entry.version, recorded(name), name);
    assert.match(entry.resolved, new RegExp(`^https://registry\\.npmjs\\.org/${name}/-/${name}-${entry.version.replace(/\./g, "\\.")}\\.tgz$`), `${name}: resolved`);
    assert.match(entry.integrity, /^sha512-[A-Za-z0-9+/]{86}==$/, `${name}: integrity`);
  }
});

// TST-472060 · level: unit · module: MOD-bridge-build
// guards: AGENT M'S SOURCE CODE LIVES IN SRC; UC-044
// given: ssh2's optional native dependencies, `cpu-features` and `nan` (ARC-052), which the module installs without
// input: the lockfile's entries `node_modules/nan` and `node_modules/cpu-features`, and the manifest's sections
// expect: neither is a package of the manifest; in the lockfile each is absent or marked `optional`, so that `npm ci --omit=optional` installs neither; and no other package of the lockfile that is not optional depends on either; known positive first — ssh2 itself is in the lockfile and not optional
test("package-lock.json — neither nan nor cpu-features is among what the lockfile installs", () => {
  const lock = lockfile();
  assert.ok(lock.packages["node_modules/ssh2"] && lock.packages["node_modules/ssh2"].optional !== true, "known positive: ssh2 is installed");
  const { dependencies = {}, devDependencies = {}, optionalDependencies = {} } = manifest();
  for (const name of ["nan", "cpu-features"]) {
    assert.ok(!(name in { ...dependencies, ...devDependencies, ...optionalDependencies }), `${name} is no package of the manifest`);
    const entry = lock.packages[`node_modules/${name}`];
    assert.ok(entry === undefined || entry.optional === true, `${name} is absent or optional`);
    for (const [path, each] of Object.entries(lock.packages)) {
      if (path === "" || each.optional === true) continue;
      assert.ok(!(name in (each.dependencies ?? {})), `${path} does not depend on ${name}`);
    }
  }
});
