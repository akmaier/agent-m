// Module: MOD-desktop-shell
// Guards: THE BRIDGE RUNS AS AN APP; UC-044
// Level: unit
//
// The app's icons (MOD-desktop-shell, Parts: `icons/` — "the app's icon for each platform, and the icon of the menu bar and the tray"):
// on macOS the Dock shows the app's macOS icon also when the app is started from the source folder, and the icon of the menu bar and the
// tray has the size the bar draws, at both screen scales — `tray.png` and, for a Retina screen, `tray@2x.png`, Electron's own convention —,
// both carried by the packaged app. The entry runs over a constructed Electron (tests/desktop-shell.d/entry.mjs), a small object that records
// what the entry asks of it and opens no window. The PNG sizes are read from each file's header. Nothing reaches the network.

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, rmSync } from "node:fs";
import { join, matchesGlob } from "node:path";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";
import { bridgeSettings, startEntry, stopEntry, temporary } from "./desktop-shell.d/entry.mjs";
import { saveSettings } from "../src/desktop-shell/settings.mjs";
import { appDescription } from "../src/desktop-shell/index.mjs";
import { builderConfig } from "../src/bridge-build/builder.mjs";

const SHELL = new URL("../src/desktop-shell/", import.meta.url).pathname;
// A PNG's width and height, the two big-endian 32-bit numbers of its IHDR chunk at bytes 16–23.
const pngSize = (file) => { const bytes = readFileSync(file); return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }; };

// TST-1005006 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE RUNS AS AN APP; UC-044
// given: the app started from the source folder on macOS (--instance, --origin, --port, --data-folder) over a constructed Electron whose app has a Dock
// input: the entry's start
// expect: the entry set the Dock's icon once, to the path of src/desktop-shell/icons/macos.png — the macOS icon appDescription names
// Planted fault: leaving the Dock's icon unset, or setting it to the tray's icon, makes the recorded Dock icons differ from [macos.png].
test("TST-1005006: MOD-desktop-shell sets the Dock's icon to the app's macOS icon on macOS", async () => {
  const appData = temporary(), data = temporary(), resources = temporary();
  const [port] = await unusedPorts(1);
  saveSettings(data, bridgeSettings(port));
  const started = await startEntry({ resources, appData, platform: "darwin", argv: ["--instance=carol/product-x", "--origin=https://carol.github.io", `--port=${port}`, `--data-folder=${data}`] });
  try {
    assert.equal(started.outcome.kind, "loaded", `the entry started (errors: ${started.errors.join(" | ")})`);
    assert.equal(started.fake.trays.length, 1, "known positive: on macOS the entry makes its tray");
    assert.equal(appDescription.icons.macos, "icons/macos.png");
    assert.deepEqual(started.fake.dockIcons, [join(SHELL, appDescription.icons.macos)], "failure node: the Dock's icon is the app's macOS icon");
  } finally { await stopEntry(started); for (const folder of [appData, data, resources]) rmSync(folder, { recursive: true, force: true }); }
});

// TST-1005007 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE RUNS AS AN APP; UC-044
// given: the icon files of src/desktop-shell/icons/, and electron-builder's configuration that builderConfig makes from appDescription for each platform with the folder desktop-shell
// input: the PNG headers of tray.png and tray@2x.png; the configuration's files patterns matched against both files' paths
// expect: tray.png is 16×16 and tray@2x.png 32×32 — the menu bar's size at 1× and 2× —; on every platform a pattern of the configuration's files matches each of the two
// Planted fault: a tray.png of 32×32 (the bar draws it at 32 points), or a configuration whose files leave out src/desktop-shell/icons/, makes the size or the packaging assertion fail.
test("TST-1005007: MOD-desktop-shell's tray icon is 16×16 with a 32×32 @2x variant, and the packaged app carries both", () => {
  assert.deepEqual(pngSize(join(SHELL, "icons", "macos.png")), { width: 512, height: 512 }, "known positive: the header is read as the file's size");
  assert.deepEqual(pngSize(join(SHELL, "icons", "tray.png")), { width: 16, height: 16 }, "failure node: tray.png is the bar's size at 1x");
  assert.deepEqual(pngSize(join(SHELL, "icons", "tray@2x.png")), { width: 32, height: 32 }, "tray@2x.png is the bar's size at 2x");
  for (const platform of ["macos", "windows", "linux"]) {
    const { files } = builderConfig(appDescription, { platform, version: "2026.10.0", appId: "io.github.alice.agent-m.bridge", owner: "alice", repository: "agent-m", folders: ["desktop-shell"], resources: "r", output: "o" });
    for (const name of ["tray.png", "tray@2x.png"]) {
      assert.ok(files.some((pattern) => matchesGlob(`src/desktop-shell/icons/${name}`, pattern)), `${platform}: the packaged app carries icons/${name}`);
    }
  }
});
