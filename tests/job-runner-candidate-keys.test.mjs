// Drafted use cases, decisions, modules and items classified by their key (ITM-451) — the check `candidate-classes` of MOD-job-runner, as docs/architecture/MOD-job-runner.md states it
// under Data (Built-in strategies: "MOD-documents' `classifyCandidates` of the drafted candidates against the existing artifacts the job's parts carry ... An error for a candidate the
// rule finds a duplicate of an existing artifact while its drafter classed it otherwise, naming that artifact") and Interfaces (Part: `artifacts` "each with its identifier and the values
// of its format's key"), with the key of each format that MOD-documents' schema language gives (`key`: the `title` of a use case, an architecture decision and an item, the `id` of a module).
// For UC-007 6a. The recipes that fill the parts' artifacts are ITM-332's and ITM-337's. ITM-387's cases, for requirements, are tests/job-runner-candidate-classes.test.mjs.
// Run: node --test tests/job-runner-candidate-keys.test.mjs
//
// Module: MOD-job-runner
// Guards: UC-007; A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; THE DERIVATION RULES HOLD FOR ARCHITECTURE; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// Level: unit
//
// A draft of files is read as every caller reads a document: each file with the schema `artifactSchemaOf` names for its path and `readDocument`, its key the values of that schema's `key`
// fields; a draft of items, `{ items }`, has no file, its key is the item's `title`. A file whose path no schema names (a test) has no key and is not classified, and keeps its class
// (ITM-451's Outcome). The existing artifacts are those of the job's parts, compared with the drafted ones of their own kind only — a use case is compared with use cases, by the prefix of
// the identifier — so that a requirement named like a use case is no duplicate of it. The classes are MOD-documents' as they stand, which decide by key alone: a drafted file that has the key of
// an existing artifact is a duplicate of it whatever its drafter proposed, the existing rule that tests/job-runner-candidate-classes.test.mjs asserts for requirements. The findings name the
// file by its path, or the item by its title, and the existing artifact by its identifier. The driver is a fixture; the draft is checked once, as `from`. Each test states its input and its
// expected result before it runs (given / input / expect); where a test asserts an absence of a finding, a draft in the same call must be found. Nothing reaches the network. The counter-proofs
// are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { runJob } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null, capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };
const CLASSES = ["new", "change", "duplicate", "conflict"];
const FILES = { type: "object", required: ["files"], properties: { files: { type: "array", items: { type: "object", required: ["path", "text", "class"],
  properties: { path: { type: "string" }, text: { type: "string" }, class: { type: "string", enum: CLASSES }, of: { type: "string" } } } } } };
const ITEMS = { type: "object", required: ["items"], properties: { items: { type: "array", items: { type: "object", required: ["title", "class"],
  properties: { title: { type: "string" }, class: { type: "string", enum: CLASSES }, of: { type: "string" } } } } } };
const kindWith = (answer) => ({ name: "fixture-documents", serves: [], participant: "one", needs: ["draft text"], resources: "none", preconditions: [], recipes: [],
  checks: ["candidate-classes"], personDecides: [], reviewer: null, reviewers: 0, steps: [], gatePoints: [], review: "person", writer: "return-draft", limit: 5, purpose: "Drafts documents, for a test.",
  prompt: "Draft.", answer });

// The existing artifacts one part shows: a use case, a decision, a module, an item, and a requirement whose name is a use case's title in capitals.
const EXISTING = [
  { id: "UC-001", keys: ["Export a report"] }, { id: "ARC-003", keys: ["Use a static client"] }, { id: "MOD-reader", keys: ["MOD-reader"] }, { id: "ITM-010", keys: ["Read a file"] },
  { id: "EXPORT A REPORT", keys: ["EXPORT A REPORT", "A report may be exported."] },
];
const PARTS = [{ name: "the existing artifacts", text: "…", size: 10, sources: [], required: true, recipe: "existing-artifacts", artifacts: EXISTING }];
const contextOf = (kind) => ({ kind, params: {}, product: { address: "https://github.com/alice/product", snapshot: null, host: null }, instance: { snapshot: null, host: null },
  connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-13T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });
function check(answer, draft, parts = PARTS) {
  const kind = kindWith(answer);
  const job = { kind, params: {}, drafter: DRAFTER, reviewers: [], parts, destinations: [], fits: true, notFitting: [], leftOut: [], blocking: [], limit: 5 };
  return runJob(job, { drafter: null, reviewers: [] }, { attended: true, context: contextOf(kind), from: draft });
}

// The documents, each with front matter in the form of its format.
const useCase = (id, title) => `---\nid: ${id}\ntitle: ${title}\n---\n# ${id} ${title}\n`;
const decision = (id, title) => `---\nid: ${id}\ntitle: ${title}\n---\n# ${id} ${title}\n`;
const moduleFile = (id) => `---\nid: ${id}\ntitle: A module\nfolder: src/x/\n---\n# ${id} A module\n`;
const file = (path, text, cls = "new", of) => ({ path, text, class: cls, ...(of === undefined ? {} : { of }) });
const EXACT = "EXACT DUPLICATES ARE FOUND WITHOUT A MODEL", NAMED = "A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT";
const brief = (findings) => findings.map((found) => [found.artifact, found.kind, found.rule]);

const UC_NEW = file("docs/use-cases/UC-050-import-a-report.md", useCase("UC-050", "Import a report"));

// TST-472310 · level: unit · module: MOD-job-runner
// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; UC-007; THE DERIVATION RULES HOLD FOR ARCHITECTURE
// given: a part showing UC-001 "Export a report", ARC-003 "Use a static client", MOD-reader and the item ITM-010 "Read a file"; a draft of files that holds a use case titled as UC-001 (other letters and spacing), a decision titled as ARC-003 and a module with the identifier MOD-reader, each classed new, and a use case of another title, classed new
// input: the check, once, on the draft
// expect: three errors under EXACT DUPLICATES ARE FOUND WITHOUT A MODEL, in one line each, one for each of the three files, naming UC-001, ARC-003 and MOD-reader respectively — each its own —, and none for the use case of another title
test("candidate-classes — a drafted use case, decision or module with an existing one's key, classed new, goes back naming it", async () => {
  const draft = { files: [UC_NEW, file("docs/use-cases/UC-051-x.md", useCase("UC-051", "  EXPORT  a report ")), file("docs/architecture/ARC-060-y.md", decision("ARC-060", "Use a Static Client")),
    file("docs/architecture/MOD-reader.md", moduleFile("MOD-reader"))] };
  const result = await check(FILES, draft);
  assert.deepEqual(brief(result.remaining), [["docs/use-cases/UC-051-x.md", "error", EXACT], ["docs/architecture/ARC-060-y.md", "error", EXACT], ["docs/architecture/MOD-reader.md", "error", EXACT]]);
  const [uc, arc, mod] = result.remaining;
  assert.ok(uc.what.includes("UC-001") && !uc.what.includes("ARC-003") && !uc.what.includes("EXPORT A REPORT\""), uc.what);
  assert.ok(arc.what.includes("ARC-003") && mod.what.includes("MOD-reader"));
  assert.match(uc.what, /states the title of the existing "UC-001"/);
  assert.match(mod.what, /states the id of the existing "MOD-reader"/);
  for (const found of result.remaining) for (const text of [found.what, found.fix]) assert.match(text, /^[^\n]+$/);
  assert.ok(uc.fix.includes("duplicate of UC-001"));
});

// TST-472311 · level: unit · module: MOD-job-runner
// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; UC-007
// given: the same part; a draft of items with an item titled as ITM-010 ("read A file"), classed new, and an item of another title
// input: the check on `{ items }`
// expect: one error under EXACT DUPLICATES ARE FOUND WITHOUT A MODEL, naming the item by its title and ITM-010; none for the other item
test("candidate-classes — a drafted item with an existing item's title, classed new, goes back naming it", async () => {
  const result = await check(ITEMS, { items: [{ title: "read A file", class: "new" }, { title: "Write a file", class: "new" }] });
  assert.deepEqual(brief(result.remaining), [["read A file", "error", EXACT]]);
  assert.ok(result.remaining[0].what.includes("ITM-010"));
});

// TST-472312 · level: unit · module: MOD-job-runner
// guards: A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
// given: the same part, which also shows a requirement named EXPORT A REPORT; a use case titled "Export a report", classed a duplicate of UC-001; a use case titled as a decision, ARC-003, classed new
// input: the check on both drafts
// expect: the first passes — no finding — and its class is a duplicate of UC-001 decided by rule; the second gives no finding: a decision's title is no use case's key, and the requirement of that name is not the use case's duplicate
test("candidate-classes — a use case is compared with the use cases only, and a duplicate classed right passes", async () => {
  const first = await check(FILES, { files: [file("docs/use-cases/UC-051-x.md", useCase("UC-051", "Export a report"), "duplicate", "UC-001")] });
  assert.deepEqual(first.remaining, []);
  assert.deepEqual(first.classes.map((each) => [each.refs, each.class, each.of, each.decidedBy]), [[["docs/use-cases/UC-051-x.md"], "duplicate", "UC-001", "rule"]]);
  const second = await check(FILES, { files: [file("docs/use-cases/UC-052-x.md", useCase("UC-052", "Use a static client"))] });
  assert.deepEqual(second.remaining, []);
});

// TST-472313 · level: unit · module: MOD-job-runner
// guards: A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
// given: the same part; a draft of a new use case whose title no artifact has, a change of a use case that a part shows (a use case of another title, naming UC-001), a change of UC-099, which no part shows, and two new use cases of one title
// input: the check on the draft
// expect: one error for the change of UC-099, under A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT, in one line; none for the others; `classes` holds the new use case as new decided by its participant, the change of UC-001 as it was classed, the change of UC-099 as it was, and the two use cases of one title as one class naming both paths
test("candidate-classes — a drafted file of no key's match keeps its class, a change names a use case a part shows, and the classes are the documents'", async () => {
  const draft = { files: [UC_NEW, file("docs/use-cases/UC-001-export-a-report.md", useCase("UC-001", "Export a report as PDF"), "change", "UC-001"),
    file("docs/use-cases/UC-070-z.md", useCase("UC-070", "Something else"), "change", "UC-099"),
    file("docs/use-cases/UC-071-a.md", useCase("UC-071", "Twice"), "new"), file("docs/use-cases/UC-072-b.md", useCase("UC-072", "twice"), "new")] };
  const result = await check(FILES, draft);
  assert.deepEqual(brief(result.remaining), [["docs/use-cases/UC-070-z.md", "error", NAMED]]);
  assert.match(result.remaining[0].what, /UC-099/);
  assert.deepEqual(result.classes.map((each) => [each.refs, each.from, each.class, each.of, each.decidedBy]).slice(0, 1), [
    [["docs/use-cases/UC-050-import-a-report.md"], ["docs/use-cases/UC-050-import-a-report.md"], "new", null, "participant"]]);
  assert.deepEqual(result.classes.map((each) => [each.refs, each.class, each.of, each.decidedBy]), [
    [["docs/use-cases/UC-050-import-a-report.md"], "new", null, "participant"],
    [["docs/use-cases/UC-001-export-a-report.md"], "change", "UC-001", "participant"],
    [["docs/use-cases/UC-070-z.md"], "change", "UC-099", "participant"],
    [["docs/use-cases/UC-071-a.md", "docs/use-cases/UC-072-b.md"], "new", null, "participant"]]);
});

// TST-472314 · level: unit · module: MOD-job-runner
// guards: A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
// given: the same part; a draft of files that are tests — a path under tests/, with a text that has the title of UC-001 —, and a draft whose part shows no artifact, of a use case with UC-001's title
// input: the check on each
// expect: the first: no finding and no class — a draft of tests has no key and is not classified, nor is a use case whose title is missing; the second: nothing to classify, no class and no finding
test("candidate-classes — a draft of tests is not classified, nor a draft whose parts show no artifact", async () => {
  const tests = await check(FILES, { files: [file("tests/export.test.mjs", `---\ntitle: Export a report\n---\ntest("x", () => {});\n`)] });
  assert.deepEqual([tests.remaining, tests.classes], [[], []]);
  const keyless = await check(FILES, { files: [file("docs/use-cases/UC-080-x.md", "no front matter, so no title\n")] });
  assert.deepEqual([keyless.remaining, keyless.classes], [[], []], "a document with no value of its key has none to classify");
  const bare = await check(FILES, { files: [file("docs/use-cases/UC-051-x.md", useCase("UC-051", "Export a report"))] }, []);
  assert.deepEqual([bare.remaining, bare.classes], [[], []]);
});

// TST-472315 · level: unit · module: MOD-job-runner
// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
// given: the part's requirement EXPORT A REPORT ("A report may be exported."); a draft of candidates with a requirement of that rule, classed new
// input: the check on `{ candidates }`
// expect: one error naming the requirement and the existing one, in the words ITM-387 gave it: it states the name or the rule of the existing requirement
test("candidate-classes — a requirement is still keyed by its name and its rule", async () => {
  const REQUIREMENTS = { type: "object", required: ["candidates"], properties: { candidates: { type: "array", items: { type: "object" } } } };
  const result = await check(REQUIREMENTS, { candidates: [{ name: "REPORTS CAN LEAVE", rule: "A report may be exported.", check: "c", constrains: "product", passage: "p", class: "new" }] });
  assert.deepEqual(brief(result.remaining), [["REPORTS CAN LEAVE", "error", EXACT]]);
  assert.match(result.remaining[0].what, /states the name or the rule of the existing "EXPORT A REPORT"/);
});
