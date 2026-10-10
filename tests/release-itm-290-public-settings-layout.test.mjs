// TST-290115
// Module: MOD-settings-pages
// Level: release
// Guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE; A FORM OPENS WITH ITS FIRST FIELD FOCUSED
// Given: a controlled Linux Electron/CDP browser and the public dashboard served from its unchanged repository files.
// Input: the person opens Settings at phone and desktop widths, selects each Settings tab, and reads long delivered values.
// Expected: each tab has a readable selected control and visible panel, controls have touch-sized boxes, and neither the
//           document nor a tab panel overflows horizontally.

import assert from "node:assert/strict";
import { cpSync, createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, normalize } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import test from "node:test";

const root = process.env.AGENT_M_290_ROOT ?? new URL("..", import.meta.url).pathname;
const electronCache = join(tmpdir(), "agent-m-290-release-electron-44");
const nativeFixtureLock = join(tmpdir(), "agent-m-276-native-fixture-lock");
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
  let openbox = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
  if (openbox.status !== 0) {
    const install = spawnSync("sudo", ["apt-get", "install", "--yes", "--no-install-recommends", "openbox"], { encoding: "utf8", timeout: 40000 });
    assert.equal(install.status, 0, `Linux Openbox installation failed: ${install.stderr}`);
    openbox = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
  }
  assert.equal(openbox.status, 0, `Linux Openbox unavailable: ${openbox.stderr}`);
  return { command: "xvfb-run", arguments_: ["--auto-servernum", "--server-args=-screen 0 1280x1024x24", "sh", "-c", "openbox >/dev/null 2>&1 & wm=$!; trap 'kill \"$wm\" 2>/dev/null; wait \"$wm\" 2>/dev/null' EXIT INT TERM; \"$@\"; status=$?; exit \"$status\"", "agent-m-xvfb-openbox", executable, ...arguments_] };
}
const wait = async (read, fatal = () => {}, evidence = () => "") => { for (let n = 0; n < 160; n += 1) { fatal(); try { const value = await read(); if (value) return value; } catch {} await new Promise((resolve) => setTimeout(resolve, 125)); } fatal(); throw new Error(`Timed out waiting for controlled Electron.${evidence()}`); };
const acquireNativeFixtureLock = async () => { for (let n = 0; n < 240; n += 1) { try { mkdirSync(nativeFixtureLock); return; } catch (error) { if (error.code !== "EEXIST") throw error; } await new Promise((resolve) => setTimeout(resolve, 125)); } throw new Error("Timed out waiting for the controlled Electron fixture lock."); };
const cdp = async (url, method, params = {}) => {
  const socket = new WebSocket(url); await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  try { return await new Promise((resolve, reject) => { socket.addEventListener("message", ({ data }) => { const value = JSON.parse(data); if (value.id === 1) value.error ? reject(new Error(value.error.message)) : resolve(value.result); }); socket.addEventListener("error", reject, { once: true }); socket.send(JSON.stringify({ id: 1, method, params })); }); }
  finally { socket.close(); }
};
const evaluate = async (page, expression) => (await cdp(page, "Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
const port = async () => await new Promise((resolve) => { const s = createServer(); s.listen(0, "127.0.0.1", () => { const value = s.address().port; s.close(() => resolve(value)); }); });
const fixture = () => {
  const api = `localStorage.setItem('agent-m:akmaier/agent-m:endpoint:long',JSON.stringify({url:'https://models-with-a-deliberately-long-hostname.example.test/v1',kind:'openai-compatible',model:'a-deliberately-long-model-name-for-layout-verification',key:'layout-secret',throughBridge:false}));const nativeFetch=window.fetch;window.fetch=async(u,o={})=>{const x=String(u);if(x.includes('api.github.com')){const body=x.includes('/repos/akmaier/agent-m/commits/main')?{sha:'a'.repeat(40)}:x.includes('/git/trees/')?{tree:[]}:x.includes('/git/ref/')?{object:{sha:'a'.repeat(40)}}:x.includes('/git/commits/')?{tree:{sha:'b'.repeat(40)}}:{private:false,default_branch:'main',permissions:{push:true}};return new Response(JSON.stringify(body),{status:200,headers:{'content-type':'application/json'}})}return nativeFetch(u,o)};`;
  return createServer((request, response) => {
    const raw = decodeURIComponent(new URL(request.url, "http://fixture").pathname), relative = raw === "/" || raw === "/docs/" ? "docs/index.html" : raw.replace(/^\//, "");
    const file = normalize(join(root, relative));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    if (relative === "docs/index.html") { response.setHeader("content-type", "text/html"); response.end(readFileSync(file, "utf8").replace("<head>", `<head><script>${api}</script>`)); return; }
    response.writeHead(200, { "content-type": relative.endsWith(".mjs") || relative.endsWith(".js") ? "text/javascript" : relative.endsWith(".css") ? "text/css" : relative.endsWith(".json") ? "application/json" : "application/octet-stream" }); createReadStream(file).pipe(response);
  });
};

test("TST-290115: public Settings tabs fit phone and desktop layouts", { timeout: 120000, concurrency: false }, async (t) => {
  await acquireNativeFixtureLock();
  let child = null, server = null, entryFolder = null, released = false;
  const release = async () => {
    if (released) return;
    released = true;
    if (child?.exitCode === null) {
      if (process.platform === "linux" && child.pid) {
        try { process.kill(-child.pid, "SIGTERM"); }
        catch { child.kill(); }
      } else child.kill();
      child.stdout.destroy(); child.stderr.destroy(); child.unref();
    }
    if (server) await new Promise((resolve) => server.close(resolve));
    if (entryFolder) rmSync(entryFolder, { recursive: true, force: true });
    rmSync(nativeFixtureLock, { recursive: true, force: true });
  };
  t.after(release);
  const electron = await runtime();
  server = fixture(); await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const debug = await port(), inspect = await port(), address = `http://127.0.0.1:${server.address().port}/docs/#settings`;
  entryFolder = mkdtempSync(join(tmpdir(), "agent-m-290-electron-entry-"));
  const entry = join(entryFolder, "main.mjs");
  writeFileSync(entry, `import electron from "electron"; const start = async () => { const url = process.argv.find((value) => value.startsWith("--fixture-url="))?.slice("--fixture-url=".length); if (!url) throw new Error("Missing --fixture-url."); await electron.app.whenReady(); const window = new electron.BrowserWindow({ webPreferences: { contextIsolation: true, nodeIntegration: false } }); electron.app.on("window-all-closed", () => electron.app.quit()); await window.loadURL(url); }; start().catch((failure) => { console.error(failure.message); electron.app?.quit?.(); });`);
  const launched = electronCommand(electron, [...(process.platform === "linux" ? ["--no-sandbox"] : []), `--inspect=${inspect}`, `--remote-debugging-port=${debug}`, entry, `--fixture-url=${address}`]);
  child = spawn(launched.command, launched.arguments_, { cwd: root, detached: process.platform === "linux", stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "", stderr = "", spawnError = null;
  child.stdout.on("data", (chunk) => { stdout = `${stdout}${chunk}`.slice(-4000); });
  child.stderr.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-4000); });
  child.on("error", (error) => { spawnError = error; });
  const stopped = () => { if (spawnError || child.exitCode !== null || child.signalCode !== null) throw new Error(`Controlled Electron stopped; argv=${JSON.stringify([launched.command, ...launched.arguments_])}; cwd=${root}; exit=${child.exitCode}; signal=${child.signalCode}; error=${spawnError?.code ?? null}; stdout=${stdout}; stderr=${stderr}`); };
  let debugTargets = "";
  const target = await wait(async () => {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${debug}/json/list`)).json();
      debugTargets = JSON.stringify(targets.map(({ type, url }) => ({ type, url }))).slice(-4000);
      return targets.find((item) => item.url.startsWith("http://127.0.0.1"))?.webSocketDebuggerUrl;
    } catch (error) { debugTargets = `${error.name}: ${error.message}`; throw error; }
  }, stopped, () => ` argv=${JSON.stringify([launched.command, ...launched.arguments_])}; cwd=${root}; exit=${child.exitCode}; signal=${child.signalCode}; error=${spawnError?.code ?? null}; stdout=${stdout}; stderr=${stderr}; debugTargets=${debugTargets}`);
  for (const width of [390, 1280]) {
    await cdp(target, "Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    await wait(async () => await evaluate(target, "document.querySelectorAll('.settings-tab').length === 4"));
    const cdpLayout = await cdp(target, "Page.getLayoutMetrics");
    const result = await evaluate(target, `(()=>{const tabs=[...document.querySelectorAll('.settings-tab')],general=tabs[0],unfinished='unfinished-passphrase';general.click();const passphrase=document.querySelector('.settings-export-passphrase');passphrase.value=unfinished;general.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));const keyboard={selected:tabs[1].getAttribute('aria-selected'),focus:document.activeElement===tabs[1]};general.click();const preserved=passphrase.value===unfinished;return {url:location.href,viewport:{innerWidth,innerHeight,outerWidth,outerHeight,visual:{width:visualViewport?.width??null,height:visualViewport?.height??null,scale:visualViewport?.scale??null},screen:{width:screen.width,height:screen.height}},document:{scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth},keyboard,preserved,tabs:tabs.map(t=>{t.click();const panel=document.getElementById(t.getAttribute('aria-controls')),r=t.getBoundingClientRect(),p=panel.getBoundingClientRect(),style=getComputedStyle(t);return {name:t.textContent,label:t.getAttribute('aria-label')??t.textContent,rect:{x:r.x,y:r.y,width:r.width,height:r.height},computed:{fontSize:style.fontSize,lineHeight:style.lineHeight,paddingTop:style.paddingTop,paddingRight:style.paddingRight,paddingBottom:style.paddingBottom,paddingLeft:style.paddingLeft},panel:{width:p.width,height:p.height,scrollWidth:panel.scrollWidth,clientWidth:panel.clientWidth},selected:t.getAttribute('aria-selected'),readable:r.width>40&&r.height>=24,visible:!panel.hidden&&p.width>0,visibleCount:[...document.querySelectorAll('.settings-tab-panel')].filter(x=>!x.hidden).length,documentOverflow:document.documentElement.scrollWidth<=${width},panelOverflow:panel.scrollWidth<=panel.clientWidth,longValue:panel.innerText.includes('models-with-a-deliberately-long-hostname.example.test')};})}})()`);
    assert.deepEqual(result.keyboard, { selected: "true", focus: true }, `${width}px: ArrowRight selects and focuses the next rendered Settings tab`);
    assert.equal(result.preserved, true, `${width}px: unfinished export passphrase survives tab switches`);
    assert.equal(result.tabs.find((tab) => tab.name === "Endpoints & Agents").longValue, true, `${width}px: the controlled long endpoint value is visible in the public Endpoints pane`);
    for (const tab of result.tabs) { const actual = JSON.stringify({ requestedViewport: { width, height: 900, mobile: width < 600 }, url: result.url, viewport: result.viewport, cdpLayout, document: result.document, tab }); assert.equal(tab.selected, "true", `${width}px: selected state follows the clicked tab; actual=${actual}`); assert.equal(tab.readable, true, `${width}px: tab control is readable and usable; actual=${actual}`); assert.equal(tab.visible, true, `${width}px: selected panel is visible; actual=${actual}`); assert.equal(tab.visibleCount, 1, `${width}px: exactly one tab panel is visible; actual=${actual}`); assert.equal(tab.documentOverflow, true, `${width}px: the document has no horizontal overflow after selecting ${tab.name}; actual=${actual}`); assert.equal(tab.panelOverflow, true, `${width}px: selected panel has no horizontal overflow; actual=${actual}`); }
  }
  if (process.platform !== "linux" || process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_290_FAULT_CHILD) return;
  await release();
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-290-fault-")), copied = join(temporary, "agent-m");
  try {
    cpSync(join(root, "src"), join(copied, "src"), { recursive: true });
    cpSync(join(root, "docs"), join(copied, "docs"), { recursive: true });
    mkdirSync(join(copied, "tests"), { recursive: true });
    cpSync(join(root, "tests", "app-harness.mjs"), join(copied, "tests", "app-harness.mjs"));
    const production = join(copied, "src", "settings-pages", "settings.mjs"), original = readFileSync(production), source = original.toString();
    const fault = "pane.hidden = !chosen;", mutation = Buffer.from(source.replace(fault, "pane.hidden = false;"));
    assert.notDeepEqual(mutation, original, "the guarded tab visibility source is present in the copied production tree");
    const tests = [join(root, "tests", "dashboard-public-settings-tabs.test.mjs"), new URL(import.meta.url).pathname];
    const ids = ["TST-290114", "TST-290115"], childArgv = [process.execPath, "--test", "--test-name-pattern", ids.join("|"), ...tests];
    const childEnvironment = { AGENT_M_290_ROOT: copied, AGENT_M_290_FAULT_CHILD: "1" };
    const invoke = () => { const env = { ...process.env, ...childEnvironment }; delete env.NODE_TEST_CONTEXT;
      return spawnSync(childArgv[0], childArgv.slice(1), { cwd: root, encoding: "utf8", timeout: 60000, env }); };
    const originalHash = createHash("sha256").update(original).digest("hex"), testHashes = Object.fromEntries(tests.map((path) => [path, createHash("sha256").update(readFileSync(path)).digest("hex")]));
    const faultStarted = new Date().toISOString(); writeFileSync(production, mutation);
    const faultSourceHash = createHash("sha256").update(readFileSync(production)).digest("hex"), failed = invoke();
    const faultEnded = new Date().toISOString();
    const faultNodes = Object.fromEntries(ids.map((id) => [id, failed.stdout.match(new RegExp(`not ok \\d+ - ${id}:[\\s\\S]*?(?=\\n# Subtest:|\\n1\\.\\.)`))?.[0] ?? null]));
    const restoredStarted = new Date().toISOString(); writeFileSync(production, original);
    const restoredSourceHash = createHash("sha256").update(readFileSync(production)).digest("hex"), passed = invoke();
    const restoredEnded = new Date().toISOString();
    const receipt = { cases: ids, cwd: root, childArgv, childEnvironment: { ...childEnvironment, NODE_TEST_CONTEXT: null }, source: production, tests, originalHash, faultSourceHash, restoredSourceHash, testHashes, fault, faultStarted, faultEnded, faultStatus: failed.status, faultSignal: failed.signal, faultError: failed.error?.code ?? null, faultNodes, faultStdout: failed.stdout, faultStderr: failed.stderr, restoredStarted, restoredEnded, restoredStatus: passed.status, restoredSignal: passed.signal, restoredError: passed.error?.code ?? null, restoredStdout: passed.stdout, restoredStderr: passed.stderr };
    process.stdout.write(`TST-290115-counterproof ${JSON.stringify(receipt)}\n`);
    assert.equal(restoredSourceHash, originalHash, "byte-exact source restoration precedes the same-case positive");
    assert.equal(failed.status, 1, "faulted child ends with normal Node test failure status"); assert.equal(failed.signal, null); assert.equal(failed.error, undefined);
    for (const id of ids) assert.match(failed.stdout, new RegExp(`not ok \\d+ - ${id}:`), `${id} has a named same-case failure node`);
    assert.equal(passed.status, 0, "byte-restored same cases pass"); assert.equal(passed.signal, null); assert.equal(passed.error, undefined);
    for (const id of ids) assert.match(passed.stdout, new RegExp(`ok \\d+ - ${id}:`), `${id} passes after exact restoration`);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
