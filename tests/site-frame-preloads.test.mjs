// MOD-site-frame's preloads.mjs: each entry page carries in its <head> the preloads of the files it loads as it starts — every module of its
// start, and every file those modules fetch as they are evaluated —, written by `node src/site-frame/preloads.mjs`, so that a browser asks
// for them at once instead of level by level. A page whose block differs from what preloads.mjs computes fails here, so a change that adds,
// moves or removes an import and leaves the block as it was fails its pull request.
//
// Run: node --test tests/site-frame-preloads.test.mjs
//
// Module: MOD-site-frame
// Guards: THE PAGES ROOT IS THE REPOSITORY ROOT
// Level: unit
//
// The expected values are written here from MOD-site-frame's Parts (`preloads.mjs`) and from menuOf's "so that the main page loads none of
// their views"; none is read from a document.

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { ENTRY_PAGES, BEGIN, END, stalePages, withBlock, pageLoads } from "../src/site-frame/preloads.mjs";

const text = (page) => readFileSync(new URL(`../${page}`, import.meta.url), "utf8");

// TST-1290001 · level: unit · module: MOD-site-frame
// guards: THE PAGES ROOT IS THE REPOSITORY ROOT
// given: the entry pages index.html and docs/index.html as they stand in the repository
// input: stalePages()
// expect: no page — each page's block is the one preloads.mjs computes from the modules as they stand
test("TST-1290001 every entry page carries the preloads preloads.mjs computes", () => {
  assert.deepEqual(ENTRY_PAGES, ["index.html", "docs/index.html"]);
  assert.deepEqual(stalePages(), [], "run: node src/site-frame/preloads.mjs");
});

// TST-1290002 · level: unit · module: MOD-site-frame
// guards: THE PAGES ROOT IS THE REPOSITORY ROOT
// given: index.html with one of its modulepreload lines removed, and index.html without its block
// input: withBlock("index.html", page)
// expect: the page as it stands in the repository, in both cases — a missing line is put back, a missing block is put before </head>
test("TST-1290002 a block missing a line, or missing altogether, is written as preloads.mjs computes it", () => {
  const page = text("index.html");
  const line = page.split("\n").find((l) => l.includes('rel="modulepreload"') && l.includes("src/site-frame/index.mjs"));
  assert.ok(line, "index.html preloads src/site-frame/index.mjs");
  const lacking = page.replace(`${line}\n`, "");
  assert.notEqual(lacking, page);
  assert.equal(withBlock("index.html", lacking), page);
  const start = page.indexOf(BEGIN), end = page.indexOf(END) + END.length;
  const without = page.slice(0, page.lastIndexOf("\n", start) + 1) + page.slice(end + 1);
  assert.ok(!without.includes("modulepreload"));
  assert.equal(withBlock("index.html", without), page);
});

// TST-1290003 · level: unit · module: MOD-site-frame
// guards: THE PAGES ROOT IS THE REPOSITORY ROOT
// given: the two entry pages, index.html naming the view main-page and docs/index.html the review pages' views
// input: pageLoads(page)
// expect: index.html loads src/main-page/index.mjs, the frame's start.mjs and the explanations the frame fetches, and none of the review pages' views; docs/index.html loads the review pages' views and the JSON of dashboard-app.mjs as a module
test("TST-1290003 each page preloads its own views and the files they fetch, and the main page none of the review pages' views", () => {
  const main = pageLoads("index.html");
  assert.ok(main.modules.includes("src/site-frame/start.mjs"));
  assert.ok(main.modules.includes("src/main-page/index.mjs"));
  assert.ok(main.files.includes("src/site-frame/explanations.md"));
  for (const view of ["review-pages", "trace-pages", "implementation-pages", "test-pages", "maintenance-pages", "settings-pages"]) {
    assert.ok(!main.modules.includes(`src/${view}/index.mjs`), `the main page preloads ${view}`);
  }
  const review = pageLoads("docs/index.html");
  for (const view of ["review-pages", "trace-pages", "implementation-pages", "test-pages", "maintenance-pages", "settings-pages"]) {
    assert.ok(review.modules.includes(`../src/${view}/index.mjs`), `the review pages do not preload ${view}`);
  }
  assert.ok(review.modules.includes("assets/dashboard/built.json"));
  assert.match(text("docs/index.html"), /<link rel="modulepreload" as="json" href="assets\/dashboard\/built.json">/);
});
