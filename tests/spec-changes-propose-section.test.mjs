// A SPEC edit saved as an entry of the person's open queue (ITM-341) — MOD-spec-changes' `openQueueOf` and `proposeSection`, as docs/architecture/MOD-spec-changes.md states them:
// openQueueOf gives the person's newest queue of the day, by the author of the commit that created its index, that has no entry in SPEC yet; proposeSection writes one commit: the entry,
// its rationale — the change, the Why, the impact list, the origin — and its index row, into that queue or a new one, `trailers` ending the commit's message; a second edit of the same
// section in that queue replaces its entry; a rename is proposed as the old name withdrawn and the new one added; the target is never touched; when the section changed meanwhile it refuses
// and returns the newer text; `alsoReplacing` names other open entries that replace the same section; without a token on GitHub it writes nothing and returns GitHub's pages for each file
// of the entry, each page's `differs` saying whether its file exists on the default branch otherwise than at `openedHead`, the commit the edit was opened on; on GitLab it fails with
// TokenRequired.
// Run: node --test tests/spec-changes-propose-section.test.mjs
//
// Module: MOD-spec-changes
// Guards: UC-018
// Guards: A SPEC EDIT IS SAVED AS A PROPOSAL; A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
// Guards: A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
// Level: unit
//
// The repository is a fixture this file builds, never Agent M's own: a SPEC of two sections, a use case that realises one requirement, and queues of the day and of another day written by
// two people, as a snapshot (paths, blob SHAs, a read of the texts) beside a host that answers repositoryInfo, readSnapshot and readHistory and records every commit. The host's token is
// `canWrite`. Where the module file leaves a reading open, the test states the reading it takes, and the pull request names it:
//   - The queue of a day is a folder `docs/spec-freigaben/<day><letter>_<slug>/` whose day is the day of the call; the folder given back is that path, as Queue.folder is. The person of a
//     queue is the `author.account` of the oldest commit of its index.md's history that adds it; a queue none of whose entries is `in SPEC` has no entry in SPEC yet.
//   - The section's blob is the git blob SHA of the section's exact bytes (MOD-spec-document's sectionText), as the approval records name it; `current` of a refusal is that section's text.
//   - A host with no token is one whose repositoryInfo says `canWrite: false`; the server is the snapshot's repository.server.
//   - The files of an entry are its proposal, its rationale and the index (and, in a new queue, entscheidungen.md); the fallback gives one page for each, existing or new.
//   - A new queue is named `<day><letter>_edits-of-<person>`, the letter the first, none, b, c …, that no queue of the day has.
//   - The commit the edit was opened on is OPENED. The host answers readSnapshot(OPENED) with the repository as it stood then (`opened`: the paths it lacked and the paths it had besides),
//     readSnapshot("main") with the default branch now, and records every ref it was asked for in `reads`.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import * as specChanges from "../src/spec-changes/index.mjs";
import { documentFindings, loadSchema, readDocument } from "../src/documents/index.mjs";
import { withStoredGraph } from "./stored-graph-fake.mjs";

const { openQueueOf, proposeSection, queues, entryView } = specChanges;

const text = (...lines) => `${lines.join("\n")}\n`;
const gitBlob = (body) => { const bytes = Buffer.from(body, "utf8"); return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"); };
const TODAY = new Date().toISOString().slice(0, 10);
const OTHER_DAY = "2020-01-01";

const READING = text("## 1. Reading", "", "**A SAMPLE RULE** *(Product Owner)*", "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`", "",
  "**ANOTHER SAMPLE RULE** *(Product Owner)*", "A reader sees the name of a file.", "*Check:* no automatic check; at review", "");
const WRITING = text("## 2. Writing", "", "**A WRITE RULE** *(Product Owner)*", "A writer writes a file whole.", "*Check:* no automatic check; at review");
const SPEC = text("# Fixture — Specification", "") + READING + WRITING;
const useCase = text("---", "id: UC-001", "title: Read a file", "area: reading", "actors:", "  - Reader", "realises:", "  - A SAMPLE RULE", "---", "# UC-001 Read a file", "", "**Goal.** Read a file.");
const READING_EDITED = READING.replace("A reader reads a file whole.", "A reader reads a file whole, or says why not.");
const READING_RENAMED = READING.replace("**A SAMPLE RULE**", "**A READING RULE**");

const indexOf = (day, title, anchors) => text(`# SPEC approvals — queue ${day} · ${title}`, "", "**Zieldatei aller Einträge:** `SPEC.md`", "", "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
  ...anchors.map((anchor, at) => `| ${String(at + 1).padStart(2, "0")} | \`SPEC.md\` | ${anchor} | — | — |`));
const slugOf = (anchor) => anchor.replace(/^#+\s*\d+\.\s*/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

// A queue's files: its index, its decisions, an open entry for each anchor with its proposal.
function queueFiles(folder, day, anchors, { inSpec = [] } = {}) {
  const base = `docs/spec-freigaben/${folder}`;
  const files = { [`${base}/index.md`]: indexOf(day, "an earlier edit", anchors),
    [`${base}/entscheidungen.md`]: text("# Decisions — queue " + folder, "", "Append-only.", ...inSpec.map((n) => `| ${day} 10:00 UTC | ${n} | uebernommen | approval:spec-${folder}-0${n}-aaaaaaaaaaaa.md |`)) };
  anchors.forEach((anchor, at) => {
    const n = String(at + 1).padStart(2, "0");
    files[`${base}/${n}-${slugOf(anchor)}.md`] = anchor.includes("Reading") ? READING_EDITED : WRITING.replace("writes a file whole", "writes a file whole, or says why not");
    files[`${base}/${n}-${slugOf(anchor)}.begruendung.md`] = "# an earlier rationale\n";
  });
  return files;
}
const historyOf = (folder, account, later = []) => ({ [`docs/spec-freigaben/${folder}/index.md`]: [
  ...later.map((who, at) => ({ commit: `${at}`.padEnd(40, "1"), parents: [], author: { account: who, name: who }, date: "2026-10-12T10:00:00Z", message: "a later edit", changes: [{ path: `docs/spec-freigaben/${folder}/index.md`, change: "modified" }] })),
  { commit: "c".repeat(40), parents: [], author: { account, name: account }, date: "2026-10-12T09:00:00Z", message: "queue", changes: [{ path: `docs/spec-freigaben/${folder}/index.md`, change: "added" }] }] });

const OPENED = "o".repeat(40);
function repository({ files = {}, history = {}, canWrite = true, server = "github", opened = {}, refuse = null } = {}) {
  const all = { "SPEC.md": SPEC, "docs/use-cases/UC-001-read-a-file.md": useCase, ...files };
  const commits = [];
  const web = server === "github" ? "https://github.com/alice/product" : "https://gitlab.example.test/alice/product";
  // The snapshot of the default branch, whose graph is stored on trace-cache as the workflow "main changed" stores it (tests/stored-graph-fake.mjs).
  const snapshot = withStoredGraph({ repository: { server, origin: server === "github" ? "https://github.com" : "https://gitlab.example.test", path: "alice/product", web }, ref: "main", commit: "h".repeat(40),
    paths: Object.keys(all), blob: (path) => (Object.hasOwn(all, path) ? gitBlob(all[path]) : null), read: async (path) => (Object.hasOwn(all, path) ? all[path] : null) });
  const reads = [];
  const began = { ...snapshot, ref: OPENED, commit: OPENED, paths: [...Object.keys(all).filter((path) => !(opened.lacking ?? []).includes(path)), ...(opened.extra ?? [])] };
  const host = { commits, reads,
    repositoryInfo: async () => ({ defaultBranch: "main", visibility: "private", canWrite, archived: false, description: "" }),
    readSnapshot: async (ref) => { reads.push(ref); return ref === OPENED ? began : snapshot; },
    readHistory: async (path) => history[path] ?? [],
    // `refuse`: the name of the failure the server answers a commit with ("PermissionMissing": the token may not write); nothing is committed then.
    commitFiles: async (change) => { if (refuse) throw Object.assign(new Error(`the server refused the commit: ${refuse}`), { name: refuse }); commits.push(change); return { commit: "i".repeat(40), url: "https://example.test/commit" }; } };
  return { host, snapshot, commits, all };
}
const CHANGE = { target: "SPEC.md", anchor: "## 1. Reading", until: null, text: READING_EDITED, why: "A reader needs to know why a file cannot be read.", origin: "an issue of a reader",
  person: "alice", openedBlob: gitBlob(READING), openedHead: OPENED };
const written = (commit) => Object.fromEntries(commit.files.map((file) => [file.path, file.text]));
const schemaText = readFileSync(new URL("../src/spec-changes/queue-rationale.schema.md", import.meta.url), "utf8");

// TST-472983 · level: unit · module: MOD-spec-changes
// guards: A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE; UC-018
// given: queues of the day: 'mine' by alice, all open; 'mine-b' by alice with an entry in SPEC; 'bobs' by bob, open; a queue of another day by alice; and alice's 'mine' touched later by bob
// input: openQueueOf for alice and for bob and for carol, on the day and on a day with none
// expect: alice's newest queue of the day with no entry in SPEC — 'mine', since 'mine-b' has one —, bob's his own, carol none, the day with none none; the person is the author of the commit that created the index, not of a later one
test("openQueueOf — the person's newest queue of the day with no entry in SPEC", async () => {
  assert.ok(openQueueOf, "openQueueOf is offered");
  const files = { ...queueFiles(`${TODAY}_mine`, TODAY, ["## 1. Reading"]), ...queueFiles(`${TODAY}b_mine-b`, TODAY, ["## 1. Reading"], { inSpec: [1] }),
    ...queueFiles(`${TODAY}c_bobs`, TODAY, ["## 2. Writing"]), ...queueFiles(`${OTHER_DAY}_old`, OTHER_DAY, ["## 1. Reading"]) };
  const history = { ...historyOf(`${TODAY}_mine`, "alice", ["bob"]), ...historyOf(`${TODAY}b_mine-b`, "alice"), ...historyOf(`${TODAY}c_bobs`, "bob"), ...historyOf(`${OTHER_DAY}_old`, "alice") };
  const { host } = repository({ files, history });
  assert.equal(await openQueueOf("alice", TODAY, host), `docs/spec-freigaben/${TODAY}_mine`);
  assert.equal(await openQueueOf("bob", TODAY, host), `docs/spec-freigaben/${TODAY}c_bobs`);
  assert.equal(await openQueueOf("carol", TODAY, host), null);
  assert.equal(await openQueueOf("alice", "2021-02-02", host), null);
  assert.equal(await openQueueOf("alice", OTHER_DAY, host), `docs/spec-freigaben/${OTHER_DAY}_old`);
});

// TST-472984 · level: unit · module: MOD-spec-changes
// guards: A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE; UC-018
// given: a person with no open queue of the day
// input: proposeSection of an edit of the section Reading
// expect: one commit on the default branch at the head read, holding a new queue of the day — index.md, entscheidungen.md, the entry 01-reading.md with the section as edited, its rationale — and nothing else; the index's row for the entry; the SPEC untouched; the result names the commit, the queue, the entry 1 and no other entry it replaces
test("proposeSection — an edit of a section is one commit holding a new queue with the entry, its rationale and its index row", async () => {
  assert.ok(proposeSection, "proposeSection is offered");
  const f = repository();
  const result = await proposeSection(f.host, CHANGE);
  assert.equal(f.commits.length, 1);
  const files = written(f.commits[0]);
  const folder = `docs/spec-freigaben/${TODAY}_edits-of-alice`;
  assert.deepEqual(Object.keys(files).sort(), [`${folder}/01-reading.begruendung.md`, `${folder}/01-reading.md`, `${folder}/entscheidungen.md`, `${folder}/index.md`]);
  assert.equal(files[`${folder}/01-reading.md`], READING_EDITED);
  assert.match(files[`${folder}/index.md`], new RegExp(`^# SPEC approvals — queue ${TODAY} · `));
  assert.match(files[`${folder}/index.md`], /\*\*Zieldatei aller Einträge:\*\* `SPEC\.md`/);
  assert.match(files[`${folder}/index.md`], /\| 01 \| `SPEC\.md` \| ## 1\. Reading \| — \| — \|/);
  assert.match(files[`${folder}/entscheidungen.md`], /^# Decisions — queue /);
  assert.deepEqual([f.commits[0].branch, f.commits[0].expectedHead], ["main", "h".repeat(40)]);
  assert.deepEqual(result, { commit: "i".repeat(40), queue: folder, entry: 1, alsoReplacing: [] });
  assert.ok(!Object.keys(files).includes("SPEC.md"), "the target is not touched");
});

// TST-472985 · level: unit · module: MOD-spec-changes
// guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; A SPEC EDIT IS SAVED AS A PROPOSAL; UC-018
// given: the edit of A SAMPLE RULE, which UC-001 realises
// input: proposeSection; then the written queue read back through queues and entryView
// expect: the rationale in the schema queue-rationale without a finding: the title `# 1. Reading: …`, the change, the Why as given, the impact list naming A SAMPLE RULE changed and UC-001, the origin as given with the person; read back, the queue is found with the entry open and the section that holds now beside the proposal, the same impact
test("proposeSection — the rationale holds the change, the Why, the impact list and the origin, and the queue reads back open", async () => {
  const f = repository();
  await proposeSection(f.host, CHANGE);
  const files = written(f.commits[0]);
  const folder = `docs/spec-freigaben/${TODAY}_edits-of-alice`;
  const rationale = files[`${folder}/01-reading.begruendung.md`];
  const schema = loadSchema(schemaText, "MOD-spec-changes");
  assert.deepEqual(documentFindings(schema, readDocument(schema, `${folder}/01-reading.begruendung.md`, rationale)), []);
  assert.match(rationale, /^# 1\. Reading: .*A SAMPLE RULE/);
  for (const label of ["**The change.**", "**Why.**", "**Impact list.**", "**Origin.**"]) assert.ok(rationale.includes(label), label);
  assert.ok(rationale.includes("A reader needs to know why a file cannot be read."));
  assert.match(rationale, /\*\*Impact list\.\*\*[\s\S]*A SAMPLE RULE[\s\S]*changed[\s\S]*UC-001/);
  assert.match(rationale, /\*\*Origin\.\*\*[\s\S]*an issue of a reader[\s\S]*alice/);
  const after = repository({ files: files });
  const all = await queues(after.snapshot);
  const queue = all.find((each) => each.folder === folder);
  assert.deepEqual(queue.entries.map((entry) => [entry.number, entry.anchor, entry.state]), [[1, "## 1. Reading", "open"]]);
  const view = await entryView(folder, 1, after.snapshot);
  assert.equal(view.current.text, READING);
  assert.equal(view.proposal.text, READING_EDITED);
  assert.deepEqual(view.impact.map((item) => [item.name, item.change, item.referencedBy]), [["A SAMPLE RULE", "changed", ["UC-001"]]]);
});

// TST-472986 · level: unit · module: MOD-spec-changes
// guards: A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE; UC-018
// given: alice's open queue of the day, with an entry for Reading
// input: proposeSection of an edit of the section Writing
// expect: no new queue: the entry 02 and its rationale added to that queue, its index row appended to the index with every other byte of it as it was; the earlier entry's files untouched; the result names that queue and entry 2
test("proposeSection — an edit of another section is added to the person's open queue", async () => {
  const folder = `${TODAY}_mine`;
  const files = queueFiles(folder, TODAY, ["## 1. Reading"]);
  const f = repository({ files, history: historyOf(folder, "alice") });
  const change = { ...CHANGE, anchor: "## 2. Writing", text: WRITING.replace("a file whole", "a file whole, or says why not"), openedBlob: gitBlob(WRITING) };
  const result = await proposeSection(f.host, change);
  const base = `docs/spec-freigaben/${folder}`;
  assert.deepEqual(result, { commit: "i".repeat(40), queue: base, entry: 2, alsoReplacing: [] });
  const out = written(f.commits[0]);
  assert.deepEqual(Object.keys(out).sort(), [`${base}/02-writing.begruendung.md`, `${base}/02-writing.md`, `${base}/index.md`]);
  assert.equal(out[`${base}/index.md`], files[`${base}/index.md`] + "| 02 | `SPEC.md` | ## 2. Writing | — | — |\n");
  assert.equal(out[`${base}/02-writing.md`], change.text);
});

// TST-472987 · level: unit · module: MOD-spec-changes
// guards: A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE; UC-018
// given: alice's open queue, whose entry 01 edits Reading, and a second edit of Reading
// input: proposeSection
// expect: the entry 01's proposal and rationale replaced in one commit; no second row in the index, which is not written again; no new entry; the result names entry 1
test("proposeSection — a second edit of a section replaces the entry of that queue", async () => {
  const folder = `${TODAY}_mine`;
  const files = queueFiles(folder, TODAY, ["## 1. Reading", "## 2. Writing"]);
  const f = repository({ files, history: historyOf(folder, "alice") });
  const again = READING.replace("A reader reads a file whole.", "A reader reads a file whole and says why not.");
  const result = await proposeSection(f.host, { ...CHANGE, text: again });
  const base = `docs/spec-freigaben/${folder}`;
  assert.equal(result.entry, 1);
  assert.equal(result.queue, base);
  const out = written(f.commits[0]);
  assert.deepEqual(Object.keys(out).sort(), [`${base}/01-reading.begruendung.md`, `${base}/01-reading.md`]);
  assert.equal(out[`${base}/01-reading.md`], again);
  assert.notEqual(out[`${base}/01-reading.begruendung.md`], "# an earlier rationale\n");
});

// TST-472988 · level: unit · module: MOD-spec-changes
// guards: A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; UC-018
// given: an edit that renames A SAMPLE RULE to A READING RULE
// input: proposeSection; and the entry read back
// expect: the rationale's impact list names A SAMPLE RULE withdrawn, with UC-001, and A READING RULE added; the entry read back lists the same two names, not one name changed
test("proposeSection — a rename is proposed as the old name withdrawn and the new one added", async () => {
  const f = repository();
  await proposeSection(f.host, { ...CHANGE, text: READING_RENAMED });
  const files = written(f.commits[0]);
  const folder = `docs/spec-freigaben/${TODAY}_edits-of-alice`;
  const impact = files[`${folder}/01-reading.begruendung.md`].split("**Impact list.**")[1].split("**Origin.**")[0];
  assert.match(impact, /A SAMPLE RULE[^\n]*withdrawn[^\n]*UC-001/);
  assert.match(impact, /A READING RULE[^\n]*added/);
  assert.doesNotMatch(impact, /A SAMPLE RULE[^\n]*changed/);
  const view = await entryView(folder, 1, repository({ files }).snapshot);
  assert.deepEqual(view.impact.map((item) => [item.name, item.change]), [["A SAMPLE RULE", "withdrawn"], ["A READING RULE", "added"]]);
});

// TST-472989 · level: unit · module: MOD-spec-changes
// guards: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; UC-018
// given: an edit opened on a blob that is no longer the section's; and, to show the call writing, the same edit on the section's blob
// input: proposeSection
// expect: the refusal `changed meanwhile` with the section's text as it is now, and no commit; the same edit on the right blob is written
test("proposeSection — a section that changed meanwhile is refused with its newer text", async () => {
  const f = repository();
  assert.equal((await proposeSection(f.host, CHANGE)).entry, 1, "known positive: on the section's blob");
  const g = repository();
  const refused = await proposeSection(g.host, { ...CHANGE, openedBlob: gitBlob("an older section\n") });
  assert.deepEqual(refused, { refused: "changed meanwhile", current: READING });
  assert.deepEqual(g.commits, []);
});

// TST-472990 · level: unit · module: MOD-spec-changes
// guards: AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; UC-019
// given: an edit with a job's provenance lines as trailers, and one of a person's own with none
// input: proposeSection
// expect: the message of the first ends, after a blank line, with the lines as given; the second's message holds none; the files hold none of them
test("proposeSection — the trailers end the commit's message, and a person's own edit has none", async () => {
  const f = repository();
  const trailers = ["Agent-M-Version: unreleased, commit " + "c".repeat(40), "Agent-M-Job: JOB-1", "Agent-M-Kind: change-requirements"];
  await proposeSection(f.host, { ...CHANGE, trailers });
  assert.ok(f.commits[0].message.endsWith(`\n\n${trailers.join("\n")}`));
  assert.ok(!Object.values(written(f.commits[0])).some((body) => body.includes("Agent-M-Job")));
  const g = repository();
  await proposeSection(g.host, CHANGE);
  assert.ok(!g.commits[0].message.includes("Agent-M-"));
});

// TST-472991 · level: unit · module: MOD-spec-changes
// guards: A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE; UC-018
// given: other open entries that replace Reading: bob's in his queue; and none that replace Writing but one in SPEC that replaced Reading
// input: proposeSection of an edit of Reading in alice's own queue
// expect: alsoReplacing names bob's queue and entry; an entry in SPEC and an entry of another section are not named; bob's files are untouched
test("proposeSection — other open entries that replace the same section are named", async () => {
  const mine = `${TODAY}_mine`, bobs = `${TODAY}b_bobs`, done = `${TODAY}c_done`;
  const files = { ...queueFiles(mine, TODAY, ["## 2. Writing"]), ...queueFiles(bobs, TODAY, ["## 1. Reading"]), ...queueFiles(done, TODAY, ["## 1. Reading"], { inSpec: [1] }) };
  const f = repository({ files, history: { ...historyOf(mine, "alice"), ...historyOf(bobs, "bob"), ...historyOf(done, "bob") } });
  const result = await proposeSection(f.host, CHANGE);
  assert.equal(result.queue, `docs/spec-freigaben/${mine}`);
  assert.deepEqual(result.alsoReplacing, [{ queue: `docs/spec-freigaben/${bobs}`, entry: 1 }]);
  assert.ok(Object.keys(written(f.commits[0])).every((path) => path.startsWith(`docs/spec-freigaben/${mine}/`)));
});

// TST-472992 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL; UC-018
// given: a GitHub product and a host with no token (canWrite false)
// input: proposeSection
// expect: nothing written; the pages of GitHub's web interface for each file of the entry — the new-file page for each, as the queue is new —, each with its path in the address and its text beside it, never in it
test("proposeSection — without a token on GitHub it writes nothing and returns GitHub's pages", async () => {
  const f = repository({ canWrite: false });
  const result = await proposeSection(f.host, CHANGE);
  assert.deepEqual(f.commits, []);
  const folder = `docs/spec-freigaben/${TODAY}_edits-of-alice`;
  assert.deepEqual(result.fallback.map((page) => page.path).sort(), [`${folder}/01-reading.begruendung.md`, `${folder}/01-reading.md`, `${folder}/entscheidungen.md`, `${folder}/index.md`]);
  for (const page of result.fallback) {
    assert.match(page.url, /^https:\/\/github\.com\/alice\/product\/new\//);
    assert.ok(page.url.includes(encodeURIComponent(page.path)) || page.url.includes(page.path), "the path is in the address");
    assert.ok(!page.url.includes("reads a file whole"), "the text is not");
    assert.equal(page.differs, false);
  }
  assert.equal(result.fallback.find((page) => page.path.endsWith("01-reading.md")).text, READING_EDITED);
});

// TST-472993 · level: unit · module: MOD-spec-changes
// guards: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; UC-018
// given: a GitLab product and a host with no token
// input: proposeSection
// expect: TokenRequired, and nothing written; with a token the same edit is written
test("proposeSection — without a token on GitLab it fails with TokenRequired", async () => {
  const g = repository({ server: "gitlab" });
  assert.equal((await proposeSection(g.host, CHANGE)).entry, 1, "known positive: with a token");
  const f = repository({ server: "gitlab", canWrite: false });
  await assert.rejects(proposeSection(f.host, CHANGE), (error) => error.name === "TokenRequired");
  assert.deepEqual(f.commits, []);
});

// TST-472994 · level: unit · module: MOD-spec-changes
// guards: A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE; UC-018
// given: three open queues of alice on the day: one with no letter, one with the letter b, one with the letter c, and an edit of a section none of them holds
// input: openQueueOf; proposeSection
// expect: the newest is the one with the latest letter — c; the edit is added to it as entry 2
test("openQueueOf — the newest of several open queues of the day is the one with the latest letter", async () => {
  const names = [`${TODAY}_first`, `${TODAY}b_second`, `${TODAY}c_third`];
  const files = Object.assign({}, ...names.map((name) => queueFiles(name, TODAY, ["## 2. Writing"])));
  const history = Object.assign({}, ...names.map((name) => historyOf(name, "alice")));
  const f = repository({ files, history });
  assert.equal(await openQueueOf("alice", TODAY, f.host), `docs/spec-freigaben/${names[2]}`);
  const result = await proposeSection(f.host, CHANGE);
  assert.deepEqual([result.queue, result.entry], [`docs/spec-freigaben/${names[2]}`, 2]);
});

// TST-611001 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-018
// given: a GitHub product, a host with no token, alice's open queue holding an entry for Reading, and a second edit of Reading, which replaces that entry's proposal and rationale; the proposal did not exist on the default branch at OPENED
// input: proposeSection
// expect: two pages in the order proposal, rationale; the proposal's page is GitHub's new-file page and differs is true — it exists now, and did not when the edit began; the rationale's page is GitHub's editor and differs is false
test("proposeSection — without a token a file that appeared on the default branch since the edit began is marked as differing", async () => {
  const folder = `${TODAY}_mine`;
  const base = `docs/spec-freigaben/${folder}`;
  const files = queueFiles(folder, TODAY, ["## 1. Reading", "## 2. Writing"]);
  const f = repository({ files, history: historyOf(folder, "alice"), canWrite: false, opened: { lacking: [`${base}/01-reading.md`] } });
  const result = await proposeSection(f.host, CHANGE);
  assert.deepEqual(f.commits, []);
  assert.deepEqual(result.fallback.map((page) => [page.path, page.url.split("/").slice(3, 6).join("/"), page.differs]),
    [[`${base}/01-reading.md`, "alice/product/new", true], [`${base}/01-reading.begruendung.md`, "alice/product/edit", false]]);
});

// TST-611002 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-018
// given: a GitHub product, a host with no token and no queue of the person; at OPENED the repository held the index of the queue the edit now starts, which the default branch no longer holds
// input: proposeSection
// expect: four pages; the index's is GitHub's editor, since the file existed when the edit began, and differs is true; the other three are new-file pages and differs is false
test("proposeSection — without a token a file that disappeared from the default branch since the edit began is marked as differing", async () => {
  const folder = `docs/spec-freigaben/${TODAY}_edits-of-alice`;
  const f = repository({ canWrite: false, opened: { extra: [`${folder}/index.md`] } });
  const result = await proposeSection(f.host, CHANGE);
  assert.deepEqual(result.fallback.map((page) => [page.path.replace(folder, "<queue>"), page.url.split("/").slice(3, 6).join("/"), page.differs]).sort(),
    [["<queue>/01-reading.begruendung.md", "alice/product/new", false], ["<queue>/01-reading.md", "alice/product/new", false],
      ["<queue>/entscheidungen.md", "alice/product/new", false], ["<queue>/index.md", "alice/product/edit", true]]);
});

// TST-611003 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-018
// given: the same edit saved by a host with no token and by one with a token
// input: proposeSection
// expect: the refs the host was asked to read are ["main", OPENED] without a token and ["main"] with one: the repository at OPENED is read only to build GitHub's pages
test("proposeSection — the repository at the commit the edit was opened on is read only without a token", async () => {
  const without = repository({ canWrite: false });
  await proposeSection(without.host, CHANGE);
  assert.deepEqual(without.host.reads, ["main", OPENED]);
  const withToken = repository();
  await proposeSection(withToken.host, CHANGE);
  assert.deepEqual(withToken.host.reads, ["main"]);
});

// TST-611013 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-018
// given: the setting of TST-611001 (a second edit of Reading, whose proposal OPENED lacked), but the edit was opened on the commit of the snapshot the save reads, "h" repeated forty times
// input: proposeSection without a token
// expect: only "main" is read; the files are taken as that snapshot holds them, so both pages are GitHub's editor and differs is false for both, though OPENED lacked the proposal
test("proposeSection — an edit opened on the commit the save already read reads no other snapshot", async () => {
  const folder = `${TODAY}_mine`;
  const base = `docs/spec-freigaben/${folder}`;
  const f = repository({ files: queueFiles(folder, TODAY, ["## 1. Reading", "## 2. Writing"]), history: historyOf(folder, "alice"), canWrite: false, opened: { lacking: [`${base}/01-reading.md`] } });
  const result = await proposeSection(f.host, { ...CHANGE, openedHead: "h".repeat(40) });
  assert.deepEqual(f.host.reads, ["main"]);
  assert.deepEqual(result.fallback.map((page) => [page.path, page.url.split("/").slice(3, 6).join("/"), page.differs]),
    [[`${base}/01-reading.md`, "alice/product/edit", false], [`${base}/01-reading.begruendung.md`, "alice/product/edit", false]]);
});

// TST-611014 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-018
// given: the setting of TST-611001, but the edit was opened on no commit (null, an empty repository)
// input: proposeSection without a token
// expect: only "main" is read; no file existed when the edit began, so both pages are GitHub's new-file pages and differs is true for both, since both exist now
test("proposeSection — an edit opened on no commit holds no file and reads no snapshot for it", async () => {
  const folder = `${TODAY}_mine`;
  const base = `docs/spec-freigaben/${folder}`;
  const f = repository({ files: queueFiles(folder, TODAY, ["## 1. Reading", "## 2. Writing"]), history: historyOf(folder, "alice"), canWrite: false });
  const result = await proposeSection(f.host, { ...CHANGE, openedHead: null });
  assert.deepEqual(f.host.reads, ["main"]);
  assert.deepEqual(result.fallback.map((page) => [page.path, page.url.split("/").slice(3, 6).join("/"), page.differs]),
    [[`${base}/01-reading.md`, "alice/product/new", true], [`${base}/01-reading.begruendung.md`, "alice/product/new", true]]);
});

// TST-593001 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-018
// given: a GitHub product and a host whose token may write as far as repositoryInfo knows (canWrite true), but whose server refuses the commit with PermissionMissing; and the same product with a host with no token
// input: proposeSection of the same edit to each
// expect: the refused one writes nothing and returns the pages GitHub's web interface offers for each file of the entry, the same as the one with no token returns (paths, addresses, texts, differs)
test("proposeSection — when GitHub refuses the commit for a missing write permission it writes nothing and returns GitHub's pages", async () => {
  const refused = repository({ refuse: "PermissionMissing" });
  const result = await proposeSection(refused.host, CHANGE);
  assert.deepEqual(refused.commits, []);
  assert.ok(Array.isArray(result.fallback) && result.fallback.length === 4, JSON.stringify(result));
  const tokenless = await proposeSection(repository({ canWrite: false }).host, CHANGE);
  assert.deepEqual(result, tokenless);
});

// TST-593002 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; UC-018
// given: a GitLab product whose server refuses the commit with PermissionMissing, which has no fallback; and a GitHub product whose server refuses it with TokenRefused
// input: proposeSection of the edit to each
// expect: the GitLab one throws PermissionMissing; the GitHub one throws TokenRefused — only a missing write permission is answered with the pages —; nothing is written by either
test("proposeSection — a refused commit on GitLab, and any other refusal on GitHub, are thrown as they were", async () => {
  const gitlab = repository({ server: "gitlab", refuse: "PermissionMissing" });
  await assert.rejects(proposeSection(gitlab.host, CHANGE), { name: "PermissionMissing" });
  const github = repository({ refuse: "TokenRefused" });
  await assert.rejects(proposeSection(github.host, CHANGE), { name: "TokenRefused" });
  assert.deepEqual([...gitlab.commits, ...github.commits], []);
});
