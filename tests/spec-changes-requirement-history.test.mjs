// MOD-spec-changes' requirementHistory (ITM-598) — as docs/architecture/MOD-spec-changes.md states it under Interfaces: "every accepted change
// to the text of a requirement, oldest first: the date and person of the accepting commit, its record, and the requirement's text before and
// after; a section written before any record shows the commit that introduced it and `record: null`".
// Run: node --test tests/spec-changes-requirement-history.test.mjs
//
// Module: MOD-spec-changes
// Guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// Level: unit
//
// The Host is a fake this file builds from a list of commits of a product's SPEC; no request leaves the process. Its SPEC has two sections
// and six commits: c1 writes the first section before any record exists, c2 adds a requirement to the second with its record, c3 accepts a
// change of both sections in one commit with two records, c4 adds a requirement to the second section, c5 is the instance's workflow applying
// a change whose record an earlier commit added, and c6 replaces the first section's only requirement. The expected texts are written in each
// case; none is read from a document. Readings the cases take, each from the sentence quoted:
//   - "the requirement's text" (A REQUIREMENT SHOWS ITS HISTORY: "the text before and after"): the requirement's head line, its rule and its
//     check, as they stand in the SPEC, without the blank line that ends them;
//   - "every accepted change to the text of a requirement": a commit of SPEC.md at which that text differs from its text at the commit before,
//     its first appearance and its withdrawal included; a commit that changes another requirement is none;
//   - "the person of the accepting commit": the author's account, or the name where the server names no account;
//   - "its record": the approval record of the section the requirement stands in, which carries the first twelve digits of the blob of the
//     section's exact bytes in its name (a proposal is written into the SPEC byte for byte).
// A name the module does not provide yet is undefined here, so that each test fails by itself.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as specChanges from "../src/spec-changes/index.mjs";

const { requirementHistory } = specChanges;

const blob12 = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0${text}`).digest("hex").slice(0, 12);
const req = (name, rule) => `**${name}** *(Vibe Coding)*\n${rule}\n*Check:* at review.\n\n`;
const text = (name, rule) => `**${name}** *(Vibe Coding)*\n${rule}\n*Check:* at review.`;
const first = (...reqs) => `## First section\n\n${reqs.join("")}`;
const second = (...reqs) => `## Second section\n\n${reqs.join("")}`;
const spec = (a, b) => `# Fixture — Specification\n\n${a}${b}`;
const record = (queue, entry, section) => `docs/approvals/spec-${queue}-${entry}-${blob12(section)}.md`;
const id = (n) => `c${n}`.padEnd(40, "0");

const ALPHA1 = req("ALPHA RULE", "Alpha one."), ALPHA2 = req("ALPHA RULE", "Alpha two."), ALPHA3 = req("ALPHA RULE", "Alpha three.");
const BETA1 = req("BETA RULE", "Beta one."), BETA2 = req("BETA RULE", "Beta two.");
const GAMMA = req("GAMMA RULE", "Gamma one."), DELTA = req("DELTA RULE", "Delta one.");
const R2 = record("2026-09-30_beta", "01", second(BETA1));
const R3A = record("2026-10-05_batch", "01", first(ALPHA2)), R3B = record("2026-10-05_batch", "02", second(BETA2));
const R4 = record("2026-10-08_gamma", "01", second(BETA2, GAMMA));
const R5 = record("2026-10-12_alpha", "01", first(ALPHA3));
const R6 = record("2026-10-15_withdraw", "01", first(DELTA));

// The commits, oldest first. `tree` are files the commit's tree holds beyond SPEC.md and the records its changes add.
const COMMITS = [
  { n: 1, date: "2026-09-23T12:17:09Z", author: { account: "akmaier", name: "A. Maier" }, spec: spec(first(ALPHA1), second()), added: [] },
  { n: 2, date: "2026-09-30T10:00:00Z", author: { account: "akmaier", name: "A. Maier" }, spec: spec(first(ALPHA1), second(BETA1)), added: [R2] },
  { n: 3, date: "2026-10-05T08:30:00Z", author: { account: null, name: "Pat Example" }, spec: spec(first(ALPHA2), second(BETA2)), added: [R3A, R3B] },
  { n: 4, date: "2026-10-08T09:00:00Z", author: { account: "akmaier", name: "A. Maier" }, spec: spec(first(ALPHA2), second(BETA2, GAMMA)), added: [R4] },
  { n: 5, date: "2026-10-12T20:36:06Z", author: { account: "agent-m apply-approvals", name: "agent-m apply-approvals" }, spec: spec(first(ALPHA3), second(BETA2, GAMMA)), added: [], tree: [R5] },
  { n: 6, date: "2026-10-15T07:00:00Z", author: { account: "akmaier", name: "A. Maier" }, spec: spec(first(DELTA), second(BETA2, GAMMA)), added: [R6] },
];

// A Host whose history of SPEC.md and whose snapshots are those of `commits`. `calls` records every readHistory and readSnapshot.
function hostOf(commits = COMMITS, { historyFails = null, snapshotFails = null } = {}) {
  const calls = { histories: [], snapshots: [] };
  const trees = new Map();
  let files = {};
  for (const c of commits) {
    files = { ...files, ...Object.fromEntries([...c.added, ...(c.tree ?? [])].map((path) => [path, "kind: spec\n"])), "SPEC.md": c.spec };
    trees.set(id(c.n), files);
  }
  return {
    calls,
    async readHistory(path, options) {
      calls.histories.push([path, options ?? null]);
      if (historyFails) throw historyFails;
      return [...commits].reverse().map((c) => ({ commit: id(c.n), parents: [], author: c.author, date: c.date, message: "",
        changes: [{ path: "SPEC.md", change: c.n === 1 ? "added" : "modified" }, ...c.added.map((p) => ({ path: p, change: "added" }))] }));
    },
    async readSnapshot(ref) {
      calls.snapshots.push(ref);
      if (snapshotFails) throw snapshotFails;
      const tree = trees.get(ref);
      return { ref, commit: ref, paths: Object.keys(tree), read: async (path) => tree[path] ?? null, blob: () => null };
    },
  };
}

// TST-598001 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: the six commits; ALPHA RULE is written by c1, changed by c3 and c5, withdrawn by c6, and untouched by c2 and c4 (c3's author names no account)
// input: requirementHistory("ALPHA RULE", host)
// expect: four changes, oldest first, at c1, c3, c5, c6, with their dates and persons: akmaier, Pat Example, agent-m apply-approvals, akmaier
test("a requirement's history lists the commits at which its text changed, oldest first, with the date and the person", async () => {
  const history = await requirementHistory("ALPHA RULE", hostOf());
  assert.deepEqual(history.map((change) => [change.commit, change.date, change.person]), [
    [id(1), "2026-09-23T12:17:09Z", "akmaier"],
    [id(3), "2026-10-05T08:30:00Z", "Pat Example"],
    [id(5), "2026-10-12T20:36:06Z", "agent-m apply-approvals"],
    [id(6), "2026-10-15T07:00:00Z", "akmaier"],
  ]);
});

// TST-598002 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: the six commits
// input: requirementHistory("ALPHA RULE", host)
// expect: before and after are the requirement's text before and after each change: none then "Alpha one."; one then two; two then three; three then none
test("each change carries the requirement's text before and after", async () => {
  const history = await requirementHistory("ALPHA RULE", hostOf());
  assert.deepEqual(history.map((change) => [change.before, change.after]), [
    [null, text("ALPHA RULE", "Alpha one.")],
    [text("ALPHA RULE", "Alpha one."), text("ALPHA RULE", "Alpha two.")],
    [text("ALPHA RULE", "Alpha two."), text("ALPHA RULE", "Alpha three.")],
    [text("ALPHA RULE", "Alpha three."), null],
  ]);
});

// TST-598003 · level: unit · module: MOD-spec-changes
// guards: UC-020 (5d); A REQUIREMENT SHOWS ITS HISTORY
// given: c1 writes the first section when no record exists; BETA RULE is first written by c2, which adds the record of its section
// input: requirementHistory for ALPHA RULE and for BETA RULE
// expect: ALPHA RULE's first change is c1 with record null and before null; BETA RULE's first change is c2 with the record R2 and before null
test("a section written before any record shows the commit that introduced it, with no record", async () => {
  const [introduced] = await requirementHistory("ALPHA RULE", hostOf());
  assert.deepEqual([introduced.commit, introduced.record, introduced.before], [id(1), null, null]);
  const [beta] = await requirementHistory("BETA RULE", hostOf());
  assert.deepEqual([beta.commit, beta.record, beta.before], [id(2), R2, null]);
});

// TST-598004 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: c3 accepts a change of both sections in one commit and adds two records, one for each section
// input: requirementHistory for ALPHA RULE (first section) and for BETA RULE (second section)
// expect: at c3 ALPHA RULE's record is the one of the first section and BETA RULE's the one of the second
test("of two records a commit adds, a requirement's is the one of its section", async () => {
  const at3 = async (name) => (await requirementHistory(name, hostOf())).find((change) => change.commit === id(3));
  assert.equal((await at3("ALPHA RULE")).record, R3A);
  assert.equal((await at3("BETA RULE")).record, R3B);
});

// TST-598005 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: c5 is written by the instance's workflow: it changes SPEC.md and adds no record, the record of the section having been committed by an earlier commit that left SPEC.md alone
// input: requirementHistory("ALPHA RULE", host)
// expect: the change at c5 names that record
test("a change the instance's workflow applied names the record an earlier commit added", async () => {
  const at5 = (await requirementHistory("ALPHA RULE", hostOf())).find((change) => change.commit === id(5));
  assert.equal(at5.record, R5);
});

// TST-598012 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: c5 adds the record R5 of the first section's text, and an older record of the same text, in another queue whose name sorts before R5's, stands in every tree since c1
// input: requirementHistory("ALPHA RULE", host)
// expect: the change at c5 names R5, the record that commit added, not the older one
test("of two records that name the section's text, the one the commit adds is the requirement's", async () => {
  const older = record("2026-09-01_older", "01", first(ALPHA3));
  assert.ok(older < R5, "known positive: the older record sorts first");
  const commits = COMMITS.map((c) => (c.n === 1 ? { ...c, tree: [older] } : c.n === 5 ? { ...c, added: [R5], tree: [] } : c));
  assert.equal((await requirementHistory("ALPHA RULE", hostOf(commits))).find((change) => change.commit === id(5)).record, R5);
});

// TST-598006 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: c6 replaces the first section's requirement and adds the record of the section
// input: requirementHistory for ALPHA RULE, and for DELTA RULE, which c6 writes
// expect: ALPHA RULE's last change is c6 with after null and the record R6; DELTA RULE's only change is c6 with before null and the record R6
test("a withdrawal and the first appearance of a requirement are changes, each with the record of the section", async () => {
  const alpha = (await requirementHistory("ALPHA RULE", hostOf())).at(-1);
  assert.deepEqual([alpha.commit, alpha.after, alpha.record], [id(6), null, R6]);
  const delta = await requirementHistory("DELTA RULE", hostOf());
  assert.deepEqual(delta.map((change) => [change.commit, change.before, change.after, change.record]), [[id(6), null, text("DELTA RULE", "Delta one."), R6]]);
});

// TST-598007 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: the six commits; BETA RULE changes at c3 and not at c4, which adds GAMMA RULE to the same section
// input: requirementHistory("BETA RULE", host)
// expect: the changes are c2 and c3 alone
test("a commit that changes another requirement of the section is no change of this one", async () => {
  assert.deepEqual((await requirementHistory("BETA RULE", hostOf())).map((change) => change.commit), [id(2), id(3)]);
});

// TST-598008 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: the six commits
// input: requirementHistory("ALPHA RULE", host)
// expect: readHistory is asked once, for SPEC.md, with no ref; readSnapshot is asked once for each of the six commits and for no other
test("the SPEC's history is read once and the SPEC once at each commit of it", async () => {
  const host = hostOf();
  await requirementHistory("ALPHA RULE", host);
  assert.deepEqual(host.calls.histories, [["SPEC.md", null]]);
  assert.deepEqual([...host.calls.snapshots].sort(), [1, 2, 3, 4, 5, 6].map(id));
});

// TST-598009 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: the six commits, none of which holds a requirement named NO SUCH RULE (known positive: ALPHA RULE has four changes)
// input: requirementHistory("NO SUCH RULE", host)
// expect: no change
test("a name the SPEC never held has no history", async () => {
  assert.equal((await requirementHistory("ALPHA RULE", hostOf())).length, 4, "known positive");
  assert.deepEqual(await requirementHistory("NO SUCH RULE", hostOf()), []);
});

// TST-598010 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: a Host whose readHistory fails as an unreachable server does, and one whose readSnapshot does
// input: requirementHistory("ALPHA RULE", host) with each
// expect: each rejects with the Host's own failure, named Unreachable
test("a failure of the Host is passed on, never an empty history", async () => {
  const unreachable = Object.assign(new Error("unreachable"), { name: "Unreachable" });
  await assert.rejects(requirementHistory("ALPHA RULE", hostOf(COMMITS, { historyFails: unreachable })), (failure) => failure === unreachable);
  await assert.rejects(requirementHistory("ALPHA RULE", hostOf(COMMITS, { snapshotFails: unreachable })), (failure) => failure === unreachable);
});

// TST-598011 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: the six commits
// input: requirementHistory with an empty name and with a name that is not a text
// expect: each rejects with a TypeError before the Host is asked anything
test("a history is asked for a named requirement", async () => {
  for (const name of ["", "  ", undefined, 7]) {
    const host = hostOf();
    await assert.rejects(requirementHistory(name, host), TypeError);
    assert.deepEqual(host.calls.histories, []);
  }
});

// TST-598014 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: one commit whose SPEC holds LONELY RULE with no source (its name alone on its line) and NOCHECK RULE with no check
// input: requirementHistory for each
// expect: LONELY RULE's text is "**LONELY RULE**", its rule and its check, without a source in parentheses; NOCHECK RULE's is its head line and its rule, without a check line
test("a requirement's text leaves out the part the SPEC does not give it", async () => {
  const one = [{ n: 1, date: "2026-09-23T12:17:09Z", author: { account: "akmaier", name: "A. Maier" }, added: [],
    spec: "# Fixture\n\n## Only section\n\n**LONELY RULE**\nLonely rule.\n*Check:* at review.\n\n**NOCHECK RULE** *(Vibe Coding)*\nRule only.\n" }];
  assert.equal((await requirementHistory("LONELY RULE", hostOf(one)))[0].after, "**LONELY RULE**\nLonely rule.\n*Check:* at review.");
  assert.equal((await requirementHistory("NOCHECK RULE", hostOf(one)))[0].after, "**NOCHECK RULE** *(Vibe Coding)*\nRule only.");
});

// TST-598013 · level: unit · module: MOD-spec-changes
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: twenty commits, at each of which ALPHA RULE's rule reads "Rule <n>."; a Host whose readSnapshot answers after 1 ms of the clock and counts the snapshots being read at once
// input: requirementHistory("ALPHA RULE", host)
// expect: twenty changes, in the order of the commits; the SPEC is read at eight commits at once, never at more
test("the SPEC is read at the commits in groups of eight, and the history keeps the order of the commits", async () => {
  const commits = Array.from({ length: 20 }, (_, at) => ({ n: at + 1, date: `2026-10-${String(at + 1).padStart(2, "0")}T00:00:00Z`,
    author: { account: "akmaier", name: "A. Maier" }, spec: spec(first(req("ALPHA RULE", `Rule ${at + 1}.`)), second()), added: [] }));
  const host = hostOf(commits);
  let reading = 0, most = 0;
  const readSnapshot = host.readSnapshot;
  host.readSnapshot = async (ref) => {
    reading += 1;
    most = Math.max(most, reading);
    await new Promise((resolve) => setTimeout(resolve, 1));
    try { return await readSnapshot(ref); } finally { reading -= 1; }
  };
  const history = await requirementHistory("ALPHA RULE", host);
  assert.deepEqual(history.map((change) => change.commit), commits.map((c) => id(c.n)));
  assert.equal(most, 8);
});
