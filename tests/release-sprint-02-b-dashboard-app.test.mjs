// Release tests of sprint 02, strand B — the Backlog tab, the first slice of the process dashboard, showing Agent M's own sprint
// (ITM-143, testing ITM-147 on ITM-027, ITM-033 and ITM-034). Written by tester-opus (claude-opus-5-5), the Release tester of
// docs/process.md, who implemented nothing of the strand, from UC-032, UC-035 and the SPEC rules alone; started on sprint/02 at
// 58b7fe4, 2026-10-01.
//
// Module: MOD-dashboard-app
// Guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; EVERY STEP EXPLAINS ITSELF; UC-032; UC-035
// Level: release
//
// The page is the real docs/assets/dashboard-app.mjs in tests/app-harness.mjs, served this very repository: its docs/process.md,
// docs/process-models/scrum-wip.md, docs/use-cases/ and docs/approvals/ — read with fs, there are more files than a command line
// holds —, and its docs/backlog/ with order.md and the sprint files frozen as they were while sprint 02 ran: the copy
// tests/fixtures/sprint-02-running/docs/backlog/, taken from sprint/02 at 87b3268 (sprint-02.md's end empty), served at the
// same paths. The live backlog changes at every close (the close of sprint 02 sets its end), as the recorded pull requests below
// would not; the board this file tests is the one of the running sprint, so its backlog is frozen as the pull requests are. Agent M's own SPEC.md is not read: the page is served a SPEC whose
// requirements are the names this backlog's items realise, plus two names no item realises and one withdrawn one, so that which
// requirements count as accepted is known here without reading it. The pull requests come from a fake of GitHub's list of pull
// requests that replays those of sprint 02 into sprint/02 as recorded once from GitHub on 2026-10-01 (`gh pr list --base
// sprint/02 --state all`, at 21:50 UTC, after the merge of #58): 19 merged, #59 (ITM-018) open; no other branch has any.
// Which use cases are accepted is computed here from the approval records' contents (kind, file, blob) against the blob SHA of
// each use case file. Each expectation is stated before its case runs.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { repoServer, openDashboard, fakeCaches, TOKEN } from "./app-harness.mjs";

const ROOT = new URL("../", import.meta.url);
// docs/backlog/ as it was while sprint 02 ran (sprint/02 at 87b3268), not the live one; every other path from this repository.
const FROZEN = new URL("tests/fixtures/sprint-02-running/", ROOT);
const base = (path) => (path.startsWith("docs/backlog/") ? FROZEN : ROOT);
const read = (path) => readFileSync(new URL(path, base(path)), "utf8");
const list = (dir, re) => readdirSync(new URL(dir, base(dir))).filter((f) => re.test(f)).sort().map((f) => `${dir}${f}`);
const blobSha = (t) => createHash("sha1").update(`blob ${Buffer.byteLength(t)}\0`).update(t).digest("hex");

// ---------------------------------------------------------------- this repository, as the page is served it

const REPO_FILES = [
  "docs/process.md", "docs/process-models/scrum-wip.md", "docs/backlog/order.md",
  // The sprint files of sprint 01 and sprint 02: the recording below is of sprint 02; a later sprint's file is left out, because
  // its pull requests are not recorded and it would be the running sprint.
  ...list("docs/backlog/", /^ITM-\d{3}-.+\.md$/), ...list("docs/backlog/sprints/", /^sprint-0[12]\.md$/),
  ...list("docs/use-cases/", /^UC-\d{3}-.+\.md$/), ...list("docs/approvals/", /\.md$/),
];
const TEXTS = Object.fromEntries(REPO_FILES.map((p) => [p, read(p)]));

// An item file as written: its identifier, title, realises and origin (front matter lines), read here without the code under test.
function itemOf(path) {
  const fm = TEXTS[path].split("\n---")[0];
  const field = (k) => (new RegExp(`^${k}:[ \\t]*(.*)$`, "m").exec(fm) ?? [])[1] ?? "";
  const listOf = (k) => {
    const m = new RegExp(`^${k}:[ \\t]*\\n((?:[ \\t]+- .*\\n?)+)`, "m").exec(fm);
    return m ? m[1].split("\n").map((l) => l.replace(/^\s+-\s+/, "").trim()).filter(Boolean) : [];
  };
  return { id: /ITM-\d{3}/.exec(path)[0], path, title: field("title"), realises: listOf("realises"),
    origin: listOf("origin").length ? listOf("origin") : [field("origin")] };
}
const ITEMS = new Map(REPO_FILES.filter((p) => /^docs\/backlog\/ITM-/.test(p)).map((p) => [itemOf(p).id, itemOf(p)]));
const isRequirementName = (s) => /[A-Z]/.test(s) && !/[a-z]/.test(s) && !/^(UC|ARC|MOD|SRC|TST|ITM|RES|JOB)-/.test(s);

// The SPEC the page is served: every requirement name an item realises, two that no item realises, one withdrawn.
const UNREALISED = ["A RULE NO ITEM REALISES", "ANOTHER RULE NO ITEM REALISES"];
const WITHDRAWN = "A WITHDRAWN RULE NO ITEM REALISES";
const REQUIREMENTS = [...new Set([...ITEMS.values()].flatMap((i) => i.realises).filter(isRequirementName))].sort();
const SPEC = `# Fixture — Specification\n\n**VERBINDLICH (SPEC)**\n\n## 1. Rules\n\n${[...REQUIREMENTS, ...UNREALISED].map((n) =>
  `**${n}** *(fixture, 2026-10-01)*\nThe rule ${n.toLowerCase()} holds.\n*Occasion:* a fixture.\n*Check:* no automatic check; at review.\n`).join("\n")}
**${WITHDRAWN}** *(fixture, 2026-10-01 — withdrawn 2026-10-01)*\n*Withdrawn:* a fixture.\n`;

// Accepted use cases: an approval record of kind use-case names the file and the blob SHA of its current text.
const ACCEPTED_UC = new Set();
for (const p of REPO_FILES.filter((x) => x.startsWith("docs/approvals/"))) {
  const kind = /^kind:\s*(.+)$/m.exec(TEXTS[p])?.[1], file = /^file:\s*(.+)$/m.exec(TEXTS[p])?.[1], blob = /^blob:\s*(.+)$/m.exec(TEXTS[p])?.[1];
  if (kind === "use-case" && TEXTS[file] !== undefined && blobSha(TEXTS[file]) === blob) ACCEPTED_UC.add(/UC-\d{3}/.exec(file)[0]);
}
const FILES = { ...TEXTS, "SPEC.md": SPEC };

// The order of the backlog as order.md writes it, the items it does not name appended in the order of their identifiers.
const LISTED = [...TEXTS["docs/backlog/order.md"].matchAll(/^\s*\d+\.\s+(ITM-\d{3})\b/gm)].map((m) => m[1]);
const ORDER = [...LISTED, ...[...ITEMS.keys()].filter((id) => !LISTED.includes(id)).sort()];
const SELECTION = [...TEXTS["docs/backlog/sprints/sprint-02.md"].split("\n---")[0].matchAll(/^ {2}- (ITM-\d{3})$/gm)].map((m) => m[1]);

// ---------------------------------------------------------------- the pull requests of sprint 02, as recorded

// [number, head, state, created, merged, merge commit, title] — every pull request into sprint/02 on 2026-10-01 at 21:50 UTC.
const SPRINT_02_PRS = [
  [40, "team/ITM-126", "merged", "2026-10-01T19:34:48Z", "2026-10-01T19:50:03Z", "21d51a8", "ITM-126: identifierKept returns a finding, not a sentence — the dashboard writes the sentence"],
  [41, "team/ITM-125", "merged", "2026-10-01T19:37:13Z", "2026-10-01T19:46:06Z", "7d7667a", "ITM-125: the export notice says what the GitHub token grants — pull requests included"],
  [42, "team/ITM-027", "merged", "2026-10-01T19:38:53Z", "2026-10-01T20:00:35Z", "c3f1595", "ITM-027: Process model definitions — read and validated before use"],
  [43, "team/ITM-127", "merged", "2026-10-01T19:51:13Z", "2026-10-01T20:01:30Z", "b80079d", "ITM-127: a requirement's source named as it is written is no error"],
  [44, "team/ITM-131", "merged", "2026-10-01T19:58:24Z", "2026-10-01T20:09:02Z", "26bfa0b", "ITM-131: a refused save shows the newer version beside the edit"],
  [45, "team/ITM-033", "merged", "2026-10-01T20:12:05Z", "2026-10-01T20:47:04Z", "ab9ff83", "ITM-033: backlog items, their order, and an item from an issue"],
  [46, "team/ITM-128", "merged", "2026-10-01T20:14:08Z", "2026-10-01T20:19:23Z", "a248d8a", "ITM-128: no test reads Agent M's own SPEC.md — the specRequirements check runs on its fixture"],
  [47, "team/ITM-129", "merged", "2026-10-01T20:14:13Z", "2026-10-01T20:24:16Z", "dbad6f8", "ITM-129: a page load asks for no view or settings file that is not built — no 404 per planned view"],
  [48, "team/ITM-141", "merged", "2026-10-01T20:22:09Z", "2026-10-01T20:27:50Z", "9b61a73", "ITM-141: release tests of the sprint 01 increment — 59 cases, three findings"],
  [49, "team/ITM-146", "merged", "2026-10-01T20:26:08Z", "2026-10-01T20:37:18Z", "7f68964", "ITM-146: the pull requests of a product on both hosts — list and get, each token only to its own server"],
  [50, "team/ITM-132", "merged", "2026-10-01T20:36:47Z", "2026-10-01T20:50:04Z", "20d24ef", "ITM-132: Add product — a missing repository linked to GitHub's new-repository page, Step A done when the token reaches the product"],
  [51, "team/ITM-130", "merged", "2026-10-01T20:50:25Z", "2026-10-01T20:56:02Z", "1a9fe75", "ITM-130: the reads leave the kernel, and the shells read only through what the git host provides"],
  [52, "team/ITM-014", "merged", "2026-10-01T20:58:23Z", "2026-10-01T21:04:13Z", "a269411", "ITM-014: characterise the approval gates — the checks the SPEC names, with counter-proofs"],
  [53, "team/ITM-034", "merged", "2026-10-01T20:59:20Z", "2026-10-01T21:21:51Z", "b4a815a", "ITM-034: sprints, item states, the work-in-progress limit and the sprint's selection"],
  [54, "team/ITM-133", "merged", "2026-10-01T21:03:38Z", "2026-10-01T21:17:22Z", "942c813", "ITM-133: a write refused for missing write access offers the GitHub path as a link"],
  [55, "team/ITM-016", "merged", "2026-10-01T21:14:27Z", "2026-10-01T21:29:59Z", "a7b4b9f", "ITM-016: applyApprovals in the approval engine — the same bytes as tools/apply_approvals.py"],
  [56, "team/ITM-050", "merged", "2026-10-01T21:16:43Z", "2026-10-01T21:23:11Z", "d3eba11", "ITM-050: repository checks of the hard product rules — NO SERVER, ARTIFACTS ARE MARKDOWN, THE PRODUCT REPOSITORY IS SELF-SUFFICIENT"],
  [57, "team/ITM-136", "merged", "2026-10-01T21:28:53Z", "2026-10-01T21:43:47Z", "3ba86fb", "ITM-136: a browser setting's line keeps its last test across reloads — works since a date, or refused at the last use"],
  [58, "team/ITM-147", "merged", "2026-10-01T21:36:05Z", "2026-10-01T21:49:25Z", "58b7fe4", "ITM-147: the Backlog tab — the running sprint's board under the WIP limit, the backlog in order, the uncovered names, read"],
  [59, "team/ITM-018", "open", "2026-10-01T21:36:20Z", null, null, "ITM-018: the link graph of one commit — coverage and module gaps, impact of a requirement change"],
];
const MERGED = SPRINT_02_PRS.filter((p) => p[2] === "merged").map((p) => /ITM-\d{3}/.exec(p[1])[0]);
const OPEN = SPRINT_02_PRS.filter((p) => p[2] === "open").map((p) => /ITM-\d{3}/.exec(p[1])[0]);

// GitHub's "List pull requests" for akmaier/agent-m, answered from the recording: by base and state, newest first, 100 a page.
function pullsHandler(seen) {
  return (url, init) => {
    if (url.origin !== "https://api.github.com" || url.pathname !== "/repos/akmaier/agent-m/pulls") return null;
    seen.push({ method: init.method, base: url.searchParams.get("base"), auth: init.headers?.Authorization ?? init.headers?.authorization ?? null });
    const base = url.searchParams.get("base"), state = url.searchParams.get("state") ?? "open", page = Number(url.searchParams.get("page") ?? 1);
    const rows = page > 1 || base !== "sprint/02" ? [] : SPRINT_02_PRS
      .filter((p) => state === "all" || (state === "open" ? p[2] === "open" : p[2] !== "open"))
      .sort((a, b) => b[0] - a[0])
      .map(([number, head, st, created, merged, commit, title]) => ({ number, title, body: null, state: st === "open" ? "open" : "closed",
        head: { ref: head, sha: "e".repeat(40) }, base: { ref: "sprint/02" }, created_at: created, merged_at: merged,
        merge_commit_sha: commit ? commit.padEnd(40, "0") : null }));
    return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" } });
  };
}

async function backlogPage({ files = FILES, caches = fakeCaches(), token = TOKEN } = {}) {
  const pulls = [];
  const server = await repoServer({ files, handlers: [pullsHandler(pulls)] });
  const page = await openDashboard({ server, hash: "#backlog", caches, token });
  return { server, page, pulls, caches };
}

// ---------------------------------------------------------------- reading the page

// A part of the page: from its data-part to the next one.
const part = (html, name) => {
  const at = html.indexOf(`data-part="${name}"`);
  assert.ok(at >= 0, `the page has the part ${name}`);
  const next = html.indexOf('data-part="', at + 1);
  return html.slice(at, next < 0 ? html.length : next);
};
// A column of the board, from data-column to the next column or the board's end.
const column = (html, state) => {
  const at = html.indexOf(`data-column="${state}"`);
  if (at < 0) return "";
  const ends = [html.indexOf('data-column="', at + 1), html.indexOf("data-board-end", at)].filter((i) => i >= 0);
  return html.slice(at, Math.min(...ends));
};
const cards = (seg) => [...seg.matchAll(/data-item="(ITM-\d{3})"/g)].map((m) => m[1]);
const card = (html, id) => {
  const at = html.indexOf(`data-item="${id}"`);
  return at < 0 ? "" : html.slice(at, html.indexOf("</li>", at));
};
const row = (html, id) => {
  const at = html.indexOf(`data-backlog-item="${id}"`);
  return at < 0 ? "" : html.slice(at, html.indexOf("</tr>", at));
};
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");
// What the board shows: each state's column with its items, and the limit's line.
const STATES = ["ready", "in progress", "done", "blocked", "waiting for acceptance"];
const boardOf = (html) => ({
  columns: Object.fromEntries(STATES.map((s) => [s, cards(column(part(html, "sprint"), s)).sort()])),
  limit: text(part(html, "limit")).replace(/What is this\?.*$/, "").trim(),
});

// The state UC-032 step 1 gives each selected item from these pull requests: merged — done; open — in progress; otherwise
// waiting for acceptance while a name it realises is not accepted, else ready.
const accepted = (name) => (/^UC-\d{3}$/.test(name) ? ACCEPTED_UC.has(name) : REQUIREMENTS.includes(name));
const expectedState = (id) => (MERGED.includes(id) ? "done" : OPEN.includes(id) ? "in progress"
  : ITEMS.get(id).realises.every(accepted) ? "ready" : "waiting for acceptance");
const EXPECTED_BOARD = Object.fromEntries(STATES.map((s) => [s, SELECTION.filter((id) => expectedState(id) === s).sort()]));

// ---------------------------------------------------------------- the tests

// UC-032 step 1 and the board of step 7 · PROGRESS AND JOB STATE ARE DERIVED, NOT STORED · NO JOB STARTS ABOVE THE WORK-IN-PROGRESS
// LIMIT — sprint 02's own board. Expected: the running sprint is sprint-02 on sprint/02; each of its 25 selected items stands in
// the column of the state its pull requests give — the 19 merged items done, ITM-018 in progress, the five not started ready or
// waiting for acceptance as their names are accepted —, nothing blocked; the in-progress card links its open pull request #59, a
// done card its merged one; the limit of the model, 4, is named, with 1 slot taken, by ITM-018.
test("release · Backlog tab: sprint 02's own board — merged items done, the open one in progress, the limit named", async () => {
  const { page } = await backlogPage();
  const html = page.main();
  const sprintPart = part(html, "sprint");
  assert.match(text(sprintPart), /sprint-02/, "the running sprint");
  assert.match(sprintPart, /sprint\/02/, "its branch");
  assert.equal(MERGED.length, 19);
  assert.deepEqual(OPEN, ["ITM-018"]);
  assert.deepEqual(boardOf(html).columns, EXPECTED_BOARD);
  assert.deepEqual(Object.values(boardOf(html).columns).flat().sort(), [...SELECTION].sort(), "every selected item once");
  assert.match(card(html, "ITM-018"), /href="https:\/\/github\.com\/akmaier\/agent-m\/pull\/59"/, "in progress with its open pull request");
  assert.match(card(html, "ITM-147"), /href="https:\/\/github\.com\/akmaier\/agent-m\/pull\/58"/, "done with its merged pull request");
  assert.match(text(card(html, "ITM-147")), /merged/);
  const limit = boardOf(html).limit;
  assert.match(limit, /\b1 of 4\b/, `the limit of 4 named, one slot taken: ${limit}`);
  assert.match(limit, /ITM-018/, "by ITM-018");
});

// NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT at the board (UC-032 7a: "The WIP limit is reached. Pull is disabled for the next
// item, and the panel names the items in progress"). Expected, for this repository with the model's limit set to 1 instead of 4:
// the limit's line says 1 of 1 slots taken, by ITM-018; every selected item that is ready says it cannot start, naming the limit 1
// and ITM-018; the states themselves do not change.
test("release · Backlog tab: with the limit reached, every ready item says it cannot start, naming the limit", async () => {
  const one = TEXTS["docs/process-models/scrum-wip.md"].replace("| WIP limit | 4 |", "| WIP limit | 1 |");
  const { page } = await backlogPage({ files: { ...FILES, "docs/process-models/scrum-wip.md": one } });
  const html = page.main();
  assert.deepEqual(boardOf(html).columns, EXPECTED_BOARD, "the same states");
  assert.match(boardOf(html).limit, /\b1 of 1\b/);
  assert.match(boardOf(html).limit, /ITM-018/);
  assert.ok(EXPECTED_BOARD.ready.length > 0, "the board has a ready item");
  for (const id of EXPECTED_BOARD.ready) {
    const c = text(card(html, id));
    assert.match(c, /limit of 1/, `${id}: the limit named`);
    assert.match(c, /ITM-018/, `${id}: the item that holds it`);
  }
});

// NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED at the board (UC-032 step 1: "waiting for acceptance: it names a requirement that is
// not yet accepted"; a use case is accepted when an approval record names its current text). The use case changed here is the
// first, by identifier, that this repository holds as accepted and that a ready item of the sprint realises — so that the case
// does not depend on which use cases happen to be open for review. Expected, with that use case changed after its acceptance:
// every selected item not started that realises it waits for acceptance and names it; the others keep their states.
test("release · Backlog tab: an item realising a use case changed since its acceptance waits for acceptance", async () => {
  const realisedByReady = (u) => SELECTION.some((id) => expectedState(id) === "ready" && ITEMS.get(id).realises.includes(u));
  const uc = [...ACCEPTED_UC].sort().find(realisedByReady);
  assert.ok(uc, "an accepted use case is realised by a ready item of the sprint");
  const path = REPO_FILES.find((p) => p.startsWith(`docs/use-cases/${uc}-`));
  const { page } = await backlogPage({ files: { ...FILES, [path]: `${TEXTS[path]}\nA line added after the acceptance.\n` } });
  const html = page.main();
  const waits = SELECTION.filter((id) => expectedState(id) === "ready" && ITEMS.get(id).realises.includes(uc)).sort();
  assert.ok(waits.length > 0, `a ready item of the sprint realises ${uc}`);
  const expected = Object.fromEntries(STATES.map((s) => [s, EXPECTED_BOARD[s].filter((id) => !waits.includes(id))]));
  expected["waiting for acceptance"] = [...EXPECTED_BOARD["waiting for acceptance"], ...waits].sort();
  assert.deepEqual(boardOf(html).columns, expected);
  for (const id of waits) assert.match(text(card(html, id)), new RegExp(uc), `${id}: names ${uc}`);
});

// UC-032 step 1: "Agent M shows the items in their order … The top of the page shows accepted requirements and use cases that no
// item realises yet." Expected: the uncovered names stand above the sprint's board and the backlog below it.
test("release · Backlog tab: the uncovered names above, the board, then the backlog below", async () => {
  const { page } = await backlogPage();
  const html = page.main();
  const at = (name) => html.indexOf(`data-part="${name}"`);
  assert.ok(at("uncovered") >= 0 && at("sprint") >= 0 && at("backlog") >= 0);
  assert.ok(at("uncovered") < at("sprint"), "the uncovered names above the board");
  assert.ok(at("sprint") < at("backlog"), "the backlog below the board");
});

// The sprint file's goal (a load "reads only what the board shows"), ITM-143's Outcome: "no request for an unselected item before
// the backlog is unfolded". Expected: the first load reads the item files of the 25 selected items and of no other; unfolding
// the backlog then reads the others.
test("release · Backlog tab: no request for an unselected item before the backlog is unfolded", async () => {
  const { server, page, pulls } = await backlogPage();
  const itemReads = (reqs) => reqs.map((r) => /^file (docs\/backlog\/(ITM-\d{3})-.+\.md)$/.exec(r)).filter(Boolean).map((m) => m[2]);
  const first = new Set(itemReads(page.requests));
  assert.deepEqual([...new Set(pulls.map((p) => p.base))], ["sprint/02"], "on load, only the pull requests into the sprint's branch");
  assert.deepEqual([...first].filter((id) => !SELECTION.includes(id)), [], "no unselected item read on load");
  assert.deepEqual(SELECTION.filter((id) => !first.has(id)), [], "every selected item read on load");
  const unfold = await page.click('[data-unfold="backlog"]');
  const later = new Set(itemReads(unfold));
  const unselected = [...ITEMS.keys()].filter((id) => !SELECTION.includes(id));
  assert.deepEqual(unselected.filter((id) => !later.has(id)), [], "unfolded: every other item read");
  assert.equal(server.writes.length, 0);
});

// UC-032 step 1, unfolded: "the items in their order. Each item has its identifier, title, what it realises, where it came from,
// and a derived state"; "The top of the page shows accepted requirements and use cases that no item realises yet." Expected: one
// row per item in the order of order.md, the unnamed appended; ITM-143's row shows its title, the names it realises, its origin
// and its state; the selected items' rows carry the board's states; an unselected item that is ready says it is not selected for
// sprint-02 (A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT). The uncovered names are exactly the two requirements no item
// realises — not the withdrawn one — and the accepted use cases no item names.
test("release · Backlog tab: unfolded, the backlog in its order with derived states, and the uncovered names", async () => {
  const { page } = await backlogPage();
  await page.click('[data-unfold="backlog"]');
  const html = page.main();
  const backlog = part(html, "backlog");
  assert.deepEqual([...backlog.matchAll(/data-backlog-item="(ITM-\d{3})"/g)].map((m) => m[1]), ORDER, "the backlog in its order");

  const mine = text(row(backlog, "ITM-143")), item = ITEMS.get("ITM-143");
  assert.ok(mine.includes(item.title), "ITM-143: its title");
  for (const n of item.realises) assert.ok(mine.includes(n), `ITM-143: realises ${n}`);
  assert.ok(mine.includes(item.origin[0]), "ITM-143: where it came from");
  for (const id of SELECTION) {
    assert.ok(text(row(backlog, id)).includes(expectedState(id)), `${id}: ${expectedState(id)} in the backlog too`);
  }
  const unselectedReady = ORDER.filter((id) => !SELECTION.includes(id) && ITEMS.get(id).realises.every(accepted));
  assert.ok(unselectedReady.length > 0, "the fixture has an unselected ready item");
  for (const id of unselectedReady) assert.match(text(row(backlog, id)), /not selected for sprint sprint-02/, `${id}: not selected`);

  const realised = new Set([...ITEMS.values()].flatMap((i) => i.realises));
  // The names the part lists (each as code), not those its folded explanation mentions.
  const shown = part(html, "uncovered").split(/<details/)[0];
  const uncovered = [...new Set([...shown.matchAll(/<code>([^<]+)<\/code>/g)].map((m) => text(m[1]).trim()))].sort();
  const expected = [...UNREALISED, ...[...ACCEPTED_UC].filter((u) => !realised.has(u))].sort();
  assert.deepEqual(uncovered, expected);
});

// PROGRESS AND JOB STATE ARE DERIVED, NOT STORED: "Deleting all local storage and reloading shows the same progress and the same job
// states." Expected: a second load in a browser whose every store is empty — no localStorage (and with it no token: the repository
// is public), an empty Cache Storage — shows the same board and the same limit, and unfolded the same states in the backlog.
test("release · Backlog tab: after clearing every browser store and reloading, the same board", async () => {
  const one = await backlogPage();
  await one.page.click('[data-unfold="backlog"]');
  const before = one.page.main();
  const two = await backlogPage({ caches: fakeCaches(), token: null });
  assert.equal(globalThis.localStorage.length, 0, "the second browser stores nothing to begin with");
  await two.page.click('[data-unfold="backlog"]');
  const after = two.page.main();
  assert.deepEqual(boardOf(after), boardOf(before));
  const states = (html) => ORDER.map((id) => STATES.find((s) => text(row(part(html, "backlog"), id)).includes(s)) ?? null);
  assert.deepEqual(states(after), states(before));
});

// PROGRESS AND JOB STATE ARE DERIVED, NOT STORED · THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — "Nothing was written" (UC-035
// postcondition; the sprint file: "Nothing is stored, nothing written"). Expected: loading the tab and unfolding the backlog send no
// request other than GET, commit nothing, add nothing to localStorage, and the Cache Storage holds only texts of the repository's
// files (by blob SHA) — no state of its own.
test("release · Backlog tab: nothing is written and no state is stored", async () => {
  const { server, page, pulls, caches } = await backlogPage();
  const keysBefore = [...Array(globalThis.localStorage.length).keys()].map((i) => globalThis.localStorage.key(i));
  const unfold = await page.click('[data-unfold="backlog"]');
  const all = [...page.requests, ...unfold];
  assert.deepEqual(all.filter((r) => !/^(file |tree|commit|ref|repository|blob |history |handler GET )/.test(r)), [], "only reads");
  assert.ok(pulls.length >= 1 && pulls.every((p) => (p.method ?? "GET") === "GET"), "the pull requests are read, nothing sent to them");
  assert.equal(server.writes.length, 0, "no commit");
  const keysAfter = [...Array(globalThis.localStorage.length).keys()].map((i) => globalThis.localStorage.key(i));
  assert.deepEqual(keysAfter, keysBefore, "localStorage unchanged");
  assert.deepEqual(keysBefore, ["agent-m.github-token"]);
  const served = new Set(Object.values(FILES));
  for (const [name, store] of caches.stores) {
    for (const [key, value] of store) assert.ok(served.has(value), `${name} ${key}: only the text of a repository file`);
  }
});

// EVERY STEP EXPLAINS ITSELF (UC-032: "Every step carries a folded What is this?"). Expected: each part of the tab — the uncovered
// names, the sprint, the limit, the backlog — and each column of the board carries a folded "What is this?".
test("release · Backlog tab: every part and every column explains itself", async () => {
  const { page } = await backlogPage();
  const html = page.main();
  const folded = /<details[^>]*>\s*<summary>What is this\?<\/summary>/;
  for (const name of ["uncovered", "sprint", "limit", "backlog"]) assert.match(part(html, name), folded, `part ${name}`);
  for (const s of STATES) assert.match(column(part(html, "sprint"), s), folded, `column ${s}`);
});

// UC-032 1b: "The product's model works from a plan. There is no backlog. Agent M links to the plan view (UC-035)." Expected, for
// this repository declaring a planned model instead: the tab says there is no backlog and links to Progress.
test("release · Backlog tab: a product whose model works from a plan has no backlog and is sent to Progress", async () => {
  const planned = TEXTS["docs/process-models/scrum-wip.md"].replace("kind: pulled", "kind: planned").replace("measure: items per state over time", "measure: plan entries per phase");
  const { page } = await backlogPage({ files: { ...FILES, "docs/process-models/scrum-wip.md": planned } });
  const head = page.main().slice(0, page.main().indexOf('data-part="'));
  assert.match(text(head), /no backlog/i);
  assert.match(head, /href="#progress"/);
});
