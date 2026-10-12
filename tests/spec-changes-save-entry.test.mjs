// An open SPEC entry saved in place (ITM-394) — MOD-spec-changes' `saveEntry`, as docs/architecture/MOD-spec-changes.md states it: "saveEntry(host, edit: { queue, entry, text, why, person,
// openedBlob }) -> { commit } | { refused: "changed meanwhile", current } | { refused: "not open", state } | { fallback }" — an edited entry saved in its own queue, in one commit under the
// person's account: its proposal replaced by `text`, its rationale's impact list computed anew; no second queue is made (UC-006 3a, UC-018 1a). Refused when the proposal's blob on the default
// branch differs from `openedBlob`, returning the newer text, and when the entry is no longer open, naming its state. Without a token, as `proposeSection`.
// Run: node --test tests/spec-changes-save-entry.test.mjs
//
// Module: MOD-spec-changes
// Guards: UC-006; UC-018
// Guards: A SPEC EDIT IS SAVED AS A PROPOSAL; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// Guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
// Level: unit
//
// The repository is a fixture this file builds, never Agent M's own: a SPEC of two sections and a use case that realises one requirement, and a queue made by proposeSection itself (the code
// that makes the entries), as a snapshot beside a host that answers repositoryInfo, readSnapshot and readHistory and records every commit. Where the module file leaves a reading open, the
// test states the one it takes, and the pull request names it:
//   - `queue` is the folder proposeSection returns (`docs/spec-freigaben/<day>_<slug>`); `openedBlob` is the git blob SHA of the entry's proposal file, as entryView gives it.
//   - The entry's state is read before its text: an entry that is no longer open (in SPEC) is refused naming that state, whatever its proposal's blob.
//   - The rationale is made anew from the edit: its title, change and impact list from the new text against the section that holds now, its Why from `why`; its Origin (and Provenance, where a
//     job drafted the entry) are kept as they were, the entry's origin being no part of the edit. The index is not written: no row changes.
//   - A save of an entry that the queue does not hold is a RangeError, as entryView's.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import * as specChanges from "../src/spec-changes/index.mjs";
import { documentFindings, loadSchema, readDocument } from "../src/documents/index.mjs";

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

function repository({ files = {}, history = {}, canWrite = true, server = "github" } = {}) {
  const all = { "SPEC.md": SPEC, "docs/use-cases/UC-001-read-a-file.md": useCase, ...files };
  const commits = [];
  const web = server === "github" ? "https://github.com/alice/product" : "https://gitlab.example.test/alice/product";
  const snapshot = { repository: { server, origin: server === "github" ? "https://github.com" : "https://gitlab.example.test", path: "alice/product", web }, ref: "main", commit: "h".repeat(40),
    paths: Object.keys(all), blob: (path) => (Object.hasOwn(all, path) ? gitBlob(all[path]) : null), read: async (path) => (Object.hasOwn(all, path) ? all[path] : null) };
  const host = { commits,
    repositoryInfo: async () => ({ defaultBranch: "main", visibility: "private", canWrite, archived: false, description: "" }),
    readSnapshot: async () => snapshot,
    readHistory: async (path) => history[path] ?? [],
    commitFiles: async (change) => { commits.push(change); return { commit: "i".repeat(40), url: "https://example.test/commit" }; } };
  return { host, snapshot, commits, all };
}
const CHANGE = { target: "SPEC.md", anchor: "## 1. Reading", until: null, text: READING_EDITED, why: "A reader needs to know why a file cannot be read.", origin: "an issue of a reader",
  person: "alice", openedBlob: gitBlob(READING) };
const written = (commit) => Object.fromEntries(commit.files.map((file) => [file.path, file.text]));
const schemaText = readFileSync(new URL("../src/spec-changes/queue-rationale.schema.md", import.meta.url), "utf8");


const { saveEntry } = specChanges;

// A queue of alice's made by proposeSection from the first edit of Reading, and a host over a repository that holds it. `decisions` is appended to its entscheidungen.md.
async function withQueue({ canWrite = true, server = "github", decisions = "", provenance = "" } = {}) {
  const first = repository();
  const made = await proposeSection(first.host, CHANGE);
  const files = written(first.commits[0]);
  if (decisions) { const path = Object.keys(files).find((p) => p.endsWith("entscheidungen.md")); files[path] += decisions; }
  if (provenance) { const path = Object.keys(files).find((p) => p.endsWith(".begruendung.md")); files[path] = `${files[path]}\n${provenance}\n`; }
  const second = repository({ files, canWrite, server });
  return { ...second, queue: made.queue, files };
}
const EDIT = (queue, more = {}) => ({ queue, entry: 1, text: READING_RENAMED, why: "The name should say what is read.", person: "alice", openedBlob: gitBlob(READING_EDITED), ...more });
const proposalPath = (queue) => `${queue}/01-reading.md`;

// guards: A SPEC EDIT IS SAVED AS A PROPOSAL; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; UC-006 3a; UC-018 1a
// given: alice's open queue with an entry for Reading whose first edit changed A SAMPLE RULE, and a second edit that renames it to A READING RULE
// input: saveEntry
// expect: one commit on the default branch at the head read, holding the entry's proposal (the new text) and its rationale and nothing else — no index, no other queue, not the SPEC; the result
//         names the commit; the rationale is in the schema queue-rationale without a finding, its Why the new one, its impact list computed anew (A SAMPLE RULE withdrawn with UC-001, A READING
//         RULE added), its Origin as it was; read back, the queue is still the one queue, the entry open with the new proposal
test("saveEntry — an open entry is saved in place in one commit, with its impact list computed anew", async () => {
  assert.ok(saveEntry, "saveEntry is offered");
  const f = await withQueue();
  const result = await saveEntry(f.host, EDIT(f.queue));
  assert.deepEqual(result, { commit: "i".repeat(40) });
  assert.equal(f.commits.length, 1);
  const out = written(f.commits[0]);
  assert.deepEqual(Object.keys(out).sort(), [`${f.queue}/01-reading.begruendung.md`, proposalPath(f.queue)]);
  assert.equal(out[proposalPath(f.queue)], READING_RENAMED);
  assert.deepEqual([f.commits[0].branch, f.commits[0].expectedHead], ["main", "h".repeat(40)]);
  const rationale = out[`${f.queue}/01-reading.begruendung.md`];
  const schema = loadSchema(schemaText, "MOD-spec-changes");
  assert.deepEqual(documentFindings(schema, readDocument(schema, `${f.queue}/01-reading.begruendung.md`, rationale)), []);
  assert.ok(rationale.includes("The name should say what is read."));
  assert.ok(!rationale.includes("A reader needs to know why a file cannot be read."), "the old Why is gone");
  const impact = rationale.split("**Impact list.**")[1].split("**Origin.**")[0];
  assert.match(impact, /A SAMPLE RULE[^\n]*withdrawn[^\n]*UC-001/);
  assert.match(impact, /A READING RULE[^\n]*added/);
  assert.match(rationale, /\*\*Origin\.\*\*[^\n]*an issue of a reader/);
  const after = repository({ files: { ...f.files, ...out } });
  const all = await queues(after.snapshot);
  assert.deepEqual(all.map((queue) => queue.folder), [f.queue], "no second queue");
  const view = await entryView(f.queue, 1, after.snapshot);
  assert.equal(view.state, "open");
  assert.equal(view.proposal.text, READING_RENAMED);
  assert.deepEqual(view.impact.map((item) => [item.name, item.change]), [["A SAMPLE RULE", "withdrawn"], ["A READING RULE", "added"]]);
});

// guards: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; UC-018 3a
// given: an entry whose proposal changed after it was opened (the blob it was opened on is not the proposal's now); and, to show the call writing, the same edit on the right blob
// input: saveEntry
// expect: `changed meanwhile` with the proposal's text as it is now, and no commit; the same edit on the right blob is written
test("saveEntry — a proposal that changed meanwhile is refused with its newer text", async () => {
  const f = await withQueue();
  assert.deepEqual(await saveEntry(f.host, EDIT(f.queue)), { commit: "i".repeat(40) }, "known positive: on the proposal's blob");
  const g = await withQueue();
  const refused = await saveEntry(g.host, EDIT(g.queue, { openedBlob: gitBlob("an older proposal\n") }));
  assert.deepEqual(refused, { refused: "changed meanwhile", current: READING_EDITED });
  assert.deepEqual(g.commits, []);
});

// guards: A SPEC EDIT IS SAVED AS A PROPOSAL; UC-018 1a
// given: an entry that was accepted (a decision of the queue's entscheidungen.md says so), and an entry number the queue does not hold
// input: saveEntry
// expect: `not open` naming the state in SPEC, with no commit, even on the proposal's blob; a RangeError for the missing entry, with no commit
test("saveEntry — an entry that is no longer open is refused naming its state", async () => {
  const open = await withQueue();
  assert.equal((await saveEntry(open.host, EDIT(open.queue))).commit, "i".repeat(40), "known positive: open");
  const f = await withQueue({ decisions: `| ${TODAY} 10:00 UTC | 1 | uebernommen | approval:spec-x-01-aaaaaaaaaaaa.md |\n` });
  assert.deepEqual(await saveEntry(f.host, EDIT(f.queue)), { refused: "not open", state: "in SPEC" });
  assert.deepEqual(f.commits, []);
  const g = await withQueue();
  await assert.rejects(saveEntry(g.host, EDIT(g.queue, { entry: 7 })), RangeError);
  assert.deepEqual(g.commits, []);
});

// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL; UC-018 4a
// given: a GitHub product and a host with no token
// input: saveEntry
// expect: nothing written; GitHub's editor page for the proposal and for the rationale — both exist —, each with its path in the address and its text beside it, never in it
test("saveEntry — without a token on GitHub it writes nothing and returns GitHub's pages", async () => {
  const f = await withQueue({ canWrite: false });
  const result = await saveEntry(f.host, EDIT(f.queue));
  assert.deepEqual(f.commits, []);
  assert.deepEqual(result.fallback.map((page) => page.path).sort(), [`${f.queue}/01-reading.begruendung.md`, proposalPath(f.queue)]);
  for (const page of result.fallback) {
    assert.match(page.url, /^https:\/\/github\.com\/alice\/product\/edit\//);
    assert.ok(page.url.includes(page.path), "the path is in the address");
    assert.ok(!page.url.includes("says what is read") && !page.url.includes("READING RULE"), "the text is not");
    assert.equal(page.differs, false);
  }
  assert.equal(result.fallback.find((page) => page.path === proposalPath(f.queue)).text, READING_RENAMED);
});

// guards: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; UC-018 4b
// given: a GitLab product and a host with no token
// input: saveEntry
// expect: TokenRequired, and nothing written; with a token the same edit is written
test("saveEntry — without a token on GitLab it fails with TokenRequired", async () => {
  const g = await withQueue({ server: "gitlab" });
  assert.equal((await saveEntry(g.host, EDIT(g.queue))).commit, "i".repeat(40), "known positive: with a token");
  const f = await withQueue({ server: "gitlab", canWrite: false });
  await assert.rejects(saveEntry(f.host, EDIT(f.queue)), (error) => error.name === "TokenRequired");
  assert.deepEqual(f.commits, []);
});

// guards: A SPEC EDIT IS SAVED AS A PROPOSAL; UC-006 3a
// given: an entry that a job drafted, whose rationale carries a Provenance paragraph beside its Origin
// input: saveEntry with a new text and a new Why
// expect: the rationale made anew — the new Why — keeps the Origin and the Provenance paragraph as they were, and is still in the schema queue-rationale
test("saveEntry — the origin and the provenance of a drafted entry are kept", async () => {
  const PROVENANCE = "**Provenance.** Agent M unreleased, commit cccccccccccccccccccccccccccccccccccccccc; participant a-claude; 2026-10-12; correction rounds: 1.";
  const f = await withQueue({ provenance: PROVENANCE });
  await saveEntry(f.host, EDIT(f.queue));
  const rationale = written(f.commits[0])[`${f.queue}/01-reading.begruendung.md`];
  assert.ok(rationale.includes(PROVENANCE), "the provenance is kept");
  assert.match(rationale, /\*\*Origin\.\*\*[^\n]*an issue of a reader/);
  assert.ok(rationale.includes("The name should say what is read."));
  const schema = loadSchema(schemaText, "MOD-spec-changes");
  assert.deepEqual(documentFindings(schema, readDocument(schema, `${f.queue}/01-reading.begruendung.md`, rationale)), []);
});
