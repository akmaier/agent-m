// Release tests of sprint 04 — UC-001 (ITM-208): the requirements UC-001 realises whose behaviour runs through MOD-artifact-edits —
// Step C, Add product, and what the one click on it does: the review layout written into the product's default branch, the
// product kept in this browser's list, nothing in the instance. Written by tester-opus (claude-opus-5-5), the Release tester of
// docs/process.md, who implemented none of it — neither ITM-205, ITM-206, ITM-211 nor the change between jobs #105 that made the
// page call their modules —, from UC-001 as accepted and the requirements it realises; started on sprint/04 at 4e7b614,
// 2026-10-06.
//
// Module: MOD-artifact-edits
// Guards: ADDING A PRODUCT CREATES ITS LAYOUT; ONE REVIEW LAYOUT FOR EVERY PRODUCT; A MANAGED PRODUCT NEEDS NO PAGES SITE; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; EVERY PRODUCT HAS ITS OWN VERSION LINE; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; THE PAGE STATES WHAT IT SENDS WHERE; UC-001
// Level: release
//
// How the page is reached: as in tests/system-uc-001-add-a-managed-product.test.mjs — the real dashboard in tests/app-harness.mjs,
// GitHub and a GitLab server replaced by fixture servers, every request logged with the credentials it carries, every click a
// person's click unless a case says otherwise. Each case names, above it, the requirement it guards and states its input, its
// precondition and its expected result, from the requirement's rule and UC-001. Counter-proofs: the pull request of these tests.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
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

// What the person's one click on Add product sent: the requests logged from the click on.
async function clickAdd(d, w) {
  const from = w.log.length;
  await d.click("add-go");
  return w.log.slice(from);
}
// The files of the commit Add product made: on GitHub the harness's write, on GitLab the project's.
const committed = (server) => (server.writes[0] ? server.writes[0].files : {});

// ------------------------------------------------------------------------------------------------ ADDING A PRODUCT CREATES ITS LAYOUT

// ADDING A PRODUCT CREATES ITS LAYOUT — "into the product's default branch without a pull request". Input: Add product for a GitHub
// product and for a GitLab project, each holding only a README.md, each with the default branch `trunk`. Expected: on each, one
// commit holding the layout, on trunk — on GitHub the branch trunk moved to it, on GitLab the commit made on trunk —; no branch is
// created, no other one moved, and no pull request or merge request is opened.
test("ADDING A PRODUCT CREATES ITS LAYOUT — one commit on the product's default branch, without a pull request", async () => {
  const product = await githubProduct({ branch: "trunk" });
  const gitlab = gitlabProject({ branch: "trunk" });
  const w = await servers({ product, gitlab });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  assert.equal(product.writes.length, 1, "GitHub: one commit");
  const gh = writes(w).filter((r) => r.origin === API);
  assert.deepEqual(gh.filter((r) => /\/git\/refs/.test(r.url)).map((r) => `${r.method} ${r.url.slice(`${API}/repos/${PRODUCT}`.length)}`),
    ["PATCH /git/refs/heads/trunk"], "GitHub: the default branch, and no other ref, moved; none created");
  assert.ok(LAYOUT_FOLDERS.every((f) => Object.keys(committed(product)).some((p) => p.startsWith(f))), "GitHub: the layout");
  await d.add(GL_WEB);
  assert.equal(gitlab.writes.length, 1, "GitLab: one commit");
  assert.equal(gitlab.writes[0].branch, "trunk", "GitLab: on the default branch");
  assert.ok(LAYOUT_FOLDERS.every((f) => Object.keys(committed(gitlab)).some((p) => p.startsWith(f))), "GitLab: the layout");
  assert.deepEqual(w.log.filter((r) => /\/pulls\b|\/merge_requests\b|\/repository\/branches$/.test(new URL(r.url).pathname) && r.method !== "GET"), [],
    "no pull request, no merge request, no new branch");
});

// ADDING A PRODUCT CREATES ITS LAYOUT — "the missing review layout": UC-001 step 5, "skipping whatever already exists". Input: a
// product that has its own SPEC.md and a use case under docs/use-cases/, and nothing else of the layout. Expected: one commit holding
// exactly the parts it lacks — a README.md in docs/architecture/, docs/approvals/ and docs/spec-freigaben/, and a CHANGELOG.md —;
// SPEC.md and docs/use-cases/ are not in it and stay as they were, byte for byte. Counter-case: a product that has every part gets
// no commit (5b).
test("ADDING A PRODUCT CREATES ITS LAYOUT — only the missing parts are written; a complete layout gets no commit", async () => {
  const own = { "README.md": "# Thesis tool\n", "SPEC.md": "# Thesis tool — our own SPEC\n\nKept as it is.\n", "docs/use-cases/UC-001-write.md": "# UC-001 Write\n" };
  const product = await githubProduct({ files: own });
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  assert.deepEqual(Object.keys(committed(product)).sort(),
    ["CHANGELOG.md", "docs/approvals/README.md", "docs/architecture/README.md", "docs/spec-freigaben/README.md"], "exactly the missing parts");
  for (const [path, text] of Object.entries(own)) assert.equal(product.files[path], text, `${path} unchanged`);

  const complete = await githubProduct({ files: COMPLETE_LAYOUT });
  const w2 = await servers({ product: complete });
  const d2 = await dashboard(w2);
  await d2.add(PRODUCT_WEB);
  assert.deepEqual(complete.writes, [], "a complete layout: no commit");
});

// ------------------------------------------------------------------------------------------------ ONE REVIEW LAYOUT FOR EVERY PRODUCT

// ONE REVIEW LAYOUT FOR EVERY PRODUCT — Agent M and every managed product use the same layout below docs/: use cases in
// docs/use-cases/, architecture decisions in docs/architecture/, SPEC change queues in docs/spec-freigaben/, approval records in
// docs/approvals/. Input: Agent M's own repository — this checkout, its folders only —; a GitHub product and a GitLab project added.
// Expected: Agent M has the four folders; after Add product each product has the same four, each with a README.md that says it
// holds what the requirement puts there.
test("ONE REVIEW LAYOUT FOR EVERY PRODUCT — each product added gets Agent M's own four folders, each saying what it holds", async () => {
  for (const f of LAYOUT_FOLDERS) {
    const here = new URL(`../${f}`, import.meta.url);
    assert.ok(existsSync(here) && statSync(here).isDirectory(), `Agent M has ${f}`);
  }
  const product = await githubProduct();
  const gitlab = gitlabProject();
  const w = await servers({ product, gitlab });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  await d.add(GL_WEB);
  const holds = { "docs/use-cases/": /holds the use cases/, "docs/architecture/": /holds the architecture[^.]*decision/,
    "docs/spec-freigaben/": /holds the change queues of the SPEC/, "docs/approvals/": /holds the approval records/ };
  for (const [name, files] of [["GitHub", product.files], ["GitLab", gitlab.files]]) {
    for (const f of LAYOUT_FOLDERS) assert.match(files[`${f}README.md`] ?? "", holds[f], `${name}: ${f} says what it holds`);
  }
});

// ------------------------------------------------------------------------------------------------ A MANAGED PRODUCT NEEDS NO PAGES SITE

// A MANAGED PRODUCT NEEDS NO PAGES SITE — UC-001's goal: "The product gets no Pages site"; its artifacts are reviewed on the
// instance's dashboard. Input: Add product for a GitHub product, then the page's offer to switch to it, followed. Expected: the
// commit holds no Pages site — no index.html, .nojekyll, _config.yml or CNAME — and its review folders lie below docs/; no request
// asks GitHub for Pages; the offer leads to the instance's own dashboard, which shows the product's use cases from the product's
// own repository; no link leads to a site of the product.
test("A MANAGED PRODUCT NEEDS NO PAGES SITE — no site is set up; the product is opened on the instance's dashboard", async () => {
  const product = await githubProduct();
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  const paths = Object.keys(committed(product));
  assert.ok(paths.length > 0);
  assert.deepEqual(paths.filter((p) => /(^|\/)(index\.html|\.nojekyll|_config\.yml|CNAME)$/.test(p)), [], "no file of a Pages site");
  assert.deepEqual(paths.filter((p) => p.endsWith("README.md")).filter((p) => !p.startsWith("docs/")), [], "the review folders lie below docs/");
  assert.deepEqual(w.log.filter((r) => /\/pages\b/.test(new URL(r.url).pathname)), [], "no request about Pages");
  const links = hrefs(d.el("add-result").innerHTML);
  assert.deepEqual(links.filter((x) => /github\.io/.test(x) && !x.includes("akmaier.github.io/agent-m")), [], "no link to a site of the product");
  const offer = links.find((x) => new URLSearchParams(x.replace(/^[^?]*\?/, "")).get("repo") === PRODUCT);
  assert.ok(offer?.startsWith("?"), "the offer is an address on this dashboard");
  const there = await dashboard(w, { search: offer });
  assert.match(textOf(there.page.main()), /This folder holds the use cases of alice\/thesis-tool/, "the instance's dashboard shows the product's use cases");
  assert.ok(product.requests.includes("file docs/use-cases/README.md"), "read from the product's own repository");
  assert.equal(`${globalThis.location.origin}${globalThis.location.pathname}`, "https://akmaier.github.io/agent-m/", "on the instance's site");
});

// ------------------------------------------------------------------------------------------------ the product list in this browser

// THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER — the addresses of the products it manages, in localStorage, beside the tokens that
// reach them. Input: a GitHub product and a GitLab project added in one browser. Expected: this browser's localStorage holds both
// addresses in its product list, beside the GitHub token and the GitLab project token; the instance's repository gets no commit;
// the selector offers both. Counter-case: another browser, with its own localStorage, reading the same instance offers neither.
test("THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER — the addresses in localStorage, beside the tokens; another browser has none", async () => {
  const w = await servers({ product: await githubProduct(), gitlab: gitlabProject() });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  await d.add(GL_WEB);
  const kept = storage();
  assert.deepEqual(JSON.parse(kept["agent-m.products"] ?? "null"), [PRODUCT_WEB, GL_WEB], "both addresses, in this browser");
  assert.equal(kept["agent-m.github-token"], TOKEN, "beside the GitHub token");
  assert.equal(JSON.parse(kept["agent-m.gitlab-tokens"] ?? "{}")[GL_WEB]?.token, GL_TOKEN, "and the project token that reaches the GitLab one");
  assert.deepEqual(w.instance.writes, [], "no commit in the instance");
  for (const a of [PRODUCT_WEB, GL_WEB]) assert.ok(d.el("product").innerHTML.includes(`<option value="${a}"`), `the selector offers ${a}`);
  const other = await dashboard(w, { token: TOKEN });
  assert.deepEqual(productList(), [], "another browser: an empty list");
  for (const a of [PRODUCT_WEB, GL_WEB]) assert.ok(!other.el("product").innerHTML.includes(a), `another browser does not offer ${a}`);
});

// NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY — UC-001's postcondition: "the instance repository names no product". Input: a GitHub
// product and a GitLab project added. Expected: the products' writes are seen in the log — its known positive —, and no request
// writes to the instance's repository; no file of the instance names either product.
test("NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY — adding writes nothing into the instance", async () => {
  const product = await githubProduct();
  const gitlab = gitlabProject();
  const w = await servers({ product, gitlab });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  await d.add(GL_WEB);
  assert.ok(writes(w).some((r) => r.url.startsWith(`${API}/repos/${PRODUCT}/`)) && writes(w).some((r) => r.origin === GL_ORIGIN),
    "the products' writes are logged");
  assert.deepEqual(writes(w).filter((r) => r.url.startsWith(`${API}/repos/${INSTANCE}`)), [], "no write to the instance");
  assert.deepEqual(w.instance.writes, []);
  for (const [path, text] of Object.entries(w.instance.files)) {
    assert.ok(!text.includes(PRODUCT) && !text.includes(GL_PROJECT), `${path} names no product`);
  }
});

// ------------------------------------------------------------------------------------------------ what the layout is

// THE PRODUCT REPOSITORY IS SELF-SUFFICIENT — removing Agent M leaves a complete, readable set of artifacts behind: no artifact
// references a file or service that exists only inside Agent M. Input: Add product for a GitHub product holding only a README.md.
// Expected: every file the commit writes is Markdown whose references all point into the product itself — each path it names in
// code, such as docs/approvals/ or SPEC.md, is in the product after the commit, unless it is a name pattern such as
// UC-<nnn>-<slug>.md —; none links an address, names the instance or a file of Agent M (docs/assets/, src/, tools/).
test("THE PRODUCT REPOSITORY IS SELF-SUFFICIENT — the layout refers only to the product itself", async () => {
  const product = await githubProduct();
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  const files = committed(product);
  assert.ok(Object.keys(files).length >= 6, "the layout was written");
  const inProduct = (p) => p in product.files || Object.keys(product.files).some((f) => f.startsWith(p.endsWith("/") ? p : `${p}/`));
  for (const [path, text] of Object.entries(files)) {
    assert.match(path, /\.md$/, `${path} is Markdown`);
    assert.doesNotMatch(text, /https?:\/\//, `${path} links no address`);
    assert.doesNotMatch(text, /akmaier|agent-m\b|docs\/assets\/|\bsrc\/|\btools\//, `${path} names nothing of Agent M`);
    const named = [...text.matchAll(/`([^`\s]+)`/g)].map((m) => m[1]).filter((x) => x.includes("/") || /\.md$/.test(x));
    for (const p of named) if (!p.includes("<")) assert.ok(inProduct(p), `${path} names ${p}, which the product holds`);
  }
});

// EVERY PRODUCT HAS ITS OWN VERSION LINE — each product's version is independent of Agent M's and of every other product's. Input: a
// GitHub product and a GitLab project added one after the other in one browser. Expected: each gets a CHANGELOG.md of its own that
// names that product and no other, and holds no version yet; adding the second writes nothing into the first; no tag is set
// anywhere, the instance included.
test("EVERY PRODUCT HAS ITS OWN VERSION LINE — each product starts a changelog of its own, without a version, and no tag", async () => {
  const product = await githubProduct();
  const gitlab = gitlabProject();
  const w = await servers({ product, gitlab });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  await d.add(GL_WEB);
  const gh = product.files["CHANGELOG.md"], gl = gitlab.files["CHANGELOG.md"];
  assert.ok(gh && gl, "each has a CHANGELOG.md");
  assert.ok(gh.includes(PRODUCT) && !gh.includes(GL_PROJECT), "GitHub's names its product, no other");
  assert.ok(gl.includes(GL_PROJECT) && !gl.includes(`${PRODUCT}\n`) && !gl.includes(` ${PRODUCT}`), "GitLab's names its product, no other");
  for (const t of [gh, gl]) assert.doesNotMatch(t, /\bv?\d{4}\.\d+\.\d+\b/, "no version yet");
  assert.equal(product.writes.length, 1, "the second product's add wrote nothing into the first");
  assert.deepEqual(w.log.filter((r) => /\/(git\/tags|git\/refs\/tags|releases|repository\/tags)\b/.test(new URL(r.url).pathname)), [], "no tag, no release");
});

// ------------------------------------------------------------------------------------------------ the click

// THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — "only as the direct result of a person's action on it, as a commit made with that
// person's own token". Input: the address typed, Check pressed, then Add product clicked by a script — an event the browser does not
// mark as trusted —, then by the person; the same on a GitLab project, with its token stored. Expected: typing, Check and the
// script's click write nothing and list nothing; the person's click makes the commit, every write request of it carrying the
// person's own token — on GitHub the GitHub token, on GitLab the project token the person stored.
test("THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — a script's click writes nothing; the person's writes with the person's token", async () => {
  const product = await githubProduct();
  const gitlab = gitlabProject();
  const w = await servers({ product, gitlab });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  await d.click("add-check-btn");
  await d.click("add-go", { isTrusted: false });
  assert.deepEqual(writes(w), [], "typing, Check and a script's click write nothing");
  assert.deepEqual(productList(), [], "and keep nothing");
  const sent = await clickAdd(d, w);
  assert.equal(product.writes.length, 1, "the person's click writes");
  const ghWrites = sent.filter((r) => r.method !== "GET");
  assert.ok(ghWrites.length > 0 && ghWrites.every((r) => r.authorization === `Bearer ${TOKEN}`), "with the person's GitHub token");

  d.type("add-repo", GL_WEB);
  d.tick("gl-ack");
  d.el("gl-token").value = GL_TOKEN;
  await d.click("gl-store");
  await d.click("add-go", { isTrusted: false });
  assert.deepEqual(gitlab.writes, [], "GitLab: a script's click writes nothing");
  await d.click("add-go");
  assert.equal(gitlab.writes.length, 1, "GitLab: the person's click writes");
  const glWrites = gitlab.requests.filter((r) => r.method !== "GET");
  assert.ok(glWrites.length > 0 && glWrites.every((r) => r.privateToken === GL_TOKEN), "with the project token the person stored");
});

// ONE CLICK PER DECISION — a decision on the dashboard, adding a product among them, takes one click once its inputs are complete,
// and everything that follows from it is done by Agent M. Input: the address typed and checked — the inputs complete. Expected: one
// click on Add product, and no other, leaves the layout committed, the product in this browser's list and offered in the selector,
// the commit linked and the switch offered; the page asks for no confirmation on the way.
test("ONE CLICK PER DECISION — one click on Add product does everything that follows from it", async () => {
  const product = await githubProduct();
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  await d.click("add-check-btn");
  assert.deepEqual([product.writes.length, productList().length], [0, 0], "inputs complete, nothing done yet");
  await d.click("add-go");
  assert.equal(product.writes.length, 1, "the layout committed");
  assert.deepEqual(productList(), [PRODUCT_WEB], "the product listed");
  assert.ok(d.el("product").innerHTML.includes(`<option value="${PRODUCT_WEB}"`), "and offered in the selector");
  const links = hrefs(d.el("add-result").innerHTML);
  assert.ok(links.some((x) => x.startsWith(`${PRODUCT_WEB}/commit/`)), "the commit linked");
  assert.ok(links.some((x) => new URLSearchParams(x.replace(/^[^?]*\?/, "")).get("repo") === PRODUCT), "the switch offered");
  assert.deepEqual(d.asked, [], "no confirmation asked");
});

// ------------------------------------------------------------------------------------------------ what the page says

// EVERY STEP EXPLAINS ITSELF — every step that asks something of the person carries an explanation that can be expanded, written for
// someone new to GitHub; UC-001, as it reads since 5260a64: "what a repository is, why a new key replaces the old one, what the
// commit contains, how to undo it, and why the product list lives in this browser only". Input: the add-product page on GitHub with
// a token, without one (3b), on a GitLab project (3c), and after a Check on a repository that does not exist (2a). Expected: the
// address field and every step, in each of these states, carries a folded "What is this?" with text; together they say the five
// things; and Step C's names every part the commit then writes into an empty product.
test("EVERY STEP EXPLAINS ITSELF — every step of Add product explains itself, and Step C names what its commit holds", async () => {
  const product = await githubProduct({ missing: true });
  const w = await servers({ product, gitlab: gitlabProject() });
  const steps = (html) => html.split('<section class="step">').slice(1);
  const said = [];
  const all = async (d, what) => {
    for (const s of steps(d.steps())) { assert.ok(explained(s), `${what}: ${textOf(s).slice(0, 50)}`); said.push(explanationOf(s)); }
  };
  const d = await dashboard(w);
  await d.open();
  const field = d.page.main().slice(d.page.main().indexOf('id="add-repo"'));
  assert.ok(explained(field), "the address field");
  said.push(explanationOf(field));
  d.type("add-repo", PRODUCT_WEB);
  await all(d, "GitHub");
  await d.click("add-check-btn");
  assert.ok(explained(d.el("add-check").innerHTML), "2a: the answer that the repository is missing");
  d.type("add-repo", GL_WEB);
  await all(d, "GitLab");

  product.state.missing = false;
  d.type("add-repo", PRODUCT_WEB);
  const c = explanationOf(d.step("Step C"));
  await d.click("add-go");
  const parts = Object.keys(committed(product));
  assert.ok(parts.length >= 6, "the commit was made");
  for (const p of parts) {
    const where = p.includes("/") ? p.slice(0, p.lastIndexOf("/") + 1) : p;
    assert.ok(c.includes(where) && c.includes(p.split("/").pop()), `Step C names ${p}, which the commit holds`);
  }

  // Another browser, without a token (3b) — opened last: a page load replaces the browser this case worked in.
  const bare = await dashboard(w, { token: null });
  await bare.open();
  bare.type("add-repo", PRODUCT_WEB);
  await all(bare, "without a token");
  const told = said.join(" ");
  for (const [what, words] of [["what a repository is", /A repository is/i], ["why a new key replaces the old one", /needs a key that reaches it[\s\S]*new key replaces the old one/i],
    ["what the commit contains", /One click writes one commit/i], ["how to undo it", /revert/i],
    ["why the product list lives in this browser only", /product list lives in this browser only/i]]) assert.match(told, words, what);
});

// THE PAGE STATES WHAT IT SENDS WHERE — before Agent M acts, it names every destination it will contact and what it will send there.
// Input: Step C of a GitHub product and of a GitLab project, read before Add product is clicked. Expected: it names where the one
// commit goes — the product repository's default branch, the GitLab project's —, what it holds — the layout's parts —, and that
// nothing goes into the instance; the click then contacts that repository's API alone.
test("THE PAGE STATES WHAT IT SENDS WHERE — Step C names where its commit goes and what it holds; the click goes there alone", async () => {
  const product = await githubProduct();
  const gitlab = gitlabProject();
  const w = await servers({ product, gitlab });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  await d.click("add-check-btn");
  const gh = explanationOf(d.step("Step C"));
  assert.match(gh, /into the product repository's default branch/, "GitHub: where");
  assert.match(gh, /SPEC\.md[\s\S]*CHANGELOG\.md/, "GitHub: what");
  assert.match(gh, /nothing is written into your instance/, "GitHub: not into the instance");
  const sent = await clickAdd(d, w);
  assert.ok(sent.length > 0);
  assert.deepEqual(sent.filter((r) => !r.url.startsWith(`${API}/repos/${PRODUCT}`)), [], "GitHub: the click went to the product alone");

  d.type("add-repo", GL_WEB);
  d.tick("gl-ack");
  d.el("gl-token").value = GL_TOKEN;
  await d.click("gl-store");
  const gl = explanationOf(d.step("Step C"));
  assert.match(gl, /into the GitLab project's default branch/, "GitLab: where");
  assert.match(gl, /SPEC\.md[\s\S]*CHANGELOG\.md/, "GitLab: what");
  assert.match(gl, /nothing is written into your instance/, "GitLab: not into the instance");
  const sentGl = await clickAdd(d, w);
  assert.ok(sentGl.length > 0);
  assert.deepEqual(sentGl.filter((r) => !r.url.startsWith(`${GL_ORIGIN}/api/v4/projects/${encodeURIComponent(GL_PROJECT)}`)), [],
    "GitLab: the click went to the project's API alone");
});
