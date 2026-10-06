// Release tests of sprint 04 — UC-001 (ITM-208): the requirements UC-001 realises whose behaviour runs through MOD-spec-document —
// the SPEC.md skeleton that Step C, Add product, writes into a product that has none. Written by tester-opus (claude-opus-5-5),
// the Release tester of docs/process.md, who implemented none of it — neither ITM-205, ITM-206, ITM-211 nor the change between jobs
// #105 that made the page call their modules —, from UC-001 as accepted and the requirements it realises; started on sprint/04 at
// 4e7b614, 2026-10-06.
//
// Module: MOD-spec-document
// Guards: ADDING A PRODUCT CREATES ITS LAYOUT; ONE REVIEW LAYOUT FOR EVERY PRODUCT; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; UC-001
// Level: release
//
// How the page is reached: as in tests/system-uc-001-add-a-managed-product.test.mjs — the real dashboard in tests/app-harness.mjs,
// GitHub and a GitLab server replaced by fixture servers, every request logged, every click a person's click. Each case names,
// above it, the requirement it guards and states its input, its precondition and its expected result, from the requirement's rule
// and UC-001 step 5, "a SPEC.md skeleton". Counter-proofs: the pull request of these tests.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, TOKEN, REPO } from "./app-harness.mjs";

// ------------------------------------------------------------------------------------------------ the world of UC-001
//
// The same in each test file of ITM-208 — tests/system-uc-001-add-a-managed-product.test.mjs and
// tests/release-sprint-04-uc-001-*.test.mjs —, written out in each, as the release tests of sprints 01 and 02 write out theirs.
// The product and the GitLab project stand at the addresses UC-001 itself names.

const API = "https://api.github.com", RAW = "https://raw.githubusercontent.com";
const INSTANCE = REPO;                                                   // akmaier/agent-m, the harness's instance
const PRODUCT = "alice/thesis-tool", PRODUCT_WEB = `https://github.com/${PRODUCT}`;
const GL_ORIGIN = "https://gitlab.rrze.fau.de", GL_PROJECT = "fau-ai-taskforce/tools/thesis-tool";
const GL_WEB = `${GL_ORIGIN}/${GL_PROJECT}`, GL_TOKEN = "glpat-RELEASE208x0123456789ab";
// The review layout as UC-001 step 5 names it: four folders, a SPEC.md skeleton, a CHANGELOG.md.
const LAYOUT_FOLDERS = ["docs/use-cases/", "docs/architecture/", "docs/approvals/", "docs/spec-freigaben/"];
const COMPLETE_LAYOUT = Object.fromEntries([...LAYOUT_FOLDERS.map((f) => [`${f}README.md`, `# ${f}\n`]),
  ["SPEC.md", "# Our SPEC\n"], ["CHANGELOG.md", "# Our changelog\n"]]);

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
const unesc = (s) => String(s).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
// What a person reads in a part of the page: its text, without tags.
const textOf = (html) => unesc(String(html).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const hrefs = (html) => [...String(html).matchAll(/href="([^"]*)"/g)].map((m) => unesc(m[1]));
// A folded "What is this?" with text in it (EVERY STEP EXPLAINS ITSELF).
const EXPLAINED = /<details class="explain"><summary>What is this\?<\/summary><div>([\s\S]*?\S[\s\S]*?)<\/div><\/details>/;
const explained = (html) => EXPLAINED.test(html);
const explanationOf = (html) => textOf(EXPLAINED.exec(html)?.[1] ?? "");

// The instance's own repository, as UC-014 left it: a SPEC of the fixture — no test opens Agent M's own — and its review layout.
const INSTANCE_FILES = {
  "SPEC.md": "# Agent M of the fixture — Specification\n\n**VERBINDLICH (SPEC)**\n",
  ...Object.fromEntries(LAYOUT_FOLDERS.map((f) => [`${f}README.md`, `# ${f}\n`])),
};

// The product's repository on GitHub, served by the harness. visibility: "public" or "private"; missing: GitHub answers 404 for
// it — it does not exist, or it is private and the key does not reach it, which GitHub answers alike; writable: false — GitHub
// refuses a write, as it refuses a token that does not include the repository, a public one being read all the same; branch: its
// default branch, served under its own name by the harness's main. `state` changes missing and writable while a case runs.
async function githubProduct({ files = { "README.md": "# Thesis tool\n" }, visibility = "public", missing = false, writable = true,
  branch = "main" } = {}) {
  const base = `/repos/${PRODUCT}`, state = { missing, writable };
  let p = null;
  // A request this server forwards to the harness's own main is answered by the harness alone, not by these handlers again.
  const mine = (f) => (u, init) => (init.forwarded ? undefined : f(u, init));
  p = await repoServer({ repo: PRODUCT, files, handlers: [
    mine(() => (state.missing ? json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404) : undefined)),
    mine((u, init) => (init.method === "GET" && u.pathname === base ? json({ full_name: PRODUCT, private: visibility !== "public", visibility,
      default_branch: branch, permissions: { admin: false, push: state.writable, pull: true } }) : undefined)),
    mine((u, init) => (!state.writable && init.method !== "GET" ? json({ message: "Resource not accessible by personal access token" }, 403) : undefined)),
    mine((u, init) => {
      if (branch === "main") return undefined;
      if (/\/(commits|git\/refs?\/heads)\/main$/.test(u.pathname)) return json({ message: "No commit found for SHA: main" }, u.pathname.includes("/git/ref/") ? 404 : 422);
      const at = u.pathname.replace(new RegExp(`(/commits/|/git/refs?/heads/)${branch}$`), "$1main");
      return at === u.pathname ? undefined : p.fetch(`${u.origin}${at}${u.search}`, { ...init, forwarded: true });
    }),
  ] });
  return Object.assign(p, { state });
}

// A project on a GitLab server: GitLab's REST API v4 for that one project, read and written with its project access token.
// visibility: "private" or "public"; accessLevel: the role the token acts with (40 Maintainer, 30 Developer); missing: the server
// knows no such project; branch: its default branch. Every request is kept with the credentials it carries.
function gitlabProject({ origin = GL_ORIGIN, project = GL_PROJECT, token = GL_TOKEN, files = { "README.md": "# Thesis tool\n" },
  visibility = "private", accessLevel = 40, missing = false, branch = "main" } = {}) {
  const s = { origin, project, web: `${origin}/${project}`, token, files: { ...files }, head: "a".repeat(40), seq: 0, writes: [], requests: [] };
  const base = `/api/v4/projects/${encodeURIComponent(project)}`;
  const sha = (t) => String(t.length).padStart(8, "0").padEnd(40, "f");
  s.fetch = async (u, init = {}) => {
    const method = (init.method || "GET").toUpperCase(), h = new Headers(init.headers || {}), tok = h.get("private-token");
    s.requests.push({ method, url: u.href, privateToken: tok, authorization: h.get("authorization") });
    if (missing || !u.pathname.startsWith(base)) return json({ message: "404 Project Not Found" }, 404);
    if (tok && tok !== token) return json({ message: "401 Unauthorized" }, 401);
    if (visibility !== "public" && !tok) return json({ message: "404 Project Not Found" }, 404);
    const rest = u.pathname.slice(base.length);
    if (method === "GET" && rest === "") {
      return json({ id: 7, path_with_namespace: project, default_branch: branch, visibility,
        permissions: { project_access: tok ? { access_level: accessLevel } : null, group_access: null } });
    }
    if (method === "GET" && rest.startsWith("/repository/commits/")) return json({ id: s.head });
    if (method === "GET" && rest === `/repository/branches/${encodeURIComponent(branch)}`) return json({ name: branch, commit: { id: s.head } });
    if (method === "GET" && rest === "/repository/tree") {
      return json(u.searchParams.get("page") === "1" ? Object.keys(s.files).sort().map((path) => ({ type: "blob", path, id: sha(s.files[path]) })) : []);
    }
    const file = /^\/repository\/files\/([^/]+)(\/raw)?$/.exec(rest);
    if (method === "GET" && file) {
      const path = decodeURIComponent(file[1]);
      if (!(path in s.files)) return json({ message: "404 File Not Found" }, 404);
      return file[2] ? new Response(s.files[path]) : json({ file_path: path, blob_id: sha(s.files[path]), last_commit_id: s.head });
    }
    if (method === "POST" && rest === "/repository/commits") {
      if (!tok || accessLevel < 40) return json({ message: "403 Forbidden" }, 403);
      const body = JSON.parse(init.body);
      if (body.branch !== branch) return json({ message: "You can only create or edit files when you are on a branch" }, 400);
      if (body.actions.some((a) => a.action === "create" && a.file_path in s.files)) return json({ message: "A file with this name already exists" }, 400);
      for (const a of body.actions) s.files[a.file_path] = a.content;
      s.head = String(++s.seq).padStart(40, "b");
      s.writes.push({ branch: body.branch, message: body.commit_message, files: Object.fromEntries(body.actions.map((a) => [a.file_path, a.content])) });
      return json({ id: s.head, web_url: `${s.web}/-/commit/${s.head}` });
    }
    return json({ message: "404 Not Found" }, 404);
  };
  return s;
}

// The instance's server, with the product's servers behind it — the GitHub product, any other GitHub repositories (`also`:
// { repo, server }), and any GitLab projects, each on its server. Every request the page makes is logged with the credentials it
// carries and its body.
async function servers({ product = null, gitlab = [], also = [] } = {}) {
  const projects = [gitlab].flat().filter(Boolean), log = [];
  const instance = await repoServer({ files: INSTANCE_FILES, handlers: [
    (u, init) => {
      const h = new Headers(init.headers || {});
      log.push({ method: init.method, url: u.href, origin: u.origin, authorization: h.get("authorization"),
        privateToken: h.get("private-token"), body: typeof init.body === "string" ? init.body : "" });
    },
    (u, init) => (product && ((u.origin === API && u.pathname.startsWith(`/repos/${PRODUCT}`)) || (u.origin === RAW && u.pathname.startsWith(`/${PRODUCT}/`)))
      ? product.fetch(u.href, init) : undefined),
    (u, init) => also.find((o) => u.origin === API && (u.pathname === `/repos/${o.repo}` || u.pathname.startsWith(`/repos/${o.repo}/`)))
      ?.server.fetch(u.href, init),
    (u, init) => projects.find((g) => g.origin === u.origin)?.fetch(u, init),
  ] });
  return { instance, product, gitlab: projects[0] ?? null, projects, log };
}

// The instance's dashboard in a browser — with the GitHub token of UC-014 stored, or none —, the person's hands on it
// (richDocument, press), and what the person sees on the add-product page. confirm and alert record what the page asks.
async function dashboard(w, { token = TOKEN, search = "" } = {}) {
  const asked = [];
  globalThis.confirm = (t) => { asked.push(t); return true; };
  globalThis.alert = (t) => { asked.push(t); };
  const page = await openDashboard({ server: w.instance, hash: "", token, search });
  const dom = richDocument();
  const el = (id) => dom.byId(id);
  const part = (html, title) => { const at = html.indexOf(`<h3>${title}`); return at < 0 ? "" : html.slice(html.lastIndexOf("<section", at), html.indexOf("</section>", at) + 10); };
  // When the page renders its steps anew, a browser's elements inside them are new ones, holding what the new HTML holds. The
  // harness keeps an element by its id, so the parts read here are emptied at each new rendering and read from the new HTML until
  // the page writes into them again.
  const FRESH = ["add-step-a", "add-check", "add-result", "gl-check-out", "key-check"];
  const fresh = () => { for (const x of FRESH) { el(x).innerHTML = ""; el(x).textContent = ""; } };
  const markup = (id) => new RegExp(`<p id="${id}"[^>]*>([\\s\\S]*?)</p>`).exec(el("add-steps").innerHTML)?.[1] ?? "";
  return {
    page, dom, el, asked,
    async open(hash = "#add") { fresh(); await page.go(hash); },
    type(id, value) { fresh(); el(id).value = value; el(id).fire("input"); },
    tick(id) { el(id).checked = true; el(id).fire("change"); },
    click: (id, ev = { isTrusted: true }) => press(w.instance, el(id), ev),
    // The steps of the panel; Step A as the person sees it — what the page wrote into it after a Check, else its part of the steps.
    steps: () => el("add-steps").innerHTML,
    step: (title) => part(el("add-steps").innerHTML, title),
    stepA: () => el("add-step-a").innerHTML || part(el("add-steps").innerHTML, "Step A"),
    // The line under Add product: what the page wrote into it since the steps were rendered, else what the steps' HTML holds there.
    result: () => `${el("add-result").textContent} ${textOf(el("add-result").innerHTML)}`.trim() || textOf(markup("add-result")),
    // Add the product at `address` as UC-001's main flow does on GitHub, or 3c on a GitLab server: the address, Check — or the
    // project token stored and checked —, Add product.
    async add(address, glToken = GL_TOKEN) {
      await page.go("#add");
      this.type("add-repo", address);
      if (address.startsWith("https://github.com/")) await this.click("add-check-btn");
      else { this.tick("gl-ack"); el("gl-token").value = glToken; await this.click("gl-store"); }
      await this.click("add-go");
    },
  };
}

const productList = () => JSON.parse(globalThis.localStorage.getItem("agent-m.products") ?? "[]");
const writes = (w) => w.log.filter((r) => r.method !== "GET");
const storage = () => Object.fromEntries(Array.from({ length: globalThis.localStorage.length }, (_, i) => globalThis.localStorage.key(i))
  .map((k) => [k, globalThis.localStorage.getItem(k)]));

// The head line of a requirement in a SPEC: its name in bold capitals, then its source in italics in parentheses.
const REQUIREMENT_HEAD = /^\*\*[A-Z0-9][A-Z0-9 ,.'’:-]*\*\* \*\(/m;

// ADDING A PRODUCT CREATES ITS LAYOUT · ONE REVIEW LAYOUT FOR EVERY PRODUCT — UC-001 step 5: "a SPEC.md skeleton". Input: Add product
// for a GitHub product and for a GitLab project, neither holding a SPEC.md. Expected: each commit holds a SPEC.md that is the
// binding document of that product — its title names the product, it is marked VERBINDLICH (SPEC) —; it says what a requirement is
// — a name, a source, a rule and a check — and how the SPEC changes — proposed in docs/spec-freigaben/, accepted by a record in
// docs/approvals/, the layout's own folders —; it holds no requirement yet, and a section to put the first one in.
test("ADDING A PRODUCT CREATES ITS LAYOUT — a product without a SPEC gets a skeleton: its own, binding, explained, still empty", async () => {
  const product = await githubProduct();
  const gitlab = gitlabProject();
  const w = await servers({ product, gitlab });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  await d.add(GL_WEB);
  for (const [name, spec, path] of [["GitHub", product.files["SPEC.md"], PRODUCT], ["GitLab", gitlab.files["SPEC.md"], GL_PROJECT]]) {
    assert.ok(spec, `${name}: the commit holds a SPEC.md`);
    const [title] = spec.split("\n");
    assert.ok(title.startsWith("# ") && title.includes(path), `${name}: its title names the product: ${title}`);
    assert.match(spec, /^\*\*VERBINDLICH \(SPEC\)\*\*$/m, `${name}: the binding document`);
    for (const field of [/\bname\b/, /\bsource\b/, /\brule\b/, /Check:/]) assert.match(spec, field, `${name}: what a requirement is — ${field}`);
    assert.match(spec, /`docs\/spec-freigaben\/`/, `${name}: changes are proposed in the layout's queue folder`);
    assert.match(spec, /`docs\/approvals\/`/, `${name}: and accepted by its approval records`);
    assert.doesNotMatch(spec, REQUIREMENT_HEAD, `${name}: no requirement yet`);
    assert.match(spec, /^## \S/m, `${name}: a section to put the first one in`);
  }
});

// ADDING A PRODUCT CREATES ITS LAYOUT — "the missing review layout", UC-001 step 5 "skipping whatever already exists": a product's own
// SPEC is never replaced by the skeleton. Input: Add product for a GitHub product and a GitLab project that each hold their own
// SPEC.md, with a requirement in it. Expected: neither commit holds a SPEC.md; each SPEC.md stays byte for byte as it was, while the
// rest of the layout is written.
test("ADDING A PRODUCT CREATES ITS LAYOUT — a product's own SPEC.md is kept byte for byte, not replaced by the skeleton", async () => {
  const own = "# Thesis tool — Specification\n\n**VERBINDLICH (SPEC)**\n\n## 1. Export\n\n**EXPORT IS A PDF** *(PO B. Example)*\nThe export is one PDF file.\n*Check:* `tests/export.test.mjs`\n";
  const files = { "README.md": "# Thesis tool\n", "SPEC.md": own };
  const product = await githubProduct({ files });
  const gitlab = gitlabProject({ files });
  const w = await servers({ product, gitlab });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  await d.add(GL_WEB);
  for (const [name, server] of [["GitHub", product], ["GitLab", gitlab]]) {
    assert.equal(server.writes.length, 1, `${name}: the rest of the layout is written`);
    assert.ok(!("SPEC.md" in server.writes[0].files), `${name}: the commit holds no SPEC.md`);
    assert.equal(server.files["SPEC.md"], own, `${name}: its own SPEC.md, byte for byte`);
  }
});

// THE PRODUCT REPOSITORY IS SELF-SUFFICIENT — removing Agent M leaves a complete, readable set of artifacts: the skeleton refers to
// nothing that exists only inside Agent M. Input: Add product for a GitHub product holding only a README.md. Expected: every place the
// skeleton names in code — docs/spec-freigaben/, docs/approvals/ — is in the product after the commit; it names no address, neither
// the instance nor Agent M, and needs nothing else to be read.
test("THE PRODUCT REPOSITORY IS SELF-SUFFICIENT — the SPEC skeleton refers only to places in the product itself", async () => {
  const product = await githubProduct();
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  const spec = product.files["SPEC.md"];
  assert.ok(spec, "the skeleton was written");
  const named = [...spec.matchAll(/`([^`\s]+)`/g)].map((m) => m[1]).filter((x) => x.includes("/") || /\.md$/.test(x));
  assert.ok(named.length > 0, "it names places");
  for (const p of named) {
    assert.ok(Object.keys(product.files).some((f) => f === p || f.startsWith(p.endsWith("/") ? p : `${p}/`)), `${p} is in the product`);
  }
  assert.doesNotMatch(spec, /https?:\/\/|akmaier|Agent M|agent-m\b/, "no address, no instance, no Agent M");
});
