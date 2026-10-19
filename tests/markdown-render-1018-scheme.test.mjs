// ITM-1018 — MOD-markdown-render's renderMermaid draws a diagram in the colour scheme of the site, and draws it again, in the element it returned, when the scheme changes
// (docs/architecture/MOD-markdown-render.md, Interfaces: renderMermaid): "the library's `dark` theme where the scheme is dark, its `default` theme otherwise. The scheme is dark when the browser prefers a dark
// colour scheme (`prefers-color-scheme: dark`) and the document's root element does not carry `data-theme="light"` … When the scheme changes after the diagram is drawn — the browser's preference
// changes, or the root element's `data-theme` does — the diagram is drawn again from the same source in the new scheme, and the element that was returned keeps its place and takes the new drawing as its content".
// Run: node --test tests/markdown-render-1018-scheme.test.mjs
//
// Module: MOD-markdown-render
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; DIAGRAMS ARE MERMAID IN MARKDOWN
// Level: unit
//
// The small DOM of tests/markdown-render-dom.mjs, and a stand-in for the diagram library at its public boundary (initialize, mermaidAPI.getDiagramFromText, run), as tests/markdown-render-342.test.mjs
// installs it: the stand-in draws an svg whose text is the theme the library was last initialised with, so that a test reads the theme from the drawing. The browser's two sources of the scheme are
// stand-ins too: `matchMedia("(prefers-color-scheme: dark)")`, a media query list whose `matches` a test sets and whose `change` listeners it fires, and `MutationObserver`, whose callbacks it fires after
// setting the root element's `data-theme`. Readings the module text leaves open, which the tests state (the pull request names them):
//   - The module asks the browser for the scheme each time it draws, and watches the two sources once, however many diagrams it has drawn; a drawn diagram is drawn again only while it
//     stands in the document (`isConnected` is true; the small DOM has none, so a test gives its diagrams one).
//   - A change of the sources that leaves the scheme as it was (a `data-theme` of "dark" on a dark page; a preference changing under `data-theme="light"`) draws nothing again.
//   - A browser without `matchMedia` has the light scheme.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

await import("./markdown-render-dom.mjs");

// ---------------------------------------------------------------- the browser's sources of the scheme
const media = { matches: false, listeners: [], addEventListener(type, listener) { if (type === "change") this.listeners.push(listener); }, removeEventListener() {} };
globalThis.matchMedia = (query) => { assert.equal(query, "(prefers-color-scheme: dark)"); return media; };
const observers = [];
globalThis.MutationObserver = class { constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); } observe(target, options) { this.targets.push([target, options]); } disconnect() {} };
const root = () => document.documentElement;
const prefer = async (dark) => { media.matches = dark; for (const listener of media.listeners) listener({ matches: dark }); await settle(); };
const setTheme = async (value) => { if (value === null) root().removeAttribute("data-theme"); else root().setAttribute("data-theme", value); for (const observer of observers) await observer.callback([{ type: "attributes", attributeName: "data-theme" }]); await settle(); };
const settle = async () => { for (let n = 0; n < 30; n += 1) await new Promise((resolve) => setImmediate(resolve)); };

// ---------------------------------------------------------------- the diagram library's stand-in
let calls = [];
function installMermaid() {
  calls = [];
  let theme = "none";
  globalThis.mermaid = {
    initialize(options) { theme = options.theme ?? "none"; calls.push({ kind: "initialize", options }); },
    mermaidAPI: { async getDiagramFromText(source) { calls.push({ kind: "parse", source }); return { db: { getVertices: () => new Map() } }; } },
    async run({ nodes }) {
      for (const node of nodes) {
        calls.push({ kind: "run", source: node.textContent, theme });
        if (node.textContent.includes("this is not Mermaid")) throw new Error("parse error: expected diagram type");
        node.innerHTML = `<svg><text>${theme}</text></svg>`;
      }
    },
  };
}
const runs = () => calls.filter((call) => call.kind === "run");

const { renderMermaid } = await import("../src/markdown-render/index.mjs");

// svg as the small DOM needs it for the module's own safety check (tests/markdown-render-342.test.mjs does the same)
async function withSvg(run) {
  const prior = Object.getOwnPropertyDescriptor(globalThis, "SVGElement");
  const proto = globalThis.window.Element.prototype;
  const namespace = Object.getOwnPropertyDescriptor(proto, "namespaceURI");
  const tags = proto.getElementsByTagName;
  Object.defineProperty(globalThis, "SVGElement", { configurable: true, value: globalThis.window.Element });
  Object.defineProperty(proto, "namespaceURI", { configurable: true, get() {
    for (let node = this; node; node = node.parentNode) if (node.localName === "svg") return "http://www.w3.org/2000/svg";
    return namespace.get.call(this);
  } });
  proto.getElementsByTagName = function(name) {
    if (name !== "*") return tags.call(this, name);
    const out = []; (function walk(node) { for (const child of node.children ?? []) { out.push(child); walk(child); } })(this); return out;
  };
  try { return await run(); } finally {
    if (prior) Object.defineProperty(globalThis, "SVGElement", prior); else delete globalThis.SVGElement;
    Object.defineProperty(proto, "namespaceURI", namespace); proto.getElementsByTagName = tags;
  }
}
afterEach(async () => { media.matches = false; if (root().hasAttribute("data-theme")) root().removeAttribute("data-theme"); });

const SOURCE = "flowchart LR\n  Plan --> Build";
const themeOf = (element) => /<text>(\w+)<\/text>/.exec(element.innerHTML)?.[1];

// TST-1018001 · level: unit · module: MOD-markdown-render
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; DIAGRAMS ARE MERMAID IN MARKDOWN
// given: the stand-in library; the browser's preference and the root element's data-theme set as listed
// input: renderMermaid(source) in each setting
// expect: preference light, no data-theme: the library is initialised with the theme "default" before it draws, and the drawing is the default one; preference dark, no data-theme: "dark"; preference dark and data-theme "light": "default"; preference dark and data-theme "dark": "dark"; preference light and data-theme "dark": "default" (the preference decides, as in look.css and lme.css); the library is still initialised at the strict security level in each
test("TST-1018001 a diagram is drawn with the dark theme where the site's scheme is dark, and with the default theme otherwise", async () => withSvg(async () => {
  installMermaid();
  const settings = [[false, null, "default"], [true, null, "dark"], [true, "light", "default"], [true, "dark", "dark"], [false, "dark", "default"]];
  for (const [dark, theme, expected] of settings) {
    media.matches = dark;
    if (theme === null) root().removeAttribute("data-theme"); else root().setAttribute("data-theme", theme);
    const drawn = await renderMermaid(SOURCE);
    const initialised = calls.filter((call) => call.kind === "initialize").at(-1);
    assert.equal(initialised.options.theme, expected, `preference ${dark ? "dark" : "light"}, data-theme ${theme}: the library's theme`);
    assert.equal(initialised.options.securityLevel, "strict");
    assert.equal(themeOf(drawn), expected, `the drawing is the ${expected} one`);
  }
  assert.equal(runs().length, settings.length, "known positive: each setting drew once");
}));

// TST-1018002 · level: unit · module: MOD-markdown-render
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: a diagram drawn in the light scheme and put in the document, and a second one beside it
// input: the browser's preference changes to dark; then the root element's data-theme becomes "light"; then it is removed again; then the preference changes to dark once more, and data-theme "dark" is set
// expect: after the preference changes, both diagrams are drawn again from their own sources with the theme "dark", each in the very element renderMermaid returned (same object, same place in the document), the text beside them untouched; data-theme "light" draws both again with "default"; removing it draws them again with "dark" (the preference is dark); a change that leaves the scheme as it was — the preference light→dark under data-theme "light", and data-theme "dark" on a dark page — draws nothing again; the two sources are watched once each (one change listener, one observer of the root element's data-theme), not once for each diagram
test("TST-1018002 a drawn diagram is drawn again in the same element when the scheme changes, and only then", async () => withSvg(async () => {
  installMermaid();
  const first = await renderMermaid("flowchart LR\n  A --> B"), second = await renderMermaid("flowchart LR\n  C --> D");
  const page = document.createElement("div");
  const before = document.createElement("p");
  before.textContent = "The prose beside the diagrams.";
  page.append(before, first, second);
  document.body.append(page);
  for (const element of [first, second]) Object.defineProperty(element, "isConnected", { configurable: true, value: true });
  assert.deepEqual([themeOf(first), themeOf(second)], ["default", "default"]);
  const drawn = () => runs().length;

  let at = drawn();
  await prefer(true);
  assert.equal(drawn() - at, 2, "both diagrams are drawn again");
  assert.deepEqual(runs().slice(-2).map((call) => [call.source, call.theme]), [["flowchart LR\n  A --> B", "dark"], ["flowchart LR\n  C --> D", "dark"]]);
  assert.deepEqual([themeOf(first), themeOf(second)], ["dark", "dark"]);
  assert.deepEqual([...page.children], [before, first, second], "the same elements stand in the same places");
  assert.equal(before.textContent, "The prose beside the diagrams.");

  at = drawn();
  await setTheme("light");
  assert.equal(drawn() - at, 2);
  assert.deepEqual([themeOf(first), themeOf(second)], ["default", "default"]);

  at = drawn();
  await setTheme(null);
  assert.equal(drawn() - at, 2);
  assert.deepEqual([themeOf(first), themeOf(second)], ["dark", "dark"], "the preference is dark again");

  await setTheme("light");
  at = drawn();
  await prefer(false);
  await prefer(true);
  assert.equal(drawn() - at, 0, "under data-theme light the preference decides nothing");
  await setTheme(null);
  at = drawn();
  await setTheme("dark");
  assert.equal(drawn() - at, 0, "data-theme dark on a dark page leaves the scheme as it was");

  assert.equal(media.listeners.length, 1, "the preference is watched once");
  assert.equal(observers.length, 1, "the root element is observed once");
  assert.equal(observers[0].targets[0][0], root());
  assert.deepEqual(observers[0].targets[0][1].attributeFilter, ["data-theme"]);
  for (const element of [first, second]) Object.defineProperty(element, "isConnected", { configurable: true, value: false });
  page.remove();
}));

// TST-1018003 · level: unit · module: MOD-markdown-render
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: a source that does not parse, and a diagram drawn that is not in the document (isConnected false)
// input: renderMermaid for the source in the dark scheme and in the light one; then the preference changes
// expect: in each scheme the element is the block of an unrendered diagram — the parser's message beside the unchanged source —, and the change of the preference draws nothing again for it; the detached diagram is not drawn again either
test("TST-1018003 a diagram that does not parse is shown with its source in either scheme, and a detached one is not drawn again", async () => withSvg(async () => {
  installMermaid();
  for (const dark of [true, false]) {
    media.matches = dark;
    const refused = await renderMermaid("this is not Mermaid");
    assert.equal(refused.className, "unrendered", `preference ${dark ? "dark" : "light"}`);
    assert.match(refused.textContent, /Diagram error: parse error/);
    assert.match(refused.textContent, /this is not Mermaid/);
  }
  media.matches = false;
  const detached = await renderMermaid("flowchart LR\n  E --> F");
  Object.defineProperty(detached, "isConnected", { configurable: true, value: false });
  const at = runs().length;
  await prefer(true);
  assert.equal(runs().length - at, 0, "nothing is drawn again: the unrendered blocks and the detached diagram stand");
  assert.equal(themeOf(detached), "default");
}));
