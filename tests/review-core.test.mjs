// Review core — deterministic, no network. Run: node --test tests/
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.

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
  const base = { queue: "q", nr: 1, anchor: "## 9. G", bis: null, proposalPath: "q/01-a.md", proposalText: "## 9. G\nnew\n",
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

test("an applied entry is judged by its own section, not by headings later entries filled", () => {
  // Queue 2026-09-24g entry 05 replaced §10 and added placeholder headings §11–§15, which entries
  // 06–10 then filled. §10 stayed exactly as accepted, so the entry is applied, not superseded.
  const done = new Map([[5, { decision: "uebernommen" }]]);
  const base = { queue: "q", nr: 5, anchor: "## 10. R", bis: null, proposalPath: "q/05-a.md",
    proposalBlob: "p".repeat(40), sectionBlob: "s".repeat(40), decisions: done, records: [],
    proposalText: "## 10. R\nrule A\n\n## 11. X\n\n*(not yet approved)*\n" };
  assert.equal(deriveSpecStatus({ ...base, specText: "## 9. G\nx\n## 10. R\nrule A\n\n## 11. X\n\nrule B\n" }), "applied");
  // Counter-proof: §10 itself was changed after the acceptance.
  assert.equal(deriveSpecStatus({ ...base, specText: "## 10. R\nrule C\n\n## 11. X\n\nrule B\n" }), "superseded");
  // An entry with an end anchor (the preamble, entry 12) is compared as a whole, up to that anchor.
  const pre = { ...base, anchor: "# T", bis: "## 0. H", proposalText: "# T\n\nnew preamble\n" };
  assert.equal(deriveSpecStatus({ ...pre, specText: "# T\n\nnew preamble\n## 0. H\nrule\n" }), "applied");
  assert.equal(deriveSpecStatus({ ...pre, specText: "# T\n\nolder preamble\n## 0. H\nrule\n" }), "superseded");
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
  tokenLinkUrl, repositoryChoiceSteps, stepHtml, commitFiles, missingLayout,
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

// ONE GITHUB TOKEN SERVES EVERY FEATURE: parameter names as documented by GitHub,
// https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#pre-filling-fine-grained-personal-access-token-details-using-url-parameters
const TOKEN_FIELDS = ["name", "description", "expires_in", "target_name"];
const ONE_TOKEN = { contents: "write", issues: "write", actions: "write", metadata: "read" };

test("THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE — exactly Contents, Issues, Actions write, Metadata read", () => {
  const u = new URL(tokenLinkUrl("reader/agent-m"));
  assert.equal(u.origin + u.pathname, "https://github.com/settings/personal-access-tokens/new");
  assert.equal(u.searchParams.get("name"), "Agent M · reader/agent-m");
  assert.equal(u.searchParams.get("expires_in"), "90");
  assert.ok(u.searchParams.get("description"));
  const perms = Object.fromEntries([...u.searchParams].filter(([k]) => !TOKEN_FIELDS.includes(k)));
  assert.deepEqual(perms, ONE_TOKEN, "the link asks for exactly these permissions, no more, no less");
});

test("THE REPOSITORY CHOICE IS SPELLED OUT — both repositories named, 'Only select repositories' first", () => {
  const s = repositoryChoiceSteps("reader/agent-m", "reader/thesis");
  assert.match(s[0], /Only select repositories/);
  assert.match(s[0], /All repositories/);
  assert.ok(s.some((x) => x.includes("reader/agent-m")) && s.some((x) => x.includes("reader/thesis")));
  assert.ok(s.some((x) => /github_pat_/.test(x)));
  assert.equal(repositoryChoiceSteps("r/agent-m", "r/agent-m").filter((x) => x.includes("r/agent-m")).length, 1,
    "the instance as its own product is named once");
  const all = s.join("\n");
  for (const p of ["Contents: read and write", "Issues: read and write", "Actions: read and write", "Metadata: read"]) {
    assert.ok(all.includes(p), `the steps name ${p}`);
  }
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

// ---------------------------------------------------------------- products in the browser (UC-001)
// THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER · A PRODUCT IS NAMED BY ITS ADDRESS ·
// ADDING A PRODUCT CREATES ITS LAYOUT (and writes nothing into the instance repository)

import { parseProductAddress, addProduct } from "../docs/assets/review-core.mjs";
import { createStore, PREFIX } from "../docs/assets/settings-store.mjs";

function fakeStorage() {
  const mem = new Map();
  return { mem, getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k), get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null };
}

test("A PRODUCT IS NAMED BY ITS ADDRESS — the address as copied from the browser", () => {
  const p = parseProductAddress("https://github.com/alice/thesis-tool");
  assert.deepEqual(p, { address: "https://github.com/alice/thesis-tool", host: "github.com", repo: "alice/thesis-tool" });
  for (const v of [" https://github.com/alice/thesis-tool/ ", "https://github.com/alice/thesis-tool.git", "https://github.com/alice/thesis-tool/tree/main"]) {
    assert.equal(parseProductAddress(v).address, "https://github.com/alice/thesis-tool", v);
  }
  // Counter-proof: a bare owner/name is not an address; nor is anything outside https.
  for (const v of ["alice/thesis-tool", "http://github.com/alice/thesis-tool", "https://github.com/alice", "https://github.com/../evil", "javascript:alert(1)", ""]) {
    assert.ok(parseProductAddress(v).error, `refused: ${JSON.stringify(v)}`);
  }
  // A GitLab address is recognised as such, and refused for now (GitLab support is a later task).
  assert.match(parseProductAddress("https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool").error, /GitLab/);
});

test("the browser store keeps product addresses beside the token, once each", () => {
  const st = fakeStorage(), s = createStore(st);
  assert.deepEqual(s.getProducts(), []);
  s.addProduct("https://github.com/alice/thesis-tool");
  s.addProduct("https://github.com/alice/thesis-tool");
  s.addProduct("https://github.com/alice/other");
  assert.deepEqual(s.getProducts(), ["https://github.com/alice/thesis-tool", "https://github.com/alice/other"]);
  assert.ok([...st.mem.keys()].every((k) => k.startsWith(PREFIX)));
  st.setItem(PREFIX + "products", "not json");
  assert.deepEqual(s.getProducts(), [], "a damaged entry reads as an empty list");
});

function productGitHub(tree) {
  const g = fakeGitHub();
  const inner = g.fetchMock;
  g.fetchMock = async (u, init) => {
    const path = new URL(u).pathname;
    if (init.method === "GET" && /^\/repos\/[^/]+\/[^/]+$/.test(path)) {
      g.calls.push(["GET", path, init.headers?.Authorization, null]);
      return new Response(JSON.stringify({ default_branch: "main", private: true }), { status: 200 });
    }
    if (init.method === "GET" && path.includes("/git/trees/")) {
      g.calls.push(["GET", path, init.headers?.Authorization, null]);
      return new Response(JSON.stringify({ tree: tree.map((p) => ({ path: p, type: "blob" })) }), { status: 200 });
    }
    return inner(u, init);
  };
  return g;
}

test("THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER — adding stores the address and commits nothing to the instance", async () => {
  const st = fakeStorage(), store = createStore(st);
  store.setToken("github_pat_t");
  const { calls, fetchMock } = productGitHub([]);
  const r = await withFetch(fetchMock, () => addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t", click, store }));
  assert.deepEqual(store.getProducts(), ["https://github.com/reader/thesis"]);
  assert.equal(JSON.parse(st.getItem(PREFIX + "products"))[0], "https://github.com/reader/thesis");
  assert.equal(r.commit.sha, "c1", "the layout is committed into the product");
  assert.ok(calls.length && calls.every(([, p]) => p.startsWith("/repos/reader/thesis")),
    "every request goes to the product repository — none to the instance");
  assert.deepEqual(Object.keys(treeOf(calls)).sort(),
    ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "docs/use-cases/README.md"]);
  // Counter-proof: after a clear, the list is empty.
  store.clear();
  assert.deepEqual(store.getProducts(), []);
  assert.equal(st.mem.size, 0);
});

test("UC-001 5b: a product with the complete layout is only added to the list; no click, nothing at all", async () => {
  const store = createStore(fakeStorage());
  const full = ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "docs/use-cases/UC-001-x.md"];
  const g = productGitHub(full);
  const r = await withFetch(g.fetchMock, () => addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t", click, store }));
  assert.equal(r.commit, null);
  assert.ok(!g.calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  assert.deepEqual(store.getProducts(), ["https://github.com/reader/thesis"]);
  const s2 = createStore(fakeStorage()), g2 = productGitHub([]);
  await withFetch(g2.fetchMock, () => assert.rejects(addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t",
    click: { isTrusted: false }, store: s2 }), /click/));
  assert.equal(g2.calls.length, 0);
  assert.deepEqual(s2.getProducts(), []);
});

test("UC-001 5a: a refused write adds nothing to the list", async () => {
  const store = createStore(fakeStorage());
  const g = productGitHub([]);
  const inner = g.fetchMock;
  const mock = async (u, init) => (init.method === "POST" ? new Response(JSON.stringify({ message: "Resource not accessible" }), { status: 403 }) : inner(u, init));
  await withFetch(mock, () => assert.rejects(addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t", click, store }), /403/));
  assert.deepEqual(store.getProducts(), []);
});

test("every site module parses — the app itself is only run in a browser, so check its syntax here", () => {
  for (const f of ["review-app.mjs", "review-core.mjs", "settings-store.mjs"]) {
    const r = spawnSync(process.execPath, ["--check", new URL(`../docs/assets/${f}`, import.meta.url).pathname]);
    assert.equal(r.status, 0, `${f}: ${r.stderr}`);
  }
});

// ---------------------------------------------------------------- token at instance setup (UC-014), extended in UC-001

import { tokenListUrl, extendTokenSteps } from "../docs/assets/review-core.mjs";

test("UC-014: setup names only the instance", () => {
  const s = repositoryChoiceSteps("reader/agent-m", null);
  assert.ok(s.some((x) => x.includes("reader/agent-m")));
  assert.ok(!s.some((x) => /null|undefined/.test(x)));
});

test("UC-001: extending the token names the token, adds the product, keeps the instance, copies nothing", () => {
  assert.equal(tokenListUrl(), "https://github.com/settings/personal-access-tokens");
  const s = extendTokenSteps("reader/agent-m", "reader/thesis").join("\n");
  assert.match(s, /Agent M · reader\/agent-m/);      // the name tokenLinkUrl gave it
  assert.match(s, /add “reader\/thesis”/);
  assert.match(s, /keep “reader\/agent-m”/);
  assert.match(s, /Update/);
  assert.match(s, /nothing to copy/i);
  const name = new URL(tokenLinkUrl("reader/agent-m")).searchParams.get("name");
  assert.ok(s.includes(name), "the steps must name the token exactly as the setup link created it");
});

// ---------------------------------------------------------------- one commit per decision (queue 2026-09-24g, entry 05)
// AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL · A STALE APPROVAL IS NOT APPLIED ·
// SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER (UC-006 4–7, 4d, 5a; UC-008 3d)

import {
  acceptItems, planAcceptance, createReviewSession, decisionRow, replaceSection, sectionForEntry, missingNeeds,
} from "../docs/assets/review-core.mjs";

const QD = "docs/spec-freigaben/2026-09-24g_x";
const WHEN = new Date("2026-09-29T16:03:00Z");
const B_SPEC = "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n## 10. R\n\nold ten\n";
const B_P05 = "## 10. R\n\nnew ten\n\n## 11. X\n\n*(not yet approved)*\n";
const B_P06 = "## 11. X\n\nrule of eleven\n";
const B_INDEX = "**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`\n\n| Nr | Datei | Anker | bis | Commits |\n|---|---|---|---|---|\n" +
  "| 05 | `SPEC.md` | ## 10. R | — | — |\n| 06 | `SPEC.md` | ## 11. X | — | — |\n";
const B_UC1 = "---\nid: UC-001\n---\n# one\n", B_UC2 = "---\nid: UC-002\n---\n# two\n";

function batchRepo(over = {}) {
  return { "SPEC.md": B_SPEC, [`${QD}/index.md`]: B_INDEX, [`${QD}/05-a.md`]: B_P05, [`${QD}/06-b.md`]: B_P06,
    [`${QD}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
    "docs/use-cases/UC-001-a.md": B_UC1, "docs/use-cases/UC-002-b.md": B_UC2, ...over };
}

// What the dashboard showed: the proposal and the section beside it, each by its blob SHA.
async function specItem(nr, proposalText, shownSection, anchor) {
  const nn = String(nr).padStart(2, "0");
  return { kind: "spec", queue: QD, qname: "2026-09-24g_x", nr, nn, proposalPath: `${QD}/${nn}-${nr === 5 ? "a" : "b"}.md`,
    proposalBlob: await gitBlobSha(proposalText), sectionBlob: await gitBlobSha(shownSection), targetPath: "SPEC.md",
    anchor, bis: null, needs: [] };
}
const ucItem = async (id, path, text) => ({ kind: "use-case", id, path, blob: await gitBlobSha(text) });

function readerOf(files, seen = []) {
  return async (head, path) => { seen.push(head); return path in files ? files[path] : null; };
}

const treeOf = (calls) => Object.fromEntries(calls.find(([m, p]) => m === "POST" && p.endsWith("/git/trees"))[3].tree.map((f) => [f.path, f.content]));

test("decisionRow is the row tools/apply_approvals.py writes", () => {
  assert.equal(decisionRow(7, "spec-q-07-a99553a7b6f9.md", WHEN), "| 2026-09-29 16:03 UTC | 7 | uebernommen | approval:spec-q-07-a99553a7b6f9.md |\n");
});

test("replaceSection writes the proposal byte for byte and keeps the file's final newline", () => {
  assert.equal(replaceSection(B_SPEC, "## 10. R", null, "## 10. R\n\nnew\n"), "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n## 10. R\n\nnew\n");
  assert.equal(replaceSection(B_SPEC, "## 9. G", null, "## 9. G\nnine\n"), "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\nnine\n## 10. R\n\nold ten\n");
  assert.throws(() => replaceSection(B_SPEC, "## 11. X", null, "x\n"), /0 times/);
});

test("AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — one commit: record, section, decision row", async () => {
  const files = batchRepo(), heads = [];
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const { calls, fetchMock } = fakeGitHub();
  const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [it], readAt: readerOf(files, heads), now: WHEN }));
  const rec = `docs/approvals/spec-2026-09-24g_x-05-${it.proposalBlob.slice(0, 12)}.md`;
  assert.equal(res.commit.sha, "c1");
  assert.deepEqual(res.leftOut, []);
  assert.equal(calls.filter(([m, p]) => m === "POST" && p.endsWith("/git/commits")).length, 1, "exactly one commit");
  assert.ok(heads.length && heads.every((h) => h === "c0"), "every check reads the commit that is written on");
  const tree = treeOf(calls);
  assert.deepEqual(Object.keys(tree).sort(), [`${QD}/entscheidungen.md`, "SPEC.md", rec].sort());
  assert.equal(tree["SPEC.md"], "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n" + B_P05);
  assert.equal(tree[`${QD}/entscheidungen.md`], "# Decisions\n\nAppend-only.\n\n" +
    `| 2026-09-29 16:03 UTC | 5 | uebernommen | approval:${rec.split("/").pop()} |\n`);
  assert.equal(tree[rec], recordText(specRecord({ queue: QD, entry: 5, proposal: `${QD}/05-a.md`, blob: it.proposalBlob,
    target: "SPEC.md", anchor: "## 10. R", section: it.sectionBlob })));
});

test("A STALE APPROVAL IS NOT APPLIED — dashboard: proposal or section changed on the commit written on", async () => {
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  for (const [over, why] of [[{ [`${QD}/05-a.md`]: B_P05 + "edited\n" }, /proposal changed/],
    [{ "SPEC.md": B_SPEC.replace("old ten", "changed meanwhile") }, /SPEC section changed/]]) {
    const { calls, fetchMock } = fakeGitHub();
    const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
      items: [it], readAt: readerOf(batchRepo(over)), now: WHEN }));
    assert.equal(res.commit, null);
    assert.deepEqual(res.leftOut.map((l) => l.label), ["2026-09-24g_x 05"]);
    assert.match(res.leftOut[0].reason, why);
    assert.ok(!calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  }
});

test("SEVERAL FILES ARE ACCEPTED IN ONE CLICK — one record per ticked file, none for a file not opened", async () => {
  const s = createReviewSession();
  const u1 = await ucItem("UC-001", "docs/use-cases/UC-001-a.md", B_UC1), u2 = await ucItem("UC-002", "docs/use-cases/UC-002-b.md", B_UC2);
  s.show(u1); s.show(u2);
  assert.equal(s.tick("uc:docs/use-cases/UC-003-c.md", true), false, "a file that was not opened cannot be ticked");
  assert.equal(s.tick(s.key(u1), true), true);
  assert.equal(s.tick(s.key(u2), true), true);
  assert.deepEqual(s.items().map((i) => i.id), ["UC-001", "UC-002"]);
  const { calls, fetchMock } = fakeGitHub();
  const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: s.items(), readAt: readerOf(batchRepo()), now: WHEN }));
  const tree = treeOf(calls);
  assert.deepEqual(Object.keys(tree).sort(), [approvalPath("UC-001", u1.blob), approvalPath("UC-002", u2.blob)]);
  assert.equal(tree[approvalPath("UC-002", u2.blob)], recordText(useCaseRecord(u2.path, u2.blob)));
  assert.deepEqual(res.accepted, ["UC-001", "UC-002"]);
  // Counter-proof: UC-002 changed after it was shown — it is left out and named, UC-001 is still written.
  const g = fakeGitHub();
  const res2 = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: s.items(), readAt: readerOf(batchRepo({ "docs/use-cases/UC-002-b.md": B_UC2 + "edited\n" })), now: WHEN }));
  assert.deepEqual(Object.keys(treeOf(g.calls)), [approvalPath("UC-001", u1.blob)]);
  assert.deepEqual(res2.leftOut.map((l) => l.label), ["UC-002"]);
  assert.match(res2.leftOut[0].reason, /changed after it was shown/);
});

test("A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: one commit with both sections, rows in index order", async () => {
  const entries = [{ nr: 5, anchor: "## 10. R", bis: null, proposalText: B_P05 }, { nr: 6, anchor: "## 11. X", bis: null, proposalText: B_P06 }];
  const shown06 = sectionForEntry({ specText: B_SPEC, entries, nr: 6 });
  assert.deepEqual(shown06.needs, [5], "06 needs 05, which creates its heading");
  assert.equal(shown06.current, "## 11. X\n\n*(not yet approved)*\n", "06 is shown beside the heading 05 creates");
  assert.deepEqual(sectionForEntry({ specText: B_SPEC, entries, nr: 5 }).needs, []);
  const i05 = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const i06 = { ...(await specItem(6, B_P06, shown06.current, "## 11. X")), needs: [5] };
  const { calls, fetchMock } = fakeGitHub();
  const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [i06, i05], readAt: readerOf(batchRepo()), now: WHEN }));        // ticked in reverse order
  assert.deepEqual(res.leftOut, []);
  assert.equal(calls.filter(([m, p]) => m === "POST" && p.endsWith("/git/commits")).length, 1);
  const tree = treeOf(calls);
  assert.equal(tree["SPEC.md"], "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n## 10. R\n\nnew ten\n\n" + B_P06);
  const rows = tree[`${QD}/entscheidungen.md`].split("\n").filter((l) => l.startsWith("| 2026"));
  assert.deepEqual(rows.map((r) => r.split("|")[2].trim()), ["5", "6"]);
  assert.equal(Object.keys(tree).filter((p) => p.startsWith("docs/approvals/")).length, 2);
});

test("A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: 06 alone is not offered while its anchor is missing, and 05 is named", async () => {
  const i06 = { ...(await specItem(6, B_P06, "## 11. X\n\n*(not yet approved)*\n", "## 11. X")), needs: [5] };
  const gaps = missingNeeds([i06]);
  assert.equal(gaps.length, 1);
  assert.match(gaps[0].message, /entry 05/);
  assert.doesNotMatch(gaps[0].message, /times/);
  const { calls, fetchMock } = fakeGitHub();
  await withFetch(fetchMock, () => assert.rejects(acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [i06], readAt: readerOf(batchRepo()), now: WHEN }), /entry 05/));
  assert.equal(calls.length, 0, "nothing is read or written");
  assert.deepEqual(missingNeeds([i06, await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R")]), []);
  // And if 05 is ticked but left out as stale, 06 is left out too, naming 05 — not "anchor found 0 times".
  const i05 = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const plan = await planAcceptance({ items: [i05, i06], now: WHEN,
    read: async (p) => batchRepo({ [`${QD}/05-a.md`]: B_P05 + "edited\n" })[p] ?? null });
  assert.deepEqual(plan.files, []);
  assert.deepEqual(plan.leftOut.map((l) => l.label), ["2026-09-24g_x 05", "2026-09-24g_x 06"]);
  assert.match(plan.leftOut[1].reason, /entry 05/);
  assert.doesNotMatch(plan.leftOut[1].reason, /times/);
});

test("an entry already written in the queue's decisions is not written twice", async () => {
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const name = approvalPath("spec-2026-09-24g_x-05", it.proposalBlob).split("/").pop();
  const plan = await planAcceptance({ items: [it], now: WHEN, read: async (p) => batchRepo({
    [`${QD}/entscheidungen.md`]: `# D\n\n${decisionRow(5, name, WHEN)}` })[p] ?? null });
  assert.deepEqual(plan.files, []);
  assert.match(plan.leftOut[0].reason, /already/);
});

// ---------------------------------------------------------------- settings in one place (UC-042)
// SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS · AN EXPORT CAN BE LOCKED WITH A PASSPHRASE ·
// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED · A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY ·
// PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF · A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT

import {
  exportSettings, readSettingsFile, mergeSettings, PBKDF2_ITERATIONS, tokenRefusal, parseProductSettings,
  setProductSetting, pseudonymisationOn, savePseudonymisation, parseCollaborators, formatCollaborators,
  addCollaborator, removeCollaborator, saveCollaborators,
} from "../docs/assets/review-core.mjs";
import { TOKEN_KEY, TOKEN_EXPIRY_KEY, PRODUCTS_KEY } from "../docs/assets/settings-store.mjs";

const SECRET = "github_pat_11SECRETVALUEabcdefghijklmnop";
const FULL = { [TOKEN_KEY]: SECRET, [TOKEN_EXPIRY_KEY]: "2026-12-29",
  [PRODUCTS_KEY]: JSON.stringify(["https://github.com/alice/thesis", "https://github.com/alice/other"]) };

test("SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — an import of an export restores every setting", async () => {
  const st = fakeStorage(), s = createStore(st);
  s.setToken(SECRET, "2026-12-29");
  s.addProduct("https://github.com/alice/thesis");
  const file = await exportSettings(s.entries(), { now: WHEN });
  assert.ok(file.includes(SECRET), "an open export carries the token itself");
  const into = fakeStorage(), t = createStore(into);
  const m = mergeSettings(t.entries(), await readSettingsFile(file));
  t.putEntries(m.put);
  assert.deepEqual(t.entries(), s.entries());
  assert.equal(t.getToken(), SECRET);
  assert.equal(t.getTokenExpiry(), "2026-12-29");
  assert.deepEqual(t.getProducts(), ["https://github.com/alice/thesis"]);
  // Counter-proof: a file of another format imports nothing.
  await assert.rejects(readSettingsFile(JSON.stringify({ format: "something-else", settings: FULL })), /not an Agent M settings file/);
});

test("AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing", async () => {
  const file = await exportSettings(FULL, { passphrase: "correct horse", now: WHEN });
  for (const v of Object.values(FULL)) assert.ok(!file.includes(v), `in clear: ${v}`);
  assert.ok(!file.includes("SECRETVALUE"));
  const locked = JSON.parse(file).locked;
  assert.ok(locked.iterations >= 600000 && locked.iterations === PBKDF2_ITERATIONS, "a high iteration count, stored in the file");
  assert.ok(locked.salt && locked.iv && locked.data, "salt, iv and ciphertext stored");
  const other = JSON.parse(await exportSettings(FULL, { passphrase: "correct horse", now: WHEN })).locked;
  assert.notEqual(other.salt, locked.salt, "a random salt per export");
  assert.notEqual(other.iv, locked.iv, "a random IV per export");
  assert.deepEqual(await readSettingsFile(file, "correct horse"), FULL);
  await assert.rejects(readSettingsFile(file), (e) => e.locked === true);
  await assert.rejects(readSettingsFile(file, "wrong horse"), (e) => e.wrongPassphrase === true && /nothing was imported/.test(e.message));
  const tampered = JSON.parse(file);
  tampered.locked.data = tampered.locked.data.slice(0, -4) + (tampered.locked.data.endsWith("AAAA") ? "BBBB" : "AAAA");
  await assert.rejects(readSettingsFile(JSON.stringify(tampered), "correct horse"), (e) => e.wrongPassphrase === true);
});

test("UC-042 6a — an import keeps what this browser has and adds only what is missing, listing both", () => {
  const current = { [TOKEN_KEY]: "github_pat_mine", [TOKEN_EXPIRY_KEY]: "2026-10-01",
    [PRODUCTS_KEY]: JSON.stringify(["https://github.com/alice/thesis"]) };
  const m = mergeSettings(current, { ...FULL, "agent-m.unknown": "x" });
  assert.deepEqual(m.put, { [PRODUCTS_KEY]: JSON.stringify(["https://github.com/alice/thesis", "https://github.com/alice/other"]) });
  assert.deepEqual(m.added, ["product https://github.com/alice/other"]);
  assert.deepEqual(m.kept, ["GitHub token", "product https://github.com/alice/thesis"]);
  assert.deepEqual(m.ignored, ["agent-m.unknown"]);
  // A kept token keeps its own expiry date; the file's date belongs to the file's token.
  assert.ok(!(TOKEN_EXPIRY_KEY in m.put));
  // Into an empty browser, everything is added.
  const e = mergeSettings({}, FULL);
  assert.deepEqual(e.put, FULL);
  assert.deepEqual(e.kept, []);
});

test("AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{"message":"Bad credentials"}', { status: 401, statusText: "Unauthorized" });
  let err;
  try { await fetchText("https://api.github.com/repos/a/b", {}, "github_pat_old"); } catch (e) { err = e; } finally { globalThis.fetch = realFetch; }
  const r = tokenRefusal(err);
  assert.equal(r.token, "GitHub token");
  assert.match(r.text, /GitHub token/);
  assert.equal(r.renewUrl, "https://github.com/settings/personal-access-tokens");
  assert.match(r.renew, /Regenerate token/);
  assert.match(r.renew, /permissions and repositories/);
  // Also for a refused write (commitFiles sets .status).
  assert.ok(tokenRefusal(Object.assign(new Error("GET /git/ref/heads/main: 401 Bad credentials"), { status: 401 })));
  // Counter-proof: a missing repository or a missing permission is not an expired token.
  assert.equal(tokenRefusal(Object.assign(new Error("404 Not Found — https://api.github.com/repos/a/b"), { status: 404 })), null);
  assert.equal(tokenRefusal(Object.assign(new Error("403 Forbidden"), { status: 403 })), null);
});

const SETTINGS_OFF = "# Settings of alice/thesis\n\nintro\n\n- pseudonymisation: off\n";

test("PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting", () => {
  assert.equal(pseudonymisationOn(null), true, "no file: on");
  assert.equal(pseudonymisationOn("# Settings\n"), true, "no setting: on");
  assert.equal(pseudonymisationOn(SETTINGS_OFF), false);
  assert.deepEqual(parseProductSettings(SETTINGS_OFF), { pseudonymisation: "off" });
  const created = setProductSetting(null, "pseudonymisation", "off", "alice/thesis");
  assert.match(created, /^# Settings of alice\/thesis\n/);
  assert.deepEqual(parseProductSettings(created), { pseudonymisation: "off" });
  // Switching back on removes the line; everything else of the file stays as it was.
  const on = setProductSetting(SETTINGS_OFF, "pseudonymisation", null, "alice/thesis");
  assert.equal(on, "# Settings of alice/thesis\n\nintro\n\n");
  assert.equal(pseudonymisationOn(on), true);
  assert.equal(setProductSetting(on, "pseudonymisation", "off", "alice/thesis"), "# Settings of alice/thesis\n\nintro\n\n- pseudonymisation: off\n");
});

test("A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice", async () => {
  const st = fakeStorage();
  createStore(st).setToken("github_pat_t");
  const before = [...st.mem.entries()];
  const { calls, fetchMock } = fakeGitHub({ "docs/settings.md": "b0" });
  const base = { repo: "alice/thesis", branch: "main", token: "github_pat_t", current: null, currentBlob: null, off: true };
  await withFetch(fetchMock, async () => {
    await assert.rejects(savePseudonymisation({ ...base, click, acknowledged: false }), /I have read this/);
    await assert.rejects(savePseudonymisation({ ...base, click: { isTrusted: false }, acknowledged: true }), /click/);
  });
  assert.equal(calls.length, 0, "nothing sent without the acknowledgement and a real click");
  const r = await withFetch(fetchMock, () => savePseudonymisation({ ...base, click, acknowledged: true }));
  assert.equal(r.sha, "c1");
  assert.equal(pseudonymisationOn(treeOf(calls)["docs/settings.md"]), false);
  assert.deepEqual(Object.keys(treeOf(calls)), ["docs/settings.md"]);
  assert.deepEqual([...st.mem.entries()], before, "localStorage holds no product setting");
  // Switching back on needs no acknowledgement (UC-042 4a).
  const g = fakeGitHub({ "docs/settings.md": "b0" });
  await withFetch(g.fetchMock, () => savePseudonymisation({ ...base, click, off: false, acknowledged: false,
    current: SETTINGS_OFF, currentBlob: "b0" }));
  assert.equal(pseudonymisationOn(treeOf(g.calls)["docs/settings.md"]), true);
});

const PEOPLE = [{ name: "Jane Doe", account: "jdoe", agreed: "2026-09-30" }, { name: "Max Müller", account: "max-m", agreed: "2026-10-01" }];

test("A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — docs/collaborators.md parses and formats losslessly", () => {
  const text = formatCollaborators(PEOPLE, "alice/thesis");
  assert.match(text, /^# Collaborators of alice\/thesis\n/);
  assert.match(text, /\| Jane Doe \| @jdoe \| 2026-09-30 \|/);
  assert.deepEqual(parseCollaborators(text), PEOPLE);
  assert.deepEqual(parseCollaborators(null), []);
  assert.deepEqual(parseCollaborators(formatCollaborators([], "alice/thesis")), []);
});

test("+ Collaborator needs the tick 'this person has agreed to be named'; Remove takes one off", () => {
  const add = { name: "Ann Lee", account: "annlee", agreed: "2026-09-30" };
  assert.throws(() => addCollaborator(PEOPLE, { ...add, consent: false }), /agreed to be named/);
  const more = addCollaborator(PEOPLE, { ...add, consent: true });
  assert.deepEqual(more.at(-1), add);
  assert.throws(() => addCollaborator(more, { ...add, consent: true }), /already listed/);
  for (const bad of [{ account: "not an account" }, { agreed: "30.09.2026" }, { name: "" }, { name: "A | B" }]) {
    assert.throws(() => addCollaborator(PEOPLE, { ...add, ...bad, consent: true }), Error, JSON.stringify(bad));
  }
  assert.deepEqual(removeCollaborator(more, "annlee"), PEOPLE);
});

test("collaborators are saved by one commit of docs/collaborators.md, on a click", async () => {
  const { calls, fetchMock } = fakeGitHub();
  await withFetch(fetchMock, () => assert.rejects(saveCollaborators({ repo: "alice/thesis", branch: "main", token: "github_pat_t",
    click: { isTrusted: false }, list: PEOPLE, currentBlob: null }), /click/));
  assert.equal(calls.length, 0);
  await withFetch(fetchMock, () => saveCollaborators({ repo: "alice/thesis", branch: "main", token: "github_pat_t",
    click, list: PEOPLE, currentBlob: null }));
  assert.deepEqual(parseCollaborators(treeOf(calls)["docs/collaborators.md"]), PEOPLE);
});

test("the settings export is saved as a file only — never committed, fetched or put into an address", () => {
  const app = readFileSync(new URL("../docs/assets/review-app.mjs", import.meta.url), "utf8");
  const body = (src) => (src.match(/async function saveExport\([\s\S]*?\n}\n/) || [""])[0];
  const LEAK = /commitFiles|fetchText|location|data:|encodeURIComponent|URLSearchParams/;
  const b = body(app);
  assert.ok(b.includes("exportSettings(") && b.includes("new Blob("), "saveExport writes the export into a Blob");
  assert.doesNotMatch(b, LEAK);
  assert.equal(app.split("exportSettings(").length - 1, 1, "exportSettings is called only in saveExport");
  // Counter-proof: an export that is committed is caught.
  assert.match(body("async function saveExport(ev) {\n  const t = await exportSettings(x);\n  await commitFiles({ files: [t] });\n}\n"), LEAK);
});

// ---------------------------------------------------------------- the use-case key is `area` (was `stage`)

test("the dashboard reads the use-case key `area` and says Area — `stage` is used nowhere", () => {
  const app = readFileSync(new URL("../docs/assets/review-app.mjs", import.meta.url), "utf8");
  const STAGE = /\bstages?\b/i;
  assert.doesNotMatch(app, STAGE);
  assert.match(app, /fields\.area\b/);
  assert.match(app, /<th>Area<\/th>/);
  assert.equal(parseFrontMatter("---\nid: UC-001\narea: setup\n---\n").fields.area, "setup");
  // Counter-proof: the old column is caught.
  assert.match("<td>${h(u.fields.stage)}</td>", STAGE);
});

test("status 'approved' is described truly for both routes — the dashboard's own commit and the workflow", () => {
  const app = readFileSync(new URL("../docs/assets/review-app.mjs", import.meta.url), "utf8");
  const line = app.match(/^\s*approved: \["approved", "([^"]+)"\],$/m)?.[1];
  assert.ok(line, "the label of status approved");
  assert.doesNotMatch(line, /^Approval committed — the workflow writes it into the SPEC$/);
  assert.match(line, /workflow/, "names the route without a token");
  assert.match(line, /not (yet )?(written|in)/i, "says what the status means: approved, not yet in the SPEC");
});
