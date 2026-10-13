// A team's sprints and the items they hold (UC-032 steps 5 and 6, 6c, 6d; UC-041 steps 6 and 7) — MOD-work-plans' interface
// as the accepted text of docs/architecture/MOD-work-plans.md states it: planSchemas.sprint, the schema of
// docs/backlog/sprints/<team>/<nn>.md; heldItems, every item a team's sprint holds; and conflicts, what keeps an item from
// a team's selection.
// Run: node --test tests/work-plans-sprints.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-032; UC-041; EVERY TEAM RUNS SPRINTS OF ITS OWN; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH;
//         SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; SPRINT PLANNING SHOWS WHAT THE OTHER TEAMS'
//         SPRINTS HOLD
// Level: unit
//
// The fixture product has four modules: MOD-store, which uses nothing; MOD-pages, which uses MOD-store's interface; MOD-mail,
// which uses nothing; and MOD-feed, which uses MOD-mail's. Its items each change one module — ITM-001 MOD-store, ITM-002
// MOD-pages, ITM-003 MOD-mail, ITM-004 MOD-feed —, and ITM-005 changes MOD-store and MOD-mail. A sprint record is read with
// planSchemas.sprint through MOD-documents' readDocument. The items and the architecture's module files are Documents in the
// form MOD-documents' readDocument gives — kind, path, id, fields —: MOD-documents' artifactSchemas, which reads them, is not
// built yet, so they are written here in that form, with only the fields these functions read. Pull requests are in the form
// of MOD-repository-hosts' PullRequest. Each test states its input and its expected result before it runs
// (given / input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { documentFindings, readDocument } from "../src/documents/index.mjs";
import { conflicts, heldItems, planSchemas } from "../src/work-plans/index.mjs";

// ---------------------------------------------------------------- the fixture product

const moduleFile = (id, uses) => ({ kind: "module", path: `docs/architecture/${id}.md`, id, title: id,
  fields: { id, uses }, sections: [], appended: [], body: "" });
const ARCHITECTURE = [
  moduleFile("MOD-store", []),
  moduleFile("MOD-pages", ["MOD-store.read", "MOD-store.write"]),
  moduleFile("MOD-mail", []),
  moduleFile("MOD-feed", ["MOD-mail.fetch"]),
];

const item = (id, modules) => ({ kind: "item", path: `docs/backlog/${id}-the-work.md`, id, title: `${id} the work`,
  fields: { id, modules, builds_on: [] }, sections: [], appended: [], body: "" });
const ITEMS = [
  item("ITM-001", ["MOD-store"]),
  item("ITM-002", ["MOD-pages"]),
  item("ITM-003", ["MOD-mail"]),
  item("ITM-004", ["MOD-feed"]),
  item("ITM-005", ["MOD-store", "MOD-mail"]),
];
const itemNamed = (id) => ITEMS.find((i) => i.id === id);

// A sprint record of `team`, number `nn`, read with planSchemas.sprint: its front matter, then `appended` — lines of the
// sections appended after it, as they would stand in the file.
function sprint(team, nn, { selection, branch = "", end = "", appended = [] }) {
  const text = [
    "---",
    `sprint: ${Number(nn)}`,
    "goal: The fixture sprint's goal",
    "start: 2026-10-12",
    `end: ${end}`.trimEnd(),
    "closer: alice",
    `branch: ${branch}`.trimEnd(),
    "selection:",
    ...selection.map((id) => `  - ${id}`),
    "---",
    `# ${team} Sprint ${nn}`,
    "",
    ...appended,
    "",
  ].join("\n");
  return readDocument(planSchemas.sprint, `docs/backlog/sprints/${team}/${nn}.md`, text);
}

// A pull request whose head branch names `id`, into `base`.
const pr = (number, id, base, state = "open", merged = null) => ({ number, title: `${id}: the work`, branch: `work/${id}`,
  base, head: "a".repeat(40), state, draft: false, url: `https://github.com/alice/product/pull/${number}`,
  opened: "2026-10-12T08:00:00Z", merged, closed: merged });
// A pull request of a sprint's own branch into the default branch.
const increment = (number, branch, state = "open", merged = null) => ({ number, title: `Merge the increment of ${branch}`,
  branch, base: "main", head: "b".repeat(40), state, draft: false, url: `https://github.com/alice/product/pull/${number}`,
  opened: "2026-10-14T08:00:00Z", merged, closed: merged });

const heldIds = (held) => held.map((h) => h.item);

// ---------------------------------------------------------------- planSchemas.sprint

// TST-473174 · level: unit · module: MOD-work-plans
// guards: EVERY TEAM RUNS SPRINTS OF ITS OWN; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
// given: a sprint of team1, number 01, without a time box and without a branch of its own, selecting ITM-001 and ITM-003; then a new start decision appended as ## Selection, selecting ITM-001 and ITM-002, and its close appended as ## Unfinished items, sending ITM-002 back to the backlog
// input: readDocument(planSchemas.sprint, "docs/backlog/sprints/team1/01.md", the text); documentFindings of it
// expect: its front matter as written — sprint 1, end and branch empty —; the two appended sections with their fields, in their order; and no finding
test("planSchemas.sprint — a team's sprint record is read with its front matter and the sections appended to it", () => {
  const record = sprint("team1", "01", { selection: ["ITM-001", "ITM-003"], appended: [
    "## Selection", "", "at: 2026-10-13", "selection: ITM-001, ITM-002", "",
    "## Unfinished items", "", "to the backlog: ITM-002", "into the next sprint:", "", "ITM-002 waits for the store's change.",
  ] });
  assert.deepEqual(record.fields, { sprint: 1, goal: "The fixture sprint's goal", start: "2026-10-12", end: "",
    closer: "alice", branch: "", selection: ["ITM-001", "ITM-003"] });
  assert.deepEqual(record.appended.map((section) => [section.heading, section.fields]), [
    ["## Selection", { at: "2026-10-13", selection: ["ITM-001", "ITM-002"] }],
    ["## Unfinished items", { "to the backlog": ["ITM-002"], "into the next sprint": [] }],
  ]);
  assert.deepEqual(documentFindings(planSchemas.sprint, record), []);
});

// TST-473175 · level: unit · module: MOD-work-plans
// guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
// given: known positive first — the sprint of the test above, selecting ITM-001; then the same sprint selecting nothing
// input: documentFindings(planSchemas.sprint, each)
// expect: no finding for the first; for the second one error naming A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
test("planSchemas.sprint — a sprint that selects no item is an error", () => {
  assert.deepEqual(documentFindings(planSchemas.sprint, sprint("team1", "01", { selection: ["ITM-001"] })), []);
  const empty = sprint("team1", "01", { selection: [] });
  assert.deepEqual(documentFindings(planSchemas.sprint, empty).map((f) => [f.kind, f.rule]),
    [["error", "A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT"]]);
});

// ---------------------------------------------------------------- heldItems

// TST-473176 · level: unit · module: MOD-work-plans
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; SPRINT PLANNING SHOWS WHAT THE OTHER TEAMS' SPRINTS HOLD; EVERY TEAM RUNS SPRINTS OF ITS OWN
// given: team1's sprint 01 selecting ITM-002 and ITM-003; team2's sprint 01 selecting ITM-004; no pull request yet
// input: heldItems(those sprints, the items, the architecture, [])
// expect: each selected item, in the order of the sprints and of their selections, with its sprint and team, the modules it changes and the modules whose interfaces those use — ITM-002 changes MOD-pages, which uses MOD-store; ITM-004 changes MOD-feed, which uses MOD-mail
test("heldItems — every item a team's sprint selects is held, with its sprint, its team, the modules it changes and those they use", () => {
  const sprints = [sprint("team1", "01", { selection: ["ITM-002", "ITM-003"] }), sprint("team2", "01", { selection: ["ITM-004"] })];
  assert.deepEqual(heldItems(sprints, ITEMS, ARCHITECTURE, []), [
    { item: "ITM-002", sprint: "team1/01", team: "team1", changes: ["MOD-pages"], uses: ["MOD-store"] },
    { item: "ITM-003", sprint: "team1/01", team: "team1", changes: ["MOD-mail"], uses: [] },
    { item: "ITM-004", sprint: "team2/01", team: "team2", changes: ["MOD-feed"], uses: ["MOD-mail"] },
  ]);
});

// TST-473177 · level: unit · module: MOD-work-plans
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: team1's sprint 01, without a branch of its own, selecting ITM-001 and ITM-003; the pull request of ITM-001 into the default branch (a) open, (b) merged; and (c) no pull requests known — the host could not read them
// input: heldItems(that sprint, the items, the architecture, the pull requests of each case)
// expect: (a) both held; (b) only ITM-003 — ITM-001's change is in the default branch; (c) both held, never guessed
test("heldItems — an item stays held until a pull request with its change is merged into the default branch", () => {
  const sprints = [sprint("team1", "01", { selection: ["ITM-001", "ITM-003"] })];
  assert.deepEqual(heldIds(heldItems(sprints, ITEMS, ARCHITECTURE, [pr(1, "ITM-001", "main")])), ["ITM-001", "ITM-003"]);
  assert.deepEqual(heldIds(heldItems(sprints, ITEMS, ARCHITECTURE, [pr(1, "ITM-001", "main", "merged", "2026-10-13T10:00:00Z")])),
    ["ITM-003"]);
  assert.deepEqual(heldIds(heldItems(sprints, ITEMS, ARCHITECTURE, "unknown")), ["ITM-001", "ITM-003"]);
});

// TST-473178 · level: unit · module: MOD-work-plans
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; UC-041 7b
// given: team1's sprint 01 with its own branch sprint/team1/01, selecting ITM-001 and ITM-003; ITM-001's pull request merged into that branch on 2026-10-13; and the increment's pull request from that branch into the default branch (a) open, (b) merged on 2026-10-12, before ITM-001's merge, (c) merged on 2026-10-14, after it
// input: heldItems(that sprint, the items, the architecture, the pull requests of each case)
// expect: (a) and (b) both held — ITM-001's change is in the sprint's branch, not yet in the default branch; (c) only ITM-003, whose change was never merged
test("heldItems — an item merged into its sprint's own branch stays held until that branch is merged into the default branch after it", () => {
  const sprints = [sprint("team1", "01", { selection: ["ITM-001", "ITM-003"], branch: "sprint/team1/01" })];
  const work = pr(1, "ITM-001", "sprint/team1/01", "merged", "2026-10-13T10:00:00Z");
  assert.deepEqual(heldIds(heldItems(sprints, ITEMS, ARCHITECTURE, [work, increment(2, "sprint/team1/01")])),
    ["ITM-001", "ITM-003"]);
  assert.deepEqual(heldIds(heldItems(sprints, ITEMS, ARCHITECTURE,
    [work, increment(2, "sprint/team1/01", "merged", "2026-10-12T18:00:00Z")])), ["ITM-001", "ITM-003"]);
  assert.deepEqual(heldIds(heldItems(sprints, ITEMS, ARCHITECTURE,
    [work, increment(2, "sprint/team1/01", "merged", "2026-10-14T18:00:00Z")])), ["ITM-003"]);
});

// TST-473179 · level: unit · module: MOD-work-plans
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032 6a; UC-041 step 6
// given: team1's sprint 01 selecting ITM-001 and ITM-003, then a new start decision (## Selection) selecting ITM-001, ITM-002 and ITM-003, then its close (## Unfinished items) sending ITM-002 back to the backlog and ITM-003 into the next sprint; team1's sprint 02 selecting ITM-003
// input: heldItems(both sprints, the items, the architecture, [])
// expect: ITM-001, held by sprint 01 — its last selection —; ITM-002 not held — it went back to the backlog —; ITM-003 held by sprint 02 only
test("heldItems — a sprint holds its last selection, and an item its close sends back to the backlog or on to the next sprint is no longer its", () => {
  const first = sprint("team1", "01", { selection: ["ITM-001", "ITM-003"], appended: [
    "## Selection", "", "at: 2026-10-13", "selection: ITM-001, ITM-002, ITM-003", "",
    "## Unfinished items", "", "to the backlog: ITM-002", "into the next sprint: ITM-003",
  ] });
  const second = sprint("team1", "02", { selection: ["ITM-003"] });
  assert.deepEqual(heldItems([first, second], ITEMS, ARCHITECTURE, []).map((h) => [h.item, h.sprint]),
    [["ITM-001", "team1/01"], ["ITM-003", "team1/02"]]);
});

// TST-473180 · level: unit · module: MOD-work-plans
// guards: EVERY TEAM RUNS SPRINTS OF ITS OWN
// given: known positive first — team1's sprint 01 selecting ITM-001; then a sprint record that stands in no team's folder, docs/backlog/sprints/18.md, selecting ITM-003
// input: heldItems(both, the items, the architecture, [])
// expect: ITM-001 held by team1/01; nothing held by the record outside a team's folder — it is no team's sprint
test("heldItems — a sprint record outside a team's folder holds nothing", () => {
  const outside = readDocument(planSchemas.sprint, "docs/backlog/sprints/18.md",
    ["---", "sprint: 18", "goal: g", "start: 2026-10-01", "end: 2026-10-02", "closer: alice", "branch:", "selection:",
      "  - ITM-003", "---", "# Sprint 18", ""].join("\n"));
  assert.deepEqual(heldItems([sprint("team1", "01", { selection: ["ITM-001"] }), outside], ITEMS, ARCHITECTURE, [])
    .map((h) => [h.item, h.sprint]), [["ITM-001", "team1/01"]]);
});

// TST-473181 · level: unit · module: MOD-work-plans
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; UC-041 step 6
// given: team1's sprint 01, without a branch of its own, selecting ITM-001 and ITM-003, closed — its record holds ## Review, ## Unfinished items stating its decision in prose only, without fields, as older records do, and ## Retrospective —; ITM-001's pull request into the default branch open, ITM-003 without one
// input: heldItems(that sprint, the items, the architecture, ITM-001's open pull request)
// expect: nothing held — the close sent every item it did not finish back to the backlog or into the team's next sprint
test("heldItems — a closed sprint holds none of its items that has no merged pull request, in whatever form its close names them", () => {
  const closed = sprint("team1", "01", { selection: ["ITM-001", "ITM-003"], appended: [
    "## Review", "", "No item is done.", "",
    "## Unfinished items", "", "Every item of the selection that is not done goes into the next sprint of this team.", "",
    "## Retrospective", "", "- change: smaller items.",
  ] });
  assert.deepEqual(heldItems([closed], ITEMS, ARCHITECTURE, [pr(1, "ITM-001", "main")]), []);
});

// TST-473182 · level: unit · module: MOD-work-plans
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
// given: team1's sprint 01 with its own branch sprint/team1/01, selecting ITM-001 and ITM-003, closed as Close sprint writes it — ## Review, ## Unfinished items sending ITM-003 back to the backlog, ## Retrospective —; ITM-001's pull request merged into the sprint's branch on 2026-10-13; and the increment's pull request from that branch into the default branch (a) open, (b) merged on 2026-10-14, after ITM-001's merge
// input: heldItems(that sprint, the items, the architecture, the pull requests of each case)
// expect: (a) ITM-001 held — its change is in the sprint's branch, not yet in the default branch —; (b) nothing held
test("heldItems — a closed sprint keeps an item merged into its own branch held until that branch is merged into the default branch, and not after", () => {
  const closed = sprint("team1", "01", { selection: ["ITM-001", "ITM-003"], branch: "sprint/team1/01", appended: [
    "## Review", "", "The increment is ITM-001.", "",
    "## Unfinished items", "", "to the backlog: ITM-003", "into the next sprint:", "", "ITM-003 waits for the mail server.", "",
    "## Retrospective", "", "- change: smaller items.",
  ] });
  const work = pr(1, "ITM-001", "sprint/team1/01", "merged", "2026-10-13T10:00:00Z");
  assert.deepEqual(heldIds(heldItems([closed], ITEMS, ARCHITECTURE, [work, increment(2, "sprint/team1/01")])), ["ITM-001"]);
  assert.deepEqual(heldIds(heldItems([closed], ITEMS, ARCHITECTURE,
    [work, increment(2, "sprint/team1/01", "merged", "2026-10-14T18:00:00Z")])), []);
});

// TST-473183 · level: unit · module: MOD-work-plans
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: team1's sprint 01, without a branch of its own, selecting ITM-001, then a new start decision (## Selection) selecting ITM-001 and ITM-003, then its end (## Ended) — not closed: its record holds no ## Review —; ITM-001's pull request into the default branch open, ITM-003 without one
// input: heldItems(that sprint, the items, the architecture, ITM-001's open pull request)
// expect: both held, in the order of the selection
test("heldItems — a sprint not yet closed holds its items that have no merged pull request", () => {
  const ended = sprint("team1", "01", { selection: ["ITM-001"], appended: [
    "## Selection", "", "at: 2026-10-13", "selection: ITM-001, ITM-003", "",
    "## Ended", "", "at: 2026-10-15",
  ] });
  assert.deepEqual(heldIds(heldItems([ended], ITEMS, ARCHITECTURE, [pr(1, "ITM-001", "main")])), ["ITM-001", "ITM-003"]);
});

// ---------------------------------------------------------------- conflicts

// The items team2's sprint 01 holds — ITM-002 (changes MOD-pages, uses MOD-store) and ITM-004 (changes MOD-feed, uses
// MOD-mail) — and team1's sprint 01 holds ITM-003 (changes MOD-mail).
const HELD = heldItems([sprint("team1", "01", { selection: ["ITM-003"] }), sprint("team2", "01", { selection: ["ITM-002", "ITM-004"] })],
  ITEMS, ARCHITECTURE, []);

// TST-473184 · level: unit · module: MOD-work-plans
// guards: SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; UC-032 step 5
// given: what the sprints hold, HELD; team1 plans
// input: conflicts(an item, "team1", HELD, the architecture) for: ITM-002 itself, held by team2; ITM-001, which changes MOD-store, a module ITM-002 uses; ITM-004 — held by team2 —; and ITM-003, held by team1's own sprint
// expect: ITM-002: one entry, team2's sprint, ITM-002, MOD-pages; ITM-001: one entry naming team2/01, ITM-002 and MOD-store; ITM-004: one entry naming team2/01, ITM-004, MOD-feed; ITM-003: its own team's sprint holding it keeps nothing from the selection, but ITM-004 of team2 uses MOD-mail, which ITM-003 changes — one entry naming team2/01, ITM-004 and MOD-mail
test("conflicts — an item another team's sprint holds, or one that changes a module a held item uses, is kept from the selection, naming the sprint, the item and the module", () => {
  assert.deepEqual(conflicts(itemNamed("ITM-002"), "team1", HELD, ARCHITECTURE),
    [{ sprint: "team2/01", team: "team2", item: "ITM-002", module: "MOD-pages" }]);
  assert.deepEqual(conflicts(itemNamed("ITM-001"), "team1", HELD, ARCHITECTURE),
    [{ sprint: "team2/01", team: "team2", item: "ITM-002", module: "MOD-store" }]);
  assert.deepEqual(conflicts(itemNamed("ITM-004"), "team1", HELD, ARCHITECTURE),
    [{ sprint: "team2/01", team: "team2", item: "ITM-004", module: "MOD-feed" }]);
  assert.deepEqual(conflicts(itemNamed("ITM-003"), "team1", HELD, ARCHITECTURE),
    [{ sprint: "team2/01", team: "team2", item: "ITM-004", module: "MOD-mail" }]);
});

// TST-473185 · level: unit · module: MOD-work-plans
// guards: SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
// given: what the sprints hold, HELD; team2 plans
// input: conflicts(an item, "team2", HELD, the architecture) for: ITM-001, which changes MOD-store — no item team1's sprint holds changes or uses it —; and ITM-005, which changes MOD-store and MOD-mail, the module ITM-003 of team1 changes
// expect: none for ITM-001; for ITM-005 one entry naming team1/01, ITM-003 and MOD-mail
test("conflicts — an item that shares no module with another team's held items is free; one that does is named once per module", () => {
  assert.deepEqual(conflicts(itemNamed("ITM-001"), "team2", HELD, ARCHITECTURE), []);
  assert.deepEqual(conflicts(itemNamed("ITM-005"), "team2", HELD, ARCHITECTURE),
    [{ sprint: "team1/01", team: "team1", item: "ITM-003", module: "MOD-mail" }]);
});

// TST-473186 · level: unit · module: MOD-work-plans
// guards: SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
// given: team2's sprint holds ITM-004, which changes MOD-feed and uses MOD-mail, and an item of team1 that changes MOD-feed and MOD-mail
// input: conflicts(that item, "team1", what team2 holds, the architecture)
// expect: two entries for ITM-004, one per module — MOD-feed, which both change, and MOD-mail, which ITM-004 uses —, in the order of the modules' identifiers
test("conflicts — every shared module is named, in the order of its identifier", () => {
  const held = heldItems([sprint("team2", "01", { selection: ["ITM-004"] })], ITEMS, ARCHITECTURE, []);
  assert.deepEqual(conflicts(item("ITM-009", ["MOD-mail", "MOD-feed"]), "team1", held, ARCHITECTURE), [
    { sprint: "team2/01", team: "team2", item: "ITM-004", module: "MOD-feed" },
    { sprint: "team2/01", team: "team2", item: "ITM-004", module: "MOD-mail" },
  ]);
});
