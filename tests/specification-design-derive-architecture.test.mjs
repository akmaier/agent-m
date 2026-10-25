// Specification and design together for deriving the architecture (ITM-444) — ARC-041's three modules as they are used by
// MOD-job-runner for `derive-architecture` and `review-architecture`: MOD-approvals' precondition and accepted-use-case
// recipe, MOD-spec-changes' whole-SPEC recipe, and MOD-artifact-edits' open-files writer, together with the source-register
// chapter recipe, the runner's built-in checks, and MOD-reuse-facts' due-diligence step.
// Run: node --test tests/specification-design-derive-architecture.test.mjs
//
// Module: MOD-approvals; MOD-spec-changes; MOD-artifact-edits
// Guards: UC-022; THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT; AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT
// Guards: A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// Level: component
//
// The product and the instance are fixture hosts that keep to the subset of MOD-repository-hosts used by the strategies:
// repositoryInfo, readSnapshot, readHistory and commitFiles. The instance snapshot reads this repository's registered
// Vibe Coding source and its chapter files from disk. The model drivers are fixtures that keep every MOD-job-runner
// DriverInput they receive. The registry and issue hosts are fixtures too; nothing reaches the network. The test states
// its input and expected result before it runs (given / input / expect). Counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { approvalSchema, approvalStrategies } from "../src/approvals/index.mjs";
import { writeDocument } from "../src/documents/index.mjs";
import { specStrategies } from "../src/spec-changes/index.mjs";
import { editStrategies } from "../src/artifact-edits/index.mjs";
import { sourceStrategies } from "../src/source-register/index.mjs";
import { reuseStrategies } from "../src/reuse-facts/index.mjs";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { prepareJob, registerStrategies, runJob, provenanceLines } from "../src/job-runner/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";

for (const [owner, strategies] of Object.entries({
  "tests/specification-design-derive-architecture.test.mjs#approvals": approvalStrategies,
  "tests/specification-design-derive-architecture.test.mjs#spec-changes": specStrategies,
  "tests/specification-design-derive-architecture.test.mjs#artifact-edits": editStrategies,
  "tests/specification-design-derive-architecture.test.mjs#source-register": sourceStrategies,
  "tests/specification-design-derive-architecture.test.mjs#reuse-facts": reuseStrategies,
})) {
  try {
    registerStrategies(owner, strategies);
  } catch (error) {
    if (error.name !== "DuplicateStrategy") throw error;
  }
}

const ROOT = new URL("../", import.meta.url);
const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message, fields = {}) => Object.assign(new Error(message), { name, ...fields });

const PRODUCT = { server: "github", origin: "https://github.com", path: "alice/library", web: "https://github.com/alice/library" };
const INSTANCE = { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" };
const RULE = "A LOAN HAS A DUE DATE";
const OTHER = "A BOOK IS SHELVED";
const SPEC = text(
  "# Library — Specification",
  "",
  "## Lending",
  "",
  `**${RULE}** *(Product Owner)*`,
  "Every loan states the date by which the book is returned.",
  "*Check:* `tests/loan.test.mjs`",
  "",
  `**${OTHER}** *(Product Owner)*`,
  "Every book stands on a shelf.",
  "*Check:* `tests/shelf.test.mjs`",
);
const useCase = (id, title, goal, realises) => text(
  "---",
  `id: ${id}`,
  `title: ${title}`,
  "area: lending",
  "actors:",
  "  - Member",
  "realises:",
  ...realises.map((name) => `  - ${name}`),
  "---",
  `# ${id} ${title}`,
  "",
  `**Goal.** ${goal}`,
);
const UC1_PATH = "docs/use-cases/UC-001-check-out-a-book.md";
const UC2_PATH = "docs/use-cases/UC-002-return-a-book.md";
const UC1 = useCase("UC-001", "Check out a book", "The member borrows a book.", [RULE]);
const UC2 = useCase("UC-002", "Return a book", "The member returns a book.", [OTHER]);
const approval = (id, path, body) => ({ [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`]:
  writeDocument(approvalSchema, { fields: { kind: "use-case", file: path, blob: blobOf(body) } }) });

const ARC_DRAFT = "docs/architecture/ARC-900-system.md";
const MOD_DRAFT = "docs/architecture/MOD-lending.md";
const arcText = () => text(
  "---",
  "id: ARC-900",
  "title: System",
  "forced_by:",
  "  - UC-001",
  "  - UC-002",
  "designs:",
  "  - MOD-lending",
  "---",
  "# ARC-900 System",
  "",
  "## Context",
  "",
  "The lending system manages loans and shelves.",
  "",
  "## Decision",
  "",
  "| Candidate | Ecosystem | Repository | Role |",
  "|---|---|---|---|",
  "| loan-lib | npm | https://github.com/alice/loan-lib | chosen |",
  "",
  "## Alternatives",
  "",
  "| Candidate | Ecosystem | Repository |",
  "|---|---|---|",
  "| shelf-lib | npm | https://github.com/alice/shelf-lib |",
  "",
  "## Consequences",
  "",
  "The system reuses the lending package.",
);
const moduleText = () => text(
  "---",
  "id: MOD-lending",
  "title: Lending",
  "folder: src/lending/",
  "realises:",
  "  - UC-001",
  "  - UC-002",
  "follows:",
  "  - ARC-900",
  "uses:",
  "provides:",
  "  - loans",
  "---",
  "# MOD-lending Lending",
  "",
  "## Responsibility",
  "",
  "It manages loans and returns.",
  "",
  "## Parts",
  "",
  "- `index.mjs`",
  "",
  "## Data",
  "",
  "No data is stored.",
  "",
  "## Interfaces",
  "",
  "- `loans` — records and returns loans.",
  "",
  "## Files",
  "",
  "It writes no files.",
  "",
  "## Uses",
  "",
  "None.",
);
const draft = () => ({ files: [
  { path: ARC_DRAFT, text: arcText(), class: "new" },
  { path: MOD_DRAFT, text: moduleText(), class: "new" },
] });

function productHost() {
  const calls = [];
  const tree = new Map(Object.entries({
    "README.md": "# Library\n",
    "LICENSE": "MIT\n",
    "SPEC.md": SPEC,
    [UC1_PATH]: UC1,
    [UC2_PATH]: UC2,
    ...approval("UC-001", UC1_PATH, UC1),
    ...approval("UC-002", UC2_PATH, UC2),
  }));
  let head = "1".repeat(40);
  const snapshot = () => ({ repository: PRODUCT, ref: "trunk", commit: head, paths: [...tree.keys()].sort(),
    read: async (path) => (tree.has(path) ? tree.get(path) : null), blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) });
  return {
    calls,
    files: () => Object.fromEntries(tree),
    host: {
      async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
      async readSnapshot(ref) { if (ref !== "trunk" && ref !== head) throw failure("NotFound", `${ref} was not found`); return snapshot(); },
      async readHistory() {
        return [{ commit: head, parents: [], author: { account: null, name: "alice" }, date: "2026-10-13T08:00:00Z",
          message: "initial", changes: [...tree.keys()].map((path) => ({ path, change: "added" })) }];
      },
      async commitFiles(change) {
        calls.push(structuredClone(change));
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", "the branch moved", { head });
        for (const file of change.files) tree.set(file.path, file.text);
        head = createHash("sha1").update(`commit ${calls.length}`).digest("hex");
        return { commit: head, url: `${PRODUCT.web}/commit/${head}` };
      },
    },
  };
}

const fileOnDisk = (path) => readFileSync(new URL(path, ROOT), "utf8");
const SOURCE_FILES = [
  "01_vibe-coding-and-the-new-software-landscape.md",
  "02_fundamental-concepts-of-software-engineering.md",
  "03_intro-to-machine-learning-and-llms.md",
  "04_experiences-early-ai-assisted-development.md",
  "05_basic-llm-use.md",
  "06_plan-driven-process-models.md",
  "07_agile-processes.md",
  "08_requirements-engineering.md",
  "09_system-modeling.md",
  "10_architectural-design.md",
  "11_agentic-design-and-control-patterns.md",
  "12_implementation-and-version-control.md",
  "13_software-testing.md",
  "14_software-evolution-and-maintenance.md",
  "15_software-project-management.md",
  "16_projects-transition-phase.md",
  "17_applied-vibe-coding-consentlens.md",
].map((name) => `docs/sources/SRC-vibe-coding/2026-10-05/${name}`);
function instanceHost() {
  const snapshot = { repository: INSTANCE, ref: "main", commit: "abc123def4567890abc123def4567890abc123de",
    paths: [
      "docs/sources/SRC-vibe-coding.md",
      ...SOURCE_FILES,
    ],
    read: async (path) => (snapshot.paths.includes(path) ? fileOnDisk(path) : null),
    blob: (path) => (snapshot.paths.includes(path) ? blobOf(fileOnDisk(path)) : null),
  };
  return { async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" }; },
    async readSnapshot() { return snapshot; } };
}

const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "model-a", context: 300000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "endpoint ep1" };
const REVIEWER = { name: "reviewer-b", type: "model endpoint", model: "model-b", context: 300000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "endpoint ep2" };
const USAGE = { inputTokens: 10, outputTokens: 5, minutes: null, cost: null };
function driver(participant, answers) {
  const inputs = [];
  return { participant, inputs, async send(input) {
    inputs.push(input);
    const next = answers.shift();
    if (next === undefined) throw new Error(`${participant.name} was asked more often than expected`);
    return { text: JSON.stringify(next), usage: USAGE };
  } };
}
const answer = (body, answers = []) => ({ draft: body, answers });

const REVIEW_FINDING = { artifact: ARC_DRAFT, line: 16, rule: "AN ARCHITECTURE IS CHECKED WHEN IT IS COMPLETE",
  what: "the system boundary is unclear", fix: "state the system boundary" };
const findingLine = (found) => formatFinding({ ...found, kind: "warning" });
const packageData = (license) => ({ license, repository: { url: "https://github.com/alice/loan-lib" },
  "dist-tags": { latest: "1.1.0" }, versions: { "1.0.0": {}, "1.1.0": {} },
  time: { "1.0.0": "2024-01-01T00:00:00.000Z", "1.1.0": "2025-01-01T00:00:00.000Z" } });
const registry = async (input) => {
  const url = String(input);
  if (url === "https://registry.npmjs.org/loan-lib") return new Response(JSON.stringify(packageData("MIT")), { status: 200 });
  if (url === "https://registry.npmjs.org/shelf-lib") return new Response(JSON.stringify(packageData("Apache-2.0")), { status: 200 });
  if (url === "https://api.npmjs.org/downloads/point/last-month/loan-lib") return new Response(JSON.stringify({ downloads: 1234 }), { status: 200 });
  if (url === "https://api.npmjs.org/downloads/point/last-month/shelf-lib") return new Response(JSON.stringify({ downloads: 4321 }), { status: 200 });
  return new Response(JSON.stringify({ message: "not found" }), { status: 404 });
};

async function context(kind, product) {
  return { kind, params: {}, product: { address: PRODUCT.web, snapshot: await product.host.readSnapshot("trunk"), host: product.host },
    instance: { snapshot: await instanceHost().readSnapshot("main"), host: instanceHost(), checkout: null },
    connect: async () => ({ async repositoryInfo() { return { defaultBranch: "main" }; }, async issueCounts() { return { open: 2, closed: 5 }; } }),
    participants: [DRAFTER, REVIEWER], places: { sources: {}, mailbox: null }, gates: [], person: "alice",
    now: new Date("2026-10-13T09:00:00Z"), agentM: { version: "2026.10.0", commit: "abc123def456" },
    jobId: "JOB-20261013-0900-abcd", fetch: registry };
}

const byRecipe = (parts, recipe) => parts.filter((part) => part.recipe === recipe);

// TST-444001 · level: component · module: MOD-approvals; MOD-spec-changes; MOD-artifact-edits
// guards: UC-022; THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT; AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// given: a product with a whole SPEC, two accepted use cases, no architecture and an MIT LICENSE; the instance's registered Vibe Coding source with chapters 9 to 12; a fixture registry for loan-lib and shelf-lib; a drafter that first drafts an architecture, then answers a reviewer warning, and a reviewer of another model that reports the warning
// input: prepareJob("derive-architecture") with MOD-approvals, MOD-spec-changes, MOD-artifact-edits, MOD-source-register and MOD-reuse-facts strategies registered, then runJob unattended with the fixture drivers
// expect: the drafter receives the whole SPEC, both accepted use cases and chapters 9 to 12; the reviewer receives the complete draft and the same context; the reviewer warning is sent back and answered; due diligence is inserted from the registry facts; one commit writes the open architecture files with provenance naming Agent M's version, the job, kind, participant and model, while the files hold none of those provenance lines
test("derive-architecture component — prepares, reviews, adds due diligence and writes open files", async () => {
  const product = productHost();
  const kind = await kindOf("derive-architecture");
  const jobContext = await context(kind, product);
  const prepared = await prepareJob("derive-architecture", jobContext, { drafter: DRAFTER, reviewers: [REVIEWER], limit: 3 });

  assert.deepEqual(prepared.blocking, []);
  assert.deepEqual(prepared.notFitting, []);
  assert.equal(byRecipe(prepared.parts, "whole-spec").length, 1);
  assert.deepEqual(byRecipe(prepared.parts, "accepted-use-cases").map((part) => part.name).sort(),
    [`${UC1_PATH} — accepted`, `${UC2_PATH} — accepted`]);
  assert.deepEqual(byRecipe(prepared.parts, "chapters-for-architecture").map((part) => part.name.replace(/ — .*/, "")), [
    "09_system-modeling.md",
    "10_architectural-design.md",
    "11_agentic-design-and-control-patterns.md",
    "12_implementation-and-version-control.md",
  ]);

  const firstDraft = draft();
  const reviewer = driver(REVIEWER, [answer({ findings: [REVIEW_FINDING] }), answer({ findings: [REVIEW_FINDING] })]);
  const drafter = driver(DRAFTER, [answer(firstDraft),
    answer(firstDraft, [{ finding: findingLine(REVIEW_FINDING), how: "answered", text: "the context names the system boundary" }])]);
  const result = await runJob(prepared, { drafter, reviewers: [reviewer] }, { attended: false, context: jobContext });

  assert.equal(drafter.inputs.length, 2);
  assert.ok(drafter.inputs[0].prompt.includes(SPEC));
  assert.ok(drafter.inputs[0].prompt.includes(UC1));
  assert.ok(drafter.inputs[0].prompt.includes(UC2));
  assert.ok(drafter.inputs[0].prompt.includes("Chapter 9"));
  assert.ok(drafter.inputs[0].prompt.includes("Chapter 12"));
  assert.deepEqual(drafter.inputs[1].findings.map(formatFinding), [findingLine(REVIEW_FINDING)]);
  assert.equal(drafter.inputs[1].previous, JSON.stringify(firstDraft, null, 2));

  assert.equal(reviewer.inputs.length, 2);
  assert.ok(reviewer.inputs[0].prompt.includes(ARC_DRAFT));
  assert.ok(reviewer.inputs[0].prompt.includes(MOD_DRAFT));
  assert.ok(reviewer.inputs[0].prompt.includes(SPEC));
  assert.ok(reviewer.inputs[0].prompt.includes(UC1));
  assert.ok(reviewer.inputs[0].prompt.includes(UC2));

  assert.equal(result.stoppedBecause, "passed");
  assert.deepEqual(result.rounds.map((round) => [round.number, round.findings.map(formatFinding), round.answers.map((answer_) => answer_.how)]),
    [[1, [findingLine(REVIEW_FINDING)], ["answered"]], [2, [findingLine(REVIEW_FINDING)], []]]);
  assert.ok(result.draft.files[0].text.includes("## Due diligence"));
  assert.ok(result.draft.files[0].text.includes("loan-lib (npm) - chosen"));
  assert.ok(result.draft.files[0].text.includes("shelf-lib (npm)"));
  assert.ok(result.draft.files[0].text.includes("Product licence: MIT."));
  assert.deepEqual(result.written.files, ["docs/architecture/ARC-001-system.md", "docs/architecture/MOD-lending.md"]);

  assert.equal(product.calls.length, 1);
  const [commit] = product.calls;
  assert.equal(commit.files.length, 2);
  assert.deepEqual(commit.files.map((file) => file.path), result.written.files);
  assert.ok(commit.files[0].text.includes("id: ARC-001"));
  assert.ok(commit.files[1].text.includes("  - ARC-001"));
  assert.deepEqual(commit.message.split("\n").slice(-6), provenanceLines({ agentM: jobContext.agentM,
    jobId: jobContext.jobId, kind: "derive-architecture", participant: DRAFTER, rounds: 2, instruction: null }));
  for (const file of commit.files) {
    for (const forbidden of ["Agent-M-Version", "JOB-20261013-0900-abcd", "drafter-a", "model-a", "2026.10.0"]) {
      assert.ok(!file.text.includes(forbidden), `${file.path} does not include ${forbidden}`);
    }
  }
});
