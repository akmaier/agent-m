// Review core — deterministic, no network. Run: node --test tests/
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-23_review-dashboard-tests.md.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  gitBlobSha, parseFrontMatter, parseRecord, recordText, approvalPath, useCaseRecord,
  specRecord, newFileUrl, editUrl, extractSection, sectionText, parseQueueIndex, parseDecisions,
  deriveUseCaseStatus, deriveSpecStatus, fetchText, ALLOWED_ORIGINS, MAX_URL_VALUE,
} from "../docs/assets/review-core.mjs";

const gitHash = (s) => execFileSync("git", ["hash-object", "--stdin"], { input: s }).toString().trim();

test("gitBlobSha equals git hash-object, byte for byte", async () => {
  for (const s of ["", "a\n", "no trailing newline", "Umlaute äöü — und ✓\n", "x".repeat(5000)]) {
    assert.equal(await gitBlobSha(s), gitHash(s), JSON.stringify(s.slice(0, 20)));
  }
});

test("front matter: scalars and lists, body separated", () => {
  const { fields, body } = parseFrontMatter(
    "---\nid: UC-001\ntitle: Register a source\nrealises:\n  - NO SERVER\n  - A SOURCE DECLARES ITS AUTHORITY\n---\n# Body\n");
  assert.equal(fields.id, "UC-001");
  assert.deepEqual(fields.realises, ["NO SERVER", "A SOURCE DECLARES ITS AUTHORITY"]);
  assert.equal(body, "# Body\n");
  assert.deepEqual(parseFrontMatter("# no front matter\n").fields, {});
});

test("records round-trip and carry no text", () => {
  const r = useCaseRecord("docs/use-cases/UC-001-x.md", "a".repeat(40));
  assert.deepEqual(parseRecord(recordText(r)), r);
  assert.equal(approvalPath("UC-001", "0123456789abcdef".padEnd(40, "0")),
    "docs/approvals/UC-001-0123456789ab.md");
  const s = specRecord({ queue: "docs/spec-freigaben/q", entry: 1, proposal: "docs/spec-freigaben/q/01-a.md",
    blob: "b".repeat(40), target: "SPEC.md", anchor: "## 9. Human gates", section: "c".repeat(40) });
  assert.deepEqual(parseRecord(recordText(s)), s);
  assert.equal(s.entry, "01");
});

test("NO TEXT TRAVELS IN A URL: long values are refused", () => {
  const u = newFileUrl("akmaier/agent-m", "main", "docs/approvals/x.md", "kind: use-case\n");
  assert.match(u, /^https:\/\/github\.com\/akmaier\/agent-m\/new\/main\?filename=docs%2Fapprovals%2Fx\.md&value=kind%3A/);
  assert.throws(() => newFileUrl("a/b", "main", "p.md", "x".repeat(MAX_URL_VALUE + 1)), /URL/);
  assert.equal(editUrl("a/b", "main", "docs/use-cases/UC-001 x.md"),
    "https://github.com/a/b/edit/main/docs/use-cases/UC-001%20x.md");
});

test("extractSection: heading to next heading of same level, code fences masked", () => {
  const spec = "# T\n\n## 1. A\ntext\n```\n## not a heading\n```\n### sub\nmore\n## 2. B\nb\n";
  const s = extractSection(spec, "## 1. A");
  assert.equal(sectionText(s), "## 1. A\ntext\n```\n## not a heading\n```\n### sub\nmore\n");
  assert.match(extractSection(spec, "## 3. C").error, /0 times/);
  assert.match(extractSection(spec + "## 1. A\n", "## 1. A").error, /2 times/);
  assert.equal(sectionText(extractSection(spec, "## 2. B")), "## 2. B\nb\n");
  assert.equal(sectionText(extractSection(spec, "## 1. A", "### sub")), "## 1. A\ntext\n```\n## not a heading\n```\n");
});

test("sectionText is the same bytes the Python applier hashes", async () => {
  const spec = readFileSync(new URL("./fixtures/spec.md", import.meta.url), "utf8");
  const py = execFileSync("python3", ["-c",
    "import sys; sys.path.insert(0,'tools'); import apply_approvals as a;" +
    "t=open('tests/fixtures/spec.md').read(); print(a.blob_sha(a.section_text(a.extract_section(t,'## 1. First'))))"]).toString().trim();
  assert.equal(await gitBlobSha(sectionText(extractSection(spec, "## 1. First"))), py);
});

test("queue index and decisions parse like scripts/spec_dashboard.py", () => {
  const idx = parseQueueIndex("x\n**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`\n\n| Nr | Datei | Anker | bis | Commits |\n|---|---|---|---|---|\n| 01 | `SPEC.md` | ## 9. Human gates | — | — |\n| 02 | `SPEC.md` | ## 2. X | ## 3. Y | — |\n");
  assert.equal(idx.target, "products/agent-m/SPEC.md");
  assert.deepEqual(idx.entries.map(e => [e.nr, e.anchor, e.bis]), [[1, "## 9. Human gates", null], [2, "## 2. X", "## 3. Y"]]);
  const d = parseDecisions("# D\n| 2026-09-23 21:53 | 1 | uebernommen | e2ce99d |\n| 2026-09-23 22:00 | 1 | zurueckgestellt | — |\n");
  assert.equal(d.get(1).decision, "zurueckgestellt");
});

test("STATUS IS DERIVED FROM THE RECORDS: use cases", () => {
  const rec = (blob) => useCaseRecord("docs/use-cases/UC-001-x.md", blob);
  const f = "docs/use-cases/UC-001-x.md";
  assert.equal(deriveUseCaseStatus(f, "a".repeat(40), []), "open");
  assert.equal(deriveUseCaseStatus(f, "a".repeat(40), [rec("a".repeat(40))]), "accepted");
  assert.equal(deriveUseCaseStatus(f, "b".repeat(40), [rec("a".repeat(40))]), "changed");
  assert.equal(deriveUseCaseStatus(f, "a".repeat(40), [useCaseRecord("docs/use-cases/UC-002-y.md", "a".repeat(40))]), "open");
});

test("STATUS IS DERIVED FROM THE RECORDS: SPEC proposals", () => {
  const base = { queue: "q", nr: 1, proposalPath: "q/01-a.md", proposalText: "## 9. G\nnew\n",
    proposalBlob: "p".repeat(40), sectionBlob: "s".repeat(40), specText: "## 9. G\nold\n", decisions: new Map(), records: [] };
  const rec = (o = {}) => specRecord({ queue: "q", entry: 1, proposal: "q/01-a.md", blob: "p".repeat(40),
    target: "SPEC.md", anchor: "## 9. G", section: "s".repeat(40), ...o });
  assert.equal(deriveSpecStatus(base), "open");
  assert.equal(deriveSpecStatus({ ...base, records: [rec()] }), "approved");
  assert.equal(deriveSpecStatus({ ...base, records: [rec({ blob: "x".repeat(40) })] }), "stale");
  assert.equal(deriveSpecStatus({ ...base, records: [rec({ section: "x".repeat(40) })] }), "stale");
  const done = new Map([[1, { decision: "uebernommen" }]]);
  assert.equal(deriveSpecStatus({ ...base, decisions: done, specText: "x\n## 9. G\nnew\n" }), "applied");
  assert.equal(deriveSpecStatus({ ...base, decisions: done }), "superseded");
});

test("THE REVIEW DASHBOARD USES THE TOKEN ONLY TO READ · THE TOKEN IS SENT ONLY TO GITHUB", async () => {
  await assert.rejects(fetchText("https://example.org/x"), /origin/);
  await assert.rejects(fetchText("https://api.github.com/x", { method: "PUT" }), /GET/);
  await assert.rejects(fetchText("https://api.github.com/x", { method: "POST" }, "t"), /GET/);
  await assert.rejects(fetchText("https://raw.githubusercontent.com/a/b/c", {}, "github_pat_11ABCDEF"), /token may only go/);
  await assert.rejects(fetchText("https://api.github.com/x", { headers: { Authorization: "Bearer x" } }), /header/);
  await assert.rejects(fetchText("https://api.github.com/x", { credentials: "include" }), /credential/);
  assert.deepEqual([...ALLOWED_ORIGINS].sort(), ["https://api.github.com", "https://raw.githubusercontent.com"]);
  // The one allowed way: GET to the API with the stored token, header built by fetchText itself.
  const seen = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (u, init) => { seen.push([String(u), init.method, init.headers.Authorization]); return new Response("ok"); };
  try {
    assert.equal(await fetchText("https://api.github.com/repos/a/b", {}, "github_pat_t"), "ok");
    assert.equal(await fetchText("https://raw.githubusercontent.com/a/b/c/d"), "ok");
  } finally { globalThis.fetch = realFetch; }
  assert.deepEqual(seen, [["https://api.github.com/repos/a/b", "GET", "Bearer github_pat_t"],
    ["https://raw.githubusercontent.com/a/b/c/d", "GET", undefined]]);
});

test("the app never calls fetch directly — every request goes through fetchText", () => {
  const app = readFileSync(new URL("../docs/assets/review-app.mjs", import.meta.url), "utf8");
  const FORBIDDEN = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|\b(globalThis|window|self)\s*\.\s*(localStorage|sessionStorage)\b|\b(localStorage|sessionStorage)\s*[.[]|document\.cookie/;
  assert.doesNotMatch(app.replace(/fetchText\(/g, ""), FORBIDDEN);
  // counter-proof: access is caught, the word in an explanation is not
  assert.match("localStorage.getItem('t')", FORBIDDEN);
  assert.match("fetch(url)", FORBIDDEN);
  assert.match("const s = globalThis.localStorage;", FORBIDDEN);
  assert.doesNotMatch("saved in this browser (its <code>localStorage</code>)", FORBIDDEN);
});

// ---------------------------------------------------------------- one click per decision (queue 2026-09-24)

import {
  tokenLinkUrl, repositoryChoiceSteps, stepHtml, commitFiles, missingLayout, addProductText,
} from "../docs/assets/review-core.mjs";

const click = { isTrusted: true };

function fakeGitHub(files = {}) {
  // Minimal git-data API: one branch "main" at commit c0 with tree t0.
  const calls = [];
  const fetchMock = async (u, init) => {
    const url = new URL(u), m = init.method, path = url.pathname;
    calls.push([m, path, init.headers?.Authorization, init.body ? JSON.parse(init.body) : null]);
    const ok = (o) => new Response(JSON.stringify(o), { status: 200 });
    if (m === "GET" && path.endsWith("/git/ref/heads/main")) return ok({ object: { sha: "c0" } });
    if (m === "GET" && path.endsWith("/git/commits/c0")) return ok({ tree: { sha: "t0" } });
    if (m === "GET" && path.includes("/contents/")) {
      const p = decodeURIComponent(path.split("/contents/")[1]);
      return p in files ? ok({ sha: files[p] }) : new Response("{}", { status: 404 });
    }
    if (m === "POST" && path.endsWith("/git/trees")) return ok({ sha: "t1" });
    if (m === "POST" && path.endsWith("/git/commits")) return ok({ sha: "c1", html_url: "https://github.com/a/b/commit/c1" });
    if (m === "PATCH" && path.endsWith("/git/refs/heads/main")) return ok({ object: { sha: "c1" } });
    return new Response("{}", { status: 500 });
  };
  return { calls, fetchMock };
}

async function withFetch(mock, f) {
  const real = globalThis.fetch;
  globalThis.fetch = mock;
  try { return await f(); } finally { globalThis.fetch = real; }
}

test("THE TOKEN LINK IS PREFILLED — name, description, expiry, the one permission; no more", () => {
  const u = new URL(tokenLinkUrl("reader/agent-m"));
  assert.equal(u.origin + u.pathname, "https://github.com/settings/personal-access-tokens/new");
  assert.equal(u.searchParams.get("name"), "Agent M · reader/agent-m");
  assert.equal(u.searchParams.get("expires_in"), "90");
  assert.equal(u.searchParams.get("contents"), "write");
  assert.equal(u.searchParams.get("metadata"), "read");
  assert.equal(u.searchParams.get("pull_requests"), null, "the dashboard needs no pull-request permission");
  assert.ok(u.searchParams.get("description"));
});

test("THE REPOSITORY CHOICE IS SPELLED OUT — both repositories named, 'Only select repositories' first", () => {
  const s = repositoryChoiceSteps("reader/agent-m", "reader/thesis");
  assert.match(s[0], /Only select repositories/);
  assert.match(s[0], /All repositories/);
  assert.ok(s.some((x) => x.includes("reader/agent-m")) && s.some((x) => x.includes("reader/thesis")));
  assert.ok(s.some((x) => /github_pat_/.test(x)));
  assert.equal(repositoryChoiceSteps("r/agent-m", "r/agent-m").filter((x) => x.includes("r/agent-m")).length, 1,
    "the instance as its own product is named once");
});

test("EVERY STEP EXPLAINS ITSELF — a step without an explanation cannot be rendered", () => {
  const h = stepHtml({ title: "Step A", body: "<p>x</p>", explain: "A token is a key." });
  assert.match(h, /class="step"/);
  assert.match(h, /<details class="explain"><summary>What is this\?<\/summary>/);
  assert.throws(() => stepHtml({ title: "Step A", body: "x", explain: "" }), /explain/);
  assert.throws(() => stepHtml({ title: "Step A", body: "x" }), /explain/);
});

test("THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — no trusted click, no request", async () => {
  const { calls, fetchMock } = fakeGitHub();
  await withFetch(fetchMock, async () => {
    const base = { repo: "a/b", branch: "main", files: [{ path: "x.md", content: "x\n" }], message: "m", token: "github_pat_t" };
    await assert.rejects(commitFiles({ ...base }), /click/);
    await assert.rejects(commitFiles({ ...base, click: { isTrusted: false } }), /click/);
    await assert.rejects(commitFiles({ ...base, click, token: null }), /token/);
  });
  assert.equal(calls.length, 0);
});

test("one commit, fast-forward only, token only to the API", async () => {
  const { calls, fetchMock } = fakeGitHub();
  const r = await withFetch(fetchMock, () => commitFiles({ repo: "a/b", branch: "main", message: "accept UC-001",
    token: "github_pat_t", click, files: [{ path: "docs/approvals/UC-001-abc.md", content: "kind: use-case\n" }] }));
  assert.equal(r.sha, "c1");
  assert.deepEqual(calls.map(([m, p]) => `${m} ${p}`), [
    "GET /repos/a/b/git/ref/heads/main", "GET /repos/a/b/git/commits/c0", "POST /repos/a/b/git/trees",
    "POST /repos/a/b/git/commits", "PATCH /repos/a/b/git/refs/heads/main"]);
  assert.ok(calls.every(([, , auth]) => auth === "Bearer github_pat_t"));
  const tree = calls[2][3], commit = calls[3][3], ref = calls[4][3];
  assert.deepEqual(tree, { base_tree: "t0", tree: [{ path: "docs/approvals/UC-001-abc.md", mode: "100644", type: "blob", content: "kind: use-case\n" }] });
  assert.deepEqual(commit, { message: "accept UC-001", tree: "t1", parents: ["c0"] });
  assert.deepEqual(ref, { sha: "c1", force: false });
});

test("an edit is refused when the file changed since it was loaded", async () => {
  const { calls, fetchMock } = fakeGitHub({ "docs/use-cases/UC-001-x.md": "newer" });
  await withFetch(fetchMock, () => assert.rejects(commitFiles({ repo: "a/b", branch: "main", message: "edit", token: "github_pat_t",
    click, files: [{ path: "docs/use-cases/UC-001-x.md", content: "mine\n", expectBlob: "older" }] }), /changed since/));
  assert.ok(!calls.some(([m]) => m === "PATCH"), "nothing written");
});

test("ADDING A PRODUCT CREATES ITS LAYOUT — only what is missing", () => {
  const all = missingLayout([], "alice/thesis").map((f) => f.path).sort();
  assert.deepEqual(all, ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "docs/use-cases/README.md"]);
  const some = missingLayout(["SPEC.md", "docs/use-cases/UC-001-x.md"], "alice/thesis").map((f) => f.path).sort();
  assert.deepEqual(some, ["CHANGELOG.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md"]);
  assert.match(missingLayout([], "alice/thesis").find((f) => f.path === "SPEC.md").content, /VERBINDLICH \(SPEC\)/);
});

test("THE INSTANCE LISTS ITS PRODUCTS IN A FILE — adding appends once, keeps the rest", () => {
  const base = "# Products\n\n```\n- `owner/name` — example\n```\n\n## Products\n\n";
  const once = addProductText(base, "alice/thesis", "Thesis tool");
  assert.ok(once.startsWith(base));
  assert.match(once, /\n- `alice\/thesis` — Thesis tool\n$/);
  assert.equal(addProductText(once, "alice/thesis", "again"), once);
  assert.throws(() => addProductText(base, "../evil", ""), /repository/);
});

test("every site module parses — the app itself is only run in a browser, so check its syntax here", () => {
  for (const f of ["review-app.mjs", "review-core.mjs", "settings-store.mjs"]) {
    const r = spawnSync(process.execPath, ["--check", new URL(`../docs/assets/${f}`, import.meta.url).pathname]);
    assert.equal(r.status, 0, `${f}: ${r.stderr}`);
  }
});
