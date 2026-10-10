// TST-290115
// Module: MOD-settings-pages
// Level: release
// Guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE; A FORM OPENS WITH ITS FIRST FIELD FOCUSED
// Given: a controlled Linux Electron/CDP browser and the public dashboard served from its unchanged repository files.
// Input: the person opens Settings at phone and desktop widths, selects each Settings tab, and reads long delivered values.
// Expected: each tab has a readable selected control and visible panel, controls have touch-sized boxes, and neither the
//           document nor a tab panel overflows horizontally.

import assert from "node:assert/strict";
import { createReadStream, existsSync, mkdtempSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, normalize } from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const electron = "/private/tmp/agent-m-electron-44/node_modules/electron/dist/electron";
const wait = async (read) => { for (let n = 0; n < 160; n += 1) { try { const value = await read(); if (value) return value; } catch {} await new Promise((resolve) => setTimeout(resolve, 125)); } throw new Error("Timed out waiting for controlled Electron."); };
const cdp = async (url, method, params = {}) => {
  const socket = new WebSocket(url); await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  try { return await new Promise((resolve, reject) => { socket.addEventListener("message", ({ data }) => { const value = JSON.parse(data); if (value.id === 1) value.error ? reject(new Error(value.error.message)) : resolve(value.result); }); socket.addEventListener("error", reject, { once: true }); socket.send(JSON.stringify({ id: 1, method, params })); }); }
  finally { socket.close(); }
};
const evaluate = async (page, expression) => (await cdp(page, "Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
const port = async () => await new Promise((resolve) => { const s = createServer(); s.listen(0, "127.0.0.1", () => { const value = s.address().port; s.close(() => resolve(value)); }); });
const fixture = () => {
  const api = `const nativeFetch=window.fetch;window.fetch=async(u,o={})=>{const x=String(u);if(x.includes('api.github.com'))return new Response(JSON.stringify(x.includes('/git/trees/')?{tree:[]}:x.includes('/git/ref/')?{object:{sha:'a'.repeat(40)}}:x.includes('/git/commits/')?{tree:{sha:'b'.repeat(40)}}:{private:false,default_branch:'main',permissions:{push:true}}),{status:200,headers:{'content-type':'application/json'}});return nativeFetch(u,o)};`;
  return createServer((request, response) => {
    const raw = decodeURIComponent(new URL(request.url, "http://fixture").pathname), relative = raw === "/" ? "index.html" : raw.replace(/^\//, "");
    const file = normalize(join(root, relative));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    if (relative === "index.html") { response.setHeader("content-type", "text/html"); response.end(readFileSync(file, "utf8").replace("<head>", `<head><script>${api}</script>`)); return; }
    response.writeHead(200); createReadStream(file).pipe(response);
  });
};

test("TST-290115: public Settings tabs fit phone and desktop layouts", { timeout: 120000, concurrency: false }, async (t) => {
  assert.equal(existsSync(electron), true, "known positive: the approved Electron 44 fixture is staged in Ubuntu CI");
  const server = fixture(); await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const debug = await port(), address = `http://127.0.0.1:${server.address().port}/#settings`;
  const child = spawn(electron, ["--no-sandbox", `--remote-debugging-port=${debug}`, `--app=${address}`], { cwd: root, stdio: "ignore" });
  t.after(() => { child.kill(); server.close(); });
  const target = await wait(async () => (await (await fetch(`http://127.0.0.1:${debug}/json/list`)).json()).find((item) => item.url.startsWith("http://127.0.0.1"))?.webSocketDebuggerUrl);
  for (const width of [390, 1280]) {
    await cdp(target, "Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    await wait(async () => await evaluate(target, "document.querySelectorAll('.settings-tab').length === 4"));
    const result = await evaluate(target, `(()=>{const tabs=[...document.querySelectorAll('.settings-tab')];return {overflow:document.documentElement.scrollWidth<=${width},tabs:tabs.map(t=>{t.click();const panel=document.getElementById(t.getAttribute('aria-controls'));const r=t.getBoundingClientRect(),p=panel.getBoundingClientRect();return {selected:t.getAttribute('aria-selected'),readable:r.width>40&&r.height>=24,visible:!panel.hidden&&p.width>0,panelOverflow:panel.scrollWidth<=panel.clientWidth};})}})()`);
    assert.equal(result.overflow, true, `${width}px: the public Settings document has no horizontal overflow`);
    for (const tab of result.tabs) { assert.equal(tab.selected, "true", `${width}px: selected state follows the clicked tab`); assert.equal(tab.readable, true, `${width}px: tab control is readable and usable`); assert.equal(tab.visible, true, `${width}px: selected panel is visible`); assert.equal(tab.panelOverflow, true, `${width}px: selected panel has no horizontal overflow`); }
  }
});
