// Architecture on the review dashboard — deterministic, no network. Run: node --test tests/
//
// SPEC §11 ONE ARCHITECTURE DECISION, ONE FILE · ONE MODULE, ONE FILE · ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS ·
// AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; §10 ONE REVIEW LAYOUT FOR EVERY PRODUCT · ACCEPTANCE IS
// A COMMIT BY THE ACCEPTING PERSON · AN APPROVAL NAMES THE EXACT TEXT · STATUS IS DERIVED FROM THE RECORDS · SEVERAL FILES
// ARE ACCEPTED IN ONE CLICK · A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT · A SAVE IS REFUSED WHEN THE TEXT
// CHANGED MEANWHILE · AN EDITED FILE KEEPS ITS IDENTIFIER · GITLAB PRODUCTS ARE SUPPORTED (UC-022 step 8, 10, 10a;
// UC-023 steps 4–5, 4a–4c).
//
// The product is the fixture under tests/fixtures/architecture/. Counter-proofs are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md §8.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  gitBlobSha, recordsForId, approvalPath, recordText, parseRecord, reviewedRecord,
  deriveReviewedStatus, deriveUseCaseStatus, architecturePrerequisites,
  prerequisitesHtml, impactHtml,
  acceptItems, planAcceptance, createReviewSession, saveReviewedFile, lastAccepted, changedLines,
  useCaseRecord,
} from "../docs/assets/review-core.mjs";
import {
  reviewedId, kindOfPath, parseArchitecture, specRequirements, isCodePath, isTestPath, headerModules, ARCHITECTURE_FILE,
} from "../docs/assets/artifacts.mjs";
import { moduleHeaders, impactList, componentDiagram } from "../docs/assets/traceability.mjs";
import { parseProductAddress } from "../docs/assets/git-host.mjs";

const FIX = fileURLToPath(new URL("./fixtures/architecture/", import.meta.url));
const files = {};
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p); else files[relative(FIX, p).split("\\").join("/")] = readFileSync(p, "utf8");
  }
})(FIX);
const ARC = "docs/architecture/ARC-001-static-client.md", READER = "docs/architecture/MOD-reader.md";
const REVIEW = "docs/architecture/MOD-review.md", PAGE = "docs/architecture/MOD-page.md";
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md";
const archPaths = [ARC, READER, REVIEW, PAGE];
const click = { isTrusted: true };
const WHEN = new Date("2026-09-30T16:00:00Z");

async function withFetch(mock, f) {
  const real = globalThis.fetch;
  globalThis.fetch = mock;
  try { return await f(); } finally { globalThis.fetch = real; }
}

// A GitHub git-data API with branch main at c0; records the tree it is asked to commit.
function fakeGitHub(blobs = {}) {
  const calls = [];
  const fetchMock = async (u, init) => {
    const url = new URL(u), m = init.method, path = url.pathname;
    calls.push([m, path, init.headers?.Authorization, init.body ? JSON.parse(init.body) : null]);
    const ok = (o) => new Response(JSON.stringify(o), { status: 200 });
    if (m === "GET" && path.endsWith("/git/ref/heads/main")) return ok({ object: { sha: "c0" } });
    if (m === "GET" && path.endsWith("/git/commits/c0")) return ok({ tree: { sha: "t0" } });
    if (m === "GET" && path.includes("/contents/")) {
      const p = decodeURIComponent(path.split("/contents/")[1]);
      return p in blobs ? ok({ sha: blobs[p] }) : new Response("{}", { status: 404 });
    }
    if (m === "POST" && path.endsWith("/git/trees")) return ok({ sha: "t1" });
    if (m === "POST" && path.endsWith("/git/commits")) return ok({ sha: "c1", html_url: "https://github.com/a/b/commit/c1" });
    if (m === "PATCH" && path.endsWith("/git/refs/heads/main")) return ok({ object: { sha: "c1" } });
    return new Response("{}", { status: 500 });
  };
  return { calls, fetchMock };
}
const treeOf = (calls) => Object.fromEntries((calls.find(([m, p]) => m === "POST" && p.endsWith("/git/trees"))?.[3].tree ?? [])
  .map((f) => [f.path, f.content]));

// The use cases as the app holds them: path, blob, status, and the record naming the current text.
async function ucRecordFiles(which = [UC1, UC2]) {
  const out = {};
  for (const p of which) {
    const blob = await gitBlobSha(files[p]);
    out[approvalPath(reviewedId(p), blob)] = recordText(useCaseRecord(p, blob));
  }
  return out;
}
async function useCasesOf(repo) {
  const records = Object.entries(repo).filter(([p]) => p.startsWith("docs/approvals/")).map(([p, t]) => ({ ...parseRecord(t), _path: p }));
  return Promise.all([UC1, UC2].filter((p) => p in repo).map(async (p) => {
    const blob = await gitBlobSha(repo[p]);
    const status = deriveUseCaseStatus(p, blob, records);
    const record = records.find((r) => r.kind === "use-case" && r.file === p && r.blob === blob)?._path ?? null;
    return { id: reviewedId(p), path: p, blob, status, record };
  }));
}
const readerOf = (repo) => async (_head, p) => (p in repo ? repo[p] : null);

// ---------------------------------------------------------------- identifiers, records, status

test("ONE REVIEW LAYOUT FOR EVERY PRODUCT — ARC and MOD files are reviewed files with identifiers from their names", () => {
  assert.equal(reviewedId(ARC), "ARC-001");
  assert.equal(reviewedId("docs/architecture/ARC-001-renamed-since.md"), "ARC-001");
  assert.equal(reviewedId(READER), "MOD-reader");
  assert.equal(reviewedId("docs/architecture/MOD-review-core.md"), "MOD-review-core", "the whole slug is the identifier");
  assert.equal(reviewedId("docs/architecture/MOD-123-x.md"), "MOD-123-x", "a module is not read as an ARC-like number");
  assert.equal(reviewedId("docs/architecture/README.md"), null);
  assert.equal(kindOfPath(ARC), "architecture-decision");
  assert.equal(kindOfPath(READER), "module");
  assert.equal(kindOfPath(UC1), "use-case");
  assert.equal(kindOfPath("docs/architecture/notes.md"), null);
  assert.equal(approvalPath("MOD-reader", "0123456789ab".padEnd(40, "0")), "docs/approvals/MOD-reader-0123456789ab.md");
  const r = reviewedRecord(READER, "b".repeat(40));
  assert.deepEqual(r, { kind: "module", file: READER, blob: "b".repeat(40) });
  assert.equal(recordText(r), `kind: module\nfile: ${READER}\nblob: ${"b".repeat(40)}\n`, "the three lines of a use case's record");
  assert.equal(reviewedRecord(ARC, "a".repeat(40)).kind, "architecture-decision");
  assert.throws(() => reviewedRecord("docs/architecture/notes.md", "a".repeat(40)), /reviewed file/);
  // Records of MOD-reader are found by identifier; MOD-reader-extra's are not MOD-reader's.
  const recs = [reviewedRecord(READER, "a".repeat(40)), reviewedRecord("docs/architecture/MOD-reader-extra.md", "b".repeat(40)),
    reviewedRecord(ARC, "c".repeat(40))];
  assert.deepEqual(recordsForId(recs, "MOD-reader"), [recs[0]]);
  assert.deepEqual(recordsForId(recs, "ARC-001"), [recs[2]]);
});

test("STATUS IS DERIVED FROM THE RECORDS — ARC and MOD: open, accepted, changed; only records of their own kind count", async () => {
  const b = await gitBlobSha(files[READER]);
  assert.equal(deriveReviewedStatus(READER, b, []), "open");
  assert.equal(deriveReviewedStatus(READER, b, [reviewedRecord(READER, b)]), "accepted");
  assert.equal(deriveReviewedStatus(READER, b, [reviewedRecord(READER, "e".repeat(40))]), "changed");
  // Counter-proof: a record of another kind naming the same path and text does not accept it.
  assert.equal(deriveReviewedStatus(READER, b, [{ kind: "use-case", file: READER, blob: b }]), "open");
  assert.equal(deriveReviewedStatus(UC1, b, [reviewedRecord(UC1, b)]), "accepted", "use cases derive the same way");
});

// ---------------------------------------------------------------- the format

test("parseArchitecture — a decision: id, title, forced_by, and its four sections", () => {
  const a = parseArchitecture(ARC, files[ARC]);
  assert.equal(a.kind, "architecture-decision");
  assert.equal(a.id, "ARC-001");
  assert.equal(a.title, "The dashboard is a static client of the Git server's API");
  assert.deepEqual(a.names, ["RULE ONE", "UC-001"]);
  assert.deepEqual(a.requirements, ["RULE ONE"]);
  assert.deepEqual(a.useCases, ["UC-001"]);
  assert.deepEqual(a.follows, []);
  assert.deepEqual(a.problems, []);
  assert.ok(a.problems.length === 0);
  assert.match(parseArchitecture(ARC, files[ARC].replace("  - RULE ONE\n  - UC-001\n", "")).problems.join(" "), /forced_by must name at least one/,
    "a decision names what forces it");
  const broken = parseArchitecture(ARC, files[ARC].replace("## Alternatives\n", ""));
  assert.match(broken.problems.join(" "), /Alternatives/);
});

test("parseArchitecture — a module: realises, follows, uses MOD-x.interface, provides, each interface described", () => {
  const m = parseArchitecture(REVIEW, files[REVIEW]);
  assert.equal(m.kind, "module");
  assert.equal(m.id, "MOD-review");
  assert.deepEqual(m.names, ["THE READER'S RULE", "UC-002"]);
  assert.deepEqual(m.follows, ["ARC-001"]);
  assert.deepEqual(m.uses, [{ module: "MOD-reader", iface: "readFile" }, { module: "MOD-reader", iface: "listTree" },
    { module: "MOD-store", iface: "load" }]);
  assert.deepEqual(m.provides, ["status"]);
  assert.equal(m.interfaces.status, "- `status(path) -> \"open\" | \"accepted\" | \"changed\"`\n  — derived, never stored.");
  assert.deepEqual(m.problems, []);
  const page = parseArchitecture(PAGE, files[PAGE]);
  assert.deepEqual([page.names, page.follows, page.provides, page.problems], [[], [], [], []], "empty lists are lists");
  // Counter-proof: a use of an interface not written MOD-x.name, and a provided interface nobody describes.
  assert.ok(parseArchitecture(REVIEW, files[REVIEW].replace("  - MOD-reader.readFile\n", "  - readFile\n")).problems.length);
  assert.ok(parseArchitecture(REVIEW, files[REVIEW].replace("  - status\n", "  - status\n  - history\n")).problems.length);
  assert.ok(parseArchitecture("docs/architecture/MOD-other.md", files[REVIEW]).problems.length, "id differs from the file name");
});

// ---------------------------------------------------------------- ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS

test("specRequirements — the names in SPEC.md; a withdrawn one is marked; prose in bold is no requirement", () => {
  const r = specRequirements(files["SPEC.md"]);
  assert.deepEqual([...r.keys()], ["RULE ONE", "THE READER'S RULE", "OLD RULE"]);
  assert.deepEqual([...r.values()].map((x) => x.withdrawn), [false, false, true],
    "a source that runs over two lines is read whole — OLD RULE's withdrawal stands on its second line");
  // The known positive: every requirement a use case of this repository realises is found in its SPEC.
  const real = specRequirements(readFileSync(new URL("../SPEC.md", import.meta.url), "utf8"));
  assert.ok(real.size > 250);
  assert.ok(real.get("ACCEPTANCE IS A COMMIT IN GITHUB").withdrawn);
  assert.equal(real.get("ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON").withdrawn, false);
  assert.equal(real.get("A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED").withdrawn, false, "WITHDRAWN in the name is not a withdrawal");
});

test("ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — every named requirement in the SPEC, every named use case accepted", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const useCases = await useCasesOf(repo);
  const ok = architecturePrerequisites({ arch: parseArchitecture(ARC, files[ARC]), specText: files["SPEC.md"], useCases });
  assert.deepEqual(ok.open, []);
  assert.deepEqual(ok.useCases.map((u) => u.id), ["UC-001"], "the accepted use cases the file rests on, with their records");
  assert.ok(ok.useCases[0].record && ok.useCases[0].blob);
  // UC-022 10a / UC-023 4b: each open item is named.
  const open = (text, ucs = useCases) => architecturePrerequisites({ arch: parseArchitecture(ARC, text), specText: files["SPEC.md"], useCases: ucs }).open;
  assert.deepEqual(open(files[ARC].replace("  - RULE ONE\n", "  - OLD RULE\n")).map((o) => o.name), ["OLD RULE"]);
  assert.match(open(files[ARC].replace("  - RULE ONE\n", "  - OLD RULE\n"))[0].reason, /withdrawn/);
  assert.deepEqual(open(files[ARC].replace("  - RULE ONE\n", "  - NO SUCH RULE\n")).map((o) => o.name), ["NO SUCH RULE"]);
  assert.match(open(files[ARC].replace("  - RULE ONE\n", "  - NO SUCH RULE\n"))[0].reason, /not in SPEC\.md/);
  assert.deepEqual(open(files[ARC].replace("  - UC-001\n", "  - UC-009\n")).map((o) => o.name), ["UC-009"]);
  const changedUc = useCases.map((u) => (u.id === "UC-001" ? { ...u, status: "changed", record: null } : u));
  assert.deepEqual(open(files[ARC], changedUc).map((o) => [o.name, o.reason]), [["UC-001", "changed since it was accepted"]]);
  const openUc = useCases.map((u) => (u.id === "UC-001" ? { ...u, status: "open", record: null } : u));
  assert.deepEqual(open(files[ARC], openUc).map((o) => [o.name, o.reason]), [["UC-001", "not accepted yet"]]);
  // A module's `realises` counts the same; `follows` (decisions) is not a prerequisite of the rule.
  assert.deepEqual(architecturePrerequisites({ arch: parseArchitecture(REVIEW, files[REVIEW]), specText: files["SPEC.md"], useCases }).open, []);
});

test("ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — the blocked panel: Accept disabled, every open item named, explained", () => {
  const html = prerequisitesHtml([{ name: "UC-001", reason: "not accepted yet" }, { name: "OLD RULE", reason: "withdrawn in SPEC.md" }]);
  assert.match(html, /<button[^>]*disabled[^>]*>Accept<\/button>/);
  assert.match(html, /UC-001/);
  assert.match(html, /OLD RULE/);
  assert.match(html, /withdrawn in SPEC\.md/);
  assert.match(html, /<details class="explain"><summary>What is this\?<\/summary>/);
  assert.doesNotMatch(html, /data-accept-key|data-tick/, "nothing that could accept or tick");
  assert.equal(prerequisitesHtml([]), "", "nothing open, nothing blocked");
});

// ---------------------------------------------------------------- accepting

async function archItem(path, text, repo, extra = {}) {
  const arch = parseArchitecture(path, text);
  const pre = architecturePrerequisites({ arch, specText: repo["SPEC.md"], useCases: await useCasesOf(repo) });
  return { kind: arch.kind, id: arch.id, path, blob: await gitBlobSha(text), requires: pre.useCases, ...extra };
}

test("ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON — accepting an ARC and a MOD in one click: one commit, one record each", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const s = createReviewSession();
  const a = await archItem(ARC, files[ARC], repo), m = await archItem(READER, files[READER], repo);
  s.show(a); s.show(m);
  assert.equal(s.tick(s.key(a), true), true);
  assert.equal(s.tick(s.key(m), true), true);
  assert.equal(s.tick("uc:" + REVIEW, true), false, "a file that was not shown cannot be ticked");
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: s.items(), readAt: readerOf(repo), now: WHEN }));
  assert.deepEqual(res.leftOut, []);
  assert.deepEqual(res.accepted, ["ARC-001", "MOD-reader"]);
  const tree = treeOf(g.calls);
  assert.deepEqual(Object.keys(tree).sort(), [approvalPath("ARC-001", a.blob), approvalPath("MOD-reader", m.blob)].sort());
  assert.equal(tree[approvalPath("ARC-001", a.blob)], recordText(reviewedRecord(ARC, a.blob)));
  assert.equal(tree[approvalPath("MOD-reader", m.blob)], `kind: module\nfile: ${READER}\nblob: ${m.blob}\n`);
  assert.equal(g.calls.filter(([mm, p]) => mm === "POST" && p.endsWith("/git/commits")).length, 1);
  assert.ok(g.calls.every(([, , auth]) => auth === "Bearer github_pat_t"));
});

test("ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — checked again on the commit written on: a use case changed or a requirement withdrawn meanwhile leaves the file out", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const a = await archItem(ARC, files[ARC], repo);
  // Meanwhile on the branch: UC-001 edited (no record names its new text).
  for (const [over, why] of [
    [{ [UC1]: files[UC1] + "edited\n" }, /UC-001/],
    [{ "SPEC.md": files["SPEC.md"].replace("**RULE ONE** *(PO, 2026-09-30)*", "**RULE ONE** *(PO, 2026-09-30 — withdrawn 2026-10-01)*") }, /RULE ONE/],
    [{ "SPEC.md": files["SPEC.md"].replace("**RULE ONE**", "**RULE 1**") }, /RULE ONE/],
  ]) {
    const g = fakeGitHub();
    const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
      items: [a], readAt: readerOf({ ...repo, ...over }), now: WHEN }));
    assert.equal(res.commit, null, String(why));
    assert.deepEqual(res.leftOut.map((l) => l.label), ["ARC-001"]);
    assert.match(res.leftOut[0].reason, why);
    assert.ok(!g.calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  }
  // An item that carries no accepted use case for a UC its text names is left out too (the text decides, not the item).
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [{ ...a, requires: [] }], readAt: readerOf(repo), now: WHEN }));
  assert.equal(res.commit, null);
  assert.match(res.leftOut[0].reason, /UC-001/);
});

test("AN APPROVAL NAMES THE EXACT TEXT — an ARC changed after it was shown is left out and named", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const a = await archItem(ARC, files[ARC], repo), m = await archItem(READER, files[READER], repo);
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [a, m], readAt: readerOf({ ...repo, [ARC]: files[ARC] + "more\n" }), now: WHEN }));
  assert.deepEqual(Object.keys(treeOf(g.calls)), [approvalPath("MOD-reader", m.blob)]);
  assert.deepEqual(res.leftOut.map((l) => l.label), ["ARC-001"]);
  assert.match(res.leftOut[0].reason, /changed after it was shown/);
});

test("AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a changed file whose impact list was not shown is left out", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const m = await archItem(READER, files[READER], repo, { changed: true });
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [m], readAt: readerOf(repo), now: WHEN }));
  assert.equal(res.commit, null);
  assert.match(res.leftOut[0].reason, /impact list/);
  // Counter-proof: shown with its impact list, it is accepted.
  const g2 = fakeGitHub();
  const res2 = await withFetch(g2.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [{ ...m, impactShown: true }], readAt: readerOf(repo), now: WHEN }));
  assert.deepEqual(res2.accepted, ["MOD-reader"]);
});

test("GITLAB PRODUCTS ARE SUPPORTED — an architecture file is accepted on GitLab by one commit with its project token", async () => {
  const GL = "https://gitlab.example.org", project = "grp/sub/proj", TOKEN = "glpat-projectTOKENvalue0123456789";
  const p = parseProductAddress(`${GL}/${project}`);
  const repo = { ...files, ...(await ucRecordFiles()) };
  const m = await archItem(READER, files[READER], repo);
  const calls = [], base = `/api/v4/projects/${encodeURIComponent(project)}`, H0 = "a".repeat(40);
  const ok = (o, status = 200) => new Response(JSON.stringify(o), { status });
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), rest = url.pathname.slice(base.length), method = (init.method || "GET").toUpperCase();
    calls.push({ origin: url.origin, method, rest, token: init.headers?.["PRIVATE-TOKEN"], auth: init.headers?.Authorization,
      body: init.body ? JSON.parse(init.body) : null });
    if (rest === "/repository/branches/main") return ok({ name: "main", commit: { id: H0 } });
    if (rest.startsWith("/repository/files/")) return ok({ message: "404 File Not Found" }, 404);
    if (rest === "/repository/commits" && method === "POST") return ok({ id: "c".repeat(40), parent_ids: [H0], web_url: `${GL}/${project}/-/commit/c` }, 201);
    return ok({ message: "unexpected" }, 500);
  };
  const res = await withFetch(fetchMock, () => acceptItems({ product: p, branch: "main", token: TOKEN, click, items: [m],
    readAt: readerOf(repo), now: WHEN }));
  assert.deepEqual(res.accepted, ["MOD-reader"]);
  const post = calls.filter((c) => c.method === "POST");
  assert.equal(post.length, 1);
  assert.deepEqual(post[0].body.actions, [{ action: "create", file_path: approvalPath("MOD-reader", m.blob),
    content: recordText(reviewedRecord(READER, m.blob)), encoding: "text" }]);
  assert.ok(calls.every((c) => c.origin === GL && c.token === TOKEN && c.auth === undefined), "only its server, only its token");
});

// ---------------------------------------------------------------- editing

test("AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD", async () => {
  const blob = await gitBlobSha(files[READER]);
  const edited = files[READER].replace("Reads the product's files", "Reads every file of the product");
  const g = fakeGitHub({ [READER]: blob });
  const c = await withFetch(g.fetchMock, () => saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    path: READER, text: edited, openedId: "MOD-reader", expectBlob: blob }));
  assert.equal(c.sha, "c1");
  assert.deepEqual(treeOf(g.calls), { [READER]: edited });
  // Refused: the identifier in the text is not the one the file was opened with — nothing is sent.
  for (const [text, id] of [[edited.replace("id: MOD-reader", "id: MOD-reader2"), "MOD-reader"],
    [files[ARC].replace("id: ARC-001", "id: ARC-002"), "ARC-001"], [edited.replace("id: MOD-reader\n", ""), "MOD-reader"]]) {
    const g2 = fakeGitHub({ [READER]: blob });
    await withFetch(g2.fetchMock, () => assert.rejects(saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", click,
      path: READER, text, openedId: id, expectBlob: blob }), /identifier/));
    assert.equal(g2.calls.length, 0, "nothing sent");
  }
  // Refused: the file on the branch is no longer the text the editor opened.
  const g3 = fakeGitHub({ [READER]: "f".repeat(40) });
  await withFetch(g3.fetchMock, () => assert.rejects(saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    path: READER, text: edited, openedId: "MOD-reader", expectBlob: blob }), /changed since/));
  assert.ok(!g3.calls.some(([m]) => m === "PATCH"), "nothing written");
  // A file without an identifier (a SPEC proposal) is saved without that check.
  const g4 = fakeGitHub({ "docs/spec-freigaben/q/01-a.md": "x" });
  await withFetch(g4.fetchMock, () => saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    path: "docs/spec-freigaben/q/01-a.md", text: "## 1\n", openedId: null, expectBlob: "x" }));
  assert.ok(g4.calls.some(([m]) => m === "PATCH"));
});

// ---------------------------------------------------------------- the impact list

test("module headers — `Module: MOD-x` in the first lines of a code file; tests told apart; Markdown and vendored code are not code", async () => {
  assert.deepEqual(headerModules(files["src/reader.js"]), ["MOD-reader"]);
  assert.deepEqual(headerModules(files["src/review.py"]), ["MOD-review"]);
  assert.deepEqual(headerModules(files["src/late.js"]), [], "a header after the first lines is not a header");
  assert.deepEqual(headerModules("/* Module: MOD-a */\n<!-- Module: MOD-b -->\n"), ["MOD-a", "MOD-b"]);
  assert.deepEqual(headerModules("const x = 'Module: MOD-a';\n"), [], "only a line that is a header, not a string in code");
  assert.ok(isCodePath("src/reader.js") && isCodePath("src/review.py") && isCodePath("docs/assets/review-core.mjs"));
  assert.ok(!isCodePath("src/notes.md") && !isCodePath("vendor/lib.js") && !isCodePath("node_modules/x/i.js")
    && !isCodePath("docs/assets/vendor/marked.esm.js") && !isCodePath("logo.png"));
  assert.ok(isTestPath("tests/reader.test.js") && isTestPath("tests/test_x.py") && isTestPath("src/x.spec.ts") && isTestPath("pkg/x_test.go"));
  assert.ok(isTestPath("tests/helpers.js") && isTestPath("pkg/__tests__/x.js"), "a file in a tests folder is a test");
  assert.ok(!isTestPath("src/reader.js") && !isTestPath("src/contest.js"));
  const read = [];
  const found = await moduleHeaders({ paths: Object.keys(files), read: async (p) => { read.push(p); return files[p]; } });
  assert.deepEqual(found, [
    { path: "src/reader.js", modules: ["MOD-reader"], test: false },
    { path: "src/review.py", modules: ["MOD-review"], test: false },
    { path: "tests/reader.test.js", modules: ["MOD-reader"], test: true },
  ]);
  assert.ok(!read.some((p) => p.endsWith(".md") || p.startsWith("vendor/")), "only code files are read");
});

const headersOf = () => moduleHeaders({ paths: Object.keys(files), read: async (p) => files[p] });
const modulesOf = (repo) => archPaths.map((p) => parseArchitecture(p, repo[p]));

test("AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a decision: the modules that follow it, their code and tests, names before and after", async () => {
  const before = parseArchitecture(ARC, files[ARC]);
  const text = files[ARC].replace("  - UC-001\n", "  - UC-002\n");
  const after = parseArchitecture(ARC, text);
  const imp = impactList({ before, after, modules: modulesOf({ ...files, [ARC]: text }), headers: await headersOf() });
  assert.deepEqual(imp.affected.map((a) => a.id), ["MOD-reader", "MOD-review"], "MOD-page follows nothing and is not listed");
  assert.deepEqual(imp.affected[0].code, ["src/reader.js"]);
  assert.deepEqual(imp.affected[0].tests, ["tests/reader.test.js"]);
  assert.deepEqual(imp.affected[1].code, ["src/review.py"]);
  assert.deepEqual(imp.affected[1].tests, []);
  assert.match(imp.affected[0].reasons.join(" "), /follows ARC-001/);
  assert.deepEqual(imp.names, { kept: ["RULE ONE"], added: ["UC-002"], removed: ["UC-001"] });
});

test("AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a module: users of an altered or removed interface, breaks first", async () => {
  const before = parseArchitecture(READER, files[READER]);
  // listTree removed, readFile altered.
  const text = files[READER].replace("  - listTree\n", "")
    .replace("- `listTree() -> [path]` — every file path at the pinned commit.\n", "")
    .replace("`readFile(path) -> text | null`", "`readFile(path, commit) -> text | null`");
  const after = parseArchitecture(READER, text);
  const imp = impactList({ before, after, modules: modulesOf({ ...files, [READER]: text }), headers: await headersOf() });
  assert.deepEqual(imp.removedInterfaces, ["listTree"]);
  assert.deepEqual(imp.alteredInterfaces, ["readFile"]);
  assert.deepEqual(imp.affected.map((a) => [a.id, a.breaks]), [["MOD-review", true], ["MOD-reader", false]],
    "the user of a removed interface first, marked breaks; then the changed module itself");
  assert.match(imp.affected[0].reasons.join(" "), /listTree, which the change removes/);
  assert.match(imp.affected[0].reasons.join(" "), /readFile, which the change alters/);
  assert.deepEqual(imp.affected[1].code, ["src/reader.js"]);
  assert.deepEqual(imp.names, { kept: ["RULE ONE", "UC-001"], added: [], removed: [] });
  const html = impactHtml(imp);
  assert.match(html, /MOD-review/);
  assert.match(html, /breaks/);
  assert.match(html, /src\/review\.py/);
  assert.match(html, /tests\/reader\.test\.js/);
  assert.match(html, /<details class="explain">/);
});

test("AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — counter-proof: a change to the text alone touches no user; no code is said so", async () => {
  const before = parseArchitecture(READER, files[READER]);
  const text = files[READER].replace("Reads the product's files, all at one commit.", "Reads files, all at one commit.");
  const imp = impactList({ before, after: parseArchitecture(READER, text), modules: modulesOf({ ...files, [READER]: text }),
    headers: await headersOf() });
  assert.deepEqual(imp.affected.map((a) => a.id), ["MOD-reader"], "MOD-review uses readFile, which did not change");
  assert.deepEqual([imp.removedInterfaces, imp.alteredInterfaces], [[], []]);
  // UC-023 4c: without code naming the module, the list says so.
  const none = impactList({ before, after: parseArchitecture(READER, text), modules: modulesOf(files), headers: [] });
  assert.deepEqual(none.affected[0].code, []);
  assert.match(impactHtml(none), /no code yet/);
});

// ---------------------------------------------------------------- the component diagram

test("the component diagram — computed from uses and provides; an interface nobody provides is drawn as missing", () => {
  const d = componentDiagram(modulesOf(files));
  assert.match(d, /^flowchart LR\n/);
  assert.match(d, /MOD_review -->\|"readFile"\| MOD_reader/);
  assert.match(d, /MOD_review -->\|"listTree"\| MOD_reader/);
  assert.match(d, /MOD_page -->\|"status"\| MOD_review/);
  assert.match(d, /MOD_review -.->\|"load"\| missing_\w+\["MOD-store\.load — missing"\]/);
  assert.match(d, /class missing_\w+ missing/);
  // Counter-proof: provided, it is not missing; an interface a module exists for but does not provide is.
  const store = parseArchitecture("docs/architecture/MOD-store.md", files[READER].replace(/MOD-reader/g, "MOD-store")
    .replace("  - readFile\n  - listTree\n", "  - load\n").replace(/- `readFile[^\n]*\n- `listTree[^\n]*\n/, "- `load()` — loads.\n"));
  assert.deepEqual(store.problems, []);
  const d2 = componentDiagram([...modulesOf(files), store]);
  assert.doesNotMatch(d2, /missing/);
  assert.match(d2, /MOD_review -->\|"load"\| MOD_store/);
  const d3 = componentDiagram(modulesOf({ ...files, [REVIEW]: files[REVIEW].replace("MOD-reader.listTree", "MOD-reader.listFiles") }));
  assert.match(d3, /MOD-reader\.listFiles — missing/);
  // A node shows its identifier and title; a title cannot break out of its label into a directive of its own.
  assert.match(d, /MOD_reader\["MOD-reader<br\/>Reads files at a pinned commit"\]/);
  const evil = componentDiagram([{ ...store, title: 'x"]\nclick MOD_store "javascript:alert(1)" <b>' }]);
  assert.doesNotMatch(evil, /x"|\nclick|<b>/);
  assert.match(evil, /x#quot;\] click MOD_store #quot;javascript:alert\(1\)#quot; #lt;b#gt;/);
});

// ---------------------------------------------------------------- the app

test("the dashboard has an Architecture tab that lists, reviews, accepts and edits ARC and MOD files like use cases", () => {
  const html = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
  assert.match(html, /<a href="#arc" role="tab" id="tab-arc">Architecture<\/a>/);
  const app = readFileSync(new URL("../docs/assets/review-app.mjs", import.meta.url), "utf8");
  assert.match(app, /paths\(ARCHITECTURE_FILE\)/, "the files are read by the core's pattern");
  assert.deepEqual(archPaths.concat(["docs/architecture/README.md", "docs/architecture/ARC-1-x.md", "docs/use-cases/UC-001-x.md",
    "docs/architecture/sub/MOD-x.md"]).filter((p) => ARCHITECTURE_FILE.test(p)), archPaths, "docs/architecture/ARC-<nnn>-<slug>.md and MOD-<slug>.md only");
  const view = app.match(/async function viewArchitectureFile\([\s\S]*?\n}\n/)[0];
  assert.match(app, /const prerequisitesOf = \(f\) => architecturePrerequisites\(/, "the gate is the core's");
  assert.ok(view.includes("prerequisitesOf(f)") && view.includes("prerequisitesHtml("), "the gate is part of the view");
  assert.ok(view.indexOf("prerequisitesHtml(") < view.indexOf("acceptPanel("), "while something is open, no accept panel");
  assert.ok(view.includes("accepted-diff"), "the difference to the last accepted text");
  assert.ok(view.includes("impact"), "the impact list beside it");
  assert.ok(view.includes("editPanel("), "the editor with preview");
  assert.ok(view.indexOf("accepted-diff") < view.indexOf('<article class="md doc">'), "the difference above the text");
  assert.match(app, /componentDiagram\(/);
  assert.match(app, /saveReviewedFile\(/);
  assert.doesNotMatch(app, /function (impactList|componentDiagram|parseArchitecture)\(/, "one implementation, in the core");
});
