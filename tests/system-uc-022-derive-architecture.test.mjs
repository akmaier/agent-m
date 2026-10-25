// UC-022 system test for deriving the first architecture through the same services used by MOD-review-pages:
// prepare the `decision/draft` run panel, run `derive-architecture` attended, continue with *Write proposals* through
// MOD-job-runner.writeResult, then review the open architecture as `decision/all` does and accept all shown through
// MOD-approvals.acceptShown. Alternative-flow cases cover the blocking or warning decisions of the same path.
// Run: node --test tests/system-uc-022-derive-architecture.test.mjs
//
// Module: MOD-review-pages · MOD-job-runner · MOD-reuse-facts · MOD-approvals · MOD-artifact-edits · MOD-job-catalogue
// Guards: UC-022; ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES; THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE
// Guards: THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT; NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY
// Guards: AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT; NO REVIEWER IS THE DRAFTER; A REVIEWER'S FINDING IS A WARNING
// Guards: A REVIEW FINDING IS WEIGHED BEFORE IT IS ACTED ON; A REUSE DECISION RECORDS ITS DUE DILIGENCE
// Guards: DUE DILIGENCE IS FETCHED, NOT RECALLED; A PRODUCT DECLARES ITS LICENCE; A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
// Guards: A GENERATED ARTIFACT IS A PROPOSAL; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
// Guards: ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// Guards: AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; THE PAGE NAMES WHERE IT SENDS
// Guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; ONE CLICK PER DECISION
// Guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED
// Guards: WHAT A PERSON DECIDES IS NOT SENT BACK; THE CORRECTION LOOP HAS A FIXED LIMIT; THE ROUNDS ARE COUNTED AND SHOWN
// Guards: AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION
// Level: system
//
// The fixture product is a MOD-repository-hosts Host subset in memory. The instance snapshot reads this repository's book
// chapter files from disk through MOD-source-register. The package registry is a fixture fetch function in the job context;
// no request leaves the test process. Each test states its input and expected result before it runs. Counter-proof notes
// are reported in the pull request: locally derivable faults are listed in the final report without committing planted
// faults.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { approvalSchema, approvalStrategies, acceptShown, statuses } from "../src/approvals/index.mjs";
import { writeDocument } from "../src/documents/index.mjs";
import { specStrategies } from "../src/spec-changes/index.mjs";
import { editStrategies } from "../src/artifact-edits/index.mjs";
import { sourceStrategies } from "../src/source-register/index.mjs";
import { reuseStrategies } from "../src/reuse-facts/index.mjs";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { prepareJob, registerStrategies, runJob, writeResult, provenanceLines } from "../src/job-runner/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";

for (const [owner, strategies] of Object.entries({
  "tests/system-uc-022-derive-architecture.test.mjs#approvals": approvalStrategies,
  "tests/system-uc-022-derive-architecture.test.mjs#spec-changes": specStrategies,
  "tests/system-uc-022-derive-architecture.test.mjs#artifact-edits": editStrategies,
  "tests/system-uc-022-derive-architecture.test.mjs#source-register": sourceStrategies,
  "tests/system-uc-022-derive-architecture.test.mjs#reuse-facts": reuseStrategies,
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
  "# Library - Specification",
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
const UC1_PATH = "docs/use-cases/UC-001-check-out-a-book.md";
const UC2_PATH = "docs/use-cases/UC-002-return-a-book.md";
const ARC_DRAFT = "docs/architecture/ARC-900-system.md";
const MOD_DRAFT = "docs/architecture/MOD-lending.md";
const JOB_ID = "JOB-20261013-1000-448c";

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
const UC1 = useCase("UC-001", "Check out a book", "The member borrows a book.", [RULE]);
const UC2 = useCase("UC-002", "Return a book", "The member returns a book.", [OTHER]);
const approval = (id, path, body) => ({
  [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`]: writeDocument(approvalSchema, {
    fields: { kind: "use-case", file: path, blob: blobOf(body) },
  }),
});

const baseFiles = () => ({
  "README.md": "# Library\n",
  "LICENSE": "MIT\n",
  "SPEC.md": SPEC,
  [UC1_PATH]: UC1,
  [UC2_PATH]: UC2,
  ...approval("UC-001", UC1_PATH, UC1),
  ...approval("UC-002", UC2_PATH, UC2),
});

const arcText = ({ candidate = "loan-lib", alternative = "shelf-lib" } = {}) => text(
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
  `| ${candidate} | npm | https://github.com/alice/${candidate} | chosen |`,
  "",
  "## Alternatives",
  "",
  "| Candidate | Ecosystem | Repository |",
  "|---|---|---|",
  `| ${alternative} | npm | https://github.com/alice/${alternative} |`,
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
  "- `loans` - records and returns loans.",
  "",
  "## Files",
  "",
  "It writes no files.",
  "",
  "## Uses",
  "",
  "None.",
);
const draft = (options) => ({ files: [
  { path: ARC_DRAFT, text: arcText(options), class: "new" },
  { path: MOD_DRAFT, text: moduleText(), class: "new" },
] });

function productHost(files = baseFiles()) {
  const calls = [];
  const tree = new Map(Object.entries(files));
  let head = "1".repeat(40);
  const snapshot = () => ({
    repository: PRODUCT,
    ref: "trunk",
    commit: head,
    paths: [...tree.keys()].sort(),
    read: async (path) => (tree.has(path) ? tree.get(path) : null),
    blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null),
  });
  return {
    calls,
    files: () => Object.fromEntries(tree),
    async snapshot() { return snapshot(); },
    host: {
      async repositoryInfo() {
        return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        if (ref !== "trunk" && ref !== head) throw failure("NotFound", `${ref} was not found`);
        return snapshot();
      },
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
  const snapshot = {
    repository: INSTANCE,
    ref: "main",
    commit: "abc123def4567890abc123def4567890abc123de",
    paths: ["docs/sources/SRC-vibe-coding.md", ...SOURCE_FILES],
    read: async (path) => (snapshot.paths.includes(path) ? fileOnDisk(path) : null),
    blob: (path) => (snapshot.paths.includes(path) ? blobOf(fileOnDisk(path)) : null),
  };
  return {
    async repositoryInfo() {
      return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" };
    },
    async readSnapshot() { return snapshot; },
  };
}

const participant = (name, model, context = 300000) => ({
  name,
  type: "model endpoint",
  model,
  context,
  price: null,
  capabilities: ["draft text"],
  place: "this machine",
  route: `endpoint ${name}`,
});
const DRAFTER = participant("drafter-a", "model-a");
const REVIEWER = participant("reviewer-b", "model-b");
const SAME_MODEL = participant("reviewer-same", "model-a");
const SMALL = participant("small-d", "model-d", 100);
const USAGE = { inputTokens: 10, outputTokens: 5, minutes: null, cost: null };

function driver(who, answers) {
  const inputs = [];
  return {
    participant: who,
    inputs,
    async send(input) {
      inputs.push(input);
      const next = answers.shift();
      if (next instanceof Error) throw next;
      if (next === undefined) throw new Error(`${who.name} was asked more often than expected`);
      return { text: typeof next === "string" ? next : JSON.stringify(next), usage: USAGE };
    },
  };
}
const answer = (body, answers = []) => ({ draft: body, answers });
const REVIEW_FINDING = {
  artifact: ARC_DRAFT,
  line: 16,
  rule: "AN ARCHITECTURE IS CHECKED WHEN IT IS COMPLETE",
  what: "the system boundary is unclear",
  fix: "state the system boundary",
};
const findingLine = (found) => formatFinding({ ...found, kind: "warning" });
const packageData = (license) => ({
  license,
  repository: { url: "https://github.com/alice/loan-lib" },
  "dist-tags": { latest: "1.1.0" },
  versions: { "1.0.0": {}, "1.1.0": {} },
  time: { "1.0.0": "2024-01-01T00:00:00.000Z", "1.1.0": "2025-01-01T00:00:00.000Z" },
});
const registry = async (input) => {
  const url = String(input);
  if (url === "https://registry.npmjs.org/loan-lib") return new Response(JSON.stringify(packageData("MIT")), { status: 200 });
  if (url === "https://registry.npmjs.org/shelf-lib") return new Response(JSON.stringify(packageData("Apache-2.0")), { status: 200 });
  if (url === "https://registry.npmjs.org/blocked-lib") throw new TypeError("Failed to fetch");
  if (url.includes("downloads/point/last-month/loan-lib")) return new Response(JSON.stringify({ downloads: 1234 }), { status: 200 });
  if (url.includes("downloads/point/last-month/shelf-lib")) return new Response(JSON.stringify({ downloads: 4321 }), { status: 200 });
  return new Response(JSON.stringify({ message: "not found" }), { status: 404 });
};

async function context(kind, product, overrides = {}) {
  return {
    kind,
    params: {},
    product: { address: PRODUCT.web, snapshot: await product.host.readSnapshot("trunk"), host: product.host },
    instance: { snapshot: await instanceHost().readSnapshot("main"), host: instanceHost(), checkout: null },
    connect: async () => ({ async repositoryInfo() { return { defaultBranch: "main" }; }, async issueCounts() { return { open: 2, closed: 5 }; } }),
    participants: [DRAFTER, REVIEWER, SAME_MODEL, SMALL],
    places: { sources: {}, mailbox: null },
    gates: [],
    person: "alice",
    now: new Date("2026-10-13T10:00:00Z"),
    agentM: { version: "2026.10.0", commit: "abc123def456" },
    jobId: JOB_ID,
    fetch: registry,
    ...overrides,
  };
}

const partsByRecipe = (prepared, recipe) => prepared.parts.filter((part) => part.recipe === recipe);

// TST-448001 · level: system · module: MOD-review-pages; MOD-job-runner; MOD-reuse-facts; MOD-artifact-edits; MOD-approvals
// guards: UC-022; THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE; THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT; AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// given: a product with two accepted use cases, no architecture and an MIT LICENSE; a drafter and a reviewer with another model; fixture registry facts for one chosen and one alternative npm package
// input: prepare derive-architecture, run it attended, write the result on the person's click, then accept every open architecture file shown
// expect: the run panel covers every requirement and use case with no selection; both participants receive the whole project and chapters 9-12; the reviewer warning is answered before the person sees the draft; Write proposals writes open architecture files with provenance only in the commit; Accept all writes one approval record per shown file
test("TST-448001: UC-022 derives, writes and accepts the first architecture as one whole", async () => {
  const product = productHost();
  const kind = await kindOf("derive-architecture");
  const jobContext = await context(kind, product);
  const prepared = await prepareJob("derive-architecture", jobContext, { drafter: DRAFTER, reviewers: [REVIEWER], limit: 3 });

  assert.deepEqual(prepared.blocking, []);
  assert.deepEqual(prepared.notFitting, []);
  assert.equal(partsByRecipe(prepared, "whole-spec").length, 1);
  assert.deepEqual(partsByRecipe(prepared, "accepted-use-cases").map((part) => part.name).sort(),
    [`${UC1_PATH} — accepted`, `${UC2_PATH} — accepted`].sort());
  assert.deepEqual(partsByRecipe(prepared, "chapters-for-architecture").map((part) => part.name.replace(/ — .*/, "")), [
    "09_system-modeling.md",
    "10_architectural-design.md",
    "11_agentic-design-and-control-patterns.md",
    "12_implementation-and-version-control.md",
  ]);
  assert.deepEqual(prepared.destinations.map((destination) => [destination.participant.name, destination.role]),
    [["drafter-a", "drafter"], ["reviewer-b", "reviewer"]]);

  const firstDraft = draft();
  const reviewer = driver(REVIEWER, [answer({ findings: [REVIEW_FINDING] }), answer({ findings: [] })]);
  const drafter = driver(DRAFTER, [answer(firstDraft),
    answer(firstDraft, [{ finding: findingLine(REVIEW_FINDING), how: "answered", text: "the context names the system boundary" }])]);
  const result = await runJob(prepared, { drafter, reviewers: [reviewer] }, { attended: true, context: jobContext });

  assert.equal(result.written, null, "attended run waits for the person's Write proposals click");
  assert.equal(result.stoppedBecause, "passed");
  assert.deepEqual(result.remaining, []);
  assert.deepEqual(result.rounds.map((round) => [round.number, round.findings.map(formatFinding), round.answers.map((reply) => reply.how)]),
    [[1, [findingLine(REVIEW_FINDING)], ["answered"]], [2, [], []]]);
  assert.ok(drafter.inputs[0].prompt.includes(SPEC));
  assert.ok(drafter.inputs[0].prompt.includes(UC1));
  assert.ok(drafter.inputs[0].prompt.includes(UC2));
  assert.ok(drafter.inputs[0].prompt.includes("Chapter 9"));
  assert.ok(drafter.inputs[0].prompt.includes("Chapter 12"));
  assert.ok(reviewer.inputs[0].prompt.includes(ARC_DRAFT));
  assert.ok(reviewer.inputs[0].prompt.includes(MOD_DRAFT));
  assert.ok(result.draft.files[0].text.includes("## Due diligence"));
  assert.ok(result.draft.files[0].text.includes("loan-lib (npm) - chosen"));
  assert.ok(result.draft.files[0].text.includes("shelf-lib (npm)"));
  assert.ok(result.draft.files[0].text.includes("Product licence: MIT."));

  const written = await writeResult(prepared, result.draft, { result, context: await context(kind, product) });
  assert.deepEqual(written.files, ["docs/architecture/ARC-001-system.md", "docs/architecture/MOD-lending.md"]);
  const proposalCommit = product.calls.at(-1);
  assert.deepEqual(proposalCommit.message.split("\n").slice(-6), provenanceLines({
    agentM: jobContext.agentM,
    jobId: JOB_ID,
    kind: "derive-architecture",
    participant: DRAFTER,
    rounds: 2,
    instruction: null,
  }));
  for (const file of proposalCommit.files) {
    assert.ok(!file.text.includes("Agent-M-Version"));
    assert.ok(!file.text.includes(JOB_ID));
    assert.ok(!file.text.includes("drafter-a"));
    assert.ok(!file.text.includes("model-a"));
  }

  const afterProposals = await product.host.readSnapshot("trunk");
  assert.deepEqual([...statuses(afterProposals)].filter(([path]) => path.startsWith("docs/architecture/")).map(([path, status]) => [path, status.status]), [
    ["docs/architecture/ARC-001-system.md", "open"],
    ["docs/architecture/MOD-lending.md", "open"],
  ]);
  const shown = written.files.map((path) => ({ path, blob: afterProposals.blob(path) }));
  const accepted = await acceptShown(product.host, shown, "alice");
  assert.equal(accepted.recorded.length, 2);
  assert.deepEqual(accepted.leftOut, []);
  const afterAcceptance = await product.host.readSnapshot("trunk");
  assert.deepEqual([...statuses(afterAcceptance)].filter(([path]) => path.startsWith("docs/architecture/")).map(([path, status]) => [path, status.status]), [
    ["docs/architecture/ARC-001-system.md", "accepted"],
    ["docs/architecture/MOD-lending.md", "accepted"],
  ]);
});

// TST-448002 · level: system · module: MOD-approvals; MOD-job-runner
// guards: UC-022; ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES; NO REVIEWER IS THE DRAFTER; NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY; ONE CLICK PER DECISION
// given: fixture variants with an open use case, an open SPEC change, an existing architecture, a same-model reviewer, a too-small context and a prepared-but-not-run job
// input: prepare derive-architecture for each variant
// expect: the open use case and existing architecture block; the open SPEC change is a warning only; same-model reviewer blocks; too-small context is named; preparation alone sends nothing and writes nothing
test("TST-448002: UC-022 pre-run alternatives name what blocks or warns before anything is sent", async () => {
  const kind = await kindOf("derive-architecture");

  const openUseCaseFiles = baseFiles();
  for (const path of Object.keys(openUseCaseFiles)) if (path.startsWith("docs/approvals/UC-002")) delete openUseCaseFiles[path];
  const openUseCase = productHost(openUseCaseFiles);
  const openUseCasePrepared = await prepareJob("derive-architecture", await context(kind, openUseCase), { drafter: DRAFTER, reviewers: [REVIEWER] });
  assert.deepEqual(openUseCasePrepared.blocking.map((found) => [found.kind, found.rule, /UC-002/.test(found.what)]),
    [["error", "ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES", true]]);

  const queue = "docs/spec-freigaben/2026-10-13_architecture";
  const specChange = productHost({ ...baseFiles(), [`${queue}/index.md`]: text("# Queue", "", "| Nr | Datei |", "|---|---|", "| 01 | `SPEC.md` |"),
    [`${queue}/01-change.md`]: text("**A THIRD RULE** *(Product Owner)*", "A rule.") });
  const specChangePrepared = await prepareJob("derive-architecture", await context(kind, specChange), { drafter: DRAFTER, reviewers: [REVIEWER] });
  assert.deepEqual(specChangePrepared.blocking.map((found) => [found.kind, found.rule]), [
    ["warning", "THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE"],
  ]);

  const existingArchitecture = productHost({ ...baseFiles(), "docs/architecture/ARC-001-system.md": text("---", "id: ARC-001", "title: System", "---", "# ARC-001 System") });
  const existingPrepared = await prepareJob("derive-architecture", await context(kind, existingArchitecture), { drafter: DRAFTER, reviewers: [REVIEWER] });
  assert.deepEqual(existingPrepared.blocking.map((found) => [found.kind, found.rule, /architecture already/.test(found.what)]),
    [["error", "THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE", true]]);

  const ready = productHost();
  const sameModel = await prepareJob("derive-architecture", await context(kind, ready), { drafter: DRAFTER, reviewers: [SAME_MODEL] });
  assert.deepEqual(sameModel.blocking.map((found) => [found.kind, found.rule]), [["error", "NO REVIEWER IS THE DRAFTER"]]);

  const tooSmall = await prepareJob("derive-architecture", await context(kind, ready), { drafter: SMALL, reviewers: [REVIEWER] });
  assert.deepEqual(tooSmall.notFitting.map((item) => item.participant.name), ["small-d"]);
  assert.equal(ready.calls.length, 0, "prepare and a missing Run click write nothing");
});

// TST-448003 · level: system · module: MOD-job-runner; MOD-reuse-facts; MOD-artifact-edits
// guards: UC-022; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; THE ROUNDS ARE COUNTED AND SHOWN; A REUSE DECISION RECORDS ITS DUE DILIGENCE
// given: checked architecture drafts with reviewer findings, unreadable review answers, missing registry candidates, a blocked registry, restrictive licences, and no product LICENSE
// input: run derive-architecture attended, and for the blocked registry try Write proposals
// expect: findings are warnings sent back or left for the person; unreadable reviewer output marks the draft not checked; missing candidates warn without blocking; blocked registry prevents writing; restrictive and unchecked licences are visible in due diligence; rejecting every alternative is represented as an edited draft awaiting another whole check
test("TST-448003: UC-022 post-run alternatives keep findings visible and refuse writes without due diligence", async () => {
  const kind = await kindOf("derive-architecture");
  const product = productHost();
  const prepared = await prepareJob("derive-architecture", await context(kind, product), { drafter: DRAFTER, reviewers: [REVIEWER], limit: 2 });

  const answered = await runJob(prepared, {
    drafter: driver(DRAFTER, [answer(draft()), answer(draft(), [{ finding: findingLine(REVIEW_FINDING), how: "answered", text: "the boundary is already in Context" }])]),
    reviewers: [driver(REVIEWER, [answer({ findings: [REVIEW_FINDING] }), answer({ findings: [REVIEW_FINDING] })])],
  }, { attended: true, context: await context(kind, product) });
  assert.equal(answered.stoppedBecause, "passed");
  assert.equal(answered.rounds[0].answers[0].how, "answered");

  const unreadable = await runJob(prepared, {
    drafter: driver(DRAFTER, [answer(draft()), answer(draft())]),
    reviewers: [driver(REVIEWER, ["not json", "still not json"])],
  }, { attended: true, context: await context(kind, product) });
  assert.equal(unreadable.stoppedBecause, "not checked");

  const noLicenceProduct = productHost(Object.fromEntries(Object.entries(baseFiles()).filter(([path]) => path !== "LICENSE")));
  const noLicencePrepared = await prepareJob("derive-architecture", await context(kind, noLicenceProduct), { drafter: DRAFTER, reviewers: [REVIEWER] });
  const noLicenceResult = await runJob(noLicencePrepared, {
    drafter: driver(DRAFTER, [answer(draft())]),
    reviewers: [driver(REVIEWER, [answer({ findings: [] })])],
  }, { attended: true, context: await context(kind, noLicenceProduct) });
  assert.match(noLicenceResult.draft.files[0].text, /No product LICENSE was found/);
  assert.match(noLicenceResult.draft.files[0].text, /not checked/);

  const blocked = productHost();
  const blockedPrepared = await prepareJob("derive-architecture", await context(kind, blocked), { drafter: DRAFTER, reviewers: [REVIEWER] });
  const blockedResult = await runJob(blockedPrepared, {
    drafter: driver(DRAFTER, [answer(draft({ candidate: "blocked-lib", alternative: "missing-lib" }))]),
    reviewers: [driver(REVIEWER, [answer({ findings: [] })])],
  }, { attended: true, context: await context(kind, blocked) });
  assert.deepEqual(blockedResult.stepFindings.map((found) => [found.kind, found.rule]), [
    ["error", "A REUSE DECISION RECORDS ITS DUE DILIGENCE"],
    ["warning", "DUE DILIGENCE IS FETCHED, NOT RECALLED"],
  ]);
  await assert.rejects(
    async () => writeResult(blockedPrepared, blockedResult.draft, { result: blockedResult, context: await context(kind, blocked) }),
    { name: "DueDiligenceMissing" },
  );

  const edited = structuredClone(answered.draft);
  edited.files[0].text = edited.files[0].text.replace("The system reuses the lending package.", "The component is developed in MOD-lending.");
  const checkedAgain = await runJob(prepared, {
    drafter: null,
    reviewers: [driver(REVIEWER, [answer({ findings: [] })])],
  }, { attended: true, from: edited, context: await context(kind, product) });
  assert.equal(checkedAgain.stoppedBecause, "passed", "8a waits as an edited draft and is checked again as a whole");
});

// TST-448004 · level: system · module: MOD-approvals; MOD-review-pages
// guards: UC-022; ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// given: a shown architecture decision names UC-002, whose current text has no approval record, while UC-001 is accepted
// input: Accept all shown with that decision's current blob
// expect: no approval record is written for the decision; the left-out result names that the file rests on what is not accepted and names UC-002
test("TST-448004: UC-022 leaves out architecture files that rest on an open use case at acceptance", async () => {
  const files = baseFiles();
  for (const path of Object.keys(files)) if (path.startsWith("docs/approvals/UC-002")) delete files[path];
  files["docs/architecture/ARC-001-system.md"] = text(
    "---",
    "id: ARC-001",
    "title: System",
    "forced_by:",
    "  - UC-002",
    "---",
    "# ARC-001 System",
    "",
    "## Context",
    "",
    "The system serves reservations.",
    "",
    "## Decision",
    "",
    "The system includes reservations.",
    "",
    "## Alternatives",
    "",
    "No reservation support.",
    "",
    "## Consequences",
    "",
    "UC-002 must be accepted first.",
  );
  const product = productHost(files);
  const snapshot = await product.host.readSnapshot("trunk");
  let error = null;
  try {
    await acceptShown(product.host, [{ path: "docs/architecture/ARC-001-system.md", blob: snapshot.blob("docs/architecture/ARC-001-system.md") }], "alice");
  } catch (caught) {
    error = caught;
  }
  assert.equal(error?.name, "NothingToAccept");
  assert.deepEqual(error.leftOut, [{
    path: "docs/architecture/ARC-001-system.md",
    reason: "rests on what is not accepted",
    names: ["UC-002"],
  }]);
});
