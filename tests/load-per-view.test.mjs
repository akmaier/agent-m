// A PAGE LOAD READS THE REPOSITORY IN BATCHES — the Check of that requirement. With a token on GitHub, one load of a dashboard
// page sends its commit and that commit's tree once, and the texts of the files it shows in requests of at most 100 files each;
// a file whose blob the page has read is not read again, and an acceptance reads the head it commits on once. Deterministic, no
// network: the real app (docs/assets/dashboard-app.mjs) runs in tests/app-harness.mjs against a GitHub API mock that counts every
// request and serves GitHub's batch request (POST /graphql), one aliased field for each file.
//
// Module: MOD-site-frame
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; STATUS IS DERIVED FROM THE RECORDS; AN APPROVAL NAMES THE EXACT TEXT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A CLEAR IS A REAL CLEAR
// Level: component
//
// The expected requests are written here from the requirement, for the fixture product of tests/fixtures/architecture: the files a
// page shows are listed by name, and the requests that carry them are `batch <n>`, n the files in it.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gitBlobSha, recordText, useCaseRecord, reviewedRecord, specRecord, extractSection, sectionText, approvalPath }
  from "../docs/assets/review-core.mjs";
import { repoServer, fakeCaches, openDashboard, REPO } from "./app-harness.mjs";

// The dashboard's own files (MOD-dashboard-app): the shell, docs/assets/dashboard-app.mjs, and every view and settings section
// under docs/assets/dashboard/ — what a test that read the one app file reads now.
const dashboardText = () => {
  const assets = new URL("../docs/assets/", import.meta.url);
  const views = readdirSync(new URL("dashboard/", assets), { recursive: true }).filter((f) => f.endsWith(".mjs")).sort();
  return ["dashboard-app.mjs", ...views.map((f) => `dashboard/${f}`)].map((f) => readFileSync(new URL(f, assets), "utf8")).join("\n");
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
const INDEX = (anchor) => "# Queue\n\n**Zieldatei aller Einträge:** `products/fixture/SPEC.md`\n\n| Nr | Datei | Anker | bis | Commits |\n" +
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

// ---------------------------------------------------------------- the start page, #arc, #spec, #backlog: the Check

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product — two use cases and the README, with the record of UC-002's earlier text
// input: open the start page with a token
// expect: the commit and the tree once, then one batch of the 4 files it shows, and no file by itself
test("the start page sends its commit and tree once and one batch of the files it shows", async () => {
  const repo = await product(), srv = await server(repo);
  const page = await openDashboard({ server: srv });
  assert.match(page.main(), /UC-001/);
  assert.match(page.main(), /UC-002/);
  assert.match(page.main(), /The overview\./);
  assert.match(page.main(), /b-accepted/);
  assert.match(page.main(), /b-changed/);
  assert.deepEqual(page.requests, ["commit", "tree", "batch 4"]);
  // UC-002 has a record of an earlier text only: whether it is changed or open is read from that record. UC-001's record is
  // named by its current blob — accepted, without reading it.
  assert.deepEqual(srv.batches.map(sorted), [sorted([README, UC1, UC2, ...recordOf(repo, "UC-002")])]);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product, whose architecture files, SPEC and records decide the statuses of #arc
// input: open #arc with a token
// expect: the commit and the tree once, then one batch of the 7 files it shows — the four architecture files, the SPEC the
//         requirements are read from, and the 2 records that decide a status — and no use case, no queue file, no file by itself
test("#arc sends its commit and tree once and one batch of the files it shows — no use case and no queue file", async () => {
  const repo = await product(), srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#arc" });
  for (const id of ["ARC-001", "MOD-page", "MOD-reader", "MOD-review"]) assert.match(page.main(), new RegExp(id));
  assert.deepEqual(page.requests, ["commit", "tree", "batch 7"]);
  assert.deepEqual(srv.batches.map(sorted), [sorted([ARC, PAGE, READER, REVIEW, "SPEC.md", ...recordOf(repo, "MOD-reader"), ...recordOf(repo, "UC-002")])]);
  // Counter-proof of the gate: MOD-review realises UC-002, which is changed — the list says what it waits for.
  assert.match(page.main(), /waits for UC-002/);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product with a queue whose one entry is accepted and written, and a queue with an open entry
// input: open #spec with a token
// expect: the app reads in two waves, each one request: the SPEC and the queues' heads — 4 files, the two queues' index files
//         being the same blob —, then the proposals of the open queue — 1 file; no file twice, the accepted queue's proposal
//         not at all. The specification route reads through hosts of its own, which this case leaves out (ITM-680).
test("#spec: the app reads the SPEC and the queues' heads in one batch and the open queue's proposals in a second", async () => {
  const repo = await product(), srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#spec" });
  const wave1 = sorted(["SPEC.md", `${DONE}/entscheidungen.md`, `${DONE}/index.md`, `${OPEN}/entscheidungen.md`]);
  const wave2 = [`${OPEN}/01-more.md`];
  assert.deepEqual(batchesOf(page.requests), ["batch 4", "batch 1"]);
  assert.deepEqual(srv.batches.map(sorted), [wave1, wave2]);
  assert.equal(new Set(srv.batches.flat()).size, srv.batches.flat().length, "no file twice");
  assert.deepEqual(files(page.requests).filter((p) => p !== "SPEC.md"), [], "the app reads no file by itself");
  const main = page.main();
  // Only open changes: the queue with an open entry is listed, the accepted queue is not.
  assert.match(main, /id="queue-2026-09-02_open"/);
  assert.doesNotMatch(main, /id="queue-2026-09-01_done"/);
  assert.doesNotMatch(main, /closed queue/);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product
// input: open #spec with a token
// expect: the whole load — the specification route's reads included — sends its commit and tree once and reads no file by itself
test("#spec: the whole load sends its commit and tree once, and every file in a batch", { todo: "ITM-680 makes the specification route read through the app's host" }, async () => {
  const srv = await server(await product());
  const page = await openDashboard({ server: srv, hash: "#spec" });
  assert.equal(count(page.requests, "commit"), 1);
  assert.equal(count(page.requests, "tree"), 1);
  assert.deepEqual(files(page.requests), []);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a product that declares its process model, with one team, its sprint and two items
// input: open #backlog with a token
// expect: the commit and the tree once, one batch of the 7 files it shows — the declaration, the SPEC, the team's role
//         assignment and sprint, the 2 items, and the record that decides UC-002's status —, then the process model the
//         declaration names, alone in the second batch; no use case, no module file (one team), no file by itself
test("#backlog sends its commit and tree once, one batch of the files it shows, and the process model in a second", async () => {
  const repo = await product({
    "docs/process.md": ["---", "model: fixture-scrum-wip", "model_file: docs/process-models/fixture.md", `model_version: ${"a".repeat(40)}`,
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
  assert.deepEqual(page.requests.filter((r) => !r.startsWith("handler ")), ["commit", "tree", "batch 7", "batch 1"]);
  const wave1 = sorted(["docs/process.md", "SPEC.md", "docs/role-assignments/team1.md", "docs/backlog/sprints/team1/01.md",
    "docs/backlog/ITM-001-item-1.md", "docs/backlog/ITM-002-item-2.md", ...recordOf(repo, "UC-002")]);
  assert.deepEqual(srv.batches.map(sorted), [wave1, ["docs/process-models/fixture.md"]]);
});

const item = (n) => ["---", `id: ITM-00${n}`, `title: The work of item ${n}`, "level: module", "realises:", "  - RULE ONE", "modules:", "  - MOD-reader",
  "builds_on: []", "tests:", "  - unit", "origin:", "  - RULE ONE", "---", `# ITM-00${n} The work of item ${n}`, "", "## Outcome", "",
  `What item ${n} delivers.`, "", "## Acceptance", "", "- a unit test.", ""].join("\n");

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a start page that shows 209 files: 207 use cases and the README, with the one record that decides UC-002's status
// input: open the start page with a token
// expect: 3 batches in all, never more than 100 files in one: batch 100, batch 100, batch 9
test("a page that shows more than a hundred files sends one batch for every hundred of them", async () => {
  const repo = await product(extraUseCases(100, 205)), srv = await server(repo);
  const page = await openDashboard({ server: srv });
  assert.deepEqual(page.requests, ["commit", "tree", "batch 100", "batch 100", "batch 9"]);
  assert.equal(new Set(srv.batches.flat()).size, 209, "each of the 209 files once");
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a stored token; the fixture product
// input: open the start page without a token
// expect: GitHub's batch request needs the token: none is sent, and each file is read by its own request
test("without a token no batch is sent; each file is read by itself", async () => {
  const srv = await server(await product());
  const page = await openDashboard({ server: srv, token: null });
  assert.deepEqual(batchesOf(page.requests), []);
  assert.deepEqual(files(page.requests).length, 4);
  assert.match(page.main(), /UC-002/);
});

// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// given: three use cases waiting for acceptance — UC-002 changed, UC-003 and UC-004 open — shown on the review page
// input: press Accept all 3 shown
// expect: before it writes, the click reads the head it commits on once — one commit, one tree — and no file, since the three
//         texts were read when the page was shown and their blobs are unchanged
test("an acceptance of three files reads its head once", async () => {
  const repo = await product({ "docs/use-cases/UC-003-third.md": useCase("003", "Third"), "docs/use-cases/UC-004-fourth.md": useCase("004", "Fourth") });
  const srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#review/uc" });
  assert.match(page.main(), /Accept all 3 shown/);
  const made = await page.click("[data-accept-all]");
  assert.equal(srv.writes.length, 1, "one commit");
  assert.equal(Object.keys(srv.writes[0].files).length, 3, "one record for each of the three files");
  const before = made.slice(0, made.indexOf("write tree"));
  assert.equal(count(before, "commit"), 1, before.join(" | "));
  assert.equal(count(before, "tree"), 1, before.join(" | "));
  assert.deepEqual(before.filter((r) => r.startsWith("file ") || r.startsWith("batch ")), [], before.join(" | "));
});

// ---------------------------------------------------------------- one view, what it reads

test("opening one use case reads that use case and its records — no other file", async () => {
  const repo = await product();
  const page = await openDashboard({ server: await server(repo), hash: "#uc/UC-002" });
  assert.deepEqual(files(page.requests), [UC2, ...recordOf(repo, "UC-002")].sort());
  // A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT: the accepted text, read by the blob its record names.
  assert.deepEqual(page.requests.filter((r) => r.startsWith("blob ")), [`blob ${await gitBlobSha(repo[UC2].replace("Show the status", "Show a status"))}`]);
  assert.match(page.main(), /Show the status/);
  assert.match(page.el("accepted-diff"), /- title: Show a status/, "the difference to the text accepted before");
});

test("opening a changed module reads what its impact list needs: its records, its last accepted text, every module, the code's headers", async () => {
  const repo = await product();
  const page = await openDashboard({ server: await server(repo), hash: "#arc/MOD-reader" });
  assert.match(page.main(), /MOD-reader/);
  assert.match(page.el("accepted-diff"), /Changed since it was last accepted/);
  assert.match(page.el("impact"), /Affected modules/, page.el("impact"));
  assert.match(page.el("arc-accept"), /data-accept-key=/, "Accept, once the impact list is shown");
  assert.deepEqual(under(page.requests, "docs/use-cases/"), []);
  assert.deepEqual(under(page.requests, "docs/spec-freigaben/"), []);
  assert.ok(recordOf(repo, "MOD-reader").every((p) => files(page.requests).includes(p)));
  assert.ok(["src/reader.js", "src/review.py", "tests/reader.test.js"].every((p) => files(page.requests).includes(p)), "the code's module headers");
});

test("settings read the product's settings, and no use case, architecture file, record or queue", async () => {
  const page = await openDashboard({ server: await server(await product()), hash: "#settings" });
  assert.deepEqual(files(page.requests), []);
  assert.deepEqual(batchesOf(page.requests), []);
  assert.ok(page.requests.includes("tree"));
});

// ---------------------------------------------------------------- the texts held during one dashboard load

test("a second load on an unchanged tree sends the same requests as the first; an edited file adds its record to the batch", async () => {
  const repo = await product(), caches = fakeCaches();
  const first = await openDashboard({ server: await server(repo), caches });
  assert.deepEqual(first.requests, ["commit", "tree", "batch 4"]);
  const again = await openDashboard({ server: await server(repo), caches });
  assert.deepEqual(again.requests, ["commit", "tree", "batch 4"]);
  assert.equal(again.main(), first.main(), "the same page");
  // A file whose blob changed is shown with its new text — that one, and its record: no record is named by its new text, so the
  // record of the earlier one says whether it is changed or open.
  const edited = { ...repo, [UC1]: repo[UC1].replace("Read a file", "Read one file") };
  const srv = await server(edited);
  const third = await openDashboard({ server: srv, caches });
  assert.deepEqual(third.requests, ["commit", "tree", "batch 5"]);
  assert.deepEqual(srv.batches.map(sorted), [sorted([README, UC1, UC2, ...recordOf(repo, "UC-002"), ...recordOf(repo, "UC-001")])]);
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

test("counter-proof: a record named for the current text whose content names another blob does not accept the opened file", async () => {
  const repo = await product();
  const name = approvalPath("UC-001", await gitBlobSha(repo[UC1]));
  const forged = { ...repo, [name]: recordText(useCaseRecord(UC1, "e".repeat(40))) };
  const page = await openDashboard({ server: await server(forged), hash: "#uc/UC-001" });
  assert.ok(files(page.requests).includes(name), "opened, the file's records are read");
  assert.doesNotMatch(page.main(), /<h2>[^<]*UC-001[^<]*<span class="badge b-accepted"/);
  assert.match(page.main(), /data-accept-key=/, "Accept is offered: no record names this text");
  // Counter-proof of the counter-proof: the true record accepts it, and no Accept is offered.
  const honest = await openDashboard({ server: await server(repo), hash: "#uc/UC-001" });
  assert.match(honest.main(), /b-accepted/);
  assert.doesNotMatch(honest.main(), /data-accept-key=/);
});

test("Clear everything also removes the kept file texts (A CLEAR IS A REAL CLEAR)", () => {
  const app = dashboardText();
  const handler = app.match(/getElementById\("token-clear"\)\.addEventListener\("click", [\s\S]*?\n {2}\}\);\n/)?.[0] ?? "";
  assert.match(handler, /store\.clear\(\)/);
  assert.match(handler, /kept\.clear\(\)/, "the texts kept by blob SHA go with the settings");
  assert.match(handler, /Clearing failed/, "and the page says so when something is left");
});
