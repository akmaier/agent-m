// The component diagram of the modules view, module gaps and missing interfaces (ITM-210): src/trace-pages/diagram.mjs marks
// a module a gap of UC-025 step 4 names, and draws a used interface an existing module does not provide the same way as a
// used module that has no file — an arrow ending in a box marked missing, on the module's own box. Deterministic, no network.
// Run: node --test tests/trace-pages-diagram-gaps.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-025; MODULE GAPS ARE REPORTED, NOT FORBIDDEN
// Level: unit
//
// UC-025 step 4: Agent M lists the gaps of the modules view, each with the artifact it concerns; step 5: the component
// diagram marks modules with a gap; 5a: a module uses an interface that no module provides — whether or not the module
// itself has a file — is drawn as an arrow ending in a box marked missing. Builds on ITM-203
// (tests/trace-pages-diagram.test.mjs, unchanged): a used module that has no file is already a box of its own, marked
// missing. The gaps are given to componentDiagram as MOD-trace-graph's moduleRows would return them — ModuleGap, `{ kind,
// artifact, path, what }` — matched to a drawn module by `artifact`; MOD-trace-graph is not yet implemented (no module
// names it under docs/architecture/ for which src/ has no folder but MOD-trace-graph.md — its Interfaces section is read in
// the original for the shape used here). Counter-proofs: the pull request of ITM-210.

import test from "node:test";
import assert from "node:assert/strict";
import { componentDiagram } from "../src/trace-pages/diagram.mjs";

// A module file as parseArchitecture reads it: the decisions it follows, the interfaces of other modules it uses
// (`MOD-<slug>.<interface>`) and those it provides itself. Kept in step with tests/trace-pages-diagram.test.mjs's own `mod`,
// not imported from it: that file is unchanged by this item.
const mod = (id, title, follows, uses = [], provides = []) => ({
  kind: "module", id, title, follows, provides,
  uses: uses.map((u) => { const [module, iface] = u.split("."); return { module, iface }; }),
});

// A gap of UC-025 step 4, as MOD-trace-graph's moduleRows (ModuleGap) returns it, naming the module its `artifact` concerns.
const gap = (artifact, kind = "no_test") => ({ kind, artifact, path: `docs/architecture/${artifact}.md`, what: kind });

// The diagram's boxes and classes, read back line by line: every box's label(s), and every class a node is declared with
// (`class <id> <name>`) — both keyed by the module identifier a box's label starts with (before "<br/>" or " — ").
function read(text) {
  const boxes = {}, classes = {};
  const moduleOf = new Map(); // Mermaid node id -> module identifier
  for (const line of text.split("\n")) {
    const b = /^\s*(\w+)\["([^"]*)"\]$/.exec(line);
    if (b) {
      const id = b[2].split(/<br\/>| — /)[0];
      moduleOf.set(b[1], id);
      (boxes[id] ??= []).push(b[2]);
    }
  }
  for (const line of text.split("\n")) {
    const c = /^\s*class (\w+) (\w+)$/.exec(line);
    if (c) (classes[moduleOf.get(c[1]) ?? c[1]] ??= new Set()).add(c[2]);
  }
  return { boxes, classes };
}

// A small product, all interfaces provided as used: MOD-page uses MOD-review, MOD-review uses MOD-reader; no gap, no missing
// provider — a clean base so each test below adds exactly the one thing it states.
const PRODUCT = [
  mod("MOD-page", "Renders the dashboard", ["ARC-001"], ["MOD-review.status"]),
  mod("MOD-review", "Derives the status of reviewed files", ["ARC-001"], ["MOD-reader.readFile"], ["status"]),
  mod("MOD-reader", "Reads files at a pinned commit", ["ARC-001"], [], ["readFile"]),
];

test("UC-025 step 5, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a module a gap names is marked, a module no gap names is not", () => {
  const { classes } = read(componentDiagram(PRODUCT, [gap("MOD-review")]));
  assert.deepEqual(classes["MOD-review"], new Set(["gap"]), "MOD-review, named by the gap, is marked");
  assert.equal(classes["MOD-page"], undefined, "MOD-page, named by no gap, is not marked");
  assert.equal(classes["MOD-reader"], undefined, "MOD-reader, named by no gap, is not marked");
  // Counter-case: no gaps given — the default, as every call before ITM-210 made it, and an explicit empty list — marks nothing.
  assert.deepEqual(read(componentDiagram(PRODUCT)).classes, {}, "the default (no second argument) marks nothing");
  assert.deepEqual(read(componentDiagram(PRODUCT, [])).classes, {}, "an empty list marks nothing");
});

test("UC-025 step 4 and 5 — several gaps naming the same module mark it once; a gap naming no drawn module marks nothing", () => {
  const { classes } = read(componentDiagram(PRODUCT, [gap("MOD-review", "no_subsystem"), gap("MOD-review", "no_test"), gap("MOD-ghost")]));
  assert.deepEqual(Object.keys(classes), ["MOD-review"], "MOD-ghost names no module this diagram draws, so it marks nothing");
  assert.deepEqual(classes["MOD-review"], new Set(["gap"]), "two gaps on MOD-review mark its one box once, not twice");
});

test("UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used interface an existing module does not provide is drawn as an arrow ending in a box marked missing", () => {
  // MOD-page uses MOD-review.status and MOD-review.history; MOD-review has a file and provides "status", but not "history".
  const product = [
    mod("MOD-page", "Renders the dashboard", ["ARC-001"], ["MOD-review.status", "MOD-review.history"]),
    mod("MOD-review", "Derives the status of reviewed files", ["ARC-001"], [], ["status"]),
  ];
  const text = componentDiagram(product);
  const { boxes, classes } = read(text);
  assert.deepEqual(boxes["MOD-review"], ["MOD-review<br/>Derives the status of reviewed files"],
    "MOD-review keeps its own box, with its own label — it is not redrawn as an absent module");
  assert.deepEqual(classes["MOD-review"], new Set(["missing"]), "that box is marked missing, as UC-025 5a asks");
  assert.match(text, /\bMOD_page --> MOD_review\b/, "the arrow still runs from the user to MOD-review's own box");
  // Counter-case: once MOD-review also provides "history", the use is resolved and nothing is marked.
  const whole = [product[0], mod("MOD-review", "Derives the status of reviewed files", ["ARC-001"], [], ["status", "history"])];
  assert.deepEqual(read(componentDiagram(whole)).classes, {}, "with the interface provided, nothing is marked");
});

// 52 modules in 11 subsystems, as tests/trace-pages-diagram.test.mjs's own size case: module i uses the next eight modules
// (i < 36) or seven, each through 3 provided interfaces — 400 pairs, 1,200 used interfaces, none missing. Every module also
// carries a gap, the worst case for the marks this item adds.
function large() {
  const id = (i) => `MOD-module-${String(i % 52).padStart(2, "0")}-in-a-layer`;
  const ifaces = Array.from({ length: 3 }, (_, n) => `anInterfaceOfTheModule${n + 1}`);
  return Array.from({ length: 52 }, (_, i) => {
    const used = Array.from({ length: i < 36 ? 8 : 7 }, (_, k) => id(i + k + 1));
    const title = `Module ${String(i).padStart(2, "0")} — a title as long as the longest of Agent M's own module titles`;
    return mod(id(i), title.padEnd(82, "."), [`ARC-${101 + (i % 11)}`], used.flatMap((u) => ifaces.map((f) => `${u}.${f}`)), ifaces);
  });
}

test("UC-025 step 5 — the text for 52 modules with 400 uses, every module also marked by a gap, stays below Mermaid's limit of 50,000 characters", () => {
  const modules = large();
  const gaps = modules.map((m) => gap(m.id));
  const text = componentDiagram(modules, gaps);
  assert.ok(text.length < 50000, `${text.length} characters for 400 uses and 52 gaps`);
  const { classes } = read(text);
  assert.equal(Object.keys(classes).length, 52, "every module is marked");
  assert.ok(Object.values(classes).every((s) => s.size === 1 && s.has("gap")), "marked as a gap, not as missing — every interface used is provided");
});
