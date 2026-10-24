// A PAGE LOAD READS THE REPOSITORY IN BATCHES — the Check of that requirement. With a token on GitHub, one load of a dashboard
// page sends its commit and that commit's tree once, and the texts of the files it shows in requests of at most 100 files each;
// a file whose blob the page has read is not read again, and an acceptance reads the head it commits on once. Deterministic, no
// network: the real app (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs against a GitHub API mock that counts every
// request and serves GitHub's batch request (POST /graphql), one aliased field for each file.
//
// Module: MOD-site-frame
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; STATUS IS DERIVED FROM THE RECORDS; AN APPROVAL NAMES THE EXACT TEXT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A CLEAR IS A REAL CLEAR
// Level: component
//
// The expected requests are written here from the requirement, for the fixture product of tests/fixtures/architecture: the files a
// page shows are listed by name, and the requests that carry them are `batch <n>`, n the files in it. The pages are MOD-review-pages'
// routes, which the app's addresses lead to; each load also reads the repository's information once (`repository`), which MOD-review-pages'
// readPlace needs to find the default branch, and a second such read within a load fails the case.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gitBlobSha, recordText, useCaseRecord, reviewedRecord, specRecord, extractSection, sectionText, approvalPath }
  from "../docs/assets/review-core.mjs";
import { repoServer, fakeCaches, openDashboard, REPO } from "./app-harness.mjs";

// The dashboard's own files (MOD-dashboard-app): the shell, src/site-frame/dashboard-app.mjs, and every view and settings section
// under docs/assets/dashboard/ — what a test that read the one app file reads now.
const dashboardText = () => {
  const assets = new URL("../docs/assets/", import.meta.url);
  const views = readdirSync(new URL("dashboard/", assets), { recursive: true }).filter((f) => f.endsWith(".mjs")).sort();
  return [readFileSync(new URL("../src/site-frame/dashboard-app.mjs", import.meta.url), "utf8"),
    ...views.map((f) => readFileSync(new URL(`dashboard/${f}`, assets), "utf8"))].join("\n");
};

// ---------------------------------------------------------------- the product: tests/fixtures/architecture, with records and queues

const FIX = fileURLToPath(new URL("./fixtures/architecture/", import.meta.url));
const base = {};
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p); else base[relative(FIX, p).split("\\").join("/")] = readFileSync(p, "utf8");
  }
})(FIX);
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md";
const README = "docs/use-cases/README.md";
const ARC = "docs/architecture/ARC-001-static-client.md", READER = "docs/architecture/MOD-reader.md";
const PAGE = "docs/architecture/MOD-page.md", REVIEW = "docs/architecture/MOD-review.md";
const DONE = "docs/spec-freigaben/2026-09-01_done", OPEN = "docs/spec-freigaben/2026-09-02_open";
const INDEX = (anchor) => "# Queue\n\n**Zieldatei aller Einträge:** `products/fixture/SPEC.md`\n\n| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |\n" +
  `|---|---|---|---|---|\n| 01 | \`SPEC.md\` | ${anchor} | — | — |\n`;

// The texts accepted earlier, which the server still holds by their blob SHA.
const EARLIER = [];
const server = async (files, handlers = []) => repoServer({ files, history: EARLIER, handlers });

async function product(over = {}) {
  const f = { ...base, [README]: "# Use cases\n\nThe overview.\n", "docs/approvals/README.md": "# Approval records\n" };
  const rec = async (id, path, text, blob = null) => {
    const b = blob ?? await gitBlobSha(text);
    if (text !== f[path]) EARLIER.push(text);
    f[approvalPath(id, await gitBlobSha(text))] = recordText(path.includes("/use-cases/") ? useCaseRecord(path, b) : reviewedRecord(path, b));
  };
  await rec("UC-001", UC1, f[UC1]);                                  // accepted
  await rec("UC-002", UC2, f[UC2].replace("Show the status", "Show a status"));   // changed: accepted in an earlier text
  await rec("ARC-001", ARC, f[ARC]);                                 // accepted
  await rec("MOD-reader", READER, f[READER].replace("Reads files at", "Reads a file at"));   // changed
  // A queue whose one entry is accepted and written, and a queue with an open entry.
  const section = sectionText(extractSection(f["SPEC.md"], "## 1. Rules"));
  f[`${DONE}/index.md`] = INDEX("## 1. Rules");
  f[`${DONE}/01-rules.md`] = section;
  f[`${DONE}/01-rules.begruendung.md`] = "# Why\n\nBecause.\n";
  const doneRec = approvalPath("spec-2026-09-01_done-01", await gitBlobSha(section));
  f[doneRec] = recordText(specRecord({ queue: DONE, entry: 1, proposal: `${DONE}/01-rules.md`, blob: await gitBlobSha(section),
    target: "SPEC.md", anchor: "## 1. Rules", section: await gitBlobSha(section) }));
  f[`${DONE}/entscheidungen.md`] = `# Decisions\n\n| 2026-09-01 10:00 UTC | 1 | uebernommen | approval:${doneRec.split("/").pop()} |\n`;
  f[`${OPEN}/index.md`] = INDEX("## 1. Rules");
  f[`${OPEN}/01-more.md`] = section + "\n**RULE TWO** *(PO, 2026-09-02)*\nA second rule.\n*Check:* none\n";
  f[`${OPEN}/01-more.begruendung.md`] = "# Why\n\nA second rule.\n";
  f[`${OPEN}/entscheidungen.md`] = "# Decisions\n\nAppend-only.\n";
  return { ...f, ...over };
}

const useCase = (n, title) => `---\nid: UC-${n}\ntitle: ${title}\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-${n} ${title}\n`;
const extraUseCases = (from, count) => Object.fromEntries(Array.from({ length: count }, (_, i) =>
  [`docs/use-cases/UC-${from + i}-extra-${from + i}.md`, useCase(from + i, `Extra ${from + i}`)]));

const files = (requests) => requests.filter((r) => r.startsWith("file ")).map((r) => r.slice(5)).sort();
const under = (requests, prefix) => files(requests).filter((p) => p.startsWith(prefix));
const recordOf = (repo, id) => Object.keys(repo).filter((p) => p.startsWith(`docs/approvals/${id}-`));
const sorted = (list) => [...list].sort();
const batchesOf = (requests) => requests.filter((r) => r.startsWith("batch "));
const count = (requests, what) => requests.filter((r) => r === what).length;
// The head commit the harness's server answers, and the reads of the branches that hold what the workflow "main changed" stored for it — the
// graph (`stored graph <commit>`, trace-cache), the overview and the facts (overview-cache) and the impact lists: each is one request of its own by
// design (MOD-trace-graph's storedGraph and storedImpacts, MOD-progress-measures' storedOverview and storedFacts), not a file the page shows.
const HEAD = "c0ffee".padEnd(40, "0");
const STORED = new RegExp(`^${HEAD}\\.(json|facts\\.json|impacts\\.json)$`);
const shownFiles = (requests) => files(requests).filter((path) => !STORED.test(path));
// The order of the one read of the repository's information among a load's requests is no part of the rule: it is counted, and left out of the sequence.
const withoutInfo = (requests) => requests.filter((r) => r !== "repository");

// ---------------------------------------------------------------- the start page, #arc, #spec, #backlog: the Check

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product — two use cases, one of them with a record of an earlier text
// input: open the start page with a token
// expect: the commit and the tree once, then one batch of the 2 files it shows, the repository's information once (wherever in the load), and no file by
//         itself; both use cases listed with their status — UC-001 accepted, UC-002 changed since acceptance — read from the names of
//         the records, so that no record is read
test("the start page sends its commit and tree once and one batch of the files it shows", async () => {
  const repo = await product(), srv = await server(repo);
  const page = await openDashboard({ server: srv });
  assert.match(page.main(), /UC-001/);
  assert.match(page.main(), /UC-002/);
  assert.match(page.main(), /<span class="badge b-accepted">accepted<\/span>/);
  assert.match(page.main(), /<span class="badge b-changed">changed since acceptance<\/span>/);
  assert.deepEqual(withoutInfo(page.requests), ["commit", "tree", "batch 2"]);
  assert.equal(count(page.requests, "repository"), 1);
  assert.deepEqual(srv.batches.map(sorted), [sorted([UC1, UC2])]);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product, whose architecture files decide #arc
// input: open #arc with a token
// expect: the commit and the tree once, then one batch of the 4 architecture files, the repository's information once, and no use
//         case, no queue file, no file by itself; then, for the table and the gaps of the modules view (ITM-721), the graph of the commit: the
//         graph stored for it, read by one request, and no file of the graph (MOD-trace-graph: "A page never builds the graph: it reads the stored
//         one through `storedGraph`")
test("#arc sends its commit and tree once and one batch of the files it shows — no use case and no queue file", async () => {
  const repo = await product(), srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#arc" });
  for (const id of ["ARC-001", "MOD-page", "MOD-reader", "MOD-review"]) assert.match(page.main(), new RegExp(id));
  assert.deepEqual(withoutInfo(page.requests), ["commit", "tree", "batch 4", STORED_GRAPH]);
  assert.equal(count(page.requests, "repository"), 1);
  assert.deepEqual(sorted(srv.batches[0]), sorted([ARC, PAGE, READER, REVIEW]));
  assert.equal(srv.batches.length, 1, "no graph is built from the files");
  assert.equal(new Set(srv.batches.flat()).size, srv.batches.flat().length, "no file twice");
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
// given: MOD-review, which realises UC-002, a use case whose current text is not accepted
// input: open #arc/MOD-review with a token
// expect: the page names UC-002 as what it rests on and offers no Accept; the counter-proof is MOD-page, which names nothing open and is
//         offered for acceptance
test("#arc/<id>: a module that names what is not accepted says so, and is not offered for acceptance", async () => {
  const repo = await product();
  const waiting = await openDashboard({ server: await server(repo), hash: "#arc/MOD-review" });
  assert.match(waiting.main(), /Rests on what is not accepted/);
  assert.match(waiting.main(), /<li class="open-name">UC-002<\/li>/);
  assert.doesNotMatch(waiting.main(), /<button class="btn accept"/);
  const free = await openDashboard({ server: await server(repo), hash: "#arc/MOD-page" });
  assert.doesNotMatch(free.main(), /Rests on what is not accepted/);
  assert.match(free.main(), /<button class="btn accept" type="button">Accept<\/button>/);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product with a queue whose one entry is accepted and written, and a queue with an open entry
// input: open #spec with a token
// expect: no overview is stored for the commit, so the app reads, as MOD-site-frame states it ("the change queues stored for the commit, read
//         beside the first wave of `#spec` …; where no overview is stored, the index and decisions of every queue are read, then the proposals of
//         those still open"), in four waves, each one request: the SPEC — 1 file —, then the queues' heads — 3 files, the two queues' index files
//         being the same blob —, then the proposals of the open queue — 1 file —, then its rationale — 1 file, named to the batch before the impact
//         list of the open entry reads it (the statuses of the specification view, UC-020 step 3); the graph that impact list is made from is the
//         stored one, and no batch of its artifacts is sent (MOD-trace-graph: "A page never builds the graph"); no file twice, the accepted queue's
//         proposal not at all, and no file by itself. The open entry stands under "SPEC changes waiting for acceptance" as a link with its state
//         open; the written one does not.
test("#spec: the app reads the SPEC in one batch, the queues' heads in a second, the open queue's proposals in a third and its rationale in a fourth, and builds no graph", async () => {
  const repo = await product(), srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#spec" });
  const wave1 = ["SPEC.md"], heads = sorted([`${DONE}/entscheidungen.md`, `${DONE}/index.md`, `${OPEN}/entscheidungen.md`]);
  const wave3 = [`${OPEN}/01-more.md`], wave4 = [`${OPEN}/01-more.begruendung.md`];
  assert.deepEqual(batchesOf(page.requests), ["batch 1", "batch 3", "batch 1", "batch 1"]);
  assert.deepEqual(srv.batches.map(sorted), [wave1, heads, wave3, wave4], "no fifth batch: no graph is built from the files");
  assert.equal(new Set(srv.batches.flat()).size, srv.batches.flat().length, "no file twice");
  assert.deepEqual(shownFiles(page.requests), [], "the app reads no file by itself");
  const main = page.main();
  assert.match(main, /SPEC changes waiting for acceptance/);
  assert.match(main, /href="#spec-entry\/id=spec-2026-09-02_open-01"[^>]*>[^<]*<\/a><\/td><td>1\. Rules<\/td><td><span class="badge b-open">open<\/span>/);
  assert.doesNotMatch(main, /spec-2026-09-01_done-01/, "the written entry is not among the waiting ones");
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product with a register: the links file docs/sources.md and two entries docs/sources/SRC-a.md and SRC-b.md
// input: open #spec with a token
// expect: the first wave is one batch of 4 files — the SPEC and the links file with the two register entries —, then, no overview being stored,
//         the queues' heads a second batch of 3 (MOD-site-frame: "where no overview is stored, the index and decisions of every queue are read, then
//         the proposals of those still open"), the open queue's proposal a third batch of 1, its rationale a fourth batch of 1, and no batch of the
//         graph's artifacts; no file twice, none by itself; the register is read in no batch of its own
test("#spec: the links file and the register's entries are read in the first wave, beside the SPEC and the queues' heads", async () => {
  const entry = (id) => ["---", `id: ${id}`, "title: A person", "kind: person", "authority: normative", "licence: may be republished — fixture",
    `identifier: github.com/${id}`, "---", `# ${id} A person`, "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
    "| `2026-10-11` | 2026-10-11 | the fixture | this repository | one file, hashed only |", ""].join("\n");
  const register = { "docs/sources.md": `# Sources\n\n| Source | Version | Hash | Part |\n|---|---|---|---|\n| SRC-a | 2026-10-11 | ${"0".repeat(64)} | |\n`,
    "docs/sources/SRC-a.md": entry("SRC-a"), "docs/sources/SRC-b.md": entry("SRC-b") };
  const srv = await server(await product(register));
  const page = await openDashboard({ server: srv, hash: "#spec" });
  const wave1 = sorted(["SPEC.md", ...Object.keys(register)]);
  const heads = sorted([`${DONE}/entscheidungen.md`, `${DONE}/index.md`, `${OPEN}/entscheidungen.md`]);
  assert.deepEqual(batchesOf(page.requests), ["batch 4", "batch 3", "batch 1", "batch 1"]);
  assert.deepEqual(srv.batches.map(sorted), [wave1, heads, [`${OPEN}/01-more.md`], [`${OPEN}/01-more.begruendung.md`]]);
  assert.equal(new Set(srv.batches.flat()).size, srv.batches.flat().length, "no file twice");
  assert.deepEqual(shownFiles(page.requests), [], "no file by itself");
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product
// input: open #spec with a token
// expect: the whole load — the specification route's reads included — sends its commit and tree once, reads the repository's
//         information once, and reads no file by itself
test("#spec: the whole load sends its commit and tree once, and every file in a batch", async () => {
  const srv = await server(await product());
  const page = await openDashboard({ server: srv, hash: "#spec" });
  assert.equal(count(page.requests, "commit"), 1);
  assert.equal(count(page.requests, "tree"), 1);
  assert.equal(count(page.requests, "repository"), 1);
  assert.deepEqual(shownFiles(page.requests), []);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product, opened on #uc
// input: go on to #arc, #uc/UC-001 and #spec within the same load of the page
// expect: none of the three reads the repository's information again
test("the repository's information is read once for as long as the page is open", async () => {
  const page = await openDashboard({ server: await server(await product()) });
  assert.equal(count(page.requests, "repository"), 1);
  for (const hash of ["#arc", "#uc/UC-001", "#spec"]) assert.equal(count(await page.go(hash), "repository"), 0, hash);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a product that declares its process model, with one team, its sprint and two items
// input: open #backlog with a token
// expect: the commit and the tree once, one batch of the 7 files it shows — the declaration, the SPEC, the team's role
//         assignment and sprint, the 2 items, and the record that decides UC-002's status —; then the facts stored for the commit are asked for (none), and the facts the page takes from MOD-progress-measures'
//         productFacts are read in batches: the 3 module files, the 3 files of the change queues; then the instance at the commit the declaration's model_version names (the commit, the tree) and the process
//         model it names in one batch of its own; no use case and no other file by itself
test("#backlog sends its commit and tree once, one batch of the files it shows, and the process model by one request of its own", async () => {
  const repo = await product({
    "docs/process.md": ["---", "model: fixture-scrum-wip", "model_file: docs/process-models/fixture.md", `model_version: ${"c0ffee".padEnd(40, "0")}`,
      "---", "# How the fixture product is developed", ""].join("\n"),
    "docs/process-models/fixture.md": readFileSync(new URL("./fixtures/flow/scrum-wip.md", import.meta.url), "utf8"),
    "docs/role-assignments/team1.md": "# team1\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | alice |\n| Builders | dev-a |\n| Checker | dev-a |\n",
    "docs/backlog/sprints/team1/01.md": "---\nsprint: 1\ngoal: Read\nstart: 2026-09-14\nend:\ncloser: alice\nbranch:\nselection:\n  - ITM-001\n---\n# team1 Sprint 01\n",
    "docs/backlog/ITM-001-item-1.md": item(1), "docs/backlog/ITM-002-item-2.md": item(2),
  });
  const pulls = (url) => (url.origin === "https://api.github.com" && url.pathname === `/repos/${REPO}/pulls`
    ? new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }) : undefined);
  const srv = await server(repo, [pulls]);
  const page = await openDashboard({ server: srv, hash: "#backlog" });
  assert.match(page.main(), /ITM-001/);
  assert.deepEqual(withoutInfo(page.requests).filter((r) => !r.startsWith("handler ")), ["commit", "tree", "batch 7", `file ${"c0ffee".padEnd(40, "0")}.facts.json`, "batch 3", "batch 3", "commit", "tree", "batch 1"]);
  // The page needs no repository information, and the prompt bar reads through what the load read (instanceSnapshot), asking for none either.
  assert.equal(count(page.requests, "repository"), 0);
  const wave1 = sorted(["docs/process.md", "SPEC.md", "docs/role-assignments/team1.md", "docs/backlog/sprints/team1/01.md",
    "docs/backlog/ITM-001-item-1.md", "docs/backlog/ITM-002-item-2.md", ...recordOf(repo, "UC-002")]);
  assert.deepEqual(srv.batches.map(sorted).slice(0, 1), [wave1]);
  assert.equal(srv.batches.flat().filter((path) => path === "SPEC.md").length, 1, "no file twice");
});

const item = (n) => ["---", `id: ITM-00${n}`, `title: The work of item ${n}`, "level: module", "realises:", "  - RULE ONE", "modules:", "  - MOD-reader",
  "builds_on: []", "tests:", "  - unit", "origin:", "  - RULE ONE", "---", `# ITM-00${n} The work of item ${n}`, "", "## Outcome", "",
  `What item ${n} delivers.`, "", "## Acceptance", "", "- a unit test.", ""].join("\n");

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a start page that shows 207 use cases
// input: open the start page with a token
// expect: 3 batches in all, never more than 100 files in one: batch 100, batch 100, batch 7, and the repository's information once
test("a page that shows more than a hundred files sends one batch for every hundred of them", async () => {
  const repo = await product(extraUseCases(100, 205)), srv = await server(repo);
  const page = await openDashboard({ server: srv });
  assert.deepEqual(withoutInfo(page.requests), ["commit", "tree", "batch 100", "batch 100", "batch 7"]);
  assert.equal(count(page.requests, "repository"), 1);
  assert.equal(new Set(srv.batches.flat()).size, 207, "each of the 207 files once");
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a stored token; the fixture product
// input: open the start page without a token
// expect: GitHub's batch request needs the token: none is sent, and each of the 2 files is read by its own request
test("without a token no batch is sent; each file is read by itself", async () => {
  const srv = await server(await product());
  const page = await openDashboard({ server: srv, token: null });
  assert.deepEqual(batchesOf(page.requests), []);
  assert.deepEqual(files(page.requests), [UC1, UC2]);
  assert.equal(count(page.requests, "repository"), 1);
  assert.match(page.main(), /UC-002/);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// given: three use cases waiting for acceptance — UC-002 changed, UC-003 and UC-004 open — shown on the review page
// input: press Accept all 3 shown
// expect: before it writes, the click reads the head it commits on once — one commit, one tree — and, once, the SPEC that the
//         requirements the use cases name are looked up in (MOD-approvals' acceptShown); no use case, since the three texts were
//         read when the page was shown and their blobs are unchanged; the repository's information is not read again
test("an acceptance of three files reads its head once", async () => {
  const repo = await product({ "docs/use-cases/UC-003-third.md": useCase("003", "Third"), "docs/use-cases/UC-004-fourth.md": useCase("004", "Fourth") });
  const srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#review/uc" });
  assert.match(page.main(), /Accept all 3 shown/);
  const made = await page.click(".accept-all");
  assert.equal(srv.writes.length, 1, "one commit");
  assert.equal(Object.keys(srv.writes[0].files).length, 3, "one record for each of the three files");
  const before = made.slice(0, made.indexOf("write tree"));
  assert.equal(count(before, "commit"), 1, before.join(" | "));
  assert.equal(count(before, "tree"), 1, before.join(" | "));
  assert.equal(count(made, "repository"), 0, made.join(" | "));
  assert.deepEqual(before.filter((r) => r.startsWith("file ") || r.startsWith("batch ")), ["file SPEC.md"], before.join(" | "));
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: three use cases waiting for acceptance — UC-002 changed, UC-003 and UC-004 open
// input: open #review/uc with a token
// expect: the three use cases come in one batch of three and none by itself; the only file read by itself is the record of UC-002's last accepted
//         text, which MOD-approvals reads; the commit and the tree once each
test("#review/uc: the files it shows come in one batch", async () => {
  const repo = await product({ "docs/use-cases/UC-003-third.md": useCase("003", "Third"), "docs/use-cases/UC-004-fourth.md": useCase("004", "Fourth") });
  const srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#review/uc" });
  assert.match(page.main(), /Accept all 3 shown/);
  assert.deepEqual(batchesOf(page.requests), ["batch 3"]);
  assert.deepEqual(srv.batches.map(sorted), [sorted([UC2, "docs/use-cases/UC-003-third.md", "docs/use-cases/UC-004-fourth.md"])]);
  assert.deepEqual(files(page.requests), recordOf(repo, "UC-002"), "only the record of UC-002's last accepted text is read by itself");
  assert.equal(count(page.requests, "commit"), 1);
  assert.equal(count(page.requests, "tree"), 1);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the same three use cases, and a stored token that is not sent
// input: open #review/uc without a token
// expect: counter-proof of the case above — GitHub's batch request needs the token, so no batch is sent and each of the three use cases is read by
//         its own request, more requests than the one batch
test("#review/uc without a token: each file is read by itself, which sends more requests than the batch", async () => {
  const repo = await product({ "docs/use-cases/UC-003-third.md": useCase("003", "Third"), "docs/use-cases/UC-004-fourth.md": useCase("004", "Fourth") });
  const withToken = await openDashboard({ server: await server(repo), hash: "#review/uc" });
  const without = await openDashboard({ server: await server(repo), hash: "#review/uc", token: null });
  assert.deepEqual(batchesOf(without.requests), []);
  for (const path of [UC2, "docs/use-cases/UC-003-third.md", "docs/use-cases/UC-004-fourth.md"]) assert.ok(files(without.requests).includes(path), path);
  assert.ok(without.requests.length > withToken.requests.length, `${without.requests.length} against ${withToken.requests.length}`);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product, whose UC-001 is accepted
// input: open #uc/UC-001 and #arc/ARC-001 with a token — a route that shows one accepted file
// expect: the commit, the tree and the repository's information, and the one file by its own request — a batch of one file is no fewer requests
test("#uc/<id> and #arc/<id> of an accepted file read that one file by itself", async () => {
  const repo = await product();
  const use = await openDashboard({ server: await server(repo), hash: "#uc/UC-001" });
  assert.deepEqual(use.requests, ["commit", "tree", "repository", `file ${UC1}`]);
  const arc = await openDashboard({ server: await server(repo), hash: "#arc/ARC-001" });
  assert.deepEqual(arc.requests, ["commit", "tree", "repository", `file ${ARC}`]);
});

// ---------------------------------------------------------------- the review pages' own addresses: #use-case, #decision, #module

// A decision file of the fixture's form, ARC-<n>: the fixture then holds three decisions (ARC-001, ARC-002, ARC-003).
const decision = (n) => base[ARC].replaceAll("ARC-001", `ARC-${n}`);
const ARC2 = "docs/architecture/ARC-002-second.md", ARC3 = "docs/architecture/ARC-003-third.md";
const MODULES = [PAGE, READER, REVIEW];
// The read of the graph stored for the fixture's commit (the commit the harness's server answers) on the branch trace-cache, asked for once by a page that reads the graph.
const STORED_GRAPH = `stored graph ${"c0ffee".padEnd(40, "0")}`;

// The files each address shows: the fixture's two use cases, three decisions and three module files.
const SHOWN = { "#use-case": [UC1, UC2], "#decision": [ARC, ARC2, ARC3], "#module": MODULES };
const withDecisions = () => product({ [ARC2]: decision("002"), [ARC3]: decision("003") });

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product with two use cases (UC-001, UC-002), three decisions (ARC-001, ARC-002, ARC-003) and three module files
//        (MOD-page, MOD-reader, MOD-review)
// input: open #use-case (then #decision, then #module) with a token
// expect: the commit and the tree once, one batch of exactly the files of its own kind — 2 files for #use-case, 3 for #decision, 3 for
//         #module —, the repository's information once, and no file by itself; #module also shows the modules view (ITM-721), which reads the
//         graph of the commit: the graph stored for it, by at most one request — the modules view may ask for it after the page has settled, so the
//         read is counted, not placed —, and no file of the graph (MOD-trace-graph: "A page never builds the graph")
for (const [hash, paths] of Object.entries(SHOWN)) {
  test(`${hash} sends its commit and tree once and one batch of the files it shows`, async () => {
    const srv = await server(await withDecisions());
    const page = await openDashboard({ server: srv, hash });
    assert.deepEqual(withoutInfo(page.requests).filter((r) => r !== STORED_GRAPH), ["commit", "tree", `batch ${paths.length}`]);
    assert.ok(count(page.requests, STORED_GRAPH) <= 1, "the stored graph is read at most once");
    assert.equal(count(page.requests, "repository"), 1);
    assert.deepEqual(sorted(srv.batches[0]), sorted(paths));
    assert.equal(srv.batches.length, 1, "no graph is built from the files");
    assert.deepEqual(shownFiles(page.requests), [], "no file by itself");
  });
}

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the same fixture product, and a stored token that is not sent
// input: open #use-case, #decision and #module without a token
// expect: counter-proof of the case above — GitHub's batch request needs the token, so no batch is sent and each of the files of the
//         kind (2, 3 and 3) is read by its own request
test("#use-case, #decision and #module without a token: each file is read by itself", async () => {
  const repo = await withDecisions();
  for (const [hash, paths] of Object.entries(SHOWN)) {
    const page = await openDashboard({ server: await server(repo), hash, token: null });
    assert.deepEqual(batchesOf(page.requests), [], hash);
    for (const path of paths) assert.ok(files(page.requests).includes(path), `${hash}: ${path}`);
    assert.equal(count(page.requests, "repository"), 1, hash);
  }
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: UC-001 and MOD-page, each with a record that names its current text
// input: open #use-case/id=UC-001 and #module/id=MOD-page with a token — a route that shows one accepted file
// expect: the commit, the tree and the repository's information, and the one file by its own request — a batch of one file is no fewer requests
test("#use-case/id= and #module/id= of an accepted file read that one file by itself", async () => {
  const repo = await product();
  const blob = await gitBlobSha(repo[PAGE]);
  repo[approvalPath("MOD-page", blob)] = recordText(reviewedRecord(PAGE, blob));
  const use = await openDashboard({ server: await server(repo), hash: "#use-case/id=UC-001" });
  assert.deepEqual(use.requests, ["commit", "tree", "repository", `file ${UC1}`]);
  const module = await openDashboard({ server: await server(repo), hash: "#module/id=MOD-page" });
  assert.deepEqual(module.requests, ["commit", "tree", "repository", `file ${PAGE}`]);
});

// ---------------------------------------------------------------- one view, what it reads

// guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// given: UC-002, accepted in an earlier text, edited since
// input: open #uc/UC-002 with a token
// expect: the file once, the record's history once and the text the record names as the repository stood when the record was added —
//         that commit's tree and that file —, each once; the page shows the difference to the text accepted before
test("opening one use case reads that use case, the history of its record and the text the record names — no other file", async () => {
  const repo = await product();
  const page = await openDashboard({ server: await server(repo), hash: "#uc/UC-002" });
  assert.deepEqual(files(page.requests), [...recordOf(repo, "UC-002"), UC2].sort());
  assert.deepEqual(page.requests.filter((r) => r.startsWith("history ")), [`history ${recordOf(repo, "UC-002")[0]}`]);
  assert.deepEqual(page.requests.filter((r) => r.startsWith("era ")), ["era commit", "era tree", `era file ${UC2}`]);
  assert.equal(count(page.requests, "commit"), 1);
  assert.equal(count(page.requests, "tree"), 1);
  assert.match(page.main(), /Show the status/);
  assert.match(page.main(), /<section class="accepted-diff"><h3>Changed since it was last accepted<\/h3>/);
  assert.match(page.main(), /<span class="ddel">- title: Show a status/, "the difference to the text accepted before");
});

// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
// given: MOD-reader, accepted in an earlier text, edited since
// input: open #arc/MOD-reader with a token
// expect: the difference to its last accepted text, the impact list beside it — the affected modules —, Accept offered with it; the
//         page first asks for the impact lists stored for the commit, in one request (MOD-review-pages: "the page first reads the impact lists
//         stored for the commit it shows (MOD-trace-graph's `storedImpacts`, one request)"), builds no graph from the files — no batch is
//         sent (MOD-review-pages: "no page builds a graph") —, and reads no use case and no queue file
test("opening a changed module shows its impact list beside the difference, and offers Accept with it", async () => {
  const repo = await product();
  const srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#arc/MOD-reader" });
  assert.match(page.main(), /MOD-reader/);
  assert.match(page.main(), /Changed since it was last accepted/);
  assert.match(page.main(), /<section class="change-impact"><h3>Impact of this change<\/h3>/);
  assert.match(page.main(), /Affected modules/);
  assert.match(page.main(), /<button class="btn accept" type="button">Accept<\/button>/, "Accept, once the impact list is shown");
  assert.deepEqual(under(page.requests, "docs/use-cases/"), []);
  assert.deepEqual(under(page.requests, "docs/spec-freigaben/"), []);
  assert.equal(count(page.requests, `file ${HEAD}.impacts.json`), 1, "the stored impact lists, in one request");
  assert.deepEqual(batchesOf(page.requests), [], "no graph is built from the files");
});

test("settings read the product's settings, and no use case, architecture file, record or queue", async () => {
  const page = await openDashboard({ server: await server(await product()), hash: "#settings" });
  assert.deepEqual(files(page.requests), []);
  assert.deepEqual(batchesOf(page.requests), []);
  assert.ok(page.requests.includes("tree"));
});

// ---------------------------------------------------------------- the texts held during one dashboard load

test("a second load on an unchanged tree sends the same requests as the first; an edited file is read in the same batch", async () => {
  const repo = await product(), caches = fakeCaches();
  const first = await openDashboard({ server: await server(repo), caches });
  assert.deepEqual(withoutInfo(first.requests), ["commit", "tree", "batch 2"]);
  const again = await openDashboard({ server: await server(repo), caches });
  assert.deepEqual(withoutInfo(again.requests), ["commit", "tree", "batch 2"]);
  assert.equal(again.main(), first.main(), "the same page");
  // A file whose blob changed is shown with its new text, from the same batch: a status is told by the names of the records alone.
  const edited = { ...repo, [UC1]: repo[UC1].replaceAll("Read a file", "Read one file") };
  const srv = await server(edited);
  const third = await openDashboard({ server: srv, caches });
  assert.deepEqual(withoutInfo(third.requests), ["commit", "tree", "batch 2"]);
  assert.deepEqual(srv.batches.map(sorted), [sorted([UC1, UC2])]);
  assert.match(third.main(), /Read one file/);
});

test("without Cache Storage the page still works; it sends the same requests", async () => {
  const repo = await product();
  const first = await openDashboard({ server: await server(repo), caches: null });
  const again = await openDashboard({ server: await server(repo), caches: null });
  assert.deepEqual(again.requests, first.requests);
  assert.match(again.main(), /UC-002/);
});

// ---------------------------------------------------------------- the record decides where it is read

// guards: STATUS IS DERIVED FROM THE RECORDS
// given: UC-001 with its record, and UC-002 whose only record names an earlier text
// input: open #uc/UC-001 and #uc/UC-002 with a token
// expect: UC-001 accepted, with no Accept; UC-002 changed since acceptance, with Accept — a file is accepted exactly when a record names its current blob
test("a use case is accepted exactly when a record names its current text", async () => {
  const repo = await product();
  const honest = await openDashboard({ server: await server(repo), hash: "#uc/UC-001" });
  assert.match(honest.main(), /<span class="badge b-accepted">accepted<\/span>/);
  assert.doesNotMatch(honest.main(), /<button class="btn accept"/);
  const changed = await openDashboard({ server: await server(repo), hash: "#uc/UC-002" });
  assert.match(changed.main(), /<span class="badge b-changed">changed since acceptance<\/span>/);
  assert.match(changed.main(), /<button class="btn accept" type="button">Accept<\/button>/);
});

test("Clear everything also removes the kept file texts (A CLEAR IS A REAL CLEAR)", () => {
  const app = dashboardText();
  const handler = app.match(/getElementById\("token-clear"\)\.addEventListener\("click", [\s\S]*?\n {2}\}\);\n/)?.[0] ?? "";
  assert.match(handler, /store\.clear\(\)/);
  assert.match(handler, /kept\.clear\(\)/, "the texts kept by blob SHA go with the settings");
  assert.match(handler, /Clearing failed/, "and the page says so when something is left");
});
