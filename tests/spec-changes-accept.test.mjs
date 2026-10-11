// Accepting SPEC change entries in their queue's order (ITM-340) — MOD-spec-changes' acceptEntries and applyApproved, as the accepted
// text of docs/architecture/MOD-spec-changes.md states them. acceptEntries accepts the entries shown in one commit under the person's
// account: for each, in the order of its queue's index, its approval record, the target's section replaced by the proposal byte for
// byte, and its decision row; an entry whose anchor another entry creates goes only with or after that entry; if any entry's proposal
// or section no longer has the blob that was shown, or a requirement of a proposal names no source the product links, nothing is
// written and every such entry is named. applyApproved makes the same checks and computes the same bytes for every `spec` record that
// no decision row names yet, and returns the files without writing them. entryView, queues and the rest of the module are not part of
// ITM-340.
// Run: node --test tests/spec-changes-accept.test.mjs
//
// Module: MOD-spec-changes
// Guards: UC-006
// Guards: A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN; THE APPROVED TEXT IS TAKEN VERBATIM; AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL
// Guards: A QUEUE IS ACCEPTED IN ITS ORDER; A STALE APPROVAL IS NOT APPLIED; A REQUIREMENT HAS A REGISTERED SOURCE
// Guards: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; THE GATE IS RECORDED
// Guards: THE REPLACED TEXT STAYS REACHABLE
// Level: unit
//
// The repository server is replaced by a fixture: a fake host that keeps to MOD-repository-hosts' interface as docs/architecture/
// MOD-repository-hosts.md states it — one repository in memory, whose default branch is `trunk`; repositoryInfo, readSnapshot and
// commitFiles as the interface describes them, a commit of all its files together made only if the branch still stands at the expected
// head, else `Moved { head }` —; every call recorded. Its other functions do not exist, so that a call the module has no business making
// fails by itself. The product is the small repository this file holds, never Agent M's own SPEC.md (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE):
// a SPEC of two sections, one queue with the entries each test needs — entry 05 replaces section 1 and creates a section "1a" that entry
// 06 starts with —, a register of two sources of which the product links one, and, for applyApproved, the records. The expected values
// are read off the fixture's own texts, never off the code: a blob is the SHA-1 of "blob <length>\0" and the text's bytes, computed here
// with node:crypto, and the SPEC after an acceptance is the pieces of the SPEC and of the proposals put together here.
//
// Where the module file leaves a reading open, the test states the reading it takes, and the pull request names it:
//   - `sectionBlob` of a shown entry is the blob of the section shown beside the proposal (entryView's current.blob); for an entry shown
//     with none — one that waits for its anchor — it is "". The SPEC must then not hold the anchor as it was read, and the record's
//     section is the blob of the section as the entry before it wrote it.
//   - Entries are checked in the order of the index against the SPEC as the entries before them in the same acceptance leave it: of two
//     entries that replace one section, the second is stale.
//   - An entry whose anchor the SPEC lacks and no entry before it in the acceptance creates is refused; the one it waits for is named.
//   - The record's file name is docs/approvals/spec-<queue folder>-<NN>-<the first twelve digits of the proposal's blob>.md, its text is
//     what MOD-documents writes for MOD-approvals' schema, and the commit's message names the entries and the person who accepted.
//   - A decision row is appended to the bytes of the file: `| <when> UTC | <entry> | uebernommen | approval:<record file> |`.
//   - applyApproved takes the target of an entry from the queue's index, and refuses a record that names another target, another
//     anchor or another proposal than its entry's; it reads the product's links and the register from docs/sources.md and
//     docs/sources/; it leaves alone a record of an entry that a decision row names, and applies queues oldest first.
//   - Nothing shown is a TypeError.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument } from "../src/documents/index.mjs";
import { approvalSchema } from "../src/approvals/index.mjs";
import { sourceSchemas } from "../src/source-register/index.mjs";
import * as specChanges from "../src/spec-changes/index.mjs";

// A name the module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once.
const { acceptEntries, applyApproved } = specChanges;

// ---------------------------------------------------------------- the product

const text = (...lines) => `${lines.join("\n")}\n`;
const pad2 = (n) => String(n).padStart(2, "0");
// The blob SHA git gives a text, as MOD-repository-hosts' snapshot gives a file's.
const gitBlob = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
const NOW = new Date("2026-03-01T10:00:00Z");
const WHEN = "2026-03-01 10:00 UTC";

const SAMPLE = "A SAMPLE RULE";
const ADDED_RULE = "AN ADDED RULE";
const WRITE_RULE = "A WRITE RULE";

// Section 1 as the SPEC holds it, and as entry 05 proposes it; the section "1a" that entry 05 creates, and as entry 06 proposes it;
// section 2 as the SPEC holds it, and as entry 07 proposes it. Every requirement names the source "Fixture PO", which the product links.
const READING = text("## 1. Reading", "", `**${SAMPLE}** *(Fixture PO)*`, "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`", "");
const READING_NEW = READING.replace("whole.", "whole, or says why not.");
const ADDED = text("## 1a. Added", "", `**${ADDED_RULE}** *(Fixture PO)*`, "A reader sees what was added.", "*Check:* no automatic check; at review", "");
const ADDED_NEW = ADDED.replace("what was added.", "what was added, and when.");
const WRITING = text("## 2. Writing", "", `**${WRITE_RULE}** *(Fixture PO)*`, "A writer writes a file whole.", "*Check:* no automatic check; at review");
const WRITING_NEW = WRITING.replace("whole.", "entirely.");
const HEAD = text("# Fixture product — Specification", "");
const SPEC = HEAD + READING + WRITING;

// The register and the links: the product links "Fixture PO"; "An unlinked source" is registered and not linked.
const ENTRY_PO = text("---", "id: SRC-fixture-po", "title: Fixture PO", "kind: document", "authority: normative", "licence: may be republished — fixture",
  "---", "# SRC-fixture-po Fixture PO", "", "A fixture source.");
const ENTRY_UNLINKED = text("---", "id: SRC-unlinked", "title: An unlinked source", "kind: document", "authority: normative",
  "licence: may be republished — fixture", "---", "# SRC-unlinked An unlinked source", "", "A fixture source.");
const LINKS = text("# The sources this product meets", "", "| Source | Version | Hash | Part |", "|---|---|---|---|",
  `| SRC-fixture-po | 2026-10-05 | ${"0".repeat(64)} | |`);
// The same, as MOD-documents reads them: what acceptEntries is given.
const sources = () => ({
  links: readDocument(sourceSchemas().links, "docs/sources.md", LINKS),
  register: [readDocument(sourceSchemas().entry, "docs/sources/SRC-fixture-po.md", ENTRY_PO),
    readDocument(sourceSchemas().entry, "docs/sources/SRC-unlinked.md", ENTRY_UNLINKED)],
});
const SOURCE_FILES = { "docs/sources.md": LINKS, "docs/sources/SRC-fixture-po.md": ENTRY_PO, "docs/sources/SRC-unlinked.md": ENTRY_UNLINKED };

const QUEUE = "docs/spec-freigaben/2026-03-01_sample";
const proposalPath = (item) => `${QUEUE}/${pad2(item.nr)}-${item.slug}.md`;
// An entry of the queue: its number, the heading it starts with, its proposed text and the slug of its files.
const entry = (nr, anchor, proposal) => ({ nr, anchor, proposal, slug: `entry-${nr}` });
const E05 = entry(5, "## 1. Reading", READING_NEW + ADDED);
const E06 = entry(6, "## 1a. Added", ADDED_NEW);
const E07 = entry(7, "## 2. Writing", WRITING_NEW);

const DECISIONS = text("# Decisions — queue 2026-03-01 sample", "", "Append-only.");
const recordName = (item, blob = gitBlob(item.proposal)) => `spec-2026-03-01_sample-${pad2(item.nr)}-${blob.slice(0, 12)}.md`;
const recordPath = (item, blob) => `docs/approvals/${recordName(item, blob)}`;
// The identifier of an entry, as the record's name begins: spec-<queue folder>-<NN>.
const entryId = (item) => recordName(item).replace(/-[0-9a-f]{12}\.md$/, "");
const rowFor = (item, blob) => `| ${WHEN} | ${item.nr} | uebernommen | approval:${recordName(item, blob)} |\n`;

// The files of the product: the SPEC, the queue with the entries given, the sources, and `extra` files.
function productFiles({ entries, decisions = DECISIONS, spec = SPEC, extra = {} }) {
  const files = {
    "README.md": "# Fixture product\n", "SPEC.md": spec, ...SOURCE_FILES,
    [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · sample", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
      ...entries.map((item) => `| ${pad2(item.nr)} | \`SPEC.md\` | ${item.anchor} | — | — |`)),
    [`${QUEUE}/entscheidungen.md`]: decisions,
    ...extra,
  };
  for (const item of entries) {
    files[proposalPath(item)] = item.proposal;
    files[`${QUEUE}/${pad2(item.nr)}-${item.slug}.begruendung.md`] = text(`# ${item.anchor}: a change`, "", "**The change.** A sample.");
  }
  return files;
}

// What a page shows of an entry: the blob of its proposal and of the section beside it; "" for an entry shown with no section.
const shownOf = (item, section) => ({ queue: QUEUE, entry: item.nr, proposalBlob: gitBlob(item.proposal), sectionBlob: section === "" ? "" : gitBlob(section) });

// A record as a person commits it, or as MOD-approvals' schema reads it: one `key: value` line each; `omit` leaves keys out.
function recordFile(item, { proposal = item.proposal, section, anchor = item.anchor, target = "SPEC.md", proposalAt = proposalPath(item), omit = [] }) {
  const fields = { kind: "spec", queue: QUEUE, entry: pad2(item.nr), proposal: proposalAt, blob: gitBlob(proposal), target, anchor, section: gitBlob(section) };
  const body = text(...Object.entries(fields).filter(([key]) => !omit.includes(key)).map(([key, value]) => `${key}: ${value}`));
  return [recordPath(item, gitBlob(proposal)), body];
}

// ---------------------------------------------------------------- the fake host

// A failure as MOD-repository-hosts names it: an error with the failure's name and its fields.
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name }, fields);

// The fake host. files: the default branch `trunk` at its head, { path: text }. onRead(fake): called once, right after the first snapshot
// is read — another writer's commit lands there.
function fakeHost({ files, onRead = null }) {
  const calls = [], commits = new Map();
  let made = 0, head = null, hook = onRead;
  const commitOf = (tree) => {
    const sha = createHash("sha1").update(`commit ${++made}`).digest("hex");
    commits.set(sha, tree);
    return sha;
  };
  head = commitOf(new Map(Object.entries(files)));
  const fake = {
    head: () => head,
    files: () => Object.fromEntries(commits.get(head)),
    calls: () => calls,
    writes: () => calls.filter((call) => call.fn === "commitFiles"),
    // Another writer's commit on `trunk`: each path of `changed` set to its text.
    land(changed) {
      head = commitOf(new Map([...commits.get(head), ...Object.entries(changed)]));
    },
    snapshot(ref = head) {
      const tree = commits.get(ref);
      return { repository: ON_GITHUB, ref: "trunk", commit: ref, paths: [...tree.keys()].sort(),
        read: async (path) => (tree.has(path) ? tree.get(path) : null), blob: (path) => (tree.has(path) ? gitBlob(tree.get(path)) : null) };
    },
    host: {
      async repositoryInfo() {
        calls.push({ fn: "repositoryInfo" });
        return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        calls.push({ fn: "readSnapshot", ref });
        if (ref !== "trunk") throw failure("NotFound", { what: ref });
        const snapshot = fake.snapshot(head);
        if (hook) { const then = hook; hook = null; then(fake); }
        return snapshot;
      },
      async commitFiles(change) {
        calls.push({ fn: "commitFiles", change: structuredClone(change) });
        if (!change.files.length) throw new TypeError("a change holds at least one file");
        if (new Set(change.files.map((file) => file.path)).size !== change.files.length) throw new TypeError("a change names a path twice");
        if (change.files.some((file) => typeof file.text !== "string")) throw new TypeError("a file is written as text");
        if (!/\S/.test(change.message)) throw new TypeError("a change has a message");
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", { head });
        head = commitOf(new Map([...commits.get(head), ...change.files.map((file) => [file.path, file.text])]));
        return { commit: head, url: `${ON_GITHUB.web}/commit/${head}` };
      },
    },
  };
  return fake;
}

// The fields of a record, as MOD-documents reads it by the record's schema.
const fieldsOf = (path, body) => readDocument(approvalSchema, path, body).fields;
// The files of a commit by path.
const written = (fake) => Object.fromEntries(fake.writes()[0].change.files.map((file) => [file.path, file.text]));

// ---------------------------------------------------------------- acceptEntries

// guards: A QUEUE IS ACCEPTED IN ITS ORDER; AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL; THE APPROVED TEXT IS TAKEN VERBATIM; UC-006
//         ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; THE GATE IS RECORDED; THE REPLACED TEXT STAYS REACHABLE
// given: the product above, whose default branch `trunk` holds the queue with entries 05 and 06 — 05 replaces section 1 and creates the
//        section "1a", 06 starts with "1a" — and the person alice, who was shown 05 beside section 1 and 06 beside no section; given
//        in the order 06, 05
// input: acceptEntries(host, [06 shown, 05 shown], "alice", now, sources)
// expect: one commit on `trunk`, on the head that was read, holding exactly the two records, the SPEC and the decisions file; the SPEC with
//         section 1 as 05 proposes it and section "1a" as 06 proposes it, every other byte as it was; the two records named by the
//         first twelve digits of each proposal's blob, with 05's section the blob of section 1 and 06's the blob of the section "1a" as
//         05 wrote it; two decision rows appended to the decisions file, 05's first; a message that names alice and the two entries; the
//         result { commit }; the replaced text is still in the head that was read, and no copy of it is added
test("acceptEntries — entries 05 and 06, 06's anchor created by 05, are accepted together in one commit, in index order", async () => {
  const fake = fakeHost({ files: productFiles({ entries: [E05, E06] }) });
  const read = fake.head();

  const result = await acceptEntries(fake.host, [shownOf(E06, ""), shownOf(E05, READING)], "alice", NOW, sources());

  assert.equal(fake.writes().length, 1, "one commit");
  const { change } = fake.writes()[0];
  assert.equal(change.branch, "trunk", "on the default branch the host names");
  assert.equal(change.expectedHead, read, "on the head that was read");
  const files = written(fake);
  assert.deepEqual(Object.keys(files).sort(), [recordPath(E05), recordPath(E06), `${QUEUE}/entscheidungen.md`, "SPEC.md"].sort(),
    "the records, the SPEC and the decisions, and no copy of what was replaced");
  assert.equal(files["SPEC.md"], HEAD + READING_NEW + ADDED_NEW + WRITING, "05's section and 06's, byte for byte, every other byte as it was");
  assert.equal(files[`${QUEUE}/entscheidungen.md`], DECISIONS + rowFor(E05) + rowFor(E06), "the old bytes, then 05's row, then 06's");
  assert.deepEqual(fieldsOf(recordPath(E05), files[recordPath(E05)]), { kind: "spec", queue: QUEUE, entry: "05", proposal: proposalPath(E05),
    blob: gitBlob(E05.proposal), target: "SPEC.md", anchor: "## 1. Reading", section: gitBlob(READING) });
  assert.deepEqual(fieldsOf(recordPath(E06), files[recordPath(E06)]), { kind: "spec", queue: QUEUE, entry: "06", proposal: proposalPath(E06),
    blob: gitBlob(E06.proposal), target: "SPEC.md", anchor: "## 1a. Added", section: gitBlob(ADDED) });
  assert.match(change.message, /\balice\b/, "the commit names who accepted");
  for (const item of [E05, E06]) assert.ok(change.message.includes(entryId(item)), `and what: ${entryId(item)} in ${change.message}`);
  assert.deepEqual(result, { commit: fake.head() });
  assert.equal((await fake.snapshot(read).read("SPEC.md")), SPEC, "the replaced text stands in the head that was read");
});

// guards: A QUEUE IS ACCEPTED IN ITS ORDER; UC-006
// given: the same product; 06 shown beside no section, as in the test above, without 05
// input: acceptEntries(host, [06 shown], "alice", now, sources) — and, to show the same fixture accepting, with 05 shown too
// expect: nothing written and { refused: [{ queue, entry: 6, reason }] }, the reason naming entry 05, which creates 06's anchor; with
//         05 shown too, one commit
test("acceptEntries — 06 alone is refused, naming 05, and nothing is written", async () => {
  const accepting = fakeHost({ files: productFiles({ entries: [E05, E06] }) });
  assert.ok((await acceptEntries(accepting.host, [shownOf(E05, READING), shownOf(E06, "")], "alice", NOW, sources())).commit, "known positive: with 05 it is accepted");

  const fake = fakeHost({ files: productFiles({ entries: [E05, E06] }) });
  const result = await acceptEntries(fake.host, [shownOf(E06, "")], "alice", NOW, sources());

  assert.equal(fake.writes().length, 0, "nothing written");
  assert.deepEqual(Object.keys(result), ["refused"]);
  assert.deepEqual(result.refused.map(({ queue, entry: number }) => [queue, number]), [[QUEUE, 6]]);
  assert.match(result.refused[0].reason, /05/, `the reason names 05: ${result.refused[0].reason}`);
});

// guards: A STALE APPROVAL IS NOT APPLIED; A QUEUE IS ACCEPTED IN ITS ORDER; UC-006
// given: entries 05 and 07, which replace sections 1 and 2; both shown as they stand, to show the same fixture accepting; then 07 shown
//        with the blob of a proposal it had earlier, and, in another host, 05 shown with the blob of a section 1 that the SPEC no longer
//        holds
// input: acceptEntries(host, [05 shown, 07 shown], ...) for each
// expect: both accepted in one commit for the first; for the second nothing written — not 05's change either — and 07 named with a reason
//         that is the proposal's; for the third nothing written and 05 named with a reason that is the section's
test("acceptEntries — an entry whose proposal or section changed after it was shown is refused and named, and nothing is written", async () => {
  const accepting = fakeHost({ files: productFiles({ entries: [E05, E07] }) });
  assert.ok((await acceptEntries(accepting.host, [shownOf(E05, READING), shownOf(E07, WRITING)], "alice", NOW, sources())).commit, "known positive");

  const proposal = fakeHost({ files: productFiles({ entries: [E05, E07] }) });
  const earlier = { ...shownOf(E07, WRITING), proposalBlob: gitBlob(WRITING_NEW + "an earlier wording\n") };
  const first = await acceptEntries(proposal.host, [shownOf(E05, READING), earlier], "alice", NOW, sources());
  assert.equal(proposal.writes().length, 0, "nothing written, 05's change either");
  assert.deepEqual(first.refused.map(({ entry: number }) => number), [7]);
  assert.match(first.refused[0].reason, /proposal/);

  const section = fakeHost({ files: productFiles({ entries: [E05, E07] }) });
  const second = await acceptEntries(section.host, [{ ...shownOf(E05, READING), sectionBlob: gitBlob(READING + "an earlier wording\n") }, shownOf(E07, WRITING)],
    "alice", NOW, sources());
  assert.equal(section.writes().length, 0);
  assert.deepEqual(second.refused.map(({ entry: number }) => number), [5]);
  assert.match(second.refused[0].reason, /section/);
});

// guards: A STALE APPROVAL IS NOT APPLIED; UC-006
// given: entries 05 and 07; 05 shown with a stale proposal blob and 07 with a stale section blob
// input: acceptEntries(host, [05 shown, 07 shown], ...)
// expect: nothing written, and both named — every such entry, in the order of the index
test("acceptEntries — every stale entry is named", async () => {
  const fake = fakeHost({ files: productFiles({ entries: [E05, E07] }) });
  const result = await acceptEntries(fake.host, [{ ...shownOf(E05, READING), proposalBlob: "1".repeat(40) },
    { ...shownOf(E07, WRITING), sectionBlob: "2".repeat(40) }], "alice", NOW, sources());
  assert.equal(fake.writes().length, 0);
  assert.deepEqual(result.refused.map(({ entry: number }) => number), [5, 7]);
  assert.match(result.refused[0].reason, /proposal/);
  assert.match(result.refused[1].reason, /section/);
});

// guards: A REQUIREMENT HAS A REGISTERED SOURCE; UC-006
// given: entry 07, whose proposal's requirement names "An unlinked source", a source the register holds and the product does not link,
//        and, to show the same fixture accepting, entry 07 with the source the product links; entry 05, whole, shown beside it
// input: acceptEntries(host, [05 shown, 07 shown], ...) for each
// expect: the linked one accepted; the unlinked one: nothing written, not 05's change either, and 07 named with a reason that names the
//         requirement and its source
test("acceptEntries — a requirement that names no linked source: nothing is written, and the entry is named", async () => {
  const accepting = fakeHost({ files: productFiles({ entries: [E05, E07] }) });
  assert.ok((await acceptEntries(accepting.host, [shownOf(E05, READING), shownOf(E07, WRITING)], "alice", NOW, sources())).commit, "known positive");

  const unlinked = entry(7, "## 2. Writing", WRITING_NEW.replace("(Fixture PO)", "(An unlinked source)"));
  const fake = fakeHost({ files: productFiles({ entries: [E05, unlinked] }) });
  const result = await acceptEntries(fake.host, [shownOf(E05, READING), shownOf(unlinked, WRITING)], "alice", NOW, sources());
  assert.equal(fake.writes().length, 0, "nothing written");
  assert.deepEqual(result.refused.map(({ entry: number }) => number), [7]);
  assert.ok(result.refused[0].reason.includes(WRITE_RULE) && result.refused[0].reason.includes("An unlinked source"), result.refused[0].reason);
});

// guards: A STALE APPROVAL IS NOT APPLIED; UC-006
// given: entry 05, shown with no section although the SPEC holds section 1; and, to show the same fixture accepting, shown beside it
// input: acceptEntries(host, [05 shown], ...) for each
// expect: accepted beside the section; shown with none, refused as stale — the SPEC holds a section that was not shown — and nothing written
test("acceptEntries — an entry shown with no section while the SPEC holds one is refused as stale", async () => {
  const accepting = fakeHost({ files: productFiles({ entries: [E05] }) });
  assert.ok((await acceptEntries(accepting.host, [shownOf(E05, READING)], "alice", NOW, sources())).commit, "known positive");

  const fake = fakeHost({ files: productFiles({ entries: [E05] }) });
  const result = await acceptEntries(fake.host, [shownOf(E05, "")], "alice", NOW, sources());
  assert.equal(fake.writes().length, 0);
  assert.deepEqual(result.refused.map(({ entry: number }) => number), [5]);
  assert.match(result.refused[0].reason, /section/);
});

// guards: A STALE APPROVAL IS NOT APPLIED; A QUEUE IS ACCEPTED IN ITS ORDER; UC-006
// given: entries 05 and 08, both on "## 1. Reading", both shown beside section 1 as the SPEC holds it
// input: acceptEntries(host, [05 shown, 08 shown], ...)
// expect: nothing written, and 08 named — after 05 the section it was shown beside is no longer the one that holds
test("acceptEntries — of two entries that replace one section, the second is stale", async () => {
  const rival = entry(8, "## 1. Reading", READING.replace("whole.", "entirely."));
  const fake = fakeHost({ files: productFiles({ entries: [E05, rival] }) });
  const result = await acceptEntries(fake.host, [shownOf(E05, READING), shownOf(rival, READING)], "alice", NOW, sources());
  assert.equal(fake.writes().length, 0);
  assert.deepEqual(result.refused.map(({ entry: number }) => number), [8]);
  assert.match(result.refused[0].reason, /section/);
});

// guards: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL; THE GATE IS RECORDED; UC-006
// given: entry 07 in a queue whose decisions file is of the retired form — a row with a time that has no UTC and a commit SHA for a reference —
//        and has no final line end; and, to show the same call on a canonical file, the file of the tests above
// input: acceptEntries(host, [07 shown], ...)
// expect: the file as it was, byte for byte, then a line end, then 07's row — nothing of the old rows rewritten; for the canonical file the
//         old bytes then the row
test("acceptEntries — a decision row is appended to the bytes of the file, whatever form the file is of", async () => {
  const legacy = text("# Decisions — queue 2026-03-01 sample", "", "Append-only.", "", "| 2026-02-28 09:00 | 1 | uebernommen | e2ce99d |").slice(0, -1);
  assert.ok(!legacy.endsWith("\n"));
  const fake = fakeHost({ files: productFiles({ entries: [E07], decisions: legacy }) });
  await acceptEntries(fake.host, [shownOf(E07, WRITING)], "alice", NOW, sources());
  assert.equal(written(fake)[`${QUEUE}/entscheidungen.md`], `${legacy}\n${rowFor(E07)}`);

  const canonical = fakeHost({ files: productFiles({ entries: [E07] }) });
  await acceptEntries(canonical.host, [shownOf(E07, WRITING)], "alice", NOW, sources());
  assert.equal(written(canonical)[`${QUEUE}/entscheidungen.md`], DECISIONS + rowFor(E07));
});

// guards: A QUEUE IS ACCEPTED IN ITS ORDER; UC-006
// given: entries 05 and 07, decided already — a decision row names 05's record — and the person shown 05 and 07 as they stand
// input: acceptEntries(host, [05 shown, 07 shown], ...)
// expect: nothing written, and 05 named as written into the SPEC already
test("acceptEntries — an entry that a decision row names is refused as written already", async () => {
  const [path, body] = recordFile(E05, { section: READING });
  const decided = DECISIONS + rowFor(E05);
  const fake = fakeHost({ files: productFiles({ entries: [E05, E07], decisions: decided, extra: { [path]: body } }) });
  const result = await acceptEntries(fake.host, [shownOf(E05, READING), shownOf(E07, WRITING)], "alice", NOW, sources());
  assert.equal(fake.writes().length, 0);
  assert.deepEqual(result.refused.map(({ entry: number }) => number), [5]);
  assert.match(result.refused[0].reason, /already/);
});

// guards: A STALE APPROVAL IS NOT APPLIED; ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; UC-006
// given: entry 07 shown as it stands; another writer's commit lands on `trunk` right after the head is read
// input: acceptEntries(host, [07 shown], ...)
// expect: it rejects with the error the host names, Moved, and nothing is written
test("acceptEntries — the failure of the host is passed on, unchanged: the branch moved after it was read", async () => {
  const fake = fakeHost({ files: productFiles({ entries: [E07] }), onRead: (host) => host.land({ "README.md": "# Fixture product, edited\n" }) });
  await assert.rejects(() => acceptEntries(fake.host, [shownOf(E07, WRITING)], "alice", NOW, sources()), { name: "Moved" });
  assert.equal(fake.files()["SPEC.md"], SPEC, "the SPEC is as it was");
});

// guards: A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN; UC-006
// given: nothing shown
// input: acceptEntries(host, [], ...)
// expect: a TypeError, and no request at all
test("acceptEntries — nothing shown is a TypeError", async () => {
  const fake = fakeHost({ files: productFiles({ entries: [E07] }) });
  await assert.rejects(() => acceptEntries(fake.host, [], "alice", NOW, sources()), TypeError);
  assert.deepEqual(fake.calls(), [], "no request");
});

// ---------------------------------------------------------------- applyApproved

// A repository in which the records given — [[entry, the section its record names]] — have been committed without the dashboard: the SPEC
// and the queue as they were (its entries those of the records, unless `entries` names them), the records, and no decision row.
function approvedFiles(records, { entries = records.map(([item]) => item), extra = {} } = {}) {
  const files = Object.fromEntries(records.map(([item, section]) => recordFile(item, { section })));
  return productFiles({ entries, extra: { ...files, ...extra } });
}

// guards: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; THE APPROVED TEXT IS TAKEN VERBATIM; A QUEUE IS ACCEPTED IN ITS ORDER; UC-006
// given: the records of entries 05 and 06 as acceptEntries wrote them in a host of its own — taken from that commit — committed without
//        the dashboard to a copy of the product that has no decision row
// input: applyApproved(snapshot, now)
// expect: the files it returns — the SPEC and the decisions file — are byte for byte the two files of acceptEntries' commit that are not
//         records; applied names the two records, 05's first; nothing refused; and it returns them without a write: the snapshot is unchanged
test("applyApproved — returns byte for byte what acceptEntries commits for the same records", async () => {
  const dashboard = fakeHost({ files: productFiles({ entries: [E05, E06] }) });
  await acceptEntries(dashboard.host, [shownOf(E05, READING), shownOf(E06, "")], "alice", NOW, sources());
  const committed = written(dashboard);
  const records = Object.fromEntries([recordPath(E05), recordPath(E06)].map((path) => [path, committed[path]]));

  const workflow = fakeHost({ files: productFiles({ entries: [E05, E06], extra: records }) });
  const before = workflow.files();
  const result = await applyApproved(workflow.snapshot(), NOW);

  assert.deepEqual(result.files, { "SPEC.md": committed["SPEC.md"], [`${QUEUE}/entscheidungen.md`]: committed[`${QUEUE}/entscheidungen.md`] });
  assert.deepEqual(result.applied, [recordPath(E05), recordPath(E06)]);
  assert.deepEqual(result.refused, []);
  assert.deepEqual(workflow.files(), before, "it writes nothing itself");
});

// guards: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; A STALE APPROVAL IS NOT APPLIED; UC-006
// given: after an acceptance, the head it made
// input: applyApproved on that head
// expect: nothing to apply: no file, nothing applied, nothing refused — a record that a decision row names is left alone
test("applyApproved — a record that a decision row names is left alone", async () => {
  const fake = fakeHost({ files: productFiles({ entries: [E05, E07] }) });
  await acceptEntries(fake.host, [shownOf(E05, READING), shownOf(E07, WRITING)], "alice", NOW, sources());
  const after = await applyApproved(fake.snapshot(), NOW);
  assert.deepEqual(after, { files: {}, applied: [], refused: [] });
});

// guards: A STALE APPROVAL IS NOT APPLIED; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; UC-006
// given: the records of entries 05 and 07 committed without the dashboard — 05's record naming the anchor "## 2. Writing", which is not 05's,
//        and, to show the same fixture applying, the same records with the right anchor
// input: applyApproved(snapshot, now) for each
// expect: with the right anchor both applied; with the wrong one 05's record refused and named, 07's still applied — a record that fails a
//         check changes nothing — and the SPEC holds 07's section and not 05's
test("applyApproved — a record whose anchor is not its entry's is refused and named", async () => {
  const right = fakeHost({ files: approvedFiles([[E05, READING], [E07, WRITING]]) });
  assert.equal((await applyApproved(right.snapshot(), NOW)).applied.length, 2, "known positive");

  const [path, body] = recordFile(E05, { section: READING, anchor: "## 2. Writing" });
  const fake = fakeHost({ files: approvedFiles([[E07, WRITING]], { entries: [E05, E07], extra: { [path]: body } }) });
  const result = await applyApproved(fake.snapshot(), NOW);
  assert.deepEqual(result.refused.map(({ record }) => record), [path]);
  assert.match(result.refused[0].reason, /anchor/);
  assert.deepEqual(result.applied, [recordPath(E07)]);
  assert.equal(result.files["SPEC.md"], HEAD + READING + WRITING_NEW, "only 07's section changed");
  assert.equal(result.files[`${QUEUE}/entscheidungen.md`], DECISIONS + rowFor(E07), "only 07's row");
});

// guards: A STALE APPROVAL IS NOT APPLIED; UC-006
// given: records of entries 05 and 07; 05's names a proposal blob that is no longer the proposal's, 07's a section blob that is no longer
//        the SPEC's; and a third pair, 05 and 07 whole
// input: applyApproved(snapshot, now)
// expect: record by record: for the stale proposal 05's record refused naming the proposal, for the stale section 07's refused naming the
//         section; the whole ones applied; refused records change nothing
test("applyApproved — a stale record is refused and named, record by record, and the others are applied", async () => {
  const stale = recordFile(E05, { proposal: READING_NEW + ADDED + "an earlier wording\n", section: READING });
  const files = approvedFiles([[E07, WRITING + "an earlier wording\n"]], { entries: [E05, E07], extra: { [stale[0]]: stale[1] } });
  const fake = fakeHost({ files });
  const result = await applyApproved(fake.snapshot(), NOW);
  assert.deepEqual(result.refused.map(({ record }) => record).sort(), [stale[0], recordPath(E07)].sort());
  const why = Object.fromEntries(result.refused.map(({ record, reason }) => [record, reason]));
  assert.match(why[stale[0]], /proposal/);
  assert.match(why[recordPath(E07)], /section/);
  assert.deepEqual(result.applied, []);
  assert.deepEqual(result.files, {}, "nothing stale is written");

  const mixed = approvedFiles([[E05, READING], [E07, WRITING + "an earlier wording\n"]]);
  const second = await applyApproved(fakeHost({ files: mixed }).snapshot(), NOW);
  assert.deepEqual(second.applied, [recordPath(E05)]);
  assert.deepEqual(second.refused.map(({ record }) => record), [recordPath(E07)]);
  assert.equal(second.files["SPEC.md"], HEAD + READING_NEW + ADDED + WRITING, "05's section, and 07's not");
});

// guards: A QUEUE IS ACCEPTED IN ITS ORDER; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; UC-006
// given: the records of 05 and 06 committed, and, in another copy of the product, 06's record alone, the queue holding both entries
// input: applyApproved(snapshot, now) for each
// expect: both applied, in index order, and the SPEC with both sections; 06's alone refused, with a reason that names entry 05, and no file
test("applyApproved — a record whose anchor an earlier entry creates is applied after that entry's, or refused naming it", async () => {
  const both = await applyApproved(fakeHost({ files: approvedFiles([[E06, ADDED], [E05, READING]], { entries: [E05, E06] }) }).snapshot(), NOW);
  assert.deepEqual(both.applied, [recordPath(E05), recordPath(E06)]);
  assert.equal(both.files["SPEC.md"], HEAD + READING_NEW + ADDED_NEW + WRITING);

  const alone = await applyApproved(fakeHost({ files: approvedFiles([[E06, ADDED]], { entries: [E05, E06] }) }).snapshot(), NOW);
  assert.deepEqual(alone.refused.map(({ record }) => record), [recordPath(E06)]);
  assert.match(alone.refused[0].reason, /05/);
  assert.deepEqual(alone.files, {});
});

// guards: A REQUIREMENT HAS A REGISTERED SOURCE; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; UC-006
// given: the record of entry 07, whose proposal names "An unlinked source" — registered in docs/sources/, not linked in docs/sources.md —,
//        and, to show the same fixture applying, the record of 07 with the source the product links
// input: applyApproved(snapshot, now) for each
// expect: the linked one applied; the unlinked one refused, naming the requirement, and no file
test("applyApproved — a requirement that names no source the repository links refuses the record", async () => {
  assert.equal((await applyApproved(fakeHost({ files: approvedFiles([[E07, WRITING]]) }).snapshot(), NOW)).applied.length, 1, "known positive");

  const unlinked = entry(7, "## 2. Writing", WRITING_NEW.replace("(Fixture PO)", "(An unlinked source)"));
  const result = await applyApproved(fakeHost({ files: approvedFiles([[unlinked, WRITING]]) }).snapshot(), NOW);
  assert.deepEqual(result.refused.map(({ record }) => record), [recordPath(unlinked)]);
  assert.ok(result.refused[0].reason.includes(WRITE_RULE), result.refused[0].reason);
  assert.deepEqual(result.files, {});
});

// guards: A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; UC-006
// given: the record of 07 naming README.md as its target, and one naming another file as its proposal; and the right record of 07
// input: applyApproved(snapshot, now) for each
// expect: the right one applied; each of the others refused, the SPEC untouched, README.md untouched
test("applyApproved — a record that names another target or another proposal than its entry's is refused", async () => {
  assert.equal((await applyApproved(fakeHost({ files: approvedFiles([[E07, WRITING]]) }).snapshot(), NOW)).applied.length, 1, "known positive");

  const [aimed, aimedBody] = recordFile(E07, { section: WRITING, target: "README.md" });
  const [other, otherBody] = recordFile(E07, { section: WRITING, proposalAt: `${QUEUE}/07-somewhere-else.md` });
  for (const [path, body, word] of [[aimed, aimedBody, /target/], [other, otherBody, /proposal/]]) {
    const result = await applyApproved(fakeHost({ files: productFiles({ entries: [E07], extra: { [path]: body } }) }).snapshot(), NOW);
    assert.deepEqual(result.refused.map(({ record }) => record), [path]);
    assert.match(result.refused[0].reason, word);
    assert.deepEqual(result.files, {});
  }
});

// guards: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; UC-006
// given: a record of the kind use-case, which is no SPEC entry's; a spec record that lacks its section line; and the right record of 07
// input: applyApproved(snapshot, now)
// expect: the use-case record left alone, neither applied nor refused; the incomplete spec record refused, naming what it lacks; 07's applied
test("applyApproved — a record of another kind is left alone, an incomplete spec record is refused", async () => {
  const useCase = ["docs/approvals/UC-001-aaaaaaaaaaaa.md", text("kind: use-case", "file: docs/use-cases/UC-001-read-a-file.md", `blob: ${"a".repeat(40)}`)];
  const [bare, bareBody] = recordFile(E05, { section: READING, omit: ["section"] });
  const files = approvedFiles([[E07, WRITING]], { entries: [E05, E07], extra: { [useCase[0]]: useCase[1], [bare]: bareBody } });
  const result = await applyApproved(fakeHost({ files }).snapshot(), NOW);
  assert.deepEqual(result.applied, [recordPath(E07)]);
  assert.deepEqual(result.refused.map(({ record }) => record), [bare]);
  assert.match(result.refused[0].reason, /section/);
});

// guards: A QUEUE IS ACCEPTED IN ITS ORDER; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; UC-006
// given: two queues, 2026-03-01_sample and the older 2026-02-01_older, each with one approved entry on "## 2. Writing" — the same section
// input: applyApproved(snapshot, now)
// expect: the older queue's record applied first, and the newer one's refused — after the older, the section is no longer the one its
//         record names — so that the SPEC holds the older entry's section
test("applyApproved — queues are applied oldest first, and the second record on one section is stale", async () => {
  const older = "docs/spec-freigaben/2026-02-01_older";
  const olderEntry = { nr: 1, anchor: "## 2. Writing", proposal: WRITING.replace("whole.", "completely."), slug: "entry-1" };
  const olderRecord = `docs/approvals/spec-2026-02-01_older-01-${gitBlob(olderEntry.proposal).slice(0, 12)}.md`;
  const extra = {
    [`${older}/index.md`]: text("# SPEC approvals — queue 2026-02-01 · older", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 01 | `SPEC.md` | ## 2. Writing | — | — |"),
    [`${older}/entscheidungen.md`]: text("# Decisions — queue 2026-02-01 older", "", "Append-only."),
    [`${older}/01-entry-1.md`]: olderEntry.proposal,
    [olderRecord]: text("kind: spec", `queue: ${older}`, "entry: 01", `proposal: ${older}/01-entry-1.md`, `blob: ${gitBlob(olderEntry.proposal)}`, "target: SPEC.md",
      "anchor: ## 2. Writing", `section: ${gitBlob(WRITING)}`),
  };
  const result = await applyApproved(fakeHost({ files: approvedFiles([[E07, WRITING]], { extra }) }).snapshot(), NOW);
  assert.deepEqual(result.applied, [olderRecord]);
  assert.deepEqual(result.refused.map(({ record }) => record), [recordPath(E07)]);
  assert.equal(result.files["SPEC.md"], HEAD + READING + olderEntry.proposal);
});
