// Release tests of sprint 04 — UC-001 (ITM-208): the requirements UC-001 realises whose behaviour runs through MOD-repository-hosts —
// the product named by its address, read and written on GitHub or a GitLab server, and the tokens that reach it: the pages where they
// are made, what the page asks for and tells before one is stored, and where each goes. Written by tester-opus (claude-opus-5-5), the
// Release tester of docs/process.md, who implemented none of it — neither ITM-205, ITM-206, ITM-211 nor the change between jobs #105
// that made the page call their modules —, from UC-001 as accepted and the requirements it realises; started on sprint/04 at
// 4e7b614, 2026-10-06. Changed by tester-opus (claude-opus-5-5), the Release tester, who implemented none of it, for UC-001 as drafted
// in 2deaa7f — Step A asks for a key of the product's own, the instance's key unchanged —, on fix/product-token-prefill at ea87df2,
// 2026-10-06: the seven cases of the GitHub token, from THE TOKEN LINK IS PREFILLED to THE PAGE STATES WHAT IT SENDS WHERE.
//
// Module: MOD-repository-hosts
// Guards: A PRODUCT IS NAMED BY ITS ADDRESS; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; THE TOKEN LINK IS PREFILLED; THE REPOSITORY CHOICE IS SPELLED OUT; A TOKEN IS SCOPED TO WHAT IT WRITES; THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN; CONFIGURATION LIVES IN THE BROWSER; THE SHARED PAGES ORIGIN IS DISCLOSED; THE PAGE STATES WHAT IT SENDS WHERE; UC-001
// Level: release
//
// How the page is reached: as in tests/system-uc-001-add-a-managed-product.test.mjs — the real dashboard in tests/app-harness.mjs,
// GitHub and GitLab servers replaced by fixture servers, every request logged with the credentials it carries, every click a
// person's click. The header names MOD-repository-hosts, whose file holds these pages and this route of the tokens (Data: the token
// pages; connect: the token only to the server that issued it); of what these cases see, the steps' texts, the key setup without a
// token and Step B's check are still written by the page's own code. Each case names, above it, the requirement it guards and
// states its input, its precondition and its expected result, from the requirement's rule and UC-001. Counter-proofs: the pull
// request of these tests.

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

// A second GitLab server, beside the one UC-001 names (GITLAB PRODUCTS ARE SUPPORTED: any GitLab server).
const OTHER = { origin: "https://git.example.org", project: "lab/thesis", token: "glpat-OTHERSERVER0123456789" };
const OTHER_WEB = `${OTHER.origin}/${OTHER.project}`;
// The query of a link, as a map.
const query = (url) => Object.fromEntries(new URL(url).searchParams);
const tokenLink = (html) => hrefs(html).find((x) => x.startsWith("https://github.com/settings/personal-access-tokens/new?"));
// The repositories a step tells the person to pick on GitHub's page — those of its sentence ending in "— nothing else" —, sorted.
const picked = (html) => {
  const m = /pick ((?:“[^”]+”(?:, | and )?)+) — nothing else/.exec(textOf(html));
  return m ? [...m[1].matchAll(/“([^”]+)”/g)].map((x) => x[1]).sort() : null;
};
// A GitHub product this browser already lists, beside the one being added (UC-001 step 3: "every GitHub product this browser already
// lists"), and the browser's list holding it and a GitLab project — THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER: in localStorage.
const LISTED = "alice/other-tool";
const listed = () => globalThis.localStorage.setItem("agent-m.products", JSON.stringify([`https://github.com/${LISTED}`, GL_WEB]));
// Step A up to Step B: its two parts, the token page and the new key's paste field.
const stepA = (d) => d.steps().slice(0, d.steps().indexOf("<h3>Step B"));
// The step that takes a key: the one holding the paste field with this id — on GitHub a part of Step A (UC-001 step 3), on a GitLab
// server Step B (3c).
const takes = (d, field) => d.steps().split('<section class="step">').find((s) => s.includes(`id="${field}"`)) ?? "";
// The keys this browser keeps for GitHub products, by the product's address — as it keeps the GitLab project tokens (3c).
const productKeys = () => JSON.parse(globalThis.localStorage.getItem("agent-m.github-product-tokens") ?? "{}");

// ------------------------------------------------------------------------------------------------ the product, by its address

// A PRODUCT IS NAMED BY ITS ADDRESS — a product is identified by the web address of its repository, on github.com or on a GitLab
// server; UC-001 step 2: pasted "as it appears in the browser". Input: what a browser shows on the repository's pages —
// https://github.com/alice/thesis-tool/tree/main, the same with a trailing slash, with .git —, and a GitLab project's page with all
// its groups, https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool/-/tree/main. Expected: each is read as its repository's
// address, https://github.com/alice/thesis-tool and https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool, by which the
// product is written to, kept once in this browser's list and offered in the selector, however it was typed. Counter-case: an
// address that names no repository, https://github.com/alice, is refused with what it lacks, and Add product cannot be clicked.
test("A PRODUCT IS NAMED BY ITS ADDRESS — the address as the browser shows it names the product, once, however it was typed", async () => {
  const product = await githubProduct();
  const gitlab = gitlabProject();
  const w = await servers({ product, gitlab });
  const d = await dashboard(w);
  for (const typed of [`${PRODUCT_WEB}/tree/main`, `${PRODUCT_WEB}/`, `${PRODUCT_WEB}.git`]) await d.add(typed);
  assert.equal(product.writes.length, 1, "written to alice/thesis-tool, the first time");
  assert.ok(writes(w).every((r) => r.url.startsWith(`${API}/repos/${PRODUCT}/`)), "by its address");
  await d.add(`${GL_WEB}/-/tree/main`);
  assert.equal(gitlab.writes.length, 1, "the GitLab project, with all its groups");
  assert.deepEqual(productList(), [PRODUCT_WEB, GL_WEB], "each kept once, by its repository's address");
  for (const a of [PRODUCT_WEB, GL_WEB]) assert.equal(d.el("product").innerHTML.split(`<option value="${a}"`).length - 1, 1, `${a} offered once`);

  await d.open();
  d.type("add-repo", "https://github.com/alice");
  assert.match(d.result(), /names an owner and a repository/, "what the address lacks");
  assert.equal(d.el("add-go").disabled, true, "Add product cannot be clicked");
});

// GITLAB PRODUCTS ARE SUPPORTED — Agent M reads and writes products on any GitLab server whose API accepts requests from the
// instance's Pages address. Input: a project on gitlab.rrze.fau.de, the server UC-001 names, and one on another GitLab server,
// git.example.org; each added with its own project token. Expected: on each server the project is read through that server's API —
// Store and check reports it reachable — and written: Add product commits the layout there; each server is asked only about its own
// project, and each project keeps its own token (UC-001 3c).
test("GITLAB PRODUCTS ARE SUPPORTED — projects on two GitLab servers are read and written, each through its own server", async () => {
  const rrze = gitlabProject(), other = gitlabProject(OTHER);
  const w = await servers({ gitlab: [rrze, other] });
  const d = await dashboard(w);
  for (const [g, web, token] of [[rrze, GL_WEB, GL_TOKEN], [other, OTHER_WEB, OTHER.token]]) {
    await d.open();
    d.type("add-repo", web);
    d.tick("gl-ack");
    d.el("gl-token").value = token;
    await d.click("gl-store");
    assert.match(textOf(d.el("gl-check-out").innerHTML), new RegExp(`^✓ ${web.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")} reachable`), `${web}: read`);
    await d.click("add-go");
    assert.equal(g.writes.length, 1, `${web}: written`);
    assert.ok(LAYOUT_FOLDERS.every((f) => Object.keys(g.writes[0].files).some((p) => p.startsWith(f))), `${web}: the layout`);
    assert.ok(g.requests.every((r) => r.url.startsWith(`${g.origin}/api/v4/projects/${encodeURIComponent(g.project)}`)), `${web}: only its own project`);
  }
  assert.deepEqual(productList(), [GL_WEB, OTHER_WEB]);
  const tokens = JSON.parse(globalThis.localStorage.getItem("agent-m.gitlab-tokens") ?? "{}");
  assert.deepEqual([tokens[GL_WEB]?.token, tokens[OTHER_WEB]?.token], [GL_TOKEN, OTHER.token], "each project keeps its own token");
});

// A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — for a product on a GitLab server, Agent M guides the person to create a project access
// token for that one project, with role Maintainer and scope api, and to paste it into Agent M. Input: the GitLab project's address.
// Expected: Step A links that project's own Access tokens page and names role Maintainer and scope api, nothing broader; Step B takes
// the pasted token; a GitHub token pasted there is refused and not stored; Add product cannot be clicked before the project's token
// is stored, and writes with it once it is.
test("A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — made on the project's page, Maintainer and api, pasted, and written with", async () => {
  const gitlab = gitlabProject();
  const w = await servers({ gitlab });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", GL_WEB);
  const a = d.step("Step A");
  assert.ok(hrefs(a).includes(`${GL_WEB}/-/settings/access_tokens`), "the project's own Access tokens page");
  assert.match(textOf(a), /Select a role: Maintainer/, "role Maintainer");
  assert.match(textOf(a), /Select scopes: api — nothing else/, "scope api, nothing broader");
  assert.equal(d.el("add-go").disabled, true, "no Add product before the project's token is stored");
  assert.match(d.result(), /Store the project's token in Step B first/);
  d.tick("gl-ack");
  d.el("gl-token").value = TOKEN;
  await d.click("gl-store");
  assert.match(d.el("gl-check-out").textContent, /That is a GitHub token/, "a GitHub token is refused");
  assert.equal(globalThis.localStorage.getItem("agent-m.gitlab-tokens"), null, "and not stored");
  d.el("gl-token").value = GL_TOKEN;
  await d.click("gl-store");
  assert.equal(d.el("add-go").disabled, false, "stored: Add product can be clicked");
  await d.click("add-go");
  assert.equal(gitlab.writes.length, 1);
  assert.ok(gitlab.requests.filter((r) => r.method === "POST").every((r) => r.privateToken === GL_TOKEN), "written with the project token");
});

// ------------------------------------------------------------------------------------------------ where each token goes

// A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — each repository token leaves the browser only as the authorisation header of requests
// to the API of the server that issued it. Input: one browser adds a GitHub product with the GitHub token — Check, Add product — and a
// GitLab project with its project token — Store and check, Add product. Expected: the GitHub token is seen — the known positive —, and
// only as `Authorization: Bearer …` on requests to api.github.com; the project token is seen, and only as `PRIVATE-TOKEN` on requests
// to its project's API on gitlab.rrze.fau.de; neither appears in any address or body, nor on a request to another server.
test("A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token to GitHub's API, the project token to its project's", async () => {
  const w = await servers({ product: await githubProduct(), gitlab: gitlabProject() });
  const d = await dashboard(w);
  await d.add(PRODUCT_WEB);
  await d.add(GL_WEB);
  const carrying = (t) => w.log.filter((r) => r.authorization?.includes(t) || r.privateToken === t || r.url.includes(t) || r.body.includes(t));
  const gh = carrying(TOKEN), gl = carrying(GL_TOKEN);
  assert.ok(gh.length > 0 && gl.length > 0, "both tokens are seen");
  for (const r of gh) {
    assert.equal(r.origin, API, `the GitHub token only to GitHub's API: ${r.method} ${r.url}`);
    assert.equal(r.authorization, `Bearer ${TOKEN}`, "as its authorisation header");
    assert.ok(!r.url.includes(TOKEN) && !r.body.includes(TOKEN) && r.privateToken === null, "nowhere else in the request");
  }
  for (const r of gl) {
    assert.ok(r.url.startsWith(`${GL_ORIGIN}/api/v4/projects/${encodeURIComponent(GL_PROJECT)}`), `the project token only to its project's API: ${r.url}`);
    assert.equal(r.privateToken, GL_TOKEN, "as its PRIVATE-TOKEN header");
    assert.ok(!r.url.includes(GL_TOKEN) && !r.body.includes(GL_TOKEN) && r.authorization === null, "nowhere else in the request");
  }
});

// ------------------------------------------------------------------------------------------------ the GitHub token, and what is asked for

// THE TOKEN LINK IS PREFILLED — Agent M links to GitHub's page for new fine-grained tokens with name, description, expiry and the
// required permissions already filled in; the required permissions are those of ONE GITHUB TOKEN SERVES EVERY FEATURE: Contents, Issues
// and Pull requests read and write, Actions and Workflows read and write, Metadata read. Input: the add-product page without the
// instance's key — UC-001 3b, where the product's steps are the same as with it. Expected: the link to
// github.com/settings/personal-access-tokens/new fills in a name, a description and an expiry in days, the product's owner, alice, as
// the token's owner (UC-001 step 3), and exactly those permissions in GitHub's parameters: contents, issues, pull_requests, actions and
// workflows `write`, metadata `read`.
test("THE TOKEN LINK IS PREFILLED — GitHub's new-token page with name, description, expiry and exactly the permissions needed", async () => {
  const w = await servers({ product: await githubProduct() });
  const d = await dashboard(w, { token: null });
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  const link = tokenLink(d.steps());
  assert.ok(link, "the link to GitHub's page for a new fine-grained token");
  const { name, description, target_name: owner, expires_in: days, ...permissions } = query(link);
  assert.ok(name?.trim() && description?.trim(), "a name and a description");
  assert.equal(owner, "alice", "the product's owner as the token's owner");
  assert.match(days ?? "", /^[1-9]\d*$/, "an expiry, in days");
  assert.deepEqual(permissions, { contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", metadata: "read" },
    "exactly the permissions every feature needs");
});

// THE REPOSITORY CHOICE IS SPELLED OUT — Agent M tells the person to choose Only select repositories on GitHub's token page and names
// each repository to select; UC-001 step 3, as drafted in 2deaa7f: <product repository> — nothing else. Input: the add-product page
// without the instance's key — 3b, the product's steps the same —, and with it in a browser that already lists a GitHub product,
// alice/other-tool, and a GitLab project. Expected: in each, “Only select repositories”, then alice/thesis-tool, nothing else — not the
// instance, not the GitHub product listed, and not the GitLab project, whose token is its own.
test("THE REPOSITORY CHOICE IS SPELLED OUT — Only select repositories, and each repository to select by name", async () => {
  const w = await servers({ product: await githubProduct() });
  const bare = await dashboard(w, { token: null });
  await bare.open();
  bare.type("add-repo", PRODUCT_WEB);
  const made = bare.step("Step A");
  assert.match(textOf(made), /choose “Only select repositories”/);
  assert.deepEqual(picked(made), [PRODUCT], "without the instance's key: the product repository, nothing else");
  const d = await dashboard(w);
  listed();
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  const a = stepA(d);
  assert.match(textOf(a), /choose “Only select repositories”/);
  assert.deepEqual(picked(a), [PRODUCT], "with it: the product repository, nothing else — not the instance, not the GitHub product listed");
  assert.ok(!textOf(a).includes(GL_PROJECT), "not the GitLab project");
});

// A TOKEN IS SCOPED TO WHAT IT WRITES — every repository token Agent M asks for carries write access only to the repositories of the
// instance and the products it manages; its check: the configuration screen states the minimum scope and why each part is needed.
// Input: the add-product page without the instance's key (3b) and with it in a browser that already lists a GitHub product and a
// GitLab project — each time the product's own key, UC-001 step 3 as drafted in 2deaa7f —, and for a GitLab project. Expected: the
// product's GitHub key is asked for alice/thesis-tool alone, with or without the instance's key — never for the instance, the listed
// alice/other-tool or the GitLab project —, each time with GitHub's preset “All repositories” named as what not to keep, and why, and
// with the explanation of why the product gets a key of its own; the GitLab token is one for this project, and the page says that a
// personal token would reach every project. The instance's own key, whose step names each permission with why it is needed, is
// asked for in UC-014 and no longer on this page; its release tests are those of UC-014 7 and of this requirement in
// tests/release-sprint-01-dashboard-app.test.mjs.
test("A TOKEN IS SCOPED TO WHAT IT WRITES — only the instance and its products, each part with its reason", async () => {
  const w = await servers({ product: await githubProduct() });
  const bare = await dashboard(w, { token: null });
  await bare.open();
  bare.type("add-repo", PRODUCT_WEB);
  const first = bare.step("Step A"), said = textOf(first);
  assert.deepEqual(picked(first), [PRODUCT], "without the instance's key: the product alone");
  assert.match(said, /GitHub preselects “All repositories”, which would give Agent M write access to everything you own/, "and why not all");
  assert.match(explanationOf(first), /product gets a key of its own/i, "and why a key of its own");
  const d = await dashboard(w);
  listed();
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  const a = stepA(d);
  assert.deepEqual(picked(a), [PRODUCT], "with it: the product alone, nothing else");
  assert.ok(!textOf(a).includes(GL_PROJECT), "never the GitLab project");
  assert.match(textOf(a), /GitHub preselects “All repositories”, which would give Agent M write access to everything you own/, "and why not all");
  d.type("add-repo", GL_WEB);
  const gl = textOf(d.step("Step A"));
  assert.match(gl, /Settings → Access tokens of fau-ai-taskforce\/tools\/thesis-tool/, "the GitLab token: for this project");
  assert.match(gl, /personal access token[^.]*reaches every project you can reach/, "a personal one would reach every project");
});

// THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN — Agent M uses a fine-grained personal access token that the person creates on
// github.com and pastes into Agent M. Input: the add-product page without the instance's key (3b); a text that is no GitHub token, then
// the token, pasted and stored. Expected: the page links GitHub's page for new fine-grained tokens and gives a paste field for one in
// Step A — UC-001 step 3: back in the panel, the author pastes the token —; a text that is no GitHub token is refused and nothing
// stored; the token is stored as pasted, for the product (UC-001 step 3); no link and no request leads to a sign-in with GitHub.
test("THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN — created on GitHub's page, pasted, stored as pasted; no sign-in", async () => {
  const w = await servers({ product: await githubProduct() });
  const d = await dashboard(w, { token: null });
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  assert.ok(tokenLink(d.steps()), "GitHub's page for a new fine-grained token");
  assert.match(stepA(d), /<input type="password" id="key-token" placeholder="github_pat_…"/, "a field to paste it into, in Step A");
  d.tick("key-ack");
  const before = storage();
  d.el("key-token").value = "my GitHub password";
  await d.click("key-store");
  assert.match(d.el("key-check").textContent, /not a GitHub token/, "a text that is no token is refused");
  assert.deepEqual(storage(), before, "and nothing stored");
  d.el("key-token").value = TOKEN;
  await d.click("key-store");
  assert.equal(productKeys()[PRODUCT_WEB]?.token, TOKEN, "the token, as pasted, kept for the product");
  const signIn = /github\.com\/login|\/login\/oauth|\/login\/device|oauth/i;
  assert.deepEqual(hrefs(d.page.main()).filter((x) => signIn.test(x)), [], "no link to a sign-in");
  assert.deepEqual(w.log.filter((r) => signIn.test(r.url)), [], "no request for a sign-in");
});

// CONFIGURATION LIVES IN THE BROWSER — the repository tokens and the list of products, among the rest, are stored in the browser of the
// person using the site; Agent M has no other store for them. Input: one browser, without the instance's key, stores the product's own
// GitHub key in Step A (3b) and adds the GitHub product, then stores a GitLab project's token and adds it (3c). Expected: the
// product's GitHub key, kept for alice/thesis-tool, the project token and both addresses are in this browser's localStorage; no
// request carries a token in its address or body, so that none is written into a repository, and the instance gets no write; no
// cookie is set.
test("CONFIGURATION LIVES IN THE BROWSER — the tokens and the product list in localStorage, and nowhere else", async () => {
  const w = await servers({ product: await githubProduct(), gitlab: gitlabProject() });
  const d = await dashboard(w, { token: null });
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  d.tick("key-ack");
  d.el("key-token").value = TOKEN;
  await d.click("key-store");
  await d.click("add-go");
  await d.add(GL_WEB);
  const kept = storage();
  assert.equal(JSON.parse(kept["agent-m.github-product-tokens"] ?? "{}")[PRODUCT_WEB]?.token, TOKEN, "the product's GitHub key, kept for it");
  assert.equal(JSON.parse(kept["agent-m.gitlab-tokens"] ?? "{}")[GL_WEB]?.token, GL_TOKEN, "the project token");
  assert.deepEqual(JSON.parse(kept["agent-m.products"] ?? "null"), [PRODUCT_WEB, GL_WEB], "the product list");
  assert.ok(writes(w).length > 0, "the products were written");
  assert.deepEqual(w.log.filter((r) => [TOKEN, GL_TOKEN].some((t) => r.url.includes(t) || r.body.includes(t))), [], "no token in an address or a body");
  assert.deepEqual(w.instance.writes, [], "nothing in the instance");
  assert.equal(globalThis.document.cookie, undefined, "no cookie");
});

// THE SHARED PAGES ORIGIN IS DISCLOSED — before a token or key is stored, the page states that every GitHub Pages site under the same
// <owner>.github.io domain can read what Agent M stores in the browser. Input: the step that takes the product's own GitHub key, without
// the instance's key — a part of Step A, UC-001 step 3 and 3b —, and a GitLab project's Step B (3c). Expected: in each, the notice names
// https://akmaier.github.io and every other Pages site of akmaier, before the paste field; the field and Store and check stay disabled
// until “I have read this” is ticked; a Store before the tick stores nothing.
test("THE SHARED PAGES ORIGIN IS DISCLOSED — before a token is stored, the shared origin is named, and the tick comes first", async () => {
  const w = await servers({ product: await githubProduct(), gitlab: gitlabProject() });
  const d = await dashboard(w, { token: null });
  await d.open();
  for (const [address, field, store, ack] of [[PRODUCT_WEB, "key-token", "key-store", "key-ack"], [GL_WEB, "gl-token", "gl-store", "gl-ack"]]) {
    d.type("add-repo", address);
    const b = takes(d, field), notice = b.indexOf("github.io");
    assert.ok(notice > 0 && notice < b.indexOf(`id="${field}"`), `${address}: the notice stands before the paste field`);
    assert.match(textOf(b), /stored for the address https:\/\/akmaier\.github\.io — not only for this instance\. Every other GitHub Pages site of akmaier/);
    assert.equal(d.el(field).disabled, true, `${address}: the field waits for the tick`);
    assert.equal(d.el(store).disabled, true, `${address}: Store and check waits for the tick`);
    const before = storage();
    d.el(field).value = address === PRODUCT_WEB ? TOKEN : GL_TOKEN;
    d.el(store).fire("click", { isTrusted: true });
    await new Promise((r) => setTimeout(r, 0));
    assert.deepEqual(storage(), before, `${address}: nothing stored before the tick`);
    d.tick(ack);
    assert.equal(d.el(field).disabled, false, `${address}: ticked, the field opens`);
  }
});

// THE PAGE STATES WHAT IT SENDS WHERE — before Agent M acts, it names every destination it will contact and what it will send there.
// Input: the step that stores a token — the product's own GitHub key without the instance's key (3b), a GitLab project's token (3c) —,
// read before Store and check is pressed. Expected: it says that the token is kept in this browser and sent only to GitHub's API — or
// only to this project's API on its own server, never to GitHub or another server —, as a header; after Store and check, the token
// went exactly there — the GitHub key to GitHub's API, in requests for alice/thesis-tool, the product it is stored for (UC-001 step 3).
test("THE PAGE STATES WHAT IT SENDS WHERE — before a token is stored, the page says where it will be sent, and it goes there", async () => {
  const w = await servers({ product: await githubProduct(), gitlab: gitlabProject() });
  const d = await dashboard(w, { token: null });
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  const gh = explanationOf(takes(d, "key-token"));
  assert.match(gh, /saved in this browser only/, "GitHub: kept here");
  assert.match(gh, /sent only to GitHub's API, as a header/, "GitHub: where it goes");
  d.tick("key-ack");
  d.el("key-token").value = TOKEN;
  await d.click("key-store");
  const ghSent = w.log.filter((r) => r.authorization === `Bearer ${TOKEN}`);
  assert.ok(ghSent.length > 0 && ghSent.every((r) => r.origin === API), "GitHub: it went to GitHub's API");
  assert.ok(ghSent.every((r) => r.url === `${API}/repos/${PRODUCT}` || r.url.startsWith(`${API}/repos/${PRODUCT}/`)), "GitHub: for the product");

  d.type("add-repo", GL_WEB);
  const gl = explanationOf(d.step("Step B"));
  assert.match(gl, /saved in this browser only/, "GitLab: kept here");
  assert.match(gl, /sent only to this project's API on its own server, as a header: never to GitHub, another GitLab or the model endpoint/,
    "GitLab: where it goes");
  d.tick("gl-ack");
  d.el("gl-token").value = GL_TOKEN;
  await d.click("gl-store");
  const glSent = w.log.filter((r) => r.privateToken === GL_TOKEN);
  assert.ok(glSent.length > 0 && glSent.every((r) => r.url.startsWith(`${GL_ORIGIN}/api/v4/projects/${encodeURIComponent(GL_PROJECT)}`)),
    "GitLab: it went to its project's API");
});
