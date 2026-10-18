// The window that the browser checks open is returned by `openWindow` only once the page shows the address it was asked to open (ITM-935).
// Run: node --test tests/site-usability-boot-window.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; THE SITE SERVES A SCREEN READER; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// Level: system
//
// The cause (measured, with a probe on Electron 44.5.1 on macOS): `openWindow` returns as soon as the debugging targets list a page whose url starts
// with http://127.0.0.1 and the page answers an evaluation (browser.mjs, `openWindow` and `readyPage`). While the server holds back its answer, that
// url is the pending one and the document is still the initial about:blank. The first navigation of a check, or an import with an absolute path,
// then meets a window that has not committed its address; a Page.navigate that arrives then supersedes the first load (see
// tests/site-usability-boot-entry.test.mjs).
//
// This opens a real window of the controlled Electron on a server whose first answer for the blank page it holds back (2500 ms), or answers at once.
// Expected results are stated in each case.

import { before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { stageElectron, openWindow } from "./site-usability.d/browser.mjs";

const HOLD = 2500;
let executable = null;
before(async () => { executable = await stageElectron(); }, { timeout: 100000 });

// A server of one page, `/__blank`, whose answer comes `hold` ms after it was asked for. `answered()` is the number of answers given so far.
async function serve(hold) {
  let answered = 0;
  const server = createServer((request, response) => {
    setTimeout(() => { response.writeHead(200, { "content-type": "text/html" }); response.end("<!doctype html><title>blank</title><body>blank</body>"); answered += 1; }, hold);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { address: `http://127.0.0.1:${server.address().port}`, answered: () => answered, close: () => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }) };
}

// TST-935004 · level: system · module: MOD-site-frame
// given: a server that answers the blank page 2500 ms after it is asked
// input: openWindow(executable, `${address}/__blank`)
// expect: when openWindow returns, the server has answered and the window's location.href is `${address}/__blank` (the window does not return at about:blank)
test("TST-935004: openWindow returns only once the page shows its address, although the server holds its first answer back", { timeout: 60000 }, async () => {
  const site = await serve(HOLD);
  let window = null;
  try {
    window = await openWindow(executable, `${site.address}/__blank`);
    const href = await window.page.evaluate("location.href");
    assert.equal(site.answered() >= 1, true);
    assert.equal(href === `${site.address}/__blank`, true, `location.href is ${href}`);
  } finally { window?.close(); await site.close(); }
});

// TST-935005 · level: system · module: MOD-site-frame
// given: a server that answers the blank page at once
// input: openWindow(executable, `${address}/__blank`)
// expect: when openWindow returns, the window's location.href is `${address}/__blank` (the known positive of TST-935004)
test("TST-935005: openWindow returns the page at its address when the server answers at once", { timeout: 60000 }, async () => {
  const site = await serve(0);
  let window = null;
  try {
    window = await openWindow(executable, `${site.address}/__blank`);
    const href = await window.page.evaluate("location.href");
    assert.equal(href === `${site.address}/__blank`, true, `location.href is ${href}`);
  } finally { window?.close(); await site.close(); }
});
