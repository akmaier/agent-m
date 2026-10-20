// The app's entry answers the jobs still running (ITM-1055), as MOD-desktop-shell's accepted text states it (docs/architecture/MOD-desktop-shell.md:179-181: "*Quit* names the jobs still running, which then end as cancelled").
// This file starts the app's real entry, src/desktop-shell/main.mjs, over a constructed Electron (tests/desktop-shell.d/entry.mjs) and sends it, over the ipc request the window makes, the action `running-jobs`; the window's side
// of it — the decision *Quit* shows — is tests/mod-desktop-shell-quit.test.mjs.
// Run: node --test tests/mod-desktop-shell-quit-entry.test.mjs
//
// Module: MOD-desktop-shell
// Guards: THE BRIDGE RUNS AS AN APP; UC-044
// Level: unit
//
// The jobs the Bridge took are MOD-bridge-jobs' `listJobs` (ITM-1097, tests/bridge-jobs-list.test.mjs); here that one function is replaced by a double whose list the test sets, and the rest of the module is the real one, so that this file
// reads what the entry does with the list: it answers the jobs whose state is `running`, as the window's *Quit* names them, and no other; on a Bridge that could not start it answers the failure, as the other actions do. Each test states
// its input and its expected result before it runs (given / input / expect). Nothing reaches the network. The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import { createRequire } from "node:module";
import { rmSync } from "node:fs";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";
import { bridgeSettings, startEntry, stopEntry, temporary } from "./desktop-shell.d/entry.mjs";
import { saveSettings } from "../src/desktop-shell/settings.mjs";

const REAL = new URL("../src/bridge-jobs/index.mjs", import.meta.url).href;
const DOUBLE = `data:text/javascript,${encodeURIComponent(`export * from ${JSON.stringify(`${REAL}?real`)}; export const listJobs = () => globalThis.__agentMJobsDouble ?? [];`)}`;
registerHooks({
  resolve(specifier, context, next) {
    const resolved = next(specifier, context);
    return resolved.url === REAL ? { url: DOUBLE, shortCircuit: true } : resolved;
  },
});

const job = (id, state) => ({ id, product: "https://github.com/acme/product-a", kind: "implement", agent: "opencode", state, started: "2026-10-19T09:00:00.000Z", usage: null });

async function started(platform = null) {
  const appData = temporary(), data = temporary(), resources = temporary();
  const [port] = await unusedPorts(1);
  saveSettings(data, bridgeSettings(port));
  const entry = await startEntry({ resources, appData, platform, argv: ["--instance=carol/product-x", "--origin=https://carol.github.io", `--port=${port}`, `--data-folder=${data}`] });
  assert.equal(entry.outcome.kind, "loaded", `the entry started (errors: ${entry.errors.join(" | ")})`);
  const done = async () => { delete globalThis.__agentMJobsDouble; await stopEntry(entry); for (const folder of [appData, data, resources]) rmSync(folder, { recursive: true, force: true }); };
  return { ask: (action) => entry.fake.handlers["bridge-state"]({}, action), fake: entry.fake, done };
}

// TST-1055103 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE RUNS AS AN APP; UC-044 (7b)
// given: the app started over a Bridge whose job list holds two running jobs, one done and one cancelled
// input: the window's request running-jobs; then the same with no job at all
// expect: the answer is { jobs } with exactly the two running jobs, in the order of the list, each as the list gives it; with no job, { jobs: [] }
test("running-jobs answers the jobs whose state is running", async () => {
  const app = await started();
  try {
    globalThis.__agentMJobsDouble = [job("JOB-A", "done"), job("JOB-B", "running"), job("JOB-C", "cancelled"), job("JOB-D", "running")];
    assert.deepEqual(await app.ask("running-jobs"), { jobs: [job("JOB-B", "running"), job("JOB-D", "running")] });
    globalThis.__agentMJobsDouble = [];
    assert.deepEqual(await app.ask("running-jobs"), { jobs: [] });
  } finally { await app.done(); }
});

// The tray's Quit item of the constructed Electron (macOS, where the entry makes a tray).
const trayQuit = (app) => app.fake.trays[0].menu.template.find((item) => item.label === "Quit");

// TST-1055105 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE RUNS AS AN APP; UC-044 (7b)
// given: the app started on macOS (it makes a tray) over a Bridge whose job list holds two running jobs
// input: the tray's item Quit pressed
// expect: the app did not quit (Electron's quit was not asked for); the window was shown and was sent the message quit-requested, once — the window then shows the decision that names the jobs (TST-1055106)
test("the tray's Quit with jobs running does not quit but asks the window for the decision", async () => {
  const app = await started("darwin");
  try {
    globalThis.__agentMJobsDouble = [job("JOB-B", "running"), job("JOB-D", "running")];
    assert.ok(trayQuit(app), "known positive: the tray has a Quit item");
    await trayQuit(app).click();
    assert.equal(app.fake.quits, 0, "nothing is quit before the person's confirmation");
    assert.ok(app.fake.shown > 0, "the window is shown");
    assert.deepEqual(app.fake.sent, [["quit-requested"]]);
  } finally { await app.done(); }
});

// TST-1055107 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE RUNS AS AN APP; UC-044 (7b)
// given: the app started on macOS over a Bridge whose job list holds one job that has ended and none running
// input: the tray's item Quit pressed
// expect: the app quits at once (Electron's quit asked for once) and the window was sent nothing
test("the tray's Quit with no job running quits at once", async () => {
  const app = await started("darwin");
  try {
    globalThis.__agentMJobsDouble = [job("JOB-A", "done")];
    await trayQuit(app).click();
    assert.equal(app.fake.quits, 1);
    assert.deepEqual(app.fake.sent, []);
  } finally { await app.done(); }
});

// TST-1055108 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE RUNS AS AN APP; UC-044 (7b)
// given: src/desktop-shell/preload.cjs run with a constructed `electron` module that records what it exposes and what it listens to
// input: the exposed bridge's onQuitRequested(callback); then the main process sends quit-requested
// expect: the preload listens on the channel quit-requested, and the message calls the callback once; the other calls of the bridge are those the window had (state, chooseFolder, copy, pairAnew, pause, resume, retryPort, quit)
test("the preload hands the window the main process's request to quit", async () => {
  const exposed = {}, listeners = {};
  const stub = { contextBridge: { exposeInMainWorld: (name, api) => { exposed[name] = api; } }, ipcRenderer: { invoke: async () => null, on: (channel, listener) => { listeners[channel] = listener; } } };
  const require = createRequire(import.meta.url);
  const preload = require.resolve("../src/desktop-shell/preload.cjs");
  const Module = require("node:module");
  const load = Module._load;
  Module._load = function (request, ...rest) { return request === "electron" ? stub : load.call(this, request, ...rest); };
  try { delete require.cache[preload]; require(preload); } finally { Module._load = load; }
  for (const name of ["state", "chooseFolder", "copy", "pairAnew", "pause", "resume", "retryPort", "quit"]) assert.equal(typeof exposed.bridge[name], "function", name);
  let called = 0;
  exposed.bridge.onQuitRequested(() => { called += 1; });
  assert.equal(typeof listeners["quit-requested"], "function", "the preload listens on quit-requested");
  listeners["quit-requested"]({});
  assert.equal(called, 1);
});
