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

async function started() {
  const appData = temporary(), data = temporary(), resources = temporary();
  const [port] = await unusedPorts(1);
  saveSettings(data, bridgeSettings(port));
  const entry = await startEntry({ resources, appData, argv: ["--instance=carol/product-x", "--origin=https://carol.github.io", `--port=${port}`, `--data-folder=${data}`] });
  assert.equal(entry.outcome.kind, "loaded", `the entry started (errors: ${entry.errors.join(" | ")})`);
  const done = async () => { delete globalThis.__agentMJobsDouble; await stopEntry(entry); for (const folder of [appData, data, resources]) rmSync(folder, { recursive: true, force: true }); };
  return { ask: (action) => entry.fake.handlers["bridge-state"]({}, action), done };
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
