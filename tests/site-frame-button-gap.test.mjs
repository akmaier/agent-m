// A button and the text beside it on one line are separated by a visible gap (ITM-1071), set in the site's style sheets: SPEC.md's EVERY PAGE
// SHARES ONE LOOK AND WORKS ON A PHONE has every page draw its buttons "with the same style sheets", which are MOD-site-frame's (look.css, with
// src/theme/lme.css and docs/assets/style.css taken over). akmaier's request: "Please add a whitespace between buttons and text if they are in the
// same line."
// Run: node --test tests/site-frame-button-gap.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// Level: system
//
// The gap is measured in the controlled Electron of tests/site-usability.d/browser.mjs (a helper, not a test file), which draws the markup the
// views write — a button, or a link that looks like one, written against its text with no space between them — under the style sheets the review
// pages link, src/theme/lme.css and docs/assets/style.css, served from this repository's own files; nothing else is served and nothing leaves the
// machine. The gap is the distance between the button's box and the box of the text before it, or after it, on the same line. "Visible" is read
// as at least 4 CSS pixels, a quarter of the body text's 16. The counter-proof is the same markup with the buttons' margins set to zero in the
// element's own style, which stands for the style sheets without the rule: every gap is then zero.

import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { join, normalize } from "node:path";
import { stageElectron, openWindow } from "./site-usability.d/browser.mjs";

const root = new URL("..", import.meta.url).pathname;
const TYPES = { ".css": "text/css", ".html": "text/html" };
const SHEETS = ["/src/theme/lme.css", "/docs/assets/style.css"];
const MINIMUM = 4;

let server = null, browser = null, page = null;
let found = null;

// In the page: the line of a paragraph "Accepted by<BUTTON>on the current text</p>" for each kind of button, with and without the buttons' own margins.
const MEASURE = `(async () => {
  for (const href of ${JSON.stringify(SHEETS)}) {
    await new Promise((resolve, reject) => { const link = document.createElement("link"); link.rel = "stylesheet"; link.href = href; link.onload = resolve; link.onerror = reject; document.head.append(link); });
  }
  const kinds = { "a button of class btn": '<button class="btn" type="button">Accept</button>', "a plain button": '<button type="button">Accept</button>',
    "a link of class btn": '<a class="btn" href="#x">Accept</a>' };
  const gaps = (markup) => {
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "Accepted by" + markup + "on the current text";
    document.body.append(paragraph);
    const control = paragraph.children[0], first = paragraph.firstChild, last = paragraph.lastChild;
    const edge = (node, side) => { const range = document.createRange(); range.selectNodeContents(node); const rects = [...range.getClientRects()]; return side === "right" ? rects.at(-1).right : rects[0].left; };
    const box = control.getBoundingClientRect();
    const result = { before: Math.round((box.left - edge(first, "right")) * 10) / 10, after: Math.round((edge(last, "left") - box.right) * 10) / 10,
      sameLine: Math.abs(box.top - paragraph.getBoundingClientRect().top) < 30 };
    paragraph.remove();
    return result;
  };
  const out = {};
  for (const [name, markup] of Object.entries(kinds)) {
    out[name] = gaps(markup);
    out[name + ", margins set to zero"] = gaps(markup.replace(/^<(button|a)/, '<$1 style="margin:0"'));
  }
  return out;
})()`;

before(async () => {
  server = createServer((request, response) => {
    const raw = decodeURIComponent(new URL(request.url, "http://site").pathname);
    if (raw === "/__blank") { response.writeHead(200, { "content-type": "text/html" }); response.end("<!doctype html><title>blank</title><body></body>"); return; }
    const file = normalize(join(root, raw));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { "content-type": TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
    createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = `http://127.0.0.1:${server.address().port}`;
  const executable = await stageElectron();
  browser = await openWindow(executable, `${address}/__blank`);
  page = browser.page;
  found = await page.evaluate(MEASURE);
}, { timeout: 110000 });

after(async () => {
  browser?.close();
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
});

// TST-1071001 · level: system · module: MOD-site-frame
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: a line of text with a button written against it, with no space — "Accepted by<button>Accept</button>on the current text" —, under the review pages' two style sheets; for a button of class btn, a plain button and a link of class btn
// input: the distance from the button's box to the text before it and to the text after it
// expect: for each kind, the button stands on the same line, and the gap before and the gap after are each at least 4 px
test("TST-1071001: a button and the text beside it on one line are separated by a gap of at least 4 px", () => {
  for (const name of ["a button of class btn", "a plain button", "a link of class btn"]) {
    const measured = found[name];
    assert.equal(measured.sameLine, true, `${name} stands on the line of its text`);
    assert.equal(measured.before >= MINIMUM && measured.after >= MINIMUM, true, `${name}: ${JSON.stringify(measured)}`);
  }
});

// TST-1071002 · level: system · module: MOD-site-frame
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: the same lines with the buttons' margins set to zero in the element's own style (the style sheets without the rule)
// input: the same distances
// expect: every gap is zero (within half a pixel), so that the measurement of the test above finds the absence of the rule
test("TST-1071002: the counter-proof: without the buttons' margins the gap is zero", () => {
  for (const name of ["a button of class btn", "a plain button", "a link of class btn"]) {
    const measured = found[`${name}, margins set to zero`];
    assert.equal(Math.abs(measured.before) < 0.5 && Math.abs(measured.after) < 0.5, true, `${name}: ${JSON.stringify(measured)}`);
  }
});
