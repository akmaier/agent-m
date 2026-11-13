// A drafting job receives the form its draft is checked by — MOD-job-runner's `form`, as docs/architecture/MOD-job-runner.md states it: "Beside `rules`, the
// runner builds one part of its own, the job's `form`: the definitions its kind's built-in checks of form judge a draft by, chosen from the kind's `checks`
// and from nothing else … `requirement-form` → MOD-spec-document's `requirementForm` of Agent M's `SPEC.md`, read from the instance's snapshot …;
// `document-schema` → MOD-documents' `artifactSchemaTexts` … A kind that names both gets both, in this order; a kind that names neither has no form, `null`. The
// form is given as its text on every route … Its text is the heading `## The form your draft is checked by`, then each piece under a heading of its own —
// `### The form of a requirement`, `### <the schema's path>` —, each piece byte for byte as its module gives it. It carries no source"; DriverInput: "the
// prepared job's `rules` … followed by a blank line —, then, for the drafter, the job's `form` where it has one, followed by a blank line, then the kind's
// prompt"; Destination: "`size` is the kind's prompt, the job's `rules`, for the drafter its `form`, and every part it receives"; Prepared: "`blocking` … and
// `requirement-form` where the instance's `SPEC.md` lacks a piece of the form (`FormMissing`), as an error under `A DRAFTING JOB RECEIVES THE FORM ITS DRAFT
// IS CHECKED BY` naming what it lacks".
// Run: node --test tests/job-runner-form.test.mjs
//
// Module: MOD-job-runner
// Guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// Level: unit
//
// The instance and the product are fixtures in memory; the instance's SPEC.md is Agent M's own, read from this repository, and the product's another text
// with a paragraph of its own. Every strategy a kind names that no module of this file registers is a stand-in that gives nothing. What a model receives is
// what a driver sends, driverPrompt of its input; a recording driver keeps it and stops the job. Each test states its input and its expected result before
// it runs (given / input / expect). Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { driverPrompt, estimate, prepareJob, registerStrategies, runJob } from "../src/job-runner/index.mjs";
import { kindNames, kindOf } from "../src/job-catalogue/index.mjs";
import { requirementForm } from "../src/spec-document/index.mjs";
import { artifactSchemaTexts } from "../src/documents/index.mjs";

const RULE = "A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY";
const AGENT_M_SPEC = readFileSync(new URL("../SPEC.md", import.meta.url), "utf8");
const PRODUCT_SPEC = "# Fixture product — Specification\n\n**Form of a requirement:** PRODUCT-FORM-TEXT.\n\n## 1. One\n";
const RULES = "# AGENTS.md of the fixture instance\n\nINSTANCE-RULES-TEXT.\n";
const COMMIT = "a".repeat(40);

const empty = { recipes: async () => [], preconditions: async () => null, checks: () => [], steps: async (draft) => ({ draft, findings: [] }),
  writers: async () => ({ commits: [], files: [], pullRequest: null, shown: null, notes: [] }) };
for (const name of await kindNames()) {
  const kind = await kindOf(name);
  const named = { preconditions: kind.preconditions, recipes: kind.recipes.map((recipe) => recipe.name), checks: kind.checks, steps: kind.steps, writers: [kind.writer] };
  for (const [category, list] of Object.entries(named)) for (const strategy of list) {
    try { registerStrategies("tests/job-runner-form.test.mjs", { [category]: { [strategy]: empty[category] } }); }
    catch (error) { if (error.name !== "DuplicateStrategy") throw error; }
  }
}

const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "model-a", context: 10000000, price: null,
  capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools", "reach the web"],
  place: "this machine", route: "endpoint e1" };
const REVIEWER = { ...DRAFTER, name: "reviewer-b", model: "model-b", route: "endpoint e2" };
const snapshotOf = (path, files) => ({ repository: { server: "github", origin: "https://github.com", path, web: `https://github.com/${path}` },
  ref: "main", commit: COMMIT, paths: Object.keys(files), read: async (name) => files[name] ?? null, blob: () => null });
const contextOf = (instanceFiles = { "AGENTS.md": RULES, "SPEC.md": AGENT_M_SPEC }, checkout = null) => {
  const instance = snapshotOf("alice/instance", instanceFiles), product = snapshotOf("alice/product", { "SPEC.md": PRODUCT_SPEC });
  return { kind: null, params: {}, product: { address: product.repository.web, snapshot: product, host: null }, instance: { snapshot: instance, host: null, checkout },
    connect: async () => null, participants: [DRAFTER, REVIEWER], places: { sources: {}, mailbox: null }, gates: [], person: "alice",
    now: new Date("2026-11-08T08:00:00Z"), agentM: { version: "unreleased", commit: COMMIT }, jobId: null };
};
const REQUIREMENT_PIECE = `### The form of a requirement\n\n${requirementForm(AGENT_M_SPEC)}`;
const SCHEMA_PIECES = artifactSchemaTexts().map(({ path, text }) => `### ${path}\n\n${text}`);
const formText = (pieces) => ["## The form your draft is checked by", ...pieces].join("\n\n");

const recorder = (participant, sent) => ({ participant, send: async (input) => {
  sent.push(driverPrompt(input));
  throw Object.assign(new Error("recorded"), { name: "Recorded" });
} });
async function sentBy(prepared, context, reviewers = []) {
  const sent = [];
  try {
    await runJob({ ...prepared, blocking: [], notFitting: [] }, { drafter: recorder(DRAFTER, sent), reviewers: reviewers.map((each) => recorder(each, sent)) },
      { attended: true, context });
  } catch (error) {
    if (error.name !== "Recorded") throw error;
  }
  return sent;
}

// TST-1792060 · level: unit · module: MOD-job-runner
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: the fixture instance, whose SPEC.md is Agent M's own; kinds whose checks name requirement-form (derive-requirements, change-requirements), document-schema (derive-use-cases, change-use-case, derive-architecture, change-architecture, converse), and neither (propose-groups, review-architecture)
// input: prepareJob of each with a drafter; the prepared `form`
// expect: requirement-form gives the heading, then "### The form of a requirement" and requirementForm of the instance's SPEC.md; document-schema the heading, then each schema under "### <its path>" with its text; neither gives null; the form carries no source, and no job is blocked under the rule
test("prepareJob — the job's form is chosen from the kind's checks and given in full", async () => {
  const expected = { "derive-requirements": formText([REQUIREMENT_PIECE]), "change-requirements": formText([REQUIREMENT_PIECE]),
    "derive-use-cases": formText(SCHEMA_PIECES), "change-use-case": formText(SCHEMA_PIECES), "derive-architecture": formText(SCHEMA_PIECES),
    "change-architecture": formText(SCHEMA_PIECES), converse: formText(SCHEMA_PIECES), "propose-groups": null, "review-architecture": null };
  assert.ok(REQUIREMENT_PIECE.includes("**Form of a requirement:**") && SCHEMA_PIECES.length === 4, "known positive: both pieces are there to give");
  for (const [kind, text] of Object.entries(expected)) {
    const prepared = await prepareJob(kind, contextOf(), { drafter: DRAFTER, reviewers: [] });
    assert.equal(prepared.form?.text ?? null, text, kind);
    if (text !== null) assert.deepEqual(prepared.form.sources, [], kind);
    assert.deepEqual(prepared.blocking.filter((f) => f.rule === RULE), [], kind);
  }
});

// TST-1792061 · level: unit · module: MOD-job-runner
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: a job of derive-requirements, and one of derive-architecture with a reviewer, prepared for the fixture instance
// input: the text the drafter's driver sends, and the reviewer's (for derive-architecture, started from a draft so that only the reviewer is asked)
// expect: the drafter's text is the instance's AGENTS.md, a blank line, the form, a blank line, then the kind's prompt; the reviewer's holds no form
test("runJob — the drafter's input gives the form after AGENTS.md and before the prompt; a reviewer's holds none", async () => {
  const context = contextOf();
  const prepared = await prepareJob("derive-requirements", context, { drafter: DRAFTER, reviewers: [] });
  const [sent] = await sentBy(prepared, context);
  assert.ok(sent.startsWith(`${RULES}\n\n${prepared.form.text}\n\n${prepared.kind.prompt.slice(0, 40)}`), sent.slice(0, 200));

  const architecture = await prepareJob("derive-architecture", context, { drafter: null, reviewers: [REVIEWER] });
  const reviewerSent = [];
  await runJob({ ...architecture, blocking: [], notFitting: [] }, { drafter: null, reviewers: [recorder(REVIEWER, reviewerSent)] },
    { attended: true, context, from: { files: [] } }).catch((error) => { if (error.name !== "Recorded") throw error; });
  assert.equal(reviewerSent.length, 1, "known positive: the reviewer was asked");
  assert.ok(reviewerSent[0].startsWith(RULES), "the reviewer's input begins with AGENTS.md");
  assert.ok(!reviewerSent[0].includes("## The form your draft is checked by"), "a reviewer receives no form");
});

// TST-1792062 · level: unit · module: MOD-job-runner
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: a job of derive-use-cases with a drafter and a reviewer-less kind
// input: the drafter's destination size
// expect: the kind's prompt, the rules, the form and every part, each estimated as a part's size is
test("prepareJob — the form is counted in the drafter's size", async () => {
  const prepared = await prepareJob("derive-use-cases", contextOf(), { drafter: DRAFTER, reviewers: [] });
  const [drafter] = prepared.destinations;
  assert.equal(prepared.form.size, estimate(prepared.form.text));
  assert.equal(drafter.size, estimate(prepared.kind.prompt) + prepared.rules.size + prepared.form.size + prepared.parts.reduce((sum, part) => sum + part.size, 0));
});

// TST-1792063 · level: unit · module: MOD-job-runner
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: an instance whose SPEC.md lacks the paragraph Form of a requirement, while the product's SPEC.md holds one of its own; and an instance with no SPEC.md
// input: prepareJob of change-requirements for each; runJob of the first
// expect: each is blocked by an error under the rule naming what the SPEC.md lacks, the paragraph among it; runJob refuses it (NotStartable); the product's paragraph is given nowhere; a kind of document-schema alone on the same instance is not blocked
test("prepareJob — FormMissing blocks a job whose instance's SPEC.md lacks a piece of the form", async () => {
  const lacking = contextOf({ "AGENTS.md": RULES, "SPEC.md": AGENT_M_SPEC.replace("**Form of a requirement:**", "**The form:**") });
  const prepared = await prepareJob("change-requirements", lacking, { drafter: DRAFTER, reviewers: [] });
  const found = prepared.blocking.filter((f) => f.rule === RULE);
  assert.equal(found.length, 1);
  assert.equal(found[0].kind, "error");
  assert.match(found[0].what, /Form of a requirement/);
  assert.equal(prepared.form, null);
  await assert.rejects(runJob(prepared, { drafter: recorder(DRAFTER, []), reviewers: [] }, { attended: true, context: lacking }), { name: "NotStartable" });
  const none = await prepareJob("change-requirements", contextOf({ "AGENTS.md": RULES }), { drafter: DRAFTER, reviewers: [] });
  assert.equal(none.blocking.filter((f) => f.rule === RULE).length, 1, "an instance without SPEC.md lacks the whole form");
  assert.ok(!JSON.stringify(prepared).includes("PRODUCT-FORM-TEXT"), "the product's SPEC.md is not read in its place");
  const useCases = await prepareJob("derive-use-cases", lacking, { drafter: DRAFTER, reviewers: [] });
  assert.deepEqual(useCases.blocking.filter((f) => f.rule === RULE), [], "document-schema needs no SPEC.md");
});

// TST-1792064 · level: unit · module: MOD-job-runner
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: a job of change-requirements for a participant that works in a checkout of the instance
// input: the prepared form, and the drafter's input
// expect: the form is given as its text, the same as in the browser, while AGENTS.md is given by its path
test("prepareJob — in a checkout of the instance, the form is given as its text too", async () => {
  const context = contextOf(undefined, "/tmp/agent-m-instance-checkout");
  // Only a coding agent on a Bridge is given AGENTS.md by its path (EVERY MODEL READS AGENT M'S AGENTS.MD FIRST).
  const onBridge = { ...DRAFTER, type: "CLI agent", route: "bridge lab-pc agent claude" };
  const prepared = await prepareJob("change-requirements", context, { drafter: onBridge, reviewers: [] });
  assert.equal(prepared.form.text, formText([REQUIREMENT_PIECE]));
  const [sent] = await sentBy(prepared, context);
  assert.ok(sent.startsWith("/tmp/agent-m-instance-checkout/AGENTS.md"), "known positive: AGENTS.md by its path");
  assert.ok(sent.includes(`\n\n${prepared.form.text}\n\n`));
});
