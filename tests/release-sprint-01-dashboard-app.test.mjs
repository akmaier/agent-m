// Release tests of the sprint 01 increment — the dashboard, driven like a person (ITM-141). Written by tester-opus
// (claude-opus-5-5), the Release tester of docs/process.md, who implemented nothing of the increment, from the use cases and
// the SPEC alone; started on sprint/02 at ef4f619 (main at 385f5cf plus records only), 2026-10-01.
//
// Module: MOD-dashboard-app
// Guards: UC-001; UC-006; UC-008; UC-014; UC-042; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; ONE GITHUB TOKEN SERVES EVERY FEATURE; THE TOKEN LINK IS PREFILLED; THE REPOSITORY CHOICE IS SPELLED OUT; A TOKEN IS SCOPED TO WHAT IT WRITES; PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF; SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS; REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
// Level: release
//
// The real dashboard (docs/assets/dashboard-app.mjs) runs in tests/app-harness.mjs against fake GitHub and GitLab servers; no
// request leaves the process. Every case names, above it, the use-case flow or the SPEC rule it was written from and states its
// expected result before it runs (SOFTWARE_MAINTENANCE.md §4.0a rule 1). A case that fails on the increment is a finding: it
// stays here marked { todo } with the backlog item that will make it pass (ITM-141, *Kind and level*).
//
// What this file adds to the harness, for the person's clicks the harness cannot make by itself (its controls are found only by
// an attribute selector inside <main>): elements reached by id keep the listeners a view adds and are replaced, like a browser's,
// when their container is written anew (live()); the editor panel of a reviewed file is reached as a browser would reach it
// (the textarea holds the text the page rendered). confirm, the clipboard, window.open and a file chosen for import are
// stand-ins that record what the page asked of them.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { resolveObjectURL } from "node:buffer";
import { repoServer, openDashboard, TOKEN } from "./app-harness.mjs";

const API = "https://api.github.com";
const INSTANCE = "akmaier/agent-m";
const PRODUCT = "alice/thesis-tool";
const GL_ORIGIN = "https://gitlab.example.org", GL_PROJECT = "team/proj", GL_ADDRESS = `${GL_ORIGIN}/${GL_PROJECT}`;
const GL_TOKEN = "glpat-RELEASE0123456789abcdef";
const NEW_TOKEN = "github_pat_RENEWED0123456789abcdefghij";

// ---------------------------------------------------------------- an oracle of this file's own

const blobSha = (t) => createHash("sha1").update(`blob ${Buffer.byteLength(t)}\0`).update(t).digest("hex");
const isoDay = (d) => d.toISOString().slice(0, 10);
const daysFromToday = (n) => { const now = new Date(); return isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + n * 864e5)); };
const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const header = (h, name) => Object.entries(h || {}).find(([k]) => k.toLowerCase() === name)?.[1] ?? null;
const stripTags = (html) => unescape(String(html).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
const hrefs = (html) => [...String(html).matchAll(/href="([^"]*)"/g)].map((m) => unescape(m[1]));
const sections = (html) => String(html).split(/<section class="step">/).slice(1);

// ---------------------------------------------------------------- fixtures: an instance, a product, a GitLab project

const useCase = (id, title, line = "The reader opens the report.") => `---
id: ${id}
title: ${title}
area: test
actors:
  - Reader
realises:
  - RULE ONE
---
# ${id} ${title}

**Goal.** The reader gets the report.

## Actors

- **Reader** — reads reports.

## Precondition

- A report exists.

## Main flow

1. ${line}

\`\`\`mermaid
sequenceDiagram
    actor R as Reader
    R->>R: read the report ${id}
\`\`\`

## Alternative flows

- **1a. No report.** The reader is told so.

## Postcondition

- The reader has read the report.
`;
const ucRecord = (path, text) => `kind: use-case\nfile: ${path}\nblob: ${blobSha(text)}\n`;

const SPEC = `# Test product — Specification

**VERBINDLICH (SPEC)**

## 1. Rules

**RULE ONE** *(PO, 2026-01-01)*
Rule one holds.
*Occasion:* a test.
*Check:* no automatic check; at review.

## 2. More

**RULE TWO** *(PO, 2026-01-01)*
Rule two holds as first written.
*Occasion:* a test.
*Check:* no automatic check; at review.

## 3. Last

**RULE THREE** *(PO, 2026-01-01)*
Rule three holds.
*Occasion:* a test.
*Check:* no automatic check; at review.
`;
const Q = "docs/spec-freigaben/2026-01-01a_wording";
const PROPOSAL = `## 2. More

**RULE TWO** *(PO, 2026-01-01, reworded 2026-01-02)*
Rule two holds in its PROPOSED-WORDING.
*Occasion:* a test.
*Check:* no automatic check; at review.
`;
const queue = (dir, title, rows, entries) => ({
  [`${dir}/index.md`]: `# SPEC approvals — queue ${title}\n\n**Zieldatei aller Einträge:** \`SPEC.md\`\n\n` +
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |\n|---|---|---|---|---|\n" +
    rows.map(([nr, anchor]) => `| ${nr} | \`SPEC.md\` | ${anchor} | — | — |`).join("\n") + "\n",
  [`${dir}/entscheidungen.md`]: `# Decisions — queue ${title}\n\nAppend-only.\n`,
  ...entries,
});

const UC1 = "docs/use-cases/UC-001-read-a-report.md", UC2 = "docs/use-cases/UC-002-file-a-report.md", UC3 = "docs/use-cases/UC-003-sign-a-report.md";
const UC3_ACCEPTED = useCase("UC-003", "Sign a report", "The reader signs the report as accepted.");
const UC3_NOW = useCase("UC-003", "Sign a report", "The reader signs the report as CHANGED-SINCE.");
function instanceFiles(extra = {}) {
  const uc2 = useCase("UC-002", "File a report");
  return {
    "SPEC.md": SPEC,
    [UC1]: useCase("UC-001", "Read a report"),
    [UC2]: uc2,
    [UC3]: UC3_NOW,
    [`docs/approvals/UC-002-${blobSha(uc2).slice(0, 12)}.md`]: ucRecord(UC2, uc2),
    [`docs/approvals/UC-003-${blobSha(UC3_ACCEPTED).slice(0, 12)}.md`]: ucRecord(UC3, UC3_ACCEPTED),
    ...queue(Q, "2026-01-01a · wording", [["01", "## 2. More"]], {
      [`${Q}/01-rule-two.md`]: PROPOSAL,
      [`${Q}/01-rule-two.begruendung.md`]: "# Rationale\n\nThe RATIONALE-TEXT of the change.\n",
    }),
    ...extra,
  };
}

// The product's repository on GitHub, as UC-001 adds it.
async function productServer({ files = { "README.md": "# Thesis tool\n" }, refuse = null, privateRepo = false } = {}) {
  let p;
  const handlers = [
    (u, init) => (refuse ? refuse(u, init) : undefined),
    (u) => (privateRepo && u.pathname === `/repos/${PRODUCT}` ? new Response(JSON.stringify({ private: true, default_branch: "main" }), { status: 200 }) : undefined),
    // The branch's tree by the branch's name, as GitHub answers it.
    (u, init) => (u.pathname === `/repos/${PRODUCT}/git/trees/main` ? p.fetch(new URL(u.href.replace("/git/trees/main", `/git/trees/${p.head}`)), init) : undefined),
  ];
  p = await repoServer({ repo: PRODUCT, files, handlers });
  return p;
}

// A GitLab project on its own server: the REST API v4 the dashboard reads and writes, its project token, and every request.
function gitlabServer({ files = { "README.md": "# Proj\n" }, visibility = "private", accessLevel = 40, refuseToken = false } = {}) {
  const s = { files: { ...files }, head: "a".repeat(40), seq: 0, writes: [], requests: [], refuseToken };
  const base = `/api/v4/projects/${encodeURIComponent(GL_PROJECT)}`;
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
  s.fetch = async (u, init = {}) => {
    const method = (init.method || "GET").toUpperCase(), tok = header(init.headers, "private-token");
    s.requests.push({ method, url: u.href, token: tok, auth: header(init.headers, "authorization") });
    if (!u.pathname.startsWith(base)) return json({ message: "404 Not Found" }, 404);
    if (tok && (s.refuseToken || tok !== GL_TOKEN)) return json({ message: "401 Unauthorized" }, 401);
    const authed = tok === GL_TOKEN;
    if (visibility !== "public" && !authed) return json({ message: "404 Project Not Found" }, 404);
    const rest = u.pathname.slice(base.length);
    if (method === "GET" && rest === "") {
      return json({ path_with_namespace: GL_PROJECT, default_branch: "main", visibility,
        permissions: { project_access: authed ? { access_level: accessLevel } : null, group_access: null } });
    }
    if (method === "GET" && rest.startsWith("/repository/commits/")) return json({ id: s.head });
    if (method === "GET" && rest === "/repository/tree") {
      return json(u.searchParams.get("page") === "1" ? Object.keys(s.files).sort().map((path) => ({ type: "blob", path, id: blobSha(s.files[path]) })) : []);
    }
    if (method === "GET" && rest.startsWith("/repository/branches/")) return json({ commit: { id: s.head } });
    const raw = /^\/repository\/files\/([^/]+)\/raw$/.exec(rest);
    if (method === "GET" && raw) { const p = decodeURIComponent(raw[1]); return p in s.files ? new Response(s.files[p]) : json({ message: "404 File Not Found" }, 404); }
    const meta = /^\/repository\/files\/([^/]+)$/.exec(rest);
    if (method === "GET" && meta) { const p = decodeURIComponent(meta[1]); return p in s.files ? json({ file_path: p, blob_id: blobSha(s.files[p]) }) : json({ message: "404 File Not Found" }, 404); }
    if (method === "POST" && rest === "/repository/commits") {
      if (!authed) return json({ message: "403 Forbidden" }, 403);
      const body = JSON.parse(init.body), parent = s.head;
      for (const a of body.actions) s.files[a.file_path] = a.content;
      s.head = String(++s.seq).padStart(40, "b");
      s.writes.push({ message: body.commit_message, files: Object.fromEntries(body.actions.map((a) => [a.file_path, a.content])) });
      return json({ id: s.head, web_url: `${GL_ADDRESS}/-/commit/${s.head}`, parent_ids: [parent] });
    }
    return json({ message: "404 Not Found" }, 404);
  };
  return s;
}

// ---------------------------------------------------------------- the world of one test: servers, a page, a person's hands

// Every request the page makes, with the credentials it carries (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT).
// The text UC-003's record names is in the repository's history, readable by its blob SHA, as git keeps it.
async function world({ files = instanceFiles(), history = [UC3_ACCEPTED], dates = {}, product = null, gitlab = null, refuse = null } = {}) {
  const log = [];
  let server;
  const handlers = [
    (u, init) => { log.push({ method: init.method, url: u.href, origin: u.origin, auth: header(init.headers, "authorization"),
      privateToken: header(init.headers, "private-token") }); return undefined; },
    (u, init) => (refuse ? refuse(u, init) : undefined),
    (u, init) => (product && ((u.origin === API && u.pathname.startsWith(`/repos/${PRODUCT}`))
      || (u.origin === "https://raw.githubusercontent.com" && u.pathname.startsWith(`/${PRODUCT}/`))) ? product.fetch(u, init) : undefined),
    (u, init) => (gitlab && u.origin === GL_ORIGIN ? gitlab.fetch(u, init) : undefined),
    // The contents API as JSON (a file's blob SHA), which a write asks for to see whether the file changed since it was opened.
    (u, init) => {
      const m = new RegExp(`^/repos/${INSTANCE}/contents/(.+)$`).exec(u.pathname);
      if (!m || u.origin !== API || init.method !== "GET" || header(init.headers, "accept") !== "application/vnd.github+json") return undefined;
      const path = m[1].split("/").map(decodeURIComponent).join("/");
      return server.shas[path] ? new Response(JSON.stringify({ path, sha: server.shas[path] }), { status: 200 })
        : new Response('{"message":"Not Found"}', { status: 404 });
    },
  ];
  server = await repoServer({ files, history, dates, handlers });
  return { server, log, product, gitlab };
}

async function settle(server) {
  let idle = 0, seen = server.requests.length;
  while (idle < 40) {
    await new Promise((r) => setTimeout(r, 0));
    if (server.pending === 0 && server.requests.length === seen) idle += 1;
    else { idle = 0; seen = server.requests.length; }
  }
}
async function until(f, what, ms = 8000) {
  const end = Date.now() + ms;
  while (!f()) { if (Date.now() > end) throw new Error(`waited in vain for ${what}`); await new Promise((r) => setTimeout(r, 10)); }
}

// A page load; then the person's hands: elements by id that keep their listeners, the editor panel, and the stand-ins.
async function open(w, { hash = "", token = TOKEN, search = "" } = {}) {
  const asked = { confirm: [], clipboard: [], opened: [], downloads: [] };
  globalThis.confirm = (text) => { asked.confirm.push(text); return true; };
  Object.defineProperty(globalThis, "navigator", { value: { clipboard: { writeText: async (t) => { asked.clipboard.push(t); } } }, configurable: true, writable: true });
  globalThis.open = (url) => { asked.opened.push(url); return null; };
  const page = await openDashboard({ server: w.server, token, search });
  live(asked);
  if (hash) await page.go(hash);
  const doc = globalThis.document;
  return Object.assign(page, {
    asked,
    byId: (id) => doc.getElementById(id),
    html: (id) => doc.getElementById(id).innerHTML,
    // What the element shows: its text, or its HTML without the tags.
    text: (id) => `${doc.getElementById(id).textContent} ${stripTags(doc.getElementById(id).innerHTML)}`.trim(),
    // A person's click on, or change of, the element with this id.
    async fire(id, type = "click", ev = { isTrusted: true }) {
      await doc.getElementById(id).fire(type, ev);
      await settle(w.server);
    },
    async tick(id) { doc.getElementById(id).checked = true; await this.fire(id, "change"); },
    async type(id, value) { doc.getElementById(id).value = value; await this.fire(id, "input"); },
    // A control found by an attribute selector inside the element with this id (the settings rows, for instance).
    async press(id, selector, type = "click", ev = { isTrusted: true }) {
      const c = doc.getElementById(id).querySelector(selector);
      if (!c) throw new Error(`nothing in #${id} matches ${selector}`);
      c.fire(type, ev);
      await settle(w.server);
      return c;
    },
    editor: () => doc.getElementById("main")._editor,
    storage: () => Object.fromEntries(Array.from({ length: localStorage.length }, (_, i) => [localStorage.key(i), localStorage.getItem(localStorage.key(i))])),
  });
}

// Elements reached by id keep their listeners, and are new elements once their container is written again; their value,
// checked, disabled and hidden start as their tag says. The <main> element reaches its editor panel, as in a browser.
function live(asked) {
  const doc = globalThis.document, byId = doc.getElementById.bind(doc);
  const tagOf = (html, id) => new RegExp(`<[a-z]+\\b[^>]*\\sid="${id}"[^>]*>`).exec(html)?.[0] ?? "";
  const attr = (tag, name) => { const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag); return m ? unescape(m[1]) : null; };
  function reset(el, tag) {
    el._listeners = [];
    el.value = attr(tag, "value") ?? "";
    el.checked = /\schecked\b/.test(tag);
    el.disabled = /\sdisabled\b/.test(tag);
    el.hidden = /\shidden\b/.test(tag);
    el.files = [];
  }
  function refresh(html) { for (const m of String(html).matchAll(/\sid="([^"]+)"/g)) reset(adopt(byId(m[1])), tagOf(html, m[1])); }
  function adopt(el) {
    if (el._live) return el;
    el._live = true;
    el._listeners = [];
    el.addEventListener = (type, f) => el._listeners.push([type, f]);
    el.fire = (type, ev = {}) => Promise.all(el._listeners.filter(([t]) => t === type).map(([, f]) => f({ ...ev, currentTarget: el, target: el })));
    const d = Object.getOwnPropertyDescriptor(el, "innerHTML");
    Object.defineProperty(el, "innerHTML", { configurable: true, get: d.get, set(v) { d.set.call(el, v); refresh(v); } });
    const insert = el.insertAdjacentHTML.bind(el);
    el.insertAdjacentHTML = (where, x) => { insert(where, x); refresh(x); };
    if (el.id === "main") {
      const q = el.querySelector.bind(el);
      el.querySelector = (sel) => {
        if (sel !== ".panel.edit") return q(sel);
        const m = /<textarea[^>]*>([\s\S]*?)<\/textarea>/.exec(el.innerHTML);
        if (!m) return null;
        const part = () => ({ textContent: "", innerHTML: "", addEventListener() {} });
        const parts = { textarea: { value: unescape(m[1]), addEventListener() {} }, ".preview": part(), ".result": part(), ".edit-diff": part() };
        el._editor = { hidden: true, parts, querySelector: (s) => parts[s] ?? q(s) };
        return el._editor;
      };
    }
    return el;
  }
  doc.getElementById = (id) => adopt(byId(id));
  doc.createElement = ((make) => (tag) => { const e = make(tag); if (tag === "a") { e.click = () => asked.downloads.push({ href: e.href, name: e.download }); } return e; })(doc.createElement);
}

// The texts the page saved for download, by the address it gave them.
async function downloaded(page) {
  return Promise.all(page.asked.downloads.map(async (d) => ({ ...d, text: await resolveObjectURL(d.href).text() })));
}

const writesOf = (w) => w.log.filter((r) => r.method !== "GET");
const githubTokenSentOnlyToGitHub = (w) => w.log.filter((r) => r.auth).every((r) => r.origin === API);
const gitlabTokenSentOnlyToItsProject = (w) => w.log.filter((r) => r.privateToken)
  .every((r) => r.url.startsWith(`${GL_ORIGIN}/api/v4/projects/${encodeURIComponent(GL_PROJECT)}`));

// ================================================================ UC-001 Add a managed product
//
// 2a and 3a are not carried out (ITM-132): no release test for them.

// UC-001 step 1 — the product selector offers + Add product, and choosing it opens the panel on the same page.
// Expected: the selector lists "+ Add product"; choosing it shows the panel "Add a product" with the address field.
test("release · UC-001 1: the product selector's + Add product opens the panel on the same page", async () => {
  const w = await world();
  const page = await open(w);
  const sel = page.byId("product");
  assert.match(sel.innerHTML, /\+ Add product/);
  const add = /<option value="([^"]*)">\+ Add product/.exec(sel.innerHTML)[1];
  sel.value = add;
  sel.onchange();
  await page.go(globalThis.location.hash);
  assert.match(page.main(), /Add a product/);
  assert.match(page.main(), /id="add-repo"/);
});

// UC-001 steps 2–5, on GitHub — the main flow with the stored token. Expected: the pasted address is recognised as GitHub's
// route; Step A shows "Open your tokens on GitHub" and names the token "Agent M · <instance>", Edit, the product repository to
// add with the instance kept, and Update; Step B's Check reads the product with the stored token and shows ✓, saying for a
// public repository that write access is confirmed at the next step; Step C is one click that commits the missing review layout
// — docs/use-cases/, docs/architecture/, docs/approvals/, docs/spec-freigaben/, a SPEC.md skeleton, a CHANGELOG.md — into the
// product's default branch, adds the address to this browser's list, commits nothing to the instance, and shows the commit as a
// link with an offer to switch to the product. Every step carries a folded "What is this?".
test("release · UC-001 2–5: a GitHub product is added — Step A names the token, Check reads it, Add product writes its layout", async () => {
  const product = await productServer();
  const w = await world({ product });
  const page = await open(w, { hash: "#add" });
  await page.type("add-repo", `https://github.com/${PRODUCT}`);
  const steps = page.html("add-steps");
  assert.match(steps, /Step A · Let your key reach the product/);
  assert.match(steps, /Open your tokens on GitHub/);
  assert.ok(hrefs(steps).some((x) => x.startsWith("https://github.com/settings/personal-access-tokens")), "a button to the person's tokens");
  const a = stripTags(sections(steps)[0]);
  assert.match(a, /Agent M · akmaier\/agent-m/);
  assert.match(a, /Edit/);
  assert.match(a, new RegExp(`${PRODUCT}.*keep.*${INSTANCE}.*selected`));
  assert.match(a, /Update/);
  for (const s of sections(steps)) assert.match(s, /<details[^>]*>\s*<summary>What is this\?<\/summary>/, "every step explains itself");

  await page.fire("add-check-btn");
  const check = stripTags(page.html("add-check"));
  assert.match(check, new RegExp(`✓ ${PRODUCT}`));
  assert.match(check, /write access/i, "public: write access is confirmed at the next step");
  assert.ok(w.log.some((r) => r.url === `${API}/repos/${PRODUCT}` && r.auth === `Bearer ${TOKEN}`), "read with the stored token");

  await page.fire("add-go");
  assert.equal(product.writes.length, 1, "one commit in the product");
  const written = Object.keys(product.writes[0].files);
  for (const dir of ["docs/use-cases/", "docs/approvals/", "docs/spec-freigaben/"]) {
    assert.ok(written.some((p) => p.startsWith(dir)), `the layout holds ${dir}`);
  }
  assert.ok(written.includes("SPEC.md") && written.includes("CHANGELOG.md"), "a SPEC.md skeleton and a CHANGELOG.md");
  assert.deepEqual(w.server.writes, [], "nothing is written to the instance repository");
  assert.ok(Object.values(page.storage()).some((v) => v.includes(`https://github.com/${PRODUCT}`)), "the address is in this browser's list");
  const done = page.html("add-result");
  assert.ok(hrefs(done).some((x) => x.startsWith(`https://github.com/${PRODUCT}/commit/`)), "the commit as a link");
  assert.ok(hrefs(done).some((x) => new URLSearchParams(x.replace(/^[^?]*\?/, "")).get("repo") === PRODUCT), "an offer to switch to the product");
  assert.ok(githubTokenSentOnlyToGitHub(w));
});

// UC-001 step 5 · ONE REVIEW LAYOUT FOR EVERY PRODUCT — the layout Add product writes holds docs/architecture/ too, where the
// product's architecture decisions and modules are reviewed. Expected: the commit into a product without a layout writes a file
// under docs/architecture/ — on GitHub and on a GitLab server alike.
test("release · UC-001 5: the layout written into a new product holds docs/architecture/",
  { todo: "FINDING R1 — the layout Add product writes has no docs/architecture/ (backlog item to be added by the Product Owner)" }, async () => {
    const product = await productServer();
    const w = await world({ product });
    const page = await open(w, { hash: "#add" });
    await page.type("add-repo", `https://github.com/${PRODUCT}`);
    await page.fire("add-go");
    assert.ok(Object.keys(product.writes[0]?.files ?? {}).some((p) => p.startsWith("docs/architecture/")), "GitHub: docs/architecture/");
    const gitlab = gitlabServer();
    const w2 = await world({ gitlab });
    const page2 = await open(w2, { hash: "#add" });
    await page2.type("add-repo", GL_ADDRESS);
    await page2.tick("gl-ack");
    page2.byId("gl-token").value = GL_TOKEN;
    await page2.fire("gl-store");
    await page2.fire("add-go");
    assert.ok(Object.keys(gitlab.writes[0]?.files ?? {}).some((p) => p.startsWith("docs/architecture/")), "GitLab: docs/architecture/");
  });

// UC-001 step 5 — "skipping whatever already exists". Expected: a product that already has a SPEC.md and a docs/use-cases/
// folder keeps them byte for byte; the commit holds neither.
test("release · UC-001 5: the layout skips what the product already has", async () => {
  const product = await productServer({ files: { "SPEC.md": "# Our own SPEC\n", "docs/use-cases/UC-001-own.md": "own\n" } });
  const w = await world({ product });
  const page = await open(w, { hash: "#add" });
  await page.type("add-repo", `https://github.com/${PRODUCT}`);
  await page.fire("add-go");
  assert.equal(product.writes.length, 1);
  const written = Object.keys(product.writes[0].files);
  assert.ok(!written.includes("SPEC.md"), "the existing SPEC.md is not written");
  assert.ok(!written.some((p) => p.startsWith("docs/use-cases/")), "the existing folder is not written");
  assert.equal(product.files["SPEC.md"], "# Our own SPEC\n");
});

// UC-001 5b — the product already has the complete layout. Expected: nothing is committed; only the address is added to the
// list in this browser.
test("release · UC-001 5b: a product with the complete layout gets no commit, only its place in the list", async () => {
  const product = await productServer({ files: { "SPEC.md": "# S\n", "CHANGELOG.md": "# C\n", "docs/use-cases/README.md": "u\n",
    "docs/architecture/README.md": "a\n", "docs/approvals/README.md": "p\n", "docs/spec-freigaben/README.md": "q\n" } });
  const w = await world({ product });
  const page = await open(w, { hash: "#add" });
  await page.type("add-repo", `https://github.com/${PRODUCT}`);
  await page.fire("add-go");
  assert.deepEqual(product.writes, [], "nothing is committed");
  assert.ok(Object.values(page.storage()).some((v) => v.includes(`https://github.com/${PRODUCT}`)), "the address is in the list");
});

// UC-001 4a — the check fails. Expected: Agent M names the repository it cannot reach, and Step A is shown again.
test("release · UC-001 4a: a failed check names the repository and shows Step A again", async () => {
  const product = await productServer({ refuse: (u) => (u.pathname === `/repos/${PRODUCT}` ? new Response('{"message":"Not Found"}', { status: 404 }) : undefined) });
  const w = await world({ product });
  const page = await open(w, { hash: "#add" });
  await page.type("add-repo", `https://github.com/${PRODUCT}`);
  await page.fire("add-check-btn");
  const check = stripTags(page.html("add-check"));
  assert.match(check, new RegExp(`✗ ${PRODUCT}`));
  assert.match(page.html("add-steps"), /Step A · Let your key reach the product/);
});

// UC-001 5a — the write is refused although the read succeeded. Expected: Agent M says so and shows Step A again; nothing is
// written into the product and the address does not enter the list.
test("release · UC-001 5a: a refused write says so, shows Step A again and writes nothing", async () => {
  const product = await productServer({ refuse: (u, init) => (init.method === "POST"
    ? new Response('{"message":"Resource not accessible by personal access token"}', { status: 403 }) : undefined) });
  const w = await world({ product });
  const page = await open(w, { hash: "#add" });
  await page.type("add-repo", `https://github.com/${PRODUCT}`);
  await page.fire("add-go");
  const out = page.text("add-result");
  assert.match(out, new RegExp(PRODUCT));
  assert.match(out, /Step A/);
  assert.match(page.html("add-steps"), /Step A · Let your key reach the product/);
  assert.deepEqual(product.writes, []);
  assert.ok(!Object.values(page.storage()).some((v) => v.includes(PRODUCT)), "the address is not added");
});

// UC-001 3b — no token is stored in this browser. Expected: the panel first shows UC-014's key setup with both repositories
// named — the prefilled token page and "Only select repositories" with the instance and the product —; after the key is stored,
// it continues at step 4: both repositories are checked.
test("release · UC-001 3b: without a token the panel shows the key setup for both repositories, then checks both", async () => {
  const product = await productServer();
  const w = await world({ product });
  const page = await open(w, { hash: "#add", token: null });
  await page.type("add-repo", `https://github.com/${PRODUCT}`);
  const steps = page.html("add-steps");
  assert.ok(hrefs(steps).some((x) => x.startsWith("https://github.com/settings/personal-access-tokens/new?")), "the prefilled token page");
  const text = stripTags(steps);
  assert.match(text, /Only select repositories/);
  assert.match(text, new RegExp(INSTANCE));
  assert.match(text, new RegExp(PRODUCT));
  await page.tick("key-ack");
  page.byId("key-token").value = TOKEN;
  await page.fire("key-store");
  const check = stripTags(page.html("key-check"));
  assert.match(check, new RegExp(`✓ ${INSTANCE}`));
  assert.match(check, new RegExp(`✓ ${PRODUCT}`));
});

// UC-001 1a — another browser. Expected: its product list is empty, as it has no token either: the selector offers the
// instance and + Add product, nothing else.
test("release · UC-001 1a: another browser starts with an empty product list", async () => {
  const w = await world();
  const page = await open(w, { token: null });
  const options = [...page.byId("product").innerHTML.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(options.length, 2, String(options));
  assert.equal(options[0], `https://github.com/${INSTANCE}`);
  assert.match(page.byId("product").innerHTML, /\+ Add product/);
});

// UC-001 3c — the product is on a GitLab server. Expected: Step A is "Create a key for this project", a button to the project's
// Settings → Access tokens page on that server, and what to set there: name Agent M, role Maintainer, scope api, an expiry date;
// Step B is the notice, the paste field and Store and check; the token is stored for this project only and sent only to that
// server; Step C writes the layout there with it. The GitHub token is not involved there, and the GitLab token never reaches
// GitHub.
test("release · UC-001 3c: a GitLab product gets its own project token, kept for it and sent only to its server", async () => {
  const gitlab = gitlabServer();
  const w = await world({ gitlab });
  const page = await open(w, { hash: "#add" });
  await page.type("add-repo", GL_ADDRESS);
  const steps = page.html("add-steps");
  assert.match(steps, /Step A · Create a key for this project/);
  assert.ok(hrefs(steps).includes(`${GL_ADDRESS}/-/settings/access_tokens`), "a button to the project's Access tokens page");
  const a = stripTags(sections(steps)[0]);
  assert.match(a, /Agent M/);
  assert.match(a, /Maintainer/);
  assert.match(a, /\bapi\b/);
  assert.match(a, /[Ee]xpir/);
  assert.match(stripTags(sections(steps)[1]), /github\.io/, "Step B: the notice before anything is stored");
  await page.tick("gl-ack");
  page.byId("gl-token").value = GL_TOKEN;
  await page.fire("gl-store");
  assert.match(stripTags(page.html("gl-check-out")), /✓/);
  await page.fire("add-go");
  assert.equal(gitlab.writes.length, 1, "the layout is written into the GitLab project");
  assert.deepEqual(w.server.writes, [], "nothing is written to the instance");
  assert.ok(Object.values(page.storage()).some((v) => v.includes(GL_TOKEN) && v.includes(GL_ADDRESS)), "the token is kept for this project");
  assert.ok(gitlab.requests.filter((r) => r.method === "POST").every((r) => r.token === GL_TOKEN), "written with the project token");
  assert.ok(gitlab.requests.every((r) => r.auth === null), "the GitHub token is not sent to GitLab");
  assert.ok(!w.log.some((r) => r.origin === API && (r.privateToken || String(r.auth).includes(GL_TOKEN))), "the GitLab token is not sent to GitHub");
  assert.ok(gitlabTokenSentOnlyToItsProject(w));
});

// UC-001 3d — the GitLab server offers no project access tokens, or the author is not Maintainer. Expected: the panel says which
// of the two it can be on this server and explains that a personal token would reach every project of the author there; the
// author decides.
test("release · UC-001 3d: without project access tokens or the Maintainer role, the panel explains both and the broader personal token", async () => {
  const w = await world();
  const page = await open(w, { hash: "#add" });
  await page.type("add-repo", "https://gitlab.com/team/proj");
  const a = stripTags(sections(page.html("add-steps"))[0]);
  assert.match(a, /Maintainer/);
  assert.match(a, /personal (access )?token/i);
  assert.match(a, /every project/i);
});

// UC-001 — THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK. Expected: an Add product that is not a person's click — a click a
// script makes — writes nothing.
test("release · UC-001 5: an Add product that is no person's click writes nothing", async () => {
  const product = await productServer();
  const w = await world({ product });
  const page = await open(w, { hash: "#add" });
  await page.type("add-repo", `https://github.com/${PRODUCT}`);
  await page.fire("add-go", "click", { isTrusted: false });
  assert.deepEqual(product.writes, []);
  assert.ok(!Object.values(page.storage()).some((v) => v.includes(PRODUCT)));
});

// ================================================================ UC-008 Review and accept a use case
//
// 4a is not carried out (ITM-133), and 3a only in part — a refused save does not show the newer version (ITM-131): no release
// test for those parts.

const rowOf = (html, id) => String(html).split("<tr>").find((r) => r.includes(`#uc/${id}"`)) ?? "";
const ucText = (w, path) => w.server.files[path];

// UC-008 steps 1–5 — the main flow. Expected: the list shows every use case with its derived status — UC-001 open, UC-002
// accepted, UC-003 changed since acceptance; UC-001 opened shows its text and its Mermaid diagram; Accept is one click that
// commits docs/approvals/UC-001-<sha>.md under the reviewer's own token — three lines naming the file and the git blob SHA of
// the text shown —; then the use case shows as accepted.
test("release · UC-008 1–5: a use case is read with its diagram and accepted by one commit that names its exact text", async () => {
  const w = await world();
  const page = await open(w);
  assert.match(stripTags(rowOf(page.main(), "UC-001")), /\bopen\b/);
  assert.match(stripTags(rowOf(page.main(), "UC-002")), /\baccepted\b/);
  assert.match(stripTags(rowOf(page.main(), "UC-003")), /\bchanged\b/);
  await page.go("#uc/UC-001");
  assert.match(page.main(), /The reader opens the report\./);
  assert.match(page.main(), /language-mermaid[\s\S]*read the report UC-001/, "the Mermaid diagram");
  const shown = ucText(w, UC1);
  await page.click("[data-accept-key]");
  assert.equal(w.server.writes.length, 1, "one commit");
  const [[path, record]] = Object.entries(w.server.writes[0].files);
  const m = /^docs\/approvals\/UC-001-([0-9a-f]{7,40})\.md$/.exec(path);
  assert.ok(m && blobSha(shown).startsWith(m[1]), path);
  const lines = record.trimEnd().split("\n");
  assert.equal(lines.length, 3, record);
  assert.ok(lines.some((l) => l.includes(UC1)), "the record names the file");
  assert.ok(lines.some((l) => l.includes(blobSha(shown))), "the record names the blob SHA of the text shown");
  assert.ok(writesOf(w).every((r) => r.auth === `Bearer ${TOKEN}`), "under the reviewer's own token");
  assert.match(stripTags(/<h2>[\s\S]*?<\/h2>/.exec(page.main())[0]), /UC-001.*\baccepted\b/);
});

// UC-008 5a — the file is edited after acceptance. Expected: on the next load it shows as changed since acceptance, without
// anyone resetting a status.
test("release · UC-008 5a: an accepted use case edited afterwards shows as changed", async () => {
  const w = await world();
  await open(w);
  await w.server.change(UC2, useCase("UC-002", "File a report", "The reader files the report, EDITED-AFTER."));
  const page = await open(w);
  assert.match(stripTags(rowOf(page.main(), "UC-002")), /\bchanged\b/);
});

// UC-008 2a — the use case changed since it was last accepted, and its file was renamed since. Expected: above the text, the
// difference to the text the most recent approval record for this identifier names: the lines of that text against the
// current ones, and not the text of an older record.
test("release · UC-008 2a: a changed use case shows its difference to the text the most recent record names, across a rename", async () => {
  const old = "docs/use-cases/UC-004-old-name.md", now = "docs/use-cases/UC-004-new-name.md";
  const a0 = useCase("UC-004", "Old name", "OLDEST-LINE of the first acceptance.");
  const a1 = useCase("UC-004", "Old name", "LAST-ACCEPTED-LINE of the second acceptance.");
  const b = useCase("UC-004", "New name", "CURRENT-LINE of today.");
  const r0 = `docs/approvals/UC-004-${blobSha(a0).slice(0, 12)}.md`, r1 = `docs/approvals/UC-004-${blobSha(a1).slice(0, 12)}.md`;
  const w = await world({ files: instanceFiles({ [now]: b, [r0]: ucRecord(old, a0), [r1]: ucRecord(old, a1) }), history: [UC3_ACCEPTED, a0, a1],
    dates: { [r0]: "2026-01-01T10:00:00Z", [r1]: "2026-02-01T10:00:00Z" } });
  const page = await open(w, { hash: "#uc/UC-004" });
  const diff = stripTags(page.html("accepted-diff"));
  assert.match(diff, /LAST-ACCEPTED-LINE/);
  assert.match(diff, /CURRENT-LINE/);
  assert.doesNotMatch(diff, /OLDEST-LINE/, "not the older record's text");
  assert.ok(page.main().indexOf('id="accepted-diff"') < page.main().indexOf("CURRENT-LINE"), "above the text");
});

// UC-008 1a — the product repository is private. Expected: with a token that reaches it, the dashboard reads it with that token;
// without a token, or with one that does not reach it, it says so and shows no use case.
test("release · UC-008 1a: a private repository is read with the token, and without one that reaches it nothing is shown", async () => {
  let reaches = true;
  const refuse = (u, init) => (u.origin === API && u.pathname.startsWith(`/repos/${INSTANCE}`) && (!header(init.headers, "authorization") || !reaches)
    ? new Response('{"message":"Not Found"}', { status: 404 }) : undefined);
  const w = await world({ refuse });
  const page = await open(w);
  assert.match(page.main(), /UC-001/);
  assert.ok(w.log.filter((r) => r.origin === API).every((r) => r.auth === `Bearer ${TOKEN}`), "read with the token");
  const none = await open(w, { token: null });
  assert.doesNotMatch(none.main(), /UC-001/);
  assert.match(stripTags(none.main()), /private/i);
  assert.match(stripTags(none.main()), /token/i);
  reaches = false;
  const wrong = await open(w);
  assert.doesNotMatch(wrong.main(), /UC-001/);
  assert.match(stripTags(wrong.main()), /token does not reach|does not reach this repository/i);
});

// UC-008 3a — the reviewer changes the text. Expected: the editor holds the text shown; Save commits the edited text to the use
// case's file under the reviewer's token; the use case then has a new SHA and is shown again from step 2, open.
test("release · UC-008 3a: Save commits the edited use case, which is then shown again, open", async () => {
  const w = await world();
  const page = await open(w, { hash: "#uc/UC-002" });
  const ed = page.editor();
  assert.equal(ed.parts.textarea.value, ucText(w, UC2), "the editor holds the text shown");
  const edited = ucText(w, UC2).replace("The reader opens the report.", "The reader opens the report, EDITED-ON-DASHBOARD.");
  ed.parts.textarea.value = edited;
  await page.click("[data-edit-save]");
  assert.equal(w.server.writes.length, 1);
  assert.equal(w.server.writes[0].files[UC2], edited);
  assert.ok(writesOf(w).every((r) => r.auth === `Bearer ${TOKEN}`));
  assert.match(page.main(), /EDITED-ON-DASHBOARD/);
  assert.match(stripTags(/<h2>[\s\S]*?<\/h2>/.exec(page.main())[0]), /UC-002.*\b(open|changed)\b/);
});

// A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE (UC-008 3a) — the file changed on the default branch after the editor
// opened. Expected: Save writes nothing, the other text stays, and the page says the file changed.
test("release · UC-008 3a: a save whose file changed meanwhile writes nothing", async () => {
  const w = await world();
  const page = await open(w, { hash: "#uc/UC-001" });
  const theirs = useCase("UC-001", "Read a report", "Someone else's EDIT-MEANWHILE.");
  await w.server.change(UC1, theirs);
  page.editor().parts.textarea.value = useCase("UC-001", "Read a report", "My edit.");
  await page.click("[data-edit-save]");
  assert.deepEqual(w.server.writes, []);
  assert.equal(ucText(w, UC1), theirs);
  assert.match(page.editor().parts[".result"].textContent, /changed/i);
});

// UC-008 3b — no token is stored. Expected: Accept opens GitHub's new-file page with the record prefilled — the approval file
// of UC-001, the three-line record naming the file and the blob SHA of the text shown —, and the page also shows the record
// with a copy button and the exact path; no link carries the use case's text (NO TEXT TRAVELS IN A URL); editing copies the
// text to the clipboard and opens GitHub's editor for the file; nothing is written by the dashboard.
test("release · UC-008 3b: without a token, Accept and Edit open GitHub's own pages, prefilled", async () => {
  const w = await world();
  const page = await open(w, { hash: "#uc/UC-001", token: null });
  const shown = ucText(w, UC1);
  const link = hrefs(page.main()).find((x) => x.startsWith(`https://github.com/${INSTANCE}/new/`));
  assert.ok(link, "a link to GitHub's new-file page");
  const q = new URL(link).searchParams;
  assert.match(q.get("filename"), /^docs\/approvals\/UC-001-[0-9a-f]{7,40}\.md$/);
  assert.ok(q.get("value").includes(UC1) && q.get("value").includes(blobSha(shown)), "the record is prefilled");
  assert.ok(page.main().includes(`data-copy="${q.get("filename")}"`), "the exact path with a copy button");
  assert.ok(hrefs(page.main()).every((x) => !x.includes("reader opens the report")), "no link carries the use case's text");
  const edited = shown.replace("opens the report.", "opens the report, WITHOUT-TOKEN.");
  page.editor().parts.textarea.value = edited;
  await page.click("[data-edit-commit]");
  assert.deepEqual(page.asked.clipboard, [edited]);
  assert.deepEqual(page.asked.opened, [`https://github.com/${INSTANCE}/edit/main/${UC1}`]);
  assert.deepEqual(writesOf(w), []);
});

// UC-008 3c — a GitLab product without its token stored. Expected: the dashboard reads its use cases, offers no Accept and no
// Save, and links to the step that stores the project's token (UC-001); the GitHub token is never sent to the GitLab server.
test("release · UC-008 3c: a GitLab product without its token is read, offers no Accept or Save, and links to the token step", async () => {
  const gitlab = gitlabServer({ files: instanceFiles(), visibility: "public" });
  const w = await world({ gitlab });
  const page = await open(w, { search: `?product=${encodeURIComponent(GL_ADDRESS)}` });
  assert.match(page.main(), /UC-001/);
  await page.go("#uc/UC-001");
  assert.match(page.main(), /The reader opens the report\./);
  assert.doesNotMatch(page.main(), /data-accept-key|data-edit-save|data-edit-commit/);
  assert.ok(hrefs(page.main()).includes(`#add/${encodeURIComponent(GL_ADDRESS)}`), "a link to the token step");
  assert.ok(gitlab.requests.every((r) => r.auth === null && r.token === null));
});

// UC-008 3d — several use cases read and ticked. Expected: Accept ticked writes one commit with one record per ticked file, each
// naming the text that was shown; a file that changed after it was shown is left out and named.
test("release · UC-008 3d: Accept ticked writes one record per ticked use case in one commit; a file changed since is left out and named", async () => {
  for (const changeOne of [false, true]) {
    const w = await world();
    const page = await open(w, { hash: "#uc/UC-001" });
    const shown1 = ucText(w, UC1), shown3 = ucText(w, UC3);
    const tick = async () => { const c = page.byId("main").querySelector("[data-tick]"); c.checked = true; c.fire("change", {}); };
    await tick();
    await page.go("#uc/UC-003");
    await tick();
    if (changeOne) await w.server.change(UC3, useCase("UC-003", "Sign a report", "CHANGED-AFTER-SHOWN."));
    await page.click("[data-accept-ticked]");
    assert.equal(w.server.writes.length, 1, "one commit");
    const records = Object.values(w.server.writes[0].files).join("\n");
    assert.ok(records.includes(blobSha(shown1)), "UC-001 as shown");
    if (!changeOne) assert.ok(records.includes(blobSha(shown3)), "UC-003 as shown");
    else {
      assert.ok(!records.includes(UC3), "UC-003 is left out");
      assert.match(stripTags(page.main()), /UC-003/);
      assert.match(stripTags(page.main()), /left out/i);
    }
  }
});

// UC-008 3e — Review all. Expected: one page shows every open or changed use case — UC-003 as its difference to the last
// accepted text, UC-001 in full —, not the accepted UC-002; Accept all 2 shown writes one commit with one record per use case on
// the page; a use case changed after the page was built is left out and named.
test("release · UC-008 3e: Review all shows every open use case and Accept all writes one record each; a file changed since is left out", async () => {
  for (const changeOne of [false, true]) {
    const w = await world();
    const page = await open(w, { hash: "#review/uc" });
    const main = page.main();
    assert.match(main, /The reader opens the report\./, "UC-001 in full");
    assert.match(stripTags(main), /CHANGED-SINCE/);
    assert.match(stripTags(main), /signs the report as accepted/, "UC-003 against its accepted text");
    assert.doesNotMatch(main, /id="review-UC-002"|#uc\/UC-002"/, "the accepted UC-002 is not on the page");
    assert.match(stripTags(main), /Accept all 2 shown/);
    if (changeOne) await w.server.change(UC1, useCase("UC-001", "Read a report", "CHANGED-AFTER-THE-PAGE."));
    const shown3 = ucText(w, UC3);
    await page.click("[data-accept-all]");
    assert.equal(w.server.writes.length, 1);
    const records = Object.values(w.server.writes[0].files).join("\n");
    assert.ok(records.includes(blobSha(shown3)));
    assert.equal(records.includes(UC1), !changeOne, changeOne ? "UC-001 is left out" : "UC-001 is accepted");
    if (changeOne) assert.match(stripTags(page.main()), /left out[\s\S]*UC-001|UC-001[\s\S]*left out/i);
  }
});

// THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK (UC-008 step 3) — Expected: loading and reading write nothing; an Accept that is
// a script's click, not a person's, writes nothing; the person's click writes.
test("release · UC-008 3: nothing is written on load or on a script's click; the person's click writes", async () => {
  const w = await world();
  const page = await open(w, { hash: "#uc/UC-001" });
  await page.go("#review/uc");
  await page.go("#uc/UC-001");
  assert.deepEqual(writesOf(w), [], "no write on load or reading");
  await page.click("[data-accept-key]", { isTrusted: false });
  assert.deepEqual(writesOf(w), [], "no write on a script's click");
  await page.click("[data-accept-key]", { isTrusted: true });
  assert.equal(w.server.writes.length, 1);
});

// ================================================================ UC-006 Approve a specification change
//
// 3b is not carried out (ITM-134): no release test for it.

const ENTRY = "#spec/2026-01-01a_wording/01";
const before = (spec, anchor) => spec.slice(0, spec.indexOf(anchor));
const from = (spec, anchor) => spec.slice(spec.indexOf(anchor));

// UC-006 steps 1–7 — the main flow. Expected: the entry shows the current SPEC section beside the proposal, the difference
// between them and the rationale; Accept is one click; one commit under the reviewer's token holds the approval record naming
// the proposal and its blob, SPEC.md with the section replaced by the proposal byte for byte — everything before and after it
// unchanged —, and the queue's entscheidungen.md with the decision appended; the entry then shows as in SPEC.
test("release · UC-006 1–7: a SPEC change is accepted in one commit — record, section byte for byte, decision — and shows as in SPEC", async () => {
  const w = await world();
  const page = await open(w, { hash: ENTRY });
  const shown = stripTags(page.main());
  assert.match(shown, /Rule two holds as first written\./, "the current section");
  assert.match(shown, /PROPOSED-WORDING/, "the proposal");
  assert.match(shown, /Difference[\s\S]*first written[\s\S]*PROPOSED-WORDING|Difference[\s\S]*PROPOSED-WORDING[\s\S]*first written/, "the difference");
  assert.match(shown, /RATIONALE-TEXT/, "the rationale");
  const decisions = w.server.files[`${Q}/entscheidungen.md`];
  await page.click("[data-accept-key]");
  assert.equal(w.server.writes.length, 1, "one commit");
  const files = w.server.writes[0].files;
  const rec = Object.entries(files).find(([p]) => p.startsWith("docs/approvals/"));
  assert.ok(rec, "an approval record");
  assert.ok(rec[1].includes(`${Q}/01-rule-two.md`) && rec[1].includes(blobSha(PROPOSAL)), "it names the proposal and its blob");
  const spec = files["SPEC.md"];
  assert.ok(spec.includes(PROPOSAL), "the proposal byte for byte");
  assert.doesNotMatch(spec, /as first written/);
  assert.equal(before(spec, "## 2. More"), before(SPEC, "## 2. More"), "unchanged before the section");
  assert.equal(from(spec, "## 3. Last"), from(SPEC, "## 3. Last"), "unchanged after the section");
  const dec = files[`${Q}/entscheidungen.md`];
  assert.ok(dec?.startsWith(decisions), "the decisions are appended to");
  const added = dec.slice(decisions.length).trim().split("\n");
  assert.equal(added.length, 1, "one decision");
  assert.ok(added[0].includes(rec[0].split("/").pop()), "naming the record");
  assert.ok(writesOf(w).every((r) => r.auth === `Bearer ${TOKEN}`));
  assert.match(stripTags(/<h2>[\s\S]*?<\/h2>/.exec(page.main())[0]), /in SPEC/);
});

// UC-006 3a — the reviewer wants different wording. Expected: Save commits the edited proposal; the entry is shown again with
// the new text, and Accept writes that text into the SPEC.
test("release · UC-006 3a: an edited proposal is saved, shown again, and accepted as edited", async () => {
  const w = await world();
  const page = await open(w, { hash: ENTRY });
  const edited = PROPOSAL.replace("PROPOSED-WORDING", "EDITED-WORDING");
  page.editor().parts.textarea.value = edited;
  await page.click("[data-edit-save]");
  assert.equal(w.server.writes.length, 1);
  assert.equal(w.server.files[`${Q}/01-rule-two.md`], edited);
  assert.match(stripTags(page.main()), /EDITED-WORDING/);
  await page.click("[data-accept-key]");
  assert.equal(w.server.writes.length, 2);
  assert.ok(w.server.files["SPEC.md"].includes(edited));
});

// UC-006 5a — the proposal or the SPEC section changed since the reviewer opened it. Expected: nothing is written; the dashboard
// shows the new state.
test("release · UC-006 5a: a SPEC section or proposal changed since it was shown is not written; the new state is shown", async () => {
  for (const which of ["section", "proposal"]) {
    const w = await world();
    const page = await open(w, { hash: ENTRY });
    if (which === "section") await w.server.change("SPEC.md", SPEC.replace("as first written", "as CHANGED-MEANWHILE"));
    else await w.server.change(`${Q}/01-rule-two.md`, PROPOSAL.replace("PROPOSED-WORDING", "CHANGED-MEANWHILE"));
    await page.click("[data-accept-key]");
    assert.deepEqual(w.server.writes, [], `${which}: nothing is written`);
    assert.match(stripTags(page.main()), /CHANGED-MEANWHILE/, `${which}: the new state is shown`);
  }
});

// UC-006 4d — several entries of one queue, one of which creates the heading the other is anchored at. Expected: the second
// entry alone is not offered for Accept, and the dashboard names the entry it needs; ticked together, Accept ticked writes both
// in the order of the queue's index in one commit, each with its record and decision.
test("release · UC-006 4d: an entry waits for the entry that creates its heading; ticked together both are written in queue order", async () => {
  const QB = "docs/spec-freigaben/2026-01-01b_new-section";
  const p1 = SPEC.slice(SPEC.indexOf("## 3. Last")).replace("Rule three holds.", "Rule three holds, LAST-REWORDED.") + "\n## 4. Added\n\nADDED-ONCE.\n";
  const p2 = "## 4. Added\n\nADDED-TWICE.\n";
  const w = await world({ files: instanceFiles(queue(QB, "2026-01-01b · new section", [["01", "## 3. Last"], ["02", "## 4. Added"]],
    { [`${QB}/01-last.md`]: p1, [`${QB}/02-added.md`]: p2 })) });
  const decisions = w.server.files[`${QB}/entscheidungen.md`];
  const page = await open(w, { hash: "#spec/2026-01-01b_new-section/02" });
  assert.doesNotMatch(page.main(), /data-accept-key/, "02 is not offered alone");
  assert.match(stripTags(page.main()), /\b0?1\b/);
  assert.match(stripTags(page.main()), /entry 0?1/i, "the entry it needs is named");
  const tick = async () => { const c = page.byId("main").querySelector("[data-tick]"); c.checked = true; c.fire("change", {}); };
  await tick();
  await page.go("#spec/2026-01-01b_new-section/01");
  await tick();
  await page.click("[data-accept-ticked]");
  assert.equal(w.server.writes.length, 1, "one commit");
  const files = w.server.writes[0].files;
  const spec = files["SPEC.md"];
  assert.match(spec, /LAST-REWORDED/);
  assert.match(spec, /## 4\. Added\n\nADDED-TWICE\./);
  assert.doesNotMatch(spec, /ADDED-ONCE/);
  assert.equal(Object.keys(files).filter((p) => p.startsWith("docs/approvals/")).length, 2, "one record each");
  const added = files[`${QB}/entscheidungen.md`].slice(decisions.length).trim().split("\n");
  assert.equal(added.length, 2);
  assert.ok(added[0].includes("-01-") && added[1].includes("-02-"), `in the queue's order: ${added.join(" / ")}`);
});

// UC-006 4b — no token is stored. Expected: Accept opens GitHub's new-file page with the record prefilled — naming the proposal
// and its blob —; editing copies the proposal to the clipboard and opens GitHub's editor for it; nothing is written.
test("release · UC-006 4b: without a token, Accept and Edit open GitHub's pages for the instance, prefilled", async () => {
  const w = await world();
  const page = await open(w, { hash: ENTRY, token: null });
  const link = hrefs(page.main()).find((x) => x.startsWith(`https://github.com/${INSTANCE}/new/`));
  assert.ok(link, "a link to GitHub's new-file page");
  const value = new URL(link).searchParams.get("value");
  assert.ok(value.includes(`${Q}/01-rule-two.md`) && value.includes(blobSha(PROPOSAL)), "the record is prefilled");
  page.editor().parts.textarea.value = PROPOSAL;
  await page.click("[data-edit-commit]");
  assert.deepEqual(page.asked.clipboard, [PROPOSAL]);
  assert.deepEqual(page.asked.opened, [`https://github.com/${INSTANCE}/edit/main/${Q}/01-rule-two.md`]);
  assert.deepEqual(writesOf(w), []);
});

// UC-006 4c, the product's half — "For a product, a token is required — no product carries the workflow." Expected: for a
// product's SPEC change without a token, the dashboard offers no GitHub page that would commit an approval record nothing will
// ever apply, and says that accepting needs a token.
test("release · UC-006 4c: a product's SPEC change without a token is not offered GitHub's page; a token is required",
  { todo: "FINDING R2 — a product's SPEC entry without a token offers GitHub's new-file page, as for the instance (backlog item to be added by the Product Owner)" }, async () => {
    const product = await productServer({ files: { "SPEC.md": SPEC, ...queue(Q, "2026-01-01a · wording", [["01", "## 2. More"]], { [`${Q}/01-rule-two.md`]: PROPOSAL }) } });
    const w = await world({ product });
    const page = await open(w, { token: null, search: `?repo=${PRODUCT}`, hash: ENTRY });
    assert.match(stripTags(page.main()), /PROPOSED-WORDING/, "the entry is shown");
    assert.ok(!hrefs(page.main()).some((x) => x.startsWith(`https://github.com/${PRODUCT}/new/`)), "no GitHub page for the record");
    assert.match(stripTags(page.main()), /token/i, "accepting needs a token");
  });

// UC-006 4a — the reviewer rejects. Expected: no record is committed; the entry stays open.
test("release · UC-006 4a: an entry not accepted stays open and nothing is committed", async () => {
  const w = await world();
  const page = await open(w, { hash: ENTRY });
  await page.go("#spec");
  await page.go(ENTRY);
  assert.deepEqual(writesOf(w), []);
  assert.match(stripTags(/<h2>[\s\S]*?<\/h2>/.exec(page.main())[0]), /\bopen\b/);
});

// UC-014 4a, with UC-006 4b and 4c — an approval of the instance's own SPEC committed on GitHub's page while the workflow has not
// run. Expected: the entry shows as approved, not in SPEC, and the page says why.
test("release · UC-014 4a: an approval committed on GitHub's page and not yet applied shows as approved, with why", async () => {
  const w = await world();
  const page = await open(w, { hash: ENTRY, token: null });
  const q = new URL(hrefs(page.main()).find((x) => x.startsWith(`https://github.com/${INSTANCE}/new/`))).searchParams;
  await w.server.change(q.get("filename"), q.get("value"));
  const again = await open(w, { hash: ENTRY, token: null });
  const head = /<h2>[\s\S]*?<\/h2>/.exec(again.main())[0];
  assert.match(stripTags(head), /\bapproved\b/);
  assert.doesNotMatch(stripTags(head), /in SPEC/);
  assert.match(head, /workflow|not yet written/i, "it says why");
});

// ================================================================ UC-014 Get your own Agent M — the built part, Finish setting up
//
// Steps 1–5 (the guided fork) are ITM-073: no release test for them.

const PERMISSIONS = { contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", metadata: "read" };

// UC-014 step 6 — no token is stored on the person's own dashboard. Expected: the start page shows "Finish setting up your
// instance" at the top, with "Set up now" leading to the setup, and Import settings beside it (7a).
test("release · UC-014 6, 7a: without a token the start page offers Finish setting up, with Set up now and Import settings", async () => {
  const w = await world();
  const page = await open(w, { token: null });
  const main = page.main();
  assert.ok(main.indexOf("Finish setting up your instance") >= 0 && main.indexOf("Finish setting up your instance") < main.indexOf("UC-001"), "at the top");
  assert.match(main, /href="#setup"[^>]*>Set up now/);
  assert.match(stripTags(main), /Import settings/);
});

// UC-014 step 7 · THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE · THE REPOSITORY CHOICE IS SPELLED OUT.
// Expected: Step A's button opens GitHub's page for a new fine-grained token with name, description and the 90-day expiry
// prefilled, and exactly the permissions every feature needs — Contents, Issues, Pull requests, Actions and Workflows read and
// write, Metadata read — and no other; a folded explanation says what each is for; underneath: choose "Only select
// repositories", pick <owner>/agent-m only, Generate token, copy it.
test("release · UC-014 7: Step A links GitHub's token page prefilled with exactly the permissions every feature needs", async () => {
  const w = await world();
  const page = await open(w, { hash: "#setup", token: null });
  const a = sections(page.main())[0];
  const link = hrefs(a).find((x) => x.startsWith("https://github.com/settings/personal-access-tokens/new?"));
  assert.ok(link, "the prefilled token page");
  const q = new URL(link).searchParams;
  assert.ok(q.get("name") && q.get("description"), "name and description");
  assert.equal(q.get("expires_in"), "90");
  const perms = Object.fromEntries([...q].filter(([k]) => !["name", "description", "expires_in"].includes(k)));
  assert.deepEqual(perms, PERMISSIONS, "exactly the permissions every feature needs");
  const why = /<details[\s\S]*<\/details>/.exec(a)[0];
  for (const p of ["Contents", "Issues", "Pull requests", "Actions", "Workflows"]) assert.match(stripTags(why), new RegExp(p), `why ${p}`);
  const text = stripTags(a.replace(/<details[\s\S]*<\/details>/, ""));
  assert.match(text, /Only select repositories/);
  assert.match(text, new RegExp(INSTANCE));
  assert.match(text, /Generate token/);
  assert.match(text, /[Cc]opy/);
});

// UC-014 steps 8–9 · THE SHARED PAGES ORIGIN IS DISCLOSED · CONFIGURATION LIVES IN THE BROWSER. Expected: before anything is
// stored, the page states that every other Pages site of the same owner can read what is stored here; nothing is stored before
// "I have read this" is ticked; the expiry date is preset to 90 days from today; Store and check keeps the token and its date in
// localStorage and reads the instance with it; the dashboard then shows the instance ready — its use cases and + Add product.
// Both steps carry a folded "What is this?".
test("release · UC-014 8–9: Store and check keeps token and expiry after the notice, checks the instance, and shows it ready", async () => {
  const w = await world();
  const page = await open(w, { hash: "#setup", token: null });
  const [a, b] = sections(page.main());
  for (const s of [a, b]) assert.match(s, /<summary>What is this\?<\/summary>/);
  assert.match(stripTags(b), /every other GitHub Pages site of akmaier/i);
  assert.equal(page.byId("key-expires").value, daysFromToday(90), "preset to 90 days");
  page.byId("key-token").value = TOKEN;
  await page.fire("key-store");
  assert.deepEqual(page.storage(), {}, "nothing is stored before the notice is acknowledged");
  await page.tick("key-ack");
  page.byId("key-token").value = TOKEN;
  await page.fire("key-store");
  const kept = Object.values(page.storage());
  assert.ok(kept.includes(TOKEN), "the token in localStorage");
  assert.ok(kept.includes(daysFromToday(90)), "its expiry date in localStorage");
  assert.ok(w.log.some((r) => r.url === `${API}/repos/${INSTANCE}` && r.auth === `Bearer ${TOKEN}`), "the instance is read with it");
  assert.match(stripTags(page.html("key-check")), new RegExp(`✓ ${INSTANCE}`));
  const done = page.html("setup-done");
  assert.ok(hrefs(done).includes("#uc") && hrefs(done).includes("#add"), "ready: the use cases and + Add product");
  await page.go("#uc");
  assert.doesNotMatch(page.main(), /Finish setting up your instance/);
  assert.match(page.main(), /UC-001/);
});

// UC-014 6a — the person only reads public repositories and skips the setup. Expected: the dashboard reads the instance without
// a token — no request carries one — and accepting goes through GitHub's own page.
test("release · UC-014 6a: without setup, the dashboard reads public repositories and accepting goes through GitHub's page", async () => {
  const w = await world();
  const page = await open(w, { hash: "#uc/UC-001", token: null });
  assert.match(page.main(), /The reader opens the report\./);
  assert.ok(w.log.every((r) => !r.auth && !r.privateToken), "no request carries a token");
  assert.ok(hrefs(page.main()).some((x) => x.startsWith(`https://github.com/${INSTANCE}/new/`)));
});

// ================================================================ UC-042 Manage settings in one place
//
// Step 1's state after a reload is ITM-136 and 5a is ITM-137; the instance section is ITM-098, the bridge (2a) ITM-107 and the
// mailbox (2b) ITM-067 — no release test for those.

const settingsRow = (page, n = 0) => page.html("browser-settings").split('<div class="setting"').slice(1)[n] ?? "";
const stateOf = (row) => stripTags(/<p class="state">[\s\S]*?<\/p>/.exec(row)?.[0] ?? "");
// A button of the GitHub token's line, by the attribute the page gives it (the harness finds the control a view wired only by the
// selector the view used).
const tokenLine = (what) => `[data-${what}="agent-m.github-token"]`;

// UC-042 step 1 — the gear on every page opens Settings; each setting of this browser is one line with its state; a secret is in
// a password field, hidden, and Show reveals it in full. Expected: the tab bar holds the gear to #settings; the page has the
// sections "This browser" and the product's; with a token stored, the token's line shows it hidden, and after Show in full.
test("release · UC-042 1: Settings is reached from the gear; a stored token is hidden until Show reveals it in full", async () => {
  const w = await world();
  const page = await open(w);
  assert.match(page.el("tabs"), /href="#settings"[^>]*>[\s\S]*⚙/);
  await page.go("#settings");
  assert.match(stripTags(page.main()), /This browser/);
  assert.match(stripTags(page.main()), new RegExp(`Product · https://github.com/${INSTANCE}`));
  assert.match(settingsRow(page), new RegExp(`type="password"[^>]*value="${TOKEN}"`));
  assert.doesNotMatch(settingsRow(page), new RegExp(`type="text"[^>]*value="${TOKEN}"`));
  await page.press("browser-settings", "[data-show]");
  assert.match(settingsRow(page), new RegExp(`type="text"[^>]*value="${TOKEN}"`), "shown in full");
});

// UC-042 step 2 — Test sends one harmless request to the token's own server and shows the answer. Expected: exactly one request,
// a GET to GitHub's API with the token; the line then shows ✓ works with today's date. Without a token the line is "— not set".
test("release · UC-042 2: Test sends one harmless request to GitHub and the line shows ✓ works with the date", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  const n = w.log.length;
  await page.press("browser-settings", tokenLine("test"));
  const sent = w.log.slice(n);
  assert.equal(sent.length, 1, JSON.stringify(sent));
  assert.equal(sent[0].method, "GET");
  assert.equal(sent[0].origin, API);
  assert.equal(sent[0].auth, `Bearer ${TOKEN}`);
  assert.match(stateOf(settingsRow(page)), new RegExp(`✓ works.*${daysFromToday(0)}`));
  const none = await open(await world(), { hash: "#settings", token: null });
  assert.match(stateOf(settingsRow(none)), /— not set/);
});

// UC-042 step 2 — Change opens the same fields and the same notice as the setup, in place; storing a token asks for its expiry
// date, preset to the 90 days of the prefilled link. Expected: after the notice is acknowledged, the new token and the preset
// date are stored in localStorage, replacing the old token.
test("release · UC-042 2: Change stores a new token with its expiry date, preset to 90 days, after the notice", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  await page.press("browser-settings", tokenLine("change"));
  assert.equal(page.byId("token-change").hidden, false, "the fields open in place");
  assert.match(stripTags(page.main()), /every other GitHub Pages site of akmaier/i, "the same notice");
  assert.equal(page.byId("token-expires").value, daysFromToday(90));
  await page.tick("ack");
  page.byId("token-input").value = NEW_TOKEN;
  await page.fire("token-save");
  const kept = Object.values(page.storage());
  assert.ok(kept.includes(NEW_TOKEN) && !kept.includes(TOKEN), "the new token replaces the old one");
  assert.ok(kept.includes(daysFromToday(90)));
});

// UC-042 step 2 · A CLEAR IS A REAL CLEAR — Clear removes the setting from localStorage after one confirmation and says what no
// longer works without it. Expected: one confirmation, which names what stops working; the token is gone from localStorage; the
// line shows "— not set".
test("release · UC-042 2: Clear asks once, says what stops working, and removes the token from localStorage", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  await page.press("browser-settings", tokenLine("clear"));
  assert.equal(page.asked.confirm.length, 1);
  assert.match(page.asked.confirm[0], /without it|no longer|cannot/i, "what no longer works");
  assert.ok(!Object.values(page.storage()).includes(TOKEN), "gone from localStorage");
  assert.match(stateOf(settingsRow(page)), /— not set/);
});

// UC-042 1a · A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE — a token expires within fourteen days. Expected: every dashboard page
// shows "Your GitHub token expires on <date>" with Renew to GitHub's token page; the settings line shows ⚠ expires on <date>.
test("release · UC-042 1a: a token expiring within fourteen days is warned of on every page, with Renew", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  const soon = daysFromToday(5);
  await page.press("browser-settings", tokenLine("change"));
  await page.tick("ack");
  page.byId("token-input").value = TOKEN;
  page.byId("token-expires").value = soon;
  await page.fire("token-save");
  assert.match(stateOf(settingsRow(page)), new RegExp(`⚠ expires on ${soon}`));
  for (const hash of ["#uc", "#spec", "#uc/UC-001"]) {
    await page.go(hash);
    const banner = page.el("token-banner");
    assert.match(stripTags(banner), new RegExp(`Your GitHub token expires on ${soon}`), hash);
    assert.ok(hrefs(banner).some((x) => x.startsWith("https://github.com/settings/personal-access-tokens")), `${hash}: Renew`);
  }
});

// UC-042 1a — "Renew; it opens GitHub's page of that token … and the paste field for the new value." Expected: the line that
// warns of the expiry offers, beside Renew, the field in which the new value is pasted — or a control that opens it.
test("release · UC-042 1a: the expiry line offers the paste field for the renewed value",
  { todo: "FINDING R3 — the expiry line names where to paste, but offers no paste field (backlog item to be added by the Product Owner)" }, async () => {
    const w = await world();
    const page = await open(w, { hash: "#settings" });
    await page.press("browser-settings", tokenLine("change"));
    await page.tick("ack");
    page.byId("token-input").value = TOKEN;
    page.byId("token-expires").value = daysFromToday(3);
    await page.fire("token-save");
    await page.go("#uc");
    const banner = page.el("token-banner");
    assert.ok(/<input\b/.test(banner) || hrefs(banner).some((x) => x.startsWith("#settings")) || /data-[a-z-]*(change|renew|paste)/.test(banner),
      "a paste field, or a control that opens it");
  });

// UC-042 1b · AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a server refused a token. Expected: the GitHub token's line shows
// ✗ refused, and the line at the top names the GitHub token with Renew to GitHub's token page; for a GitLab project token, its
// line shows ✗ refused and links the project's Access tokens page.
test("release · UC-042 1b: a refused token is named, GitHub's with Renew, a GitLab project's with its Access tokens page", async () => {
  let refused = false;
  const gitlab = gitlabServer();
  const w = await world({ gitlab, refuse: (u) => (refused && u.origin === API && u.pathname === `/repos/${INSTANCE}`
    ? new Response('{"message":"Bad credentials"}', { status: 401 }) : undefined) });
  const page = await open(w, { hash: "#add" });
  await page.type("add-repo", GL_ADDRESS);
  await page.tick("gl-ack");
  page.byId("gl-token").value = GL_TOKEN;
  await page.fire("gl-store");
  await page.go("#settings");
  refused = true;
  gitlab.refuseToken = true;
  await page.press("browser-settings", tokenLine("test"));
  assert.match(stateOf(settingsRow(page)), /✗ refused/);
  const banner = page.el("token-banner");
  assert.match(stripTags(banner), /GitHub token/);
  assert.ok(hrefs(banner).some((x) => x.startsWith("https://github.com/settings/personal-access-tokens")), "Renew");
  await page.press("browser-settings", "[data-test-gitlab]");
  const line = page.html("browser-settings").split('class="gitlab-token"')[1] ?? "";
  assert.match(stripTags(line), /✗ refused/);
  assert.ok(hrefs(line).includes(`${GL_ADDRESS}/-/settings/access_tokens`), "the project's Access tokens page");
});

// UC-042 3a — no token that can write to the product. Expected: the product section is read-only — no switch, no + Collaborator
// — and links to the token step of UC-001.
test("release · UC-042 3a: without a token the product section is read-only and links to UC-001's token step", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings", token: null });
  const box = page.html("product-settings");
  assert.doesNotMatch(box, /id="pseudo-off"|id="pseudo-on"|id="coll-add"/);
  assert.ok(hrefs(box).includes(`#add/${encodeURIComponent(`https://github.com/${INSTANCE}`)}`), "a link to the token step");
});

// UC-042 step 4 · PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF · SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS ·
// REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS (as the setting's explanation states it). Expected: a product
// without the setting shows on, the default; the explanation says report data is rewritten without persons and keeps its
// technical content; before switching off, the page states that report data then enters the product's issues and repository
// unchanged, that this is advisable only on a protected, non-public data space, and — the server reporting the repository as
// public — that the data will be published; Save is refused until "I have read this" is ticked, and then commits
// docs/settings.md to the product, after which it shows off.
test("release · UC-042 4: pseudonymisation is on by default; switching it off states what follows, then commits docs/settings.md", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  let box = stripTags(page.html("product-settings"));
  assert.match(box, /Pseudonymisation — on/);
  assert.match(box, /default/);
  assert.match(box, /rewrit/i);
  assert.match(box, /mentions no person|without persons/i);
  assert.match(box, /technical content/i);
  await page.fire("pseudo-off");
  assert.equal(page.byId("pseudo-confirm").hidden, false);
  const notice = stripTags(/<div id="pseudo-confirm"[\s\S]*?<\/div>/.exec(page.html("product-settings"))[0]);
  assert.match(notice, /unchanged/);
  assert.match(notice, /protected, non-public data space/);
  assert.match(notice, /public[\s\S]*published/);
  await page.fire("pseudo-save");
  assert.deepEqual(w.server.writes, [], "nothing before I have read this");
  await page.tick("pseudo-ack");
  await page.fire("pseudo-save");
  assert.equal(w.server.writes.length, 1);
  assert.deepEqual(Object.keys(w.server.writes[0].files), ["docs/settings.md"]);
  box = stripTags(page.html("product-settings"));
  assert.match(box, /Pseudonymisation — off/);
});

// UC-042 4a — switching pseudonymisation back on. Expected: it is saved without a notice; the page says that data written while
// it was off stays in the repository's history and that removing it needs a rewrite of that history.
test("release · UC-042 4a: switching back on is saved without a notice; the page says earlier data stays in the history", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  await page.fire("pseudo-off");
  await page.tick("pseudo-ack");
  await page.fire("pseudo-save");
  const box = stripTags(page.html("product-settings"));
  assert.match(box, /history/);
  assert.match(box, /rewrite/);
  await page.fire("pseudo-on");
  assert.equal(w.server.writes.length, 2, "saved without a further tick");
  assert.match(stripTags(page.html("product-settings")), /Pseudonymisation — on/);
});

// UC-042 step 5 · A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — + Collaborator takes name, account and the date they agreed, and
// a tick "this person has agreed to be named"; Save commits docs/collaborators.md. Expected: without the tick nothing is
// committed; with it, one commit of docs/collaborators.md naming the person, the account and the date; the list then shows them.
test("release · UC-042 5: + Collaborator with the person's consent commits docs/collaborators.md, without it nothing", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  page.byId("coll-name").value = "Ada Lovelace";
  page.byId("coll-account").value = "ada";
  await page.fire("coll-add");
  assert.deepEqual(w.server.writes, [], "no consent, no commit");
  page.byId("coll-name").value = "Ada Lovelace";
  page.byId("coll-account").value = "ada";
  page.byId("coll-consent").checked = true;
  await page.fire("coll-add");
  assert.equal(w.server.writes.length, 1);
  const file = w.server.writes[0].files["docs/collaborators.md"];
  assert.ok(file, "docs/collaborators.md is committed");
  for (const x of ["Ada Lovelace", "ada", daysFromToday(0)]) assert.ok(file.includes(x), x);
  assert.match(stripTags(page.html("product-settings")), /Ada Lovelace/);
});

// UC-042 step 6 · SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS · AN EXPORT STATES THAT IT CONTAINS SECRETS · AN EXPORT
// CAN BE LOCKED WITH A PASSPHRASE — and UC-014 7a, the second browser. Expected: the page states before the export that the file
// contains the GitHub token and what it grants, and opens it to whoever holds the file; an export without passphrase holds the
// token; one locked with a passphrase holds no stored secret in clear; in another browser, the locked file imported with a wrong
// passphrase imports nothing, with the right one restores the token, after which the start page needs no setup; nothing of it
// is committed or sent anywhere.
test("release · UC-042 6 · UC-014 7a: export with and without passphrase; a second browser imports it with the passphrase only", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  const notice = stripTags(page.main());
  assert.match(notice, /GitHub token, which [^.;]+/, "the GitHub token and what it grants");
  assert.match(notice, /whoever holds the file/);
  await page.fire("export-go");
  await until(() => page.asked.downloads.length === 1, "the plain export");
  page.byId("export-pass").value = "correct horse";
  page.byId("export-pass2").value = "correct horse";
  await page.fire("export-go");
  await until(() => page.asked.downloads.length === 2, "the locked export");
  const [plain, locked] = await downloaded(page);
  assert.ok(plain.text.includes(TOKEN), "the export holds the token");
  assert.ok(!locked.text.includes(TOKEN) && !locked.text.includes(TOKEN.slice(11)), "the locked export holds no secret in clear");
  assert.deepEqual(writesOf(w), [], "nothing is committed or sent");

  const w2 = await world();
  const other = await open(w2, { hash: "#settings", token: null });
  await other.tick("ack");
  other.byId("import-file").files = [{ text: async () => locked.text }];
  other.byId("import-pass").value = "wrong horse";
  await other.fire("import-go");
  await until(() => /passphrase/i.test(other.text("io-msg")), "the wrong passphrase named");
  assert.deepEqual(other.storage(), {}, "a wrong passphrase imports nothing");
  other.byId("import-file").files = [{ text: async () => locked.text }];
  other.byId("import-pass").value = "correct horse";
  await other.fire("import-go");
  await until(() => Object.values(other.storage()).includes(TOKEN), "the token restored");
  await other.go("#uc");
  assert.doesNotMatch(other.main(), /Finish setting up your instance/);
});

// UC-042 6a — the imported file names products this browser already has. Expected: they are kept; only what is missing is added;
// the page lists both.
test("release · UC-042 6a: an import keeps the products this browser has, adds the missing ones and lists both", async () => {
  const product = await productServer();
  const gitlab = gitlabServer();
  const w = await world({ product, gitlab });
  const first = await open(w, { hash: "#add" });
  await first.type("add-repo", `https://github.com/${PRODUCT}`);
  await first.fire("add-go");
  await first.type("add-repo", GL_ADDRESS);
  await first.tick("gl-ack");
  first.byId("gl-token").value = GL_TOKEN;
  await first.fire("gl-store");
  await first.fire("add-go");
  await first.go("#settings");
  await first.fire("export-go");
  await until(() => first.asked.downloads.length === 1, "the export");
  const [file] = await downloaded(first);

  const second = await open(w, { hash: "#add" });
  await second.type("add-repo", `https://github.com/${PRODUCT}`);
  await second.fire("add-go");
  await second.go("#settings");
  await second.tick("ack");
  second.byId("import-file").files = [{ text: async () => file.text }];
  await second.fire("import-go");
  await until(() => /Imported/.test(second.text("io-msg")), "the import");
  const msg = second.text("io-msg");
  const added = /Added:([^]*?)(Kept|$)/.exec(msg)?.[1] ?? "", keptPart = /Kept[^]*$/.exec(msg)?.[0] ?? "";
  assert.match(added, new RegExp(GL_ADDRESS.replace(/[.]/g, "\\.")), "the missing product is added");
  assert.match(keptPart, new RegExp(PRODUCT), "the product this browser has is kept");
  assert.ok(Object.values(second.storage()).some((v) => v.includes(GL_ADDRESS)));
});

// UC-042 step 6 · A CLEAR IS A REAL CLEAR — Clear everything in this browser. Expected: after one confirmation, every entry Agent M
// stored in localStorage is gone.
test("release · UC-042 6: Clear everything removes every entry from localStorage", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  assert.ok(Object.keys(page.storage()).length > 0);
  await page.fire("token-clear");
  assert.equal(page.asked.confirm.length, 1);
  assert.deepEqual(page.storage(), {});
});

// UC-042 — "Every section and every line carries a folded What is this?". Expected: each line of this browser, each setting of
// the product, and the sections export and clear carry a folded "What is this?".
test("release · UC-042: every line and section of the settings page explains itself", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings" });
  const rows = page.html("browser-settings").split('<div class="setting"').slice(1);
  assert.ok(rows.length >= 2);
  for (const r of rows) assert.match(r, /<summary>What is this\?<\/summary>/, stripTags(r).slice(0, 60));
  const product = page.html("product-settings").split('<div class="setting"').slice(1);
  assert.equal(product.length, 2, "pseudonymisation and collaborators");
  for (const r of product) assert.match(r, /<summary>What is this\?<\/summary>/, stripTags(r).slice(0, 60));
  const panels = page.main().split('<section class="panel').slice(1);
  for (const p of panels.filter((x) => /Export and import|Clear everything/.test(x))) assert.match(p, /<summary>What is this\?<\/summary>/);
});

// A TOKEN IS SCOPED TO WHAT IT WRITES — "the configuration screen states the minimum scope and why each part is needed".
// Expected: the settings page's token step names "Only select repositories" — this instance and its products —, and each
// permission with why it is needed.
test("release · A TOKEN IS SCOPED TO WHAT IT WRITES: the settings page states the minimum scope and why each part is needed", async () => {
  const w = await world();
  const page = await open(w, { hash: "#settings", token: null });
  const step = stripTags(/<div id="token-change"[\s\S]*?<\/div>/.exec(page.main())[0]);
  assert.match(step, /Only select repositories/);
  assert.match(step, new RegExp(INSTANCE));
  for (const p of ["Contents", "Issues", "Pull requests", "Actions", "Workflows", "Metadata"]) {
    assert.match(step, new RegExp(`${p}: (?:read and write|read) — \\w[^.—]{8,}`), `${p} with why`);
  }
});

// ================================================================ the dashboard's words for a refused read (ITM-005)

const limitOn = (status, headers) => (u, init) => (u.origin === API && u.pathname === `/repos/${INSTANCE}/commits/main`
  ? new Response('{"message":"API rate limit exceeded"}', { status, headers }) : undefined);

// A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN — Expected: a 403 with X-RateLimit-Remaining 0 and a limit of 5000 on a
// page load names the account's limit and the time it resets, and says nothing of the token being refused or lacking a
// permission; without a token and a limit of 60, it names the network's limit; a 403 without those headers, with a token, is
// still reported as a missing permission.
test("release · A USED-UP RATE LIMIT IS NAMED: the account's or the network's limit with its reset time, never the token", async () => {
  const reset = String(Math.floor(Date.now() / 1000) + 1800);
  const page = await open(await world({ refuse: limitOn(403, { "X-RateLimit-Limit": "5000", "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": reset }) }));
  const text = stripTags(page.main());
  assert.match(text, /limit/i);
  assert.match(text, /account/i);
  assert.match(text, /reset/i);
  assert.match(text, /\d{1,2}:\d{2}/, "the time it resets");
  assert.doesNotMatch(text, /refused|lacks|permission|cannot write|Extend it/i, "no token message");
  const net = await open(await world({ refuse: limitOn(403, { "X-RateLimit-Limit": "60", "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": reset }) }), { token: null });
  assert.match(stripTags(net.main()), /network/i);
  const perm = await open(await world({ refuse: limitOn(403, {}) }));
  assert.match(stripTags(perm.main()), /permission/i, "a plain 403 is a missing permission");
});

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — Expected: when GitHub refuses the stored token (401) on a page load, the
// page names the GitHub token and links GitHub's token page on which it is renewed, and the line at the top says so too.
test("release · AN EXPIRED TOKEN IS NAMED: a refused token is named with the link to renew it", async () => {
  const page = await open(await world({ refuse: limitOn(401, {}) }));
  assert.match(stripTags(page.main()), /GitHub token/);
  assert.ok(hrefs(page.main()).some((x) => x.startsWith("https://github.com/settings/personal-access-tokens")), "the renewal link");
  assert.match(stripTags(page.el("token-banner")), /GitHub token/);
});
