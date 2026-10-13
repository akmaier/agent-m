// MOD-workflow-entries' entry onApprovalsCommitted and the main.mjs that runs it (ITM-364), as the accepted text of
// docs/architecture/MOD-workflow-entries.md states them: "onApprovalsCommitted(env) — in the instance: applies every approval of the
// instance's own SPEC that the dashboard did not apply, with the same functions the dashboard uses, byte for byte, or nothing when a
// text is stale (WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE, A STALE APPROVAL IS NOT APPLIED); the status names what was
// applied and what was stale", "EntryStatus is { outcome: "done" | "nothing to do" | "failed" | "not run", summary, findings }; not run
// names what was missing, such as a secret, and is never shown as passed", and "A secret that is missing ends the entry at once with a
// status that names it, before anything is written (UC-010)"; main.mjs "reads the entry's name from the command line and the
// environment, and runs it". For UC-006 4c.
// Run: node --test tests/workflow-entries-apply-approvals.test.mjs
//
// Module: MOD-workflow-entries
// Guards: UC-006; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; A STALE APPROVAL IS NOT APPLIED; THE APPROVED TEXT IS TAKEN VERBATIM; AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL
// Level: unit
//
// Deterministic, no network: the instance is a temporary git repository — a bare origin, the clone the workflow's checkout stands for, and
// a seed clone that is the person committing in GitHub's web interface. Each test makes its own folder and removes it; git is given no
// global configuration and no prompt. The instance is the small repository this file holds, never Agent M's own SPEC.md: a SPEC of two
// sections, one queue, a register of one source the instance links. The expected values are read off the fixture's own texts, never off the
// code. Where the module file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The names the entry reads are GitHub's: GITHUB_ACTIONS, GITHUB_EVENT_NAME, GITHUB_WORKSPACE (the checkout), GITHUB_SERVER_URL and
//     GITHUB_REPOSITORY (the instance repository), GITHUB_REF_NAME (the branch the workflow runs for, which the entry reads and commits on — the clone's
//     other functions would go to the server, which these tests do not reach), GITHUB_SHA (the commit of Agent M that runs) and, for the workflow's own token,
//     GITHUB_TOKEN, which the workflow passes from `secrets.GITHUB_TOKEN`. main.mjs exports runEntry(name, env, { now }) -> EntryStatus,
//     which the command line calls with process.env and the clock; the tests call it with the environment they build and a clock.
//   - The outcomes: `done` after the commit, `nothing to do` when no approval is waiting, `not run` for a missing token, and `failed` when
//     an approval was refused as stale, as the workflow it replaces fails on a refused approval; a stale approval is named in the summary
//     and in a finding of rule A STALE APPROVAL IS NOT APPLIED. The command line ends with exit code 0 for `done` and `nothing to do`,
//     else 1, after printing the summary.
//   - The commit is made in the clone and pushed to the default branch of the origin, in one commit holding the SPEC and the queue's
//     decisions; the approval record, which the person committed, stays as it is.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const MAIN = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "workflow-entries", "main.mjs");
const entries = await import("../src/workflow-entries/main.mjs").catch((error) => ({ error }));
const { runEntry } = entries;

// ---------------------------------------------------------------- the instance

const text = (...lines) => `${lines.join("\n")}\n`;
const pad2 = (n) => String(n).padStart(2, "0");
const gitBlob = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const NOW = new Date("2026-03-01T10:00:00Z");
const WHEN = "2026-03-01 10:00 UTC";

const READING = text("## 1. Reading", "", "**A SAMPLE RULE** *(Fixture PO)*", "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`", "");
const WRITING = text("## 2. Writing", "", "**A WRITE RULE** *(Fixture PO)*", "A writer writes a file whole.", "*Check:* no automatic check; at review");
const WRITING_NEW = WRITING.replace("whole.", "entirely.");
const WRITING_EDITED = WRITING.replace("whole.", "in one piece.");
const HEAD = text("# Fixture product — Specification", "");
const SPEC = HEAD + READING + WRITING;

const ENTRY_PO = text("---", "id: SRC-fixture-po", "title: Fixture PO", "kind: document", "authority: normative", "licence: may be republished — fixture",
  "---", "# SRC-fixture-po Fixture PO", "", "A fixture source.");
const LINKS = text("# The sources this product meets", "", "| Source | Version | Hash | Part |", "|---|---|---|---|",
  `| SRC-fixture-po | 2026-10-05 | ${"0".repeat(64)} | |`);

const QUEUE = "docs/spec-freigaben/2026-03-01_sample";
const PROPOSAL = `${QUEUE}/07-entry-7.md`;
const DECISIONS = text("# Decisions — queue 2026-03-01 sample", "", "Append-only.");
const RECORD_FILE = `spec-2026-03-01_sample-07-${gitBlob(WRITING_NEW).slice(0, 12)}.md`;
const RECORD_PATH = `docs/approvals/${RECORD_FILE}`;
const ROW = `| ${WHEN} | 7 | uebernommen | approval:${RECORD_FILE} |\n`;
// The record a person commits in GitHub's web interface: the keys in the order the workflow it replaces writes them.
const record = (section) => text("kind: spec", `queue: ${QUEUE}`, "entry: 07", `proposal: ${PROPOSAL}`, `blob: ${gitBlob(WRITING_NEW)}`, "target: SPEC.md",
  "anchor: ## 2. Writing", `section: ${gitBlob(section)}`);

// The files of the instance: the SPEC, the queue with entry 07 that replaces section 2, the sources, and `extra`.
const instanceFiles = ({ spec = SPEC, decisions = DECISIONS, extra = {} } = {}) => ({
  "README.md": "# Fixture instance\n", "SPEC.md": spec, "docs/sources.md": LINKS, "docs/sources/SRC-fixture-po.md": ENTRY_PO,
  [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · sample", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 07 | `SPEC.md` | ## 2. Writing | — | — |"),
  [`${QUEUE}/entscheidungen.md`]: decisions, [PROPOSAL]: WRITING_NEW, [`${QUEUE}/07-entry-7.begruendung.md`]: text("# ## 2. Writing: a change", "", "**The change.** A sample."),
  ...extra,
});

// ---------------------------------------------------------------- the temporary repository

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
// A bare origin whose `main` holds the instance's files — the person's approval record among them, committed in the web interface —, and the
// clone the workflow checks out, made after them. -> { root, origin, clone, head }.
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-entry-"));
  const origin = join(root, "origin.git"), seed = join(root, "seed"), clone = join(root, "clone");
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  git(seed, "config", "user.name", "Alice Approver");
  git(seed, "config", "user.email", "alice@example.org");
  write(seed, files);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "the instance, and an approval committed without the dashboard");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  git(root, "clone", "-q", origin, clone);
  git(clone, "config", "user.name", "agent-m apply-approvals");
  git(clone, "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");
  return { root, origin, clone, head: git(clone, "rev-parse", "HEAD") };
}
async function withInstance(files, run) {
  const f = fixture(files);
  try { return await run(f); } finally { rmSync(f.root, { recursive: true, force: true }); }
}
// What GitHub Actions gives the entry, and the token the workflow passes.
const environment = (f, extra = {}) => ({ GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_WORKSPACE: f.clone, GITHUB_SERVER_URL: "https://github.com",
  GITHUB_REPOSITORY: "alice/agent-m", GITHUB_REF_NAME: "main", GITHUB_SHA: f.head, GITHUB_TOKEN: "ghp_ALICEworkflowTOKEN0123456789abcdef", ...extra });
const headOf = (f) => git(f.origin, "rev-parse", "main");
const run = (f, extra) => { assert.ok(runEntry, `runEntry: ${entries.error?.message}`); return runEntry("onApprovalsCommitted", environment(f, extra), { now: NOW }); };

// ---------------------------------------------------------------- the entry

// TST-473194 · level: unit · module: MOD-workflow-entries
// guards: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; THE APPROVED TEXT IS TAKEN VERBATIM; AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL
// given: an instance whose queue holds entry 07, a replacement of section 2, whose approval record a person committed in GitHub's web interface; no decision row names it
// input: onApprovalsCommitted with the workflow's token and the clock at 2026-03-01 10:00 UTC
// expect: outcome `done`; one commit on the origin's main, on the head the entry read, that changes the SPEC and the queue's decisions and nothing else; the SPEC byte for byte the old SPEC with section 2 replaced by the proposal; the decisions the old file with the row `| 2026-03-01 10:00 UTC | 7 | uebernommen | approval:<the record> |` appended; the record untouched; the summary and the commit's message name the record applied
test("onApprovalsCommitted — an approval committed without the dashboard is applied in one commit, byte for byte", async () => {
  await withInstance(instanceFiles({ extra: { [RECORD_PATH]: record(WRITING) } }), async (f) => {
    const status = await run(f);
    assert.equal(status.outcome, "done");
    assert.match(status.summary, new RegExp(RECORD_FILE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.deepEqual(status.findings, []);
    const after = headOf(f);
    assert.notEqual(after, f.head, "a commit was made");
    assert.equal(git(f.origin, "rev-parse", `${after}^`), f.head, "one commit on the head that was read");
    assert.deepEqual(git(f.origin, "diff", "--name-only", f.head, after).split("\n").sort(), ["SPEC.md", `${QUEUE}/entscheidungen.md`].sort());
    assert.equal(git(f.origin, "show", `${after}:SPEC.md`).concat("\n"), HEAD + READING + WRITING_NEW);
    assert.equal(git(f.origin, "show", `${after}:${QUEUE}/entscheidungen.md`).concat("\n"), DECISIONS + ROW);
    assert.equal(git(f.origin, "show", `${after}:${RECORD_PATH}`).concat("\n"), record(WRITING), "the record stays as the person committed it");
    assert.ok(git(f.origin, "log", "-1", "--format=%B", after).includes(RECORD_FILE), "the commit's message names the approval applied");
  });
});

// TST-473195 · level: unit · module: MOD-workflow-entries
// guards: A STALE APPROVAL IS NOT APPLIED
// given: the same approval, but the SPEC's section 2 was edited after the person saw it: the record names the section as it was
// input: onApprovalsCommitted with the token
// expect: nothing written — the origin's main and the clone's head as they were, the clone's working tree clean —; outcome `failed`; the summary names the record and that it was refused; one finding on the record, of the rule A STALE APPROVAL IS NOT APPLIED
test("onApprovalsCommitted — a stale approval writes nothing and is named in the status", async () => {
  await withInstance(instanceFiles({ spec: HEAD + READING + WRITING_EDITED, extra: { [RECORD_PATH]: record(WRITING) } }), async (f) => {
    const status = await run(f);
    assert.equal(status.outcome, "failed");
    assert.match(status.summary, new RegExp(RECORD_FILE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(status.summary, /refused|stale/i);
    assert.equal(status.findings.length, 1);
    assert.equal(status.findings[0].artifact, RECORD_PATH);
    assert.equal(status.findings[0].rule, "A STALE APPROVAL IS NOT APPLIED");
    assert.equal(headOf(f), f.head, "the origin is as it was");
    assert.equal(git(f.clone, "rev-parse", "HEAD"), f.head, "the clone is as it was");
    assert.equal(git(f.clone, "status", "--porcelain"), "", "the working tree is clean");
  });
});

// TST-473196 · level: unit · module: MOD-workflow-entries
// guards: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
// given: an instance with an approval that a decision row names already — the dashboard applied it —, and an instance with no approval
// input: onApprovalsCommitted with the token, for each
// expect: outcome `nothing to do` each time, nothing written
test("onApprovalsCommitted — nothing to apply gives nothing to do", async () => {
  const applied = instanceFiles({ spec: HEAD + READING + WRITING_NEW, decisions: DECISIONS + ROW, extra: { [RECORD_PATH]: record(WRITING) } });
  for (const files of [applied, instanceFiles()]) {
    await withInstance(files, async (f) => {
      const status = await run(f);
      assert.equal(status.outcome, "nothing to do");
      assert.equal(headOf(f), f.head, "nothing written");
    });
  }
});

// TST-473197 · level: unit · module: MOD-workflow-entries
// guards: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the approval of the first test, and an environment without the workflow's token — and, as the known positive, the same with it
// input: onApprovalsCommitted without GITHUB_TOKEN, and the command line `node src/workflow-entries/main.mjs onApprovalsCommitted` in that environment; then the first again with the token
// expect: outcome `not run`, the summary naming GITHUB_TOKEN, before anything is written — the origin and the clone as they were; the command line prints the summary and ends with exit code 1; with the token the entry applies the approval
test("onApprovalsCommitted — a missing token gives not run, naming it, before anything is written", async () => {
  await withInstance(instanceFiles({ extra: { [RECORD_PATH]: record(WRITING) } }), async (f) => {
    const without = { GITHUB_TOKEN: undefined };
    const status = await run(f, without);
    assert.equal(status.outcome, "not run");
    assert.match(status.summary, /GITHUB_TOKEN/);
    assert.equal(headOf(f), f.head, "the origin is as it was");
    assert.equal(git(f.clone, "rev-parse", "HEAD"), f.head, "the clone is as it was");
    assert.equal(git(f.clone, "status", "--porcelain"), "", "the working tree is clean");
    const env = { PATH: process.env.PATH, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_TERMINAL_PROMPT: "0", ...environment(f) };
    delete env.GITHUB_TOKEN;
    const cli = spawnSync(process.execPath, [MAIN, "onApprovalsCommitted"], { env, encoding: "utf8", timeout: 60_000 });
    assert.equal(cli.status, 1, `the command line fails: ${cli.stderr}`);
    assert.match(cli.stdout, /GITHUB_TOKEN/);
    assert.equal(headOf(f), f.head, "the command line wrote nothing");
    assert.equal((await run(f)).outcome, "done", "known positive: with the token the approval is applied");
  });
});
