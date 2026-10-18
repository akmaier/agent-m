// The window that tests/site-usability.test.mjs and tests/site-accessibility.test.mjs open stays open when the first load it was started with is
// superseded by the checks' own first navigation (ITM-935). The main process of that window is the ENTRY of tests/site-usability.d/browser.mjs.
// Run: node --test tests/site-usability-boot-entry.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; THE SITE SERVES A SCREEN READER; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// Level: unit
//
// The data-flow path to the failure. TST-905001 to TST-905010 failed with "/ is loaded did not hold within 30 s; last error: deadline" in job
// 117679158190 (run 39128690464, attempt 1, pull request #895) and in job 117705630250 (run 39137748483, attempt 1, pull request #905; its stack
// is routes.mjs:67, the code that sends Page.navigate again). In both, the hook had run for 6 s (#905) or 21 s (#895) before the 30 s wait, so
// the window's session had answered Page.enable, the first evaluation, both `configure` commands and the evaluation that asks where the page is.
//   site-accessibility.test.mjs:76 `show` -> routes.mjs:67 `until("/ is loaded")` -> routes.mjs:68 Page.navigate to "/" -> the wait for the
//   load -> browser.mjs:36 "did not hold within 30 s; last error: deadline".
// "deadline" is the error `until` itself throws into its race (browser.mjs:31) when the deadline arrives while a call is still in flight; it
// overwrites the error of every earlier attempt, so the log names none. What it shows is that a call was waiting for an answer at the 30 s
// mark: the session did not answer, call after call, for the whole wait.
// The measured cause (the saved logs cannot show it; a probe on Electron 44.5.1, macOS, with a /__blank that ends its body 3 s late): the window
// is opened by `await window.loadURL(blank)` in the ENTRY. A Page.navigate that arrives while that first load is not finished supersedes it;
// loadURL then rejects with { code: "ERR_ABORTED", errno: -3, message: "ERR_ABORTED (-3) loading '<url>'" }; the ENTRY's catch calls
// electron.app.quit(); the DevTools socket closes and Electron exits with code 0; every later call is never answered. A refused connection
// rejects with { code: "ERR_CONNECTION_REFUSED", errno: -102 }. With a /__blank that ends at once, five runs in a row loaded it before the
// navigation arrived: the race is lost only when the first load is slow, as it is in a cold CI job.
//
// This runs the text of ENTRY under Node, with a stand-in module named "electron" beside it whose window rejects its load the way Electron
// does in each case (after 50 ms), and watches whether the app quits. Expected results are stated in each case.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { ENTRY, until } from "./site-usability.d/browser.mjs";

// The stand-in for the "electron" module. STAND_IN_LOAD says how the window's load ends: "resolve", or the code of the error it is rejected with.
// "SETTLED" is written when the load has ended, "QUIT" when the app is told to quit (which ends the process, as Electron does), and "ALIVE" 300 ms
// after the load has ended if the app has not quit.
const STAND_IN = `
const how = process.env.STAND_IN_LOAD;
const ERRNO = { ERR_ABORTED: -3, ERR_CONNECTION_REFUSED: -102 };
const app = {
  whenReady: async () => {},
  dock: { hide() {} },
  on() {},
  quit() { console.log("QUIT"); process.exit(0); },
};
class BrowserWindow {
  loadURL(url) {
    const ended = how === "resolve" ? Promise.resolve()
      : new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error(how + " (" + ERRNO[how] + ") loading '" + url + "'"), { code: how, errno: ERRNO[how], url })), 50));
    ended.then(() => {}, () => {}).then(() => { console.log("SETTLED"); setTimeout(() => console.log("ALIVE"), 300); });
    return ended;
  }
}
setInterval(() => {}, 1000);
export default { app, BrowserWindow, nativeTheme: { themeSource: "" } };
`;

// run(how) -> { settled, quit, alive, stderr } — the ENTRY run under Node with the stand-in; it waits until the app has quit or has stayed alive
// for 300 ms after its load ended, and ends the process if it is still running.
async function run(how) {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-935-entry-"));
  try {
    mkdirSync(join(folder, "node_modules", "electron"), { recursive: true });
    writeFileSync(join(folder, "node_modules", "electron", "package.json"), JSON.stringify({ name: "electron", version: "0.0.0", type: "module", main: "index.js" }));
    writeFileSync(join(folder, "node_modules", "electron", "index.js"), STAND_IN);
    writeFileSync(join(folder, "main.mjs"), ENTRY);
    const child = spawn(process.execPath, [join(folder, "main.mjs"), "--fixture-url=http://127.0.0.1:1/__blank"], { env: { ...process.env, STAND_IN_LOAD: how }, stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "", closed = false;
    child.stdout.on("data", (chunk) => { out += chunk; });
    child.stderr.on("data", (chunk) => { err += chunk; });
    child.on("close", () => { closed = true; });
    try { await until(`the entry (${how}) has quit or stayed alive`, () => closed || out.includes("ALIVE"), 10000); }
    finally { if (!closed) child.kill(); }
    return { settled: out.includes("SETTLED"), quit: out.includes("QUIT"), alive: out.includes("ALIVE"), stderr: err };
  } finally { rmSync(folder, { recursive: true, force: true }); }
}

// TST-935001 · level: unit · module: MOD-site-frame
// given: a window whose first load is superseded by another navigation, so that its load is rejected with code ERR_ABORTED (-3)
// input: the ENTRY run with that window
// expect: the load has ended, the app has not been told to quit and is still running 300 ms later: a later call to the page is still answered
test("TST-935001: a first load that is superseded by another navigation does not quit the app", { timeout: 20000 }, async () => {
  const result = await run("ERR_ABORTED");
  assert.equal(result.settled, true);
  assert.equal(result.quit, false);
  assert.equal(result.alive, true);
});

// TST-935002 · level: unit · module: MOD-site-frame
// given: a window whose first load ends well
// input: the ENTRY run with that window
// expect: the load has ended, the app has not quit and is still running 300 ms later (the known positive of TST-935001)
test("TST-935002: a first load that ends well leaves the app running", { timeout: 20000 }, async () => {
  const result = await run("resolve");
  assert.equal(result.settled, true);
  assert.equal(result.quit, false);
  assert.equal(result.alive, true);
});

// TST-935003 · level: unit · module: MOD-site-frame
// given: a window whose first load fails for another reason: a refused connection, code ERR_CONNECTION_REFUSED (-102)
// input: the ENTRY run with that window
// expect: the load has ended, the error's message is written to stderr and the app has quit: only a superseded load is let pass (the counter-proof of TST-935001)
test("TST-935003: a first load that fails for another reason still quits the app and names the error", { timeout: 20000 }, async () => {
  const result = await run("ERR_CONNECTION_REFUSED");
  assert.equal(result.settled, true);
  assert.equal(result.quit, true);
  assert.equal(result.alive, false);
  assert.equal(result.stderr.includes("ERR_CONNECTION_REFUSED (-102) loading 'http://127.0.0.1:1/__blank'"), true);
});
