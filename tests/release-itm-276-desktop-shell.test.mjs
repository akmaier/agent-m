// Independent release coverage for ITM-276's source Bridge pairing app.
// Run: node --test tests/release-itm-276-desktop-shell.test.mjs
//
// Module: MOD-desktop-shell
// Level: release
// Guards: UC-044; UC-003; THE BRIDGE RUNS AS AN APP; THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW;
//         THE BRIDGE IS PAIRED ONCE; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const executable = process.platform === "darwin"
  ? "/private/tmp/agent-m-electron-44/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron"
  : "/private/tmp/agent-m-electron-44/node_modules/electron/dist/electron";
const wait = async (check, name) => {
  for (let tries = 0; tries < 160; tries += 1) {
    try { const value = await check(); if (value) return value; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw new Error(`${name} timed out.`);
};
const port = async () => await new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const value = server.address().port;
    server.close((failure) => failure ? reject(failure) : resolve(value));
  });
});
const token = (folder) => readFileSync(join(folder, "pairing-token"), "utf8").trim();

const cdp = async (url, method, params = {}) => {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  try {
    const reply = await new Promise((resolve, reject) => {
      socket.addEventListener("message", ({ data }) => { const result = JSON.parse(data); if (result.id === 1) resolve(result); });
      socket.addEventListener("error", reject, { once: true });
      socket.send(JSON.stringify({ id: 1, method, params }));
    });
    if (reply.error) throw new Error(reply.error.message);
    return reply.result;
  } finally { socket.close(); }
};
const evaluate = async (url, expression) => (await cdp(url, "Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

async function launch() {
  assert.equal(existsSync(executable), true, "Electron 44.5.1 must be acquired outside the checkout by the established native fixture.");
  const dataFolder = mkdtempSync(join(tmpdir(), "agent-m-release-276-"));
  const apiPort = await port(), debugPort = await port(), inspectPort = await port();
  const instance = "release-fork/paired-bridge", origin = "https://release-fork.github.io";
  const args = [...(process.platform === "linux" ? ["--no-sandbox"] : []), `--inspect=${inspectPort}`, `--remote-debugging-port=${debugPort}`, "src/desktop-shell/main.mjs", `--instance=${instance}`, `--origin=${origin}`, `--port=${apiPort}`, `--data-folder=${dataFolder}`];
  const child = spawn(executable, args, { cwd: root, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-2000); });
  const exited = new Promise((resolve) => child.once("exit", resolve));
  const page = await wait(async () => (await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find((item) => item.url.startsWith("agent-m://")), "actual pairing window").catch(async (failure) => { if (child.exitCode === null) child.kill(); await exited; throw new Error(`${failure.message}; Electron=${stderr}`); });
  const main = await wait(async () => (await (await fetch(`http://127.0.0.1:${inspectPort}/json/list`)).json())[0]?.webSocketDebuggerUrl, "actual Electron main inspector");
  return { apiPort, child, dataFolder, exited, instance, main, origin, page };
}
async function stop(app) {
  try {
    await click(app.page, "Quit");
    await wait(async () => { try { await fetch(`http://127.0.0.1:${app.apiPort}/v1/pair`); return false; } catch { return true; } }, "server shutdown");
    await Promise.race([app.exited, new Promise((_, reject) => setTimeout(() => reject(new Error("Electron did not exit after Quit.")), 10000))]);
  } finally { if (app.child.exitCode === null) app.child.kill(); }
}
const click = (page, label) => evaluate(page.webSocketDebuggerUrl, `[...document.querySelectorAll('button')].find((button) => button.textContent === ${JSON.stringify(label)}).click()`);

// TST-276901
// Precondition: Electron 44.5.1 is acquired in the established temporary fixture and the production source entry is
// started for a fork identity with an empty private data folder.
// Input: inspect the actual renderer's exposed surface and pair once through the real displayed loopback address.
// Expected: the fork-local window has only the fixed preload controls and no Node globals; the address is loopback;
// the configured origin and private token pair, while another origin is refused.
// Planted fault: changing the `127.0.0.1` host in src/desktop-shell/compose.mjs to `0.0.0.0` makes the displayed
// loopback-address assertion fail; restoring that byte-exact source makes this positive pass.
test("TST-276901: actual forked Electron source keeps its renderer private and pairs only on configured loopback", { timeout: 60000, concurrency: false }, async () => {
  const app = await launch();
  try {
    const pairingToken = await wait(() => existsSync(join(app.dataFolder, "pairing-token")) && token(app.dataFolder), "private pairing token");
    const expectedAddress = `http://127.0.0.1:${app.apiPort}`;
    await wait(async () => (await evaluate(app.page.webSocketDebuggerUrl, "document.body.innerText.includes('Agent M Bridge pairing')")), "pairing page");
    assert.equal(app.page.url, "agent-m://release-fork.github.io/paired-bridge/desktop-shell/window.html");
    assert.deepEqual(await evaluate(app.page.webSocketDebuggerUrl, "({ calls: Object.keys(window.bridge).sort(), node: [typeof window.process, typeof window.require], address: [...document.querySelectorAll('code')][0].textContent })"), {
      calls: ["copy", "pairAnew", "pause", "quit", "resume", "retryPort", "state"], node: ["undefined", "undefined"], address: expectedAddress,
    }, "failure node: the only renderer privilege is the fixed preload API");
    const pair = (origin) => fetch(`${expectedAddress}/v1/pair`, { headers: { origin, "x-agent-m-bridge-token": pairingToken } });
    assert.equal((await pair(app.origin)).status, 200, "known positive: the configured page origin pairs with the real loopback server");
    assert.equal((await pair("https://unrelated.example")).status, 403, "failure node: a non-configured origin is refused");
  } finally { await stop(app); }
});
