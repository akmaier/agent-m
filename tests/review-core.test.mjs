// Review core — deterministic, no network. Run: node --test tests/
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-23_review-dashboard-tests.md.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
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
  assert.doesNotMatch(app.replace(/fetchText\(/g, ""), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie/);
});
