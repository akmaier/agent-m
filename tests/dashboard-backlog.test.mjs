// The Backlog tab — the running sprint's board under the model's work-in-progress limit, the backlog in its order with each
// item's derived state, and the accepted names no item realises yet (UC-032 step 1, the board of step 7, read; ITM-147).
// Run: node --test tests/
//
// Module: MOD-dashboard-app
// Guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; EVERY STEP EXPLAINS ITSELF; UC-032
// Level: component
//
// The real dashboard (docs/assets/dashboard-app.mjs) and its view docs/assets/dashboard/backlog-view.mjs run in
// tests/app-harness.mjs against a GitHub API mock that counts every request; the pull requests come from a fake of GitHub's
// pulls API that this file brings (a request handler), answering the base branch, the state and the pages as GitHub does.
// Every file is read by node itself with its own fs. The counter-proofs are recorded in
// docs/measurements/2026-10-01_backlog-tab.md.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { gitBlobSha, recordText, useCaseRecord, approvalPath } from "../docs/assets/review-core.mjs";
import { repoServer, fakeCaches, openDashboard, REPO } from "./app-harness.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), "utf8");

// ---------------------------------------------------------------- a fake of GitHub's pulls API

// pr(...) -> a pull request as GitHub's REST API answers it. merged: when it was merged (its state is then "closed").
function pr({ number, item = null, title = null, head = null, base = "sprint/02", open = true, created = "2026-10-01T10:00:00Z",
  merged = null, by = "developer-b · fixture-model · started from sprint/02" }) {
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

const MODEL = read("tests/fixtures/flow/scrum-wip.md"); // pulled, WIP limit 2, sprints, no time box
const DECL = "---\nmodel: fixture-scrum-wip\nmodel_file: docs/process-models/fixture.md\nsprint_close: closer-agent\n---\n" +
  "# How the fixture product is developed\n";
const SPEC = "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nThe first rule.\n*Check:* no automatic check; at review.\n\n" +
  "**RULE TWO** *(PO, 2026-09-01)*\nThe second rule.\n*Check:* no automatic check; at review.\n\n" +
  "**RULE THREE** *(PO, 2026-09-01)*\nThe third rule, which no item realises.\n*Check:* no automatic check; at review.\n\n" +
  "**RULE GONE** *(PO, 2026-09-01 — withdrawn 2026-09-02)*\n*Withdrawn:* replaced by nothing.\n";
const UC1 = "docs/use-cases/UC-001-plan-the-work.md", UC2 = "docs/use-cases/UC-002-watch-the-work.md";
const UC3 = "docs/use-cases/UC-003-change-the-work.md";
const useCase = (id, title) => `---\nid: ${id}\ntitle: ${title}\narea: 5 implementation\nrealises:\n  - RULE ONE\n---\n# ${id} ${title}\n`;

const id = (n) => `ITM-${String(n).padStart(3, "0")}`;
const itemPath = (n) => `docs/backlog/${id(n)}-item-${n}.md`;
function itemText(n, { title = `The work of item ${n}`, realises = ["RULE ONE"], dependsOn = [], kind = "implementation", level = 1,
  origin = "backlog refinement 2026-09-15" } = {}) {
  return `---\nid: ${id(n)}\ntitle: ${title}\nkind: ${kind}\nlevel: ${level}\nrealises:\n${realises.map((r) => `  - ${r}`).join("\n")}\n` +
    `modules:\n  - MOD-fixture\ndepends_on:${dependsOn.length ? `\n${dependsOn.map((d) => `  - ${d}`).join("\n")}` : " []"}\n` +
    `origin: ${origin}\n---\n# ${id(n)} ${title}\n\n**REGISTER**\n\n## Outcome\n\nWhat item ${n} delivers.\n`;
}
const sprintText = ({ name = "sprint-07", start = "2026-10-01", end = "", selection, branch = "sprint/02" }) =>
  `---\nid: ${name}\ngoal: The fixture's goal for ${name}\nstart: ${start}\nend: ${end}\nselection:\n` +
  `${selection.map((s) => `  - ${s}`).join("\n")}\ncloser: closer-agent\nbranch: ${branch}\nmodel: fixture-scrum-wip\n` +
  `planned_by: owner-agent\n---\n# ${name}\n\n**REGISTER**\n`;
const orderText = (ns) => `# Backlog order\n\n**REGISTER**\n\n## Order\n\n${ns.map((n, i) => `${i + 1}. ${id(n)}`).join("\n")}\n`;

// The product of the behaviour tests: six selected items and two more, under a WIP limit of 2.
//   ITM-001 an open pull request — in progress, with who opened it;   ITM-002 a merged one — done, with when;
//   ITM-003 realises a name the SPEC does not hold — waiting for acceptance;   ITM-004 depends on ITM-003 — ready;
//   ITM-005 its pull request merged into another base than the sprint branch — not done for the sprint;
//   ITM-006 an open pull request — in progress: two of two slots taken;   ITM-007, ITM-008 in the backlog, not selected.
async function fixtureProduct(over = {}) {
  const f = {
    "SPEC.md": SPEC, "docs/process.md": DECL, "docs/process-models/fixture.md": MODEL,
    [UC1]: useCase("UC-001", "Plan the work"), [UC2]: useCase("UC-002", "Watch the work"), [UC3]: useCase("UC-003", "Change the work"),
    "docs/backlog/order.md": orderText([1, 2, 3, 4, 5, 6, 7, 8]),
    "docs/backlog/sprints/sprint-06.md": sprintText({ name: "sprint-06", start: "2026-09-01", end: "2026-09-20", selection: ["ITM-007"],
      branch: "sprint/01" }),
    "docs/backlog/sprints/sprint-07.md": sprintText({ selection: ["ITM-001", "ITM-002", "ITM-003", "ITM-004", "ITM-005", "ITM-006"] }),
    [itemPath(1)]: itemText(1, { realises: ["RULE ONE", "UC-001"] }),
    [itemPath(2)]: itemText(2, { realises: ["RULE TWO"] }),
    [itemPath(3)]: itemText(3, { realises: ["RULE NOT ACCEPTED"] }),
    [itemPath(4)]: itemText(4, { dependsOn: ["ITM-003"] }),
    [itemPath(5)]: itemText(5),
    [itemPath(6)]: itemText(6, { realises: ["UC-002"] }),
    [itemPath(7)]: itemText(7, { title: "An item of the earlier sprint", realises: ["RULE ONE"], origin: "https://github.com/akmaier/agent-m/issues/7" }),
    [itemPath(8)]: itemText(8, { title: "An item for later", realises: ["UC-003"] }),
  };
  // UC-001 and UC-002 accepted; UC-003 open.
  for (const p of [UC1, UC2]) f[approvalPath(p.match(/UC-\d{3}/)[0], await gitBlobSha(f[p]))] = recordText(useCaseRecord(p, await gitBlobSha(f[p])));
  return { ...f, ...over };
}
const FIXTURE_PRS = [
  pr({ number: 11, item: "ITM-001", by: "developer-a · model-a · started from sprint/02 at 1234567" }),
  pr({ number: 12, item: "ITM-002", open: false, merged: "2026-10-01T12:34:56Z" }),
  pr({ number: 13, item: "ITM-005", base: "elsewhere", open: false, merged: "2026-10-01T13:00:00Z" }),
  pr({ number: 14, item: "ITM-006" }),
  pr({ number: 15, title: "Fix a typo in the README", head: "fix/typo" }), // names no item
  pr({ number: 9, item: "ITM-007", base: "sprint/01", open: false, created: "2026-09-02T10:00:00Z", merged: "2026-09-03T10:00:00Z" }),
];

const files = (requests) => requests.filter((r) => r.startsWith("file ")).map((r) => r.slice(5)).sort();
const pulls = (requests) => requests.filter((r) => /^handler GET https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/pulls\?/.test(r));
const params = (r) => new URL(r.replace(/^handler GET /, "")).searchParams;

// The board's column of each item, as the page shows it: a card carries data-item and sits in a column carrying data-column.
function columns(html) {
  const out = {};
  const board = html.slice(html.indexOf('data-board'), html.indexOf("data-board-end"));
  for (const col of board.split(/(?=<div class="column" data-column=")/).slice(1)) {
    const name = /data-column="([^"]+)"/.exec(col)[1];
    out[name] = [...col.matchAll(/data-item="(ITM-\d{3})"/g)].map((m) => m[1]);
  }
  return out;
}
const card = (html, item) => {
  const at = html.indexOf(`data-item="${item}"`);
  return at < 0 ? "" : html.slice(at, html.indexOf("</li>", at));
};

// ---------------------------------------------------------------- the board

test("the running sprint's board: in progress with the open pull request and who opened it, done with the merged one and when, waiting for acceptance, ready", async () => {
  const server = await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(FIXTURE_PRS)] });
  const page = await openDashboard({ server, hash: "#backlog" });
  const html = page.main();
  assert.match(html, /<h2>Backlog<\/h2>/);
  // The running sprint — the record without an end — with its goal, branch, closer and who planned it.
  assert.match(html, /sprint-07/);
  assert.match(html, /The fixture&#39;s goal for sprint-07|The fixture's goal for sprint-07/);
  assert.match(html, /sprint\/02/);
  assert.match(html, /closer-agent/);
  assert.match(html, /owner-agent/);
  assert.doesNotMatch(html, /The fixture's goal for sprint-06/, "a closed sprint is not the running one");
  const board = columns(html);
  assert.deepEqual(board["in progress"], ["ITM-001", "ITM-006"], "in the order of the selection");
  assert.deepEqual(board.done, ["ITM-002"]);
  assert.deepEqual(board["waiting for acceptance"], ["ITM-003"]);
  assert.deepEqual(board.ready, ["ITM-004", "ITM-005"]);
  assert.deepEqual(board.blocked, []);
  // In progress: the open pull request, and who opened it — the first line of its body (UC-024).
  assert.match(card(html, "ITM-001"), /#11/);
  assert.match(card(html, "ITM-001"), /developer-a · model-a/);
  // Done: the merged pull request, and when.
  assert.match(card(html, "ITM-002"), /#12/);
  assert.match(card(html, "ITM-002"), /2026-10-01 12:34/);
  // Waiting for acceptance: the name that is not accepted.
  assert.match(card(html, "ITM-003"), /RULE NOT ACCEPTED/);
  // A dependency that is not done keeps an item ready, not in progress; the page names what it waits for.
  assert.match(card(html, "ITM-004"), /ITM-003/);
  // The limit, and how many slots are taken.
  assert.match(html, /2 of 2/);
  assert.match(html, /data-wip-limit="2"/);
  assert.match(html, /data-wip-taken="2"/);
  // A ready item cannot start while the limit is reached; the page says so.
  assert.match(card(html, "ITM-004"), /limit/i);
});

test("counter-proofs: a pull request naming no item changes no state; one merged into another base than the sprint branch is not done for the sprint", async () => {
  const withNoItem = await openDashboard({ server: await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(FIXTURE_PRS)] }),
    hash: "#backlog" });
  const without = await openDashboard({ server: await repoServer({ files: await fixtureProduct(),
    handlers: [pullsApi(FIXTURE_PRS.filter((p) => p.number !== 15))] }), hash: "#backlog" });
  assert.deepEqual(columns(withNoItem.main()), columns(without.main()), "the pull request #15 names no item");
  assert.doesNotMatch(withNoItem.main(), /#15/);
  // ITM-005's pull request is merged — into "elsewhere": the sprint's pull requests are those into its branch.
  assert.ok(!columns(withNoItem.main()).done.includes("ITM-005"));
  assert.deepEqual(pulls(withNoItem.requests).map((r) => params(r).get("base")), ["sprint/02"]);
  // The same pull request merged into the sprint branch makes it done.
  const intoSprint = FIXTURE_PRS.map((p) => (p.number === 13 ? { ...p, base: { ref: "sprint/02" } } : p));
  const done = await openDashboard({ server: await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(intoSprint)] }),
    hash: "#backlog" });
  assert.ok(columns(done.main()).done.includes("ITM-005"));
});

test("below the limit no ready item is held by it; a closed pull request that was not merged is no work in progress", async () => {
  const prs = FIXTURE_PRS.map((p) => (p.number === 14 ? { ...p, state: "closed" } : p));
  const page = await openDashboard({ server: await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(prs)] }), hash: "#backlog" });
  const html = page.main();
  assert.deepEqual(columns(html)["in progress"], ["ITM-001"]);
  assert.ok(columns(html).ready.includes("ITM-006"));
  assert.match(html, /1 of 2/);
  assert.doesNotMatch(card(html, "ITM-004"), /limit/i);
});

test("with no running sprint, the last sprint's board is shown and the page says so", async () => {
  const repo = await fixtureProduct({ "docs/backlog/sprints/sprint-07.md": sprintText({ end: "2026-10-01",
    selection: ["ITM-001", "ITM-002", "ITM-003", "ITM-004", "ITM-005", "ITM-006"] }) });
  const page = await openDashboard({ server: await repoServer({ files: repo, handlers: [pullsApi(FIXTURE_PRS)] }), hash: "#backlog" });
  assert.match(page.main(), /data-no-running-sprint/);
  assert.match(page.main(), /sprint-07/);
  assert.deepEqual(columns(page.main()).done, ["ITM-002"]);
});

// ---------------------------------------------------------------- the backlog and the uncovered names, folded

test("the backlog is folded: its unselected items are read only when the reader unfolds it — then in its order, each with its derived state", async () => {
  const server = await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(FIXTURE_PRS)] });
  const page = await openDashboard({ server, hash: "#backlog" });
  assert.ok(!files(page.requests).includes(itemPath(7)) && !files(page.requests).includes(itemPath(8)), "no unselected item before the fold");
  assert.doesNotMatch(page.main(), /An item for later/);
  assert.match(page.main(), /data-unfold="backlog"/);
  const unfolded = await page.click('[data-unfold="backlog"]');
  assert.deepEqual(files(unfolded), [itemPath(7), itemPath(8)], "the unselected items, and nothing read before again");
  const html = page.main();
  // In the order of docs/backlog/order.md, each with identifier, title, kind, level, what it realises and where it came from.
  const rows = [...html.matchAll(/<tr data-backlog-item="(ITM-\d{3})"/g)].map((m) => m[1]);
  assert.deepEqual(rows, ["ITM-001", "ITM-002", "ITM-003", "ITM-004", "ITM-005", "ITM-006", "ITM-007", "ITM-008"]);
  const row = (i) => { const at = html.indexOf(`data-backlog-item="${i}"`); return html.slice(at, html.indexOf("</tr>", at)); };
  assert.match(row("ITM-008"), /An item for later/);
  assert.match(row("ITM-008"), /implementation/);
  assert.match(row("ITM-008"), /UC-003/);
  assert.match(row("ITM-008"), /backlog refinement 2026-09-15/);
  // States: UC-003 is not accepted; ITM-007 was merged into the branch of its own sprint.
  assert.match(row("ITM-008"), /waiting for acceptance/);
  assert.match(row("ITM-007"), /done/);
  assert.match(row("ITM-001"), /in progress/);
  assert.match(row("ITM-002"), /done/);
  // Unfolding read the pull requests of every sprint's branch and of the default branch — once each.
  assert.deepEqual(pulls(unfolded).map((r) => params(r).get("base")).sort(), ["main", "sprint/01"]);
});

test("the accepted requirements and use cases that no item realises yet — withdrawn and open names are not among them", async () => {
  const page = await openDashboard({ server: await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(FIXTURE_PRS)] }),
    hash: "#backlog" });
  assert.match(page.main(), /data-uncovered/);
  await page.click('[data-unfold="backlog"]');
  const html = page.main();
  const box = html.slice(html.indexOf("data-uncovered"), html.indexOf("data-uncovered-end"));
  assert.match(box, /RULE THREE/);
  assert.doesNotMatch(box, /RULE ONE|RULE TWO/, "realised by items");
  assert.doesNotMatch(box, /RULE GONE/, "withdrawn");
  assert.doesNotMatch(box, /UC-001|UC-002/, "realised by items");
  assert.doesNotMatch(box, /UC-003/, "open — not accepted — and realised by ITM-008");
  assert.ok(html.indexOf("data-uncovered") < html.indexOf("data-board"), "above the sprint and the backlog");
});

// ---------------------------------------------------------------- nothing written, every step explained

test("nothing is written: every request of the tab and of its fold is a GET", async () => {
  const server = await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(FIXTURE_PRS)] });
  const page = await openDashboard({ server, hash: "#backlog" });
  await page.click('[data-unfold="backlog"]');
  const sent = server.requests.filter((r) => !r.startsWith("file ") && !["commit", "tree"].includes(r));
  assert.ok(sent.length > 0);
  assert.deepEqual(sent.filter((r) => !r.startsWith("handler GET ")), [], "only GETs");
  assert.deepEqual(server.writes, []);
  // Counter-proof of the recorder: a write would be seen.
  await server.fetch(`https://api.github.com/repos/${REPO}/pulls`, { method: "POST", body: "{}" });
  assert.ok(server.requests.some((r) => r.startsWith("handler POST ")), server.requests.at(-1));
});

test("every part carries a folded What is this? — the uncovered names, the sprint, the limit, the backlog, and each state; no job runs yet", async () => {
  const page = await openDashboard({ server: await repoServer({ files: await fixtureProduct(), handlers: [pullsApi(FIXTURE_PRS)] }),
    hash: "#backlog" });
  const html = page.main();
  const explained = [...html.matchAll(/<details class="explain"><summary>What is this\?<\/summary>/g)].length;
  assert.ok(explained >= 4 + 5, `${explained} explanations`);
  for (const part of ["uncovered", "sprint", "limit", "backlog"]) assert.match(html, new RegExp(`data-part="${part}"`), part);
  for (const state of ["ready", "in progress", "done", "blocked", "waiting for acceptance"]) {
    assert.match(html, new RegExp(`data-explain-state="${state}"`), state);
  }
  assert.match(html, /no job/i, "the explanation says that no job runs yet");
});

// ---------------------------------------------------------------- derived, not stored

// The page as a person sees it after deleting all local storage and the cached file texts, and with a state planted into local
// storage: the harness defines localStorage on the global object, and this wraps that definition for the one load.
async function withPlanted(entries, f) {
  const define = Object.defineProperty;
  Object.defineProperty = function (o, k, d) {
    if (o === globalThis && k === "localStorage" && d && d.value) for (const [a, b] of Object.entries(entries)) d.value.setItem(a, b);
    return define.call(Object, o, k, d);
  };
  try { return await f(); } finally { Object.defineProperty = define; }
}
const PLANTED = Object.fromEntries(["agent-m.item-states", "agent-m.backlog", "agent-m.board", "agent-m.sprint", "agent-m.progress"]
  .map((k) => [k, JSON.stringify({ "ITM-001": "done", "ITM-002": "blocked", "ITM-003": "ready", state: "done", wipTaken: 0 })]));

test("PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting local storage and the cached texts and reloading shows the same board; a planted state changes nothing", async () => {
  const repo = await fixtureProduct(), caches = fakeCaches();
  const server = async () => repoServer({ files: repo, handlers: [pullsApi(FIXTURE_PRS)] });
  const first = await openDashboard({ server: await server(), hash: "#backlog", caches });
  await openDashboard({ server: await server(), hash: "#backlog", caches }); // the texts are kept now
  // Deleted: no token, no stored setting, no cached text — the files come from GitHub's raw host.
  const cleared = await openDashboard({ server: await server(), hash: "#backlog", caches: fakeCaches(), token: null });
  assert.equal(cleared.main(), first.main());
  const planted = await withPlanted(PLANTED, async () => openDashboard({ server: await server(), hash: "#backlog", caches }));
  assert.equal(planted.main(), first.main());
  assert.deepEqual(columns(planted.main())["in progress"], ["ITM-001", "ITM-006"]);
});

// ---------------------------------------------------------------- what a load costs

test("API economy: a load reads the sprint, the order, the selected items and one page of pull requests; a warm load only the commit, the tree and the pull requests", async (t) => {
  // 140 items in the backlog, the first 25 selected.
  const all = Array.from({ length: 140 }, (_, i) => i + 1), selected = all.slice(0, 25).map(id);
  const repo = { "SPEC.md": SPEC, "docs/process.md": DECL, "docs/process-models/fixture.md": MODEL, [UC1]: useCase("UC-001", "Plan the work"),
    "docs/backlog/order.md": orderText(all), "docs/backlog/sprints/sprint-07.md": sprintText({ selection: selected }) };
  for (const n of all) repo[itemPath(n)] = itemText(n);
  repo[approvalPath("UC-001", await gitBlobSha(repo[UC1]))] = recordText(useCaseRecord(UC1, await gitBlobSha(repo[UC1])));
  const prs = [pr({ number: 1, item: "ITM-001" }), pr({ number: 2, item: "ITM-002", open: false, merged: "2026-10-01T12:00:00Z" })];
  const caches = fakeCaches();
  const server = await repoServer({ files: repo, handlers: [pullsApi(prs)] });
  const cold = await openDashboard({ server, hash: "#backlog", caches });
  assert.equal(columns(cold.main()).ready.length + columns(cold.main())["in progress"].length + columns(cold.main()).done.length, 25);
  const want = ["SPEC.md", "docs/backlog/order.md", "docs/backlog/sprints/sprint-07.md", "docs/process-models/fixture.md", "docs/process.md",
    ...all.slice(0, 25).map(itemPath)].sort();
  assert.deepEqual(files(cold.requests), want, "no unselected item, no use case, no record");
  assert.deepEqual(cold.requests.filter((r) => !r.startsWith("file ")).map((r) => (r.startsWith("handler") ? "pulls" : r)), ["commit", "tree", "pulls"]);
  const p = params(pulls(cold.requests)[0]);
  assert.equal(p.get("base"), "sprint/02");
  assert.equal(p.get("state"), "all");
  const warm = await openDashboard({ server, hash: "#backlog", caches });
  assert.deepEqual(warm.requests.map((r) => (r.startsWith("handler") ? "pulls" : r)), ["commit", "tree", "pulls"]);
  assert.equal(warm.main(), cold.main());
  t.diagnostic(`backlog tab, 25 selected of 140 items: cold ${cold.requests.length} requests (${files(cold.requests).length} files, ` +
    `commit, tree, 1 page of pull requests); warm ${warm.requests.length} (commit, tree, pull requests)`);
  // Unfolding reads the rest of the backlog once; the selected items are not read again.
  const unfolded = await warm.click('[data-unfold="backlog"]');
  assert.deepEqual(files(unfolded), all.slice(25).map(itemPath).sort());
  t.diagnostic(`unfolding the backlog, cold: ${unfolded.length} requests (${files(unfolded).length} item files, ${pulls(unfolded).length} pages of pull requests)`);
});

// ---------------------------------------------------------------- Agent M's own sprint

// Agent M's own backlog and sprint records as they stood while sprint 02 ran — the frozen copy
// tests/fixtures/sprint-02-running/docs/backlog/ (from sprint/02 at 87b3268, sprint-02.md's end empty), served at the live paths,
// as the release tests of strand B serve it: the live docs/backlog/ changes at every sprint close and planning (sprint 03's record
// made sprint-02 a closed sprint), the recorded pull requests below do not —; the declaration, the model, the use cases and the
// approval records from this checkout; and a SPEC that holds every requirement name its items realise — no test reads Agent M's
// own SPEC.md (ITM-128). The pull requests are a stub of those into sprint/02, with this item's own open.
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
  for (const d of ["docs/use-cases/", "docs/approvals/"]) walk(d, ROOT);
  f["docs/process.md"] = read("docs/process.md");
  f["docs/process-models/scrum-wip.md"] = read("docs/process-models/scrum-wip.md");
  const names = new Set();
  for (const [p, text] of Object.entries(f)) {
    if (!/^docs\/backlog\/ITM-/.test(p)) continue;
    const m = /\nrealises:\n((?:\s+- .*\n)+)/.exec(text);
    for (const l of m ? m[1].split("\n") : []) { const n = l.replace(/^\s+-\s+/, "").trim(); if (n && !/^UC-\d{3}$/.test(n)) names.add(n); }
  }
  f["SPEC.md"] = `# SPEC of the fixture\n\n## Every name Agent M's items realise\n\n${[...names].sort()
    .map((n) => `**${n}** *(fixture, 2026-10-01)*\nA rule.\n*Check:* no automatic check; at review.\n`).join("\n")}`;
  return f;
}
const MERGED = [[40, "ITM-126", "2026-10-01T19:50:03Z"], [41, "ITM-125", "2026-10-01T19:46:06Z"], [42, "ITM-027", "2026-10-01T20:00:35Z"],
  [43, "ITM-127", "2026-10-01T20:01:30Z"], [44, "ITM-131", "2026-10-01T20:09:02Z"], [45, "ITM-033", "2026-10-01T20:47:04Z"],
  [46, "ITM-128", "2026-10-01T20:19:23Z"], [47, "ITM-129", "2026-10-01T20:24:16Z"], [48, "ITM-141", "2026-10-01T20:27:50Z"],
  [49, "ITM-146", "2026-10-01T20:37:18Z"], [50, "ITM-132", "2026-10-01T20:50:04Z"], [51, "ITM-130", "2026-10-01T20:56:02Z"],
  [52, "ITM-014", "2026-10-01T21:04:13Z"], [53, "ITM-034", "2026-10-01T21:21:51Z"], [54, "ITM-133", "2026-10-01T21:17:22Z"],
  [55, "ITM-016", "2026-10-01T21:29:59Z"], [56, "ITM-050", "2026-10-01T21:23:11Z"]];
const AGENT_M_PRS = [
  ...MERGED.map(([number, item, merged]) => pr({ number, item, open: false, merged, created: merged.replace(/T(\d\d)/, (_, hh) => `T${String(hh - 1).padStart(2, "0")}`),
    by: `developer · claude-opus-5-5 · ${item}` })),
  pr({ number: 57, item: "ITM-136", created: "2026-10-01T21:28:53Z", by: "developer-opus-a · claude-opus-5-5 · started from sprint/02" }),
  pr({ number: 58, item: "ITM-147", created: "2026-10-01T22:00:00Z", by: "developer-opus-b · claude-opus-5-5 · started from sprint/02" }),
  pr({ number: 39, title: "Sprint 01 into main — decided by po-fable (gate record inside)", head: "sprint/01", base: "main", open: false,
    created: "2026-10-01T18:44:33Z", merged: "2026-10-01T19:04:51Z" }),
];

test("Agent M's own sprint 02: its goal, branch, closer and planner, the limit of four, and every selected item once on the board", async (t) => {
  const repo = agentM();
  const sprint = repo["docs/backlog/sprints/sprint-02.md"];
  const selection = /\nselection:\n((?:\s+- .*\n)+)/.exec(sprint)[1].trim().split("\n").map((l) => l.replace(/^\s*-\s*/, ""));
  const caches = fakeCaches();
  const server = await repoServer({ files: repo, handlers: [pullsApi(AGENT_M_PRS)] });
  const page = await openDashboard({ server, hash: "#backlog", caches });
  const html = page.main();
  assert.match(html, /sprint-02/);
  assert.match(html, /Agent M watches itself/);
  assert.match(html, /sprint\/02/);
  assert.match(html, /scrum-master-session/);
  assert.match(html, /po-fable/);
  assert.match(html, /data-wip-limit="4"/);
  const board = columns(html);
  assert.deepEqual(Object.values(board).flat().sort(), [...selection].sort(), "every selected item once");
  assert.deepEqual(board["in progress"], selection.filter((i) => ["ITM-136", "ITM-147"].includes(i)));
  assert.match(card(html, "ITM-147"), /#58/);
  assert.match(card(html, "ITM-147"), /developer-opus-b/);
  for (const [n, item] of MERGED) {
    assert.ok(board.done.includes(item), `${item} is done`);
    assert.match(card(html, item), new RegExp(`#${n}\\b`));
  }
  assert.match(html, /data-wip-taken="2"/);
  t.diagnostic(`Agent M's sprint 02 on the fixture — ${Object.entries(board).map(([k, v]) => `${k}: ${v.length ? v.join(", ") : "none"}`).join("; ")}`);
  t.diagnostic(`Agent M's own sprint 02, cold load: ${page.requests.length} requests (${files(page.requests).length} files, ` +
    `${pulls(page.requests).length} page of pull requests)`);
  const warm = await openDashboard({ server, hash: "#backlog", caches });
  t.diagnostic(`Agent M's own sprint 02, warm load: ${warm.requests.length} requests (${warm.requests.join(", ").replace(/handler GET \S+/g, "pull requests")})`);
  assert.equal(warm.main(), html);
  const unfolded = await warm.click('[data-unfold="backlog"]');
  assert.equal(files(unfolded).length, Object.keys(repo).filter((p) => /^docs\/backlog\/ITM-/.test(p)).length - selection.length);
  t.diagnostic(`Agent M's own backlog unfolded: ${unfolded.length} requests (${files(unfolded).length} item files, ` +
    `${pulls(unfolded).length} pages of pull requests: ${pulls(unfolded).map((r) => params(r).get("base")).join(", ")})`);
});
