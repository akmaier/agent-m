// Every model reads Agent M's AGENTS.md first — MOD-job-runner's composition of a job's input, as the accepted requirement EVERY MODEL READS AGENT M'S
// AGENTS.MD FIRST states it (SPEC.md): "The input Agent M sends to a language model — with a job, or with a message of the prompt bar to an endpoint or
// one that starts a CLI session — begins with Agent M's own `AGENTS.md`, the one at the root of the instance repository, in full, whatever repository the
// job or the page works on; for a coding agent on a Bridge, it begins instead with the instruction that the agent must read that file in full, naming its
// path in the Bridge's clone of the instance." A coding agent on a Bridge is a participant of the type `CLI agent` (MOD-participant-list, Connection); a
// coding agent on CI (`CI agent`) and a model endpoint get the file's text, though the context names a checkout of the instance (MOD-job-runner, Prepared).
// Run: node --test tests/job-runner-agents-first.test.mjs
//
// Module: MOD-job-runner
// Guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// Level: unit
//
// What a model receives is what a driver sends: driverPrompt of the input it is handed (MOD-job-runner, Interfaces: driverPrompt), the text every endpoint,
// agent and Bridge driver sends. A recording driver keeps that text and stops the job. The instance and the product are fixtures in memory, each with an
// AGENTS.md of its own text, so that the product's file in the instance's place is told apart. The checkout is a folder of this file's own; the runner only
// hands its path on. Each test states its input and its expected result before it runs (given / input / expect). Nothing reaches the network. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { driverPrompt, estimate, prepareJob, registerStrategies, runJob } from "../src/job-runner/index.mjs";

const INSTANCE_RULES = "# AGENTS.md — the instance's rules\n\nINSTANCE-RULES-TEXT: read the SPEC first.\n";
const PRODUCT_RULES = "# AGENTS.md — the product's rules\n\nPRODUCT-RULES-TEXT.\n";
const COMMIT = "a".repeat(40);
const CHECKOUT = mkdtempSync(join(tmpdir(), "agent-m-agents-first-"));

try {
  registerStrategies("tests/job-runner-agents-first.test.mjs", { recipes: {
    "items-of-kind": async () => [{ name: "the items", text: "ITEM-PART-TEXT", sources: [], required: true, size: 0 }],
    "whole-spec": async () => [], "accepted-use-cases": async () => [], "whole-architecture": async () => [], "chapters-for-architecture": async () => [] },
  preconditions: { "architecture-ready": async () => null }, steps: { "due-diligence": async (draft) => ({ draft, findings: [] }) },
  writers: { "open-files": async () => ({ commits: [], files: [], pullRequest: null, shown: null, notes: [] }) } });
} catch (error) {
  if (error.name !== "DuplicateStrategy") throw error;
}

const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "model-a", context: 200000, price: null,
  capabilities: ["draft text", "read the repository"], place: "this machine", route: "endpoint e1" };
const REVIEWER = { ...DRAFTER, name: "reviewer-b", model: "model-b", route: "endpoint e2" };
const ON_BRIDGE = { ...DRAFTER, name: "drafter-bridge", type: "CLI agent", route: "bridge lab-pc agent claude" };
const ON_CI = { ...DRAFTER, name: "drafter-ci", type: "CI agent", route: "ci hosted agent claude secret ANTHROPIC_API_KEY" };
const snapshotOf = (path, files) => ({ repository: { server: "github", origin: "https://github.com", path, web: `https://github.com/${path}` },
  ref: "main", commit: COMMIT, paths: Object.keys(files), read: async (name) => files[name] ?? null, blob: () => null });
const INSTANCE = snapshotOf("alice/instance", { "AGENTS.md": INSTANCE_RULES });
const PRODUCT = snapshotOf("alice/product", { "AGENTS.md": PRODUCT_RULES });
const contextOf = ({ instance = INSTANCE, product = PRODUCT, checkout = null } = {}) => ({ kind: null, params: {},
  product: { address: product.repository.web, snapshot: product, host: null }, instance: { snapshot: instance, host: null, checkout },
  connect: async () => null, participants: [DRAFTER, REVIEWER, ON_BRIDGE, ON_CI], places: { sources: {}, mailbox: null }, gates: [], person: "alice",
  now: new Date("2026-10-25T08:00:00Z"), agentM: { version: "unreleased", commit: COMMIT }, jobId: null });

// The text a recording driver is asked to send; it stops the job after the first exchange.
const recorder = (participant, sent) => ({ participant, send: async (input) => {
  sent.push(driverPrompt(input));
  throw Object.assign(new Error("recorded"), { name: "Recorded" });
} });
async function sentBy(kind, context, { reviewers = [], from, drafter = DRAFTER } = {}) {
  const prepared = await prepareJob(kind, context, { drafter: from === undefined ? drafter : null, reviewers });
  const sent = [];
  try {
    await runJob({ ...prepared, blocking: [], notFitting: [] }, { drafter: from === undefined ? recorder(drafter, sent) : null,
      reviewers: reviewers.map((reviewer) => recorder(reviewer, sent)) }, { attended: true, context, from });
  } catch (error) {
    if (error.name !== "Recorded") throw error;
  }
  return { prepared, sent };
}

// TST-1350001 · level: unit · module: MOD-job-runner
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: a job in the browser (no checkout) on a product whose repository has an AGENTS.md of its own, the instance's AGENTS.md another text
// input: prepareJob and runJob of propose-groups; the text the drafter's driver sends
// expect: the text begins with the instance's AGENTS.md in full, then the kind's prompt with its parts; the product's AGENTS.md text appears nowhere
test("runJob — the drafter's input begins with the instance's AGENTS.md in full, not the product's", async () => {
  const { sent } = await sentBy("propose-groups", contextOf());
  assert.equal(sent.length, 1);
  assert.ok(sent[0].startsWith(INSTANCE_RULES), "the input begins with the instance's AGENTS.md");
  assert.ok(sent[0].includes("ITEM-PART-TEXT"), "known positive: the kind's part is there too");
  assert.ok(sent[0].indexOf("ITEM-PART-TEXT") > INSTANCE_RULES.length, "the parts come after the file");
  assert.ok(!sent[0].includes("PRODUCT-RULES-TEXT"), "the product's file is not given in its place");
});

// TST-1350002 · level: unit · module: MOD-job-runner
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: a job whose participant is a coding agent on a Bridge (type `CLI agent`), working in a checkout of the instance at the record's commit
// input: prepareJob and runJob of propose-groups; the text the drafter's driver sends
// expect: the text begins with the path of AGENTS.md in the checkout, followed by the instruction that the agent must read it in full; none of the file's text
test("runJob — for a coding agent on a Bridge, the input begins with the instruction to read AGENTS.md in full at its path there", async () => {
  const { sent } = await sentBy("propose-groups", contextOf({ checkout: CHECKOUT }), { drafter: ON_BRIDGE });
  const path = join(CHECKOUT, "AGENTS.md");
  assert.ok(sent[0].startsWith(`${path}\n\n`), sent[0].slice(0, 120));
  const instruction = sent[0].slice(path.length).split("\n\n")[1];
  assert.match(instruction, /must read it in full/, "the instruction to read the file in full follows its path");
  assert.ok(!sent[0].includes("INSTANCE-RULES-TEXT"), "the file's text is not given");
});

// TST-1350006 · level: unit · module: MOD-job-runner
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: the same context naming a checkout of the instance — on CI, the job workflow's checkout —, for a coding agent on CI (type `CI agent`) and for a model endpoint
// input: prepareJob and runJob of propose-groups; the text each drafter's driver sends
// expect: each text begins with the instance's AGENTS.md in full, and names no path of it; known positive: the same context for the agent on a Bridge names the path
test("runJob — on CI and for a model endpoint, the input begins with the text of AGENTS.md though the context names a checkout", async () => {
  const path = join(CHECKOUT, "AGENTS.md");
  const bridged = await sentBy("propose-groups", contextOf({ checkout: CHECKOUT }), { drafter: ON_BRIDGE });
  assert.ok(bridged.sent[0].startsWith(path), "known positive: the agent on a Bridge is given the path");
  for (const drafter of [ON_CI, DRAFTER]) {
    const { sent } = await sentBy("propose-groups", contextOf({ checkout: CHECKOUT }), { drafter });
    assert.ok(sent[0].startsWith(INSTANCE_RULES), `${drafter.type}: ${sent[0].slice(0, 120)}`);
    assert.ok(!sent[0].includes(path), `${drafter.type}: no path is named`);
  }
});

// TST-1350003 · level: unit · module: MOD-job-runner
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: a reviewing participant of derive-architecture, asked to check a draft a person changed (`from`, no drafter)
// input: runJob; the text the reviewer's driver sends
// expect: the reviewer's input begins with the instance's AGENTS.md too
test("runJob — a reviewer's input begins with the instance's AGENTS.md", async () => {
  const { sent } = await sentBy("derive-architecture", contextOf(), { reviewers: [REVIEWER], from: { files: [] } });
  assert.equal(sent.length, 1, "the reviewer was asked");
  assert.ok(sent[0].startsWith(INSTANCE_RULES));
});

// TST-1350004 · level: unit · module: MOD-job-runner
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: the same job with and without the instance's AGENTS.md in the instance's repository
// input: prepareJob; the drafter's destination size
// expect: the size with the file is larger by the file's estimate: the context check counts the file; a drafter whose context holds the job only without the file is named in notFitting
test("prepareJob — the destination's size counts the instance's AGENTS.md", async () => {
  const without = await prepareJob("propose-groups", contextOf({ instance: snapshotOf("alice/instance", {}) }), { drafter: DRAFTER, reviewers: [] });
  const withIt = await prepareJob("propose-groups", contextOf(), { drafter: DRAFTER, reviewers: [] });
  assert.equal(withIt.destinations[0].size - without.destinations[0].size, estimate(INSTANCE_RULES));
  const small = { ...DRAFTER, context: without.destinations[0].size };
  const tight = await prepareJob("propose-groups", contextOf(), { drafter: small, reviewers: [] });
  assert.equal(tight.notFitting.length, 1, "the file does not fit a context that only holds the rest");
});

// TST-1350005 · level: unit · module: MOD-job-runner
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: an instance repository without an AGENTS.md
// input: prepareJob and runJob of propose-groups
// expect: the input begins with the kind's prompt, as before; nothing stands in for the file
test("runJob — without an AGENTS.md in the instance, the input begins with the kind's prompt", async () => {
  const { sent, prepared } = await sentBy("propose-groups", contextOf({ instance: snapshotOf("alice/instance", {}) }));
  assert.ok(sent[0].startsWith(prepared.kind.prompt.slice(0, 40)));
});
