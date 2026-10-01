// Load per view — the dashboard reads the commit and the tree on a page load, and each view only what it shows; a file's text
// is kept in the browser by its blob SHA and not read again while that blob is unchanged. Deterministic, no network: the real
// app (docs/assets/dashboard-app.mjs) runs in tests/app-harness.mjs against a GitHub API mock that counts every request.
//
// Module: MOD-dashboard-app
// Guards: STATUS IS DERIVED FROM THE RECORDS; AN APPROVAL NAMES THE EXACT TEXT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A CLEAR IS A REAL CLEAR
// Level: component
//
// Why: on 2026-10-01 the PO's account used up its 5,000 requests per hour. With a token, every page load read every use case,
// every architecture file, every approval record and every queue file through the contents API — about 450 requests.
// SPEC §10 STATUS IS DERIVED FROM THE RECORDS · AN APPROVAL NAMES THE EXACT TEXT · A CHANGED FILE IS SHOWN AGAINST ITS LAST
// ACCEPTED TEXT; §7 A CLEAR IS A REAL CLEAR — kept, with fewer reads.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gitBlobSha, recordText, useCaseRecord, reviewedRecord, specRecord, extractSection, sectionText, approvalPath }
  from "../docs/assets/review-core.mjs";
import { repoServer, fakeCaches, openDashboard } from "./app-harness.mjs";

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
const ARC = "docs/architecture/ARC-001-static-client.md", READER = "docs/architecture/MOD-reader.md";
const DONE = "docs/spec-freigaben/2026-09-01_done", OPEN = "docs/spec-freigaben/2026-09-02_open";
const INDEX = (anchor) => "# Queue\n\n**Zieldatei aller Einträge:** `products/fixture/SPEC.md`\n\n| Nr | Datei | Anker | bis | Commits |\n" +
  `|---|---|---|---|---|\n| 01 | \`SPEC.md\` | ${anchor} | — | — |\n`;

// The texts accepted earlier, which the server still holds by their blob SHA.
const EARLIER = [];
const server = async (files) => repoServer({ files, history: EARLIER });

async function product(over = {}) {
  const f = { ...base, "docs/use-cases/README.md": "# Use cases\n\nThe overview.\n", "docs/approvals/README.md": "# Approval records\n" };
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

const files = (requests) => requests.filter((r) => r.startsWith("file ")).map((r) => r.slice(5)).sort();
const under = (requests, prefix) => files(requests).filter((p) => p.startsWith(prefix));
const recordOf = (repo, id) => Object.keys(repo).filter((p) => p.startsWith(`docs/approvals/${id}-`));

// ---------------------------------------------------------------- one view, what it reads

test("the use-case list reads the commit, the tree, the use cases and only the records it must — no architecture or queue file", async () => {
  const repo = await product();
  const page = await openDashboard({ server: await server(repo) });
  assert.match(page.main(), /UC-001/);
  assert.match(page.main(), /UC-002/);
  assert.match(page.main(), /The overview\./);
  assert.deepEqual(page.requests.filter((r) => !r.startsWith("file ")), ["commit", "tree"]);
  // UC-002 has a record of an earlier text only: whether it is changed or open is read from that record. UC-001's record is
  // named by its current blob — accepted, without reading it.
  assert.deepEqual(files(page.requests), ["docs/use-cases/README.md", UC1, UC2, ...recordOf(repo, "UC-002")].sort());
  assert.match(page.main(), /b-accepted/);
  assert.match(page.main(), /b-changed/);
});

test("the architecture view reads no use case and no queue file", async () => {
  const repo = await product();
  const page = await openDashboard({ server: await server(repo), hash: "#arc" });
  for (const id of ["ARC-001", "MOD-page", "MOD-reader", "MOD-review"]) assert.match(page.main(), new RegExp(id));
  assert.deepEqual(under(page.requests, "docs/use-cases/"), []);
  assert.deepEqual(under(page.requests, "docs/spec-freigaben/"), []);
  assert.deepEqual(under(page.requests, "docs/architecture/"), [ARC, "docs/architecture/MOD-page.md", READER, "docs/architecture/MOD-review.md"]);
  assert.ok(files(page.requests).includes("SPEC.md"), "the requirements the files name are read from the SPEC");
  // Counter-proof of the gate: MOD-review realises UC-002, which is changed — the list says what it waits for.
  assert.match(page.main(), /waits for UC-002/);
});

test("the SPEC view reads SPEC.md and every queue's index and decisions; an accepted queue's proposals only when it is opened", async () => {
  const repo = await product();
  const page = await openDashboard({ server: await server(repo), hash: "#spec" });
  assert.deepEqual(files(page.requests), ["SPEC.md", `${DONE}/entscheidungen.md`, `${DONE}/index.md`, `${OPEN}/01-more.md`,
    `${OPEN}/entscheidungen.md`, `${OPEN}/index.md`].sort());
  // The accepted queue is named, not left out: its entries are counted and it can be opened.
  assert.match(page.main(), /2026-09-01_done/);
  assert.match(page.main(), /href="#spec\/2026-09-01_done"/);
  assert.match(page.main(), /1 accepted\s+entry in 1 closed queue/);
  const opened = await page.go("#spec/2026-09-01_done");
  assert.deepEqual(files(opened), [`${DONE}/01-rules.md`], "its proposal, and nothing read before again");
  assert.match(page.main(), /b-applied/);
});

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
  assert.ok(page.requests.includes("tree"));
});

// ---------------------------------------------------------------- the texts kept by blob SHA

test("a second load on an unchanged tree reads no file — the texts are kept by their blob SHA", async () => {
  const repo = await product(), caches = fakeCaches();
  const first = await openDashboard({ server: await server(repo), caches });
  assert.ok(files(first.requests).length > 0);
  const again = await openDashboard({ server: await server(repo), caches });
  assert.deepEqual(again.requests, ["commit", "tree"]);
  assert.equal(again.main(), first.main(), "the same page");
  // A file whose blob changed is read again — that one, and its record: no record is named by its new text, so the record of
  // the earlier one says whether it is changed or open.
  const edited = { ...repo, [UC1]: repo[UC1].replace("Read a file", "Read one file") };
  const third = await openDashboard({ server: await server(edited), caches });
  assert.deepEqual(files(third.requests), [...recordOf(repo, "UC-001"), UC1]);
  assert.match(third.main(), /Read one file/);
});

test("counter-proof: a kept text that does not hash to its blob SHA is read again, and the page shows the real text", async () => {
  const repo = await product(), caches = fakeCaches();
  await openDashboard({ server: await server(repo), caches });
  const sha = await gitBlobSha(repo[UC1]);
  const kept = [...caches.stores.values()][0];
  const key = [...kept.keys()].find((k) => k.endsWith(`/${sha}`));
  assert.ok(key, "UC-001's text was kept under its blob SHA");
  kept.set(key, repo[UC1].replace("Read a file", "A forged title"));
  const again = await openDashboard({ server: await server(repo), caches });
  assert.deepEqual(files(again.requests), [UC1]);
  assert.doesNotMatch(again.main(), /A forged title/);
  assert.equal(kept.get(key), repo[UC1], "the kept text is replaced by the one read");
});

test("without Cache Storage the page still works; it reads every file it shows", async () => {
  const repo = await product();
  const first = await openDashboard({ server: await server(repo), caches: null });
  const again = await openDashboard({ server: await server(repo), caches: null });
  assert.deepEqual(files(again.requests), files(first.requests));
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
