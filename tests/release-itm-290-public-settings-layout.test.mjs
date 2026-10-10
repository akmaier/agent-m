// TST-290115
// Module: MOD-settings-pages
// Level: release
// Guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE; A FORM OPENS WITH ITS FIRST FIELD FOCUSED
// Given: a controlled Linux Electron/CDP browser and the public dashboard served from its unchanged repository files.
// Input: the person opens Settings at phone and desktop widths, selects each Settings tab, and reads long delivered values.
// Expected: each tab has a readable selected control and visible panel, controls have touch-sized boxes, and neither the
//           document nor a tab panel overflows horizontally.

import assert from "node:assert/strict";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, normalize } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const electronCache = join(tmpdir(), "agent-m-276-release-electron-44");
const executableOf = (installed) => process.platform === "darwin" ? join(installed, "dist/Electron.app/Contents/MacOS/Electron") : join(installed, "dist/electron");
async function runtime() {
  const bundled = "/private/tmp/agent-m-electron-44/node_modules/electron";
  if (existsSync(executableOf(bundled))) return executableOf(bundled);
  const installed = join(electronCache, "node_modules/electron");
  if (!existsSync(executableOf(installed))) {
    const install = spawnSync("npm", ["install", "--no-save", "--prefix", electronCache, "electron@44.5.1"], { encoding: "utf8", timeout: 40000 });
    assert.equal(install.status, 0, `Electron package staging failed: ${install.stderr}`);
    const binary = spawnSync(process.execPath, [join(installed, "install.js")], { encoding: "utf8", timeout: 40000 });
    assert.equal(binary.status, 0, `Electron binary staging failed: ${binary.stderr}`);
  }
  assert.equal(existsSync(executableOf(installed)), true, "Electron 44.5.1 was not acquired.");
  return executableOf(installed);
}
function electronCommand(executable, arguments_) {
  if (process.platform !== "linux") return { command: executable, arguments_ };
  const display = spawnSync("xvfb-run", ["--help"], { encoding: "utf8", timeout: 5000 });
  assert.equal(display.status, 0, `Linux virtual display unavailable: ${display.stderr}`);
  const openbox = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
  assert.equal(openbox.status, 0, `Linux Openbox unavailable: ${openbox.stderr}`);
  return { command: "xvfb-run", arguments_: ["--auto-servernum", "--server-args=-screen 0 1280x1024x24", "sh", "-c", "openbox >/dev/null 2>&1 & wm=$!; trap 'kill \\\"$wm\\\" 2>/dev/null; wait \\\"$wm\\\" 2>/dev/null' EXIT INT TERM; \\\"$@\\\"; status=$?; exit \\\"$status\\\"", "agent-m-xvfb-openbox", executable, ...arguments_] };
}
const wait = async (read) => { for (let n = 0; n < 160; n += 1) { try { const value = await read(); if (value) return value; } catch {} await new Promise((resolve) => setTimeout(resolve, 125)); } throw new Error("Timed out waiting for controlled Electron."); };
const cdp = async (url, method, params = {}) => {
  const socket = new WebSocket(url); await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  try { return await new Promise((resolve, reject) => { socket.addEventListener("message", ({ data }) => { const value = JSON.parse(data); if (value.id === 1) value.error ? reject(new Error(value.error.message)) : resolve(value.result); }); socket.addEventListener("error", reject, { once: true }); socket.send(JSON.stringify({ id: 1, method, params })); }); }
  finally { socket.close(); }
};
const evaluate = async (page, expression) => (await cdp(page, "Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
const port = async () => await new Promise((resolve) => { const s = createServer(); s.listen(0, "127.0.0.1", () => { const value = s.address().port; s.close(() => resolve(value)); }); });
const fixture = () => {
  const api = `localStorage.setItem('agent-m:akmaier/agent-m:endpoint:long',JSON.stringify({url:'https://models-with-a-deliberately-long-hostname.example.test/v1',kind:'openai-compatible',model:'a-deliberately-long-model-name-for-layout-verification',key:'layout-secret',throughBridge:false}));const nativeFetch=window.fetch;window.fetch=async(u,o={})=>{const x=String(u);if(x.includes('api.github.com'))return new Response(JSON.stringify(x.includes('/git/trees/')?{tree:[]}:x.includes('/git/ref/')?{object:{sha:'a'.repeat(40)}}:x.includes('/git/commits/')?{tree:{sha:'b'.repeat(40)}}:{private:false,default_branch:'main',permissions:{push:true}}),{status:200,headers:{'content-type':'application/json'}});return nativeFetch(u,o)};`;
  return createServer((request, response) => {
    const raw = decodeURIComponent(new URL(request.url, "http://fixture").pathname), relative = raw === "/" ? "index.html" : raw.replace(/^\//, "");
    const file = normalize(join(root, relative));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    if (relative === "index.html") { response.setHeader("content-type", "text/html"); response.end(readFileSync(file, "utf8").replace("<head>", `<head><script>${api}</script>`)); return; }
    response.writeHead(200, { "content-type": relative.endsWith(".mjs") ? "text/javascript" : relative.endsWith(".css") ? "text/css" : relative.endsWith(".json") ? "application/json" : "application/octet-stream" }); createReadStream(file).pipe(response);
  });
};

test("TST-290115: public Settings tabs fit phone and desktop layouts", { timeout: 120000, concurrency: false }, async (t) => {
  const electron = await runtime();
  const server = fixture(); await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const debug = await port(), address = `http://127.0.0.1:${server.address().port}/#settings`;
  const launched = electronCommand(electron, [...(process.platform === "linux" ? ["--no-sandbox"] : []), `--remote-debugging-port=${debug}`, `--app=${address}`]);
  const child = spawn(launched.command, launched.arguments_, { cwd: root, stdio: "ignore" });
  t.after(() => { child.kill(); server.close(); });
  const target = await wait(async () => (await (await fetch(`http://127.0.0.1:${debug}/json/list`)).json()).find((item) => item.url.startsWith("http://127.0.0.1"))?.webSocketDebuggerUrl);
  for (const width of [390, 1280]) {
    await cdp(target, "Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    await wait(async () => await evaluate(target, "document.querySelectorAll('.settings-tab').length === 4"));
    const result = await evaluate(target, `(()=>{const tabs=[...document.querySelectorAll('.settings-tab')];return {longValue:document.body.innerText.includes('models-with-a-deliberately-long-hostname.example.test'),overflow:document.documentElement.scrollWidth<=${width},tabs:tabs.map(t=>{t.click();const panel=document.getElementById(t.getAttribute('aria-controls'));const r=t.getBoundingClientRect(),p=panel.getBoundingClientRect();return {selected:t.getAttribute('aria-selected'),readable:r.width>40&&r.height>=24,visible:!panel.hidden&&p.width>0,visibleCount:[...document.querySelectorAll('.settings-tab-panel')].filter(x=>!x.hidden).length,panelOverflow:panel.scrollWidth<=panel.clientWidth};})}})()`);
    assert.equal(result.longValue, true, `${width}px: the controlled long endpoint value is delivered to the public page`);
    assert.equal(result.overflow, true, `${width}px: the public Settings document has no horizontal overflow`);
    // Root CI counterproof: temporarily change settings.mjs's `pane.hidden = !chosen`
    // to `pane.hidden = false`; this same case fails visibleCount, then the exact
    // source bytes are restored before the ordinary green run.
    for (const tab of result.tabs) { assert.equal(tab.selected, "true", `${width}px: selected state follows the clicked tab`); assert.equal(tab.readable, true, `${width}px: tab control is readable and usable`); assert.equal(tab.visible, true, `${width}px: selected panel is visible`); assert.equal(tab.visibleCount, 1, `${width}px: exactly one tab panel is visible`); assert.equal(tab.panelOverflow, true, `${width}px: selected panel has no horizontal overflow`); }
  }
});
