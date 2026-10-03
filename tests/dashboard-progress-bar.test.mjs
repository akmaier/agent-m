// The progress bar on the main page — every item of the backlog by its state, counted from the order and the pull requests into
// the sprints' branches and the default branch, in the measure the product's model names (ITM-162; UC-035 step 2, its first
// slice). Derived at every load, never kept; a folded "What is this?"; nothing written.
// Run: node --test tests/
//
// Module: MOD-dashboard-app
// Guards: PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; EVERY STEP EXPLAINS ITSELF; UC-035
// Level: component
//
// The real dashboard (docs/assets/dashboard-app.mjs) and the bar's file docs/assets/dashboard/progress-bar.mjs run in
// tests/app-harness.mjs against a GitHub API mock that counts every request; the pull requests come from a fake of GitHub's pulls
// API that this file brings (a request handler), answering the base, the state and the pages as GitHub does. Every file is read by
// node itself. No test reads this repository's live backlog, sprint records or pull requests: the fixtures are built here, and
// Agent M's own backlog is the frozen copy tests/fixtures/sprint-02-running/ with a recorded list of its pull requests. The
// counter-proofs are recorded in docs/measurements/2026-10-03_progress-bar.md.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { gitBlobSha, recordText, useCaseRecord, approvalPath } from "../docs/assets/review-core.mjs";
import { repoServer, fakeCaches, openDashboard, REPO } from "./app-harness.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), "utf8");

// ---------------------------------------------------------------- a fake of GitHub's pulls API

// pr(...) -> a pull request as GitHub's REST API answers it. merged: when it was merged (its state is then "closed").
function pr({ number, item = null, title = null, head = null, base = "sprint/07", open = true, created = "2026-10-01T10:00:00Z",
  merged = null, by = "developer-b · fixture-model · started from sprint/07" }) {
  return { number, title: title ?? `${item}: the work of ${item}`, head: { ref: head ?? `team/${item}`, sha: "b".repeat(40) },
    base: { ref: base }, state: open && !merged ? "open" : "closed", created_at: created, merged_at: merged,
    merge_commit_sha: merged ? "f".repeat(40) : null, body: `${by}\n\nWhat the pull request does.` };
}

// GitHub's "List pull requests": base, state (open | closed | all), newest first by creation, per_page and page.
function pullsApi(prs, repo = REPO) {
  return async (url, init) => {
    if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${repo}/pulls`) return null;
    if (init.method !== "GET") return new Response("{}", { status: 405 });
    const base = url.searchParams.get("base"), state = url.searchParams.get("state") ?? "open";
    const per = Number(url.searchParams.get("per_page") ?? 30), page = Number(url.searchParams.get("page") ?? 1);
    const list = prs.filter((p) => !base || p.base.ref === base).filter((p) => state === "all" || p.state === state)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return new Response(JSON.stringify(list.slice((page - 1) * per, page * per)), { status: 200,
      headers: { "Content-Type": "application/json" } });
  };
}

// ---------------------------------------------------------------- a fixture product

const MODEL = read("tests/fixtures/flow/scrum-wip.md"); // pulled, WIP limit 2, sprints — measure: items per state over time
const TIMEBOXED = read("tests/fixtures/flow/scrum.md"); // pulled, time box of 2 weeks — measure: remaining items per time box
const PLANNED = read("tests/fixtures/flow/planned.md"); // planned — measure: plan entries per phase
const DECL = "---\nmodel: fixture-scrum-wip\nmodel_file: docs/process-models/fixture.md\nsprint_close: closer-agent\n---\n" +
  "# How the fixture product is developed\n";
const SPEC = "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nThe first rule.\n*Check:* no automatic check; at review.\n";
const UC1 = "docs/use-cases/UC-001-plan-the-work.md";
const useCase = (id, title) => `---\nid: ${id}\ntitle: ${title}\narea: 5 implementation\nrealises:\n  - RULE ONE\n---\n# ${id} ${title}\n`;

const id = (n) => `ITM-${String(n).padStart(3, "0")}`;
const itemPath = (n) => `docs/backlog/${id(n)}-item-${n}.md`;
const itemText = (n) => `---\nid: ${id(n)}\ntitle: The work of item ${n}\nkind: implementation\nlevel: 1\nrealises:\n  - RULE ONE\n` +
  `modules:\n  - MOD-fixture\ndepends_on: []\norigin: backlog refinement 2026-09-15\n---\n# ${id(n)} The work of item ${n}\n`;
const sprintText = ({ name, start, end = "", selection, branch }) =>
  `---\nid: ${name}\ngoal: The fixture's goal for ${name}\nstart: ${start}\nend: ${end}\nselection:\n` +
  `${selection.map((s) => `  - ${s}`).join("\n")}\ncloser: closer-agent\n${branch ? `branch: ${branch}\n` : ""}model: fixture\n` +
  `planned_by: owner-agent\n---\n# ${name}\n\n**REGISTER**\n`;
const orderText = (ns) => `# Backlog order\n\n**REGISTER**\n\n## Order\n\n${ns.map((n, i) => `${i + 1}. ${id(n)}`).join("\n")}\n`;

// The product of the behaviour tests: ten items — eight in the order, ITM-009 and ITM-010 not placed in it —, two sprint records
// with branches (sprint-06 ended, on sprint/06; sprint-07 running, on sprint/07), and these pull requests:
//   ITM-001 open into sprint/07 — in progress;   ITM-002 merged into sprint/07 — done;   ITM-005 merged into "elsewhere" — counts
//   nothing;   ITM-006 open into sprint/07 — in progress;   #15 names no item;   ITM-007 merged into sprint/06 — done;
//   ITM-008 merged into the default branch — done.   ITM-003, ITM-004, ITM-009, ITM-010 have none — not started.
// So: 3 done, 2 in progress, 0 blocked, 5 not started, of 10 — 30 % done.
async function fixtureProduct(over = {}) {
  const f = {
    "SPEC.md": SPEC, "docs/process.md": DECL, "docs/process-models/fixture.md": MODEL, [UC1]: useCase("UC-001", "Plan the work"),
    "docs/backlog/order.md": orderText([1, 2, 3, 4, 5, 6, 7, 8]),
    "docs/backlog/sprints/sprint-06.md": sprintText({ name: "sprint-06", start: "2026-09-01", end: "2026-09-20", selection: ["ITM-007"],
      branch: "sprint/06" }),
    "docs/backlog/sprints/sprint-07.md": sprintText({ name: "sprint-07", start: "2026-10-01",
      selection: ["ITM-001", "ITM-002", "ITM-003", "ITM-004", "ITM-005", "ITM-006"], branch: "sprint/07" }),
  };
  for (let n = 1; n <= 10; n++) f[itemPath(n)] = itemText(n);
  f[approvalPath("UC-001", await gitBlobSha(f[UC1]))] = recordText(useCaseRecord(UC1, await gitBlobSha(f[UC1])));
  for (const [k, v] of Object.entries(over)) { if (v === null) delete f[k]; else f[k] = v; }
  return f;
}
const FIXTURE_PRS = [
  pr({ number: 11, item: "ITM-001" }),
  pr({ number: 12, item: "ITM-002", open: false, merged: "2026-10-01T12:34:56Z" }),
  pr({ number: 13, item: "ITM-005", base: "elsewhere", open: false, merged: "2026-10-01T13:00:00Z" }),
  pr({ number: 14, item: "ITM-006" }),
  pr({ number: 15, title: "Fix a typo in the README", head: "fix/typo" }), // names no item
  pr({ number: 9, item: "ITM-007", base: "sprint/06", open: false, created: "2026-09-02T10:00:00Z", merged: "2026-09-03T10:00:00Z" }),
  pr({ number: 16, item: "ITM-008", base: "main", open: false, created: "2026-10-02T09:00:00Z", merged: "2026-10-02T10:00:00Z" }),
];

const files = (requests) => requests.filter((r) => r.startsWith("file ")).map((r) => r.slice(5)).sort();
const pulls = (requests) => requests.filter((r) => /^handler GET https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/pulls\?/.test(r));
const params = (r) => new URL(r.replace(/^handler GET /, "")).searchParams;
const slot = (page) => page.el("progress-bar");
// The numbers the bar carries: data-<name>="<value>" on its section.
const counts = (html) => Object.fromEntries([...html.matchAll(/\sdata-(total|done|in-progress|blocked|not-started|percent-done|remaining|selected)="(\d+)"/g)]
  .map((m) => [m[1], Number(m[2])]));
const open = async (repo, prs = FIXTURE_PRS, hash = "", more = {}) =>
  openDashboard({ server: await repoServer({ files: repo, handlers: [pullsApi(prs)] }), hash, ...more });

// ---------------------------------------------------------------- the bar

test("the main page shows every item of the backlog by its state — done, in progress, blocked, not started —, the percentage done, the measure named and the link to the Backlog tab", async () => {
  const page = await open(await fixtureProduct());
  const bar = slot(page);
  assert.match(bar, /data-progress-bar/);
  assert.match(bar, /data-measure="items per state over time"/);
  assert.match(bar, /items per state over time/, "the measure is named in the text");
  assert.deepEqual(counts(bar), { total: 10, done: 3, "in-progress": 2, blocked: 0, "not-started": 5, "percent-done": 30 });
  assert.match(bar, /30\s?%/);
  assert.match(bar, /data-bar/, "a stacked bar");
  for (const s of ["done", "in-progress", "blocked", "not-started"]) assert.match(bar, new RegExp(`data-segment="${s}"`), s);
  assert.match(bar, /href="#backlog"/);
  // Above the view, outside <main>: the view shows the use cases as before, and nothing of the bar.
  assert.match(page.main(), /<h2>Use cases<\/h2>/);
  assert.doesNotMatch(page.main(), /data-progress-bar/);
  // The same on #uc.
  const uc = await open(await fixtureProduct(), FIXTURE_PRS, "#uc");
  assert.equal(slot(uc), bar);
});

test("an item merged into a sprint's branch or into the default branch is done; one with an open pull request in progress; the rest not started — the unplaced items counted too", async () => {
  // Each item alone: the counts move exactly by the one pull request.
  const one = async (p) => counts(slot(await open(await fixtureProduct(), [p])));
  assert.deepEqual(await one(pr({ number: 1, item: "ITM-009", open: false, merged: "2026-10-02T10:00:00Z" })),
    { total: 10, done: 1, "in-progress": 0, blocked: 0, "not-started": 9, "percent-done": 10 }, "merged into the running sprint's branch");
  assert.deepEqual(await one(pr({ number: 1, item: "ITM-010", base: "sprint/06", open: false, merged: "2026-10-02T10:00:00Z" })),
    { total: 10, done: 1, "in-progress": 0, blocked: 0, "not-started": 9, "percent-done": 10 }, "merged into an earlier sprint's branch");
  assert.deepEqual(await one(pr({ number: 1, item: "ITM-010", base: "main", open: false, merged: "2026-10-02T10:00:00Z" })),
    { total: 10, done: 1, "in-progress": 0, blocked: 0, "not-started": 9, "percent-done": 10 }, "merged into the default branch");
  assert.deepEqual(await one(pr({ number: 1, item: "ITM-003" })),
    { total: 10, done: 0, "in-progress": 1, blocked: 0, "not-started": 9, "percent-done": 0 }, "open");
  // The denominator is every item of the tree, placed in the order or not.
  const fewer = counts(slot(await open(await fixtureProduct({ [itemPath(10)]: null }))));
  assert.equal(fewer.total, 9);
});

test("counter-proofs: a pull request naming no item changes no count; one merged into another base counts nothing", async () => {
  const all = counts(slot(await open(await fixtureProduct())));
  const withoutNoItem = counts(slot(await open(await fixtureProduct(), FIXTURE_PRS.filter((p) => p.number !== 15))));
  assert.deepEqual(withoutNoItem, all, "#15 names no item");
  // ITM-005's pull request is merged into "elsewhere": not done. Into the sprint's branch, the same pull request makes it done.
  const intoSprint = FIXTURE_PRS.map((p) => (p.number === 13 ? { ...p, base: { ref: "sprint/07" } } : p));
  assert.deepEqual(counts(slot(await open(await fixtureProduct(), intoSprint))),
    { ...all, done: all.done + 1, "not-started": all["not-started"] - 1, "percent-done": 40 });
  // An open pull request into another base is no work in progress either.
  const elsewhere = FIXTURE_PRS.map((p) => (p.number === 11 ? { ...p, base: { ref: "elsewhere" } } : p));
  assert.deepEqual(counts(slot(await open(await fixtureProduct(), elsewhere))),
    { ...all, "in-progress": all["in-progress"] - 1, "not-started": all["not-started"] + 1 });
});

test("a model of measure remaining items per time box shows the running sprint's remaining selected items against its selection, instead", async () => {
  const repo = await fixtureProduct({
    "docs/process-models/fixture.md": TIMEBOXED,
    // A time box: the end is recorded when the sprint starts. sprint-06's has passed; sprint-07's has not.
    "docs/backlog/sprints/sprint-07.md": sprintText({ name: "sprint-07", start: "2026-10-01", end: "2099-12-31",
      selection: ["ITM-001", "ITM-002", "ITM-003", "ITM-004", "ITM-005", "ITM-006"], branch: "sprint/07" }),
  });
  const bar = slot(await open(repo));
  assert.match(bar, /data-measure="remaining items per time box"/);
  assert.match(bar, /remaining items per time box/);
  assert.match(bar, /sprint-07/);
  // Of the six selected, ITM-002 is done: five remain. ITM-007 (sprint-06) and ITM-008 (default branch) are not selected.
  const c = counts(bar);
  assert.equal(c.selected, 6);
  assert.equal(c.remaining, 5);
  assert.equal(c.total, undefined, "not the backlog's items per state");
  assert.match(bar, /data-bar/);
  assert.match(bar, /href="#backlog"/);
  // Counter-proof: with ITM-005 merged into the sprint's branch, four remain.
  const intoSprint = FIXTURE_PRS.map((p) => (p.number === 13 ? { ...p, base: { ref: "sprint/07" } } : p));
  assert.equal(counts(slot(await open(repo, intoSprint))).remaining, 4);
});

test("a planned model shows the sentence that the plan is shown on Progress once it exists — and no bar", async () => {
  const page = await open(await fixtureProduct({ "docs/process-models/fixture.md": PLANNED }));
  const bar = slot(page);
  assert.match(bar, /data-measure="plan entries per phase"/);
  assert.match(bar, /plan entries per phase/);
  assert.match(bar, /Progress/);
  assert.doesNotMatch(bar, /data-bar/);
  assert.deepEqual(counts(bar), {});
});

// ---------------------------------------------------------------- where it stands

test("the bar stands on the address without a fragment and on #uc, and on no other route — the slot is emptied there", async () => {
  const server = await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(FIXTURE_PRS)] });
  const page = await openDashboard({ server });
  const bar = slot(page);
  assert.match(bar, /data-progress-bar/);
  for (const hash of ["#backlog", "#spec", "#settings", "#uc/UC-001", "#how", "#nothing"]) {
    await page.go(hash);
    assert.equal(slot(page), "", `${hash}: the slot is empty`);
  }
  await page.go("#uc");
  assert.equal(slot(page), bar, "back on the main page");
  // A load on another route never fills it.
  const backlog = await openDashboard({ server, hash: "#backlog" });
  assert.equal(slot(backlog), "");
});

test("the slot is in docs/index.html, outside <main>, above the view and below the token line", () => {
  const html = read("docs/index.html");
  const at = html.indexOf('id="progress-bar"'), main = html.indexOf("<main"), banner = html.indexOf('id="token-banner"');
  assert.ok(at > 0, "the slot is there");
  assert.ok(banner < at && at < main, "after the token line, before <main>");
  assert.ok(html.indexOf("</main>") > main && !(at > main && at < html.indexOf("</main>")), "not inside <main>");
});

test("a product without docs/process.md gets an empty slot and no request for it; a model file not in the tree, an empty slot", async () => {
  const without = await fixtureProduct({ "docs/process.md": null });
  const server = await repoServer({ files: without, handlers: [pullsApi(FIXTURE_PRS)] });
  const page = await openDashboard({ server });
  assert.equal(slot(page), "");
  assert.deepEqual(pulls(page.requests), [], "no pull request is read");
  assert.deepEqual(files(page.requests), [UC1], "only what the view reads");
  // Counter-proof: with the declaration, the bar's reads are made.
  const withIt = await open(await fixtureProduct());
  assert.equal(pulls(withIt.requests).length, 1);
  // The declaration names a model file the tree does not hold: empty, and no pull request read.
  const noModel = await open(await fixtureProduct({ "docs/process-models/fixture.md": null }));
  assert.equal(slot(noModel), "");
  assert.deepEqual(pulls(noModel.requests), []);
});

// ---------------------------------------------------------------- what a load costs

test("request economy: a cold load reads, beyond the view, the declaration, the model, the order and the sprint records and one page of pull requests; a warm load only the page of pull requests — 140 items, no item file read", async (t) => {
  const all = Array.from({ length: 140 }, (_, i) => i + 1);
  const repo = await fixtureProduct({ "docs/backlog/order.md": orderText(all) });
  for (let n = 1; n <= 10; n++) delete repo[itemPath(n)];
  for (const n of all) repo[itemPath(n)] = itemText(n);
  const prs = [pr({ number: 1, item: "ITM-001" }), pr({ number: 2, item: "ITM-002", open: false, merged: "2026-10-01T12:00:00Z" })];
  const caches = fakeCaches();
  const server = await repoServer({ files: repo, handlers: [pullsApi(prs)] });
  const cold = await openDashboard({ server, hash: "", caches });
  assert.deepEqual(counts(slot(cold)), { total: 140, done: 1, "in-progress": 1, blocked: 0, "not-started": 138, "percent-done": 1 });
  // What the main page reads without the bar: the same product without a declaration.
  const plain = { ...repo };
  delete plain["docs/process.md"];
  const view = await openDashboard({ server: await repoServer({ files: plain, handlers: [pullsApi(prs)] }), hash: "" });
  assert.deepEqual(files(view.requests), [UC1], "the view reads its use case");
  assert.deepEqual(files(cold.requests), [UC1, "docs/backlog/order.md", "docs/backlog/sprints/sprint-06.md",
    "docs/backlog/sprints/sprint-07.md", "docs/process-models/fixture.md", "docs/process.md"].sort(), "no item file, no other use case, no record");
  assert.deepEqual(cold.requests.filter((r) => !r.startsWith("file ")).map((r) => (r.startsWith("handler") ? "pulls" : r)), ["commit", "tree", "pulls"]);
  const p = params(pulls(cold.requests)[0]);
  assert.equal(p.get("base"), null, "one list without a base");
  assert.equal(p.get("state"), "all");
  const warm = await openDashboard({ server, hash: "", caches });
  assert.deepEqual(warm.requests.map((r) => (r.startsWith("handler") ? "pulls" : r)), ["commit", "tree", "pulls"]);
  assert.equal(slot(warm), slot(cold));
  t.diagnostic(`main page, 140 items: cold ${cold.requests.length} requests (${files(cold.requests).length} files — ` +
    `${files(cold.requests).length - files(view.requests).length} of them the bar's —, commit, tree, ${pulls(cold.requests).length} page of ` +
    `pull requests); warm ${warm.requests.length} (commit, tree, pull requests); the view alone, cold: ${view.requests.length}`);
  // The Backlog tab's own requests are not changed by the bar: a cold load of #backlog reads what it read before.
  const backlog = await openDashboard({ server: await repoServer({ files: repo, handlers: [pullsApi(prs)] }), hash: "#backlog" });
  assert.equal(pulls(backlog.requests).length, 1);
  assert.equal(params(pulls(backlog.requests)[0]).get("base"), "sprint/07");
});

// ---------------------------------------------------------------- derived, not stored; nothing written; explained

async function withPlanted(entries, f) {
  const define = Object.defineProperty;
  Object.defineProperty = function (o, k, d) {
    if (o === globalThis && k === "localStorage" && d && d.value) for (const [a, b] of Object.entries(entries)) d.value.setItem(a, b);
    return define.call(Object, o, k, d);
  };
  try { return await f(); } finally { Object.defineProperty = define; }
}
const PLANTED = Object.fromEntries(["agent-m.progress", "agent-m.progress-bar", "agent-m.item-states", "agent-m.backlog"]
  .map((k) => [k, JSON.stringify({ total: 99, done: 99, "in-progress": 0, percent: 100, "ITM-003": "done" })]));

test("PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting local storage and the cached texts and reloading shows the same bar; counts planted into local storage change nothing", async () => {
  const repo = await fixtureProduct(), caches = fakeCaches();
  const server = async () => repoServer({ files: repo, handlers: [pullsApi(FIXTURE_PRS)] });
  const first = await openDashboard({ server: await server(), caches });
  await openDashboard({ server: await server(), caches }); // the texts are kept now
  const cleared = await openDashboard({ server: await server(), caches: fakeCaches(), token: null });
  assert.equal(slot(cleared), slot(first));
  const planted = await withPlanted(PLANTED, async () => openDashboard({ server: await server(), caches }));
  assert.equal(slot(planted), slot(first));
  assert.equal(counts(slot(planted)).done, 3);
});

test("nothing is written: every request the bar makes is a GET", async () => {
  const server = await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(FIXTURE_PRS)] });
  const page = await openDashboard({ server });
  assert.match(slot(page), /data-progress-bar/);
  const sent = server.requests.filter((r) => !r.startsWith("file ") && !["commit", "tree"].includes(r));
  assert.deepEqual(sent.map((r) => r.replace(/\?.*$/, "")), [`handler GET https://api.github.com/repos/${REPO}/pulls`]);
  assert.deepEqual(server.writes, []);
});

test("the bar carries a folded What is this? — what is counted, what not started hides, and that the numbers are computed now and never kept", async () => {
  for (const model of [MODEL, TIMEBOXED, PLANNED]) {
    const over = { "docs/process-models/fixture.md": model };
    if (model === TIMEBOXED) over["docs/backlog/sprints/sprint-07.md"] = sprintText({ name: "sprint-07", start: "2026-10-01", end: "2099-12-31", selection: ["ITM-001"], branch: "sprint/07" });
    const bar = slot(await open(await fixtureProduct(over)));
    const fold = /<details class="explain"><summary>What is this\?<\/summary><div>([\s\S]*?)<\/div><\/details>/.exec(bar);
    assert.ok(fold, "a folded explanation");
    if (model === PLANNED) continue;
    assert.match(fold[1], /pull request/i, "what is counted");
    assert.match(fold[1], /ready/i);
    assert.match(fold[1], /waiting for acceptance/i, "what not started hides");
    assert.match(fold[1], /computed|derived/i);
    assert.match(fold[1], /never (kept|stored)|not (kept|stored)/i);
  }
});

// ---------------------------------------------------------------- Agent M's own backlog, frozen

// Agent M's own backlog and sprint records as they stood while sprint 02 ran — the frozen copy tests/fixtures/sprint-02-running/,
// served at the live paths —, the declaration and the model from this checkout, and a recorded list of the pull requests of that
// moment: the fifteen merged into sprint/01 (#24 to #38, as GitHub recorded them), those into sprint/02 as the Backlog tab's test
// records them (#40 to #56 merged, #57 and #58 open), and #39, sprint/01 into main, which names no item.
const FROZEN = new URL("fixtures/sprint-02-running/", import.meta.url);
function agentM() {
  const f = {};
  const walk = (dir, base) => {
    for (const e of readdirSync(new URL(dir, base), { withFileTypes: true })) {
      const p = `${dir}${e.name}`;
      if (e.isDirectory()) walk(`${p}/`, base); else if (p.endsWith(".md")) f[p] = readFileSync(new URL(p, base), "utf8");
    }
  };
  walk("docs/backlog/", FROZEN);
  f["docs/process.md"] = read("docs/process.md");
  f["docs/process-models/scrum-wip.md"] = read("docs/process-models/scrum-wip.md");
  f["SPEC.md"] = SPEC;
  return f;
}
const SPRINT_01 = [[24, "ITM-001", "2026-10-01T14:05:35Z", "2026-10-01T14:29:45Z"], [25, "ITM-002", "2026-10-01T14:38:07Z", "2026-10-01T14:42:53Z"],
  [26, "ITM-003", "2026-10-01T15:16:47Z", "2026-10-01T15:21:39Z"], [27, "ITM-004", "2026-10-01T15:43:49Z", "2026-10-01T15:48:47Z"],
  [28, "ITM-009", "2026-10-01T15:55:12Z", "2026-10-01T16:07:46Z"], [29, "ITM-005", "2026-10-01T15:55:26Z", "2026-10-01T16:05:01Z"],
  [30, "ITM-010", "2026-10-01T15:58:08Z", "2026-10-01T16:11:59Z"], [31, "ITM-006", "2026-10-01T16:09:21Z", "2026-10-01T16:19:59Z"],
  [32, "ITM-011", "2026-10-01T16:18:04Z", "2026-10-01T16:30:21Z"], [33, "ITM-012", "2026-10-01T16:20:43Z", "2026-10-01T16:37:18Z"],
  [34, "ITM-007", "2026-10-01T16:22:39Z", "2026-10-01T16:33:06Z"], [35, "ITM-013", "2026-10-01T16:48:52Z", "2026-10-01T17:07:29Z"],
  [36, "ITM-124", "2026-10-01T17:01:10Z", "2026-10-01T17:06:05Z"], [37, "ITM-008", "2026-10-01T17:16:16Z", "2026-10-01T17:28:00Z"],
  [38, "ITM-123", "2026-10-01T18:10:27Z", "2026-10-01T18:15:47Z"]];
const SPRINT_02 = [[40, "ITM-126", "2026-10-01T19:50:03Z"], [41, "ITM-125", "2026-10-01T19:46:06Z"], [42, "ITM-027", "2026-10-01T20:00:35Z"],
  [43, "ITM-127", "2026-10-01T20:01:30Z"], [44, "ITM-131", "2026-10-01T20:09:02Z"], [45, "ITM-033", "2026-10-01T20:47:04Z"],
  [46, "ITM-128", "2026-10-01T20:19:23Z"], [47, "ITM-129", "2026-10-01T20:24:16Z"], [48, "ITM-141", "2026-10-01T20:27:50Z"],
  [49, "ITM-146", "2026-10-01T20:37:18Z"], [50, "ITM-132", "2026-10-01T20:50:04Z"], [51, "ITM-130", "2026-10-01T20:56:02Z"],
  [52, "ITM-014", "2026-10-01T21:04:13Z"], [53, "ITM-034", "2026-10-01T21:21:51Z"], [54, "ITM-133", "2026-10-01T21:17:22Z"],
  [55, "ITM-016", "2026-10-01T21:29:59Z"], [56, "ITM-050", "2026-10-01T21:23:11Z"]];
const AGENT_M_PRS = [
  ...SPRINT_01.map(([number, item, created, merged]) => pr({ number, item, base: "sprint/01", open: false, created, merged })),
  ...SPRINT_02.map(([number, item, merged]) => pr({ number, item, base: "sprint/02", open: false, merged,
    created: merged.replace(/T(\d\d)/, (_, hh) => `T${String(hh - 1).padStart(2, "0")}`) })),
  pr({ number: 57, item: "ITM-136", base: "sprint/02", created: "2026-10-01T21:28:53Z" }),
  pr({ number: 58, item: "ITM-147", base: "sprint/02", created: "2026-10-01T22:00:00Z" }),
  pr({ number: 39, title: "Sprint 01 into main — decided by po-fable (gate record inside)", head: "sprint/01", base: "main", open: false,
    created: "2026-10-01T18:44:33Z", merged: "2026-10-01T19:04:51Z" }),
];

test("Agent M's own backlog while sprint 02 ran: five file reads cold, none warm, one pull-request request per load — and what the bar shows", async (t) => {
  const repo = agentM();
  const items = Object.keys(repo).filter((p) => /^docs\/backlog\/ITM-\d{3}-/.test(p)).length;
  const caches = fakeCaches();
  const server = await repoServer({ files: repo, handlers: [pullsApi(AGENT_M_PRS)] });
  const cold = await openDashboard({ server, caches });
  const bar = slot(cold);
  assert.deepEqual(files(cold.requests), ["docs/backlog/order.md", "docs/backlog/sprints/sprint-01.md", "docs/backlog/sprints/sprint-02.md",
    "docs/process-models/scrum-wip.md", "docs/process.md"]);
  assert.equal(pulls(cold.requests).length, 1);
  const c = counts(bar);
  assert.equal(c.total, items, "every item of the tree");
  assert.equal(c.done, SPRINT_01.length + SPRINT_02.length);
  assert.equal(c["in-progress"], 2);
  assert.equal(c.blocked, 0);
  assert.equal(c["not-started"], items - c.done - 2);
  assert.equal(c["percent-done"], Math.round((100 * c.done) / items));
  assert.match(bar, /items per state over time/);
  const warm = await openDashboard({ server, caches });
  assert.deepEqual(files(warm.requests), []);
  assert.equal(pulls(warm.requests).length, 1);
  assert.equal(slot(warm), bar);
  t.diagnostic(`Agent M while sprint 02 ran: ${c.total} items — done ${c.done}, in progress ${c["in-progress"]}, blocked ${c.blocked}, ` +
    `not started ${c["not-started"]}, ${c["percent-done"]} % done; cold ${cold.requests.length} requests (${files(cold.requests).length} files, ` +
    `${pulls(cold.requests).length} page of pull requests), warm ${warm.requests.length}`);
});
