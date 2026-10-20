// The trace views explain themselves (ITM-602) — UC-020: "A folded **What is this?** explains the statuses, why a requirement has a history of approvals, and what a release tag is", and EVERY
// STEP EXPLAINS ITSELF. MOD-trace-pages' views, drawn through the public Route.render, carry a folded explanation of the versions they offer (what a release tag is), of the statuses of the use
// cases a requirement traces to, and of the gaps; the topics behind them are MOD-site-frame's, in src/site-frame/explanations.md, and the frame's own check (tests/site-frame-topics.mjs) finds
// every topic the views name.
// Run: node --test tests/trace-pages-explanations.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-020; EVERY STEP EXPLAINS ITSELF
// Level: component
//
// The route is called with the Host/Snapshot-shaped fake of tests/trace-pages-harness.mjs holding a small product (a SPEC of two requirements, one use case). Readings the cases take (the pull
// request names them): the explanation of the versions stands in the version bar, of both views that offer a version choice; the explanation of the statuses in the opened requirement's section
// "Use cases", which is where the statuses are shown; the explanation of the gaps at the top of the gaps page, before its lists. Each is a `details` of class explain with the summary "What is
// this?" and a body of text. Each case states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { document, doc, find, treeHost, until } from "./trace-pages-harness.mjs";
import { topicFindings, topicsNamed, viewFiles } from "./site-frame-topics.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const SPEC = ["# Explained fixture — Specification", "", "## Only section", "",
  "**ALPHA RULE** *(Vibe Coding)*", "Alpha rule.", "*Check:* at review.", "",
  "**BETA RULE** *(Vibe Coding)*", "Beta rule.", "*Check:* at review.", ""].join("\n");
const FILES = { "SPEC.md": SPEC, "docs/use-cases/UC-001-first.md": doc("UC-001", "First use case", { realises: ["ALPHA RULE"] }) };
const hostOf = () => treeHost({ trees: { main: FILES, "v2026.1.0": FILES }, tags: ["v2026.1.0"] });
function render(params) {
  const target = document.createElement("div");
  document.body.append(target);
  return route.render(target, { product: { address: "https://github.com/acme/explained", host: hostOf() } }, params).then(() => target);
}
const folds = (node) => find(node, (each) => each.localName === "details" && each.className === "explain");
const words = (fold) => find(fold, (each) => each.localName !== "summary").map((each) => each.textContent).join(" ").replace(/\s+/g, " ");
const heading = (fold) => find(fold, (each) => each.localName === "summary")[0].textContent;

// TST-060201 · level: component · module: MOD-trace-pages
// guards: UC-020; EVERY STEP EXPLAINS ITSELF
// given: the specification view and the gaps view of a product with a release tag
// input: each is rendered at main
// expect: the version bar of each holds exactly one folded What is this? whose text says what a release tag is and that the current text is the default branch's
test("the version choice of the specification and of the gaps carries a folded explanation of a release tag", async () => {
  for (const key of ["specification", "gaps"]) {
    const target = await render({ key, ref: "main" });
    const [bar] = find(target, (node) => node.className === "version-bar");
    assert.ok(bar, `${key}: the version bar stands`);
    const own = folds(bar);
    assert.equal(own.length, 1, `${key}: one folded explanation in the version bar`);
    assert.equal(heading(own[0]), "What is this?");
    assert.match(words(own[0]), /release tag/i, key);
    assert.match(words(own[0]), /default branch/i, key);
  }
});

// TST-060202 · level: component · module: MOD-trace-pages
// guards: UC-020; EVERY STEP EXPLAINS ITSELF
// given: the specification view at main, ALPHA RULE opened; UC-001 realises it
// input: the section Use cases of the opened requirement
// expect: it lists UC-001 with its status (open) and holds exactly one folded What is this? whose text names the statuses open, accepted and changed since acceptance
test("the statuses of the use cases a requirement traces to are explained in a fold beside them", async () => {
  const target = await render({ key: "specification", ref: "main" });
  find(target, (node) => node.localName === "button" && node.className.includes("requirement-name") && node.textContent === "ALPHA RULE")[0].dispatchEvent(new Event("click"));
  const section = () => find(target, (node) => node.localName === "section" && node.className === "requirement-trace" && find(node, (h) => h.localName === "h4")[0]?.textContent === "Use cases")[0];
  await until(() => section() && /open/.test(section().textContent));
  assert.match(section().textContent, /UC-001 First use case — open/, "known positive: the status is shown");
  const own = folds(section());
  assert.equal(own.length, 1, "one folded explanation in the section");
  assert.equal(heading(own[0]), "What is this?");
  for (const status of [/open/, /accepted/, /changed since acceptance/]) assert.match(words(own[0]), status);
});

// TST-060203 · level: component · module: MOD-trace-pages
// guards: UC-020; EVERY STEP EXPLAINS ITSELF
// given: the gaps view at main
// input: the gaps page is drawn
// expect: the page holds a folded What is this? of its own, before its first list, whose text says what a gap is and that gaps block nothing
test("the gaps page carries a folded explanation of what a gap is, before its lists", async () => {
  const target = await render({ key: "gaps", ref: "main" });
  await until(() => find(target, (node) => node.className === "gaps-body" && !/Reading the gaps/.test(node.textContent)).length > 0);
  const [body] = find(target, (node) => node.className === "gaps-body");
  const own = folds(body);
  assert.equal(own.length, 1, "one folded explanation in the page's body");
  assert.match(words(own[0]), /gap/i);
  assert.match(words(own[0]), /block nothing/i);
  const first = find(body, (node) => node.localName === "section" && node.className === "gaps-list")[0];
  assert.ok(first, "known positive: a list is drawn");
  assert.ok(body.childNodes.includes(own[0]) && body.childNodes.indexOf(own[0]) < body.childNodes.indexOf(first), "the explanation comes before the first list");
});

// TST-060204 · level: unit · module: MOD-trace-pages
// guards: EVERY STEP EXPLAINS ITSELF
// given: the files of src/trace-pages and src/site-frame/explanations.md
// input: the frame's check of the topics over the files of src/trace-pages
// expect: the views name at least five topics (the two they named before and the three of this item), and the explanations file holds every one of them
test("the frame's check finds the topics the trace views name", () => {
  const files = viewFiles(new URL("..", import.meta.url).pathname).filter(({ path }) => path.startsWith("src/trace-pages/"));
  assert.ok(files.length >= 4, "known positive: the files of the module are found");
  const named = [...new Set(files.flatMap(({ text }) => topicsNamed(text)))];
  assert.ok(named.length >= 5, `the views name ${named.join(", ")}`);
  assert.deepEqual(topicFindings(files, readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8")), []);
});
