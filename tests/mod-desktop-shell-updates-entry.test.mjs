// The Bridge's updates through the app's entry (ITM-1054): src/desktop-shell/main.mjs starts the updates of a packaged app — one that read build.json and update-key.pem — with
// electron-updater's `autoUpdater` and the key built into the app, reads the feed at start, and answers the window's requests for the state of the updates, the click Download
// and the click Install and restart (MOD-desktop-shell, Interfaces: Updates). The entry runs over a constructed Electron and a fake electron-updater (tests/desktop-shell.d/entry.mjs); the
// feed is a fake `fetch`; nothing reaches the network.
// Run: node --test tests/mod-desktop-shell-updates-entry.test.mjs
//
// Module: MOD-desktop-shell
// Guards: UC-044; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
// Level: unit

import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync, sign } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";
import { bridgeSettings, startEntry, stopEntry, temporary } from "./desktop-shell.d/entry.mjs";
import { saveSettings } from "../src/desktop-shell/settings.mjs";

const PUBLISHER = generateKeyPairSync("ed25519");
const BASE = "https://github.com/alice/agent-m/releases/latest/download/";
const FILE = "Agent-M-Bridge-2026.11.0-linux.AppImage";
const BYTES = Buffer.from("the new Bridge");
const FEED = Buffer.from(`version: 2026.11.0\nfiles:\n  - url: ${FILE}\n    sha512: SHA512\n    size: ${BYTES.length}\n`);
const signature = (bytes) => Buffer.from(sign(null, bytes, PUBLISHER.privateKey).toString("base64"));
const BUILD = { instance: "alice/agent-m", appId: "io.github.alice.agent-m.bridge", origin: "https://alice.github.io", version: "2026.10.0", commit: "0123456789abcdef0123456789abcdef01234567" };

// TST-1054008 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE; THE BRIDGE IS SIGNED BY ITS PUBLISHER
// given: a packaged app (resources: build.json of 2026.10.0, update-key.pem of the publisher) over a constructed Electron; a fake electron-updater that read a release 2026.11.0; a fake feed signed by the publisher
// input: the app's start; the window's requests "updates", "download-update", "install-update" without and with { confirmed: true }
// expect: the updater is set to download nothing on its own; the feed was read at start; "updates" offers 2026.11.0 with its notes; "download-update" makes it ready; "install-update" without the decision is refused and calls nothing, and with it calls quitAndInstall once; an app started from the source folder (no update key) answers "updates" with no offer and asks the feed for nothing
// Planted fault: installing at "download-update", or not reading the feed at start, fails the calls; an app with no key reading the feed fails the last part.
test("TST-1054008 the app starts its updates with the key it carries, and the window's requests reach them", async () => {
  const calls = [];
  const asked = [];
  const file = join(temporary(), FILE);
  globalThis.__agentMUpdater = {
    autoDownload: true, autoInstallOnAppQuit: true,
    async checkForUpdates() { calls.push("checkForUpdates"); return { updateInfo: { version: "2026.11.0", files: [{ url: FILE, sha512: "SHA512", size: BYTES.length }], releaseNotes: "Notes." } }; },
    async downloadUpdate() { calls.push("downloadUpdate"); writeFileSync(file, BYTES); return [file]; },
    quitAndInstall() { calls.push("quitAndInstall"); },
  };
  const held = new Map([[`${BASE}latest-linux.yml`, FEED], [`${BASE}latest-linux.yml.sig`, signature(FEED)], [`${BASE}${FILE}`, BYTES], [`${BASE}${FILE}.sig`, signature(BYTES)]]);
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => { asked.push(String(url)); return held.has(String(url)) ? new Response(held.get(String(url))) : new Response("not found", { status: 404 }); };
  const appData = temporary(), resources = temporary(), data = temporary();
  const [port] = await unusedPorts(1);
  saveSettings(join(appData, BUILD.appId), bridgeSettings(port));
  writeFileSync(join(resources, "build.json"), JSON.stringify(BUILD));
  writeFileSync(join(resources, "update-key.pem"), PUBLISHER.publicKey.export({ type: "spki", format: "pem" }));
  const started = await startEntry({ resources, appData, platform: "linux", argv: [] });
  try {
    assert.equal(started.outcome.kind, "loaded", `the entry started (errors: ${started.errors.join(" | ")})`);
    assert.equal(globalThis.__agentMUpdater.autoDownload, false);
    const ask = (action, value) => started.fake.handlers["bridge-state"]({}, action, value);
    assert.deepEqual((await ask("updates")).offer, { version: "2026.11.0", notes: "Notes." });
    assert.ok(asked.includes(`${BASE}latest-linux.yml`), "the feed was read at start");
    assert.ok(!calls.includes("downloadUpdate"));
    assert.equal((await ask("download-update")).ready, true);
    await assert.rejects(ask("install-update"), (error) => error.name === "NotConfirmed");
    assert.ok(!calls.includes("quitAndInstall"));
    await ask("install-update", { confirmed: true });
    assert.equal(calls.filter((call) => call === "quitAndInstall").length, 1);
  } finally { await stopEntry(started); globalThis.fetch = realFetch; delete globalThis.__agentMUpdater; for (const folder of [appData, resources, data]) rmSync(folder, { recursive: true, force: true }); }

  const fromSource = temporary(), sourceData = temporary(), sourceResources = temporary();
  const [sourcePort] = await unusedPorts(1);
  saveSettings(sourceData, bridgeSettings(sourcePort));
  const before = asked.length;
  globalThis.fetch = async (url) => { asked.push(String(url)); throw new Error("no request is expected"); };
  const source = await startEntry({ resources: sourceResources, appData: fromSource, argv: ["--instance=alice/agent-m", "--origin=https://alice.github.io", `--port=${sourcePort}`, `--data-folder=${sourceData}`] });
  try {
    const state = await source.fake.handlers["bridge-state"]({}, "updates");
    assert.equal(state.offer, null);
    assert.equal(asked.length, before, "the feed is not asked for");
  } finally { await stopEntry(source); globalThis.fetch = realFetch; for (const folder of [fromSource, sourceData, sourceResources]) rmSync(folder, { recursive: true, force: true }); }
});
