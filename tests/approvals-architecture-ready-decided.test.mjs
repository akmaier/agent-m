// architecture-ready counts an entry decided by its SPEC commit as decided (ITM-465) — MOD-approvals' precondition `architecture-ready`, as the
// accepted text of docs/architecture/MOD-approvals.md states it: "a warning finding naming every open SPEC change — an entry that neither an
// approval record nor a decision row naming the commit that wrote it into the SPEC decides (THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE,
// STATUS IS DERIVED FROM THE RECORDS)", and the SPEC's STATUS IS DERIVED FROM THE RECORDS: "a SPEC change entry also counts as decided when its
// queue's decision row names the commit that wrote it into the SPEC". For UC-022 step 1 and flow 1b.
// Run: node --test tests/approvals-architecture-ready-decided.test.mjs
//
// Module: MOD-approvals
// Guards: UC-022; STATUS IS DERIVED FROM THE RECORDS; THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE
// Level: unit
//
// The product is a small repository this file holds, in memory, behind a snapshot of its own (paths, blob and read, as MOD-repository-hosts'
// Snapshot gives them): a SPEC, one accepted use case, and two change queues. The first holds four entries: 01, named by no record and by a
// decision row whose fourth cell is the short identifier of a commit; 02, named by a record of its current proposal and by no row; 03, named by
// neither, though a row  that names no commit and a row of another verb that names one stand for it — neither decides; 04, named by a row of the queue that holds it and by no record. The second queue's entry 01 is named by nothing, though the first
// queue's row for entry 1 stands: a row decides the entry of its own queue. The module file does not say how a row names a commit: this file
// reads the row of a register without a header — `| <time> | <entry number> | uebernommen | <commit> |` — of the verb `uebernommen` (the only one the repository's rows use), whose fourth cell is the commit's
// identifier, short or whole, and whose entry number is read without its leading zero; the snapshot holds no history, so that the commit
// is not looked up. An open SPEC change is named by its proposal's path in the warning, as in tests/approvals-architecture.test.mjs. Each test
// states its input and its expected result before it runs (given / input / expect). Nothing reaches the network. The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as approvalsModule from "../src/approvals/index.mjs";

const { approvalStrategies } = approvalsModule;

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const SPEC = text("# Fixture product — Specification", "", "## Section", "", "**A SAMPLE RULE** *(Product Owner)*", "A sample rule.", "*Check:* `tests/sample.test.mjs`");
const UC = text("---", "id: UC-001", "title: Read a file", "area: files", "actors:", "  - Reader", "realises:", "  - A SAMPLE RULE", "---", "# UC-001 Read a file", "", "**Goal.** Read a file.");
const UC_PATH = "docs/use-cases/UC-001-read-a-file.md";

const QUEUE = "docs/spec-freigaben/2026-09-23_fixture";
const entryPath = (queue, number, slug) => `${queue}/${String(number).padStart(2, "0")}-${slug}.md`;
const E1 = entryPath(QUEUE, 1, "a-rule-decided-by-its-commit"), E2 = entryPath(QUEUE, 2, "a-rule-named-by-a-record");
const E3 = entryPath(QUEUE, 3, "a-rule-nothing-decides"), E4 = entryPath(QUEUE, 4, "a-rule-decided-by-a-whole-commit");
const OTHER = "docs/spec-freigaben/2026-09-24_other", O1 = entryPath(OTHER, 1, "a-rule-of-another-queue");
const proposal = (name) => text(`**${name}** *(Product Owner)*`, "A rule.");
const PROPOSALS = { [E1]: proposal("RULE ONE"), [E2]: proposal("RULE TWO"), [E3]: proposal("RULE THREE"), [E4]: proposal("RULE FOUR"), [O1]: proposal("RULE OTHER") };
const index = (title, count) => text(`# SPEC approvals — queue ${title}`, "", "| Nr | Datei |", "|---|---|", ...Array.from({ length: count }, (_, i) => `| ${String(i + 1).padStart(2, "0")} | \`SPEC.md\` |`));
const record = (queue, number, body) => ({ [`docs/approvals/spec-${queue.slice(queue.lastIndexOf("/") + 1)}-${String(number).padStart(2, "0")}-${blobOf(body).slice(0, 12)}.md`]:
  text("kind: spec", `queue: ${queue}`, `entry: ${String(number).padStart(2, "0")}`, `blob: ${blobOf(body)}`) });
const rows = (...lines) => text("# Decisions — queue fixture", "", "Append-only.", ...lines);
const FILES = {
  "SPEC.md": SPEC, "README.md": "# Fixture product\n", [UC_PATH]: UC, [`docs/approvals/UC-001-${blobOf(UC).slice(0, 12)}.md`]: text("kind: use-case", `file: ${UC_PATH}`, `blob: ${blobOf(UC)}`),
  [`${QUEUE}/index.md`]: index("2026-09-23 · fixture", 4), ...PROPOSALS,
  [`${QUEUE}/entscheidungen.md`]: rows("| 2026-09-23 21:53 | 1 | uebernommen | e2ce99d |", "| 2026-09-23 22:04 | 4 | uebernommen | 8fc690f44a4570f45777abc9a7142728bce2737d |",
    "| 2026-09-23 22:10 | 3 | uebernommen | — |", "| 2026-09-23 22:11 | 3 | zurueckgestellt | 8fc690f44a4570f45777abc9a7142728bce2737d |"),
  ...record(QUEUE, 2, PROPOSALS[E2]),
  [`${OTHER}/index.md`]: index("2026-09-24 · other", 1),
};

const contextOf = (files) => ({ params: {}, product: { address: "https://github.com/alice/product", host: null,
  snapshot: { repository: { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" }, ref: "main", commit: null,
    paths: Object.keys(files), read: async (path) => (path in files ? files[path] : null), blob: (path) => (path in files ? blobOf(files[path]) : null) } } });
const WHOLE = "THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE";
const ready = () => approvalStrategies?.preconditions?.["architecture-ready"];
const named = (found) => `${found.what} ${found.fix}`;

// guards: STATUS IS DERIVED FROM THE RECORDS; THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE; UC-022
// given: the product above, whose only open entries by the records alone are 01, 03, 04 and the other queue's 01; entry 01 has a decision row
//        naming a short commit and no record, entry 04 a row naming a whole commit and no record
// input: the precondition architecture-ready
// expect: one warning under THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE, naming the proposals of entry 03 and of the other queue's entry 01,
//         and neither entry 01 nor entry 04 of the first queue, which their rows decide, nor entry 02, which a record decides
test("architecture-ready — an entry whose decision row names its SPEC commit is not named open, with no approval record", async () => {
  assert.ok(ready(), `architecture-ready: ${approvalsModule.error?.message}`);
  const found = await ready()(contextOf(FILES));
  assert.ok(found, "a warning: the entries nothing decides are open");
  assert.equal(found.kind, "warning");
  assert.equal(found.rule, WHOLE);
  assert.ok(named(found).includes(E3), `${E3} is named in: ${named(found)}`);
  assert.ok(named(found).includes(O1), `${O1} is named in: ${named(found)}`);
  for (const decided of [E1, E4]) assert.ok(!named(found).includes(decided), `${decided} is decided by its row and not named in: ${named(found)}`);
});

// guards: STATUS IS DERIVED FROM THE RECORDS; UC-022
// given: the same product
// input: the precondition architecture-ready
// expect: entry 02, named by an approval record of its current proposal and by no row, is not named open, as before
test("architecture-ready — an entry named by an approval record is not named open, as before", async () => {
  assert.ok(ready(), `architecture-ready: ${approvalsModule.error?.message}`);
  const found = await ready()(contextOf(FILES));
  assert.ok(found, "known positive: the warning names the entries that are open");
  assert.ok(!named(found).includes(E2), `${E2} is not named in: ${named(found)}`);
});

// guards: THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE; UC-022
// given: the same product, and, as the known positive for what is decided, the product without entries 03 and the other queue
// input: the precondition architecture-ready, for each
// expect: with entry 03 and the other queue's entry 01 a warning that names exactly those two proposals and nothing else of the queues; without
//         them none (null): every entry left is decided
test("architecture-ready — an entry that neither a record nor a decision row decides is named open in the warning", async () => {
  assert.ok(ready(), `architecture-ready: ${approvalsModule.error?.message}`);
  const found = await ready()(contextOf(FILES));
  assert.equal(named(found).match(/docs\/spec-freigaben\//g).length, 2, `only the two proposals are named: ${named(found)}`);
  assert.match(found.what, /^[^\n]+$/);
  const settled = { ...FILES };
  for (const path of [E3, O1, `${OTHER}/index.md`]) delete settled[path];
  assert.equal(await ready()(contextOf(settled)), null);
});
