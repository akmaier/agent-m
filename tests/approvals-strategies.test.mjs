// The strategies of use cases — MOD-approvals' approvalStrategies, as the accepted text of docs/architecture/MOD-approvals.md
// states them under Interfaces: the recipe use-cases, every use case of the product with its status, one part per file, each
// carrying its use case as an artifact keyed by the key of its format; the recipe use-case-with-neighbours, the use case the
// job's parameters name, every requirement it realises with its text from the SPEC, and every other use case; and the
// precondition rests-on-accepted for requirements and use cases, an error finding that names every one of the job's selection
// that is not accepted. The recipes accepted-use-cases and whole-architecture, the precondition architecture-ready and the
// architecture's part of rests-on-accepted are not part of this item (ITM-332).
// Run: node --test tests/approvals-strategies.test.mjs
//
// Module: MOD-approvals
// Guards: UC-007; UC-019; A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS; NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
// Guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
// Level: unit
//
// The product is a small repository this file holds, in memory: a SPEC of three requirements; three use cases, UC-001 whose
// current text a record names (accepted), UC-002 that no record names (open), and UC-003 whose record names an earlier text
// of it (changed); a module file, which is no use case; and the approval records. The module file words neither where the
// status of a part stands, nor the names of the job's parameters, nor the words of the finding: this file reads the status in
// a part's name, takes the parameters `useCase` — one identifier —, `requirements` — names — and `useCases` — identifiers —,
// and asks of the finding that it is an error under NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED, in one line, that names what
// is not accepted and none of what is. A strategy is called as the job runner calls it: a recipe with the job's context and
// its parameters, a precondition with the context. Each test states its input and its expected result before it runs
// (given / input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as approvalsModule from "../src/approvals/index.mjs";

// A name the module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once.
const { approvalStrategies } = approvalsModule;

// ---------------------------------------------------------------- the product

const text = (...lines) => `${lines.join("\n")}\n`;
// The blob SHA git gives a text, as MOD-repository-hosts' snapshot gives a file's.
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");

const SPEC = text("# Fixture product — Specification", "", "## Section", "",
  "**A SAMPLE RULE** *(Product Owner)*", "A sample rule that a use case realises.", "*Check:* `tests/sample.test.mjs`", "",
  "**ANOTHER SAMPLE RULE** *(Product Owner; SRC-fixture 2026)*", "Another rule that two use cases realise.",
  "*Check:* `tests/another.test.mjs`", "",
  "**AN UNREALISED RULE** *(Product Owner)*", "A rule that the use case under change does not realise.",
  "*Check:* `tests/unrealised.test.mjs`");

const useCase = (id, title, realises) => text("---", `id: ${id}`, `title: ${title}`, "area: files", "actors:", "  - Reader",
  "realises:", ...realises.map((name) => `  - ${name}`), "---", `# ${id} ${title}`, "", `**Goal.** ${title}.`);
const UC1_PATH = "docs/use-cases/UC-001-read-a-file.md";
const UC1 = useCase("UC-001", "Read a file", ["A SAMPLE RULE", "ANOTHER SAMPLE RULE"]);
const UC2_PATH = "docs/use-cases/UC-002-write-a-file.md";
const UC2 = useCase("UC-002", "Write a file", ["ANOTHER SAMPLE RULE"]);
const UC3_PATH = "docs/use-cases/UC-003-delete-a-file.md";
const UC3 = useCase("UC-003", "Delete a file", ["A SAMPLE RULE"]);
const UC3_EARLIER = useCase("UC-003", "Remove a file", ["A SAMPLE RULE"]);
const MODULE_PATH = "docs/architecture/MOD-sample.md";
const MODULE = text("---", "id: MOD-sample", "title: Sample", "folder: src/sample/", "---", "# MOD-sample Sample");

const record = (id, kind, file, body) => [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`,
  text(`kind: ${kind}`, `file: ${file}`, `blob: ${blobOf(body)}`)];
const FILES = { "SPEC.md": SPEC, "README.md": "# Fixture product\n", [UC1_PATH]: UC1, [UC2_PATH]: UC2, [UC3_PATH]: UC3,
  [MODULE_PATH]: MODULE, ...Object.fromEntries([record("UC-001", "use-case", UC1_PATH, UC1),
    record("UC-003", "use-case", UC3_PATH, UC3_EARLIER)]) };

const SNAPSHOT = { repository: { server: "github", origin: "https://github.com", path: "alice/product",
  web: "https://github.com/alice/product" }, ref: "main", commit: null, paths: Object.keys(FILES),
  read: async (path) => (path in FILES ? FILES[path] : null), blob: (path) => (path in FILES ? blobOf(FILES[path]) : null) };
const ADDRESS = "https://github.com/alice/product";
// The context of a job on the product, with the parameters a test sets.
const contextOf = (params = {}) => ({ params, product: { address: ADDRESS, snapshot: SNAPSHOT, host: null } });

const REQUIREMENT_TEXTS = { "A SAMPLE RULE": "A sample rule that a use case realises.",
  "ANOTHER SAMPLE RULE": "Another rule that two use cases realise." };
const CHECKS = { "A SAMPLE RULE": "`tests/sample.test.mjs`", "ANOTHER SAMPLE RULE": "`tests/another.test.mjs`" };
// What each part holds in its name — a use case's path or a requirement's name —, in the order the parts stand.
const HOLDING = [UC1_PATH, UC2_PATH, UC3_PATH, "A SAMPLE RULE", "ANOTHER SAMPLE RULE", "AN UNREALISED RULE"];
const order = (parts) => parts.map((part) => HOLDING.find((each) => part.name.includes(each)));
const ACCEPTED_FIRST = "NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED";

// ---------------------------------------------------------------- the recipes

// guards: UC-007
// given: the product above, whose files hold three use cases — UC-001 accepted, UC-002 open, UC-003 changed — and a module
//        file, which is no use case
// input: the recipe use-cases, with the job's context and no parameter
// expect: three parts, one per use case file and none for the module file or the SPEC, in the order the files stand: each
//         part's name holds its file's path and its status, its text is the whole file, and it carries one artifact — the
//         use case's identifier and the key of the use-case format, its title
test("use-cases — one part per use case of the product, with its status, carrying the use case as an artifact keyed by its title", async () => {
  const parts = await approvalStrategies.recipes["use-cases"](contextOf(), {});

  const expected = [[UC1_PATH, "accepted", UC1, "UC-001", "Read a file"], [UC2_PATH, "open", UC2, "UC-002", "Write a file"],
    [UC3_PATH, "changed", UC3, "UC-003", "Delete a file"]];
  assert.equal(parts.length, 3);
  expected.forEach(([path, status, body, id, title], at) => {
    const name = parts[at].name;
    assert.ok(name.includes(path) && name.includes(status), `${name} holds ${path} and ${status}`);
    assert.equal(parts[at].text, body);
    assert.deepEqual(parts[at].artifacts, [{ id, keys: [title] }]);
  });
});

// guards: A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS; NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY; UC-019
// given: the same product; the use case UC-001 named by the parameter useCase, which realises A SAMPLE RULE and ANOTHER SAMPLE
//        RULE — and not AN UNREALISED RULE —, and then UC-002, which realises ANOTHER SAMPLE RULE alone; and a parameter that
//        names UC-099, which is no use case of the product
// input: the recipe use-case-with-neighbours, with each of the three
// expect: for UC-001: first the use case's own part — its file's path, its status and its whole text —, then one part for each
//         requirement it realises, in the order it names them, each named by the requirement and holding its rule and its
//         check as the SPEC states them, and then one part for each of the other two use cases, in the order the files stand,
//         none left out and UC-001 not twice; for UC-002: its own part, ANOTHER SAMPLE RULE, then UC-001 and UC-003; for
//         UC-099: the failure UseCaseNotFound, naming it
test("use-case-with-neighbours — the use case, the requirements it realises with their texts from the SPEC, and every other use case", async () => {
  const recipe = approvalStrategies.recipes["use-case-with-neighbours"];

  const first = await recipe(contextOf({ useCase: "UC-001" }), { useCase: "UC-001" });
  assert.deepEqual(order(first), [UC1_PATH, "A SAMPLE RULE", "ANOTHER SAMPLE RULE", UC2_PATH, UC3_PATH]);
  assert.ok(first[0].name.includes("accepted"), first[0].name);
  assert.equal(first[0].text, UC1);
  for (const at of [1, 2]) {
    const name = first[at].name;
    const held = first[at].text;
    assert.ok(held.includes(REQUIREMENT_TEXTS[name]) && held.includes(CHECKS[name]), `${name}: ${held}`);
  }
  assert.deepEqual([first[3].text, first[4].text], [UC2, UC3]);
  assert.ok(first[3].name.includes("open") && first[4].name.includes("changed"), `${first[3].name}; ${first[4].name}`);

  const second = await recipe(contextOf({ useCase: "UC-002" }), { useCase: "UC-002" });
  assert.deepEqual(order(second), [UC2_PATH, "ANOTHER SAMPLE RULE", UC1_PATH, UC3_PATH]);

  await assert.rejects(recipe(contextOf({ useCase: "UC-099" }), { useCase: "UC-099" }),
    (error) => error.name === "UseCaseNotFound" && error.message.includes("UC-099"));
});

// ---------------------------------------------------------------- the precondition

// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-007
// given: the product above; a selection that names the requirements A SAMPLE RULE, which the SPEC holds, and A PROPOSED RULE,
//        which it does not — it stands in an open queue at best —, and the use cases UC-001, which is accepted, UC-002, which
//        is open, UC-003, which is changed, and UC-099, which is no use case of the product
// input: the precondition rests-on-accepted, with the job's context
// expect: one finding, an error under NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED in one line, that names A PROPOSED RULE,
//         UC-002, UC-003 and UC-099 — and neither A SAMPLE RULE nor UC-001, which are accepted
test("rests-on-accepted — a requirement the SPEC lacks and a use case that is open, changed or none are named by one error", async () => {
  const selection = { requirements: ["A SAMPLE RULE", "A PROPOSED RULE"], useCases: ["UC-001", "UC-002", "UC-003", "UC-099"] };

  const found = await approvalStrategies.preconditions["rests-on-accepted"](contextOf(selection));

  assert.equal(found.kind, "error");
  assert.equal(found.rule, ACCEPTED_FIRST);
  assert.ok(Number.isInteger(found.line) && found.line >= 1);
  const words = `${found.artifact}: ${found.what} ${found.fix}`;
  for (const [name, expected] of [["A PROPOSED RULE", true], ["UC-002", true], ["UC-003", true], ["UC-099", true],
    ["A SAMPLE RULE", false], ["UC-001", false]]) {
    assert.equal(found.what.includes(name), expected, `${name} is ${expected ? "" : "not "}named in: ${words}`);
  }
  for (const own of [found.what, found.fix]) assert.match(own, /^[^\n]+$/);
});

// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-007
// given: the product above; the open selection of the test before, as the known positive; then a selection of accepted
//        artifacts only — the requirements A SAMPLE RULE and ANOTHER SAMPLE RULE and the use case UC-001 —; then a job that
//        names no selection at all
// input: the precondition rests-on-accepted, with the job's context for each
// expect: the open selection gives a finding; the accepted selection gives none (null); so does the job without a selection
test("rests-on-accepted — a selection of accepted requirements and use cases passes, and so does a job without a selection", async () => {
  const rests = approvalStrategies.preconditions["rests-on-accepted"];
  assert.notEqual(await rests(contextOf({ requirements: ["A SAMPLE RULE"], useCases: ["UC-002"] })), null,
    "known positive: an open use case in the selection is found");

  assert.equal(await rests(contextOf({ requirements: ["A SAMPLE RULE", "ANOTHER SAMPLE RULE"], useCases: ["UC-001"] })), null);
  assert.equal(await rests(contextOf({})), null);
});
