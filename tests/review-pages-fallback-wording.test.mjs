// MOD-review-pages' fallback pages speak of each file (ITM-612): without a token, the sentence above GitHub's pages must fit both paths that show it — the use-case file's editor, which
// offers one page, and a requirement's editor, which offers the four files of a queue entry. The item's Outcome fixes the sentence: "There is no token: GitHub's page opens for each file, and you commit them there."
// Run: node --test tests/review-pages-fallback-wording.test.mjs
//
// Module: MOD-review-pages
// Guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
// Level: unit
//
// This imports the browser harness of tests/review-pages-harness.mjs unchanged. The product is a fixture behind a Host of the tests' own, which keeps to MOD-repository-hosts'
// interface (repositoryInfo with canWrite false, readSnapshot, commitFiles refused). The real MOD-markdown-render (its editor), MOD-spec-changes, MOD-artifact-edits and MOD-text-tools run as
// they are. Nothing reaches the network. Each test states its input and its expected result before it runs (given / input / expect). The counter-proof is recorded in the pull request.

import "./review-pages-harness.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { openStore } = await import("../src/browser-store/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));
const routeOf = (name) => pages.view?.routes.find((candidate) => candidate.name === name);

// The sentence the item fixes, written out here and taken from no document.
const SENTENCE = "There is no token: GitHub's page opens for each file, and you commit them there.";

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message) => Object.assign(new Error(message), { name });
const GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const LOAN = "A LOAN HAS A DUE DATE";
const LENDING = text("## 1. Lending", "", `**${LOAN}** *(Product Owner)*`, "Every loan states the date by which the book is returned.", "*Check:* `tests/loan.test.mjs`");
const SPEC = text("# Thesis tool — Specification", "") + LENDING;
const P41 = "docs/use-cases/UC-041-check-out-a-book.md";
const UC41 = text("---", "id: UC-041", "title: Check out a book", "area: lending", "actors:", "  - Member", "realises:", `  - ${LOAN}`, "---", "# UC-041 Check out a book", "",
  "**Goal.** The member borrows a book at the desk.");
const FILES = { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, [P41]: UC41 };

// A product no token can write to: its host answers canWrite false and refuses every commit.
function fakeHost() {
  const calls = [], head = createHash("sha1").update("commit 1").digest("hex"), tree = new Map(Object.entries(FILES));
  const snapshot = (ref) => ({ repository: GITHUB, ref, commit: head, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
    blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) });
  return {
    writes: () => calls,
    host: {
      async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" }; },
      async readSnapshot(ref) {
        if (ref === "main") return snapshot("main");
        throw failure("NotFound", `${ref} was not found`);
      },
      async readHistory() { return []; },
      async commitFiles(change) { calls.push(change); throw failure("PermissionMissing", "the token cannot write"); },
    },
  };
}

async function show(fake, name, params) {
  const route = routeOf(name);
  assert.ok(route, `the route ${name}: ${pages.error?.message}`);
  const store = openStore("nobody/agent-m");
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host: fake.host }, store, go() {},
    product: { address: GITHUB.web, kind: "github", host: fake.host } }, params);
  return target;
}
function find(root, match) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
}
const byClass = (root, name, className) => find(root, (node) => node.localName === name && node.className.split(" ").includes(className));
async function until(condition, what) {
  const limit = Date.now() + 2000;
  while (Date.now() < limit) {
    if (condition()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.fail(`waited for ${what}`);
}
const areaOf = (target) => find(target, (node) => node.localName === "textarea" && !node.className.split(" ").includes("why"))[0];
const saveOf = (target) => find(target, (node) => node.localName === "button" && node.textContent === "Save")[0];
// The text of every paragraph without a class: the sentence above GitHub's pages is one of them.
const sentencesOf = (target) => find(target, (node) => node.localName === "p" && node.className === "").map((node) => node.textContent);

// TST-612001 · level: unit · module: MOD-review-pages
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
// given: a GitHub product whose host cannot write and no token stored; UC-041 opened in the editor and edited
// input: a click on Save
// expect: one page of GitHub is listed, and a paragraph above it is exactly "There is no token: GitHub's page opens for each file, and you commit them there."; nothing committed
test("use-case/<id>/edit — without a token the sentence above GitHub's page speaks of each file", async () => {
  const fake = fakeHost();
  const target = await show(fake, "use-case", { id: "UC-041", edit: "1" });
  const area = areaOf(target);
  area.value = UC41.replace("at the desk.", "at the desk, with a receipt.");
  area.dispatchEvent(new Event("input"));
  saveOf(target).dispatchEvent(new Event("click"));
  await until(() => byClass(target, "a", "github-page").length === 1, "GitHub's page");
  assert.ok(sentencesOf(target).includes(SENTENCE), `the sentence: ${JSON.stringify(sentencesOf(target))}`);
  assert.equal(fake.writes().length, 0, "nothing committed");
});

// TST-612002 · level: unit · module: MOD-review-pages
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
// given: a GitHub product whose host cannot write and no token stored; the requirement A LOAN HAS A DUE DATE opened in the editor, edited, with a Why
// input: a click on Save
// expect: four pages of GitHub are listed — the queue's index and decisions file, the entry's proposal and its rationale —, and a paragraph above them is exactly "There is no token: GitHub's page opens for each file, and you commit them there."; nothing committed
test("requirement/<name>/edit — without a token the sentence above GitHub's pages speaks of each file", async () => {
  const fake = fakeHost();
  const target = await show(fake, "requirement", { name: LOAN });
  const area = areaOf(target);
  area.value = LENDING.replace("returned.", "returned, or renewed.");
  area.dispatchEvent(new Event("input"));
  byClass(target, "textarea", "why")[0].value = "Because it is clearer.";
  saveOf(target).dispatchEvent(new Event("click"));
  await until(() => byClass(target, "a", "github-page").length === 4, "GitHub's four pages");
  assert.ok(sentencesOf(target).includes(SENTENCE), `the sentence: ${JSON.stringify(sentencesOf(target))}`);
  assert.equal(fake.writes().length, 0, "nothing committed");
});
