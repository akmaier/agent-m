// The writer spec-edits and the recipe named-requirements of a change of requirements — MOD-spec-changes' specStrategies, as docs/architecture/MOD-spec-changes.md states them:
// "writer `spec-edits` — writes a draft of `change-requirements` as the person left it, each text on the text the job's snapshot holds: each section as an entry of its queue with
// `proposeSection`, its anchor the section's heading line; each proposal of an open entry in that entry with `saveEntry`; the *Why* of each the draft's `why`, the origin as `queue-entries`
// names it for a change by prompt or from an issue, and the provenance lines as the commit's trailers. A changed `docs/groups/requirements.md` goes as a pull request of a branch
// `agent-m/<job>`, never as a commit on the default branch. A text it does not write … is named in the outcome's notes …; a draft that changes nothing writes nothing, and its one note
// says so"; `saveEntry`'s `trailers` "end the commit's message, as `proposeSection`'s do"; and "recipe `named-requirements` — the requirements the job's parameters name, each with its
// whole section, or, for one that an open entry proposes, with that entry's proposal under its path; each part carries its requirement as an artifact".
// Run: node --test tests/spec-changes-spec-edits.test.mjs
//
// Module: MOD-spec-changes
// Guards: UC-019; UC-012; A CI AGENT'S DRAFT ENTERS AS OPEN; A SPEC EDIT IS SAVED AS A PROPOSAL; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// Level: unit
//
// The product is a fixture this file holds in memory: a SPEC of two sections and one open entry of the queue `returning`, which proposes A LATE RETURN IS FINED. The host answers
// repositoryInfo, readSnapshot, commitFiles and openPullRequest and records each commit and pull request. Readings this file takes: an open entry's proposal is told by its path; an
// entry is "open" by its state `open`; a section's file written is its entry's proposal; a section the SPEC does not hold, an entry no longer open and a text changed meanwhile are each
// one note naming the text, and nothing of it is written. Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { specStrategies } from "../src/spec-changes/index.mjs";
import { withStoredGraph } from "./stored-graph-fake.mjs";

const gitBlob = (body) => { const bytes = Buffer.from(body, "utf8"); return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"); };
const LENDING = "## 1. Lending\n\n**A LOAN HAS A DUE DATE** *(PO)*\nEvery loan has a due date.\n*Check:* no automatic check; at review\n\n";
const RETURNING = "## 2. Returning\n\n**A RETURN IS RECORDED** *(PO)*\nEvery return is recorded.\n*Check:* no automatic check; at review\n";
const SPEC = `# Fixture — Specification\n\n${LENDING}${RETURNING}`;
const QUEUE = "docs/spec-freigaben/returning";
const PROPOSAL_PATH = `${QUEUE}/01-returning.md`;
const PROPOSAL = `${RETURNING}\n**A LATE RETURN IS FINED** *(github.com/alice)*\nA late return is fined.\n*Check:* no automatic check; at review\n`;
const GROUPS = "docs/groups/requirements.md";
const QUEUE_FILES = {
  [`${QUEUE}/index.md`]: "# SPEC approvals — queue returning · Returning\n\n**Zieldatei aller Einträge:** `SPEC.md`\n\n| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |\n|---|---|---|---|---|\n| 01 | `SPEC.md` | ## 2. Returning | — | — |\n",
  [`${QUEUE}/entscheidungen.md`]: "# Decisions — queue returning Returning\n\nAppend-only.\n",
  [PROPOSAL_PATH]: PROPOSAL,
  [`${QUEUE}/01-returning.begruendung.md`]: "# Returning: adds A LATE RETURN IS FINED\n\n**The change.** Adds it.\n\n**Why.** Fines.\n\n**Impact list.**\n- A LATE RETURN IS FINED: added; nothing names it.\n\n**Origin.** Source github.com/alice; saved by alice.\n",
};

function product({ files = {}, decided = false } = {}) {
  const all = { "SPEC.md": SPEC, [GROUPS]: "- 1. Lending\n  - A LOAN HAS A DUE DATE\n", ...QUEUE_FILES, ...files };
  if (decided) all[`${QUEUE}/entscheidungen.md`] += "| 2026-11-01 10:00 UTC | 1 | uebernommen | approval:spec-returning-01-aaaaaaaaaaaa.md |\n";
  const snapshot = withStoredGraph({ repository: { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" }, ref: "main", commit: "h".repeat(40),
    paths: Object.keys(all), blob: (path) => (Object.hasOwn(all, path) ? gitBlob(all[path]) : null), read: async (path) => (Object.hasOwn(all, path) ? all[path] : null) });
  const commits = [], pulls = [];
  const host = { repositoryInfo: async () => ({ defaultBranch: "main", visibility: "private", canWrite: true, archived: false, description: "" }),
    readSnapshot: async () => snapshot, readHistory: async () => [],
    commitFiles: async (change) => { commits.push(change); return { commit: String(commits.length).repeat(40), url: "https://example.test/commit" }; },
    openPullRequest: async (pull) => { pulls.push(pull); return { url: "https://github.com/alice/product/pull/7", number: 7 }; } };
  return { snapshot, host, commits, pulls, all };
}
const DRAFTER = { name: "drafter-a", model: "example-model" };
function contextOf(world, params = {}) {
  return { kind: { name: "change-requirements" }, params: { source: "github.com/alice", ...params }, product: { address: "https://github.com/alice/product", snapshot: world.snapshot, host: world.host },
    instance: { snapshot: world.snapshot, host: world.host }, person: "alice", now: new Date("2026-11-09T10:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: "JOB-20261109-1000-abcd" };
}
const write = (world, draft, params) => specStrategies.writers["spec-edits"]({ draft, drafter: DRAFTER, rounds: [{ number: 1 }] }, contextOf(world, params));
const ALICE_LOAN = LENDING.replace("*(PO)*\nEvery loan has a due date.", "*(PO; github.com/alice)*\nEvery loan has a due date with a reminder.");
const files = (commit) => Object.fromEntries(commit.files.map((file) => [file.path, file.text]));

// TST-2026110905 · level: unit · module: MOD-spec-changes
// guards: A SPEC EDIT IS SAVED AS A PROPOSAL; A CI AGENT'S DRAFT ENTERS AS OPEN; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; UC-019 6b
// given: a draft that changes section 1. Lending and the open entry's proposal of Returning, with why "Loans need reminders."
// input: the writer spec-edits, nobody attending
// expect: two commits on the default branch: the first a new entry of the queue lending whose proposal is the drafted section byte for byte and whose rationale's Why is the draft's why and whose
// origin names the source github.com/alice; the second the open entry's proposal replaced in place; each message ending with the provenance lines (Agent-M-Kind: change-requirements, Agent-M-Job);
// SPEC.md in neither; no pull request; no note
test("TST-2026110905: spec-edits — a section is written as an entry of its queue, a proposal in its open entry, each with the provenance lines", async () => {
  const world = product();
  const finer = PROPOSAL.replace("A late return is fined.", "A late return is fined by the day.");
  const outcome = await write(world, { sections: [ALICE_LOAN], proposals: [{ path: PROPOSAL_PATH, text: finer }], why: "Loans need reminders." });
  assert.equal(world.commits.length, 2);
  const [section, entry] = world.commits.map(files);
  assert.equal(section["docs/spec-freigaben/lending/01-lending.md"], ALICE_LOAN);
  assert.match(section["docs/spec-freigaben/lending/01-lending.begruendung.md"], /\*\*Why\.\*\* Loans need reminders\./);
  assert.match(section["docs/spec-freigaben/lending/01-lending.begruendung.md"], /\*\*Origin\.\*\* Source github\.com\/alice/);
  assert.equal(entry[PROPOSAL_PATH], finer);
  for (const commit of world.commits) {
    assert.equal(commit.branch, "main");
    assert.ok(!commit.files.some((file) => file.path === "SPEC.md"));
    const lines = commit.message.split("\n");
    for (const wanted of ["Agent-M-Kind: change-requirements", "Agent-M-Job: JOB-20261109-1000-abcd", "Agent-M-Participant: drafter-a", "Agent-M-Rounds: 1"]) assert.ok(lines.includes(wanted), `${wanted} in ${commit.message}`);
  }
  assert.deepEqual([outcome.pullRequest, outcome.notes, world.pulls], [null, [], []]);
  assert.deepEqual(outcome.files, ["docs/spec-freigaben/lending/01-lending.md", PROPOSAL_PATH]);
});

// TST-2026110906 · level: unit · module: MOD-spec-changes
// guards: A CI AGENT'S DRAFT ENTERS AS OPEN; UC-019 6b
// given: a draft that changes docs/groups/requirements.md only
// input: the writer spec-edits
// expect: one commit, on the branch agent-m/JOB-20261109-1000-abcd from the commit the job read, holding only the group file as drafted, its message ending with the provenance lines; a pull request of that branch into main; nothing on the default branch
test("TST-2026110906: spec-edits — a changed group file goes as a pull request, never a commit on the default branch", async () => {
  const world = product();
  const groups = "- 1. Lending\n  - A LOAN HAS A DUE DATE\n- 2. Returning\n  - A RETURN IS RECORDED\n";
  const outcome = await write(world, { groups, why: "Returning gets a group." });
  assert.equal(world.commits.length, 1);
  assert.deepEqual([world.commits[0].branch, world.commits[0].expectedHead], ["agent-m/JOB-20261109-1000-abcd", "h".repeat(40)]);
  assert.deepEqual(files(world.commits[0]), { [GROUPS]: groups });
  assert.ok(world.commits[0].message.split("\n").includes("Agent-M-Kind: change-requirements"));
  assert.deepEqual(world.pulls.map((pull) => [pull.branch, pull.base]), [["agent-m/JOB-20261109-1000-abcd", "main"]]);
  assert.equal(outcome.pullRequest, "https://github.com/alice/product/pull/7");
});

// TST-2026110907 · level: unit · module: MOD-spec-changes
// guards: UC-019; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
// given: a draft with a section whose heading the SPEC does not hold; a draft with the entry's proposal while the entry is in SPEC; a draft whose section changed on the default branch since the job read it; and a draft whose texts stand as they are — the known positive of a writing draft is TST-2026110905
// input: the writer spec-edits on each
// expect: nothing written in any; one note each, naming the heading, the entry's path with its state, the section changed meanwhile, and "the draft changes nothing; nothing is written."
test("TST-2026110907: spec-edits — what it does not write is named in a note, and a draft that changes nothing says so", async () => {
  const unknown = product();
  assert.deepEqual((await write(unknown, { sections: ["## 9. Nowhere\n\n**A RULE** *(github.com/alice)*\nA rule.\n*Check:* no automatic check; at review\n"], why: "x" })).notes, ["the SPEC holds no section ## 9. Nowhere; it is not written."]);
  const decided = product({ decided: true });
  assert.deepEqual((await write(decided, { proposals: [{ path: PROPOSAL_PATH, text: `${PROPOSAL}\n` }], why: "x" })).notes, [`${PROPOSAL_PATH} is no open entry's proposal; it is not written.`]);
  const moved = product();
  const read = moved.snapshot;
  moved.host.readSnapshot = async () => withStoredGraph({ ...read, commit: "n".repeat(40), blob: (path) => (path === "SPEC.md" ? gitBlob(SPEC.replace("Every loan", "Each loan")) : read.blob(path)),
    read: async (path) => (path === "SPEC.md" ? SPEC.replace("Every loan", "Each loan") : read.read(path)) });
  assert.deepEqual((await write(moved, { sections: [ALICE_LOAN], why: "x" })).notes, ["## 1. Lending changed meanwhile; it is not written."]);
  const same = product();
  assert.deepEqual((await write(same, { sections: [LENDING], proposals: [{ path: PROPOSAL_PATH, text: PROPOSAL }], why: "x" })).notes, ["the draft changes nothing; nothing is written."]);
  for (const world of [unknown, decided, moved, same]) assert.deepEqual([world.commits, world.pulls], [[], []]);
});

// TST-2026110908 · level: unit · module: MOD-spec-changes
// guards: UC-012 step 6
// given: a job of change-requirements given the parameter issue 12 that changes section 1. Lending
// input: the writer spec-edits
// expect: the entry's rationale holds the line "**Issue:** #12 of https://github.com/alice/product", and its origin names the issue beside the source
test("TST-2026110908: spec-edits — a change from an issue names the issue as its origin", async () => {
  const world = product();
  await write(world, { sections: [ALICE_LOAN], why: "As the issue asks." }, { issue: 12 });
  const rationale = files(world.commits[0])["docs/spec-freigaben/lending/01-lending.begruendung.md"];
  assert.match(rationale, /^\*\*Issue:\*\* #12 of https:\/\/github\.com\/alice\/product$/m);
  assert.match(rationale, /\*\*Origin\.\*\* Source github\.com\/alice; issue #12 of https:\/\/github\.com\/alice\/product/);
});

// TST-2026110909 · level: unit · module: MOD-spec-changes
// guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; UC-019 step 4
// given: the product above; the parameter requirements naming A RETURN IS RECORDED — in the SPEC and proposed by the open entry —, A LATE RETURN IS FINED — proposed only by it — and A LOAN HAS A DUE DATE; then a name neither holds
// input: the recipe named-requirements
// expect: the section 2. Returning under A RETURN IS RECORDED, then the entry's proposal under its path, then section 1. Lending; each part carrying the requirements it was given for as artifacts — the proposal both; NO SUCH RULE is RequirementNotFound
test("TST-2026110909: named-requirements — the sections that hold the requirements, and each open entry's proposal under its path", async () => {
  const world = product();
  const context = contextOf(world);
  const parts = await specStrategies.recipes["named-requirements"](context, { requirements: ["A RETURN IS RECORDED", "A LATE RETURN IS FINED", "A LOAN HAS A DUE DATE"] });
  assert.deepEqual(parts.map((part) => [part.name, part.text, part.artifacts.map((each) => each.id)]), [
    ["A RETURN IS RECORDED", RETURNING, ["A RETURN IS RECORDED"]],
    [PROPOSAL_PATH, PROPOSAL, ["A RETURN IS RECORDED", "A LATE RETURN IS FINED"]],
    ["A LOAN HAS A DUE DATE", LENDING, ["A LOAN HAS A DUE DATE"]]]);
  await assert.rejects(specStrategies.recipes["named-requirements"](context, { requirements: ["NO SUCH RULE"] }), (error) => error.name === "RequirementNotFound" && error.requirements[0] === "NO SUCH RULE");
});
