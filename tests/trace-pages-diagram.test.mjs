// The component diagram of the modules view — src/trace-pages/diagram.mjs (ITM-203). Deterministic, no network.
// Run: node --test tests/trace-pages-diagram.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-025; A MODULE BELONGS TO ONE SUBSYSTEM; MODULE GAPS ARE REPORTED, NOT FORBIDDEN
// Level: unit
//
// UC-025 step 5: Agent M draws the component diagram from the modules' declared uses as Mermaid — one box per module inside
// the box of its subsystem, one arrow per used module —; 5a: a used module that has no file is drawn as a box marked missing.
// The modules are given as parseArchitecture (docs/assets/artifacts.mjs) reads their files, as for the model of this
// diagram, componentDiagram in docs/assets/traceability.mjs. The diagram is read back line by line (`drawn`, below), every
// line accounted for, so that each expectation is stated in modules, subsystems and arrows. The size case: 52 modules — as
// many as Agent M has — with 400 uses stay below Mermaid's limit of 50,000 characters (maxTextSize of the vendored mermaid
// 12.0.0), above which Mermaid draws "Maximum text size in diagram exceeded" instead of the diagram. Counter-proofs: the pull
// request of ITM-203.

import test from "node:test";
import assert from "node:assert/strict";
import { componentDiagram } from "../src/trace-pages/diagram.mjs";

// A module file as parseArchitecture reads it: the decisions it follows, the interfaces of other modules it uses
// (`MOD-<slug>.<interface>`) and those it provides.
const mod = (id, title, follows, uses = [], provides = []) => ({
  kind: "module", id, title, follows, provides,
  uses: uses.map((u) => { const [module, iface] = u.split("."); return { module, iface }; }),
});

// The diagram read back: its first line; the boxes, by the module identifier their label starts with, each with every label
// it is declared with; the subsystem boxes, by their label, with the boxes declared inside them; the boxes declared outside
// every subsystem; the arrows as "user --> used"; the boxes of class `missing` and the line that styles that class. Any other
// line is kept in `other`.
function drawn(text) {
  const [first, ...lines] = text.split("\n");
  const out = { first, boxes: {}, subsystems: {}, outside: [], arrows: [], missing: [], missingStyle: null, other: [] };
  const moduleOf = new Map(); // a Mermaid node -> the module identifier its label starts with
  let inside = null;
  for (const line of lines) {
    let m;
    if (line === "") continue;
    if ((m = /^\s*subgraph (\w+)\["([^"]*)"\]$/.exec(line))) out.subsystems[inside = m[2]] = [];
    else if (/^\s*end$/.test(line)) inside = null;
    else if ((m = /^\s*(\w+)\["([^"]*)"\]$/.exec(line))) {
      const id = m[2].split(/<br\/>| — /)[0];
      moduleOf.set(m[1], id);
      (out.boxes[id] ??= []).push(m[2]);
      (inside === null ? out.outside : out.subsystems[inside]).push(id);
    } else if ((m = /^\s*(\w+) --> (\w+)$/.exec(line))) out.arrows.push([m[1], m[2]]);
    else if ((m = /^\s*class (\w+) missing$/.exec(line))) out.missing.push(m[1]);
    else if (/^\s*classDef missing /.test(line)) out.missingStyle = line.trim();
    else out.other.push(line);
  }
  out.arrows = out.arrows.map(([a, b]) => `${moduleOf.get(a) ?? a} --> ${moduleOf.get(b) ?? b}`).sort();
  out.missing = out.missing.map((n) => moduleOf.get(n) ?? n).sort();
  out.outside.sort();
  for (const s of Object.values(out.subsystems)) s.sort();
  return out;
}

// A small product. MOD-page follows ARC-002 first, then ARC-001; MOD-reader follows ARC-001, then ARC-003; MOD-notes follows
// no decision. MOD-review uses two interfaces of MOD-reader, MOD-notes two of MOD-store, and MOD-store has no file.
const PRODUCT = [
  mod("MOD-page", "Renders the dashboard", ["ARC-002", "ARC-001"], ["MOD-review.status", "MOD-review.history"]),
  mod("MOD-review", "Derives the status of reviewed files", ["ARC-001"],
    ["MOD-reader.readFile", "MOD-reader.listTree", "MOD-store.load"], ["status", "history"]),
  mod("MOD-reader", "Reads files at a pinned commit", ["ARC-001", "ARC-003"], [], ["readFile", "listTree"]),
  mod("MOD-notes", "Keeps a reviewer's notes", [], ["MOD-reader.readFile", "MOD-store.load", "MOD-store.save"]),
];

test("UC-025 step 5 — one box per module, showing its identifier and title, whatever its title holds", () => {
  const d = drawn(componentDiagram(PRODUCT));
  assert.match(d.first, /^flowchart\b/, "a Mermaid flowchart");
  assert.deepEqual(d.boxes, {
    "MOD-notes": ["MOD-notes<br/>Keeps a reviewer's notes"],
    "MOD-page": ["MOD-page<br/>Renders the dashboard"],
    "MOD-reader": ["MOD-reader<br/>Reads files at a pinned commit"],
    "MOD-review": ["MOD-review<br/>Derives the status of reviewed files"],
    "MOD-store": ["MOD-store — missing"],
  }, "each module once, used by many or by none; MOD-store, which has no file, once too");
  assert.deepEqual(d.other, [], "nothing but boxes, subsystem boxes, arrows and the mark of the missing");
  // A title cannot end its label, open a tag or start a directive of its own: it stays the text of its one box.
  const evil = PRODUCT.map((m) => (m.id === "MOD-notes" ? { ...m, title: 'x"]\nclick MOD_page "javascript:alert(1)" <b>' } : m));
  const e = drawn(componentDiagram(evil));
  assert.deepEqual(e.boxes["MOD-notes"], ['MOD-notes<br/>x#quot;] click MOD_page #quot;javascript:alert(1)#quot; #lt;b#gt;']);
  assert.deepEqual(Object.keys(e.boxes).sort(), Object.keys(d.boxes).sort());
  assert.deepEqual(e.other, []);
});

test("UC-025 step 5, A MODULE BELONGS TO ONE SUBSYSTEM — one box per subsystem holding its modules; the subsystem is the first decision a module follows", () => {
  const d = drawn(componentDiagram(PRODUCT));
  assert.deepEqual(d.subsystems, {
    "ARC-001": ["MOD-reader", "MOD-review"],
    "ARC-002": ["MOD-page"],
  }, "MOD-page in ARC-002 alone, MOD-reader in ARC-001 alone; ARC-003 is no module's first decision and has no box");
  assert.deepEqual(d.outside, ["MOD-notes", "MOD-store"], "a module that follows no decision, and the missing one, stand outside");
});

test("UC-025 step 5 — one arrow per pair of a module and a module it uses, however many of its interfaces it uses", () => {
  const d = drawn(componentDiagram(PRODUCT));
  assert.deepEqual(d.arrows, [
    "MOD-notes --> MOD-reader",
    "MOD-notes --> MOD-store",
    "MOD-page --> MOD-review",
    "MOD-review --> MOD-reader",
    "MOD-review --> MOD-store",
  ], "eight used interfaces, five pairs: five arrows, from the user to the module it uses, without a label");
  assert.deepEqual(d.other, []);
});

test("UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used module that has no file is drawn as one box marked missing", () => {
  const d = drawn(componentDiagram(PRODUCT));
  assert.deepEqual(d.missing, ["MOD-store"], "one box, though two modules use it through two interfaces");
  assert.deepEqual(d.boxes["MOD-store"], ["MOD-store — missing"]);
  assert.match(d.missingStyle ?? "", /^classDef missing stroke-dasharray:/, "the mark is drawn: a dashed outline");
  assert.deepEqual(d.arrows.filter((a) => a.endsWith("--> MOD-store")), ["MOD-notes --> MOD-store", "MOD-review --> MOD-store"]);
  // Counter-case: with its file, MOD-store is a module like the others — in its subsystem, with its title, not marked.
  const whole = drawn(componentDiagram([...PRODUCT, mod("MOD-store", "Stores the notes", ["ARC-001"], [], ["load", "save"])]));
  assert.deepEqual(whole.missing, []);
  assert.equal(whole.missingStyle, null);
  assert.deepEqual(whole.boxes["MOD-store"], ["MOD-store<br/>Stores the notes"]);
  assert.deepEqual(whole.subsystems["ARC-001"], ["MOD-reader", "MOD-review", "MOD-store"]);
  assert.deepEqual(whole.arrows, d.arrows);
});

// 52 modules in 11 subsystems, each identifier as long as Agent M's longest (MOD-implementation-pages, 24 characters) and each
// title as long as its longest (82 characters). Module i uses the next eight modules (i < 36) or seven (the other 16): 400 used
// modules in all, each through `interfaces` of its interfaces, every interface name as long as Agent M's longest (23).
function large(interfaces) {
  const id = (i) => `MOD-module-${String(i % 52).padStart(2, "0")}-in-a-layer`;
  const ifaces = Array.from({ length: 3 }, (_, n) => `anInterfaceOfTheModule${n + 1}`);
  return Array.from({ length: 52 }, (_, i) => {
    const used = Array.from({ length: i < 36 ? 8 : 7 }, (_, k) => id(i + k + 1));
    const title = `Module ${String(i).padStart(2, "0")} — a title as long as the longest of Agent M's own module titles`;
    return mod(id(i), title.padEnd(82, "."), [`ARC-${101 + (i % 11)}`],
      used.flatMap((u) => ifaces.slice(0, interfaces).map((f) => `${u}.${f}`)), ifaces);
  });
}

test("UC-025 step 5 — the text for 52 modules with 400 uses stays below Mermaid's limit of 50,000 characters, however many interfaces each use names", () => {
  const one = large(1), three = large(3);
  // The input is what the case says.
  assert.equal(one.length, 52);
  assert.equal(new Set(one.flatMap((m) => m.uses.map((u) => `${m.id} ${u.module}`))).size, 400, "400 pairs of a module and a module it uses");
  assert.deepEqual([one, three].map((ms) => ms.reduce((n, m) => n + m.uses.length, 0)), [400, 1200], "used interfaces");
  assert.ok(one.every((m) => m.id.length === 24 && m.title.length === 82));
  const d1 = componentDiagram(one), d3 = componentDiagram(three);
  assert.ok(d1.length < 50000, `${d1.length} characters for 400 uses through one interface each`);
  assert.ok(d3.length < 50000, `${d3.length} characters for 400 uses through three interfaces each`);
  assert.equal(d3, d1, "the text does not grow with the interfaces a use names");
  const d = drawn(d1);
  assert.deepEqual([Object.keys(d.boxes).length, Object.keys(d.subsystems).length, d.arrows.length, d.other.length], [52, 11, 400, 0]);
});
