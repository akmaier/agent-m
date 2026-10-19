// An entry's impact is read from one graph per snapshot (ITM-674) — MOD-spec-changes, as docs/architecture/MOD-spec-changes.md states it: `entryView(queue, entry, snapshot)` gives the impact list of every name the proposal changes, withdraws or
// adds, "with what references it" (`A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`), from MOD-trace-graph's graph of the snapshot. A snapshot is one repository at one commit and does not change; the open entries of one snapshot therefore
// share the graph of it, whose build reads the artifacts of the repository.
// Run: node --test tests/spec-changes-impact-graph.test.mjs
//
// Module: MOD-spec-changes
// Guards: OPEN PROPOSALS ARE SHOWN IN THE BROWSER; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; A PAGE LOAD READS THE REPOSITORY IN BATCHES
// Level: unit
//
// The fixture product is small and ours, never Agent M's own SPEC.md: a SPEC of three sections, a queue of three open entries that change one requirement each, and a use case that names all three. The snapshot is held in memory and KEEPS NO BLOB:
// each `read` of a path is counted and fetches the text again, as a snapshot of a host that keeps none does. Nothing reaches the network. Each test states its input and its expected result before it runs. The counter-proofs are run as
// mutations and recorded in the pull request.
//
// Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - entryView's signature is unchanged: the graph is not passed in. The graph of a snapshot is kept for as long as the snapshot object lives and is not shared with another snapshot object, even one with the same files.
//   - A graph that could not be built is not kept: the next call builds it again.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as specChanges from "../src/spec-changes/index.mjs";

const { entryView } = specChanges;

const text = (...lines) => `${lines.join("\n")}\n`;
const gitBlob = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };

const NAMES = ["A FIRST RULE", "A SECOND RULE", "A THIRD RULE"];
const section = (n, rule) => text(`## ${n}. Section ${n}`, "", `**${NAMES[n - 1]}** *(Fixture PO)*`, rule, "*Check:* no automatic check; at review", "");
const WAS = (n) => section(n, `Rule ${n} as it stands.`);
const PROPOSED = (n) => section(n, `Rule ${n} as it is proposed.`);
const SPEC = text("# Fixture product — Specification", "") + [1, 2, 3].map(WAS).join("");
const QUEUE = "docs/spec-freigaben/2026-03-01_graph";
const USE_CASE_PATH = "docs/use-cases/UC-001-use-the-rules.md";
const USE_CASE = text("---", "id: UC-001", "title: Use the rules", "area: reading", "actors:", "  - Reader", "realises:", ...NAMES.map((name) => `  - ${name}`), "---", "# UC-001 Use the rules", "", "**Goal.** The reader uses the rules.");

function files() {
  const tree = {
    "README.md": "# Fixture product\n", "SPEC.md": SPEC, [USE_CASE_PATH]: USE_CASE,
    [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · graph", "", "**Zieldatei aller Einträge:** `SPEC.md`", "", "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
      ...[1, 2, 3].map((n) => `| 0${n} | \`SPEC.md\` | ## ${n}. Section ${n} | — | — |`)),
    [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-03-01 graph", "", "Append-only."),
  };
  for (const n of [1, 2, 3]) {
    tree[`${QUEUE}/0${n}-section-${n}.md`] = PROPOSED(n);
    tree[`${QUEUE}/0${n}-section-${n}.begruendung.md`] = text(`# Section ${n}: a change`, "", "**The change.** A sample.");
  }
  return tree;
}

/** A snapshot that keeps no blob: every read fetches the text again and is counted by path. `failing` paths throw on their first read. */
function snapshotOf(tree, { failing = [] } = {}) {
  const reads = new Map(), thrown = new Set();
  return { reads, repository: ON_GITHUB, ref: "trunk", commit: "c".repeat(40), paths: Object.keys(tree).sort(),
    async read(path) {
      reads.set(path, (reads.get(path) ?? 0) + 1);
      if (failing.includes(path) && !thrown.has(path)) { thrown.add(path); throw Object.assign(new Error("Unreachable"), { name: "Unreachable" }); }
      return Object.hasOwn(tree, path) ? tree[path] : null;
    },
    blob: (path) => (Object.hasOwn(tree, path) ? gitBlob(tree[path]) : null) };
}

// TST-674001 · level: unit · module: MOD-spec-changes
// guards: OPEN PROPOSALS ARE SHOWN IN THE BROWSER; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: a snapshot that keeps no blob, with three open entries that each change one requirement, all named by the use case UC-001
// input: entryView for entries 01, 02 and 03 of the queue, one after the other, and then all three at once on a second snapshot of the same files
// expect: each impact names its requirement as changed, referenced by UC-001; the use case file is read once for the three entries, whether they are asked one after the other or all at once
test("TST-674001 the open entries of one snapshot build one graph, counted by its reads on a snapshot that keeps none", async () => {
  const snapshot = snapshotOf(files());
  for (const n of [1, 2, 3]) {
    const view = await entryView(QUEUE, n, snapshot);
    assert.deepEqual(view.impact.map(({ name, change, referencedBy }) => [name, change, referencedBy]), [[NAMES[n - 1], "changed", ["UC-001"]]]);
  }
  assert.equal(snapshot.reads.get(USE_CASE_PATH), 1, "the use case was read once for three entries");
  const together = snapshotOf(files());
  await Promise.all([1, 2, 3].map((n) => entryView(QUEUE, n, together)));
  assert.equal(together.reads.get(USE_CASE_PATH), 1, "asked at once, the graph is still built once");
});

// TST-674002 · level: unit · module: MOD-spec-changes
// guards: OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// given: two snapshot objects of the same files, each keeping no blob
// input: entryView of entry 01 on each
// expect: each reads the use case file once: a graph is kept for its snapshot and is not shared with another snapshot (the counter-proof of TST-674001: a graph kept for every call to come would read the second snapshot's files never)
test("TST-674002 another snapshot builds its own graph", async () => {
  const first = snapshotOf(files()), second = snapshotOf(files());
  await entryView(QUEUE, 1, first);
  await entryView(QUEUE, 1, second);
  assert.equal(first.reads.get(USE_CASE_PATH), 1);
  assert.equal(second.reads.get(USE_CASE_PATH), 1);
});

// TST-674003 · level: unit · module: MOD-spec-changes
// guards: OPEN PROPOSALS ARE SHOWN IN THE BROWSER; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a snapshot whose first read of the use case file fails (Unreachable) and later reads succeed
// input: entryView of entry 01, then again
// expect: the first call fails with the snapshot's failure; the second succeeds with the impact (a graph that could not be built is not kept)
test("TST-674003 a graph that could not be built is not kept", async () => {
  const snapshot = snapshotOf(files(), { failing: [USE_CASE_PATH] });
  await assert.rejects(entryView(QUEUE, 1, snapshot), (error) => error.name === "Unreachable");
  const view = await entryView(QUEUE, 1, snapshot);
  assert.deepEqual(view.impact.map(({ name, referencedBy }) => [name, referencedBy]), [[NAMES[0], ["UC-001"]]]);
});
