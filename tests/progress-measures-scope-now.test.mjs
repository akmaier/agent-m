// MOD-progress-measures' productFacts with the scope `now` (ITM-1252), as the accepted text of docs/architecture/MOD-progress-measures.md states it: "With the scope `now`,
// what the progress page of a model with sprints shows (UC-035), it reads what the scope `work` reads, with two differences: `sprints` are only those whose record holds no
// `## Review`, the running ones, so that `held` and `progressIn` derive from them alone; and `pullRequests` are those open and those updated on or after the earliest `start` of
// these sprints, listed with MOD-repository-hosts' `listPullRequests` and its `updatedSince` — none closed before it, and without a running sprint only the open ones." and, of
// the head commits MOD-work-plans' `undecidedHeads` names, "whether the default branch contains them, through the host's `containsCommit`, asked for all of them at once".
// Run: node --test tests/progress-measures-scope-now.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; A PAGE LOAD READS THE REPOSITORY IN BATCHES
// Level: unit
//
// The fixture product is a Scrum product of two teams: files held in memory, a host that records every call and answers listPullRequests as MOD-repository-hosts states it
// — by the state asked and, with `updatedSince`, only those updated on or after it —, and an instance snapshot. Nothing reaches the network. Where the texts leave a reading
// open, the test states the one it takes: the open pull requests are asked as `{ state: "open" }`, and the others as `{ state: "all", updatedSince }` — a pull request merged
// or closed is "merged" or "closed" in MOD-repository-hosts' PullRequest, so that the state `all` is the one that keeps both (the item ITM-1252 names `closed` there). Each test
// states its input and its expected result before it runs (given / input / expect). Counter-proof, recorded in the commit: the scope `work` lists every pull request, with no
// filter, and the scope `now` of a facts.mjs that reads every sprint holds team2's closed sprints too.

import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { productFacts } from "../src/progress-measures/index.mjs";

let fetched = [];
const realFetch = globalThis.fetch;
beforeEach(() => {
  fetched = [];
  globalThis.fetch = async (input) => { fetched.push(String(input?.url ?? input)); throw new Error("a test reached the network"); };
});
afterEach(() => {
  globalThis.fetch = realFetch;
  assert.deepEqual(fetched, [], "no request reaches the network");
});

const NOW = new Date("2026-10-28T12:00:00Z");
const MODEL_VERSION = "5".repeat(40);
const H1 = "a1".repeat(20), H2 = "a2".repeat(20), H3 = "a3".repeat(20);
const blobOf = (text) => createHash("sha1").update(text).digest("hex");

function snapshotOf(files, web = "https://github.com/alice/product") {
  return { repository: { server: "github", path: "alice/product", web }, ref: "main", commit: "c".repeat(40), paths: Object.keys(files),
    blob: (path) => (Object.hasOwn(files, path) ? blobOf(files[path]) : null), read: async (path) => (Object.hasOwn(files, path) ? files[path] : null) };
}

const frontMatter = (fields) => ["---", ...Object.entries(fields).flatMap(([key, value]) => (Array.isArray(value)
  ? [`${key}:`, ...value.map((entry) => `  - ${entry}`)] : [`${key}: ${value}`])), "---"].join("\n");
const item = (id, modules) => [frontMatter({ id, title: `${id} the work`, level: "module", realises: ["UC-001"], modules }), `# ${id} the work`, ""].join("\n");
const CLOSE = ["", "## Review", "", "Done what was done.", "", "## Unfinished items", "", "to the backlog:", "into the next sprint:", "", "## Retrospective", "", "- change: nothing.", ""];
const sprint = ({ n, start, end = "", branch = "", selection, closed = false }) => [frontMatter({ sprint: n, goal: `Sprint ${n}`, start, end, closer: "alice", branch, selection }),
  `# Sprint ${n}`, ...(closed ? CLOSE : [""])].join("\n");
const DECLARATION = [frontMatter({ model: "scrum", model_file: "src/model-catalogue/models/scrum.md", model_version: MODEL_VERSION }),
  "# Process", "", "## Practices", "", "- none", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Sprint | sprint/<team>/<nn> |", "",
  "## Definition of Done", "", "The job rules hold; no condition is added.", ""].join("\n");
const assignment = (team, owner) => [`# Role assignment of ${team}`, "", "## Roles", "", "| Role | Participants |", "|---|---|", `| Product Owner | ${owner} |`,
  `| Scrum Master | ${owner} |`, "| Developers | developer-a |", ""].join("\n");
const REGISTER = ["# Participants of this instance", "", "**REGISTER**", "", "The people and agents of the fixture instance.", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| alice | person | — | — | — | read the repository, write to the repository | — | account github.com/alice |",
  "| bob | person | — | — | — | read the repository, write to the repository | — | account github.com/bob |",
  "| developer-a | CLI agent | example-model | 200000 | — | read the repository, write to the repository, run code and tests | this machine | bridge lab-pc agent claude |", ""].join("\n");
const UC1 = "docs/use-cases/UC-001-store.md";

// team1 closed its sprint 02 and runs its sprint 03 since 2026-10-20 on its own branch, with ITM-001 and ITM-002; team2 closed its sprints 01 and 02.
function productFiles(over = {}) {
  const files = {
    "SPEC.md": "# Spec\n", [UC1]: "# UC-001 store\n",
    "docs/process.md": DECLARATION,
    "docs/role-assignments/team1.md": assignment("team1", "alice"), "docs/role-assignments/team2.md": assignment("team2", "bob"),
    "docs/backlog/ITM-001-store.md": item("ITM-001", ["MOD-store"]), "docs/backlog/ITM-002-pages.md": item("ITM-002", ["MOD-pages"]),
    "docs/backlog/ITM-003-mail.md": item("ITM-003", ["MOD-mail"]), "docs/backlog/ITM-004-feed.md": item("ITM-004", ["MOD-feed"]),
    "docs/backlog/sprints/team1/02.md": sprint({ n: 2, start: "2026-10-06", end: "2026-10-17", selection: ["ITM-004"], closed: true }),
    "docs/backlog/sprints/team1/03.md": sprint({ n: 3, start: "2026-10-20", branch: "sprint/team1/03", selection: ["ITM-001", "ITM-002"] }),
    "docs/backlog/sprints/team2/01.md": sprint({ n: 1, start: "2026-09-01", end: "2026-09-07", selection: ["ITM-003"], closed: true }),
    "docs/backlog/sprints/team2/02.md": sprint({ n: 2, start: "2026-09-08", end: "2026-09-14", selection: ["ITM-003"], closed: true }),
    ...over,
  };
  files[`docs/approvals/UC-001-${blobOf(files[UC1]).slice(0, 12)}.md`] = "kind: use-case\n";
  return files;
}

// A pull request with the date it was last updated, which the fake host's listPullRequests filters by.
const pr = (number, id, base, state, head, updated, merged = null) => ({ number, title: `${id}: the work`, branch: `work/${id}`, base, head, state, draft: false,
  url: `https://github.com/alice/product/pull/${number}`, opened: "2026-08-01T08:00:00Z", merged, closed: merged, body: "", updated });
// ITM-001 and ITM-002 merged into team1's sprint branch, which reaches no main, during sprint 03; ITM-004 merged into main long before; ITM-003's pull request was closed long
// before; one pull request is open since August and not updated since.
const PULL_REQUESTS = [pr(1, "ITM-001", "sprint/team1/03", "merged", H1, "2026-10-21T10:00:00Z", "2026-10-21T10:00:00Z"),
  pr(2, "ITM-002", "sprint/team1/03", "merged", H2, "2026-10-22T10:00:00Z", "2026-10-22T10:00:00Z"),
  pr(3, "ITM-004", "main", "merged", H3, "2026-10-10T10:00:00Z", "2026-10-10T10:00:00Z"),
  pr(4, "ITM-003", "main", "closed", "a4".repeat(20), "2026-09-05T10:00:00Z"),
  pr(5, "Tidy the README", "main", "open", "a5".repeat(20), "2026-08-01T08:00:00Z")];

function fixture({ files = productFiles(), pullRequests = PULL_REQUESTS } = {}) {
  const calls = [];
  let inFlight = 0, most = 0;
  const product = snapshotOf(files);
  const instance = snapshotOf({ "SPEC.md": "# Instance spec\n", "docs/participants.md": REGISTER }, "https://github.com/alice/agent-m");
  const host = {
    async repositoryInfo() { calls.push(["repositoryInfo"]); return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot(ref) { calls.push(["readSnapshot", ref]); return product; },
    async listPullRequests(...filter) {
      calls.push(["listPullRequests", ...filter]);
      const { state = "all", updatedSince } = filter[0] ?? {};
      return pullRequests.filter((p) => (state === "all" || p.state === state) && (!updatedSince || Date.parse(p.updated) >= Date.parse(updatedSince)));
    },
    async containsCommit(branch, commit) {
      calls.push(["containsCommit", branch, commit]);
      inFlight += 1; most = Math.max(most, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return false;
    },
  };
  return { host, calls, instance, instanceAt: async () => instance, most: () => most };
}
const facts = (f, scope) => productFacts(f.host, f.instance, f.instanceAt, NOW, { scope });
const listings = (f) => f.calls.filter((call) => call[0] === "listPullRequests").map((call) => call.slice(1));
const byNumber = (list) => [...list].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

// TST-1252101 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: team1's sprint 03 running since 2026-10-20 (no ## Review), team1's sprint 02 and team2's sprints 01 and 02 closed (each with ## Review)
// input: productFacts(…, { scope: "now" })
// expect: sprints holds team1/03 alone; the host is asked listPullRequests({ state: "open" }) and listPullRequests({ state: "all", updatedSince: "2026-10-20" }) and nothing else of the
//         pull requests; pullRequests are 1, 2 (updated during the sprint) and 5 (open) — not 3 and 4, closed before it; held is team1/03's ITM-001 and ITM-002
test("productFacts, scope now — the running sprints, the open pull requests and those updated since the oldest running sprint started", async () => {
  const f = fixture();
  const read = await facts(f, "now");
  assert.deepEqual(read.sprints.map((s) => s.path), ["docs/backlog/sprints/team1/03.md"]);
  assert.deepEqual(byNumber(listings(f)), byNumber([[{ state: "open" }], [{ state: "all", updatedSince: "2026-10-20" }]]));
  assert.deepEqual(read.pullRequests.map((p) => p.number).sort(), [1, 2, 5]);
  assert.deepEqual(read.held.map((h) => [h.item, h.sprint]), [["ITM-001", "team1/03"], ["ITM-002", "team1/03"]]);
  assert.deepEqual(read.assignments.map((a) => a.path), ["docs/role-assignments/team1.md", "docs/role-assignments/team2.md"], "both teams are still named");
});

// TST-1252102 · level: unit · module: MOD-progress-measures
// guards: UC-035
// given: the same product, team1's sprint 03 closed too — no sprint runs
// input: productFacts(…, { scope: "now" })
// expect: sprints is empty; the host is asked only listPullRequests({ state: "open" }); pullRequests is the open one, 5
test("productFacts, scope now — without a running sprint, only the open pull requests", async () => {
  const f = fixture({ files: productFiles({ "docs/backlog/sprints/team1/03.md": sprint({ n: 3, start: "2026-10-20", branch: "sprint/team1/03", selection: ["ITM-001", "ITM-002"], closed: true }) }) });
  const read = await facts(f, "now");
  assert.deepEqual(read.sprints, []);
  assert.deepEqual(listings(f), [[{ state: "open" }]]);
  assert.deepEqual(read.pullRequests.map((p) => p.number), [5]);
});

// TST-1252103 · level: unit · module: MOD-progress-measures
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: team1's running sprint 03, whose items ITM-001 and ITM-002 are merged into its branch, which reaches no main: undecidedHeads names their two heads
// input: productFacts(…, { scope: "now" }), and the containsCommit calls of the host
// expect: containsCommit("main", H1) and containsCommit("main", H2), both in flight at once
test("productFacts, scope now — the heads undecidedHeads names are asked with containsCommit together", async () => {
  const f = fixture();
  await facts(f, "now");
  assert.deepEqual(f.calls.filter((call) => call[0] === "containsCommit").map((call) => call.slice(1)).sort(), [["main", H1], ["main", H2]]);
  assert.equal(f.most(), 2, "both heads are asked together");
});

// TST-1252104 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: the same product
// input: productFacts(…, { scope: "work" }) — the counter-proof of TST-1252101
// expect: the scope work lists every pull request, with no filter, and holds every sprint; its scope stays what it was
test("productFacts, scope work — every sprint and every pull request, as before", async () => {
  const f = fixture();
  const read = await facts(f, "work");
  assert.deepEqual(listings(f), [[]]);
  assert.equal(read.sprints.length, 4);
  assert.deepEqual(read.pullRequests.map((p) => p.number), [1, 2, 3, 4, 5]);
});
