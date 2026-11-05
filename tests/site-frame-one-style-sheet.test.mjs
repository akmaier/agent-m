// The lab's look is one style sheet, src/site-frame/look.css (MOD-site-frame, Files: "look.css — the one style sheet of the lab's look"; Migration:
// "src/theme/lme.css ... removed: look.css and brand/ hold them, each rule once, and the entry pages link look.css in place of lme.css").
// Run: node --test tests/site-frame-one-style-sheet.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// Level: unit
//
// The expected results are written here from MOD-site-frame's text, and none is read from the code. Readings taken where the text leaves one open:
//   - "A page or file" that could link, preload or name the old style sheet is an HTML page of the repository, or a file of Agent M's code — under
//     src/, tests/ (but this one) or .github/. The records under docs/ (gates, backlog, jobs, measurements) and the architecture keep their text: they state
//     what was decided, and are no page or code.
//   - "References" is the file name lme.css in any spelling of its path (src/theme/lme.css, ../src/theme/lme.css, theme/lme.css, lme.css).
//   - The known positive is index.html as it stood before the change, which linked src/theme/lme.css: the same scan, run on it, finds it.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const self = relative(root, new URL(import.meta.url).pathname);
const SKIPPED = new Set(["node_modules", ".git", ".claude", ".agent", "vendor"]);
const TEXT = /\.(html|mjs|js|cjs|css|json|md|yml|yaml|py|txt)$/;
const OLD = /lme\.css/;

function* walk(folder) {
  for (const name of readdirSync(folder)) {
    if (SKIPPED.has(name)) continue;
    const path = join(folder, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield relative(root, path);
  }
}
const pages = () => [...walk(root)].filter((path) => path.endsWith(".html") && !path.startsWith("docs/sources/") && !path.startsWith("products/"));
const code = () => ["src", "tests", ".github"].filter((folder) => existsSync(join(root, folder))).flatMap((folder) => [...walk(join(root, folder))])
  .filter((path) => TEXT.test(path) && path !== self);
const naming = (paths) => paths.filter((path) => OLD.test(readFileSync(join(root, path), "utf8")));

// TST-1105201 · level: unit · module: MOD-site-frame
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: the repository's HTML pages (index.html, docs/index.html, src/desktop-shell/window.html) and Agent M's code under src/, tests/ and .github/
// input: each file's text is searched for lme.css; the file src/theme/lme.css is looked for
// expect: src/theme/lme.css does not exist; no page and no file of the code names lme.css — no link, no preload, no list of served files and no comment;
//         the entry pages link src/site-frame/look.css; the known positive (index.html with its old link) is found by the same scan
// Planted fault: a <link rel="stylesheet" href="src/theme/lme.css"> put back into index.html, or the file src/theme/lme.css restored, fails it.
test("TST-1105201 no page or file references src/theme/lme.css, and the entry pages link look.css", () => {
  const positive = `<link rel="stylesheet" href="src/theme/lme.css">`;
  assert.ok(OLD.test(positive), "the scan finds the old link where it stands");
  assert.ok(pages().includes("index.html") && pages().includes("docs/index.html") && pages().includes("src/desktop-shell/window.html"), "the scan reaches every page");
  assert.ok(code().includes("src/site-frame/look.css"), "the scan reaches the code");
  assert.equal(existsSync(join(root, "src/theme/lme.css")), false, "src/theme/lme.css is removed");
  assert.deepEqual(naming([...pages(), ...code()]), [], "no page or file of the code names lme.css");
  assert.match(readFileSync(join(root, "index.html"), "utf8"), /<link rel="stylesheet" href="src\/site-frame\/look\.css">/);
  assert.match(readFileSync(join(root, "docs/index.html"), "utf8"), /<link rel="stylesheet" href="\.\.\/src\/site-frame\/look\.css">/);
});

// A small EventTarget DOM, as tests/mod-desktop-shell-window.test.mjs draws the Bridge's window in; a <link> reflects its href as a browser does, resolved
// against the page's address.
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.attributes = new Map(); this.className = ""; this.parentNode = null; }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  get href() { return this.localName === "link" && this.attributes.has("href") ? new URL(this.attributes.get("href"), PAGE).href : undefined; }
  getElementsByTagName(name) { const found = []; const visit = (node) => { for (const child of node.childNodes) if (child instanceof Element) { if (child.localName === name) found.push(child); visit(child); } }; visit(this); return found; }
}
const PAGE = new URL("../index.html", import.meta.url).href;
const memory = () => { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key), get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null }; };

// TST-1105203 · level: unit · module: MOD-site-frame
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: a page whose head links src/site-frame/look.css itself, by the relative address the entry page index.html writes, and a page whose head links no
//        style sheet, as the Bridge's window
// input: startPage({ page: "bridge", views }) on each, with one route
// expect: the page that links look.css still links it once, by its own link; the page that does not gets one link to look.css (MOD-site-frame, startPage:
//         "links look.css in the page's head where the page does not link it itself")
// Planted fault: comparing the page's own link by its written address with the frame's resolved one appends a second look.css to the first page.
test("TST-1105203 startPage links look.css only where the page does not link it itself", async () => {
  const { startPage } = await import("../src/site-frame/index.mjs");
  const looks = (head) => head.getElementsByTagName("link").filter((link) => link.getAttribute("rel") === "stylesheet" && /site-frame\/look\.css$/.test(link.getAttribute("href")));
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: memory() });
  Object.defineProperty(globalThis, "location", { configurable: true, value: { hostname: "owner.github.io", pathname: "/agent-m/", hash: "" } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: new EventTarget() });
  const views = [{ strategies: [], routes: [{ name: "pairing", entry: null, title: "Pairing", async render(target) { target.replaceChildren("drawn"); } }] }];
  for (const own of [true, false]) {
    const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
    document.head = document.createElement("head"); document.body = document.createElement("body");
    if (own) { const link = document.createElement("link"); link.setAttribute("rel", "stylesheet"); link.setAttribute("href", "src/site-frame/look.css"); document.head.append(link); }
    globalThis.document = document;
    await startPage({ page: "bridge", views });
    assert.match(document.body.textContent, /drawn/, "the route is drawn");
    assert.deepEqual(looks(document.head).map((link) => link.getAttribute("href")),
      own ? ["src/site-frame/look.css"] : [new URL("../src/site-frame/look.css", import.meta.url).href], own ? "the page's own link, once" : "the frame's link");
  }
});
