// A hosted job of the prompt bar's kind `converse` writes what its participant proposed (UC-049 4f), as docs/architecture/MOD-workflow-entries.md states it: "A job whose draft holds
// a plan (MOD-job-runner's `hand-over`, UC-049 4f) hands over each of its pieces whose `after` is empty and whose kind is not the job's own as a job of its own, on this route, with the
// same participant — built from `declares` where the record holds it —: its parameters the job's `source`, those MOD-job-runner's `handOverParams` gives for what it works on, and
// `refuses` naming `hand-over`. … [it] prepares each with its kind's preconditions and no start rule of the product's process, and hands it over with MOD-runtimes' `handOverJob`,
// its start's `startedBy` the job … and its task the input `task` of the run it starts, standing in no file. Each runs in a run of its own as `onDispatch` runs a hand-over, by its
// kind's definition and unattended, so that its writer writes at once — a change of requirements as an open entry of a new queue, a use case or an architecture file as open, a
// change of code as a pull request, which it does not merge; no job writes an approval record —, and its own record lists its results. A piece … of the job's own kind, of a kind that
// takes no instruction …, or one whose job does not start, is not handed over, and the job's end names it with why … The end lists, beside the job's own results, `handed over: <kind>
// — <JOB-id>` for each piece handed over." Where the run has one machine, as here, the piece is handed over there. And MOD-job-runner's built-in writer `proposed-edits`: the edits
// of a `converse` job nobody attends, in one commit on a new branch `agent-m/<job>` and a pull request of it, never a commit on the default branch.
// Run: node --test tests/workflow-entries-converse-proposals.test.mjs
//
// Module: MOD-workflow-entries · MOD-job-runner
// Guards: UC-049; A CI AGENT'S DRAFT ENTERS AS OPEN; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; A SPEC EDIT IS SAVED AS A PROPOSAL
// Level: component
//
// Deterministic, no network: the product and the instance are temporary git repositories laid out as the job workflow lays them out (the fixture of
// tests/workflow-entries-design-kinds.test.mjs is the model), the instance holding the participant, the register entries of the book — chapters 8 to 12, which the recipes
// `chapters-for-requirements` and `chapters-for-architecture` read — and of the person's source, which the product links. One fake `fetch` stands for the world: the model endpoint
// (OpenAI-compatible), which answers by the kind whose prompt it is sent — the converse prompt, or a change kind's —, and the repository server's API — the history of the product, which the
// writer `open-files` reads, and the pull request the writer `proposed-edits` opens. The jobs run from their records (onRecordsChanged); the last test runs one whose task travels with its
// hand-over (onDispatch), whose kinds only read and draft text, so that it runs through Agent M's own job runner calling the endpoint, and a fixture `opencode` on the PATH shows it is not started. Where the module files leave a reading open, the test states the one it takes, and the pull request names it:
//   - A result line of the end is a commit, a file path, a pull request's address, a writer's note as `note: <note>`, a piece handed over as `handed over: <kind> — <JOB-id>`, or a
//     piece not handed over as `not run: <kind> — <why>`.
//   - The piece's run is the run the start of its job workflow asks for: onDispatch with that start's inputs, here on the same workspace.
//   - "The status of a reviewed file" is MOD-approvals' statuses over the product's default branch; a file the run changed is not accepted.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRecord } from "../src/job-ledger/index.mjs";
import { statuses } from "../src/approvals/index.mjs";
import { architectureImpact, traceGraph } from "../src/trace-graph/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const entries = await import("../src/workflow-entries/main.mjs").catch((error) => ({ error }));
const { runEntry } = entries;
const REAL_GIT = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();
const REAL_SLEEP = spawnSync("sh", ["-c", "command -v sleep"], { encoding: "utf8" }).stdout.trim();

// ---------------------------------------------------------------- the fixtures

const text = (...lines) => `${lines.join("\n")}\n`;
const sha256 = (body) => createHash("sha256").update(body).digest("hex");
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const NOW = new Date("2026-10-26T09:00:00Z");
const TOKEN = "ghp_ALICEagentMtoken0123456789abcdef";
const KEY = "sk-FIXTURE-KEY-0123456789abcdef";
const ENDPOINT = { name: "fixture", kind: "openai-compatible", baseUrl: "https://llm.example.test/v1", model: "fixture-llm" };

const RULE = "A LOAN HAS A DUE DATE";
const RULE_TEXT = "Every loan states the date by which the book is returned.";
const SPEC = text("# Thesis tool — Specification", "", "## Lending", "", `**${RULE}** *(SRC-fixture-po)*`, RULE_TEXT, "*Check:* `tests/loan.test.mjs`");
const useCase = (goal) => text("---", "id: UC-001", "title: Check out a book", "area: lending", "actors:", "  - Member", "realises:", `  - ${RULE}`, "---",
  "# UC-001 Check out a book", "", `**Goal.** ${goal}`);
const UC_PATH = "docs/use-cases/UC-001-check-out-a-book.md";
const UC_BEFORE = useCase("The member borrows a book at the desk.");
const UC_AFTER = useCase("The member borrows a book at the desk and is told the date it is due.");
const DIAGRAM = ["", "```mermaid", "flowchart LR", "    Desk --> Shelf", "```", ""];
const decision = (decided) => text("---", "id: ARC-001", "title: Lending is a desk", "forced_by:", `  - ${RULE}`, "---", "# ARC-001 Lending is a desk", "", "## Context", "",
  "Books are lent at a desk.", "", "## Decision", "", decided, ...DIAGRAM, "## Alternatives", "", "One module.", "", "## Consequences", "", "Two folders.");
const ARC_PATH = "docs/architecture/ARC-001-lending-is-a-desk.md";
const ARC_BEFORE = decision("The desk and the shelf are two modules.");
const ARC_AFTER = decision("The desk and the shelf are two modules, and the desk tells the due date.");
const MOD_PATH = "docs/architecture/MOD-reader.md";
const MOD_READER = text("---", "id: MOD-reader", "title: Reading a book", "folder: src/reader/", "realises:", `  - ${RULE}`, "follows:", "  - ARC-001", "uses:", "provides:",
  "  - lend", "---", "# MOD-reader Reading a book", "", "## Responsibility", "", "It lends a book.", ...DIAGRAM, "## Parts", "", "- `index.mjs`", "", "## Data", "", "Nothing.", "",
  "## Interfaces", "", "- `lend`", "", "## Files", "", "None.", "", "## Uses", "", "Nothing.");
// The approval records of the use case, the decision and the module as they stand: each is accepted before the run.
const RECORDS = Object.fromEntries([["UC-001", UC_BEFORE], ["ARC-001", ARC_BEFORE], ["MOD-reader", MOD_READER]]
  .map(([id, body]) => [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`, text("---", `id: ${id}`, "kind: approval", "---", `# Approval of ${id}`)]));

const PO = "SRC-fixture-po";
const PO_ENTRY = text("---", `id: ${PO}`, "title: Fixture PO", "kind: document", "authority: normative", "licence: may be republished — fixture", "---",
  `# ${PO} Fixture PO`, "", "A fixture source.", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`2026-10-05\` | 2026-10-05 | — | the fixture | 1 file, listed below; version hash \`${"1".repeat(64)}\` |`, "", "### Files of 2026-10-05", "", "| File | SHA-256 |", "|---|---|",
  `| \`po.md\` | \`${"a".repeat(64)}\` |`);
const CHAPTERS = [8, 9, 10, 11, 12].map((n) => [`${String(n).padStart(2, "0")}_chapter-${n}.md`, `Chapter ${n} of the fixture book.\n`]);
const BOOK_ENTRY = text("---", "id: SRC-vibe-coding", "title: Vibe Coding", "kind: document", "authority: normative", "licence: may be republished — fixture", "---",
  "# SRC-vibe-coding Vibe Coding", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`2026-10-05\` | 2026-10-05 | — | the fixture | ${CHAPTERS.length} files, listed below; version hash \`${sha256(CHAPTERS.map(([name, body]) => `${sha256(body)}  ${name}\n`).join(""))}\` |`,
  "", "### Files of 2026-10-05", "", "| File | SHA-256 |", "|---|---|", ...CHAPTERS.map(([name, body]) => `| \`${name}\` | \`${sha256(body)}\` |`));
const LINKS = text("# The sources this product meets", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| ${PO} | 2026-10-05 | ${"1".repeat(64)} | |`);

// Agent M's own SPEC.md, which the fixture instance holds: a kind of requirement-form takes the form its draft is checked by from it.
const INSTANCE_SPEC = readFileSync(new URL("../SPEC.md", import.meta.url), "utf8");
const PARTICIPANTS = text("# Participants of this instance", "",
  "| Name | Type | Model |", "|---|---|---|",
  "| ci-bot | agent | fixture-llm |");

const PRODUCT_FILES = { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, "docs/sources.md": LINKS, [UC_PATH]: UC_BEFORE, [ARC_PATH]: ARC_BEFORE, [MOD_PATH]: MOD_READER, ...RECORDS,
  ".github/workflows/agent-m-jobs.yml": "name: agent-m-jobs\n" };
const INSTRUCTION = "Tell the member the due date";
const JOB = "JOB-20261026-0800-a1b2";
// The record names the connection ci-bot runs on — the endpoint whose key is the CI secret FIXTURE_KEY — and what it declares (MOD-job-ledger).
const converseStart = (agentM, params = {}) => ({ id: JOB, kind: "converse", worksOn: ["https://github.com/alice/thesis-tool"], participant: "ci-bot", model: "fixture-llm",
  route: "ci hosted endpoint ci-bot secret FIXTURE_KEY", declares: { context: 100000, capabilities: ["draft text", "read the repository"] }, run: null, retries: null, startedBy: "alice", start: new Date("2026-10-26T08:00:00Z"), agentM, inputs: [], limit: 2,
  destinations: [{ participant: "ci-bot", place: "GitHub's hosted runners", parts: ["instruction"] }], params: { endpoint: ENDPOINT, instruction: INSTRUCTION, source: PO, ...params } });
const recordFile = (start) => { const { path, text: body } = startRecord(start); return [path, body]; };

function git(cwd, ...args) {
  const r = spawnSync(REAL_GIT, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function write(root, files) {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
}
// A bare origin whose `main` holds `files`, and the clone of it the workflow checks out into `folder`; no git maintenance in either (as tests/workflow-entries-design-kinds.test.mjs).
const NO_MAINTENANCE = ["-c", "gc.auto=0", "-c", "maintenance.auto=false", "-c", "receive.autogc=false"];
const quiet = (dir) => { for (const [key, value] of [["gc.auto", "0"], ["maintenance.auto", "false"], ["receive.autogc", "false"]]) git(dir, "config", key, value); };
function repository(root, name, files, folder) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  quiet(origin);
  git(root, "clone", "-q", ...NO_MAINTENANCE, origin, seed);
  quiet(seed);
  git(seed, "config", "user.name", "Seed");
  git(seed, "config", "user.email", "seed@example.org");
  write(seed, files);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  mkdirSync(join(folder, ".."), { recursive: true });
  git(root, "clone", "-q", ...NO_MAINTENANCE, origin, folder);
  quiet(folder);
  git(folder, "config", "user.name", "Alice Agent M token");
  git(folder, "config", "user.email", "alice@example.org");
  return origin;
}

// The workspace of a job workflow: product/ and instance/, the product holding the converse job's record.
async function withWorkspace(params, run, { extraBin = null, files = {} } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-converse-")));
  const workspace = join(root, "ws");
  try {
    const instance = repository(root, "instance", { "README.md": "# Instance\n", "SPEC.md": INSTANCE_SPEC, "AGENTS.md": RULES_TEXT, "docs/participants.md": PARTICIPANTS, [`docs/sources/${PO}.md`]: PO_ENTRY,
      "docs/sources/SRC-vibe-coding.md": BOOK_ENTRY, ...Object.fromEntries(CHAPTERS.map(([name, body]) => [`docs/sources/SRC-vibe-coding/2026-10-05/${name}`, body])) },
    join(workspace, "instance"));
    const agentM = { version: "2026.10.0", commit: git(join(workspace, "instance"), "rev-parse", "HEAD") };
    const start = typeof params === "function" ? params(agentM) : converseStart(agentM, params);
    const product = repository(root, "product", { ...PRODUCT_FILES, ...files, ...Object.fromEntries([recordFile(start)]) }, join(workspace, "product"));
    const base = git(product, "rev-parse", "main");
    return await run({ root, workspace, product, instance, agentM, base, head: git(join(workspace, "product"), "rev-parse", "HEAD"), productDir: join(workspace, "product"), extraBin });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

const environment = (w, extra = {}) => ({ GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_WORKSPACE: w.workspace, GITHUB_SERVER_URL: "https://github.com",
  GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: w.head, GITHUB_RUN_ID: "4711", GITHUB_ACTOR: "alice",
  AGENT_M_RUNNER: "hosted", AGENT_M_PRODUCT_DIR: w.productDir, AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN", AGENT_M_KEY_NAMES: "FIXTURE_KEY", AGENT_M_TOKEN: TOKEN,
  FIXTURE_KEY: KEY, ...extra });
const fileAt = (w, path, ref = "main") => `${git(w.product, "show", `${ref}:${path}`)}\n`;
const pathsAt = (w, ref = "main") => git(w.product, "ls-tree", "-r", "--name-only", ref).split("\n").filter(Boolean);
const endOf = (w) => fileAt(w, `docs/jobs/${JOB}.md`).split(/^## End$/m)[1] ?? "";
// The commits the run made on any branch, beyond the product's first state, and every path they touched.
const madeSince = (w) => git(w.product, "rev-list", "--all", `^${w.base}`).split("\n").filter(Boolean);
const touched = (w) => [...new Set(madeSince(w).flatMap((sha) => git(w.product, "diff-tree", "--no-commit-id", "--name-only", "-r", sha).split("\n").filter(Boolean)))];
// A snapshot of the product's main for MOD-approvals' statuses and MOD-trace-graph's traceGraph: its paths, each file's blob and text.
function snapshotAt(w, ref = "main") {
  const blobs = new Map(git(w.product, "ls-tree", "-r", ref).split("\n").filter(Boolean).map((line) => { const [meta, path] = line.split("\t"); return [path, meta.split(" ")[2]]; }));
  return { paths: [...blobs.keys()], blob: (path) => blobs.get(path) ?? null, read: async (path) => (blobs.has(path) ? fileAt(w, path, ref) : null) };
}

// The world: the model endpoint, which answers by the prompt it is sent — a change kind's draft for the prompt of that kind, the conversation's draft for any other —, and the repository
// server's API: the product's history, answered from its origin by git, the pull requests, of which every opening is kept, and the starts of the job workflow, each kept with its
// inputs (204).
const PROMPTS = { "change-requirements": "You change requirements of a product", "change-use-case": "You change a use case of a product", "change-architecture": "You change the architecture of a product" };
// Agent M's AGENTS.md of the fixture instance, which every input to a model begins with.
const RULES_TEXT = "# AGENTS.md — the fixture's working rules, marker rules-1360109\n";

function fakeWorld(drafts, w) {
  const requests = [], pulls = [], dispatches = [];
  globalThis.fetch = async (address, init = {}) => {
    const url = String(address), body = String(init.body ?? "");
    requests.push({ address: url, method: init.method ?? "GET", body });
    if (url === "https://api.github.com/repos/alice/thesis-tool/actions/workflows/agent-m-jobs.yml/dispatches" && init.method === "POST") {
      dispatches.push(JSON.parse(body));
      return new Response(null, { status: 204 });
    }
    if (url.startsWith("https://llm.example.test/")) {
      const kind = Object.keys(PROMPTS).find((name) => body.includes(PROMPTS[name])) ?? "converse";
      const content = JSON.stringify({ draft: drafts[kind], answers: [] });
      return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 120, completion_tokens: 30 } }), { status: 200 });
    }
    if (url === "https://api.github.com/repos/alice/thesis-tool/pulls" && (init.method ?? "GET") === "POST") {
      const asked = JSON.parse(body);
      pulls.push(asked);
      return new Response(JSON.stringify({ number: 7, title: asked.title, head: { ref: asked.head, sha: "0".repeat(40) }, base: { ref: asked.base, sha: "0".repeat(40) }, state: "open",
        merged_at: null, draft: false, body: asked.body, html_url: "https://github.com/alice/thesis-tool/pull/7", created_at: NOW.toISOString(), closed_at: null }), { status: 201 });
    }
    const listed = /^https:\/\/api\.github\.com\/repos\/alice\/thesis-tool\/commits\?/.exec(url);
    const one = /^https:\/\/api\.github\.com\/repos\/alice\/thesis-tool\/commits\/([0-9a-f]{40})\?/.exec(url);
    if (listed) {
      const page = Number(new URL(url).searchParams.get("page") ?? "1");
      const shas = page === 1 ? git(w.product, "log", "--format=%H", "main").split("\n").filter(Boolean) : [];
      return new Response(JSON.stringify(shas.map((sha) => ({ sha, parents: git(w.product, "log", "-1", "--format=%P", sha).split(" ").filter(Boolean).map((p) => ({ sha: p })),
        author: null, commit: { author: { name: "x" }, committer: { date: "2026-10-26T08:00:00Z" }, message: git(w.product, "log", "-1", "--format=%s", sha) } }))), { status: 200 });
    }
    if (one) {
      const changes = git(w.product, "diff-tree", "--no-commit-id", "--name-status", "-r", "--root", one[1]).split("\n").filter(Boolean).map((line) => line.split("\t"));
      const status = { A: "added", M: "modified", D: "removed" };
      return new Response(JSON.stringify({ files: changes.map(([s, filename]) => ({ filename, status: status[s] ?? "modified" })) }), { status: 200 });
    }
    return new Response(JSON.stringify({ message: "not found" }), { status: 404 });
  };
  return { requests, pulls, get dispatches() { return dispatches.map((each) => ({ ...each, inputs: each.inputs })); }, prompted: (kind) => requests.filter((each) => each.address.startsWith("https://llm.example.test/") && each.body.includes(PROMPTS[kind])).length };
}
const run = (w) => { assert.ok(runEntry, `runEntry: ${entries.error?.message}`); return runEntry("onRecordsChanged", environment(w), { now: NOW }); };
// The conversation's draft: its answer, and a plan of one piece, which rests on none.
const answer = (piece, extra = {}) => ({ answer: "Done as you asked.", ...(piece ? { handOver: [{ after: [], ...piece }] } : {}), ...extra });
const noApprovalWritten = (w) => assert.deepEqual(touched(w).filter((path) => path.startsWith("docs/approvals/")), [], "no approval record is written by the job");

// ---------------------------------------------------------------- a piece of the plan handed over, and its own run

// The piece's job the conversation's run handed over: the one start of the job workflow it made, with its inputs.
const handedOverStart = (world) => { assert.equal(world.dispatches.length, 1, "the conversation's run starts the job workflow once, for its piece"); return world.dispatches[0].inputs; };
// The run of a piece handed over, as the start it made runs it: onDispatch with that start's inputs, in a checkout of main as it stands now, as a run's checkout is.
const runPiece = (w, inputs, extra = {}) => {
  git(w.productDir, "fetch", "-q", "origin");
  git(w.productDir, "reset", "-q", "--hard", "origin/main");
  return runEntry("onDispatch", environment(w, { GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_EVENT_PATH: eventFile(w, inputs), ...extra }), { now: NOW });
};
const eventFile = (w, inputs) => { const payload = join(w.root, `event-${inputs.job}.json`); writeFileSync(payload, JSON.stringify({ inputs })); return payload; };
// The commits on main of the writer of a kind: those whose provenance lines name it, less the end of a job's record, which names its kind too.
const writerOf = (w, kind) => git(w.product, "log", "--format=%H %s", `--grep=Agent-M-Kind: ${kind}`, "main").split("\n").filter(Boolean)
  .filter((line) => !/^\S+ end JOB-/.test(line)).map((line) => line.split(" ")[0]);
const endOfJob = (w, id) => fileAt(w, `docs/jobs/${id}.md`).split(/^## End$/m)[1] ?? "";

// TST-1360101 · level: component · module: MOD-workflow-entries
// guards: UC-049; A CI AGENT'S DRAFT ENTERS AS OPEN; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; A SPEC EDIT IS SAVED AS A PROPOSAL; A RUN IS A JOB THAT NAMES ITS JOBS
// given: a product with the requirement A LOAN HAS A DUE DATE, the person's source SRC-fixture-po linked, the job workflow, and a queued hosted job of `converse` whose parameters hold that source and the endpoint; the endpoint answers the conversation with the plan [{ change-requirements, [the requirement], "say the due date" }] and the change of requirements with the new text of the section Lending that changes the requirement, and why
// input: onRecordsChanged; then onDispatch with the inputs of the start it made
// expect: the first: outcome `done`; the prompt of change-requirements is not sent in this run; the job workflow is started once, with the inputs job (a new job), task "say the due date", the endpoint and secret FIXTURE_KEY; the new job's record names the conversation's job as started_by, and the conversation's end lists `handed over: change-requirements — <it>`. The second: outcome `done`; the prompt of change-requirements is sent once; one new queue under docs/spec-freigaben/ holds the entry — its rationale with an impact list naming UC-001 — and no approval record names it; SPEC.md is byte-identical; the piece's own end says `state: done` and lists the writer's commit and the entry's proposal; no approval record is written
test("TST-1360101: a hosted converse job's piece of change-requirements is handed over as a job of its own, whose run ends in an open SPEC change entry", async () => {
  await withWorkspace({}, async (w) => {
    const world = fakeWorld({ converse: answer({ kind: "change-requirements", works_on: [RULE], task: "say the due date" }),
      "change-requirements": { sections: [text("## Lending", "", `**${RULE}** *(SRC-fixture-po)*`, `${RULE_TEXT} The member is told the date.`, "*Check:* `tests/loan.test.mjs`")],
        why: "The member must know the due date." } }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(world.prompted("change-requirements"), 0, "the piece does not run in the conversation's run");
    const inputs = handedOverStart(world);
    assert.deepEqual({ ...inputs, job: "<new>" }, { job: "<new>", task: "say the due date", endpoint: JSON.stringify({ kind: ENDPOINT.kind, baseUrl: ENDPOINT.baseUrl, model: ENDPOINT.model }),
      secret: "FIXTURE_KEY" });
    assert.match(fileAt(w, `docs/jobs/${inputs.job}.md`), new RegExp(`^started_by: ${JOB}$`, "m"));
    assert.ok(resultLines(endOf(w)).includes(`handed over: change-requirements — ${inputs.job}`), endOf(w));

    const piece = await runPiece(w, inputs);
    assert.equal(piece.outcome, "done", piece.summary);
    assert.equal(world.prompted("change-requirements"), 1, "the change of requirements ran once, in the piece's own run");
    const queued = touched(w).filter((path) => path.startsWith("docs/spec-freigaben/"));
    assert.ok(queued.some((path) => path.endsWith("/index.md")) && queued.some((path) => /\/\d\d-[^/]+\.md$/.test(path) && !path.endsWith(".begruendung.md")), queued.join(", "));
    const rationale = queued.find((path) => path.endsWith(".begruendung.md"));
    assert.ok(rationale, "a rationale is written");
    assert.match(fileAt(w, rationale), /\*\*Impact list\.\*\*[^]*UC-001/, "the impact list names the use case that realises the requirement");
    assert.equal(fileAt(w, "SPEC.md"), SPEC, "SPEC.md is byte-identical");
    noApprovalWritten(w);
    const end = endOfJob(w, inputs.job);
    assert.match(end, /state: done/);
    const writer = writerOf(w, "change-requirements");
    assert.equal(writer.length, 1, "one commit of the change's writer");
    assert.ok(end.includes(writer[0]), "the piece's end lists the writer's commit");
    // The writer spec-edits lists of each section it writes the entry's proposal (TST-2026110905), not the rationale beside it.
    const proposal = queued.find((path) => /\/\d\d-[^/]+\.md$/.test(path) && !path.endsWith(".begruendung.md") && !path.endsWith(".plaetze.md"));
    assert.ok(end.includes(proposal), "the piece's end lists the entry's proposal");
  });
});

// TST-1360102 · level: component · module: MOD-workflow-entries
// guards: UC-049; THE PERSON WHO PROMPTS IS A SOURCE
// given: the same product, and a hosted converse job whose parameters hold no `source`; the endpoint answers the same plan of change-requirements
// input: onRecordsChanged
// expect: outcome `done`; the prompt of change-requirements is never sent and the job workflow is not started; nothing under docs/spec-freigaben/ is written; the end lists a line `not run: change-requirements — ` naming THE PERSON WHO PROMPTS IS A SOURCE
test("TST-1360102: a piece of change-requirements without the person's own source is not handed over, and the end says why", async () => {
  await withWorkspace({ source: undefined }, async (w) => {
    const world = fakeWorld({ converse: answer({ kind: "change-requirements", works_on: [RULE], task: "say the due date" }), "change-requirements": { sections: [], why: "none" } }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(world.prompted("change-requirements"), 0);
    assert.equal(world.dispatches.length, 0);
    assert.deepEqual(touched(w).filter((path) => path.startsWith("docs/spec-freigaben/")), []);
    assert.match(endOf(w), /not run: change-requirements — [^\n]*THE PERSON WHO PROMPTS IS A SOURCE/);
  });
});

// TST-2026110813 · level: component · module: MOD-workflow-entries
// guards: UC-049; THE PERSON WHO PROMPTS IS A SOURCE; A FINDING READS LIKE A COMPILER MESSAGE
// given: the job of TST-1360102 — a hosted converse job whose parameters hold no `source`, the endpoint answering a plan of change-requirements —, so that the
//   precondition person-source keeps the piece from starting (UC-049 4a.5)
// input: onRecordsChanged
// expect: the end lists one line `not run: change-requirements — <what> [THE PERSON WHO PROMPTS IS A SOURCE] — <fix>`: the finding's what, its rule in brackets, then ` — `
//   and its fix, which names what the piece requires — the owner of the instance's repository —; the fix is not cut away
test("TST-2026110813: a piece kept from starting by a finding lists the finding as <what> [<rule>] — <fix>", async () => {
  await withWorkspace({ source: undefined }, async (w) => {
    fakeWorld({ converse: answer({ kind: "change-requirements", works_on: [RULE], task: "say the due date" }), "change-requirements": { sections: [], why: "none" } }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    const line = endOf(w).split("\n").find((each) => each.includes("not run: change-requirements — ")) ?? "";
    assert.match(line, /not run: change-requirements — \S[^\n]* \[THE PERSON WHO PROMPTS IS A SOURCE\] — \S[^\n]*owner/);
  });
});

// TST-1360103 · level: component · module: MOD-workflow-entries
// guards: UC-049; A CI AGENT'S DRAFT ENTERS AS OPEN
// given: the use case UC-001, accepted (an approval record names its text); a hosted converse job; the endpoint answers the conversation with the plan [{ change-use-case, [UC-001] }] and the change of the use case with UC-001's new text, classed a change of UC-001
// input: onRecordsChanged; then onDispatch with the inputs of the start it made
// expect: outcome `done` both times; the prompt of change-use-case is sent in the piece's run alone; UC-001's file on main is the drafted text; its status is not accepted — known positive: before the run it was accepted —; no approval record is written; the piece's end lists the writer's commit and UC-001's path
test("TST-1360103: a use case edit handed over from a hosted job is committed as not accepted in the piece's own run", async () => {
  await withWorkspace({}, async (w) => {
    const before = statuses(snapshotAt(w, w.base));
    assert.equal([...before.values()].find((each) => each.id === "UC-001").status, "accepted", "known positive: UC-001 is accepted before the run");
    const world = fakeWorld({ converse: answer({ kind: "change-use-case", works_on: ["UC-001"], task: "tell the due date" }),
      "change-use-case": { files: [{ path: UC_PATH, text: UC_AFTER, class: "change", of: "UC-001" }] } }, w);
    assert.equal((await run(w)).outcome, "done");
    assert.equal(world.prompted("change-use-case"), 0, "not in the conversation's run");
    const inputs = handedOverStart(world);
    const status = await runPiece(w, inputs);
    assert.equal(status.outcome, "done", status.summary);
    assert.ok(world.prompted("change-use-case") >= 1, "the change of the use case ran in the piece's run");
    assert.equal(fileAt(w, UC_PATH), UC_AFTER);
    assert.notEqual([...statuses(snapshotAt(w)).values()].find((each) => each.id === "UC-001").status, "accepted", "the changed use case is not accepted");
    noApprovalWritten(w);
    const writer = writerOf(w, "change-use-case");
    assert.equal(writer.length, 1);
    const end = endOfJob(w, inputs.job);
    assert.ok(end.includes(writer[0]) && end.includes(UC_PATH), end);
  });
});

// TST-1360104 · level: component · module: MOD-workflow-entries
// guards: UC-049; AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; A CI AGENT'S DRAFT ENTERS AS OPEN
// given: the accepted decision ARC-001 and the module MOD-reader, which follows it; a hosted converse job; the endpoint answers the conversation with the plan [{ change-architecture, [ARC-001] }] and the change of the architecture with ARC-001's new text, classed a change of ARC-001
// input: onRecordsChanged; then onDispatch with the inputs of the start it made
// expect: outcome `done` both times; the prompt of change-architecture is sent in the piece's run; ARC-001's file on main is the drafted text, its status no longer accepted; the impact list of the change — MOD-trace-graph's architectureImpact on main's graph, from the text last accepted to the text on main — names MOD-reader; no approval record is written; the piece's end lists the writer's commit and ARC-001's path
test("TST-1360104: an architecture change handed over from a hosted job is committed open in the piece's own run, and keeps its impact list", async () => {
  await withWorkspace({}, async (w) => {
    const world = fakeWorld({ converse: answer({ kind: "change-architecture", works_on: ["ARC-001"], task: "the desk tells the due date" }),
      "change-architecture": { files: [{ path: ARC_PATH, text: ARC_AFTER, class: "change", of: "ARC-001" }] } }, w);
    assert.equal((await run(w)).outcome, "done");
    const inputs = handedOverStart(world);
    const status = await runPiece(w, inputs);
    assert.equal(status.outcome, "done", status.summary);
    assert.ok(world.prompted("change-architecture") >= 1, `the change of the architecture ran: ${endOfJob(w, inputs.job)}`);
    assert.equal(fileAt(w, ARC_PATH), ARC_AFTER);
    const now = snapshotAt(w);
    assert.equal([...statuses(now).values()].find((each) => each.id === "ARC-001").status, "changed", "the decision is changed since its acceptance, not accepted");
    const impact = architectureImpact(await traceGraph(now), [{ path: ARC_PATH, before: ARC_BEFORE, after: fileAt(w, ARC_PATH) }]);
    assert.ok(impact.modules.some((each) => each.id === "MOD-reader"), JSON.stringify(impact));
    noApprovalWritten(w);
    const writer = writerOf(w, "change-architecture");
    assert.equal(writer.length, 1);
    assert.ok(endOfJob(w, inputs.job).includes(writer[0]) && endOfJob(w, inputs.job).includes(ARC_PATH));
  });
});

// ---------------------------------------------------------------- the conversation's own edits, and a piece not handed over

// TST-1360106 · level: component · module: MOD-workflow-entries · MOD-job-runner
// guards: UC-049; A CI AGENT'S DRAFT ENTERS AS OPEN; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: a hosted converse job; the endpoint answers the conversation with the edits docs/notes.md (a document it may propose) and SPEC.md (one it may not), and no plan
// input: onRecordsChanged
// expect: outcome `done`; main holds no docs/notes.md and SPEC.md is byte-identical; the branch agent-m/<job> holds docs/notes.md as drafted, in one commit whose message ends with the job's provenance lines; one pull request of that branch into main was opened; the end lists that commit, docs/notes.md, the pull request's address and a note naming SPEC.md as not written; no approval record is written
test("TST-1360106: a hosted converse job's edits are written as a pull request, and its record lists them", async () => {
  await withWorkspace({}, async (w) => {
    const notes = text("# Notes", "", "The desk tells the due date.");
    const world = fakeWorld({ converse: answer(null, { edits: [{ path: "docs/notes.md", text: notes }, { path: "SPEC.md", text: "# changed\n" }] }) }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    assert.ok(!pathsAt(w).includes("docs/notes.md"), `main holds no proposed document: ${pathsAt(w).join(" ")}`);
    assert.equal(fileAt(w, "SPEC.md"), SPEC);
    const branch = `agent-m/${JOB}`;
    assert.equal(fileAt(w, "docs/notes.md", branch), notes);
    const commit = git(w.product, "rev-parse", branch);
    assert.match(git(w.product, "log", "-1", "--format=%B", commit), new RegExp(`Agent-M-Job: ${JOB}[^]*Agent-M-Kind: converse`));
    assert.equal(world.pulls.length, 1);
    assert.deepEqual([world.pulls[0].head, world.pulls[0].base], [branch, "main"]);
    const end = endOf(w);
    for (const result of [commit, "docs/notes.md", "https://github.com/alice/thesis-tool/pull/7"]) assert.ok(end.includes(result), `the end lists ${result}`);
    assert.match(end, /note: [^\n]*SPEC\.md/);
    noApprovalWritten(w);
  });
});

// TST-1360107 · level: component · module: MOD-workflow-entries
// guards: UC-049; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
// given: a hosted converse job; the product's backlog holds ITM-004, which realises the accepted UC-001 — no process declaration, no sprint, no role assignment —; the endpoint answers with the plan [{ change-use-case, [ITM-004, UC-001] }] and the change of the use case with UC-001's new text; and, in a second world, with the plan [{ converse, [UC-001] }]
// input: onRecordsChanged for each, and in the first onDispatch of the start it made
// expect: the first: the piece is handed over — the end lists `handed over: change-use-case — <its job>` and no `not run` — and its run writes UC-001's drafted text. The second: only the conversation was sent, no job workflow started, the end lists `not run: converse — ` naming that it is the conversation itself, and nothing but the job's own record is written
test("TST-1360107: a piece that works on an item of the backlog is handed over and runs by its kind's definition; the conversation itself is not handed over", async () => {
  const backlog = { "docs/backlog/ITM-004-due-date.md": text("---", "id: ITM-004", "title: Tell the due date", "realises:", "  - UC-001", "modules:", "  - MOD-reader", "origin:",
    "  - the fixture", "---", "# ITM-004 Tell the due date", "", "## Outcome", "", "The member is told the date.", "", "## Acceptance", "", "The date is shown.") };
  await withWorkspace({}, async (w) => {
    const world = fakeWorld({ converse: answer({ kind: "change-use-case", works_on: ["ITM-004", "UC-001"], task: "tell the due date" }),
      "change-use-case": { files: [{ path: UC_PATH, text: UC_AFTER, class: "change", of: "UC-001" }] } }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    const inputs = handedOverStart(world);
    assert.ok(resultLines(endOf(w)).includes(`handed over: change-use-case — ${inputs.job}`), endOf(w));
    assert.doesNotMatch(endOf(w), /not run/);
    assert.equal((await runPiece(w, inputs)).outcome, "done");
    assert.equal(fileAt(w, UC_PATH), UC_AFTER);
  }, { files: backlog });
  await withWorkspace({}, async (w) => {
    const world = fakeWorld({ converse: answer({ kind: "converse", works_on: ["UC-001"], task: "go on" }) }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(world.requests.filter((each) => each.address.startsWith("https://llm.example.test/")).length, 1, "only the conversation was sent");
    assert.equal(world.dispatches.length, 0);
    assert.match(endOf(w), /not run: converse — [^\n]*this conversation itself/);
    assert.deepEqual(touched(w), [`docs/jobs/${JOB}.md`]);
  }, { files: backlog });
});

// TST-8048007 · level: component · module: MOD-workflow-entries
// guards: UC-049
// given: a hosted converse job; the endpoint answers with the plan [{ propose-items, [UC-001], "propose the items" }] — a kind whose result waits for a person, working on no item of the plan, whose recipes do not name `instruction`; known positive: the piece of change-use-case of TST-1360103, which takes the task, is handed over
// input: onRecordsChanged
// expect: outcome `done`; only the conversation is sent to the endpoint and no job workflow is started; the end lists `not run: propose-items — ` naming THE HAND-OVER NAMES THE TASK IN ITS WORDS; nothing but the job's own record is written
test("TST-8048007: a piece of a kind that takes no instruction is not handed over, and the end says why", async () => {
  await withWorkspace({}, async (w) => {
    const world = fakeWorld({ converse: answer({ kind: "propose-items", works_on: ["UC-001"], task: "propose the items" }) }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(world.requests.filter((each) => each.address.startsWith("https://llm.example.test/")).length, 1, "only the conversation was sent");
    assert.equal(world.dispatches.length, 0);
    assert.match(endOf(w), /not run: propose-items — [^\n]*THE HAND-OVER NAMES THE TASK IN ITS WORDS/);
    assert.deepEqual(touched(w), [`docs/jobs/${JOB}.md`]);
  });
});

// ---------------------------------------------------------------- an answer that cannot be read

// TST-2026271044 · level: component · module: MOD-workflow-entries
// guards: UC-049; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a hosted converse job (limit 2) whose endpoint answers the conversation, in every round, JSON whose envelope has no `draft` — `{ "answers": [] }` —; and, as the counter-proof, the same job whose endpoint answers the conversation's draft { answer "Done as you asked." }
// input: onRecordsChanged for each
// expect: the first: outcome `failed`, its summary naming "the participant's answer could not be read: the answer has no draft"; the job's end says `state: failed`, `reason:` that text — MOD-job-runner's failedBecause —, lists no result and no `no change`, and its round record says `stopped because: unusable`; nothing but the job's own record is written. The second: outcome `done`, its end `state: done`
test("TST-2026271044: a hosted job whose answer has no draft ends failed, its reason naming why, not done", async () => {
  await withWorkspace({}, async (w) => {
    fakeWorld({}, w);
    const status = await run(w);
    assert.equal(status.outcome, "failed", status.summary);
    assert.match(status.summary, /the participant's answer could not be read: the answer has no draft/);
    const end = endOf(w);
    assert.match(end, /^state: failed$/m);
    assert.match(end, /^reason: the participant's answer could not be read: the answer has no draft$/m);
    assert.doesNotMatch(end, /no change/);
    assert.match(end, /stopped because: unusable/);
    assert.deepEqual(touched(w), [`docs/jobs/${JOB}.md`]);
  });
  await withWorkspace({}, async (w) => {
    fakeWorld({ converse: answer(null) }, w);
    const status = await run(w);
    assert.equal(status.outcome, "done", status.summary);
    assert.match(endOf(w), /^state: done$/m);
  });
});

// TST-2026271045 · level: component · module: MOD-workflow-entries
// guards: UC-049
// given: a hosted converse job; the endpoint answers the conversation with the plan [{ change-requirements, [the requirement], "say the due date" }] and the change of requirements, in every round, with JSON whose envelope has no `draft`; known positive: the same piece answered with a changed section ends done (TST-1360101)
// input: onRecordsChanged; then onDispatch with the inputs of the start it made
// expect: the conversation's end lists `handed over: change-requirements — <its job>`; the piece's run ends `failed`, its own end `state: failed` with the reason `the participant's answer could not be read: the answer has no draft` and no `no change`; nothing but the two records is written
test("TST-2026271045: a piece whose answer has no draft ends failed in its own record, with why, not as no change", async () => {
  await withWorkspace({}, async (w) => {
    const world = fakeWorld({ converse: answer({ kind: "change-requirements", works_on: [RULE], task: "say the due date" }) }, w);
    assert.equal((await run(w)).outcome, "done");
    const inputs = handedOverStart(world);
    assert.ok(resultLines(endOf(w)).includes(`handed over: change-requirements — ${inputs.job}`), endOf(w));
    const status = await runPiece(w, inputs);
    assert.equal(status.outcome, "failed", status.summary);
    const end = endOfJob(w, inputs.job);
    assert.match(end, /^state: failed$/m);
    assert.match(end, /^reason: the participant's answer could not be read: the answer has no draft$/m);
    assert.doesNotMatch(end, /no change/);
    assert.deepEqual(touched(w).sort(), [`docs/jobs/${JOB}.md`, `docs/jobs/${inputs.job}.md`].sort());
  });
});

// ---------------------------------------------------------------- a piece that writes nothing names why

// The result lines of the job's end: its `results:` list, one item each. An item's comma is written as a semicolon (product.mjs), as every item of the list is.
const resultLines = (end) => (/^results: (.*)$/m.exec(end)?.[1] ?? "").split(", ").filter(Boolean);

// TST-2026111104 · level: component · module: MOD-workflow-entries · MOD-spec-changes
// guards: UC-049; UC-019
// given: a hosted converse job with the person's source; the endpoint answers the conversation with the plan of TST-2026271045 and the change of requirements with a draft that changes no text, `{ sections: [], why }`; known positive: the same piece answered with a changed section lists its writer's commit (TST-1360101)
// input: onRecordsChanged; then onDispatch with the inputs of the start it made
// expect: outcome `done` both times; the change of requirements ran once; the piece's own end lists `note: the draft changes nothing; nothing is written.` — the note of the writer spec-edits — and no `no change`; nothing but the two records is written
test("TST-2026111104: a piece whose writer writes nothing lists the writer's note in its own end, not no change", async () => {
  await withWorkspace({}, async (w) => {
    const world = fakeWorld({ converse: answer({ kind: "change-requirements", works_on: [RULE], task: "say the due date" }), "change-requirements": { sections: [], why: "none" } }, w);
    assert.equal((await run(w)).outcome, "done");
    const inputs = handedOverStart(world);
    const status = await runPiece(w, inputs);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(world.prompted("change-requirements"), 1, "the change of requirements ran");
    const lines = resultLines(endOfJob(w, inputs.job));
    assert.ok(lines.includes("note: the draft changes nothing; nothing is written."), lines.join("\n"));
    assert.ok(!lines.includes("no change"), lines.join("\n"));
    assert.deepEqual(touched(w).sort(), [`docs/jobs/${JOB}.md`, `docs/jobs/${inputs.job}.md`].sort());
  });
});

// ---------------------------------------------------------------- the job whose task travels with its hand-over (the endpoint's own job spawned by the bar)

// The endpoint's own converse job, as the bar spawns it: route ci hosted endpoint fixture-endpoint secret FIXTURE_KEY, task `with the hand-over`, `declares` draft text and read the repository, the person's source.
const declared = (agentM) => ({ ...converseStart(agentM, { endpoint: undefined, instruction: undefined }), participant: "fixture-endpoint", task: "with the hand-over", route: "ci hosted endpoint fixture-endpoint secret FIXTURE_KEY",
  declares: { context: 100000, capabilities: ["draft text", "read the repository"] }, destinations: [{ participant: "fixture-endpoint", place: "GitHub's hosted runners", parts: ["instruction"] }] });
const DISPATCH_ENDPOINT = JSON.stringify({ kind: ENDPOINT.kind, baseUrl: ENDPOINT.baseUrl, model: ENDPOINT.model });

// TST-1360108 · level: component · module: MOD-workflow-entries
// guards: UC-049; A CI AGENT'S DRAFT ENTERS AS OPEN; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: a queued converse job of the endpoint's own (`declared`); the model endpoint answers the conversation with the plan [{ change-use-case, [UC-001], "tell the due date" }] and the change of the use case with UC-001's new text; an executable `opencode` on the PATH that notes every start
// input: onDispatch with the inputs job, task "Tell the member the due date, token heron-1360", the endpoint and the secret FIXTURE_KEY; then onDispatch with the inputs of the start it made
// expect: outcome `done` both times; the start's inputs are a new job, the piece's task, the same endpoint and secret FIXTURE_KEY, and the new job's record declares the conversation's context and capabilities; every request to the endpoint begins with the text of the instance's AGENTS.md, not its path; opencode is never started; the change of the use case is sent in the piece's run; UC-001's file on main is the drafted text and not accepted; the piece's end lists the writer's commit and UC-001's path; no file and no commit message of the product holds heron-1360; no approval record is written
test("TST-1360108: the endpoint's own converse job, dispatched with its task, hands its piece over as a job of the same endpoint, which runs through Agent M's job runner", async () => {
  const TASK = "Tell the member the due date, token heron-1360";
  await withWorkspace(declared, async (w) => {
    const world = fakeWorld({ converse: answer({ kind: "change-use-case", works_on: ["UC-001"], task: "tell the due date" }),
      "change-use-case": { files: [{ path: UC_PATH, text: UC_AFTER, class: "change", of: "UC-001" }] } }, w);
    const bin = join(w.root, "bin"), started = join(w.root, "opencode-started");
    mkdirSync(bin);
    writeFileSync(started, "");
    writeFileSync(join(bin, "git"), `#!/bin/sh\nexec ${REAL_GIT} "$@"\n`, { mode: 0o755 });
    writeFileSync(join(bin, "sleep"), `#!/bin/sh\nexec ${REAL_SLEEP} "$@"\n`, { mode: 0o755 });
    writeFileSync(join(bin, "opencode"), `#!/bin/sh\necho "$1" >> ${started}\ncase "$1" in --version) echo 1.4.0;; auth) echo '1 credentials';; models) echo opencode/big-pickle;; esac\n`, { mode: 0o755 });
    const saved = { PATH: process.env.PATH, FIXTURE_KEY: process.env.FIXTURE_KEY };
    Object.assign(process.env, { PATH: bin, FIXTURE_KEY: KEY });
    try {
      const status = await runPiece(w, { job: JOB, task: TASK, endpoint: DISPATCH_ENDPOINT, secret: "FIXTURE_KEY" }, { GITHUB_STEP_SUMMARY: join(w.root, "summary.md") });
      assert.equal(status.outcome, "done", status.summary);
      const inputs = handedOverStart(world);
      assert.deepEqual({ ...inputs, job: "<new>" }, { job: "<new>", task: "tell the due date", endpoint: DISPATCH_ENDPOINT, secret: "FIXTURE_KEY" });
      assert.match(fileAt(w, `docs/jobs/${inputs.job}.md`), /^declares: \{"context":100000,"capabilities":\["draft text","read the repository"\]\}$/m);
      assert.equal(world.prompted("change-use-case"), 0, "not in the conversation's run");
      const piece = await runPiece(w, inputs);
      assert.equal(piece.outcome, "done", piece.summary);
      assert.ok(!readFileSync(started, "utf8").includes("run"), "opencode is never started to run a job");
      const calls = world.requests.filter((each) => each.address.startsWith("https://llm.example.test/"));
      assert.ok(calls.length >= 2, "the endpoint is called for the conversation and for the change of the use case");
      // EVERY MODEL READS AGENT M'S AGENTS.MD FIRST: an endpoint in Agent M's own tool loop reads no checkout, so each request begins with the file's text, not its path.
      for (const call of calls) {
        const first = JSON.parse(call.body).messages.find((message) => message.role !== "system");
        const content = typeof first.content === "string" ? first.content : first.content.map((part) => part.text ?? "").join("");
        assert.ok(content.startsWith(RULES_TEXT.trim()), `the input begins with AGENTS.md's text: ${content.slice(0, 120)}`);
      }
      assert.ok(world.prompted("change-use-case") >= 1, "the change of the use case ran in the piece's run");
      assert.equal(fileAt(w, UC_PATH), UC_AFTER);
      assert.notEqual([...statuses(snapshotAt(w)).values()].find((each) => each.id === "UC-001").status, "accepted");
      const writer = writerOf(w, "change-use-case");
      assert.equal(writer.length, 1);
      const end = endOfJob(w, inputs.job);
      assert.ok(end.includes(writer[0]) && end.includes(UC_PATH), end);
      const everything = madeSince(w).map((sha) => git(w.product, "show", sha)).join("\n");
      assert.ok(!everything.includes("heron-1360"), "the task is written nowhere");
      noApprovalWritten(w);
    } finally {
      for (const name of ["PATH", "FIXTURE_KEY"]) { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; }
    }
  });
});

// The lines between `from` and `to` in `text`, or null where it holds no such block.
const between = (text, from, to) => {
  const lines = text.split("\n"), start = lines.indexOf(from), end = lines.indexOf(to, start + 1);
  return start === -1 || end === -1 ? null : lines.slice(start + 1, end).join("\n");
};

// TST-2026111106 · level: component · module: MOD-workflow-entries
// guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: the dispatched converse job of TST-1360108, whose endpoint answers the conversation "Done as you asked." with a plan of change-use-case; and, as the known positive, the same job whose endpoint answers the conversation with no plan
// input: onDispatch with the inputs job, task, endpoint and secret FIXTURE_KEY, the run's log being what the entry writes to the console and its summary the file GITHUB_STEP_SUMMARY names
// expect: both logs hold the conversation's answer between `--- answer of <id> ---` and `--- end of the answer of <id> ---`, "Done as you asked.", and the summary holds it; no log holds a `--- answer handed on in` line, since the piece runs in a run of its own; no file of the product holds the answer's lines
test("TST-2026111106: a dispatched conversation leaves its own answer in the run's log and summary, and no answer handed on", async () => {
  const TASK = "Tell the member the due date, token heron-1361";
  const dispatched = async (drafts) => {
    let log = "", summary = "";
    await withWorkspace(declared, async (w) => {
      fakeWorld(drafts, w);
      const bin = join(w.root, "bin");
      mkdirSync(bin);
      writeFileSync(join(bin, "git"), `#!/bin/sh\nexec ${REAL_GIT} "$@"\n`, { mode: 0o755 });
      writeFileSync(join(bin, "sleep"), `#!/bin/sh\nexec ${REAL_SLEEP} "$@"\n`, { mode: 0o755 });
      const saved = { PATH: process.env.PATH, FIXTURE_KEY: process.env.FIXTURE_KEY }, said = console.log;
      Object.assign(process.env, { PATH: bin, FIXTURE_KEY: KEY });
      console.log = (...args) => { log += `${args.join(" ")}\n`; };
      try {
        const summaryFile = join(w.root, "summary.md");
        const status = await runPiece(w, { job: JOB, task: TASK, endpoint: DISPATCH_ENDPOINT, secret: "FIXTURE_KEY" }, { GITHUB_STEP_SUMMARY: summaryFile });
        console.log = said;
        assert.equal(status.outcome, "done", status.summary);
        summary = readFileSync(summaryFile, "utf8");
        const everything = madeSince(w).map((sha) => git(w.product, "show", sha)).join("\n");
        assert.ok(!everything.includes("--- answer of"), "the answer goes to no file");
      } finally {
        console.log = said;
        for (const name of ["PATH", "FIXTURE_KEY"]) { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; }
      }
    });
    return { log, summary };
  };

  for (const drafts of [{ converse: answer({ kind: "change-use-case", works_on: ["UC-001"], task: "tell the due date" }) }, { converse: answer(null) }]) {
    const { log, summary } = await dispatched(drafts);
    assert.equal(between(log, `--- answer of ${JOB} ---`, `--- end of the answer of ${JOB} ---`), "Done as you asked.", log);
    assert.ok(summary.includes("Done as you asked."), summary);
    assert.ok(!log.includes("--- answer handed on in"), `no answer is handed on in the run:\n${log}`);
  }
});
