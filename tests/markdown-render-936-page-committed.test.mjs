// The window that tests/markdown-render-918-diagram-drawn.test.mjs imports MOD-markdown-render in is returned only once the server has answered
// its page. On CI (#904) the import ran in the document that was open before the answer, and failed with "Failed to resolve module specifier
// '/src/markdown-render/index.mjs'"; the same test passed on the rerun.
// Run: node --test tests/markdown-render-936-page-committed.test.mjs
//
// Module: MOD-markdown-render
// Guards: UC-025; A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
// Level: component
//
// The expected results are written here, in the cases, and none is read from a document. Readings, each adding no word to the sentence it reads:
//   - "the server has answered" is the server having sent the page at the window's address; a held answer is one the test's server keeps back until
//     the test releases it. The page is the blank page of tests/markdown-render-936.d/blank-page.mjs, served from this repository's own files;
//     nothing else is served and nothing leaves the machine.
//   - The window is the controlled Electron of tests/site-usability.d/browser.mjs (a helper, not a test file). Its openWindow returns when the
//     window's page appears among the debugging targets and answers an evaluation: the known positive of the fault is the document it answers in,
//     which is `about:blank` while the server's answer is held.
//   - "Returned" is the promise settling; the case that it is not returned while the answer is held waits two seconds of the clock after the server
//     has been asked, which is more than the 0.4 to 1 s in which openWindow alone returned on the machine that measured it. A window returned
//     early fails the case; a window that is never returned is not seen to fail by a wait, only by the release that follows.

import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { stageElectron, openWindow, until } from "./site-usability.d/browser.mjs";
import { servePage, openCommittedWindow } from "./markdown-render-936.d/blank-page.mjs";

const root = new URL("..", import.meta.url).pathname;
const MODULE_IMPORT = `import("/src/markdown-render/index.mjs").then(() => true)`;

let site = null, executable = "";
const windows = [];
const found = {};

// What the page answers to the import, as a string: the first line of the page's error, or "resolved".
const importIn = async (page) => page.evaluate(MODULE_IMPORT).then(() => "resolved", (failure) => String(failure.message).split("\n")[0]);

before(async () => {
  site = await servePage(root);
  executable = await stageElectron();
  site.hold();

  // The fault: openWindow alone, while the server's answer is held.
  const raw = await openWindow(executable, `${site.address}/__blank`);
  windows.push(raw);
  found.raw = { href: await raw.page.evaluate("location.href"), importing: await importIn(raw.page) };

  // The wait: openCommittedWindow on a second window, while its answer is held too.
  const asked = site.asked();
  let returned = false;
  const opening = openCommittedWindow(executable, `${site.address}/__blank`).then((window) => { returned = true; return window; });
  await until("the server is asked for the second window's page", () => site.asked() === asked + 1);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  found.heldWhileUnanswered = !returned;
  site.release();
  const committed = await opening;
  windows.push(committed);
  found.committed = { href: await committed.page.evaluate("location.href"), importing: await importIn(committed.page) };
}, { timeout: 110000 });

after(async () => {
  windows.forEach((window) => window.close());
  await site?.close();
});

// given: a server that holds the answer to its blank page; input: openWindow of tests/site-usability.d/browser.mjs on that page, then an import of
// "/src/markdown-render/index.mjs" in the window it returns
// expect: the window is returned while its document is `about:blank`, and the import fails with "The page threw: TypeError: Failed to resolve module specifier '/src/markdown-render/index.mjs'"
test("TST-936001: the counter-proof: openWindow returns before the server has answered, and the import has nothing to resolve against", () => {
  assert.deepEqual(found.raw, {
    href: "about:blank",
    importing: "The page threw: TypeError: Failed to resolve module specifier '/src/markdown-render/index.mjs'",
  });
});

// given: the same server, holding the answer for a second window; input: openCommittedWindow on the blank page, and two seconds of the clock after the server was asked
// expect: it has not returned (the boolean true for "held")
test("TST-936002: openCommittedWindow is not returned while the server's answer is held", () => {
  assert.equal(found.heldWhileUnanswered, true);
});

// given: the same; input: the answer is released, openCommittedWindow returns, and the module is imported in its window
// expect: the window's document is the blank page at the server's address, and the import resolves
test("TST-936003: once the server has answered, the window shows the page and the import resolves", () => {
  assert.deepEqual(found.committed, { href: `${site.address}/__blank`, importing: "resolved" });
});
