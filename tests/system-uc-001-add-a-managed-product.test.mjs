// System test of UC-001 "Add a managed product" (ITM-208): its main flow and each alternative flow, walked through the dashboard's
// add-product page as a person walks them, as the page calls the modules of ITM-205, ITM-206 and ITM-211 since the change between
// jobs #105. Written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of it — neither
// ITM-205, ITM-206, ITM-211 nor #105 —, from UC-001 as accepted; started on sprint/04 at 4e7b614, 2026-10-06. Changed by tester-opus
// (claude-opus-5-5), the Release tester, who implemented none of it, for UC-001 as drafted in 2deaa7f — Step A asks for a key of the
// product's own, the instance's key unchanged —, on fix/product-token-prefill at ea87df2, 2026-10-06: the main flow, 1a, 3a, 3b and 4a.
//
// Module: MOD-repository-hosts
// Guards: UC-001
// Level: system
//
// How the page is reached: the real dashboard runs in tests/app-harness.mjs, with its richDocument and press, as the release tests
// of sprints 01 and 02 run it. GitHub is the harness's fixture server — the instance's repository, and behind it the product's
// repository at the address UC-001 names, github.com/alice/thesis-tool —; a GitLab server is a fixture server of this file at the
// address UC-001 names, gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool, after the one of
// tests/release-sprint-01-dashboard-app.test.mjs. Every request is logged with the credentials it carries; none leaves the
// process. Every click is a person's click (isTrusted). The page reaches the product through MOD-repository-hosts — Step A's
// pages, Step C's reads and commit, their refusals —, whose name the header gives; Step B's check still reads through the page's
// own git host. Each case states, above it, its input, its precondition and its expected result, from the step or alternative
// flow of UC-001 it walks. Counter-proofs: the pull request of these tests.

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

// The GitHub token `t` went nowhere but to GitHub's API, as its authorisation header — never in an address or a body.
const tokenOnlyToGitHubApi = (w, t = TOKEN) => w.log.filter((r) => r.authorization?.includes(t) || r.url.includes(t) || r.body.includes(t))
  .every((r) => r.origin === API && r.authorization === `Bearer ${t}` && !r.url.includes(t) && !r.body.includes(t));
// UC-001 step 3: the product's own key, which GitHub generates on its prefilled page, pasted into the panel and stored for the product.
const NEW_KEY = "github_pat_NEWKEY208x0123456789abcdefghij";
// The date 90 days from today as YYYY-MM-DD, by the clock of the world or of this computer — UC-001 step 3: the author "confirms its
// expiry date", preset to "the 90 days of the prefilled link" (UC-014 step 8).
const in90Days = () => [Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()),
  Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())].map((t) => new Date(t + 90 * 864e5).toISOString().slice(0, 10));
// The keys this browser keeps for GitHub products, by the product's address — as it keeps the GitLab project tokens (3c).
const productKeys = () => JSON.parse(globalThis.localStorage.getItem("agent-m.github-product-tokens") ?? "{}");
// GitHub's page for a new fine-grained token, as a step links it: its query, or null.
const tokenPage = (html) => {
  const x = hrefs(html).find((u) => u.startsWith("https://github.com/settings/personal-access-tokens/new?"));
  return x ? Object.fromEntries(new URL(x).searchParams) : null;
};
// The repositories a step tells the person to pick on GitHub's page: those of its sentence ending in "— nothing else".
const picked = (html) => {
  const m = /pick ((?:“[^”]+”(?:, | and )?)+) — nothing else/.exec(textOf(html));
  return m ? [...m[1].matchAll(/“([^”]+)”/g)].map((x) => x[1]) : null;
};
// Every permission, as in UC-014 — ONE GITHUB TOKEN SERVES EVERY FEATURE, in GitHub's parameters.
const EVERY_PERMISSION = { contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", metadata: "read" };
// Step A as the person sees it now: what the page wrote into it since the steps were rendered, else the steps up to Step B.
const stepAOf = (d) => d.el("add-step-a").innerHTML || d.steps().slice(0, d.steps().indexOf("<h3>Step B"));
// Step A's paste field filled with the new key, and Store and check pressed (UC-001 step 3, after the notice of UC-014).
async function storeNewKey(d, key = NEW_KEY) {
  d.tick("key-ack");
  d.el("key-token").value = key;
  await d.click("key-store");
}

// ------------------------------------------------------------------------------------------------ the main flow

// UC-001 main flow, on GitHub, as UC-001 reads as drafted in 2deaa7f. Input: the address https://github.com/alice/thesis-tool.
// Precondition: the instance's token is stored in this browser (UC-014), and the browser already lists a GitHub product,
// alice/other-tool, and a GitLab project; the product repository exists, is public and holds only a README.md.
// Expected, step by step:
// 1. the product selector offers + Add product; choosing it opens the panel on the same page;
// 2. the pasted address is recognised as GitHub's, and GitHub's route is shown — Step A "A key for the product", not GitLab's
//    "Create a key for this project";
// 3. Step A shows a button "Open GitHub's token page (prefilled)": GitHub's page for a new token with every permission filled in as
//    in UC-014, 90 days, the product's owner, alice, as the token's owner, the name "Agent M · alice/thesis-tool" and the description
//    "Agent M for the product alice/thesis-tool: reviews, commits, issues, pull requests and runs of the work you start in it.";
//    underneath, Only select repositories and alice/thesis-tool alone — not the instance, not the GitHub product listed, not the
//    GitLab project —, then Generate token and copy it; then UC-014's notice, the paste field, its expiry date and Store and check,
//    which stores the pasted key for this product only, with the expiry date confirmed — preset to the 90 days of the link —, leaves
//    the instance's key as it is, and checks with the product's key that it reaches the product repository, nothing else; its
//    explanation says why the product gets a key of its own;
// 4. Step B shows the product's line without another click: ✓, for this public repository with the word that write access is
//    confirmed at the next step;
// 5. Add product, one click: one commit into the product's default branch holding the missing review layout — docs/use-cases/,
//    docs/architecture/, docs/approvals/, docs/spec-freigaben/, SPEC.md, CHANGELOG.md —, not the README.md that was there, made with
//    the product's key; the address in this browser's product list; nothing written into the instance; the commit shown as a link to
//    its page; an offer to switch to the product.
// Every step carries a folded "What is this?". Postcondition: the product holds the layout; this browser lists it and keeps the
// product's key for it; the instance's key is unchanged; the instance names no product; the product's key went only to GitHub's API,
// in requests for the product.
test("UC-001 main flow — a GitHub product is added: Step A opens GitHub's token page prefilled for the product, Store and check keeps the product's own key, Add product writes its layout", async () => {
  const product = await githubProduct();
  const other = { repo: "alice/other-tool", server: await repoServer({ repo: "alice/other-tool", files: { "README.md": "# Other tool\n" } }) };
  const w = await servers({ product, also: [other] });
  const d = await dashboard(w);
  const listed = [`https://github.com/${other.repo}`, GL_WEB];
  globalThis.localStorage.setItem("agent-m.products", JSON.stringify(listed));       // what this browser already lists
  const sel = d.el("product");
  assert.match(sel.innerHTML, /<option value="__add">\+ Add product/, "1. the selector offers + Add product");
  const search = globalThis.location.search;
  sel.value = "__add";
  sel.onchange();
  await d.open(globalThis.location.hash);
  assert.equal(globalThis.location.hash, "#add");
  assert.equal(globalThis.location.search, search, "1. the panel opens on the same page");
  assert.match(d.page.main(), /<h2>Add a product<\/h2>/);
  assert.ok(explained(d.page.main().slice(d.page.main().indexOf('id="add-repo"'))), "the address field explains itself");

  d.type("add-repo", PRODUCT_WEB);
  assert.match(d.steps(), /<h3>Step A · A key for the product<\/h3>/, "2. GitHub's route");
  assert.doesNotMatch(d.steps(), /Create a key for this project/);

  const a = stepAOf(d);
  assert.match(a, />Open GitHub's token page \(prefilled\)/, "3. the button");
  const page = tokenPage(a);
  assert.ok(page, "3. to GitHub's page for a new token");
  const { name, description, target_name: owner, expires_in: days, ...permissions } = page;
  assert.equal(name, "Agent M · alice/thesis-tool", "3. its name, built from the product repository's name");
  assert.equal(description, "Agent M for the product alice/thesis-tool: reviews, commits, issues, pull requests and runs of the work you start in it.",
    "3. its description, built from the product repository's name");
  assert.equal(owner, "alice", "3. the product's owner as the token's owner");
  assert.equal(days, "90", "3. 90 days");
  assert.deepEqual(permissions, EVERY_PERMISSION, "3. every permission, as in UC-014");
  assert.match(textOf(a), /choose “Only select repositories”/, "3.1 Only select repositories");
  assert.deepEqual(picked(a), [PRODUCT], "3.1 the product repository alone — not the instance, not the GitHub product listed");
  assert.ok(!textOf(a).includes(GL_PROJECT), "3.1 not the GitLab project");
  assert.match(textOf(a), /press “Generate token”/, "3.2 Generate token");
  assert.match(textOf(a), /Copy the token/, "3.2 and copy it");
  const notice = a.indexOf("github.io");
  assert.ok(notice > 0 && notice < a.indexOf('id="key-token"'), "UC-014's notice, before the paste field");
  assert.ok(a.indexOf('id="key-expires"') > a.indexOf('id="key-token"'), "its expiry date, to confirm");
  assert.ok(a.includes("Store and check"), "and Store and check");
  assert.match(explanationOf(a), /product gets a key of its own/i, "why the product gets a key of its own");

  const from = w.log.length;
  await storeNewKey(d);
  assert.equal(globalThis.localStorage.getItem("agent-m.github-token"), TOKEN, "3. the instance's key stays as it is");
  assert.deepEqual(Object.keys(productKeys()), [PRODUCT_WEB], "3. stored for this product only");
  assert.equal(productKeys()[PRODUCT_WEB].token, NEW_KEY, "3. the pasted key");
  assert.ok(in90Days().includes(productKeys()[PRODUCT_WEB].expires), `3. with its expiry date, preset to the 90 days of the link: ${productKeys()[PRODUCT_WEB].expires}`);
  const checked = textOf(d.el("key-check").innerHTML);
  assert.ok(checked.includes(`✓ ${PRODUCT} reachable`), "3. it reaches the product repository");
  assert.ok(![INSTANCE, other.repo].some((r) => checked.includes(r)), "3. nothing else is checked with it");
  assert.ok(w.log.slice(from).some((x) => x.url === `${API}/repos/${PRODUCT}` && x.authorization === `Bearer ${NEW_KEY}`), "3. read with the product's key");
  assert.equal(textOf(d.el("add-check").innerHTML), "✓ alice/thesis-tool reachable — public, so write access is confirmed only by the first write",
    "4. Step B, without another click");

  await d.click("add-go");
  assert.equal(product.writes.length, 1, "5. one commit");
  const written = Object.keys(product.writes[0].files);
  for (const f of LAYOUT_FOLDERS) assert.ok(written.some((p) => p.startsWith(f)), `5. the layout holds ${f}`);
  assert.ok(written.includes("SPEC.md") && written.includes("CHANGELOG.md"), "5. a SPEC.md skeleton and a CHANGELOG.md");
  assert.ok(!written.includes("README.md"), "5. what already exists is skipped");
  const moved = w.log.find((r) => r.method === "PATCH" && r.url === `${API}/repos/${PRODUCT}/git/refs/heads/main`);
  assert.ok(moved, "5. on the default branch");
  assert.ok(writes(w).every((r) => r.authorization === `Bearer ${NEW_KEY}`), "5. made with the product's key");
  assert.ok(!w.log.slice(from).some((x) => x.origin === GL_ORIGIN), "3. the GitLab project is not checked with the GitHub key");
  assert.deepEqual(productList(), [...listed, PRODUCT_WEB], "5. the address in this browser's list");
  assert.deepEqual(w.instance.writes, [], "5. nothing written into the instance");
  assert.deepEqual(writes(w).filter((r) => !r.url.startsWith(`${API}/repos/${PRODUCT}/`)), [], "no write anywhere else");
  const result = d.el("add-result").innerHTML;
  assert.ok(hrefs(result).includes(`${PRODUCT_WEB}/commit/${JSON.parse(moved.body).sha}`), "5. the commit, as a link to its page");
  assert.ok(hrefs(result).some((x) => new URLSearchParams(x.replace(/^[^?]*\?/, "")).get("repo") === PRODUCT),
    "5. an offer to switch to the new product, on this dashboard");
  assert.match(d.el("product").innerHTML, /<option value="https:\/\/github\.com\/alice\/thesis-tool"/, "the selector lists it");
  for (const s of d.steps().split('<section class="step">').slice(1)) assert.ok(explained(s), `${textOf(s).slice(0, 40)} explains itself`);
  assert.ok(tokenOnlyToGitHubApi(w, NEW_KEY), "the product's key went only to GitHub's API");
  assert.ok(w.log.filter((r) => r.authorization === `Bearer ${NEW_KEY}`).every((r) => r.url.startsWith(`${API}/repos/${PRODUCT}/`) || r.url === `${API}/repos/${PRODUCT}`),
    "in requests for the product");
});

// ------------------------------------------------------------------------------------------------ the alternative flows

// UC-001 1a — another browser. Input: a browser with neither a token nor a product list; the product already has its whole
// layout. Expected: the product list is empty — the selector offers the instance and + Add product, nothing else; the product is
// added again with + Add product, whose steps are those of the main flow (3b: its key does not depend on the instance's) — first
// Step A, the product's own key —, then Add product: nothing is committed, only the address is listed (5b).
test("UC-001 1a — another browser starts with an empty list; a product with its layout is added again without a commit", async () => {
  const product = await githubProduct({ files: COMPLETE_LAYOUT });
  const w = await servers({ product });
  const d = await dashboard(w, { token: null });
  const options = [...d.el("product").innerHTML.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(options, [`https://github.com/${INSTANCE}`, "__add"], "the instance and + Add product, nothing else");
  assert.deepEqual(productList(), []);
  await d.open(`#add/${encodeURIComponent(PRODUCT_WEB)}`);
  assert.match(d.steps(), /<h3>Step A · A key for the product<\/h3>/, "no key here: the product's own key first, as in the main flow (3b)");
  d.tick("key-ack");
  d.el("key-token").value = TOKEN;
  await d.click("key-store");
  await d.click("add-go");
  assert.deepEqual(product.writes, [], "5b: nothing is committed");
  assert.deepEqual(productList(), [PRODUCT_WEB], "only the address is listed");
});

// UC-001 2a — the product repository does not exist yet. Input: the address of a repository GitHub answers 404 for. Expected:
// Check says so and links GitHub's page for a new repository, with a folded explanation of the choices there; so does Add product,
// which writes nothing and lists nothing. The author creates the repository and continues at step 2: Check reaches it, and Add
// product writes its layout.
test("UC-001 2a — a repository that does not exist is named, GitHub's page for a new one linked; once created, it is added", async () => {
  const product = await githubProduct({ missing: true });
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  await d.click("add-check-btn");
  const check = d.el("add-check").innerHTML;
  assert.match(textOf(check), /^✗ alice\/thesis-tool/, "the repository is named");
  assert.match(textOf(check), /GitHub has no repository alice\/thesis-tool that your key can see/, "Agent M says so");
  assert.ok(hrefs(check).includes("https://github.com/new"), "GitHub's page for a new repository");
  assert.ok(explained(check), "with a folded explanation of the choices there");
  await d.click("add-go");
  assert.ok(hrefs(d.el("add-result").innerHTML).includes("https://github.com/new"), "Add product says so too");
  assert.deepEqual(product.writes, []);
  assert.deepEqual(productList(), []);

  product.state.missing = false;                                        // the author created it on GitHub
  d.type("add-repo", PRODUCT_WEB);
  await d.click("add-check-btn");
  assert.match(textOf(d.el("add-check").innerHTML), /^✓ alice\/thesis-tool reachable/);
  await d.click("add-go");
  assert.equal(product.writes.length, 1, "continued at step 2: the layout is written");
  assert.deepEqual(productList(), [PRODUCT_WEB]);
});

// UC-001 2a, with step 4 as UC-001 reads since 5260a64 — Step B's answer "after Store and check without another click". Input: the
// address of a repository GitHub answers 404 for; the author follows Step A, pastes a new key and presses Store and check. Expected:
// Step B, without another click, names the repository, says that it is not there, and links GitHub's page for a new repository with
// a folded explanation of the choices there — as 2a says, and as Check answers.
test("UC-001 2a after Store and check — Step B says that the repository is not there and links GitHub's page for a new one, without another click", async () => {
  const product = await githubProduct({ missing: true });
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  await storeNewKey(d);
  const b = d.el("add-check").innerHTML;
  assert.match(textOf(b), /^✗ alice\/thesis-tool/, "the repository is named");
  assert.match(textOf(b), /has no repository alice\/thesis-tool|does not exist/i, "Agent M says so");
  assert.ok(hrefs(b).includes("https://github.com/new"), "and links GitHub's page for a new repository");
  assert.ok(explained(b), "with a folded explanation of the choices there");
});

// UC-001 3a — a key stored in this browser already reaches the product: its own, or the instance's because the author selected the
// product in UC-014. Input: a private product, read by the instance's key; and, in another browser, by the product's own key, stored
// there in Step A before — the author left the panel then —, beside the instance's. Expected, for each: after Check, Step A is shown
// as done, with nothing to do on GitHub — no button to GitHub's token page —; adding the product took + Add product, Check and Add
// product — the layout is written and the product listed, with no other click —; and Agent M read and wrote the product with that
// key: the instance's in the first browser, the product's own in the second.
test("UC-001 3a — a key that already reaches the product, the instance's or its own: Step A done after Check; + Add product, Check, Add product", async () => {
  for (const own of [null, NEW_KEY]) {
    const key = own ?? TOKEN, whose = own ? "its own key" : "the instance's key";
    const product = await githubProduct({ visibility: "private" });
    const w = await servers({ product });
    const d = await dashboard(w);
    if (own) {                                                          // its own key, stored in Step A before (UC-001 step 3)
      await d.open();
      d.type("add-repo", PRODUCT_WEB);
      await storeNewKey(d, own);
      await d.page.go("#uc");
    }
    const sel = d.el("product");
    sel.value = "__add";
    sel.onchange();                                                     // + Add product
    await d.open(globalThis.location.hash);
    d.type("add-repo", PRODUCT_WEB);
    const from = w.log.length;
    await d.click("add-check-btn");                                     // Check
    assert.match(d.stepA(), /Step A · A key for the product — done/, `${whose}: Step A done`);
    assert.doesNotMatch(d.stepA(), /Open GitHub's token page \(prefilled\)/, `${whose}: nothing to do on GitHub`);
    assert.ok(w.log.slice(from).some((r) => r.url === `${API}/repos/${PRODUCT}` && r.authorization === `Bearer ${key}`), `${whose}: read with it`);
    await d.click("add-go");                                            // Add product
    assert.equal(product.writes.length, 1, whose);
    assert.ok(writes(w).length > 0 && writes(w).every((r) => r.authorization === `Bearer ${key}`), `${whose}: written with it`);
    assert.deepEqual(productList(), [PRODUCT_WEB], whose);
  }
});

// UC-001 3b — no key is stored in this browser for the instance. Expected: the product's steps are the same as with the instance's
// key — its key does not depend on the instance's: Step A "A key for the product", with the same button to GitHub's token page
// prefilled for the product and alice/thesis-tool alone to select, not the instance —; Store and check stores the pasted key for this
// product — no key for the instance appears — and checks the product repository with it, not the instance, and Step B shows the
// product's line without another click; Add product then writes the layout with that key, and the key goes only to GitHub's API.
test("UC-001 3b — without the instance's key, the product's steps are the same: its own key, the check and Add product", async () => {
  const product = await githubProduct();
  const w = await servers({ product });
  const withKey = await dashboard(w);                                   // Step A in a browser with the instance's key, to compare
  await withKey.open();
  withKey.type("add-repo", PRODUCT_WEB);
  const same = stepAOf(withKey);
  const d = await dashboard(w, { token: null });
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  const a = stepAOf(d);
  assert.match(a, /<h3>Step A · A key for the product<\/h3>/, "Step A, the product's own key");
  assert.ok(tokenPage(a), "the prefilled token page");
  assert.deepEqual(tokenPage(a), tokenPage(same), "prefilled as with the instance's key");
  assert.match(textOf(a), /Only select repositories/);
  assert.deepEqual(picked(a), [PRODUCT], "the product alone, not the instance");
  assert.deepEqual(picked(a), picked(same), "as with the instance's key");
  d.tick("key-ack");
  d.el("key-token").value = NEW_KEY;
  await d.click("key-store");
  assert.equal(globalThis.localStorage.getItem("agent-m.github-token"), null, "no key for the instance");
  assert.equal(productKeys()[PRODUCT_WEB]?.token, NEW_KEY, "the key, kept for this product");
  const checked = textOf(d.el("key-check").innerHTML);
  assert.match(checked, /✓ alice\/thesis-tool reachable/, "the product is checked with it");
  assert.doesNotMatch(checked, /akmaier\/agent-m/, "the instance is not");
  assert.match(textOf(d.el("add-check").innerHTML), /^✓ alice\/thesis-tool reachable/, "Step B, without another click");
  await d.click("add-go");
  assert.equal(product.writes.length, 1);
  assert.ok(writes(w).length > 0 && writes(w).every((r) => r.authorization === `Bearer ${NEW_KEY}`), "written with the product's key");
  assert.deepEqual(productList(), [PRODUCT_WEB]);
  assert.ok(tokenOnlyToGitHubApi(w, NEW_KEY));
});

// UC-001 3c — the product is on a GitLab server. Input: the address https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool.
// Expected: Step A is "Create a key for this project": a button to the project's Settings → Access tokens page on that server and,
// underneath, name Agent M, role Maintainer, scope api, an expiry date, then Create project access token and copy it; Step B is the
// notice, the paste field and Store and check; the token is stored for this project only and sent only to that server; Step C, as
// above, writes the layout into the project's default branch with it, links the commit and offers to switch to the product; the
// instance's GitHub token is not involved there.
test("UC-001 3c — a GitLab product gets its own project token, stored for it, sent only to its server, and its layout", async () => {
  const gitlab = gitlabProject();
  const w = await servers({ gitlab });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", GL_WEB);
  const a = d.step("Step A");
  assert.match(a, /<h3>Step A · Create a key for this project<\/h3>/, "GitLab's route");
  assert.ok(hrefs(a).includes(`${GL_WEB}/-/settings/access_tokens`), "a button to the project's Access tokens page");
  const says = textOf(a);
  for (const x of [/Token name: Agent M/, /Maintainer/, /\bapi\b/, /Expiration date/, /Create project access token/, /copy the token/]) assert.match(says, x);
  const b = d.step("Step B");
  assert.match(b, /github\.io/, "Step B: the notice");
  assert.match(b, /id="gl-token"/, "the paste field");
  assert.match(b, /Store and check/);
  d.tick("gl-ack");
  d.el("gl-token").value = GL_TOKEN;
  await d.click("gl-store");
  assert.match(textOf(d.el("gl-check-out").innerHTML), /^✓ /, "checked with it");
  const kept = JSON.parse(globalThis.localStorage.getItem("agent-m.gitlab-tokens") ?? "{}");
  assert.deepEqual(Object.keys(kept), [GL_WEB], "stored for this project only");
  assert.equal(kept[GL_WEB]?.token, GL_TOKEN);
  await d.click("add-go");
  assert.equal(gitlab.writes.length, 1, "the layout is written into the GitLab project");
  assert.equal(gitlab.writes[0].branch, "main", "on its default branch");
  assert.ok(LAYOUT_FOLDERS.every((f) => Object.keys(gitlab.writes[0].files).some((p) => p.startsWith(f))));
  assert.deepEqual(productList(), [GL_WEB]);
  const result = hrefs(d.el("add-result").innerHTML);
  assert.ok(result.includes(`${GL_WEB}/-/commit/${gitlab.head}`), "Step C as above: the commit, as a link to its page");
  assert.ok(result.some((x) => new URLSearchParams(x.replace(/^[^?]*\?/, "")).get("product") === GL_WEB), "and the offer to switch to it");
  assert.deepEqual(w.instance.writes, []);
  assert.ok(gitlab.requests.some((r) => r.method === "POST" && r.privateToken === GL_TOKEN), "written with the project token");
  assert.ok(w.log.filter((r) => r.privateToken).every((r) => r.url.startsWith(`${GL_ORIGIN}/api/v4/projects/${encodeURIComponent(GL_PROJECT)}`)),
    "the project token only to its project on its server");
  assert.ok(!w.log.some((r) => r.origin !== GL_ORIGIN && (r.privateToken || r.url.includes(GL_TOKEN) || r.body.includes(GL_TOKEN))));
  assert.ok(gitlab.requests.every((r) => r.authorization === null), "the GitHub token is not involved there");
});

// UC-001 3d — the GitLab server offers no project access tokens, or the author is not Maintainer. Expected: the panel says which of
// the two it is on that server — on gitlab.com project access tokens need a paid tier; a self-managed server offers them, so there
// it is the role of Maintainer that is needed —, explains that a personal token would reach every project of the author on that
// server, and leaves the decision to the author. A token that acts below Maintainer is named so at the check.
test("UC-001 3d — no project access tokens, or not Maintainer: the panel says which, and what a personal token would reach", async () => {
  const gitlab = gitlabProject({ accessLevel: 30 });
  const w = await servers({ gitlab });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", GL_WEB);
  const own = textOf(d.step("Step A"));
  assert.match(own, /The page offers no project access tokens, or you are not Maintainer/);
  assert.match(own, /self-managed GitLab: it offers project access tokens/, "on this server: tokens are offered");
  assert.match(own, /Maintainer or Owner role/, "so it is the role");
  assert.match(own, /personal access token[^.]*reaches every project you can reach on gitlab\.rrze\.fau\.de/, "what a personal token would reach");
  assert.match(own, /You decide/, "the author decides");
  d.type("add-repo", "https://gitlab.com/fau-ai-taskforce/tools/thesis-tool");
  assert.match(textOf(d.step("Step A")), /On gitlab\.com, project access tokens need a Premium or Ultimate subscription/, "on gitlab.com: the tier");
  d.type("add-repo", GL_WEB);
  d.tick("gl-ack");
  d.el("gl-token").value = GL_TOKEN;
  await d.click("gl-store");
  assert.match(textOf(d.el("gl-check-out").innerHTML), /the token acts as Developer — role Developer cannot write to a protected default branch/,
    "a token below Maintainer is named at the check");
});

// UC-001 4a — the check fails. Input: a private product that GitHub answers 404 for — it does not exist, or the key does not reach
// it; the author follows Step A, pastes the product's key and presses Store and check, then presses Check once more. Expected: each
// time Agent M names the repository it cannot reach — in the check of Store and check, in Step B's line without another click, and at
// Check —, and Step A, a key for the product, is shown again: its button to GitHub's prefilled token page, alice/thesis-tool alone to
// select, and its paste field; nothing is written.
test("UC-001 4a — a failed check names the repository and shows Step A again", async () => {
  const product = await githubProduct({ missing: true });
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  await storeNewKey(d);
  assert.match(textOf(d.el("key-check").innerHTML), /✗ alice\/thesis-tool/, "Store and check names the repository it cannot reach");
  assert.match(textOf(d.el("add-check").innerHTML), /^✗ alice\/thesis-tool/, "so does Step B, without another click");
  await d.click("add-check-btn");
  assert.match(textOf(d.el("add-check").innerHTML), /^✗ alice\/thesis-tool/, "and Check");
  const a = stepAOf(d);
  assert.match(a, /<h3>Step A · A key for the product<\/h3>/, "Step A again");
  assert.match(a, />Open GitHub's token page \(prefilled\)/, "with its button");
  assert.deepEqual(picked(a), [PRODUCT], "alice/thesis-tool alone to select");
  assert.match(a, /id="key-token"/, "and its paste field");
  assert.deepEqual([...product.writes, ...w.instance.writes], []);
});

// UC-001 5a — the write is refused although the read succeeded: a public repository not yet added to the token. Input: the author
// pastes a new key that reads alice/thesis-tool — any key reads a public repository — but may not write to it, presses Store and
// check, then Add product. Expected: Step B shows ✓ without another click, saying that write access is confirmed only by the first
// write; Add product then says that the key cannot write to alice/thesis-tool and sends the author to Step A, which is on the panel
// with its button to GitHub's prefilled token page and alice/thesis-tool among the repositories to select; nothing was written and
// nothing listed, and Add product can be clicked again.
test("UC-001 5a — a write refused after a successful read says so and shows Step A again; nothing is written", async () => {
  const product = await githubProduct({ writable: false });
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  await storeNewKey(d);
  assert.equal(textOf(d.el("add-check").innerHTML), "✓ alice/thesis-tool reachable — public, so write access is confirmed only by the first write",
    "Step B, without another click");
  await d.click("add-go");
  const said = d.result();
  assert.match(said, /cannot write to alice\/thesis-tool/, "Agent M says so");
  assert.match(said, /Do Step A/, "and sends the author to Step A");
  const a = stepAOf(d);
  assert.match(a, />Open GitHub's token page \(prefilled\)/, "Step A shown, with its button");
  assert.ok(picked(a)?.includes(PRODUCT), "and alice/thesis-tool among the repositories to select");
  assert.deepEqual(product.writes, [], "nothing was written");
  assert.deepEqual(productList(), [], "nothing listed");
  assert.equal(d.el("add-go").disabled, false, "the author can click again after Step A");
});

// UC-001 5b — the product already has the complete layout. Expected: nothing is committed; only the address is added to the list in
// this browser, and the page says that nothing was missing.
test("UC-001 5b — a product with the complete layout gets no commit, only its place in the list", async () => {
  const product = await githubProduct({ files: COMPLETE_LAYOUT });
  const w = await servers({ product });
  const d = await dashboard(w);
  await d.open();
  d.type("add-repo", PRODUCT_WEB);
  await d.click("add-check-btn");
  await d.click("add-go");
  assert.deepEqual(product.writes, [], "nothing is committed");
  assert.deepEqual(writes(w), [], "no write request at all");
  assert.deepEqual(productList(), [PRODUCT_WEB], "only the address is added");
  assert.match(d.result(), /nothing was missing/);
});
