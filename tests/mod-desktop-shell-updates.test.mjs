// The Bridge's updates (ITM-1054), as the accepted text of docs/architecture/MOD-desktop-shell.md states them (Interfaces, Updates; Parts: updates.mjs):
// "**Updates** (`THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`), through electron-updater with `autoDownload` off and `autoInstallEvent` set to `manual`. At start
// and once a day the shell reads the update feed of the instance it was built for, which downloads no release; it offers a newer release only when the feed's detached
// signature holds against the publisher's key built into the app and the signed feed names the version and files electron-updater read. The offer shows the release's notes
// ... *Download* — the person's click — fetches the file, which becomes installable only when its own detached signature holds ...; otherwise the file is deleted and the
// window says that it is not the publisher's. *Install and restart* — a second click, after a decision that names the jobs that would end as cancelled — calls
// `quitAndInstall()`. ... A feed that cannot be read, a download that fails and a signature that does not hold each leave the running Bridge as it is, and the window says which."
// Run: node --test tests/mod-desktop-shell-updates.test.mjs
//
// Module: MOD-desktop-shell
// Guards: UC-044; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE; THE BRIDGE IS SIGNED BY ITS PUBLISHER
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The update feed is a fake: a map from address to bytes, signed with a test key (Ed25519,
// as the build signs: MOD-bridge-build's `<file>.sig`, base64 on one line); the updater is a fake of electron-updater's `autoUpdater` that records its calls and the settings it is given;
// the downloaded file is a real file in a temporary folder, so that its deletion is seen on the disk. Nothing reaches the network. The readings, named in the pull request: the
// feed and each file are fetched from the instance's latest release (`https://github.com/<owner>/<repository>/releases/latest/download/`), the feed by the platform's name from
// MOD-bridge-build's table (`latest-linux.yml`, `latest-mac.yml`, `latest.yml`), each with its `<name>.sig`; "names the version and files electron-updater read" is that the signed feed's
// text holds the version and, for each file the updater read, its address and its SHA-512; the second click is the call `install({ confirmed: true })`, the decision being the window's.

import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync, sign } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// A module that is not there yet is empty here, so that each test fails by itself and not the whole file at once.
const updatesModule = await import("../src/desktop-shell/updates.mjs").catch(() => ({}));

const BASE = "https://github.com/alice/agent-m/releases/latest/download/";
const FILE = "Agent-M-Bridge-2026.11.0-linux.AppImage";
const BYTES = Buffer.from("the new Bridge, as the publisher built it");
const keys = () => generateKeyPairSync("ed25519");
const PUBLISHER = keys(), STRANGER = keys();
const pem = (pair) => pair.publicKey.export({ type: "spki", format: "pem" });
const signed = (pair, bytes) => Buffer.from(sign(null, bytes, pair.privateKey).toString("base64"));
const FEED = Buffer.from(`version: 2026.11.0\nfiles:\n  - url: ${FILE}\n    sha512: SHA512OFTHEFILE\n    size: ${BYTES.length}\npath: ${FILE}\nreleaseDate: '2026-11-01T10:00:00.000Z'\n`);
const INFO = { version: "2026.11.0", files: [{ url: FILE, sha512: "SHA512OFTHEFILE", size: BYTES.length }], releaseNotes: "Fixes the **tunnels**." };

// The fake feed: what the release holds. `feedSigner` and `fileSigner` sign the feed and the file; a null leaves the signature out.
function release({ feed = FEED, feedSigner = PUBLISHER, fileSigner = PUBLISHER, bytes = BYTES } = {}) {
  const held = new Map([[`${BASE}latest-linux.yml`, feed], [`${BASE}${FILE}`, bytes]]);
  if (feedSigner) held.set(`${BASE}latest-linux.yml.sig`, signed(feedSigner, feed));
  if (fileSigner) held.set(`${BASE}${FILE}.sig`, signed(fileSigner, bytes));
  const asked = [];
  return { asked, fetchBytes: async (url) => { asked.push(url); if (!held.has(url)) throw new Error(`404 ${url}`); return held.get(url); } };
}

function fixture({ info = INFO, version = "2026.10.0", rel = release(), checkFails = null, downloadFails = null, key = pem(PUBLISHER), writeDownloaded = BYTES } = {}) {
  const folder = mkdtempSync(join(tmpdir(), "bridge-updates-"));
  const downloaded = join(folder, FILE);
  const updater = {
    autoDownload: true, autoInstallOnAppQuit: true, autoInstallEvent: undefined, calls: [],
    async checkForUpdates() { this.calls.push("checkForUpdates"); if (checkFails) throw checkFails; return { updateInfo: info }; },
    async downloadUpdate() { this.calls.push("downloadUpdate"); if (downloadFails) throw downloadFails; writeFileSync(downloaded, writeDownloaded); return [downloaded]; },
    quitAndInstall() { this.calls.push("quitAndInstall"); },
  };
  const updates = updatesModule.createUpdates({ updater, key, version, instance: "alice/agent-m", platform: "linux", fetchBytes: rel.fetchBytes });
  return { updates, updater, rel, downloaded, done: () => rmSync(folder, { recursive: true, force: true }) };
}

// TST-1054001 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
// given: the running version 2026.10.0; a release 2026.11.0 whose feed is signed by the publisher's key, which the app carries; a fake updater that read that release
// input: the check
// expect: the updater is set to autoDownload false and autoInstallEvent "manual", and does not install on quit; the state offers version 2026.11.0 with the notes "Fixes the **tunnels**."; the feed and its signature were fetched, the file was not; downloadUpdate and quitAndInstall were not called
// Planted fault: leaving autoDownload on, or downloading with the check, fails the setting or the calls.
test("TST-1054001 a newer release with a valid feed signature is offered with its notes, and nothing is downloaded", async () => {
  const f = fixture();
  try {
    const state = await f.updates.check();
    assert.equal(f.updater.autoDownload, false);
    assert.equal(f.updater.autoInstallEvent, "manual");
    assert.equal(f.updater.autoInstallOnAppQuit, false);
    assert.deepEqual(state.offer, { version: "2026.11.0", notes: "Fixes the **tunnels**." });
    assert.equal(state.version, "2026.10.0");
    assert.deepEqual(f.rel.asked, [`${BASE}latest-linux.yml`, `${BASE}latest-linux.yml.sig`]);
    assert.deepEqual(f.updater.calls, ["checkForUpdates"]);
  } finally { f.done(); }
});

// TST-1054002 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS SIGNED BY ITS PUBLISHER
// given: a newer release whose feed is signed by another key; one whose feed text was changed after it was signed; one with no feed signature; one whose signed feed names another version than the updater read; one whose signed feed lacks the SHA-512 of the file the updater read
// input: the check for each
// expect: each time nothing is offered (offer null), the state says why — the signature does not hold, or the signed feed does not name what the updater read —, the running version is unchanged, and nothing is downloaded
// Planted fault: offering on the updater's word alone, or checking the signature of another text, offers a release in one of the five.
test("TST-1054002 a feed whose signature does not hold, or that does not name what the updater read, offers nothing", async () => {
  const cases = [
    ["another key", release({ feedSigner: STRANGER }), /signature/i],
    ["a changed feed", (() => { const r = release(); const tampered = Buffer.from(FEED.toString().replace("2026.11.0", "2027.1.0")); const fetchBytes = r.fetchBytes; return { ...r, fetchBytes: async (url) => (url === `${BASE}latest-linux.yml` ? tampered : fetchBytes(url)) }; })(), /signature/i],
    ["no signature", release({ feedSigner: null }), /signature|404/i],
    ["another version", release({ feed: Buffer.from(FEED.toString().replace("version: 2026.11.0", "version: 2026.12.0")) }), /names|version/i],
    ["a file the updater did not read", release({ feed: Buffer.from(FEED.toString().replace("SHA512OFTHEFILE", "OTHER")) }), /names|files/i],
  ];
  for (const [name, rel, why] of cases) {
    const f = fixture({ rel });
    try {
      const state = await f.updates.check();
      assert.equal(state.offer, null, `${name}: nothing is offered`);
      assert.match(state.refused ?? state.error ?? "", why, `${name}: the state says why`);
      assert.equal(state.version, "2026.10.0");
      assert.ok(!f.updater.calls.includes("downloadUpdate"), `${name}: nothing is downloaded`);
    } finally { f.done(); }
  }
});

// TST-1054003 · level: unit · module: MOD-desktop-shell
// guards: UC-044
// given: a release that is not newer (the same version, then an older one); a feed that cannot be read (the updater fails with an error; the feed is not there); an app built with no update key
// input: the check for each
// expect: nothing is offered; for the unreadable feed the state names the feed (error mentions the feed) and the running version stays; for no key no request is made and the state says the build offers no update
// Planted fault: offering an older version, or going on without a key, offers something or asks the network.
test("TST-1054003 a release that is not newer, a feed that cannot be read and a build without a key offer nothing", async () => {
  for (const version of ["2026.11.0", "2027.1.0"]) {
    const f = fixture({ version });
    try { assert.equal((await f.updates.check()).offer, null, `running ${version}`); } finally { f.done(); }
  }
  const unreadable = fixture({ checkFails: Object.assign(new Error("net::ERR_INTERNET_DISCONNECTED"), { name: "Unreachable" }) });
  try {
    const state = await unreadable.updates.check();
    assert.equal(state.offer, null);
    assert.match(state.error ?? "", /feed/i);
    assert.equal(state.version, "2026.10.0");
  } finally { unreadable.done(); }
  const missing = fixture({ rel: { asked: [], fetchBytes: async () => { throw new Error("404"); } } });
  try { const state = await missing.updates.check(); assert.equal(state.offer, null); assert.match(state.error ?? "", /feed/i); } finally { missing.done(); }
  const keyless = fixture({ key: null });
  try {
    const state = await keyless.updates.check();
    assert.equal(state.offer, null);
    assert.match(state.refused ?? state.error ?? "", /no update key|offers no update/i);
    assert.deepEqual(keyless.rel.asked, []);
    assert.deepEqual(keyless.updater.calls, []);
  } finally { keyless.done(); }
});

// TST-1054004 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE; THE BRIDGE IS SIGNED BY ITS PUBLISHER
// given: an offered release; the file's signature made by the publisher; then one made by another key; then a download that fails
// input: the check, then the click Download
// expect: with the publisher's signature the file is kept and the state says it is ready to install; with another key's the file is deleted from the disk and the state says it is not the publisher's, and install does nothing; for a failing download the state names the download and the running Bridge is as it was
// Planted fault: keeping a file whose signature fails, or checking the signature of the feed instead of the file's, leaves the file on the disk.
test("TST-1054004 a downloaded file whose signature does not hold is deleted and named; one that holds is ready to install", async () => {
  const good = fixture();
  try {
    await good.updates.check();
    const state = await good.updates.download();
    assert.ok(existsSync(good.downloaded), "the file is kept");
    assert.equal(state.ready, true);
    assert.ok(good.rel.asked.includes(`${BASE}${FILE}.sig`));
  } finally { good.done(); }
  const bad = fixture({ rel: release({ fileSigner: STRANGER }) });
  try {
    await bad.updates.check();
    const state = await bad.updates.download();
    assert.ok(!existsSync(bad.downloaded), "the file is deleted");
    assert.equal(state.ready, false);
    assert.match(state.refused ?? "", /not the publisher's/);
    await assert.rejects(bad.updates.install({ confirmed: true }), (error) => error.name === "NothingDownloaded");
    assert.ok(!bad.updater.calls.includes("quitAndInstall"));
  } finally { bad.done(); }
  const failing = fixture({ downloadFails: Object.assign(new Error("connection reset"), { name: "Unreachable" }) });
  try {
    await failing.updates.check();
    const state = await failing.updates.download();
    assert.equal(state.ready, false);
    assert.match(state.error ?? "", /download/i);
    assert.equal(state.version, "2026.10.0");
  } finally { failing.done(); }
});

// TST-1054005 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
// given: an offered release, downloaded, its signature valid
// input: install without the person's decision (no argument, then { confirmed: false }); then install({ confirmed: true }); and, on a fixture where nothing was downloaded, install({ confirmed: true })
// expect: the first two reject with NotConfirmed and call nothing; the third calls quitAndInstall once; with nothing downloaded it rejects with NothingDownloaded and calls nothing
// Planted fault: installing at the download, or on the first call, calls quitAndInstall before the second click.
test("TST-1054005 an update is installed only after the person's second click, and only a downloaded one", async () => {
  const f = fixture();
  try {
    await f.updates.check();
    await f.updates.download();
    assert.ok(!f.updater.calls.includes("quitAndInstall"), "not installed by the download");
    await assert.rejects(f.updates.install(), (error) => error.name === "NotConfirmed");
    await assert.rejects(f.updates.install({ confirmed: false }), (error) => error.name === "NotConfirmed");
    assert.ok(!f.updater.calls.includes("quitAndInstall"));
    await f.updates.install({ confirmed: true });
    assert.equal(f.updater.calls.filter((call) => call === "quitAndInstall").length, 1);
  } finally { f.done(); }
  const nothing = fixture();
  try {
    await nothing.updates.check();
    await assert.rejects(nothing.updates.install({ confirmed: true }), (error) => error.name === "NothingDownloaded");
    assert.ok(!nothing.updater.calls.includes("quitAndInstall"));
  } finally { nothing.done(); }
});

// TST-1054006 · level: unit · module: MOD-desktop-shell
// guards: UC-044
// given: updates started with a fake timer
// input: start()
// expect: the feed is read at once (the updater's check), and a check is set to repeat every 24 hours (86400000 ms); calling the repeated check reads the feed again
// Planted fault: no repetition, or a repetition every hour, fails the delay.
test("TST-1054006 the feed is read at start and once a day", async () => {
  const f = fixture();
  const timers = [];
  try {
    const updates = updatesModule.createUpdates({ updater: f.updater, key: pem(PUBLISHER), version: "2026.10.0", instance: "alice/agent-m", platform: "linux", fetchBytes: f.rel.fetchBytes,
      setInterval: (callback, delay) => { timers.push({ callback, delay }); return timers.length; } });
    await updates.start();
    assert.equal(f.updater.calls.filter((call) => call === "checkForUpdates").length, 1);
    assert.deepEqual(timers.map((timer) => timer.delay), [86_400_000]);
    await timers[0].callback();
    assert.equal(f.updater.calls.filter((call) => call === "checkForUpdates").length, 2);
  } finally { f.done(); }
});

// TST-1054009 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
// given: an offered release, downloaded and verified
// input: the daily check runs again before the person's second click; then install({ confirmed: true })
// expect: the downloaded, verified update stays ready (the check neither forgets the file nor offers again), and the install calls quitAndInstall once
// Planted fault: a check that resets the state loses the verified download, and the install rejects with NothingDownloaded.
test("TST-1054009 a check that runs after the download leaves the verified update ready to install", async () => {
  const f = fixture();
  try {
    await f.updates.check();
    await f.updates.download();
    const state = await f.updates.check();
    assert.equal(state.ready, true);
    assert.deepEqual(state.offer, { version: "2026.11.0", notes: "Fixes the **tunnels**." });
    await f.updates.install({ confirmed: true });
    assert.equal(f.updater.calls.filter((call) => call === "quitAndInstall").length, 1);
  } finally { f.done(); }
});
