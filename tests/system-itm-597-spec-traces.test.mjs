// What an opened requirement shows beside its four fields, through the dashboard's #spec (ITM-597, ITM-648): what traces to it and the open proposals
// that touch it are read when it is opened and not when the tree is drawn, and kept for every later opening.
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// Level: system
//
// The page is the real #spec of the dashboard on the harness's repository server, which counts every request it answers. A page without a
// token reads each file of a public repository from GitHub's raw host, so a request `file <path>` is the read of that file; with a token the
// harness answers GitHub's batch query from the fixture's files. The expected requests are written in each case.

import assert from "node:assert/strict";
import test from "node:test";
import { TOKEN, openDashboard, repoServer } from "./app-harness.mjs";

const TICK = "`";
const SPEC = [
  "# Traces fixture", "", "## A section", "",
  "**TRACED RULE** *(Source)*", "The traced rule.", `*Check:* ${TICK}tests/traced.test.mjs${TICK}`, "",
].join("\n");
const UC = ["---", "id: UC-001", "title: Traced use case", "realises:", "  - TRACED RULE", "---", "# UC-001 Traced use case", ""].join("\n");
const MODULE = ["---", "id: MOD-traced", "title: Traced module", "folder: src/traced/", "realises:", "  - TRACED RULE", "---", "# MOD-traced Traced module", ""].join("\n");
const TEST = ["// TST-601", "// level: unit", "// module: MOD-traced", "// guards: TRACED RULE", ""].join("\n");
const QUEUE = "2026-10-09_traced";
const ENTRY = ["## A section", "", "**TRACED RULE** *(Source)*", "The traced rule, changed.", `*Check:* ${TICK}tests/traced.test.mjs${TICK}`, ""].join("\n");
const FILES = {
  "SPEC.md": SPEC,
  "docs/use-cases/UC-001-traced.md": UC,
  "docs/architecture/MOD-traced.md": MODULE,
  "tests/traced.test.mjs": TEST,
  [`docs/spec-freigaben/${QUEUE}/index.md`]: [`# SPEC approvals — queue 2026-10-09 · traced`, "", `**Zieldatei aller Einträge:** ${TICK}SPEC.md${TICK}`, "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", `| 01 | ${TICK}SPEC.md${TICK} | ## A section | — | — |`, ""].join("\n"),
  [`docs/spec-freigaben/${QUEUE}/entscheidungen.md`]: "# Decisions — queue 2026-10-09 traced\n\nAppend-only.\n",
  [`docs/spec-freigaben/${QUEUE}/01-entry.md`]: ENTRY,
};
const ARTIFACTS = ["file docs/use-cases/UC-001-traced.md", "file docs/architecture/MOD-traced.md", "file tests/traced.test.mjs"];

// CASE ITM-597-SYSTEM-01
// TST-597201 · level: system · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the dashboard without a token on a repository holding SPEC.md, a use case, a module file and a test file, which name TRACED RULE
// input: the real #spec drawn; its requirement opened; closed; opened again
// expect: drawing requests none of the three artifact files; opening requests each of them (known positive: the page shows UC-001, MOD-traced and TST-601 as links); closing and opening again request nothing
test("the dashboard reads the artifacts when a requirement is opened, not when #spec is drawn, and not again on the next opening", async () => {
  const server = await repoServer({ files: FILES });
  const page = await openDashboard({ server, hash: "#spec", token: null });
  for (const artifact of ARTIFACTS) assert.ok(!page.requests.includes(artifact), `drawing #spec does not request ${artifact}`);
  const opening = await page.click("button.requirement-name");
  for (const artifact of ARTIFACTS) assert.ok(opening.includes(artifact), `opening the requirement requests ${artifact}`);
  for (const link of ['href="#use-case/id=UC-001"', 'href="#module/id=MOD-traced"', 'href="#trace/key=tests/row=TST-601"']) assert.ok(page.main().includes(link), `the page links ${link}`);
  assert.deepEqual(await page.click("button.requirement-name"), [], "closing requests nothing");
  assert.deepEqual(await page.click("button.requirement-name"), [], "opening again requests nothing");
  assert.deepEqual(server.writes, []);
});

// CASE ITM-597-SYSTEM-02
// TST-597202 · level: system · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the dashboard with a stored token on the same repository, whose queue 2026-10-09_traced holds an open entry that changes TRACED RULE
// input: the real #spec drawn; its requirement opened
// expect: the page links UC-001 (known positive) and lists the open entry, "spec-2026-10-09_traced-01 — changed (open)", linked to #spec-entry/id=spec-2026-10-09_traced-01; opening requests the queue's index and its decisions one file each and the entry's proposal in a batch, not as a file; the artifacts and the proposal were read in two batch queries, fewer requests than files
test("the dashboard reads the artifacts in batches when a requirement is opened, and the queue's files with them", async () => {
  const graphql = async (url, init) => {
    if (url.pathname !== "/graphql") return null;
    const repository = {};
    for (const match of JSON.parse(init.body).query.matchAll(/(f\d+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)) {
      const path = JSON.parse(match[2]).split(":").slice(1).join(":");
      repository[match[1]] = path in FILES ? { text: FILES[path], isTruncated: false } : null;
    }
    return new Response(JSON.stringify({ data: { repository } }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  const server = await repoServer({ files: FILES, handlers: [graphql] });
  const page = await openDashboard({ server, hash: "#spec", token: TOKEN });
  const opening = await page.click("button.requirement-name");
  const html = page.main();
  assert.ok(html.includes('href="#use-case/id=UC-001"'), "known positive: the traces are shown");
  assert.ok(html.includes('href="#spec-entry/id=spec-2026-10-09_traced-01"'), "the open entry is linked");
  assert.ok(html.includes("— changed (open)"), "its impact kind and state are shown");
  assert.deepEqual(opening.filter((request) => request.includes("spec-freigaben")).sort(),
    [`file docs/spec-freigaben/${QUEUE}/entscheidungen.md`, `file docs/spec-freigaben/${QUEUE}/index.md`]);
  const batches = opening.filter((request) => request.startsWith("handler POST"));
  assert.equal(batches.length, 2, "one batch query for the artifacts and one for the proposal");
  assert.ok(batches.length < Object.keys(FILES).length, `${batches.length} batch queries for ${Object.keys(FILES).length} files`);
  assert.deepEqual(server.writes, []);
});

// CASE ITM-648-SYSTEM-01
// TST-648201 · level: system · module: MOD-trace-pages
// guards: UC-020; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// given: the dashboard without a token on the same repository, whose queue 2026-10-09_traced holds an open entry that changes TRACED RULE
// input: the real #spec drawn; its requirement opened; closed; opened again
// expect (the page's load already requests the queue's index and decisions, and opening requests them again): opening requests the queue's index, its decisions and the entry's proposal, one file each and none twice (known positive: the page links UC-001 and the entry, "spec-2026-10-09_traced-01 — changed (open)", to #spec-entry/id=spec-2026-10-09_traced-01); closing and opening again request nothing
test("the dashboard reads the queue's three files once when a requirement is opened, and nothing on reopening", async () => {
  const server = await repoServer({ files: FILES });
  const page = await openDashboard({ server, hash: "#spec", token: null });
  const opening = await page.click("button.requirement-name");
  assert.deepEqual(opening.filter((request) => request.includes("spec-freigaben")).sort(),
    [`file docs/spec-freigaben/${QUEUE}/01-entry.md`, `file docs/spec-freigaben/${QUEUE}/entscheidungen.md`, `file docs/spec-freigaben/${QUEUE}/index.md`]);
  const html = page.main();
  assert.ok(html.includes('href="#use-case/id=UC-001"'), "known positive: the traces are shown");
  assert.ok(html.includes('href="#spec-entry/id=spec-2026-10-09_traced-01"'), "the open entry is linked");
  assert.ok(html.includes("— changed (open)"), "its impact kind and state are shown");
  assert.deepEqual(await page.click("button.requirement-name"), [], "closing requests nothing");
  assert.deepEqual(await page.click("button.requirement-name"), [], "opening again requests nothing");
  assert.deepEqual(server.writes, []);
});
