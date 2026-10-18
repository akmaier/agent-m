// The strategies of use cases — MOD-approvals' approvalStrategies, as the accepted text of docs/architecture/MOD-approvals.md
// states them under Interfaces: the recipe use-cases, every use case of the product with its status, one part per file, each
// carrying its use case as an artifact keyed by the key of its format; the recipe use-case-with-neighbours, the use case the
// job's parameters name, every requirement it realises with its text from the SPEC, and every other use case; and the
// precondition rests-on-accepted for requirements and use cases, an error finding that names every one of the job's selection
// that is not accepted. The recipes accepted-use-cases, the precondition architecture-ready are not part of this item (ITM-332).
// The recipe whole-architecture — every architecture decision and module file, one part per file, carrying its file as an artifact
// keyed by the key of its format — and the architecture's part of rests-on-accepted are ITM-724's, below: the module file names no
// parameter that asks for the architecture, so this file takes the reading of the item, the parameter `architecture: true`.
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
import { kindOf } from "../src/job-catalogue/index.mjs";
import { prepareJob, registerStrategies } from "../src/job-runner/index.mjs";

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

// TST-472022 · level: unit · module: MOD-approvals
// guards: UC-007
// given: the product above, whose files hold three use cases — UC-001 accepted, UC-002 open, UC-003 changed — and a module file, which is no use case
// input: the recipe use-cases, with the job's context and no parameter
// expect: three parts, one per use case file and none for the module file or the SPEC, in the order the files stand: each part's name holds its file's path and its status, its text is the whole file, and it carries one artifact — the use case's identifier and the key of the use-case format, its title
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

// TST-472023 · level: unit · module: MOD-approvals
// guards: A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS; NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY; UC-019
// given: the same product; the use case UC-001 named by the parameter useCase, which realises A SAMPLE RULE and ANOTHER SAMPLE RULE — and not AN UNREALISED RULE —, and then UC-002, which realises ANOTHER SAMPLE RULE alone; and a parameter that names UC-099, which is no use case of the product
// input: the recipe use-case-with-neighbours, with each of the three
// expect: for UC-001: first the use case's own part — its file's path, its status and its whole text —, then one part for each requirement it realises, in the order it names them, each named by the requirement and holding its rule and its check as the SPEC states them, and then one part for each of the other two use cases, in the order the files stand, none left out and UC-001 not twice; for UC-002: its own part, ANOTHER SAMPLE RULE, then UC-001 and UC-003; for UC-099: the failure UseCaseNotFound, naming it
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

// TST-472024 · level: unit · module: MOD-approvals
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-007
// given: the product above; a selection that names the requirements A SAMPLE RULE, which the SPEC holds, and A PROPOSED RULE, which it does not — it stands in an open queue at best —, and the use cases UC-001, which is accepted, UC-002, which is open, UC-003, which is changed, and UC-099, which is no use case of the product
// input: the precondition rests-on-accepted, with the job's context
// expect: one finding, an error under NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED in one line, that names A PROPOSED RULE, UC-002, UC-003 and UC-099 — and neither A SAMPLE RULE nor UC-001, which are accepted
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

// TST-472025 · level: unit · module: MOD-approvals
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-007
// given: the product above; the open selection of the test before, as the known positive; then a selection of accepted artifacts only — the requirements A SAMPLE RULE and ANOTHER SAMPLE RULE and the use case UC-001 —; then a job that names no selection at all
// input: the precondition rests-on-accepted, with the job's context for each
// expect: the open selection gives a finding; the accepted selection gives none (null); so does the job without a selection
test("rests-on-accepted — a selection of accepted requirements and use cases passes, and so does a job without a selection", async () => {
  const rests = approvalStrategies.preconditions["rests-on-accepted"];
  assert.notEqual(await rests(contextOf({ requirements: ["A SAMPLE RULE"], useCases: ["UC-002"] })), null,
    "known positive: an open use case in the selection is found");

  assert.equal(await rests(contextOf({ requirements: ["A SAMPLE RULE", "ANOTHER SAMPLE RULE"], useCases: ["UC-001"] })), null);
  assert.equal(await rests(contextOf({})), null);
});

// ---------------------------------------------------------------- the architecture (ITM-724)

// The same product with an architecture: two decisions, ARC-001 whose current text a record names (accepted) and ARC-002 that no record
// names (open); and three module files, MOD-alpha accepted, MOD-beta whose record names an earlier text (changed), and MOD-sample of the
// product above (open). The paths stand in this order; ARC_OPEN_PARTS is the order the parts are expected in.
const decision = (id, title) => text("---", `id: ${id}`, `title: ${title}`, "forced_by:", "  - UC-001", "---", `# ${id} ${title}`);
const moduleFile = (id, title) => text("---", `id: ${id}`, `title: ${title}`, "folder: src/x/", "---", `# ${id} ${title}`);
const ARC1_PATH = "docs/architecture/ARC-001-the-system.md", ARC1 = decision("ARC-001", "The system");
const ARC2_PATH = "docs/architecture/ARC-002-the-storage.md", ARC2 = decision("ARC-002", "The storage");
const ALPHA_PATH = "docs/architecture/MOD-alpha.md", ALPHA = moduleFile("MOD-alpha", "Alpha");
const BETA_PATH = "docs/architecture/MOD-beta.md", BETA = moduleFile("MOD-beta", "Beta"), BETA_EARLIER = moduleFile("MOD-beta", "Beta before");
const ARCHITECTURE_PATHS = [ARC1_PATH, ARC2_PATH, ALPHA_PATH, BETA_PATH, MODULE_PATH];
const ARCHITECTURE_FILES = { ...FILES, [ARC1_PATH]: ARC1, [ARC2_PATH]: ARC2, [ALPHA_PATH]: ALPHA, [BETA_PATH]: BETA,
  ...Object.fromEntries([record("ARC-001", "architecture-decision", ARC1_PATH, ARC1), record("MOD-alpha", "module", ALPHA_PATH, ALPHA),
    record("MOD-beta", "module", BETA_PATH, BETA_EARLIER)]) };
const snapshotOf = (files) => ({ ...SNAPSHOT, paths: Object.keys(files), read: async (path) => (path in files ? files[path] : null),
  blob: (path) => (path in files ? blobOf(files[path]) : null) });
const architectureContext = (params = {}, files = ARCHITECTURE_FILES) =>
  ({ params, product: { address: ADDRESS, snapshot: snapshotOf(files), host: null } });
// The files not accepted, and the files accepted.
const NOT_ACCEPTED_PATHS = [ARC2_PATH, BETA_PATH, MODULE_PATH], ACCEPTED_PATHS = [ARC1_PATH, ALPHA_PATH];

// TST-724001 · level: unit · module: MOD-approvals
// guards: THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT; NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY; UC-023
// given: the product above, whose files hold two decisions (one accepted, one open), three module files (accepted, changed, open), three use cases and a SPEC
// input: the recipe whole-architecture, with the job's context and no parameter
// expect: five parts, one per decision and module file and none for a use case, the SPEC or a record, in the order the files stand: each part's name holds its file's path and its status, its text is the whole file, and it carries one artifact — the identifier and the key of its format (a decision's title, a module's identifier)
test("whole-architecture — one part per decision and module file, with its status, carrying the file as an artifact keyed by its format", async () => {
  const parts = await approvalStrategies.recipes["whole-architecture"](architectureContext(), {});

  const expected = [[ARC1_PATH, "accepted", ARC1, "ARC-001", "The system"], [ARC2_PATH, "open", ARC2, "ARC-002", "The storage"],
    [ALPHA_PATH, "accepted", ALPHA, "MOD-alpha", "MOD-alpha"], [BETA_PATH, "changed", BETA, "MOD-beta", "MOD-beta"],
    [MODULE_PATH, "open", MODULE, "MOD-sample", "MOD-sample"]];
  assert.equal(parts.length, 5);
  expected.forEach(([path, status, body, id, key], at) => {
    const name = parts[at].name;
    assert.ok(name.includes(path) && name.includes(status), `${name} holds ${path} and ${status}`);
    assert.equal(parts[at].text, body);
    assert.deepEqual(parts[at].artifacts, [{ id, keys: [key] }]);
  });
});

// TST-724002 · level: unit · module: MOD-approvals
// guards: THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT; UC-023
// given: the use-case-only product of the tests above, which holds a module file but no decision, and a product without any architecture file
// input: the recipe whole-architecture for each
// expect: the first gives its one module file as one part; the second gives no part (an empty list), not a failure
test("whole-architecture — a product with no decision gives only its module files, and one with no architecture file gives none", async () => {
  const recipe = approvalStrategies.recipes["whole-architecture"];

  assert.deepEqual((await recipe(contextOf(), {})).map((each) => each.text), [MODULE]);

  const bare = Object.fromEntries(Object.entries(FILES).filter(([path]) => path !== MODULE_PATH));
  assert.deepEqual(await recipe(architectureContext({}, bare), {}), []);
});

// TST-724003 · level: unit · module: MOD-approvals
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES; UC-023
// given: the architecture product above; the parameter architecture: true
// input: the precondition rests-on-accepted, with the job's context
// expect: one finding, an error under NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED in one line, that names by path the open decision, the changed module file and the open module file — and neither accepted file
test("rests-on-accepted — asked for the architecture, an open and a changed file of it are named and the accepted ones are not", async () => {
  const found = await approvalStrategies.preconditions["rests-on-accepted"](architectureContext({ architecture: true }));

  assert.equal(found.kind, "error");
  assert.equal(found.rule, ACCEPTED_FIRST);
  assert.ok(Number.isInteger(found.line) && found.line >= 1);
  for (const path of NOT_ACCEPTED_PATHS) assert.ok(found.what.includes(path), `${path} is named in: ${found.what}`);
  for (const path of ACCEPTED_PATHS) assert.ok(!found.what.includes(path), `${path} is not named in: ${found.what}`);
  for (const own of [found.what, found.fix]) assert.match(own, /^[^\n]+$/);
});

// TST-724004 · level: unit · module: MOD-approvals
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-023
// given: the architecture product above, with the files not accepted; the known positive of the test before; then the parameter architecture absent, false, and a selection of accepted requirements and use cases only; then an architecture all of whose files are accepted, with architecture: true
// input: the precondition rests-on-accepted, with the job's context for each
// expect: the known positive gives a finding; without the parameter or with false it gives none (null), the architecture is not asked; with every file accepted it gives none
test("rests-on-accepted — nothing of the architecture is named when it is not asked for, and nothing when all of it is accepted", async () => {
  const rests = approvalStrategies.preconditions["rests-on-accepted"];
  assert.notEqual(await rests(architectureContext({ architecture: true })), null, "known positive: files not accepted are found when asked");

  assert.equal(await rests(architectureContext({})), null);
  assert.equal(await rests(architectureContext({ architecture: false })), null);
  assert.equal(await rests(architectureContext({ requirements: ["A SAMPLE RULE"], useCases: ["UC-001"] })), null);

  const accepted = { [ARC1_PATH]: ARC1, [ALPHA_PATH]: ALPHA, ...Object.fromEntries([record("ARC-001", "architecture-decision", ARC1_PATH, ARC1),
    record("MOD-alpha", "module", ALPHA_PATH, ALPHA)]) };
  assert.equal(await rests(architectureContext({ architecture: true }, { ...FILES, ...accepted, ...Object.fromEntries([
    record("MOD-sample", "module", MODULE_PATH, MODULE)]) })), null);
});

// TST-724005 · level: unit · module: MOD-approvals
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-023
// given: the architecture product above; the selection of TST-472024 (A PROPOSED RULE, UC-002, UC-003, UC-099 not accepted; A SAMPLE RULE and UC-001 accepted), with and without architecture: true
// input: the precondition rests-on-accepted, with the job's context for each
// expect: without the parameter the finding names exactly what TST-472024 expects and none of the architecture's paths; with it, the same finding names those and, in the same finding, the three files not accepted
test("rests-on-accepted — the findings for requirements and use cases stay as they are beside the architecture's", async () => {
  const rests = approvalStrategies.preconditions["rests-on-accepted"];
  const selection = { requirements: ["A SAMPLE RULE", "A PROPOSED RULE"], useCases: ["UC-001", "UC-002", "UC-003", "UC-099"] };

  const plain = await rests(architectureContext(selection));
  const asked = await rests(architectureContext({ ...selection, architecture: true }));

  for (const found of [plain, asked]) {
    for (const [name, expected] of [["A PROPOSED RULE", true], ["UC-002", true], ["UC-003", true], ["UC-099", true],
      ["A SAMPLE RULE", false], ["UC-001", false]]) assert.equal(found.what.includes(name), expected, `${name}: ${found.what}`);
  }
  for (const path of ARCHITECTURE_PATHS) assert.equal(plain.what.includes(path), false, `${path} in: ${plain.what}`);
  for (const path of NOT_ACCEPTED_PATHS) assert.ok(asked.what.includes(path), `${path} in: ${asked.what}`);
  for (const path of ACCEPTED_PATHS) assert.ok(!asked.what.includes(path), `${path} in: ${asked.what}`);
});

// ---------------------------------------------------------------- the job runner

// The strategies change-architecture names besides this module's: stand-ins, each skipped where a module registered the name.
const OWNER = "tests/approvals-strategies.test.mjs";
const part = (name, body) => ({ name, text: body, sources: [], required: true, size: 0 });
const STAND_INS = {
  recipes: { "whole-spec": async () => [part("SPEC.md", SPEC)], "chapters-for-architecture": async () => [part("chapters 9 to 12", "B")] },
  checks: Object.fromEntries(["document-schema", "graph-checks", "candidate-classes"].map((name) => [name, () => []])),
  steps: { "due-diligence": async (draft) => ({ draft, findings: [] }) },
  writers: { "open-files": async () => ({ commits: [], files: [], pullRequest: null, shown: null }) },
};
const register = (category, name, strategy) => {
  try {
    registerStrategies(OWNER, { [category]: { [name]: strategy } });
  } catch (error) {
    if (error.name !== "DuplicateStrategy") throw error;
  }
};
for (const [category, strategies] of Object.entries(STAND_INS)) {
  for (const [name, strategy] of Object.entries(strategies)) register(category, name, strategy);
}
const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text", "read the repository"], place: "this machine", route: "bridge lab-pc agent claude" };
const jobContextOf = (kind, params) => ({ kind, params, ...architectureContext(params),
  instance: { snapshot: null, host: null }, connect: async () => { throw new Error("no repository is opened here"); },
  participants: [DRAFTER], places: { sources: {}, mailbox: null }, gates: [], person: "alice",
  now: new Date("2026-10-11T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });

// TST-724006 · level: unit · module: MOD-approvals
// guards: THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT; NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY; UC-023
// given: the kind change-architecture, whose recipes name use-cases and whole-architecture and whose precondition is rests-on-accepted; this module's strategies registered, stand-ins for the strategies of other modules; the architecture product above
// input: prepareJob("change-architecture", context, { drafter, reviewers: [] }), with architecture: true and without a parameter
// expect: it does not throw UnknownStrategy; the parts of the recipe whole-architecture are the five files, none left out; with architecture: true the job is blocked by one finding naming the files not accepted, without it nothing blocks
test("prepareJob — change-architecture finds every strategy it names, and its whole-architecture parts are every architecture file", async () => {
  register("recipes", "use-cases", approvalStrategies?.recipes?.["use-cases"]);
  register("recipes", "whole-architecture", approvalStrategies?.recipes?.["whole-architecture"]);
  register("preconditions", "rests-on-accepted", approvalStrategies?.preconditions?.["rests-on-accepted"]);
  const kind = await kindOf("change-architecture");

  const free = await prepareJob("change-architecture", jobContextOf(kind, {}), { drafter: DRAFTER, reviewers: [] });
  const whole = free.parts.filter((each) => each.recipe === "whole-architecture");
  assert.deepEqual(whole.map((each) => each.text), [ARC1, ARC2, ALPHA, BETA, MODULE]);
  assert.deepEqual(free.blocking, []);

  const asked = await prepareJob("change-architecture", jobContextOf(kind, { architecture: true }), { drafter: DRAFTER, reviewers: [] });
  assert.equal(asked.blocking.length, 1);
  for (const path of NOT_ACCEPTED_PATHS) assert.ok(asked.blocking[0].what.includes(path), `${path} in: ${asked.blocking[0].what}`);
});
