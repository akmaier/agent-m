// Starting and closing a team's sprint (UC-032 step 6, 6a, 6c; UC-041 step 6) — MOD-work-plans' startSprint and closeSprint
// as the accepted text of docs/architecture/MOD-work-plans.md states them: Start sprint commits docs/backlog/sprints/<team>/
// <nn>.md with the team's next number, the end its time box gives and its own branch — the declared pattern, its
// placeholders <team> and <nn> filled —, created from the head; it is refused, with nothing written, for an item waiting for
// acceptance, one selected without the items it builds on that are not done, or one that conflicts names; a new start
// decision while the sprint runs is appended as ## Selection. Close sprint appends ## Review, ## Unfinished items and
// ## Retrospective in one commit, and is refused without a retrospective, with an unfinished item undecided, or twice.
// Run: node --test tests/work-plans-saves.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-032; UC-041; EVERY TEAM RUNS SPRINTS OF ITS OWN; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT; A SPRINT ENDS WITH A RETROSPECTIVE
// Level: unit
//
// The host is a fake of MOD-repository-hosts' Host with the product's files at one head: readSnapshot, repositoryInfo (its
// default branch main), createBranch and commitFiles, each call recorded; nothing reaches the network. The declaration is
// read with MOD-product-process' declarationSchema, the items from the snapshot with MOD-documents' item schema, the sprints
// with planSchemas.sprint. Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { declarationSchema } from "../src/product-process/index.mjs";
import { closeSprint, heldItems, planSchemas, startSprint } from "../src/work-plans/index.mjs";

const HEAD = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";
const TRAILERS = ["Agent-M-Job: JOB-20261011-0900-ab12"];
const MODEL = (timeBox = "1 week") => ({ name: "team-scrum", kind: "pulled", flow: { wip: null, timeBox, sprints: true } });

const declaration = (branch = "`sprint/<team>/<nn>`") => readDocument(declarationSchema, "docs/process.md", [
  "---", "model: team-scrum", "model_file: docs/process-models/team-scrum.md",
  "model_version: a1b2c3d4e5f60718293a4b5c6d7e8f9012345678", "---", "# How the product is developed", "",
  "## Roles", "", "The roles of team-scrum.", "", "## Practices", "", "- none", "", "## Branches", "",
  "| Phase or time box | Branch |", "|---|---|", ...(branch ? [`| Sprint | ${branch} |`] : []), "",
  "## Definition of Done", "", "The job rules hold.", "",
].join("\n"));

const moduleFile = (id, uses) => ({ kind: "module", path: `docs/architecture/${id}.md`, id, fields: { id, uses } });
const ARCHITECTURE = [moduleFile("MOD-store", []), moduleFile("MOD-pages", ["MOD-store.read"]), moduleFile("MOD-mail", [])];

const itemText = (id, modules, buildsOn = []) => [
  "---", `id: ${id}`, `title: ${id} the work`, "level: module", "realises:", "  - UC-032", "modules:",
  ...modules.map((m) => `  - ${m}`), ...(buildsOn.length ? ["builds_on:", ...buildsOn.map((b) => `  - ${b}`)] : ["builds_on: []"]),
  "tests:", "  - unit", "origin:", "  - UC-032", "---", `# ${id} ${id} the work`, "", "## Outcome", "", "Done.", "",
  "## Acceptance", "", "- a unit test.", "",
].join("\n");
const ITEMS = {
  "docs/backlog/ITM-001-store.md": itemText("ITM-001", ["MOD-store"]),
  "docs/backlog/ITM-002-pages.md": itemText("ITM-002", ["MOD-pages"], ["ITM-001"]),
  "docs/backlog/ITM-003-mail.md": itemText("ITM-003", ["MOD-mail"]),
};

// A fake host with `files` at HEAD.
function hostWith(files) {
  const calls = [];
  return {
    calls,
    async repositoryInfo() { calls.push(["repositoryInfo"]); return { defaultBranch: "main" }; },
    async readSnapshot(ref) {
      calls.push(["readSnapshot", ref]);
      return { ref, commit: HEAD, paths: Object.keys(files), blob: (p) => (p in files ? `blob-${p}` : null),
        read: async (p) => files[p] ?? null };
    },
    async createBranch(name, from) { calls.push(["createBranch", name, from]); },
    async commitFiles(change) { calls.push(["commitFiles", change]); return { commit: "c".repeat(40), url: "https://example.org/c" }; },
  };
}
const committed = (host) => host.calls.filter(([what]) => what === "commitFiles").map(([, change]) => change);
const ready = (...ids) => ids.map((item) => ({ item, state: "ready", reason: null, job: null, pullRequest: null }));
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);
const context = (over = {}) => ({ states: ready("ITM-001", "ITM-002", "ITM-003"), model: MODEL(), declaration: declaration(),
  held: [], architecture: ARCHITECTURE, running: null, head: HEAD, trailers: TRAILERS, ...over });
const SPRINT = { team: "team1", goal: "Store and show", start: "2026-10-12", closer: "alice", selection: ["ITM-001", "ITM-002"] };

// ---------------------------------------------------------------- startSprint

// TST-473168 · level: unit · module: MOD-work-plans
// guards: EVERY TEAM RUNS SPRINTS OF ITS OWN; A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
// given: a product whose team1 has no sprint yet; the model's time box 1 week; the declaration's branch for the sprint `sprint/<team>/<nn>`; ITM-001 and ITM-002 ready, ITM-002 building on ITM-001, which is selected with it
// input: startSprint(host, team1's sprint from 2026-10-12, context at HEAD)
// expect: the branch sprint/team1/01 created at HEAD; one commit on main at HEAD of docs/backlog/sprints/team1/01.md — sprint 1, its goal, start 2026-10-12, end 2026-10-18, the closer, the branch, the selection — with the job's trailers in its message; the result names the commit, the path, both items added and none removed
test("startSprint — a team's first sprint is its 01, with the end its time box gives and its own branch, created from the head", async () => {
  const host = hostWith({ ...ITEMS });
  const result = await startSprint(host, SPRINT, context());
  assert.deepEqual(host.calls.filter(([w]) => w === "createBranch"), [["createBranch", "sprint/team1/01", HEAD]]);
  const [change] = committed(host);
  assert.equal(change.branch, "main");
  assert.equal(change.expectedHead, HEAD);
  assert.deepEqual(change.files.map((f) => f.path), ["docs/backlog/sprints/team1/01.md"]);
  assert.ok(change.message.endsWith(TRAILERS[0]), change.message);
  const record = readDocument(planSchemas.sprint, "docs/backlog/sprints/team1/01.md", change.files[0].text);
  assert.deepEqual(record.fields, { sprint: 1, goal: "Store and show", start: "2026-10-12", end: "2026-10-18", closer: "alice",
    branch: "sprint/team1/01", selection: ["ITM-001", "ITM-002"] });
  assert.deepEqual(result, { commit: "c".repeat(40), path: "docs/backlog/sprints/team1/01.md", added: ["ITM-001", "ITM-002"],
    removed: [] });
});

// TST-473169 · level: unit · module: MOD-work-plans
// guards: EVERY TEAM RUNS SPRINTS OF ITS OWN
// given: team1 has sprints 01 and 02, team2 sprints 01 to 05; a model without a time box; a declaration without a branch for the sprint
// input: startSprint for team1
// expect: docs/backlog/sprints/team1/03.md — numbered within the team, whatever team2 has —, with end and branch empty, and no branch created
test("startSprint — a sprint is numbered within its team; without a time box it has no end, without a declared branch no branch", async () => {
  const sprintFile = (team, n) => [`docs/backlog/sprints/${team}/${String(n).padStart(2, "0")}.md`, "---\nsprint: 1\n---\n"];
  const host = hostWith({ ...ITEMS, ...Object.fromEntries([sprintFile("team1", 1), sprintFile("team1", 2),
    ...[1, 2, 3, 4, 5].map((n) => sprintFile("team2", n))]) });
  const result = await startSprint(host, SPRINT, context({ model: MODEL(null), declaration: declaration(null) }));
  assert.equal(result.path, "docs/backlog/sprints/team1/03.md");
  const record = readDocument(planSchemas.sprint, result.path, committed(host)[0].files[0].text);
  assert.deepEqual([record.fields.sprint, record.fields.end, record.fields.branch], [3, "", ""]);
  assert.equal(host.calls.filter(([w]) => w === "createBranch").length, 0);
});

// TST-473170 · level: unit · module: MOD-work-plans
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
// given: (a) ITM-003 waiting for acceptance; (b) ITM-002 selected without ITM-001, which it builds on and which is not done; (c) team2's sprint 01 holding an item that changes MOD-store, and team1 selecting ITM-001, which changes it
// input: startSprint for team1 with each selection
// expect: each refused with SprintRefused, its reasons naming (a) ITM-003, (b) ITM-002 and ITM-001, (c) team2/01, the held item and MOD-store; nothing created and nothing committed
test("startSprint — refused, with nothing written, for an item waiting for acceptance, one without what it builds on, or one another team's sprint keeps out", async () => {
  const otherTeams = heldItems([readDocument(planSchemas.sprint, "docs/backlog/sprints/team2/01.md",
    "---\nsprint: 1\ngoal: g\nstart: 2026-10-01\nend:\ncloser: bob\nbranch:\nselection:\n  - ITM-009\n---\n# team2 Sprint 01\n")],
  [{ kind: "item", path: "docs/backlog/ITM-009-x.md", id: "ITM-009", fields: { id: "ITM-009", modules: ["MOD-store"] } }],
  ARCHITECTURE, []);
  const cases = [
    [{ ...SPRINT, selection: ["ITM-003"] },
      context({ states: [...ready("ITM-001", "ITM-002"), { item: "ITM-003", state: "waiting for acceptance", reason: "UC-099", job: null, pullRequest: null }] }),
      ["ITM-003"]],
    [{ ...SPRINT, selection: ["ITM-002"] }, context(), ["ITM-002", "ITM-001"]],
    [{ ...SPRINT, selection: ["ITM-001"] }, context({ held: otherTeams }), ["team2/01", "ITM-009", "MOD-store"]],
  ];
  for (const [sprint, ctx, named] of cases) {
    const host = hostWith({ ...ITEMS });
    const refused = await failure(startSprint(host, sprint, ctx));
    assert.equal(refused?.name, "SprintRefused", String(refused));
    const text = refused.reasons.join(" | ");
    for (const n of named) assert.ok(text.includes(n), `${n}: ${text}`);
    assert.deepEqual(host.calls.filter(([w]) => w === "createBranch" || w === "commitFiles"), []);
  }
});

// TST-473171 · level: unit · module: MOD-work-plans
// guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032 6a
// given: team1's running sprint 01, selecting ITM-001; a new start decision on 2026-10-14 selecting ITM-001 and ITM-003
// input: startSprint(host, that decision, context with the running sprint)
// expect: one commit of the running sprint's file, its text followed by ## Selection with at 2026-10-14 and both items; no branch created; added ITM-003, removed none
test("startSprint — a new start decision while the sprint runs is appended as ## Selection, naming what it adds and removes", async () => {
  const path = "docs/backlog/sprints/team1/01.md";
  const runningText = "---\nsprint: 1\ngoal: g\nstart: 2026-10-12\nend: 2026-10-18\ncloser: alice\nbranch: sprint/team1/01\n"
    + "selection:\n  - ITM-001\n---\n# team1 Sprint 01\n";
  const host = hostWith({ ...ITEMS, [path]: runningText });
  const running = readDocument(planSchemas.sprint, path, runningText);
  const result = await startSprint(host, { ...SPRINT, start: "2026-10-14", selection: ["ITM-001", "ITM-003"] }, context({ running }));
  const [change] = committed(host);
  assert.deepEqual(change.files.map((f) => f.path), [path]);
  assert.ok(change.files[0].text.startsWith(runningText), "the record is only appended to");
  const record = readDocument(planSchemas.sprint, path, change.files[0].text);
  assert.deepEqual(record.appended.map((s) => [s.heading, s.fields]), [["## Selection", { at: "2026-10-14", selection: ["ITM-001", "ITM-003"] }]]);
  assert.deepEqual([result.added, result.removed], [["ITM-003"], []]);
  assert.equal(host.calls.filter(([w]) => w === "createBranch").length, 0);
});

// ---------------------------------------------------------------- closeSprint

const OPEN = "---\nsprint: 1\ngoal: g\nstart: 2026-10-12\nend: 2026-10-18\ncloser: alice\nbranch:\nselection:\n  - ITM-001\n  - ITM-002\n---\n"
  + "# team1 Sprint 01\n";
const FACTS = { increment: [{ item: "ITM-001", pullRequest: "#7", realises: ["UC-032"], tests: ["tests/store.test.mjs"] }],
  notDone: [{ item: "ITM-002", state: "in progress", reason: "its pull request is open", job: null, pullRequest: "#8" }],
  numbers: { failedJobs: 0, retriedJobs: 0, correctionRounds: 1, waitingAtGates: "2 hours", waitingForAPerson: "1 hour",
    flakyTests: [], cost: "unknown" } };
const CLOSE = { sprint: "team1/01",
  review: { feedback: [{ line: "The store is fast enough.", goes: "noted", item: null }], tookPart: ["alice", "dev-a"], sources: null },
  unfinished: [{ item: "ITM-002", to: "backlog", reason: "the pages wait for a layout decision" }],
  retrospective: [{ text: "Split the pages' work smaller.", kind: "change", goes: "team agreement" }], newItems: [] };

// TST-473172 · level: unit · module: MOD-work-plans
// guards: A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT; A SPRINT ENDS WITH A RETROSPECTIVE; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: team1's sprint 01, open, selecting ITM-001 (done) and ITM-002 (not done); its facts; a close with one feedback line, who took part, ITM-002 back to the backlog, one retrospective change
// input: closeSprint(host, the close, context at HEAD)
// expect: one commit on main of the sprint's file only, appended to: ## Review naming the increment ITM-001, ITM-002 not done, the feedback and who took part; ## Unfinished items with ITM-002 to the backlog and its reason; ## Retrospective with the change — and, read again, the closed sprint holds no item: ITM-002 went back to the backlog, and no pull request of ITM-001 is known as merged
test("closeSprint — the review, the unfinished items and the retrospective are appended to the sprint's record in one commit", async () => {
  const path = "docs/backlog/sprints/team1/01.md";
  const host = hostWith({ ...ITEMS, [path]: OPEN });
  const result = await closeSprint(host, CLOSE, { facts: FACTS, architecture: ARCHITECTURE, head: HEAD, trailers: TRAILERS });
  const [change] = committed(host);
  assert.equal(change.branch, "main");
  assert.deepEqual(change.files.map((f) => f.path), [path]);
  assert.deepEqual(result, { commit: "c".repeat(40), written: [path] });
  const text = change.files[0].text;
  assert.ok(text.startsWith(OPEN), "the record is only appended to");
  const record = readDocument(planSchemas.sprint, path, text);
  assert.deepEqual(record.appended.map((s) => s.heading), ["## Review", "## Unfinished items", "## Retrospective"]);
  const review = record.appended[0].text;
  for (const named of ["ITM-001", "#7", "ITM-002", "The store is fast enough.", "noted", "alice", "dev-a"]) {
    assert.ok(review.includes(named), `review names ${named}`);
  }
  assert.deepEqual(record.appended[1].fields, { "to the backlog": ["ITM-002"], "into the next sprint": [] });
  assert.ok(record.appended[1].text.includes("the pages wait for a layout decision"));
  assert.ok(record.appended[2].text.includes("Split the pages' work smaller.") && record.appended[2].text.includes("team agreement"));
  assert.deepEqual(heldItems([record], [], ARCHITECTURE, []).map((h) => h.item), []);
});

// TST-473173 · level: unit · module: MOD-work-plans
// guards: A SPRINT ENDS WITH A RETROSPECTIVE; UC-041 6a
// given: the open sprint; a close (a) without a retrospective entry, (b) without a decision for ITM-002, which is not done, (c) of a sprint whose record has its ## Review already
// input: closeSprint of each
// expect: (a) RetrospectiveMissing, (b) Undecided naming ITM-002, (c) AlreadyClosed — and nothing committed in any
test("closeSprint — refused without a retrospective, with an unfinished item undecided, or a second time", async () => {
  const path = "docs/backlog/sprints/team1/01.md";
  const cases = [
    [OPEN, { ...CLOSE, retrospective: [] }, "RetrospectiveMissing"],
    [OPEN, { ...CLOSE, unfinished: [] }, "Undecided"],
    [`${OPEN}\n## Review\n\nDone before.\n`, CLOSE, "AlreadyClosed"],
  ];
  for (const [text, close, name] of cases) {
    const host = hostWith({ ...ITEMS, [path]: text });
    const refused = await failure(closeSprint(host, close, { facts: FACTS, architecture: ARCHITECTURE, head: HEAD, trailers: [] }));
    assert.equal(refused?.name, name, String(refused));
    if (name === "Undecided") assert.deepEqual(refused.items, ["ITM-002"]);
    assert.deepEqual(committed(host), []);
  }
});
