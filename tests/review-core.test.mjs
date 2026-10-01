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
  gitBlobSha, parseRecord, recordText, approvalPath, useCaseRecord,
  specRecord, extractSection, sectionText, parseQueueIndex, parseDecisions,
  deriveUseCaseStatus, deriveSpecStatus,
} from "../docs/assets/review-core.mjs";
import { parseFrontMatter } from "../docs/assets/artifacts.mjs";
import { newFileUrl, editUrl, fetchText, ALLOWED_ORIGINS, MAX_URL_VALUE } from "../docs/assets/git-host.mjs";

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

// Queue 2026-09-30g entry 01: the anchor is a requirement's bold line, and the accepted proposal rewrote that very line
// ("…, 2026-09-24)*" -> "…, 2026-09-24, narrowed 2026-09-30)*"). The anchor as it stood before acceptance is gone from the
// SPEC; the entry's text stands where it was written, starting with the proposal's first line.
const R_ANCHOR = "**A DRAFTED RULE** *(PO A. Maier, 2026-09-24)*", R_BIS = "## 11. A";
const R_BEFORE = "# T\n\n## 10. R\n\n**AN EARLIER RULE** *(PO, 2026-09-23)*\nearlier.\n\n" +
  `${R_ANCHOR}\nold text.\n*Check:* x\n\n**A LATER RULE** *(PO, 2026-09-24)*\nlater.\n${R_BIS}\n\neleven\n`;
const R_PROPOSAL = "**A DRAFTED RULE** *(PO A. Maier, 2026-09-24, narrowed 2026-09-30)*\nnew text.\n*Check:* x\n\n" +
  "**A LATER RULE** *(PO, 2026-09-24)*\nlater.\n";
const R_AFTER = replaceSection(R_BEFORE, R_ANCHOR, R_BIS, R_PROPOSAL);

test("an accepted entry whose proposal rewrites its own anchor line is applied while the SPEC holds its text", () => {
  const done = new Map([[1, { decision: "uebernommen" }]]);
  const base = { queue: "q", nr: 1, anchor: R_ANCHOR, bis: R_BIS, proposalPath: "q/01-a.md", proposalText: R_PROPOSAL,
    proposalBlob: "p".repeat(40), sectionBlob: "s".repeat(40), decisions: done, records: [] };
  assert.match(extractSection(R_AFTER, R_ANCHOR, R_BIS).error, /0 times/, "the anchor before acceptance is gone from the SPEC");
  assert.equal(deriveSpecStatus({ ...base, specText: R_AFTER }), "applied");
  // Counter-proof: the text the entry wrote changed after the acceptance, or its first line is gone — superseded.
  assert.equal(deriveSpecStatus({ ...base, specText: R_AFTER.replace("new text.", "changed later.") }), "superseded");
  assert.equal(deriveSpecStatus({ ...base, specText: R_AFTER.replace("narrowed 2026-09-30", "narrowed 2026-10-02") }), "superseded");
  // Not accepted yet, the same entry is judged by its records as before.
  assert.equal(deriveSpecStatus({ ...base, decisions: new Map(), specText: R_BEFORE }), "open");
  // A heading-anchored entry whose first line is its anchor is applied as before; one that renames its heading is found
  // under the new heading.
  const h = { ...base, anchor: "## 11. A", bis: null, proposalText: "## 11. A\n\neleven, new\n" };
  assert.equal(deriveSpecStatus({ ...h, specText: replaceSection(R_BEFORE, "## 11. A", null, h.proposalText) }), "applied");
  assert.equal(deriveSpecStatus({ ...h, specText: R_BEFORE }), "superseded");
  const renamed = { ...h, proposalText: "## 11. B\n\neleven, renamed\n" };
  assert.equal(deriveSpecStatus({ ...renamed, specText: replaceSection(R_BEFORE, "## 11. A", null, renamed.proposalText) }), "applied");
});

test("the current text of an accepted entry is read where the entry wrote it, not at its anchor before acceptance", () => {
  const entries = [{ nr: 1, anchor: R_ANCHOR, bis: R_BIS, proposalText: R_PROPOSAL }];
  const shown = sectionForEntry({ specText: R_AFTER, entries, nr: 1, accepted: true });
  assert.equal(shown.error, undefined);
  assert.equal(shown.current, R_PROPOSAL);
  assert.deepEqual(shown.needs, []);
  // Counter-proof: an entry not yet accepted is still read at its anchor.
  assert.equal(sectionForEntry({ specText: R_BEFORE, entries, nr: 1 }).current,
    `${R_ANCHOR}\nold text.\n*Check:* x\n\n**A LATER RULE** *(PO, 2026-09-24)*\nlater.\n`);
  assert.match(sectionForEntry({ specText: R_AFTER.replace("narrowed 2026-09-30", "narrowed 2026-10-02"), entries, nr: 1,
    accepted: true }).error, /0 times/, "its text gone from the SPEC: nothing to show, and the page says why");
});

test("fetchText reads with GET only; the GitHub token goes only to GitHub's API (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT)", async () => {
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
  tokenLinkUrl, repositoryChoiceSteps, stepHtml, missingLayout,
} from "../docs/assets/review-core.mjs";
import { commitFiles } from "../docs/assets/git-host.mjs";

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

import { addProduct } from "../docs/assets/review-core.mjs";
import { parseProductAddress } from "../docs/assets/git-host.mjs";
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
  // A GitLab address is a GitLab product (GITLAB PRODUCTS ARE SUPPORTED) — see the GitLab section below.
  assert.equal(parseProductAddress("https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool").kind, "gitlab");
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

import { extendTokenSteps } from "../docs/assets/review-core.mjs";
import { tokenListUrl } from "../docs/assets/git-host.mjs";

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
  parseProductSettings,
  setProductSetting, pseudonymisationOn, savePseudonymisation, parseCollaborators, formatCollaborators,
  addCollaborator, removeCollaborator, saveCollaborators,
} from "../docs/assets/review-core.mjs";
import { tokenRefusal } from "../docs/assets/git-host.mjs";
import {
  TOKEN_KEY, TOKEN_EXPIRY_KEY, PRODUCTS_KEY, exportSettings, readSettingsFile, mergeSettings, PBKDF2_ITERATIONS,
} from "../docs/assets/settings-store.mjs";

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

// ---------------------------------------------------------------- GitLab products (queue 2026-09-24b)
// GITLAB PRODUCTS ARE SUPPORTED · A GITLAB PRODUCT IS WRITTEN WITH A TOKEN · A GITLAB PRODUCT USES A PROJECT
// ACCESS TOKEN · A PRODUCT IS NAMED BY ITS ADDRESS · A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT (UC-001 3c/3d,
// UC-008 3c, UC-018 4b, UC-006, UC-042). The GitLab server is a mock of the REST API v4 as GitLab documents it
// (doc/api/repositories.md, repository_files.md, commits.md, branches.md); no request leaves this process.

import {
  gitlabTokenSteps, gitlabNoProjectTokens, gitlabWriteRefusal, deriveTarget,
  expiryWarning, tokenBannerHtml, exportNotice, gitlabRole,
} from "../docs/assets/review-core.mjs";
import {
  gitlabAuth, gitlabApiBase, gitlabSnapshot, gitlabReadFile, commitFilesGitLab, writeFiles, writeRoute,
  gitlabTokenPageUrl, webFileUrl, authHeaders,
} from "../docs/assets/git-host.mjs";
import { GITLAB_TOKENS_KEY } from "../docs/assets/settings-store.mjs";

const GL = "https://gitlab.example.org";
const GL_ADDR = `${GL}/grp/sub/proj`;
const GL_TOKEN = "glpat-projectTOKENvalue0123456789";
const H0 = "a".repeat(40), H1 = "b".repeat(40), NEWC = "c".repeat(40);

// A GitLab server with one project and branch "main" at H0. files: { path: text } at H0.
// moveAt: after this many branch reads, the branch answers H1 (another commit arrived).
// parent: the parent GitLab reports for the commit it wrote (default: the branch head).
async function fakeGitLab({ files = {}, moveAt = null, parent = null, changed = [], postStatus = 201, postBody = null,
  project = "grp/sub/proj", server = GL } = {}) {
  const calls = [];
  const base = `/api/v4/projects/${encodeURIComponent(project)}`;
  const blobs = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([p, t]) => [p, await gitBlobSha(t)])));
  let branchReads = 0;
  const ok = (o, status = 200) => new Response(JSON.stringify(o), { status });
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), m = (init.method || "GET").toUpperCase(), h = init.headers || {};
    calls.push({ origin: url.origin, method: m, path: url.pathname, query: Object.fromEntries(url.searchParams),
      token: h["PRIVATE-TOKEN"], authorization: h.Authorization, body: init.body ? JSON.parse(init.body) : null });
    if (url.origin !== server || !url.pathname.startsWith(base)) return ok({ message: "404 Project Not Found" }, 404);
    const rest = url.pathname.slice(base.length);
    if (rest === "" && m === "GET") return ok({ path_with_namespace: project, default_branch: "main", visibility: "private",
      web_url: `${server}/${project}`, permissions: { project_access: { access_level: 30 } } });
    if (rest === "/repository/branches/main" && m === "GET") {
      branchReads += 1;
      return ok({ name: "main", commit: { id: moveAt !== null && branchReads > moveAt ? H1 : H0 } });
    }
    if (rest.startsWith("/repository/commits/") && m === "GET") return ok({ id: H0 });
    if (rest === "/repository/tree" && m === "GET") {
      const all = [...new Set(Object.keys(files).flatMap((p) => p.split("/").slice(0, -1).map((_, i, a) => a.slice(0, i + 1).join("/"))))]
        .map((p) => ({ id: "t".repeat(40), path: p, type: "tree" }))
        .concat(Object.keys(files).map((p) => ({ id: blobs[p], path: p, type: "blob" })));
      const per = Number(url.searchParams.get("per_page") || 20), page = Number(url.searchParams.get("page") || 1);
      return ok(all.slice((page - 1) * per, page * per));
    }
    if (rest.startsWith("/repository/files/") && m === "GET") {
      const raw = rest.endsWith("/raw");
      const p = decodeURIComponent(rest.slice("/repository/files/".length).replace(/\/raw$/, ""));
      if (!(p in files)) return ok({ message: "404 File Not Found" }, 404);
      return raw ? new Response(files[p], { status: 200 }) : ok({ file_path: p, blob_id: blobs[p], commit_id: H0, last_commit_id: "d".repeat(40) });
    }
    if (rest === "/repository/commits" && m === "POST") {
      if (postStatus !== 201) return ok(postBody || { message: "refused" }, postStatus);
      return ok({ id: NEWC, parent_ids: [parent || H0], web_url: `${server}/${project}/-/commit/${NEWC}` }, 201);
    }
    if (rest === "/repository/compare" && m === "GET") return ok({ diffs: changed.map((p) => ({ old_path: p, new_path: p })) });
    return ok({ message: "unexpected" }, 500);
  };
  return { calls, fetchMock, blobs };
}

test("A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address", () => {
  const p = parseProductAddress("https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool");
  assert.deepEqual(p, { address: "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool", host: "gitlab.rrze.fau.de",
    repo: "fau-ai-taskforce/tools/thesis-tool", server: "https://gitlab.rrze.fau.de", kind: "gitlab" });
  for (const v of ["https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool/", "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool.git",
    "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool/-/tree/main", " https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool/-/blob/main/SPEC.md "]) {
    assert.equal(parseProductAddress(v).address, "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool", v);
  }
  assert.equal(parseProductAddress("https://gitlab.com/alice/thesis").server, "https://gitlab.com");
  assert.equal(parseProductAddress("https://git.example.org:8443/a/b").server, "https://git.example.org:8443");
  // GitHub stays what it was.
  assert.deepEqual(parseProductAddress("https://github.com/alice/thesis"), { address: "https://github.com/alice/thesis", host: "github.com", repo: "alice/thesis" });
  // Counter-proof: no project path, a path that climbs, a credential in the address, plain http.
  for (const v of ["https://gitlab.com/alice", "https://gitlab.com/alice/../bob", "https://gitlab.com/-/alice", "https://oauth2:glpat-x@gitlab.com/a/b",
    "http://gitlab.com/a/b", "https://gitlab.com/a/b%2Fc"]) {
    assert.ok(parseProductAddress(v).error, `refused: ${v}`);
  }
});

test("A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else", async () => {
  const p = parseProductAddress(GL_ADDR);
  const auth = gitlabAuth(p, GL_TOKEN);
  const api = gitlabApiBase(p);
  assert.equal(api, `${GL}/api/v4/projects/grp%2Fsub%2Fproj`);
  const seen = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (u, init) => { seen.push([String(u), init.method, { ...init.headers }]); return new Response("{}"); };
  try {
    // Known positive: the issuing server's API for this project gets the token, as PRIVATE-TOKEN, and nothing else does.
    await fetchText(`${api}/repository/tree?ref=main`, {}, auth);
    assert.deepEqual(seen.at(-1), [`${api}/repository/tree?ref=main`, "GET", { "PRIVATE-TOKEN": GL_TOKEN }]);
    // Reading a public GitLab project without a token: the origin is reachable for this product, no header is sent.
    await fetchText(`${api}/repository/tree?ref=main`, {}, gitlabAuth(p, null));
    assert.deepEqual(seen.at(-1)[2], {});
    const n = seen.length;
    // Known negatives: every other destination is refused before a request is made.
    for (const [url, a, why] of [
      ["https://gitlab.other.org/api/v4/projects/grp%2Fsub%2Fproj", auth, /may only go|not allowed/],      // another GitLab
      [`${GL}/api/v4/projects/grp%2Fother`, auth, /may only go|not allowed/],                               // another project, same server
      [`${GL}/api/v4/user`, auth, /may only go|not allowed/],                                                // same server, outside the project
      [`${GL}/grp/sub/proj/-/raw/main/SPEC.md`, auth, /may only go|not allowed/],                            // same server, not the API
      ["https://api.github.com/repos/a/b", auth, /may only go|not allowed/],                                 // GitHub
      ["https://models.example.org/v1/chat/completions", auth, /not allowed|may only go/],                   // a model endpoint
      [`${api}/repository/tree?private_token=${GL_TOKEN}`, auth, /never placed in a URL/],                   // the token in the URL
      [`${api}/repository/tree`, "github_pat_11GITHUBTOKEN", /not allowed|may only go/],                    // the GitHub token to GitLab
      [`${api}/repository/tree`, null, /not allowed/],                                                       // GitLab without naming the product
    ]) {
      await assert.rejects(fetchText(url, {}, a), why, url);
    }
    // Without a token as well: naming a GitLab product opens that project's API, and no other origin or path.
    for (const url of ["https://gitlab.other.org/api/v4/projects/grp%2Fsub%2Fproj", "https://models.example.org/v1/chat/completions",
      `${GL}/api/v4/projects/grp%2Fother`, `${GL}/api/v4/user`]) {
      await assert.rejects(fetchText(url, {}, gitlabAuth(p, null)), /not allowed/, url);
    }
    await assert.rejects(fetchText(`${api}/repository/commits`, { method: "POST" }, auth), /GET/);
    await assert.rejects(fetchText(`${api}/x`, { headers: { "PRIVATE-TOKEN": "x" } }, auth), /header/);
    assert.equal(seen.length, n, "no refused request reached the network");
  } finally { globalThis.fetch = real; }
  // authHeaders: the same rule for writes.
  assert.deepEqual(authHeaders(`${api}/repository/commits`, auth), { "PRIVATE-TOKEN": GL_TOKEN });
  assert.deepEqual(authHeaders("https://api.github.com/repos/a/b", auth), {});
  assert.deepEqual(authHeaders(`https://gitlab.other.org/api/v4/projects/grp%2Fsub%2Fproj`, auth), {});
  assert.deepEqual(authHeaders(`${GL}/api/v4/projects/grp%2Fother/repository/commits`, auth), {}, "another project on the same server");
  assert.deepEqual(authHeaders(`${GL}/api/v4/user`, auth), {}, "the same server outside the project");
  assert.deepEqual(authHeaders(`${api}/x`, "github_pat_t"), {});
  assert.deepEqual(authHeaders("https://api.github.com/repos/a/b", "github_pat_t"), { Authorization: "Bearer github_pat_t" });
});

test("GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit", async () => {
  const p = parseProductAddress(GL_ADDR);
  const files = { "SPEC.md": "# S\n", "docs/use-cases/UC-001-a.md": B_UC1 };
  for (let i = 0; i < 130; i++) files[`docs/approvals/r${String(i).padStart(3, "0")}.md`] = `kind: use-case\nn: ${i}\n`;
  const g = await fakeGitLab({ files });
  const snap = await withFetch(g.fetchMock, () => gitlabSnapshot({ product: p, ref: "main", token: GL_TOKEN }));
  assert.equal(snap.commit, H0);
  assert.equal(snap.tree.length, 132, "all blobs of every page, no directories");
  assert.equal(snap.tree.find((e) => e.path === "docs/use-cases/UC-001-a.md").sha, await gitBlobSha(B_UC1), "tree entries carry the blob SHA");
  const treeCalls = g.calls.filter((c) => c.path.endsWith("/repository/tree"));
  assert.ok(treeCalls.length >= 2, "paged");
  assert.ok(treeCalls.every((c) => c.query.ref === H0 && c.query.recursive === "true"), "the tree of the pinned commit, not of the branch");
  const text = await withFetch(g.fetchMock, () => gitlabReadFile({ product: p, commit: H0, path: "docs/use-cases/UC-001-a.md", token: GL_TOKEN }));
  assert.equal(text, B_UC1);
  assert.equal(g.calls.at(-1).query.ref, H0);
  assert.equal(await withFetch(g.fetchMock, () => gitlabReadFile({ product: p, commit: H0, path: "nope.md", token: GL_TOKEN })), null);
  assert.ok(g.calls.every((c) => c.origin === GL && c.token === GL_TOKEN && c.authorization === undefined), "only to its server, only its token");
});

test("GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present", async () => {
  const p = parseProductAddress(GL_ADDR);
  const g = await fakeGitLab({ files: { "SPEC.md": B_SPEC } });
  const r = await withFetch(g.fetchMock, () => commitFilesGitLab({ product: p, branch: "main", message: "m", token: GL_TOKEN, click,
    files: [{ path: "SPEC.md", content: "new\n" }, { path: "docs/approvals/x.md", content: "kind: spec\n" }] }));
  const posts = g.calls.filter((c) => c.method === "POST");
  assert.equal(posts.length, 1, "exactly one commit");
  assert.equal(posts[0].path, `/api/v4/projects/${encodeURIComponent("grp/sub/proj")}/repository/commits`);
  assert.deepEqual(posts[0].body, { branch: "main", commit_message: "m", actions: [
    { action: "update", file_path: "SPEC.md", content: "new\n", encoding: "text", last_commit_id: H0 },
    { action: "create", file_path: "docs/approvals/x.md", content: "kind: spec\n", encoding: "text" }] });
  assert.equal(posts[0].body.force, undefined, "never force");
  assert.equal(posts[0].body.start_sha, undefined);
  assert.equal(r.sha, NEWC);
  assert.equal(r.url, `${GL}/grp/sub/proj/-/commit/${NEWC}`);
  assert.deepEqual(r.changedMeanwhile, []);
  assert.ok(g.calls.every((c) => c.origin === GL && c.token === GL_TOKEN), "every request to its server with its token");
});

test("A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no click: nothing is sent; the route is the token step", async () => {
  const p = parseProductAddress(GL_ADDR);
  const g = await fakeGitLab({ files: { "SPEC.md": B_SPEC } });
  const base = { product: p, branch: "main", message: "m", files: [{ path: "x.md", content: "x\n" }] };
  await withFetch(g.fetchMock, async () => {
    await assert.rejects(writeFiles({ ...base, token: null, click }), /token/);
    await assert.rejects(writeFiles({ ...base, token: GL_TOKEN }), /click/);
    await assert.rejects(writeFiles({ ...base, token: GL_TOKEN, click: { isTrusted: false } }), /click/);
    await assert.rejects(writeFiles({ ...base, token: "github_pat_11GITHUBTOKEN", click }), /GitLab project token/);
    await assert.rejects(commitFilesGitLab({ ...base, token: GL_TOKEN }), /click/, "the GitLab writer itself needs the click");
    await assert.rejects(commitFilesGitLab({ ...base, token: null, click }), /token/, "and the token");
  });
  assert.equal(g.calls.length, 0);
  assert.equal(writeRoute(p, null), "token-step");
  assert.equal(writeRoute(p, GL_TOKEN), "commit");
  const gh = parseProductAddress("https://github.com/alice/thesis");
  assert.equal(writeRoute(gh, null), "github-web", "GitHub keeps its web-interface fallback");
  assert.equal(writeRoute(gh, "github_pat_t"), "commit");
});

test("GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing", async () => {
  const p = parseProductAddress(GL_ADDR);
  const g = await fakeGitLab({ files: { "docs/use-cases/UC-001-a.md": "newer\n" } });
  await withFetch(g.fetchMock, () => assert.rejects(commitFilesGitLab({ product: p, branch: "main", message: "edit", token: GL_TOKEN, click,
    files: [{ path: "docs/use-cases/UC-001-a.md", content: "mine\n", expectBlob: "older" }] }), /changed since/));
  assert.ok(!g.calls.some((c) => c.method === "POST"), "nothing written");
  // The branch moved between the read the files were computed from and the commit: nothing is written.
  const m = await fakeGitLab({ files: { "SPEC.md": B_SPEC }, moveAt: 1 });
  await withFetch(m.fetchMock, () => assert.rejects(commitFilesGitLab({ product: p, branch: "main", message: "m", token: GL_TOKEN, click,
    files: [{ path: "SPEC.md", content: "x\n" }] }), /moved on|reload/));
  assert.ok(!m.calls.some((c) => c.method === "POST"), "nothing written");
  // GitLab's own refusal (last_commit_id, or a file created meanwhile) is passed on, with its status.
  const r = await fakeGitLab({ files: { "SPEC.md": B_SPEC }, postStatus: 400, postBody: { message: "The file has changed since you started editing it: SPEC.md" } });
  await withFetch(r.fetchMock, () => assert.rejects(commitFilesGitLab({ product: p, branch: "main", message: "m", token: GL_TOKEN, click,
    files: [{ path: "SPEC.md", content: "x\n" }] }), (e) => e.status === 400 && /changed since you started editing/.test(e.message)));
});

test("GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head", async () => {
  const p = parseProductAddress(GL_ADDR);
  const files = batchRepo(), heads = [];
  const g = await fakeGitLab({ files });
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const res = await withFetch(g.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click, items: [it],
    readAt: readerOf(files, heads), now: WHEN }));
  assert.deepEqual(res.leftOut, []);
  assert.ok(heads.length && heads.every((h) => h === H0), "every check reads the commit the new one is written on");
  const posts = g.calls.filter((c) => c.method === "POST");
  assert.equal(posts.length, 1);
  const acts = Object.fromEntries(posts[0].body.actions.map((a) => [a.file_path, a]));
  const rec = `docs/approvals/spec-2026-09-24g_x-05-${it.proposalBlob.slice(0, 12)}.md`;
  assert.deepEqual(Object.keys(acts).sort(), [`${QD}/entscheidungen.md`, "SPEC.md", rec].sort());
  assert.equal(acts["SPEC.md"].content, "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n" + B_P05);
  assert.equal(acts["SPEC.md"].action, "update");
  assert.equal(acts["SPEC.md"].last_commit_id, H0);
  assert.equal(acts[rec].action, "create");
  assert.match(acts[`${QD}/entscheidungen.md`].content, /\| 5 \| uebernommen \| approval:/);
  // A STALE APPROVAL IS NOT APPLIED — the proposal changed on the head: nothing is written.
  const s = await fakeGitLab({ files: batchRepo({ [`${QD}/05-a.md`]: B_P05 + "edited\n" }) });
  const res2 = await withFetch(s.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click, items: [it],
    readAt: readerOf(batchRepo({ [`${QD}/05-a.md`]: B_P05 + "edited\n" })), now: WHEN }));
  assert.equal(res2.commit, null);
  assert.match(res2.leftOut[0].reason, /proposal changed/);
  assert.ok(!s.calls.some((c) => c.method === "POST"), "nothing written");
});

test("GitLab: SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER — one commit", async () => {
  const p = parseProductAddress(GL_ADDR);
  const files = batchRepo();
  const u1 = await ucItem("UC-001", "docs/use-cases/UC-001-a.md", B_UC1), u2 = await ucItem("UC-002", "docs/use-cases/UC-002-b.md", B_UC2);
  const entries = [{ nr: 5, anchor: "## 10. R", bis: null, proposalText: B_P05 }, { nr: 6, anchor: "## 11. X", bis: null, proposalText: B_P06 }];
  const i05 = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const i06 = { ...(await specItem(6, B_P06, sectionForEntry({ specText: B_SPEC, entries, nr: 6 }).current, "## 11. X")), needs: [5] };
  const g = await fakeGitLab({ files });
  const res = await withFetch(g.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click,
    items: [u2, i06, u1, i05], readAt: readerOf(files), now: WHEN }));
  assert.deepEqual(res.leftOut, []);
  const posts = g.calls.filter((c) => c.method === "POST");
  assert.equal(posts.length, 1, "one commit for all four");
  const acts = posts[0].body.actions;
  assert.equal(acts.filter((a) => a.file_path.startsWith("docs/approvals/")).length, 4, "one record per ticked file");
  const spec = acts.find((a) => a.file_path === "SPEC.md").content;
  assert.equal(spec, "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n## 10. R\n\nnew ten\n\n" + B_P06);
  const rows = acts.find((a) => a.file_path.endsWith("entscheidungen.md")).content.split("\n").filter((l) => l.startsWith("| 2026"));
  assert.deepEqual(rows.map((r) => r.split("|")[2].trim()), ["5", "6"]);
});

test("GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed", async () => {
  const p = parseProductAddress(GL_ADDR);
  const files = batchRepo();
  const u1 = await ucItem("UC-001", "docs/use-cases/UC-001-a.md", B_UC1);
  // The branch did not move before the commit, but GitLab reports another parent: a commit arrived in between.
  const g = await fakeGitLab({ files, parent: H1, changed: ["docs/use-cases/UC-001-a.md"] });
  const res = await withFetch(g.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click, items: [u1],
    readAt: readerOf(files), now: WHEN }));
  assert.equal(res.commit.sha, NEWC);
  assert.deepEqual(res.commit.changedMeanwhile, ["docs/use-cases/UC-001-a.md"]);
  assert.match(res.warning, /UC-001-a\.md/);
  const cmp = g.calls.find((c) => c.path.endsWith("/repository/compare"));
  assert.deepEqual([cmp.query.from, cmp.query.to], [H0, H1]);
  // Counter-proof: the other commit changed an unrelated file — no warning.
  const g2 = await fakeGitLab({ files, parent: H1, changed: ["README.md"] });
  const res2 = await withFetch(g2.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click, items: [u1],
    readAt: readerOf(files), now: WHEN }));
  assert.equal(res2.warning, null);
});

test("ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub", async () => {
  const st = fakeStorage(), store = createStore(st);
  store.setGitLabToken(GL_ADDR, GL_TOKEN, "2026-12-29");
  const g = await fakeGitLab({ files: { "README.md": "# p\n", "SPEC.md": "# old\n" } });
  const r = await withFetch(g.fetchMock, () => addProduct({ address: GL_ADDR, token: GL_TOKEN, click, store }));
  assert.equal(r.commit.sha, NEWC);
  const posts = g.calls.filter((c) => c.method === "POST");
  assert.equal(posts.length, 1);
  assert.deepEqual(posts[0].body.actions.map((a) => [a.action, a.file_path]).sort(), [["create", "CHANGELOG.md"], ["create", "docs/approvals/README.md"],
    ["create", "docs/spec-freigaben/README.md"], ["create", "docs/use-cases/README.md"]]);
  assert.deepEqual(store.getProducts(), [GL_ADDR]);
  assert.ok(g.calls.every((c) => c.origin === GL && c.token === GL_TOKEN), "only the product's server, only its token");
  // Counter-proof: a refused write adds nothing to the list.
  const s2 = createStore(fakeStorage());
  const bad = await fakeGitLab({ files: {}, postStatus: 403, postBody: { message: "403 Forbidden" } });
  await withFetch(bad.fetchMock, () => assert.rejects(addProduct({ address: GL_ADDR, token: GL_TOKEN, click, store: s2 }), /403/));
  assert.deepEqual(s2.getProducts(), []);
});

test("A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the steps: the project's token page, name, role Maintainer, scope api, expiry", () => {
  const p = parseProductAddress(GL_ADDR);
  assert.equal(gitlabTokenPageUrl(p), `${GL_ADDR}/-/settings/access_tokens`);
  const s = gitlabTokenSteps(p).join("\n");
  for (const must of [/Agent M/, /role: Maintainer/, /\bapi\b/, /[Ee]xpir/, /Create project access token/, /glpat-/]) assert.match(s, must);
  assert.doesNotMatch(s, /Developer/, "the role the SPEC no longer prescribes is not asked for");
  assert.doesNotMatch(s, /Owner/, "no broader role is asked for");
  // UC-001 3d: which of the two it is, and why a personal token is broader.
  const self = gitlabNoProjectTokens(p);
  assert.match(self, /Maintainer/);
  assert.match(self, /personal access token/);
  assert.match(self, /every project/);
  const dotcom = gitlabNoProjectTokens(parseProductAddress("https://gitlab.com/alice/thesis"));
  assert.match(dotcom, /Premium or Ultimate/, "on gitlab.com the subscription decides");
  assert.doesNotMatch(self, /Premium/, "a self-managed server offers them with any licence");
  // A refused write (403) with a Maintainer token: the branch is protected even against Maintainers, or the token lacks scope api
  // or has a lower role — what GitLab answers 403 for; an expired token is a 401 and named elsewhere (tokenRefusal).
  const refusal = gitlabWriteRefusal(Object.assign(new Error("403 Forbidden"), { status: 403 }), p);
  for (const must of [/protected/, /Maintainers/, /\bapi\b/, /Maintainer/]) assert.match(refusal, must);
  assert.doesNotMatch(refusal, /Developer/);
  assert.doesNotMatch(refusal, /expired/, "an expired token is answered with 401, not 403");
  assert.equal(gitlabWriteRefusal(Object.assign(new Error("400"), { status: 400 }), p), null);
});

test("A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — a token below Maintainer is shown as unable to write to a protected default branch", () => {
  assert.deepEqual(gitlabRole(40), { role: "Maintainer", canWrite: true, note: "" });
  assert.equal(gitlabRole(50).canWrite, true);
  for (const level of [30, 20, 10, null]) {
    const r = gitlabRole(level);
    assert.equal(r.canWrite, false, String(level));
    assert.match(r.note, /protected default branch/);
    assert.match(r.note, /Maintainer/);
  }
  assert.equal(gitlabRole(30).role, "Developer");
  const app = readFileSync(new URL("../docs/assets/review-app.mjs", import.meta.url), "utf8");
  assert.match(app, /gitlabRole\(/, "the settings page takes the role check from the core");
  assert.doesNotMatch(app, /role Developer|role <em>Developer<\/em>|>= 30/, "the app names no Developer token any more");
});

test("AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page", async () => {
  const p = parseProductAddress(GL_ADDR);
  const g = { fetchMock: async () => new Response('{"message":"401 Unauthorized"}', { status: 401, statusText: "Unauthorized" }) };
  let err;
  await withFetch(g.fetchMock, async () => { try { await fetchText(`${gitlabApiBase(p)}`, {}, gitlabAuth(p, GL_TOKEN)); } catch (e) { err = e; } });
  const r = tokenRefusal(err, p);
  assert.equal(r.token, `GitLab project token for ${GL_ADDR}`);
  assert.equal(r.renewUrl, `${GL_ADDR}/-/settings/access_tokens`);
  assert.match(r.renew, /Rotate/);
  assert.equal(tokenRefusal(err).token, "GitHub token", "without a product it is the GitHub token, as before");
  const w = expiryWarning("2026-10-05", new Date("2026-09-30T12:00:00Z"), p);
  assert.match(w.text, /GitLab project token for .*proj/);
  assert.equal(w.renewUrl, `${GL_ADDR}/-/settings/access_tokens`);
  const b = tokenBannerHtml({ expires: null, refused: true, product: p });
  assert.match(b, /GitLab project token/);
  assert.ok(b.includes(`${GL_ADDR}/-/settings/access_tokens`));
});

test("GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear", () => {
  const st = fakeStorage(), s = createStore(st);
  s.setToken("github_pat_t");
  s.addProduct(GL_ADDR);
  s.setGitLabToken(GL_ADDR, ` ${GL_TOKEN} `, "2026-12-29");
  s.setGitLabToken("https://gitlab.com/alice/thesis", "glpat-other0123456789", null);
  assert.deepEqual(s.getGitLabToken(GL_ADDR), { token: GL_TOKEN, expires: "2026-12-29" });
  assert.equal(s.getGitLabToken(`${GL}/grp/sub/other`), null, "a project without its own token has none");
  assert.equal(s.getToken(), "github_pat_t", "the GitHub token is a separate entry");
  assert.ok([...st.mem.keys()].every((k) => k.startsWith(PREFIX)));
  s.removeProduct(GL_ADDR);
  assert.equal(s.getGitLabToken(GL_ADDR), null, "removing the product removes its token");
  assert.ok(s.getGitLabToken("https://gitlab.com/alice/thesis"));
  s.clearGitLabToken("https://gitlab.com/alice/thesis");
  assert.equal(st.getItem(GITLAB_TOKENS_KEY), null, "the last token cleared leaves no entry");
  s.setGitLabToken(GL_ADDR, GL_TOKEN, null);
  s.clear();
  assert.equal(st.mem.size, 0);
});

test("SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product", async () => {
  const s = createStore(fakeStorage());
  s.setGitLabToken(GL_ADDR, GL_TOKEN, "2026-12-29");
  s.addProduct(GL_ADDR);
  const file = await exportSettings(s.entries(), { now: WHEN });
  assert.ok(file.includes(GL_TOKEN));
  assert.match(exportNotice(s.entries()), /GitLab project token/);
  const t = createStore(fakeStorage());
  t.setGitLabToken("https://gitlab.com/alice/thesis", "glpat-mine0123456789", null);
  t.setGitLabToken(GL_ADDR, "glpat-newer0123456789", "2027-01-01");
  const m = mergeSettings(t.entries(), await readSettingsFile(file));
  t.putEntries(m.put);
  assert.deepEqual(t.getGitLabToken(GL_ADDR), { token: "glpat-newer0123456789", expires: "2027-01-01" }, "what this browser has is kept");
  assert.ok(m.kept.includes(`GitLab project token for ${GL_ADDR}`));
  const u = createStore(fakeStorage());
  const m2 = mergeSettings(u.entries(), await readSettingsFile(file));
  u.putEntries(m2.put);
  assert.deepEqual(u.getGitLabToken(GL_ADDR), { token: GL_TOKEN, expires: "2026-12-29" });
  assert.ok(m2.added.includes(`GitLab project token for ${GL_ADDR}`));
});

test("the dashboard is opened on a GitLab product by its address; its files link to GitLab", () => {
  const t = deriveTarget({ hostname: "reader.github.io", pathname: "/agent-m/", search: `?product=${encodeURIComponent(GL_ADDR)}` });
  assert.equal(t.instance, "reader/agent-m");
  assert.equal(t.repo, "grp/sub/proj");
  assert.equal(t.product.server, GL);
  assert.equal(t.refGiven, false);
  assert.equal(deriveTarget({ hostname: "reader.github.io", pathname: "/agent-m/", search: "?product=javascript:alert(1)" }).repo, "reader/agent-m");
  assert.equal(webFileUrl(parseProductAddress(GL_ADDR), "main", "docs/use-cases/UC-001 a.md"), `${GL_ADDR}/-/blob/main/docs/use-cases/UC-001%20a.md`);
  assert.equal(webFileUrl(parseProductAddress("https://github.com/a/b"), "main", "SPEC.md"), "https://github.com/a/b/blob/main/SPEC.md");
});

// ---------------------------------------------------------------- the last accepted text (queue 2026-09-30, entry 03)
// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT · AN APPROVAL NAMES THE EXACT TEXT · STATUS IS DERIVED FROM THE
// RECORDS (UC-008 2a). The accepted text is read by the blob SHA its record names; "most recent" is the record committed last,
// read from the server's commits of the record's path at the pinned commit. The servers are mocks of the documented endpoints
// (GitHub: GET /repos/{o}/{r}/commits?path=&sha=, GET /repos/{o}/{r}/git/blobs/{sha}; GitLab: GET
// /projects/:id/repository/commits?path=&ref_name=, GET /projects/:id/repository/blobs/:sha/raw).

import {
  recordsForId, lastAccepted, changedLines, diffHtml, readBlob,
} from "../docs/assets/review-core.mjs";
import { reviewedId } from "../docs/assets/artifacts.mjs";

const UC_OLD = "docs/use-cases/UC-010-run-a-stage-in-github-actions.md", UC_NEW = "docs/use-cases/UC-010-run-a-job-in-github-actions.md";
const A_TEXT = "---\nid: UC-010\ntitle: Run a job\nstage: runtime\n---\n# UC-010\n\nBody line one.\nBody line two.\n";
const B_TEXT = A_TEXT.replace("stage: runtime", "area: runtime");
const OLDER_TEXT = A_TEXT.replace("Body line one.", "An older first line.");
const PIN = "f".repeat(40);

// records: [{ text, file (the use case it names), date }] -> parsed records as the app keeps them, with their own path
async function recordsOf(list) {
  return Promise.all(list.map(async (r) => {
    const blob = await gitBlobSha(r.text);
    return { ...parseRecord(recordText(useCaseRecord(r.file, blob))), _path: approvalPath(reviewedId(r.file), blob), _date: r.date, _text: r.text };
  }));
}

function fakeHistoryGitHub(recs, repo = "a/b") {
  const calls = [];
  const blobs = Object.fromEntries(recs.map((r) => [r.blob, r._text]));
  const dates = Object.fromEntries(recs.map((r) => [r._path, r._date]));
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), p = url.pathname;
    calls.push({ origin: url.origin, path: p, query: Object.fromEntries(url.searchParams), auth: init.headers?.Authorization, method: init.method });
    const ok = (o) => new Response(JSON.stringify(o), { status: 200 });
    if (p === `/repos/${repo}/commits`) {
      const d = dates[url.searchParams.get("path")];
      return ok(d ? [{ sha: "c".repeat(40), commit: { committer: { date: d }, author: { date: "2000-01-01T00:00:00Z" } } }] : []);
    }
    const m = p.match(new RegExp(`^/repos/${repo}/git/blobs/([0-9a-f]{40})$`));
    if (m && m[1] in blobs) {
      const b64 = Buffer.from(blobs[m[1]], "utf8").toString("base64").replace(/(.{60})/g, "$1\n");
      return ok({ sha: m[1], size: Buffer.byteLength(blobs[m[1]]), content: b64, encoding: "base64" });
    }
    return new Response('{"message":"Not Found"}', { status: 404, statusText: "Not Found" });
  };
  return { calls, fetchMock };
}

test("reviewedId: a reviewed file's identifier from its path — the same for a renamed file", () => {
  assert.equal(reviewedId(UC_OLD), "UC-010");
  assert.equal(reviewedId(UC_NEW), "UC-010");
  assert.equal(reviewedId("docs/use-cases/README.md"), null);
  const recs = [useCaseRecord(UC_OLD, "a".repeat(40)), useCaseRecord("docs/use-cases/UC-011-x.md", "b".repeat(40)),
    specRecord({ queue: "q", entry: 1, proposal: "q/UC-010-named-like-a-use-case.md", blob: "c".repeat(40), target: "SPEC.md", anchor: "## 1", section: "d".repeat(40) })];
  assert.deepEqual(recordsForId(recs, "UC-010"), [recs[0]], "only the records of that identifier, and no SPEC record");
});

test("A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — one changed line shows exactly that line", async () => {
  const recs = await recordsOf([{ text: A_TEXT, file: UC_NEW, date: "2026-09-24T18:15:06Z" }]);
  const g = fakeHistoryGitHub(recs);
  const last = await withFetch(g.fetchMock, () => lastAccepted({ repo: "a/b", commit: PIN, token: "github_pat_t", records: recs, id: "UC-010" }));
  assert.equal(last.text, A_TEXT, "the text the record names, read by its blob SHA");
  assert.equal(last.record.blob, recs[0].blob);
  assert.deepEqual(changedLines(last.text, B_TEXT), [["+", "area: runtime"], ["-", "stage: runtime"]]);
  const html = diffHtml(last.text, B_TEXT);
  assert.deepEqual([...html.matchAll(/<span class="d(add|del)">([^<]*)<\/span>/g)].map((m) => [m[1], m[2]]),
    [["add", "+ area: runtime"], ["del", "- stage: runtime"]]);
  // One record: no commit history is needed, only the blob.
  assert.deepEqual(g.calls.map((c) => c.path), [`/repos/a/b/git/blobs/${recs[0].blob}`]);
  assert.ok(g.calls.every((c) => c.origin === "https://api.github.com" && c.auth === "Bearer github_pat_t" && c.method === "GET"));
  // Counter-proof: identical texts show no line at all.
  assert.deepEqual(changedLines(B_TEXT, B_TEXT), []);
});

test("A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared", async () => {
  // Listed in both orders: only the commit date decides, not the order of the list or of the blob SHAs.
  const both = await recordsOf([{ text: A_TEXT, file: UC_NEW, date: "2026-09-30T13:05:52Z" },
    { text: OLDER_TEXT, file: UC_NEW, date: "2026-09-24T18:05:39Z" }]);
  for (const order of [[0, 1], [1, 0]]) {
    const recs = order.map((i) => both[i]);
    const g = fakeHistoryGitHub(recs);
    const last = await withFetch(g.fetchMock, () => lastAccepted({ repo: "a/b", commit: PIN, token: null, records: recs, id: "UC-010" }));
    assert.equal(last.text, A_TEXT, `order ${order}`);
    assert.equal(last.count, 2);
    assert.equal(last.committedAt, "2026-09-30T13:05:52Z");
    assert.deepEqual(changedLines(last.text, B_TEXT), [["+", "area: runtime"], ["-", "stage: runtime"]]);
    const blobCalls = g.calls.filter((c) => c.path.includes("/git/blobs/"));
    assert.deepEqual(blobCalls.map((c) => c.path.split("/").pop()), [both[0].blob], "the older text is never read");
    const commitCalls = g.calls.filter((c) => c.path.endsWith("/commits"));
    assert.deepEqual(commitCalls.map((c) => c.query.path).sort(), both.map((r) => r._path).sort(), "one history read per record");
    assert.ok(commitCalls.every((c) => c.query.sha === PIN && c.query.per_page === "1"), "at the pinned commit");
    assert.ok(g.calls.every((c) => c.auth === undefined), "without a token, none is sent");
  }
});

test("A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — a renamed file finds its records by identifier", async () => {
  // UC-010 as on 2026-09-30: two records name the old path; the file now has another name.
  const recs = await recordsOf([{ text: OLDER_TEXT, file: UC_OLD, date: "2026-09-24T18:15:06Z" },
    { text: A_TEXT, file: UC_OLD, date: "2026-09-30T13:02:39Z" },
    { text: "---\nid: UC-011\n---\n", file: "docs/use-cases/UC-011-x.md", date: "2026-09-30T13:30:00Z" }]);
  assert.equal(deriveUseCaseStatus(UC_NEW, await gitBlobSha(B_TEXT), recs), "open", "by path the renamed file has no record");
  const g = fakeHistoryGitHub(recs);
  const last = await withFetch(g.fetchMock, () => lastAccepted({ repo: "a/b", commit: PIN, token: "github_pat_t", records: recs, id: reviewedId(UC_NEW) }));
  assert.equal(last.record.file, UC_OLD);
  assert.equal(last.text, A_TEXT);
  assert.deepEqual(changedLines(last.text, B_TEXT), [["+", "area: runtime"], ["-", "stage: runtime"]]);
  assert.ok(!g.calls.some((c) => (c.query.path || "").includes("UC-011")), "another identifier's record is not consulted");
  // Counter-proof: an identifier without records has nothing to compare, and nothing is read.
  const g2 = fakeHistoryGitHub(recs);
  assert.equal(await withFetch(g2.fetchMock, () => lastAccepted({ repo: "a/b", commit: PIN, token: null, records: recs, id: "UC-012" })), null);
  assert.equal(g2.calls.length, 0);
});

test("the accepted text is the exact text its record names — a blob that does not hash to it is refused", async () => {
  const recs = await recordsOf([{ text: A_TEXT, file: UC_NEW, date: "2026-09-24T18:15:06Z" }]);
  const g = fakeHistoryGitHub([{ ...recs[0], _text: A_TEXT + "tampered\n" }]);
  await withFetch(g.fetchMock, () => assert.rejects(lastAccepted({ repo: "a/b", commit: PIN, token: null, records: recs, id: "UC-010" }), /blob/));
  // A record whose blob is not a SHA is not turned into a request.
  const n = g.calls.length;
  await withFetch(g.fetchMock, () => assert.rejects(readBlob({ repo: "a/b", blob: "../../x", token: null }), /blob SHA/));
  assert.equal(g.calls.length, n);
});

test("A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — GitLab: its commits and blob endpoints, its own token only", async () => {
  const p = parseProductAddress(GL_ADDR);
  const recs = await recordsOf([{ text: OLDER_TEXT, file: UC_OLD, date: "2026-09-24T18:15:06.000+00:00" },
    { text: A_TEXT, file: UC_OLD, date: "2026-09-30T13:02:39.000+00:00" }]);
  const calls = [], base = `/api/v4/projects/${encodeURIComponent("grp/sub/proj")}`;
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), rest = url.pathname.slice(base.length);
    calls.push({ origin: url.origin, path: url.pathname, query: Object.fromEntries(url.searchParams), token: init.headers?.["PRIVATE-TOKEN"], auth: init.headers?.Authorization });
    if (url.origin !== GL || !url.pathname.startsWith(base)) return new Response("{}", { status: 404 });
    if (rest === "/repository/commits") {
      const r = recs.find((x) => x._path === url.searchParams.get("path"));
      return new Response(JSON.stringify(r ? [{ id: "c".repeat(40), committed_date: r._date, authored_date: "2000-01-01T00:00:00Z" }] : []));
    }
    const m = rest.match(/^\/repository\/blobs\/([0-9a-f]{40})\/raw$/);
    const r = m && recs.find((x) => x.blob === m[1]);
    return r ? new Response(r._text) : new Response("{}", { status: 404 });
  };
  const last = await withFetch(fetchMock, () => lastAccepted({ product: p, commit: PIN, token: GL_TOKEN, records: recs, id: "UC-010" }));
  assert.equal(last.text, A_TEXT);
  assert.deepEqual(changedLines(last.text, B_TEXT), [["+", "area: runtime"], ["-", "stage: runtime"]]);
  const commits = calls.filter((c) => c.path.endsWith("/repository/commits"));
  assert.equal(commits.length, 2);
  assert.ok(commits.every((c) => c.query.ref_name === PIN && c.query.per_page === "1"));
  assert.deepEqual(calls.filter((c) => c.path.includes("/blobs/")).map((c) => c.path), [`${base}/repository/blobs/${recs[1].blob}/raw`]);
  assert.ok(calls.every((c) => c.origin === GL && c.token === GL_TOKEN && c.auth === undefined), "only its server, only its project token");
});

test("the dashboard shows the last accepted text above a changed use case, with the core's diff", () => {
  const app = readFileSync(new URL("../docs/assets/review-app.mjs", import.meta.url), "utf8");
  const view = app.match(/async function viewUseCase\([\s\S]*?\n}\n/)[0];
  assert.ok(view.includes("accepted-diff"), "the panel is part of the use-case view");
  assert.ok(view.indexOf("accepted-diff") < view.indexOf('<article class="md doc">'), "above the text");
  assert.match(app, /lastAccepted\(/);
  assert.doesNotMatch(app, /function (lineDiff|diffHtml)\(/, "one diff, in the core — not a second copy in the app");
});

// ---------------------------------------------------------------- jump host and remote sessions (queue 2026-09-30, entries 01, 02)
// EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE · THE DASHBOARD WRITES THE TUNNEL COMMANDS · A REVERSE TUNNEL
// LISTENS ONLY ON THE JUMP HOST'S LOOPBACK · THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS (UC-011 1c, UC-042)

import {
  jumpHostProblem, nextFreePort, addRemoteSession, tunnelCommands, tunnelBindProblems, probeLocalPort,
} from "../docs/assets/bridge-tunnel.mjs";
import { JUMP_HOST_KEY, REMOTE_SESSIONS_KEY, KEYS } from "../docs/assets/settings-store.mjs";

const JUMP = { host: "jump.example.org", user: "agentm", portFrom: 20001, portTo: 20003,
  reverseKey: "~/.ssh/agent-m-jump", forwardKey: "~/.ssh/id_ed25519" };
const BRIDGE_TOKEN = "bridgeTOKEN-0123456789abcdef";

test("EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so", () => {
  assert.equal(nextFreePort(JUMP, []), 20001);
  let list = addRemoteSession(JUMP, [], { name: "lab-pc", bridgePort: 8765, token: BRIDGE_TOKEN });
  assert.deepEqual(list, [{ name: "lab-pc", port: 20001, bridgePort: 8765, token: BRIDGE_TOKEN }]);
  list = addRemoteSession(JUMP, list, { name: "gpu", bridgePort: 8765, token: "" });
  assert.equal(list[1].port, 20002, "the next free one");
  // A freed port is the lowest free port again.
  const gap = addRemoteSession(JUMP, [list[1]], { name: "third", bridgePort: 8765 });
  assert.equal(gap[1].port, 20001);
  // A port chosen by hand must lie in the range and be free.
  assert.throws(() => addRemoteSession(JUMP, list, { name: "x", port: 20002, bridgePort: 1 }), /20002.*gpu/);
  assert.throws(() => addRemoteSession(JUMP, list, { name: "x", port: 20009, bridgePort: 1 }), /20001–20003/);
  assert.equal(addRemoteSession(JUMP, list, { name: "x", port: 20003, bridgePort: 1 })[2].port, 20003);
  assert.throws(() => addRemoteSession(JUMP, list, { name: "lab-pc", bridgePort: 1 }), /already/);
  // Counter-proof: a range with no free port refuses a new session and says so.
  const full = addRemoteSession(JUMP, list, { name: "x", bridgePort: 1 });
  assert.throws(() => nextFreePort(JUMP, full), /No free port.*20001–20003/);
  assert.throws(() => addRemoteSession(JUMP, full, { name: "y", bridgePort: 1 }), /No free port/);
  const ports = full.map((s) => s.port);
  assert.equal(new Set(ports).size, ports.length, "no two sessions share a port");
});

test("the jump host's settings are checked — a host, user or key name that could change the command is refused", () => {
  assert.equal(jumpHostProblem(JUMP), null);
  assert.equal(jumpHostProblem({ ...JUMP, host: "10.0.0.7" }), null);
  for (const bad of [{ host: "" }, { host: "-oProxyCommand=x" }, { host: "a b" }, { host: "jump;rm -rf ~" }, { user: "" }, { user: "a b" },
    { user: "-l" }, { portFrom: 20003, portTo: 20001 }, { portFrom: 80 }, { portTo: 70000 }, { portFrom: "x" },
    { reverseKey: "-----BEGIN OPENSSH PRIVATE KEY-----" }, { forwardKey: "~/.ssh/id ed" }, { reverseKey: "-i" }, { forwardKey: "a\nb" }]) {
    assert.ok(jumpHostProblem({ ...JUMP, ...bad }), JSON.stringify(bad));
  }
  assert.throws(() => addRemoteSession({ ...JUMP, host: "" }, [], { name: "a", bridgePort: 1 }), /host/i);
  for (const bad of [{ name: "" }, { name: "a|b" }, { bridgePort: 0 }, { bridgePort: 70000 }, { token: "has space" }]) {
    assert.throws(() => addRemoteSession(JUMP, [], { name: "a", bridgePort: 8765, ...bad }), Error, JSON.stringify(bad));
  }
});

test("THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other", () => {
  const s = addRemoteSession(JUMP, [], { name: "lab-pc", bridgePort: 8765, token: BRIDGE_TOKEN })[0];
  const c = tunnelCommands(JUMP, s);
  assert.equal(c.reverse, "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes " +
    "-i ~/.ssh/agent-m-jump -R 127.0.0.1:20001:127.0.0.1:8765 agentm@jump.example.org");
  assert.equal(c.forward, "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes " +
    "-i ~/.ssh/id_ed25519 -L 127.0.0.1:20001:127.0.0.1:20001 agentm@jump.example.org");
  assert.equal(c.url, "http://localhost:20001");
  // A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK: the jump-host end is bound to 127.0.0.1 explicitly.
  assert.match(c.reverse, / -R 127\.0\.0\.1:20001:/);
  for (const cmd of [c.reverse, c.forward]) {
    assert.deepEqual(tunnelBindProblems(cmd), []);
    assert.doesNotMatch(cmd, /0\.0\.0\.0|\*|GatewayPorts|\s-g\s/);
    assert.ok(!cmd.includes(BRIDGE_TOKEN), "no bridge token in a command");
  }
  // Without key file names the key option is left to ssh's defaults, and nothing else changes.
  const bare = tunnelCommands({ ...JUMP, reverseKey: "", forwardKey: "" }, s);
  assert.doesNotMatch(bare.reverse + bare.forward, / -i /);
  assert.match(bare.reverse, / -R 127\.0\.0\.1:20001:127\.0\.0\.1:8765 agentm@jump\.example\.org$/);
  // Counter-proof: every other bind address of either end is caught.
  for (const bad of ["ssh -N -R 0.0.0.0:20001:127.0.0.1:8765 u@h", "ssh -N -R *:20001:127.0.0.1:8765 u@h",
    "ssh -N -R :20001:127.0.0.1:8765 u@h", "ssh -N -R 20001:127.0.0.1:8765 u@h", "ssh -N -R 192.168.1.5:20001:127.0.0.1:8765 u@h",
    "ssh -N -L 0.0.0.0:20001:127.0.0.1:20001 u@h", "ssh -N -L 20001:127.0.0.1:20001 u@h", "ssh -N -R 127.0.0.1:20001:10.0.0.2:8765 u@h",
    "ssh -N -g -L 127.0.0.1:20001:127.0.0.1:20001 u@h", "ssh -N -o GatewayPorts=yes -R 127.0.0.1:20001:127.0.0.1:8765 u@h",
    "ssh -N u@h"]) {
    assert.ok(tunnelBindProblems(bad).length, bad);
  }
});

test("THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear", async () => {
  const st = fakeStorage(), s = createStore(st);
  assert.ok(KEYS.includes(JUMP_HOST_KEY) && KEYS.includes(REMOTE_SESSIONS_KEY));
  s.setJumpHost(JUMP);
  const sessions = addRemoteSession(JUMP, [], { name: "lab-pc", bridgePort: 8765, token: BRIDGE_TOKEN });
  s.setRemoteSessions(sessions);
  assert.deepEqual(s.getJumpHost(), JUMP);
  assert.deepEqual(s.getRemoteSessions(), sessions);
  assert.ok([...st.mem.keys()].every((k) => k.startsWith(PREFIX)));
  // Exported with the bridge token, named in the notice; imported into an empty browser as they were.
  const file = await exportSettings(s.entries(), { now: WHEN });
  assert.ok(file.includes(BRIDGE_TOKEN));
  assert.match(exportNotice(s.entries()), /bridge token/i);
  const t = createStore(fakeStorage());
  const m = mergeSettings(t.entries(), await readSettingsFile(file));
  t.putEntries(m.put);
  assert.deepEqual(t.getJumpHost(), JUMP);
  assert.deepEqual(t.getRemoteSessions(), sessions);
  // UC-042 6a: a session this browser has is kept; one whose port is taken here is not added, and both are listed.
  const u = createStore(fakeStorage());
  u.setJumpHost(JUMP);
  u.setRemoteSessions([{ name: "lab-pc", port: 20003, bridgePort: 1, token: "mine" }, { name: "other", port: 20001, bridgePort: 1, token: "" }]);
  const m2 = mergeSettings(u.entries(), await readSettingsFile(file));
  u.putEntries(m2.put);
  assert.deepEqual(u.getRemoteSessions().map((x) => [x.name, x.port, x.token]), [["lab-pc", 20003, "mine"], ["other", 20001, ""]]);
  assert.ok(m2.kept.some((k) => /lab-pc/.test(k)));
  // Counter-proof: a session that is new here but whose port a session of this browser uses is not added — no two share a port.
  const w = createStore(fakeStorage());
  w.setJumpHost(JUMP);
  w.setRemoteSessions([{ name: "other", port: 20001, bridgePort: 1, token: "" }]);
  const m3 = mergeSettings(w.entries(), await readSettingsFile(file));
  w.putEntries(m3.put);
  assert.deepEqual(w.getRemoteSessions().map((x) => x.name), ["other"]);
  assert.ok(m3.kept.some((k) => /lab-pc.*20001/.test(k)), "and the page says why");
  // A CLEAR IS A REAL CLEAR: clearing removes them from storage.
  s.clearRemoteSession("lab-pc");
  assert.deepEqual(s.getRemoteSessions(), []);
  assert.equal(st.getItem(REMOTE_SESSIONS_KEY), null, "the last session cleared leaves no entry");
  s.setRemoteSessions(sessions);
  s.clear();
  assert.equal(st.mem.size, 0);
  assert.equal(s.getJumpHost(), null);
});

test("a remote session is tested by asking whether anything answers at its local port — no token, nothing else", async () => {
  const seen = [];
  const ok = await withFetch(async (u, init) => { seen.push([String(u), init]); return new Response(null, { status: 200 }); },
    () => probeLocalPort(20001));
  assert.equal(ok, true);
  assert.equal(seen[0][0], "http://localhost:20001/");
  assert.equal(seen[0][1].mode, "no-cors");
  assert.equal(seen[0][1].credentials, "omit");
  assert.deepEqual(seen[0][1].headers ?? {}, {}, "no token, no header");
  const down = await withFetch(async () => { throw new TypeError("Failed to fetch"); }, () => probeLocalPort(20001));
  assert.equal(down, false);
  for (const bad of [0, 70000, "20001/../x", "1e3", null]) await assert.rejects(probeLocalPort(bad), /port/, String(bad));
});

// ---------------------------------------------------------------- collaborators by the account syntax of the product's server

test("A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — a GitLab product accepts GitLab user names, a GitHub product GitHub's", () => {
  const add = { name: "Ann Lee", agreed: "2026-09-30", consent: true };
  // GitLab: letters, digits, '_', '-', '.'; not starting with '-', not ending in '.', '.git' or '.atom' (lib/gitlab/path_regex.rb).
  for (const a of ["ann.lee", "ann_lee", "a", "_x", "ann-lee.2"]) {
    assert.equal(addCollaborator([], { ...add, account: a, gitlab: true }).at(-1).account, a, a);
  }
  for (const a of ["-ann", "ann.", "ann.git", "ann.atom", "ann lee", "ann@x"]) {
    assert.throws(() => addCollaborator([], { ...add, account: a, gitlab: true }), /GitLab/, a);
  }
  // GitHub stays as it was: no '.' or '_'.
  for (const a of ["ann.lee", "ann_lee", "-ann"]) assert.throws(() => addCollaborator([], { ...add, account: a }), /GitHub/, a);
  assert.equal(addCollaborator([], { ...add, account: "ann-lee" }).at(-1).account, "ann-lee");
  // The file keeps such names: a GitLab name with '.' and '_' survives formatting and parsing.
  const list = [{ name: "Ann Lee", account: "ann.lee_2", agreed: "2026-09-30" }];
  assert.deepEqual(parseCollaborators(formatCollaborators(list, "grp/proj")), list);
});
