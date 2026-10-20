// MOD-settings-pages' route `bridge` offers the Bridge's file for this computer (ITM-1047), as the accepted text of docs/architecture/MOD-settings-pages.md (Interfaces: `bridge`) and UC-044 (steps 1 and 2) state it:
// "the release's file for this computer's system with its size and the SHA-256 the server reports for it, or, where the server reports none, a link to the release's checksum file"; "The page explains the two levels
// with the table above, recognises the operating system, and offers the one file for it"; "a folded **Why this warning?** on the download page says so".
// Run: node --test tests/settings-pages-bridge-download.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-044; AGENT M WORKS WITHOUT A LOCAL INSTALLATION; THE BRIDGE IS ONE FILE PER PLATFORM; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// The route is driven through MOD-settings-pages' public view, in the browser stand-in of tests/site-frame-dom.mjs (the route draws MOD-site-frame's folded explanations). The instance's host is a fake that answers
// listReleaseAssets with a release of the four files of MOD-bridge-build (a `.dmg`, a `.zip`, an `.exe` and an `.AppImage`), their checksum file and the update feed; the system is the browser's `navigator.userAgent`.
// Readings the module text leaves open, which the tests state (the pull request names them):
//   - The release is the instance repository's latest (`listReleaseAssets("latest")`, asked once when the route is drawn), the instance's host being the ViewContext's.
//   - The system is recognised from `navigator.userAgent`: Windows, macOS (Macintosh, Mac OS X) and Linux (X11, Linux but not Android). The file offered is the release's `.exe`, `.dmg` or `.AppImage` — never the macOS `.zip`,
//     which only the updater downloads —; for another system nothing is offered and the page says so.
//   - The offer is <section class="bridge-download"> with <a class="bridge-file"> (the file's name, linking its download address), <span class="bridge-size"> (the size in megabytes, one decimal: "123.5 MB"),
//     <code class="bridge-sha256"> (the SHA-256 the server reports) or, where it reports none, <a class="bridge-checksums"> to the release's file SHA256SUMS; <p class="bridge-no-file"> where there is no file to offer;
//     <p class="bridge-download-problem"> where the release cannot be read, the rest of the page standing.
//   - The two levels are explain("bridge-levels") ("What is this?") and the warning explain("bridge-signed-warning", "Why this warning?"), both folded and in the section.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { view } = await import("../src/settings-pages/index.mjs");
const { openStore } = await import("../src/browser-store/index.mjs");

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child.nodeType === 1) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => (node.className ?? "").split(" ").includes(name));
const byTag = (root, name) => descendants(root, (node) => node.localName === name);

const BASE = "https://github.com/fixture/agent-m/releases/download/v2026.10.19";
const SHA = (letter) => letter.repeat(64);
const FILE = (name, size, sha256) => ({ name, size, url: `${BASE}/${name}`, sha256 });
const ASSETS = [
  FILE("Agent-M-Bridge-2026.10.19-macos.dmg", 123456789, SHA("a")),
  FILE("Agent-M-Bridge-2026.10.19-macos.zip", 119000000, SHA("b")),
  FILE("Agent-M-Bridge-2026.10.19-windows.exe", 98765432, SHA("c")),
  FILE("Agent-M-Bridge-2026.10.19-linux.AppImage", 105000000, SHA("d")),
  FILE("latest-mac.yml", 400, null),
  FILE("SHA256SUMS", 380, null),
];
const release = (assets = ASSETS, notes = "") => ({ tag: "v2026.10.19", name: "2026.10.19", published: "2026-10-19", notes, assets });
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const LINUX = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";

/** The route drawn with the system `agent` and the answer `answer` (a release, or a function that throws); -> { target, calls } */
async function draw(agent, answer) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { userAgent: agent } });
  const calls = [];
  const host = { listReleaseAssets: async (tag) => { calls.push(tag); if (typeof answer === "function") return answer(); return answer; } };
  const route = view.routes.find((candidate) => candidate.name === "bridge");
  assert.ok(route, "view exposes the public Bridge Route");
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "main", instance: { repository: "fixture/agent-m", host }, product: null, store: openStore("fixture/agent-m"), go() {} }, {});
  await new Promise((resolve) => setImmediate(resolve));
  return { target, calls };
}
const offered = (target) => byClass(target, "bridge-file").map((link) => [link.textContent, link.getAttribute("href")]);

// TST-1047001 · level: unit · module: MOD-settings-pages
// guards: UC-044 (step 1); THE BRIDGE IS ONE FILE PER PLATFORM
// given: the release of the four files of MOD-bridge-build, its checksum file and its update feed; the browser is on macOS
// input: the route bridge drawn
// expect: the release was asked for once, as "latest"; exactly one file is offered, the .dmg, linking its download address, with its size "123.5 MB" and its SHA-256 (64 times a); the macOS .zip, which only the updater downloads, is not offered and its address stands nowhere on the page; no link to the checksum file, since the server reported the SHA-256
test("the bridge route offers the .dmg on macOS with its size and SHA-256, and never the updater's .zip", async () => {
  const { target, calls } = await draw(MAC, release());
  assert.deepEqual(calls, ["latest"]);
  assert.deepEqual(offered(target), [["Agent-M-Bridge-2026.10.19-macos.dmg", `${BASE}/Agent-M-Bridge-2026.10.19-macos.dmg`]]);
  assert.equal(byClass(target, "bridge-size")[0].textContent, "123.5 MB");
  assert.equal(byClass(target, "bridge-sha256")[0].textContent, SHA("a"));
  assert.equal(byClass(target, "bridge-checksums").length, 0);
  const links = byTag(target, "a").map((link) => link.getAttribute("href"));
  assert.equal(links.some((href) => /macos\.zip$/.test(href ?? "")), false, "the updater's .zip is offered to nobody");
  assert.equal(target.textContent.includes(SHA("b")), false);
});

// TST-1047002 · level: unit · module: MOD-settings-pages
// guards: UC-044 (step 1); THE BRIDGE IS ONE FILE PER PLATFORM
// given: the same release; the browser on Windows, then on Linux
// input: the route bridge drawn for each
// expect: on Windows the .exe is offered with "98.8 MB" and its SHA-256 (c); on Linux the .AppImage with "105.0 MB" and its SHA-256 (d); each alone
test("the bridge route offers the .exe on Windows and the .AppImage on Linux, each with its size and SHA-256", async () => {
  const windows = (await draw(WINDOWS, release())).target;
  assert.deepEqual(offered(windows), [["Agent-M-Bridge-2026.10.19-windows.exe", `${BASE}/Agent-M-Bridge-2026.10.19-windows.exe`]]);
  assert.deepEqual([byClass(windows, "bridge-size")[0].textContent, byClass(windows, "bridge-sha256")[0].textContent], ["98.8 MB", SHA("c")]);
  const linux = (await draw(LINUX, release())).target;
  assert.deepEqual(offered(linux), [["Agent-M-Bridge-2026.10.19-linux.AppImage", `${BASE}/Agent-M-Bridge-2026.10.19-linux.AppImage`]]);
  assert.deepEqual([byClass(linux, "bridge-size")[0].textContent, byClass(linux, "bridge-sha256")[0].textContent], ["105.0 MB", SHA("d")]);
});

// TST-1047003 · level: unit · module: MOD-settings-pages
// guards: UC-044 (step 1); THE BRIDGE IS ONE FILE PER PLATFORM
// given: the release whose server reports no SHA-256 for any file; the browser on Windows
// input: the route bridge drawn
// expect: the .exe is offered with its size; no SHA-256 is written; a link to the release's checksum file SHA256SUMS stands beside it (class bridge-checksums, its download address)
test("the bridge route links the checksum file where the server reports no SHA-256", async () => {
  const bare = ASSETS.map((asset) => ({ ...asset, sha256: null }));
  const { target } = await draw(WINDOWS, release(bare));
  assert.equal(offered(target).length, 1);
  assert.equal(byClass(target, "bridge-sha256").length, 0);
  assert.equal(byClass(target, "bridge-checksums")[0].getAttribute("href"), `${BASE}/SHA256SUMS`);
});

// TST-1047004 · level: unit · module: MOD-settings-pages
// guards: UC-044 (steps 1 and 2); EVERY STEP EXPLAINS ITSELF
// given: the release; the browser on Windows
// input: the route bridge drawn; the folded explanations in the section of the download
// expect: two explanations, both folded (no open attribute): the two levels under "What is this?" and the signed warning under "Why this warning?"; the levels' text says Level 1 and Level 2, the warning's names More info and Run anyway
test("the bridge route folds the explanation of the two levels and of the warning beside the download", async () => {
  const { target } = await draw(WINDOWS, release());
  const section = byClass(target, "bridge-download")[0];
  assert.ok(section, "the download section is drawn");
  const folds = byTag(section, "details");
  assert.deepEqual(folds.map((fold) => [fold.children[0].textContent, fold.hasAttribute("open")]), [["What is this?", false], ["Why this warning?", false]]);
  assert.match(folds[0].textContent, /Level 1[\s\S]*Level 2/);
  assert.match(folds[1].textContent, /More info[\s\S]*Run anyway/);
});

// TST-1047005 · level: unit · module: MOD-settings-pages
// guards: UC-044 (step 1); THE BRIDGE IS ONE FILE PER PLATFORM
// given: a release that holds, for macOS, only the updater's .zip (no .dmg); and the browser on an Android phone, which no file of the release is for
// input: the route bridge drawn for each
// expect: counter-proof: on macOS no file is offered — the .zip is not offered in the .dmg's place — and the page says the release holds no file for this system (class bridge-no-file); on Android likewise
test("the bridge route offers no file where the release has none for the system, and never the .zip in place of the .dmg", async () => {
  const onlyZip = ASSETS.filter((asset) => !/\.dmg$/.test(asset.name));
  const mac = (await draw(MAC, release(onlyZip))).target;
  assert.deepEqual(offered(mac), []);
  assert.match(byClass(mac, "bridge-no-file")[0].textContent, /no file for this system/);
  assert.equal(byTag(mac, "a").some((link) => /macos\.zip$/.test(link.getAttribute("href") ?? "")), false);
  const android = (await draw(ANDROID, release())).target;
  assert.deepEqual(offered(android), []);
  assert.match(byClass(android, "bridge-no-file")[0].textContent, /no file for this system/);
});

// TST-1047006 · level: unit · module: MOD-settings-pages
// guards: UC-044; EVERY STEP EXPLAINS ITSELF
// given: the instance's host cannot read the release (NotFound); the browser on macOS
// input: the route bridge drawn
// expect: the page says the release could not be read, with the host's reason (class bridge-download-problem), offers no file, and still draws the pairing (the button Pair Bridge)
test("the bridge route says why a release could not be read, and still draws the rest of the page", async () => {
  const { target } = await draw(MAC, () => { throw Object.assign(new Error("the release latest of https://github.com/fixture/agent-m does not exist"), { name: "NotFound" }); });
  assert.match(byClass(target, "bridge-download-problem")[0].textContent, /does not exist/);
  assert.deepEqual(offered(target), []);
  assert.equal(byClass(target, "bridge-pair").length, 1);
});

// ITM-1079 — the publisher to look for. MOD-settings-pages.md (Interfaces: `bridge`): "beside the file the publisher to look for, the name of the line `Publisher (<system>): <name>` that the release's notes hold for this system
// (MOD-bridge-build), which the folded *Why this warning?* repeats; where the notes hold no such line (Linux, or a release written without it), the page says that the release names no publisher for this system and writes none".
// Readings the texts leave open: the name stands in <span class="bridge-publisher"> beside the file, the same name in <p class="bridge-publisher-in-warning"> inside the fold of the warning; where there is none,
// <p class="bridge-no-publisher"> says "The release names no publisher for this system." The system names in the notes are macOS and Windows (MOD-bridge-build's lines).
const NOTES = "Agent M 2026.10.19, commit abc1234.\n\nDue diligence: read.\n\nPublisher (macOS): Acme Software Inc.\nPublisher (Windows): Acme Signing GmbH\n";
const warningOf = (target) => byTag(target, "details").find((fold) => fold.children[0].textContent === "Why this warning?");

// TST-1079001 · level: unit · module: MOD-settings-pages
// guards: UC-044 (steps 1 and 2); THE BRIDGE IS SIGNED BY ITS PUBLISHER; EVERY STEP EXPLAINS ITSELF
// given: a release whose notes hold Publisher (macOS): Acme Software Inc. and Publisher (Windows): Acme Signing GmbH; the browser on macOS, then on Windows
// input: the route bridge drawn for each
// expect: on macOS the name beside the file is "Acme Software Inc." and the fold of Why this warning? holds the same name; on Windows "Acme Signing GmbH" in both; the other system's name stands nowhere on the page; no "names no publisher" sentence
test("the bridge route names the publisher of this system beside the file and in the warning's fold", async () => {
  const mac = (await draw(MAC, release(ASSETS, NOTES))).target;
  assert.equal(byClass(mac, "bridge-publisher")[0].textContent, "Acme Software Inc.");
  assert.match(byClass(warningOf(mac), "bridge-publisher-in-warning")[0].textContent, /Acme Software Inc\./);
  assert.equal(mac.textContent.includes("Acme Signing GmbH"), false, "the Windows name is not shown on macOS");
  assert.equal(byClass(mac, "bridge-no-publisher").length, 0);
  const windows = (await draw(WINDOWS, release(ASSETS, NOTES))).target;
  assert.equal(byClass(windows, "bridge-publisher")[0].textContent, "Acme Signing GmbH");
  assert.match(byClass(warningOf(windows), "bridge-publisher-in-warning")[0].textContent, /Acme Signing GmbH/);
  assert.equal(windows.textContent.includes("Acme Software Inc."), false, "the macOS name is not shown on Windows");
});

// TST-1079002 · level: unit · module: MOD-settings-pages
// guards: UC-044; THE BRIDGE IS SIGNED BY ITS PUBLISHER; NO COST IS GUESSED
// given: the release of TST-1079001, whose notes name a publisher for macOS and Windows only; the browser on Linux; and a release whose notes hold no Publisher line, the browser on Windows
// input: the route bridge drawn for each
// expect: counter-proof: on Linux, and on Windows without the line, the page says "The release names no publisher for this system." (class bridge-no-publisher) and writes no name — neither beside the file nor in the fold —, and still offers the file
test("the bridge route says that the release names no publisher where its notes hold none for this system, and writes none", async () => {
  const linux = (await draw(LINUX, release(ASSETS, NOTES))).target;
  assert.equal(byClass(linux, "bridge-no-publisher")[0].textContent, "The release names no publisher for this system.");
  assert.equal(byClass(linux, "bridge-publisher").length, 0);
  assert.equal(linux.textContent.includes("Acme"), false, "no name of another system stands in its place");
  assert.equal(offered(linux).length, 1);
  const bare = (await draw(WINDOWS, release(ASSETS, "Agent M 2026.10.19\n"))).target;
  assert.equal(byClass(bare, "bridge-no-publisher").length, 1);
  assert.equal(byClass(bare, "bridge-publisher").length, 0);
  assert.equal(byClass(warningOf(bare), "bridge-publisher-in-warning").length, 0);
});
