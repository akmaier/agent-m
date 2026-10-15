// MOD-workflow-entries' registration of the kinds of Specification and design in a product's job workflow (ITM-366), as the accepted text of
// docs/architecture/MOD-workflow-entries.md states it: compose.mjs "registers the strategies of the services whose kinds may run in CI" —
// MOD-approvals' `approvalStrategies`, MOD-spec-changes' `specStrategies` and MOD-artifact-edits' `editStrategies` among them —, so that
// `onRecordsChanged` takes each queued job and runs it "from its record alone … No person attends a job in CI: its kind's writer writes at
// once (A CI AGENT'S DRAFT ENTERS AS OPEN)": a job of `change-use-case` writes its use case as an open file, a job of `change-requirements`
// its requirements as an entry of a new queue, SPEC.md untouched, "the commit naming the instruction, the participant, the model, the version
// and the rounds" (AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT). For UC-019 6b and UC-007.
// Run: node --test tests/workflow-entries-design-kinds.test.mjs
//
// Module: MOD-workflow-entries
// Guards: UC-019; UC-007; A CI AGENT'S DRAFT ENTERS AS OPEN; ONE DEFINITION, THREE DRIVERS; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// Level: unit
//
// Deterministic, no network: the product and the instance are temporary git repositories laid out as the job workflow lays them out
// (tests/workflow-entries-job-workflow.test.mjs), the instance holding the participant, the register entries of the book and of a linked source,
// and the book's chapter 8, which the kinds' recipe `chapters-for-requirements` reads. One fake `fetch` stands for the world: the model
// endpoint (an OpenAI-compatible one) and the repository server's API for the history of the product, which the writer `open-files` reads
// through the server with the person's token — answered from the product's origin by git. The job runner's registry is filled by the entry
// with the strategies of the modules that offer them; the tests register none. Where the module file leaves a reading open, the test states the
// one it takes, and the pull request names it:
//   - The environment, the routes, the record's parameters `endpoint` and the End are those the tests of ITM-365 state.
//   - The provenance lines are MOD-job-runner's provenanceLines of the job: the version and commit the record names, the job, the kind, the
//     participant and its model, the number of rounds the result made and, where the job has one, the instruction on one line.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRecord } from "../src/job-ledger/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const entries = await import("../src/workflow-entries/main.mjs").catch((error) => ({ error }));
const { runEntry } = entries;

// ---------------------------------------------------------------- the fixtures

const text = (...lines) => `${lines.join("\n")}\n`;
const sha256 = (body) => createHash("sha256").update(body).digest("hex");
const NOW = new Date("2026-10-08T09:00:00Z");
const TOKEN = "ghp_ALICEagentMtoken0123456789abcdef";
const KEY = "sk-FIXTURE-KEY-0123456789abcdef";
const ENDPOINT = { name: "fixture", kind: "openai-compatible", baseUrl: "https://llm.example.test/v1", model: "fixture-llm" };

const RULE = "A LOAN HAS A DUE DATE";
const RULE_TEXT = "Every loan states the date by which the book is returned.";
const SPEC = text("# Thesis tool — Specification", "", "## Lending", "", `**${RULE}** *(Product Owner)*`, RULE_TEXT, "*Check:* `tests/loan.test.mjs`");
const useCase = (goal) => text("---", "id: UC-001", "title: Check out a book", "area: lending", "actors:", "  - Member", "realises:", `  - ${RULE}`, "---",
  "# UC-001 Check out a book", "", `**Goal.** ${goal}`);
const UC_PATH = "docs/use-cases/UC-001-check-out-a-book.md";
const UC_BEFORE = useCase("The member borrows a book at the desk.");
const UC_AFTER = useCase("The member borrows a book at the desk and is told the date it is due.");

const PO_ENTRY = text("---", "id: SRC-fixture-po", "title: Fixture PO", "kind: document", "authority: normative", "licence: may be republished — fixture", "---",
  "# SRC-fixture-po Fixture PO", "", "A fixture source.", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`2026-10-05\` | 2026-10-05 | — | the fixture | 1 file, listed below; version hash \`${"1".repeat(64)}\` |`, "", "### Files of 2026-10-05", "", "| File | SHA-256 |", "|---|---|",
  `| \`po.md\` | \`${"a".repeat(64)}\` |`);
const CHAPTER = "Requirements are the needs a system has to meet.\n";
const CHAPTER_FILE = "08_requirements-engineering.md";
const BOOK_VERSION_HASH = sha256(`${sha256(CHAPTER)}  ${CHAPTER_FILE}\n`);
const BOOK_ENTRY = text("---", "id: SRC-vibe-coding", "title: Vibe Coding", "kind: document", "authority: normative", "licence: may be republished — fixture", "---",
  "# SRC-vibe-coding Vibe Coding", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`2026-10-05\` | 2026-10-05 | — | the fixture | 1 file, listed below; version hash \`${BOOK_VERSION_HASH}\` |`, "", "### Files of 2026-10-05", "",
  "| File | SHA-256 |", "|---|---|", `| \`${CHAPTER_FILE}\` | \`${sha256(CHAPTER)}\` |`);
const LINKS = text("# The sources this product meets", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-fixture-po | 2026-10-05 | ${"1".repeat(64)} | |`);

const PARTICIPANTS = text("# Participants of this instance", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| ci-bot | CI agent | fixture-llm | 100000 | — | draft text, read the repository, write to the repository | GitHub's hosted runners | ci hosted secret FIXTURE_KEY |");

const INSTRUCTION = "Tell the member the due date";
const jobStart = (id, kind, params, agentM) => ({ id, kind, worksOn: [kind === "change-use-case" ? "UC-001" : RULE], participant: "ci-bot", model: "fixture-llm",
  route: "ci hosted", run: null, retries: null, startedBy: "alice", start: new Date("2026-10-08T08:00:00Z"), agentM, inputs: [], limit: 2,
  destinations: [{ participant: "ci-bot", place: "GitHub's hosted runners", parts: ["instruction"] }], params: { endpoint: ENDPOINT, ...params } });
const recordFile = (start) => { const { path, text: body } = startRecord(start); return [path, body]; };
const USE_CASE_JOB = "JOB-20261008-0800-a1b2", REQUIREMENTS_JOB = "JOB-20261008-0801-c3d4";

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function write(root, files) {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
}
// A bare origin whose `main` holds `files`, and the clone of it the workflow checks out into `folder`. -> the origin's folder.
function repository(root, name, files, folder) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  git(seed, "config", "user.name", "Seed");
  git(seed, "config", "user.email", "seed@example.org");
  write(seed, files);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  mkdirSync(join(folder, ".."), { recursive: true });
  git(root, "clone", "-q", origin, folder);
  git(folder, "config", "user.name", "Alice Agent M token");
  git(folder, "config", "user.email", "alice@example.org");
  return origin;
}
// The workspace of a job workflow: product/ and instance/, the product holding the records given.
async function withWorkspace({ records = () => [], extra = {} } = {}, run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-jobs-"));
  const workspace = join(root, "ws");
  try {
    const instance = repository(root, "instance", { "README.md": "# Instance\n", "docs/participants.md": PARTICIPANTS, "docs/sources/SRC-fixture-po.md": PO_ENTRY,
      "docs/sources/SRC-vibe-coding.md": BOOK_ENTRY, [`docs/sources/SRC-vibe-coding/2026-10-05/${CHAPTER_FILE}`]: CHAPTER }, join(workspace, "instance"));
    const agentM = { version: "2026.10.0", commit: git(join(workspace, "instance"), "rev-parse", "HEAD") };
    const product = repository(root, "product", { "README.md": "# Thesis tool\n", ...Object.fromEntries(records(agentM)), ...extra }, join(workspace, "product"));
    return await run({ root, workspace, product, instance, agentM, head: git(join(workspace, "product"), "rev-parse", "HEAD"), productDir: join(workspace, "product") });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

// What the job workflow's job gives the entry (src/runtimes/workflow/github.yml), with the secrets it filled.
const environment = (w, extra = {}) => ({ GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_WORKSPACE: w.workspace, GITHUB_SERVER_URL: "https://github.com",
  GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: w.head, GITHUB_RUN_ID: "4711", GITHUB_ACTOR: "alice",
  AGENT_M_RUNNER: "hosted", AGENT_M_PRODUCT_DIR: w.productDir, AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN", AGENT_M_KEY_NAMES: "FIXTURE_KEY", AGENT_M_TOKEN: TOKEN,
  FIXTURE_KEY: KEY, ...extra });
const fileAt = (w, path) => git(w.product, "show", `main:${path}`).concat("\n");
const exists = (w, path) => spawnSync("git", ["cat-file", "-e", `main:${path}`], { cwd: w.product }).status === 0;

// The world: the model endpoint, which answers the draft it is given, and the repository server's API for the product's history, answered from
// the product's origin by git (the writer open-files reads the history for the identifiers ever used). Every request is recorded.
function fakeWorld(draft, w) {
  const requests = [];
  globalThis.fetch = async (address, init = {}) => {
    const url = String(address);
    requests.push({ address: url, method: init.method ?? "GET", headers: init.headers ?? {}, body: init.body ?? "" });
    if (url.startsWith("https://llm.example.test/")) {
      const content = JSON.stringify({ draft, answers: [] });
      return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 120, completion_tokens: 30 } }), { status: 200 });
    }
    const listed = /^https:\/\/api\.github\.com\/repos\/alice\/thesis-tool\/commits\?/.exec(url);
    const one = /^https:\/\/api\.github\.com\/repos\/alice\/thesis-tool\/commits\/([0-9a-f]{40})\?/.exec(url);
    if (listed) {
      const page = Number(new URL(url).searchParams.get("page") ?? "1");
      const shas = page === 1 ? git(w.product, "log", "--format=%H", "main").split("\n").filter(Boolean) : [];
      return new Response(JSON.stringify(shas.map((sha) => ({ sha, parents: git(w.product, "log", "-1", "--format=%P", sha).split(" ").filter(Boolean).map((p) => ({ sha: p })),
        author: null, commit: { author: { name: "x" }, committer: { date: "2026-10-08T08:00:00Z" }, message: git(w.product, "log", "-1", "--format=%s", sha) } }))), { status: 200 });
    }
    if (one) {
      const changes = git(w.product, "diff-tree", "--no-commit-id", "--name-status", "-r", "--root", one[1]).split("\n").filter(Boolean).map((line) => line.split("\t"));
      const status = { A: "added", M: "modified", D: "removed" };
      return new Response(JSON.stringify({ files: changes.map(([s, filename]) => ({ filename, status: status[s] ?? "modified" })) }), { status: 200 });
    }
    return new Response(JSON.stringify({ message: "not found" }), { status: 404 });
  };
  return requests;
}
const run = (w, extra) => { assert.ok(runEntry, `runEntry: ${entries.error?.message}`); return runEntry("onRecordsChanged", environment(w, extra), { now: NOW }); };
const trailer = (message) => message.split("\n").filter((line) => line.startsWith("Agent-M-"));
const expectedProvenance = (w, id, kind, rounds) => [`Agent-M-Version: ${w.agentM.version}, commit ${w.agentM.commit}`, `Agent-M-Job: ${id}`, `Agent-M-Kind: ${kind}`,
  "Agent-M-Participant: ci-bot", "Agent-M-Model: fixture-llm", `Agent-M-Rounds: ${rounds}`];

// ---------------------------------------------------------------- a change of a use case

// TST-473198 · level: unit · module: MOD-workflow-entries
// guards: A CI AGENT'S DRAFT ENTERS AS OPEN; ONE DEFINITION, THREE DRIVERS; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// given: a product holding the use case UC-001, its requirement and a queued job of `change-use-case` that asks for a change of UC-001 with an instruction; an instance with the participant, the book's chapter and a source the product links; a fixture endpoint that answers the changed use case, classed a change of UC-001
// input: onRecordsChanged
// expect: outcome `done`; one commit by the writer on the product's main that changes UC-001's file to the drafted text and nothing else — an open file: no approval record —, its message ending with the provenance lines of the job (the version and commit of Agent M, the job, the kind, the participant, the model and the rounds — six lines, none naming the instruction); the file itself naming none of them; the job's End appended
test("onRecordsChanged — a queued change-use-case job ends in one commit of an open file", async () => {
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(USE_CASE_JOB, "change-use-case", { useCase: "UC-001", instruction: INSTRUCTION }, agentM))],
    extra: { "SPEC.md": SPEC, "docs/sources.md": LINKS, [UC_PATH]: UC_BEFORE } }, async (w) => {
    fakeWorld({ files: [{ path: UC_PATH, text: UC_AFTER, class: "change", of: "UC-001" }] }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    const writer = git(w.product, "log", "--format=%H", "--grep=^draft UC-001", "main").split("\n").filter(Boolean);
    assert.equal(writer.length, 1, "one commit of the writer");
    assert.deepEqual(git(w.product, "diff-tree", "--no-commit-id", "--name-only", "-r", writer[0]).split("\n"), [UC_PATH]);
    assert.equal(fileAt(w, UC_PATH), UC_AFTER);
    const message = git(w.product, "log", "-1", "--format=%B", writer[0]);
    const lines = trailer(message);
    assert.equal(lines.length, 6);
    assert.ok(lines.every((line) => !line.startsWith("Agent-M-Instruction") && !line.includes(INSTRUCTION)), "no line names the instruction");
    assert.deepEqual(lines.filter((line) => !line.startsWith("Agent-M-Rounds")), expectedProvenance(w, USE_CASE_JOB, "change-use-case", 0).filter((line) => !line.startsWith("Agent-M-Rounds")));
    assert.match(lines.find((line) => line.startsWith("Agent-M-Rounds")), /^Agent-M-Rounds: \d+$/);
    for (const mention of ["Agent-M", w.agentM.version, w.agentM.commit, "ci-bot", "fixture-llm", USE_CASE_JOB]) assert.ok(!fileAt(w, UC_PATH).includes(mention), `the file does not name ${mention}`);
    assert.equal(git(w.product, "ls-tree", "-r", "--name-only", "main").split("\n").filter((path) => path.startsWith("docs/approvals/")).length, 0, "no record: the file is open");
    assert.match(fileAt(w, `docs/jobs/${USE_CASE_JOB}.md`), /## End[^]*state: done/);
  });
});

// ---------------------------------------------------------------- a change of requirements

// TST-473199 · level: unit · module: MOD-workflow-entries
// guards: A CI AGENT'S DRAFT ENTERS AS OPEN; ONE DEFINITION, THREE DRIVERS; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// given: the same product and instance, and a queued job of `change-requirements` naming the requirement, the person's own source — which the product links — and an instruction; a fixture endpoint that answers a candidate that changes the requirement
// input: onRecordsChanged
// expect: outcome `done`; one commit by the writer that adds a new queue under docs/spec-freigaben/ — its index, its decisions, the proposal and its rationale — and changes nothing else: SPEC.md byte-identical; the commit's message ending with the provenance lines of the job
test("onRecordsChanged — a queued change-requirements job ends in a new queue, SPEC.md byte-identical", async () => {
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(REQUIREMENTS_JOB, "change-requirements", { requirements: [RULE], source: "SRC-fixture-po", instruction: INSTRUCTION }, agentM))],
    extra: { "SPEC.md": SPEC, "docs/sources.md": LINKS, [UC_PATH]: UC_BEFORE } }, async (w) => {
    fakeWorld({ candidates: [{ name: RULE, rule: `${RULE_TEXT} The member is told the date.`, check: "`tests/loan.test.mjs`", constrains: "product", passage: "§2",
      class: "change", of: RULE, source: "SRC-fixture-po" }] }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    const writer = git(w.product, "log", "--format=%H", "--grep=Agent-M-Kind: change-requirements", "main").split("\n").filter(Boolean)
      .filter((sha) => git(w.product, "diff-tree", "--no-commit-id", "--name-only", "-r", sha).includes("docs/spec-freigaben/"));
    assert.equal(writer.length, 1, "one commit of the writer");
    const changed = git(w.product, "diff-tree", "--no-commit-id", "--name-only", "-r", writer[0]).split("\n");
    assert.ok(changed.length >= 3 && changed.every((path) => path.startsWith("docs/spec-freigaben/")), changed.join(", "));
    assert.ok(changed.some((path) => path.endsWith("/index.md")) && changed.some((path) => path.endsWith("/entscheidungen.md")), "a new queue: index and decisions");
    assert.equal(fileAt(w, "SPEC.md"), SPEC, "SPEC.md is byte-identical");
    const lines = trailer(git(w.product, "log", "-1", "--format=%B", writer[0]));
    assert.deepEqual(lines.filter((line) => !line.startsWith("Agent-M-Rounds")), expectedProvenance(w, REQUIREMENTS_JOB, "change-requirements", 0).filter((line) => !line.startsWith("Agent-M-Rounds")));
    assert.match(lines.find((line) => line.startsWith("Agent-M-Rounds")), /^Agent-M-Rounds: \d+$/);
    assert.match(fileAt(w, `docs/jobs/${REQUIREMENTS_JOB}.md`), /## End[^]*state: done/);
  });
});

// ---------------------------------------------------------------- a derivation of use cases

// TST-473200 · level: unit · module: MOD-workflow-entries
// guards: A CI AGENT'S DRAFT ENTERS AS OPEN; ONE DEFINITION, THREE DRIVERS; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// given: a product with a requirement that no use case realises and a queued job of `derive-use-cases` that names it; a fixture endpoint that answers one new use case, under a placeholder identifier
// input: onRecordsChanged
// expect: outcome `done`; one commit by the writer that adds the use case under the next free identifier, UC-001, as an open file — no record —, its message ending with the provenance lines of the job
test("onRecordsChanged — a queued derive-use-cases job ends in one commit of a new open use case", async () => {
  const derive = (agentM) => ({ ...jobStart(USE_CASE_JOB, "derive-use-cases", { requirements: [RULE], instruction: INSTRUCTION }, agentM), worksOn: [RULE] });
  await withWorkspace({ records: (agentM) => [recordFile(derive(agentM))], extra: { "SPEC.md": SPEC, "docs/sources.md": LINKS } }, async (w) => {
    fakeWorld({ files: [{ path: "docs/use-cases/UC-900-check-out-a-book.md", text: useCase("The member borrows a book.").replaceAll("UC-001", "UC-900"), class: "new" }] }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(fileAt(w, UC_PATH), useCase("The member borrows a book."));
    const writer = git(w.product, "log", "--format=%H", "--grep=^draft UC-001", "main").split("\n").filter(Boolean);
    assert.equal(writer.length, 1, "one commit of the writer");
    assert.deepEqual(trailer(git(w.product, "log", "-1", "--format=%B", writer[0])).filter((line) => !line.startsWith("Agent-M-Rounds")),
      expectedProvenance(w, USE_CASE_JOB, "derive-use-cases", 0).filter((line) => !line.startsWith("Agent-M-Rounds")));
    assert.equal(git(w.product, "ls-tree", "-r", "--name-only", "main").split("\n").filter((path) => path.startsWith("docs/approvals/")).length, 0, "no record: the file is open");
  });
});
