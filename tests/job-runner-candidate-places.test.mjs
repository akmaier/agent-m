// The built-in check candidate-places — MOD-job-runner's correction loop with a kind that names it, as the accepted text of
// docs/architecture/MOD-job-runner.md states it under Data (Built-in strategies): "the place of every drafted candidate its drafter classed
// `new` that names one — a MOD-group-document `Place` —, all applied together with `placeItems` to `docs/groups/requirements.md` read from
// the product's snapshot, the empty tree where it has none: an error under `AN ITEM HAS ONE PLACE IN ITS HIERARCHY` for each place
// `placeItems` does not apply because its group, or the group a new group is to stand in, is not in the hierarchy, on the candidate's
// artifact and line as `requirement-form` gives them, its `what` naming the requirement and the group, its `fix` asking for a group the
// hierarchy holds or for that group proposed as new with the group it stands in (UC-019 step 7). A candidate without a place, and every
// other class, is not judged". For UC-005 step 6.3, UC-019 step 7.
// Run: node --test tests/job-runner-candidate-places.test.mjs
//
// Module: MOD-job-runner
// Guards: UC-005; UC-019; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// Level: unit
//
// The kind is this file's own, naming the check alone together with requirement-form, so that the artifact and line of a finding can be
// compared with those requirement-form gives the same candidate; a person reviews its result, so runJob returns it and writes nothing.
// The product's snapshot holds the group file a test sets. The driver answers from a list and keeps every input it was sent. Each test
// states its input and its expected result before it runs (given / input / expect); where a test asserts a finding, the same draft with a
// place the hierarchy holds is first shown to pass. Nothing reaches the network. The counter-proofs are recorded in the commit of the red tests.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };
const PLACE = { type: "object", required: ["group"], properties: { group: { type: "array", items: { type: "string" } }, new: { type: "string" } } };
const CANDIDATES = { type: "object", required: ["candidates"], properties: { candidates: { type: "array", items: { type: "object",
  required: ["name", "rule", "check", "class"], properties: { name: { type: "string" }, rule: { type: "string" }, check: { type: "string" },
    class: { type: "string" }, of: { type: "string" }, place: PLACE } } } } };
const KIND = { name: "fixture-places", serves: [], participant: "one", needs: ["draft text"], resources: "none",
  preconditions: [], recipes: [], checks: ["requirement-form", "candidate-places"], personDecides: [], reviewer: null, reviewers: 0, steps: [],
  gatePoints: [], review: "person", writer: "return-draft", limit: 1, purpose: "Derives requirements, for a test.",
  prompt: "Derive.", answer: CANDIDATES };
const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
const snapshotOf = (files) => ({ repository: REPOSITORY, ref: "main", commit: null, paths: Object.keys(files).sort(),
  read: async (path) => (path in files ? files[path] : null), blob: (path) => (path in files ? files[path] : null) });
const contextOf = (files) => ({ kind: KIND, params: { source: "SRC-policy" },
  product: { address: REPOSITORY.web, snapshot: snapshotOf(files), host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER],
  places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-11-08T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });
const JOB = { kind: KIND, params: {}, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true,
  notFitting: [], leftOut: [], blocking: [], limit: 1 };
function driver(answers) {
  const inputs = [];
  return { participant: DRAFTER, inputs, async send(input) {
    inputs.push(input);
    const next = answers.shift();
    return { text: JSON.stringify(next), usage: null };
  } };
}
const run = (draft, files) => runJob(JOB, { drafter: driver([{ draft, answers: [] }]), reviewers: [] }, { attended: true, context: contextOf(files) });
const placesOf = (result) => (result.rounds.at(-1)?.findings ?? []).filter((found) => found.rule === "AN ITEM HAS ONE PLACE IN ITS HIERARCHY");

const GROUPS = ["# Requirements — groups", "", "The hierarchy of the requirements, each member by its name.", "",
  "- 3. Requirements", "  - EXPORT AS CSV", "  - Formats", "    - EXPORT AS PDF", ""].join("\n");
const FILES = { "docs/groups/requirements.md": GROUPS };
const candidate = (name, place, extra = {}) => ({ name, rule: `${name.toLowerCase()} holds.`, check: "`tests/a.test.mjs`", class: "new", ...(place && { place }), ...extra });

// TST-2026110875 · level: unit · module: MOD-job-runner
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; UC-019
// given: the product's group file holding "3. Requirements" with the group Formats; known positive: a new candidate placed in ["3. Requirements", "Formats"], one placed in a new group "Export" standing in ["3. Requirements"], one at the top level and one without a place pass the check
// input: run a job of a kind naming requirement-form and candidate-places on a draft whose new candidate EXPORT HAS A TITLE PAGE is placed in ["Export"], which the hierarchy does not hold
// expect: one error under AN ITEM HAS ONE PLACE IN ITS HIERARCHY on the candidate's artifact and line — those requirement-form gives the same candidate, here its warning of the rule's "and" —, its what naming EXPORT HAS A TITLE PAGE and "Export" and saying the hierarchy does not hold it, its fix asking to name a group the hierarchy holds or to propose "Export" as a new group with the group it stands in
test("TST-2026110875: candidate-places — a new candidate placed in a group the hierarchy does not hold is an error on its artifact and line", async () => {
  const fine = await run({ candidates: [candidate("EXPORT AS XML", { group: ["3. Requirements", "Formats"] }), candidate("EXPORT HAS A TITLE PAGE", { group: ["3. Requirements"], new: "Export" }),
    candidate("A RULE AT THE TOP", { group: [] }), candidate("A RULE WITHOUT A PLACE", null)] }, FILES);
  assert.deepEqual(placesOf(fine), [], "known positive: places the hierarchy holds, or proposes as new, pass");
  const result = await run({ candidates: [candidate("A FIRST RULE", null), candidate("EXPORT HAS A TITLE PAGE", { group: ["Export"] }, { rule: "A title page stands first and names the export." })] }, FILES);
  const found = placesOf(result);
  assert.equal(found.length, 1, found.map(formatFinding).join("\n"));
  const [error] = found;
  const form = result.rounds.at(-1).findings.find((each) => each.rule === "ONE STATEMENT PER REQUIREMENT");
  assert.ok(form, "known positive: requirement-form finds the rule's \"and\" on the same candidate");
  assert.deepEqual([error.kind, error.artifact, error.line], ["error", form.artifact, form.line]);
  assert.match(error.what, /EXPORT HAS A TITLE PAGE/);
  assert.match(error.what, /"Export"/);
  assert.match(error.what, /hierarchy does not hold/);
  assert.match(error.fix, /group it holds/);
  assert.match(error.fix, /propose "Export" as a new group with the group it stands in/);
});

// TST-2026110876 · level: unit · module: MOD-job-runner
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; UC-005
// given: a product without docs/groups/requirements.md — the empty tree —; known positive: a new candidate in a new group "Export" at the top level passes there
// input: run the job on a draft whose new candidate A NEW RULE is placed in a new group "Export" at the top level, A SECOND RULE in ["Export"], the new group the first candidate proposes, A CHANGED RULE is classed change of EXPORT AS CSV with the place ["Nowhere"], and A THIRD RULE is placed in a new group "Derivation" standing in ["Requirements"]
// expect: one error, on A THIRD RULE, naming "Requirements", the group its new group is to stand in; A SECOND RULE passes, since the places are applied together and "Export" is proposed before it; the change's place is not judged
test("TST-2026110876: candidate-places — on the empty tree a new group's own group is judged, the places applied together, and another class is not judged", async () => {
  const fine = await run({ candidates: [candidate("A NEW RULE", { group: [], new: "Export" })] }, {});
  assert.deepEqual(placesOf(fine), [], "known positive: a new group at the top of the empty tree passes");
  const result = await run({ candidates: [candidate("A NEW RULE", { group: [], new: "Export" }), candidate("A SECOND RULE", { group: ["Export"] }),
    candidate("A CHANGED RULE", { group: ["Nowhere"] }, { class: "change", of: "EXPORT AS CSV" }), candidate("A THIRD RULE", { group: ["Requirements"], new: "Derivation" })] }, {});
  const found = placesOf(result);
  assert.equal(found.length, 1, found.map(formatFinding).join("\n"));
  assert.equal(found[0].artifact, "A THIRD RULE");
  assert.match(found[0].what, /"Requirements"/);
});
