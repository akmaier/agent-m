// The Bridge's icons (ITM-1006), as the accepted text of docs/architecture/MOD-desktop-shell.md states them under Parts:
// "`icons/` — the app's icon for each platform, and the icon of the menu bar and the tray", and under Interfaces: appDescription
// names `icons: { macos, windows, linux }`, and "on macOS and Windows the icon in the menu bar or the tray opens the window".
// Run: node --test tests/mod-desktop-shell-icons.test.mjs
//
// Module: MOD-desktop-shell
// Guards: UC-044; THE BRIDGE RUNS AS AN APP
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The icon files are read from the repository;
// the tray is created by the real entry over a constructed Electron (tests/desktop-shell.d/entry.mjs), which records the image it is given.
// The reading the pull request names: the icon of the menu bar and the tray is `icons/tray.png`, since appDescription names three icons only.

import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { appDescription } from "../src/desktop-shell/index.mjs";
import { startEntry, stopEntry, temporary, bridgeSettings } from "./desktop-shell.d/entry.mjs";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";
import { saveSettings } from "../src/desktop-shell/settings.mjs";

const shell = resolve(new URL("../src/desktop-shell/", import.meta.url).pathname);
const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// The width and height a PNG file states in its IHDR chunk, or null for a file that is no PNG.
function pngSize(path) {
  const bytes = readFileSync(path);
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(SIGNATURE) || bytes.subarray(12, 16).toString("latin1") !== "IHDR") return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

// TST-1006001 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE RUNS AS AN APP
// given: appDescription, which names the app's icon for macOS, Windows and Linux
// input: each named icon, and icons/tray.png, looked up under src/desktop-shell/
// expect: the four files exist and are PNG files with a width and a height of at least 16 pixels; each of the three platform icons is square and at least 256 pixels wide
// Planted fault: removing a named icon, or replacing one with a file that is no PNG, fails the file's assertion.
test("TST-1006001: MOD-desktop-shell holds the icon of each platform and the icon of the menu bar and the tray, all PNG files", () => {
  assert.deepEqual(Object.keys(appDescription.icons).sort(), ["linux", "macos", "windows"]);
  for (const [platform, name] of Object.entries(appDescription.icons)) {
    const path = join(shell, name);
    assert.ok(existsSync(path), `${platform}: ${name} exists`);
    const size = pngSize(path);
    assert.ok(size, `${platform}: ${name} is a PNG file`);
    assert.ok(size.width === size.height && size.width >= 256, `${platform}: ${name} is square and at least 256 pixels wide (${size.width} × ${size.height})`);
  }
  const tray = join(shell, "icons/tray.png");
  assert.ok(existsSync(tray), "icons/tray.png exists");
  const size = pngSize(tray);
  assert.ok(size && size.width >= 16 && size.height >= 16, "icons/tray.png is a PNG file of at least 16 × 16 pixels");
});

// TST-1006002 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE RUNS AS AN APP
// given: the app's entry started from the source folder on macOS (the platform reported as darwin), and on Windows, over a constructed Electron
// input: the entry's start
// expect: one tray is created, with the image made from the file src/desktop-shell/icons/tray.png; on Linux, where the window stays open, no tray is created
// Planted fault: creating the tray from another file, or on Linux too, fails the path or the count.
test("TST-1006002: MOD-desktop-shell creates the tray with its icon on macOS and Windows, and none on Linux", async () => {
  for (const [platform, trays] of [["darwin", 1], ["win32", 1], ["linux", 0]]) {
    const appData = temporary(), data = temporary(), resources = temporary();
    const [port] = await unusedPorts(1);
    saveSettings(data, bridgeSettings(port));
    const started = await startEntry({ resources, appData, platform, argv: ["--instance=carol/product-x", "--origin=https://carol.github.io", `--port=${port}`, `--data-folder=${data}`] });
    try {
      assert.equal(started.outcome.kind, "loaded", `${platform}: the entry started (errors: ${started.errors.join(" | ")})`);
      assert.equal(started.fake.trays.length, trays, `${platform}: trays`);
      if (trays) assert.equal(started.fake.trays[0].image.path, join(shell, "icons/tray.png"), `${platform}: the tray's image`);
    } finally { await stopEntry(started); for (const folder of [appData, data, resources]) rmSync(folder, { recursive: true, force: true }); }
  }
});
