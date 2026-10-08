// Module: MOD-desktop-shell
// Guards: UC-044; UC-003; THE BRIDGE RUNS AS AN APP; THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW; THE BRIDGE IS PAIRED ONCE; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
// Level: component
import test from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";

const root = new URL("..", import.meta.url).pathname;
const electronCache = join(tmpdir(), "agent-m-276-electron-44");
const wait = async (f) => { for (let n = 0; n < 240; n += 1) { try { const value = await f(); if (value) return value; } catch {} await new Promise((resolve) => setTimeout(resolve, 125)); } throw new Error("Timed out waiting for real Electron."); };
const tokenOf = (folder) => readFileSync(join(folder, "pairing-token"), "utf8").trim();
const scrub = (value) => String(value).replace(/[A-Za-z0-9_-]{32,}/g, "[redacted]");
const within = async (promise, name) => {
  let timeout;
  try { return await Promise.race([promise, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error(`${name} timed out.`)), 5000); })]); }
  finally { clearTimeout(timeout); }
};

async function runtime() {
  const bundled = "/private/tmp/agent-m-electron-44/node_modules/electron";
  const executableOf = (installed) => process.platform === "darwin" ? join(installed, "dist/Electron.app/Contents/MacOS/Electron") : join(installed, "dist/electron");
  if (existsSync(executableOf(bundled))) return executableOf(bundled);
  const installed = join(electronCache, "node_modules/electron");
  if (!existsSync(executableOf(installed))) {
    const result = spawnSync("npm", ["install", "--no-save", "--prefix", electronCache, "electron@44.5.1"], { encoding: "utf8", timeout: 90000 });
    assert.equal(result.status, 0, scrub(result.stderr));
  }
  assert.equal(existsSync(executableOf(installed)), true, "Electron 44.5.1 executable was not acquired.");
  return executableOf(installed);
}

const cdp = async (url, method, params = {}) => {
  const socket = new WebSocket(url);
  await within(new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); socket.addEventListener("close", () => reject(new Error(`CDP ${method} closed before opening.`)), { once: true }); }), `CDP ${method} connection`);
  let answer;
  try { answer = await within(new Promise((resolve, reject) => { socket.addEventListener("message", ({ data }) => { const value = JSON.parse(data); if (value.id === 1) resolve(value); }); socket.addEventListener("error", reject, { once: true }); socket.addEventListener("close", () => reject(new Error(`CDP ${method} closed before responding.`)), { once: true }); socket.send(JSON.stringify({ id: 1, method, params })); }), `CDP ${method} response`); }
  finally { socket.close(); }
  if (answer.error) throw new Error(`CDP ${method} failed: ${answer.error.message}`);
  return answer.result;
};
const evaluate = async (url, expression) => {
  const result = await cdp(url, "Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(`CDP evaluation failed: ${result.exceptionDetails.text}`);
  return result.result.value;
};
const unusedPort = async () => await new Promise((resolve, reject) => { const server = createServer(); server.once("error", reject); server.listen(0, "127.0.0.1", () => { const { port } = server.address(); server.close((failure) => failure ? reject(failure) : resolve(port)); }); });

async function launch({ folder = mkdtempSync(join(tmpdir(), "agent-m-276-test-")), port, debug, inspect, dataFolder = true, environment = {}, instance = "release-owner/release-frame", origin = "https://release-owner.github.io" } = {}) {
  port ??= await unusedPort();
  debug ??= await unusedPort();
  inspect ??= await unusedPort();
  const executable = await runtime();
  const args = [`--inspect=${inspect}`, `--remote-debugging-port=${debug}`, "src/desktop-shell/main.mjs", `--instance=${instance}`, `--origin=${origin}`, `--port=${port}`];
  if (dataFolder) args.push(`--data-folder=${folder}`);
  const child = spawn(executable, args, { cwd: root, detached: false, env: { ...process.env, ...environment }, stdio: "ignore" });
  const exited = new Promise((resolve) => child.once("exit", resolve));
  const page = await wait(async () => (await (await fetch(`http://127.0.0.1:${debug}/json/list`)).json()).find((candidate) => candidate.url.startsWith("agent-m://")));
  const browser = await wait(async () => (await (await fetch(`http://127.0.0.1:${debug}/json/version`)).json()).webSocketDebuggerUrl);
  const main = await wait(async () => (await (await fetch(`http://127.0.0.1:${inspect}/json/list`)).json())[0]?.webSocketDebuggerUrl);
  return { browser, child, exited, folder, main, origin, page, port };
}

async function quit(app) {
  try { await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Quit')?.click()"); } catch {}
  await wait(async () => { try { await fetch(`http://127.0.0.1:${app.port}/v1/pair`); return false; } catch { return true; } });
  let timeout;
  try { await Promise.race([app.exited, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Electron did not exit after Quit.")), 30000); })]); }
  finally { clearTimeout(timeout); }
}
async function clean(app) { try { await quit(app); } finally { if (app.child.exitCode === null) app.child.kill(); } }

test("TST-276001: the actual Electron entry renders its forked pairing page and rotates its token", { timeout: 120000, concurrency: false }, async () => {
  const app = await launch();
  try {
    const token = await wait(() => existsSync(join(app.folder, "pairing-token")) && tokenOf(app.folder));
    assert.equal(app.page.url, "agent-m://release-owner.github.io/release-frame/desktop-shell/window.html");
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Pair anew')"));
    assert.deepEqual(await evaluate(app.page.webSocketDebuggerUrl, "({ frame: document.body.innerText.includes('What is this?'), node: [typeof window.require, typeof window.process], local: performance.getEntriesByType('resource').every(x => x.name.startsWith('agent-m://')) })"), { frame: true, node: ["undefined", "undefined"], local: true });
    const pair = (value, origin = app.origin) => fetch(`http://127.0.0.1:${app.port}/v1/pair`, { headers: { origin, "x-agent-m-bridge-token": value } });
    assert.equal((await pair(token)).status, 200);
    assert.equal((await pair(token, "https://other.example")).status, 403);
    await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Copy token').click()");
    await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Pair anew').click()");
    await evaluate(app.page.webSocketDebuggerUrl, "document.querySelector('.decision button:last-child').click()");
    const rotated = await wait(() => { const value = tokenOf(app.folder); return value !== token && value; });
    assert.equal((await pair(token)).status, 401);
    assert.equal((await pair(rotated)).status, 200);
  } catch (failure) { throw new Error(`${failure.message}; page=${app.page.url}`); }
  finally { await clean(app); }
});

test("TST-276002: pause refuses new work, resume restores the real server refusal, and Quit stops it", { timeout: 120000, concurrency: false }, async () => {
  const app = await launch();
  try {
    const token = await wait(() => existsSync(join(app.folder, "pairing-token")) && tokenOf(app.folder));
    const work = () => fetch(`http://127.0.0.1:${app.port}/v1/probes/agent`, { method: "POST", headers: { origin: app.origin, "x-agent-m-bridge-token": token, "content-type": "application/json" }, body: JSON.stringify({ args: {} }) });
    await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Pause').click()");
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Resume')"));
    assert.equal((await work()).status, 503);
    await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Resume').click()");
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Pause')"));
    assert.equal((await work()).status, 404);
    await quit(app);
    await assert.rejects(fetch(`http://127.0.0.1:${app.port}/v1/pair`));
  } finally { await clean(app); }
});

test("TST-276003: an occupied port is visible and its replacement starts the same real composition", { timeout: 120000, concurrency: false }, async () => {
  const occupied = createServer(), port = await unusedPort();
  await new Promise((resolve, reject) => { occupied.once("error", reject); occupied.listen(port, "127.0.0.1", resolve); });
  const app = await launch({ port });
  try {
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "document.body.innerText.includes('Agent M Bridge could not start')"));
    assert.equal(await evaluate(app.page.webSocketDebuggerUrl, "document.querySelector('input[type=number]')?.value"), "4712");
    const replacement = await unusedPort();
    await evaluate(app.page.webSocketDebuggerUrl, `document.querySelector('input[type=number]').value=${replacement}; [...document.querySelectorAll('button')].find(x => x.textContent === 'Use this port').click()`);
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Copy token')"));
    const token = await wait(() => existsSync(join(app.folder, "pairing-token")) && tokenOf(app.folder));
    assert.equal((await fetch(`http://127.0.0.1:${replacement}/v1/pair`, { headers: { origin: app.origin, "x-agent-m-bridge-token": token } })).status, 200);
  } finally { await new Promise((resolve) => occupied.close(resolve)); await clean(app); }
});

test("TST-276004: an unwritable private folder is shown without starting a server", { timeout: 120000, concurrency: false }, async () => {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-276-readonly-"));
  chmodSync(folder, 0o500);
  const app = await launch({ folder, port: await unusedPort() });
  try {
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "document.body.innerText.includes('Agent M Bridge could not start')"));
    assert.equal(await evaluate(app.page.webSocketDebuggerUrl, "document.body.innerText.includes('NotWritable')"), true);
    assert.equal(existsSync(join(folder, "pairing-token")), false);
  } finally { chmodSync(folder, 0o700); await clean(app); }
});

test("TST-276006: the production default stores the instance token privately", { timeout: 120000, concurrency: false }, async () => {
  const owner = `agentm276${Date.now()}`, instance = `${owner}/bridge`;
  const appData = process.platform === "darwin" ? join(process.env.HOME, "Library", "Application Support") : join(process.env.XDG_CONFIG_HOME ?? join(process.env.HOME, ".config"));
  const folder = join(appData, `io.github.${owner}.bridge.bridge`);
  const app = await launch({ dataFolder: false, instance });
  try {
    await wait(() => existsSync(join(folder, "pairing-token")));
    assert.equal(statSync(folder).mode & 0o777, 0o700);
    assert.equal(statSync(join(folder, "pairing-token")).mode & 0o777, 0o600);
  } finally { await clean(app); rmSync(folder, { recursive: true, force: true }); }
});

test("TST-276005: a second source start restores the first minimized window", { timeout: 120000, concurrency: false }, async () => {
  const app = await launch();
  let second;
  try {
    await wait(() => existsSync(join(app.folder, "pairing-token")) && tokenOf(app.folder));
    const state = "process.getBuiltinModule('module').createRequire(process.cwd() + '/src/desktop-shell/main.mjs')('electron').BrowserWindow.getAllWindows()[0]";
    assert.equal(await evaluate(app.main, `${state}.isVisible()`), true);
    await evaluate(app.main, `${state}.minimize()`);
    await wait(async () => await evaluate(app.main, `${state}.isMinimized()`));
    second = spawn(await runtime(), ["src/desktop-shell/main.mjs", "--instance=release-owner/release-frame", "--origin=https://release-owner.github.io", `--data-folder=${app.folder}`, `--port=${app.port}`], { cwd: root, detached: process.platform === "darwin", stdio: "ignore" });
    second.unref();
    await wait(async () => await evaluate(app.main, `${state}.isVisible() && !${state}.isMinimized()`));
    assert.equal((await fetch(`http://127.0.0.1:${app.port}/v1/pair`, { headers: { origin: app.origin, "x-agent-m-bridge-token": tokenOf(app.folder) } })).status, 200);
  } finally {
    second?.kill();
    try {
      await evaluate(app.main, "process.getBuiltinModule('module').createRequire(process.cwd() + '/src/desktop-shell/main.mjs')('electron').app.quit()");
      await wait(async () => { try { await fetch(`http://127.0.0.1:${app.port}/v1/pair`); return false; } catch { return true; } });
      await within(app.exited, "Electron main-process quit");
    } finally { if (app.child.exitCode === null) app.child.kill(); }
  }
});
