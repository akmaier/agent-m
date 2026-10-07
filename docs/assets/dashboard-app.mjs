// Dashboard — the browser runtime's composition root and router. SPEC §10; ARC-003 (shells).
//
// Reads one pinned commit of the product — on GitHub (two API calls, then immutable raw files) or on a
// GitLab server (its REST API v4, at the same pinned commit) — through the reads the git host provides (readSnapshot,
// readFile, repositoryInfo; dashboard/reads.mjs for a blob and the last accepted text), and renders use cases and SPEC change
// proposals. A page load reads only the commit and its tree; each view then reads the files it shows, each by its blob
// SHA and kept in this browser by that SHA, so that a file is read again only when it changed. With a stored token, a
// person's click commits an edit or an acceptance: the button's trusted click becomes the authority of the git host's one
// write path (dashboard/writes.mjs clickAuthority; ARC-003 decision 3); an accepted SPEC change is written in
// the same commit as its approval record. Without a token, GitHub's own pages are opened, prefilled; a GitLab product
// without its project token is read-only and links to the step that stores it. Every read goes through the git host (GET
// only), and each token only to the API of the server that issued it.
//
// Module: MOD-dashboard-app
//
// The views are files of their own, docs/assets/dashboard/<view>-view.mjs, and the settings page's sections
// docs/assets/dashboard/settings/<section>.mjs — each loaded by its name from one table (DASHBOARD, src/site/views.mjs, which
// the main page reads too). The menu above the views is the site's one menu, in the order of the process (src/site/menu.mjs).
// Which of the table's files are built is read from one data file beside them, docs/assets/dashboard/built.json, so that a page
// load asks for no file that is not there (one 404 each on GitHub Pages); a change that adds a view adds its file and its line
// there. A view module exports `routes`: { <route>: (app, …parts of the address) }, and may export `stylesheet`, a
// stylesheet of its own beside style.css; a section module exports `renderSection(app, box)`. Both get `app`, this page's
// context: what is read, what is kept, and the helpers every view uses.
// Nothing here runs on import outside a page (no `document`), so that tests import the shell's own texts.

import { marked } from "./vendor/marked.esm.js";
import DOMPurify from "./vendor/purify.es.mjs";
import builtFiles from "./dashboard/built.json" with { type: "json" };
import { fileTexts } from "./settings-store.mjs";
import { productStore } from "./product-store-adapter.mjs";
import {
  REPO_RE, parseProductAddress, isGitLab, readSnapshot, readFile, repositoryInfo, tokenRefusal, usedUpLimit,
} from "./git-host.mjs";
import {
  parseRecord, createReviewSession, readByBlob, recordIndex, statusByNames, recordsForId, lineDiff, architecturePrerequisites,
} from "./review-core.mjs";
import { tokenBannerHtml, renderBrowserSettings, loadProductSettings } from "./dashboard/settings-view.mjs";
import { DASHBOARD, builtViews } from "../../src/site/views.mjs";
import { menuHtml, entryOf } from "../../src/site/menu.mjs";
import { UPSTREAM, instanceOf } from "../../src/site/instance-repository.mjs";
// The checks of what waits for acceptance, started on the review pages (UC-047; sprint 07's change between jobs: the
// dashboard reaches MOD-notifications, as ITM-236's Outcome names it) — through each module's own interface.
import { openStore } from "../../src/browser-store/index.mjs";
import { parseAddress, connect } from "../../src/repository-hosts/index.mjs";
import { watchForAcceptance } from "../../src/notifications/index.mjs";
import { view as settingsPages } from "../../src/settings-pages/index.mjs";

export { DASHBOARD, UPSTREAM };


const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// The table's files that are built (dashboard/built.json). Whether a view or section is there is read from this list, never by
// asking the server for its file: each file that is not there would cost one 404 per page load.
const built = new Set(builtFiles);
// A view's file, loaded once per page. A file the list names that is not there after all: a browser's import of it fails with a
// TypeError, node's with ERR_MODULE_NOT_FOUND. A file that is there but fails otherwise is shown, so that opening it names the
// error.
const modules = new Map();
function loadFile(file) {
  if (!modules.has(file)) modules.set(file, import(new URL(`dashboard/${file}`, import.meta.url).href));
  return modules.get(file);
}
const notThere = (e) => e?.code === "ERR_MODULE_NOT_FOUND" || e instanceof TypeError;
async function present(file) {
  return built.has(file);
}

// A view may bring a stylesheet of its own beside style.css: its module exports `stylesheet`, a file name in
// docs/assets/dashboard/, which is linked into the page once, when the view is first shown.
const linked = new Set();
function linkStylesheet(file) {
  if (!file || linked.has(file)) return;
  linked.add(file);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(`dashboard/${file}`, import.meta.url).href;
  document.head.append(link);
}

// ---------------------------------------------------------------- texts and HTML every view uses

// EVERY STEP EXPLAINS ITSELF: the only way to render a step, and it refuses one without explanation.
export function stepHtml({ title, body, explain }) {
  if (!explain || !String(explain).trim()) throw new Error(`step "${title}" has no \"explain\" text (EVERY STEP EXPLAINS ITSELF)`);
  return `<section class="step"><h3>${h(title)}</h3>${body}` +
    `<details class="explain"><summary>What is this?</summary><div>${explain}</div></details></section>`;
}

// The one difference every view shows (review-core.mjs lineDiff), as HTML.
export function diffHtml(a, b) {
  const d = lineDiff(a, b);
  if (!d.some(([k]) => k !== " ")) return `<p class="muted">No difference.</p>`;
  return `<pre class="diff">${d.map(([k, l]) => `<span class="d${k === "+" ? "add" : k === "-" ? "del" : "ctx"}">${h(k)} ${h(l)}</span>`).join("\n")}</pre>`;
}

// A write refused with 403. What GitLab answers 403 for here: a push to a protected branch by a role it does not allow — the
// default protection lets Maintainers push ("Fully protected - Default value. Developers cannot push new commits, but
// maintainers can." — doc/user/project/repository/branches/default.md), but a project may allow no one —, and a token without
// the scope the request needs (Gitlab::Auth::InsufficientScopeError → Bearer::Forbidden, lib/api/api_guard.rb). An expired or
// revoked token is answered with 401 instead, and named by tokenRefusal. MOD-repository-hosts, which carries no status, names
// this refusal PermissionMissing.
export function gitlabWriteRefusal(e, product) {
  if (e?.status !== 403 && e?.name !== "PermissionMissing") return null;
  return `GitLab refused the write (403). With a project token of role Maintainer and scope api this means that the branch is ` +
    `protected even against Maintainers on ${product.address} — Settings → Repository → Protected branches → “Allowed to push and merge” — or ` +
    "that the token lacks scope api or was created with a lower role. Check the setting, and the token's role and scopes on the " +
    "project's Access tokens page.";
}

// A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN: which limit — the account's, or the network's for requests without a
// token — and when it resets, where the server tells the page (MOD-git-host usedUpLimit); null for any other refusal. The
// account's text names no token: every token of the account counts against the same limit, so none of them is at fault.
// product: the product the request went to — a GitLab one by its server; null or a GitHub product for GitHub.
export function rateLimitText(e, product = null, now = new Date()) {
  const gl = isGitLab(product) ? product : null;
  const l = usedUpLimit(e, gl);
  if (!l) return null;
  const server = gl ? gl.host : "GitHub";
  const which = l.limit === "account"
    ? (gl ? `${server}'s request limit for the account these requests are made with is used up.`
      : "GitHub's hourly request limit for your account is used up — it counts every request made in your account's name, " +
        "from this page and from any other program.")
    : `${server}'s request limit for this network, for requests made without a token, is used up.`;
  let when;
  if (l.resetsAt) {
    const minutes = Math.ceil((l.resetsAt.getTime() - now.getTime()) / 60000);
    const time = l.resetsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    when = minutes > 0 ? ` It resets at ${time} (in ${minutes} minute${minutes === 1 ? "" : "s"}); reload then.`
      : ` It reset at ${time}; reload.`;
  } else when = ` ${server} does not tell this page when it resets — try again in a few minutes.`;
  const after = l.limit === "account" ? " Nothing in Settings needs to change."
    : gl ? "" : " A GitHub token in Settings gives this page your account's own, higher limit.";
  return which + when + after;
}

// UC-008 4a: a write GitHub refused because the token cannot write to the repository — 403 or 404 —, and not because a rate
// limit is used up (A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN) or the token itself was refused (401, tokenRefusal).
// Never a GitLab product's: there is no GitHub page to fall back to (A GITLAB PRODUCT IS WRITTEN WITH A TOKEN).
export function writeAccessRefused(e, product) {
  if (!e || isGitLab(product) || usedUpLimit(e)) return false;
  return e.status ? e.status === 403 || e.status === 404 : /403|404/.test(e.message || "");
}

// Why a write was refused, in the product's terms — a used-up limit first, then GitLab's 403, then GitHub's 403 or 404 as the
// token's missing permission; null when none of these applies (the caller then shows errorText). githubPage: GitHub's
// new-file page prefilled with the approval record, which the caller shows beside the text as a link (UC-008 4a); without it
// the GitHub path is named only.
export function writeRefusalText(e, product, now = new Date(), { githubPage = null } = {}) {
  const limit = rateLimitText(e, product, now);
  if (limit) return limit;
  if (isGitLab(product)) return gitlabWriteRefusal(e, product);
  if (!writeAccessRefused(e, product)) return null;
  return `Your token cannot write to ${product.repo} (${e.message}). ` + (githubPage
    ? "Extend it in Settings, or commit the record on GitHub's page instead: without write access GitHub makes your commit a " +
      "pull request, and the acceptance counts once a maintainer merges it."
    : "Extend it in Settings, or remove it to use GitHub's page instead.");
}

// The page shown when the product's commit cannot be read: the server's answer, and what it means here. A used-up rate limit
// is named instead (A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN); a refused token is named with its renewal (AN
// EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED). hasToken: whether a token for this product is stored; own: the GitHub product
// whose own token was used, so that a refusal names it (A GITHUB PRODUCT USES A TOKEN OF ITS OWN).
export function loadErrorHtml({ error: e, product, ref, hasToken, own = null, now = new Date() }) {
  const gl = isGitLab(product), name = gl ? product.address : product.repo;
  const limit = rateLimitText(e, product, now);
  if (limit) return `<p class="warn">Could not read ${h(name)} @ ${h(ref)}: ${h(limit)}</p>`;
  const refused = tokenRefusal(e, gl ? product : own);
  const msg = e?.message || "";
  const limited = !gl && !hasToken && /403|429/.test(msg), forbidden = !gl && hasToken && /403/.test(msg), missing = !gl && /404/.test(msg);
  return `<p class="warn">Could not read ${h(name)} @ ${h(ref)}: ${h(msg)}</p>
      ${gl && e instanceof TypeError ? `<p class="muted">${h(product.host)} could not be reached from this page — it must accept requests
        from this address, and your network must reach it.</p>` : ""}
      ${gl && e?.status === 404 && !hasToken ? `<p class="muted">A private GitLab project is read only with its project token —
        <a href="${h(`#add/${encodeURIComponent(product.address)}`)}">store it</a>.</p>` : ""}
      ${gl && e?.status === 404 && hasToken ? `<p class="muted">The stored project token does not reach this project — check the address,
        or <a href="${h(`#add/${encodeURIComponent(product.address)}`)}">store another token</a>.</p>` : ""}
      ${limited ? `<p class="muted">Without a token GitHub allows 60 API calls per hour and network; this page uses two per load. A token in <a href="#settings">Settings</a> raises that.</p>` : ""}
      ${forbidden ? `<p class="muted">GitHub refused reading ${h(name)} with the stored token: it lacks a permission for this repository. Extend it on github.com, or check the name.</p>` : ""}
      ${missing && !hasToken ? `<p class="muted">A private repository cannot be read without a token — add one in <a href="#settings">Settings</a>.</p>` : ""}
      ${missing && hasToken ? `<p class="muted">The stored token does not reach this repository. Extend it on github.com or check the name.</p>` : ""}
      ${refused ? `<p>${h(refused.text)} <a class="btn small" href="${h(refused.renewUrl)}" target="_blank" rel="noopener">Renew ↗</a></p>
        <p class="muted small">${h(refused.renew)} <a href="#settings">Settings</a></p>` : ""}`;
}

// ---------------------------------------------------------------- instance, product, token

// AN INSTANCE IS A FORK OF AGENT M: the instance is the repository of the Pages address this page is served from
// (<owner>.github.io/<name>/), else Agent M itself (src/site/instance-repository.mjs). The product is chosen with ?repo=owner/name (GitHub) or ?product=<address>
// (GitHub or GitLab). A GitLab product adds `product` (parseProductAddress) and `refGiven` (false: its default branch is read
// from GitLab). Moved here from docs/assets/review-core.mjs (ITM-130): it reads the page's own address.
export function deriveTarget({ hostname, pathname, search }) {
  const instance = instanceOf({ hostname, pathname });
  const q = new URLSearchParams(search || "");
  const refOk = q.get("ref") && /^[A-Za-z0-9._\/-]{1,200}$/.test(q.get("ref")) && !q.get("ref").includes("..");
  const ref = refOk ? q.get("ref") : "main";
  const chosen = q.get("product") ? parseProductAddress(q.get("product")) : null;
  if (chosen && !chosen.error && chosen.kind === "gitlab") return { instance, repo: chosen.repo, ref, product: chosen, refGiven: Boolean(refOk) };
  const wanted = chosen && !chosen.error ? chosen.repo : q.get("repo");
  const repo = wanted && REPO_RE.test(wanted) && !wanted.includes("..") ? wanted : instance;
  return { instance, repo, ref };
}

// The instance is the fork this page is served from; the product is chosen with ?repo= or ?product= (SPEC §10). Set by start().
let T, GITLAB, SERVER, store, kept, REPO_KEY;
// The GitHub token (the instance's key, UC-014).
const ghToken = () => store.getToken();
// The token that writes to the product shown (settings-store tokenFor): a GitLab product's own project token (A GITLAB PRODUCT
// USES A PROJECT ACCESS TOKEN), never the GitHub token; a GitHub product's own token, or the instance's while it has none (A
// GITHUB PRODUCT USES A TOKEN OF ITS OWN).
const token = () => store.tokenFor(T.product);
// The product whose own token a request to `p` carries — a GitLab product, or a GitHub product with a token of its own —, so that
// a refusal names that token; null where the instance's token was used.
const ownTokenOf = (p) => (isGitLab(p) || (p?.address && !p.error && store.getGitHubProductToken(p.address)) ? p : null);
// The pinned commit and its tree (every file with its blob SHA). Everything else is read by the view that shows it (`once`).
const state = { commit: null, tree: [], byPath: new Map(), records: null, archCtx: { spec: "", useCases: [] }, products: [] };
// What this page has shown the reviewer and what they ticked (SEVERAL FILES ARE ACCEPTED IN ONE CLICK).
// Kept in memory only: a reload starts without ticks.
const session = createReviewSession();
let flash = null; // the outcome of the last acceptance, shown once above the next view

// ---------------------------------------------------------------- loading
//
// A page load reads the commit the branch points at and that commit's tree — two requests. The tree names every file with its
// blob SHA. Each view then reads what it shows, once per commit (`once`): a file by its blob SHA, from the texts this browser
// kept (readByBlob checks each against its SHA) or else from the server. The status of a reviewed file comes from the names of
// the approval records in the tree (statusByNames); a record is read where its content decides.

let memo = new Map(); // what this page has read or derived at state.commit
function once(key, f) {
  if (!memo.has(key)) memo.set(key, f().catch((e) => { memo.delete(key); throw e; }));
  return memo.get(key);
}

async function loadSnapshot() {
  const before = state.commit;
  // GITLAB PRODUCTS ARE SUPPORTED: its default branch unless ?ref= names one, resolved to one commit.
  if (GITLAB && !T.refGiven) T.ref = (await repositoryInfo({ product: T.product, token: token() })).defaultBranch || T.ref;
  const snap = await readSnapshot({ product: T.product, ref: T.ref, token: token() });
  state.commit = snap.commit;
  state.tree = snap.tree;
  state.byPath = new Map(state.tree.map((e) => [e.path, e]));
  if (state.commit !== before) { memo = new Map(); state.records = null; verified.clear(); }
}

// Without a token, files come from GitHub's raw host (public repositories). With a token, they come
// through the API, the only place the token may go (SPEC §7 A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT) —
// which is also what makes private repositories readable. A GitLab product is read through its own
// server's API, with its project token if one is stored (MOD-git-host readFile). A file the pinned tree names is there: a
// GitLab product's that its server does not find is shown empty, a GitHub product's is an error, as before ITM-130.
async function raw(path) {
  const text = await readFile({ product: T.product, commit: state.commit, path, token: token() });
  if (text === null && !GITLAB) throw Object.assign(new Error(`404 Not Found — ${path} at ${state.commit}`), { status: 404 });
  return text ?? "";
}

// A file on the commit an acceptance is written on (dashboard/writes.mjs acceptItems); null if it is absent.
const readAt = (head, path) => readFile({ product: T.product, commit: head, path, token: token() });

// The product shown, for a write (writeFiles): a GitLab product by itself, a GitHub one by its repository.
const writeTarget = () => (GITLAB ? { product: T.product } : { repo: T.repo });

// THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER: the list is this browser's, by address; the instance
// repository names no product. Another browser starts with an empty list.
function loadProducts() {
  state.products = store.getProducts().map(parseProductAddress).filter((p) => !p.error);
}
const paths = (re) => state.tree.filter((e) => re.test(e.path));

// A file of the pinned commit, by its blob SHA — "" for a file the tree does not hold.
function fileText(path) {
  const e = state.byPath.get(path);
  if (!e) return Promise.resolve("");
  return once(`file:${path}`, () => readByBlob({ sha: e.sha, key: `${REPO_KEY}/${e.sha}`, cache: kept, read: () => raw(path) }));
}

// The approval records named in the tree, and those read so far (each parsed, with its own path).
const recIndex = () => (state.records ??= recordIndex(state.tree.map((e) => e.path)));
const readRecords = (list) => Promise.all(list.map((p) => once(`record:${p}`, async () => ({ ...parseRecord(await fileText(p)), _path: p }))));
// STATUS IS DERIVED FROM THE RECORDS: from their names in the tree; verify — for a file that is opened — from their content.
const statusOf = (path, blob, ids = [], verify = false) => statusByNames({ index: recIndex(), path, blob, ids, read: readRecords, verify });
// Every record of an identifier: those named by it, and any whose name follows no known form.
const recordsOf = async (id) => recordsForId(await readRecords([...(recIndex().byId.get(id) || []).map((n) => n.path),
  ...recIndex().unknown]), id);
// The status a file was shown with when it was opened (verified from its records), by path — a list shows it too.
const verified = new Map();

// ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS: what an architecture file rests on — the SPEC and the use cases it names — as the
// architecture views read it for the view shown (state.archCtx).
const prerequisitesOf = (f) => architecturePrerequisites({ arch: f.arch, specText: state.archCtx.spec, useCases: state.archCtx.useCases });

// The queues whose accepted entries a person opened on this page stay open in the list.
const openQueues = new Set();
// The last accepted texts and the code's module headers read on this page, by identifier or commit (review-views.mjs).
const acceptedCache = new Map(), headersCache = new Map();

// A view renders only while it is still the one asked for: reading may take long enough for the person to have moved on.
let routeSeq = 0;

// ---------------------------------------------------------------- rendering helpers

const main = () => document.getElementById("main");

function md(text) {
  return DOMPurify.sanitize(marked.parse(text, { gfm: true }));
}

let mermaidReady = false;
async function renderMermaid(root) {
  const blocks = [...root.querySelectorAll("pre > code.language-mermaid")];
  if (!blocks.length || !globalThis.mermaid) return;
  if (!mermaidReady) {
    const dark = matchMedia("(prefers-color-scheme: dark)").matches;
    globalThis.mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: dark ? "dark" : "default" });
    mermaidReady = true;
  }
  const nodes = blocks.map((code) => {
    const div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = code.textContent;
    code.parentElement.replaceWith(div);
    return div;
  });
  try {
    await globalThis.mermaid.run({ nodes });
  } catch (e) {
    for (const n of nodes) if (!n.querySelector("svg")) n.insertAdjacentHTML("beforeend", `<p class="warn">Diagram error: ${h(e.message)}</p>`);
  }
}

async function reloadAndRoute() {
  await loadSnapshot();
  await route();
}

// A GitLab product without its project token: no Accept, no Save — the step that stores the token instead
// (A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; UC-008 3c, UC-018 4b).
const tokenStepLink = () => `#add/${encodeURIComponent(T.product.address)}`;

// Why a write was refused, in the product's terms (writeRefusalText); githubPage: the GitHub path the caller links beside it.
const writeErrorText = (e, githubPage = null) => writeRefusalText(e, T.product, new Date(), { githubPage }) || errorText(e);

// ---------------------------------------------------------------- tokens refused or expiring (SPEC §7)

const shownSecrets = new Set(); // keys revealed by Show on this page; any other view hides them again

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED: a 401 anywhere marks the token that was used as refused —
// the GitHub token, or the project token of the GitLab product (`product`) — and the line at the top of every
// view says which token and where it is renewed. The mark is the token's last test, kept in this browser beside the token
// (MOD-settings-store), so that it holds after a reload too (UC-042 step 1); a successful Test, a new value or a Clear replace it.
function noteRefusal(e, product = T.product) {
  if (tokenRefusal(e)) {
    if (isGitLab(product)) store.setGitLabTokenTest(product.address, { refused: true });
    else if (ownTokenOf(product)) store.setGitHubProductTokenTest(product.address, { refused: true });
    else store.setTokenTest({ refused: true });
    showBanner();
    if (document.getElementById("browser-settings")) renderBrowserSettings(app);
  }
  return e;
}
// Any refusal, in words: a used-up rate limit by its name, a refused token with where it is renewed, else the server's answer.
const errorText = (e, product = T.product) => {
  const limit = rateLimitText(e, product);
  if (limit) return limit;
  const r = tokenRefusal(e, ownTokenOf(product));
  return r ? `${r.text} Renew it with the link at the top of the page.` : e.message;
};
const gitlabShown = () => (GITLAB ? store.getGitLabToken(T.product.address) : null);
// The shown product's own token: a GitLab product's project token, or a GitHub product's own token; none on the instance's pages,
// nor for a GitHub product read with the instance's.
const ownShown = () => (GITLAB ? gitlabShown() : store.getGitHubProductToken(T.product.address));
// The line at the top of every view: the GitHub token, and the shown product's own token, each expiring or refused at its last use
// (its kept last test).
function showBanner() {
  const el = document.getElementById("token-banner"), own = ownShown();
  if (el) el.innerHTML = (ghToken() ? tokenBannerHtml({ expires: store.getTokenExpiry(), refused: Boolean(store.getTokenTest()?.refused) }) : "")
    + (own ? tokenBannerHtml({ expires: own.expires, refused: Boolean(own.tested?.refused), product: T.product }) : "");
}

// ---------------------------------------------------------------- the product selector

// The dashboard's address for a product: ?repo=owner/name on GitHub, ?product=<address> on GitLab.
function productHref(p) {
  const q = new URLSearchParams();
  if (isGitLab(p)) q.set("product", p.address);
  else if (p.repo !== T.instance) q.set("repo", p.repo);
  return `?${q}`;
}

function renderProductSelector() {
  const sel = document.getElementById("product");
  // A PRODUCT IS NAMED BY ITS ADDRESS; the instance is always offered first and is not in the list.
  const instance = parseProductAddress(`https://github.com/${T.instance}`);
  const options = [{ p: instance, label: `${T.instance} — this instance` },
    ...state.products.filter((p) => p.address !== instance.address).map((p) => ({ p, label: p.address }))];
  sel.innerHTML = options.map(({ p, label }) => `<option value="${h(p.address)}" ${p.address === T.product.address ? "selected" : ""}>${h(label)}</option>`).join("")
    + `<option value="__add">+ Add product…</option>`;
  sel.onchange = () => {
    if (sel.value === "__add") {
      sel.value = T.product.address;
      location.hash = "#add";
      return;
    }
    location.search = productHref(parseProductAddress(sel.value)).slice(1);
  };
}

// ---------------------------------------------------------------- notifications (UC-047)
//
// Change between jobs, sprint 07 (SPEC.md WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS): ITM-236's own header named
// making the dashboard's pages start the checks as not part of that item. This wires MOD-notifications' watchForAcceptance
// into the review pages with MOD-browser-store's store of the instance, as sprint 07's record (docs/backlog/sprints/07.md)
// names, and builds the one thing watchForAcceptance needs that the module does not provide itself: the address of a
// notification's review-pages route, confirmed against the routes this file and its views already serve (the PO's gate
// record of ITM-236 names addressOf's routes as this change's reading to confirm) — #uc(/<id>), #arc(/<id>) for both an
// architecture decision and a module (review-views.mjs: "ONE ARCHITECTURE DECISION, ONE FILE · ONE MODULE, ONE FILE"),
// #spec/<queue>/<nn> for one SPEC change entry (spec-changes-view.mjs; MOD-progress-measures' id "spec-<queue>-<nn>"),
// #release always for a release test report (release-view.mjs; not built yet — ITM-239 — so this falls back to the
// use-case list today, as any not-yet-built route does, route()).
let notificationsStore = null;

// MOD-notifications' checks.mjs route key for one of its waiting kinds, turned into this file's own route — "uc", "arc"
// or "spec", with the file's id where one file is named; "release" always, regardless of id (MOD-test-pages' one route,
// no id of its own).
function notificationView(route, id) {
  if (route === "use-case") return id ? `uc/${id}` : "uc";
  if (route === "decision" || route === "module") return id ? `arc/${id}` : "arc";
  if (route === "spec-entry") {
    const m = id && /^spec-(.+)-(\d+)$/.exec(id);
    return m ? `spec/${m[1]}/${m[2]}` : "spec";
  }
  return "release";
}

// addressOf(route, params, repository) -> string (MOD-notifications, Interfaces: watchForAcceptance) — the instance's
// own address with no query (as renderProductSelector's own instance option, and productHref, already resolve it), or a
// kept product's by its repository path; absolute, since the worker opens it from its own scope, not this page's
// (src/notifications/worker.mjs).
function addressOfNotification(route, params, repository) {
  const p = repository === T.instance ? parseProductAddress(`https://github.com/${T.instance}`)
    : state.products.find((x) => x.repo === repository) ?? null;
  const query = p ? productHref(p) : "";
  return new URL(`${query}#${notificationView(route, params.id)}`, document.baseURI).href;
}

// Opens this browser's MOD-browser-store store of the instance, connects the instance's host with the dashboard's own
// stored GitHub token — ghToken(), settings-store.mjs's agent-m.github-token, as process-view.mjs's own connect()
// uses it (ITM-238 F2, sprint 08's change between jobs, docs/backlog/sprints/08.md: MOD-browser-store's own
// "github-token" setting is never written, so the instance was always checked with no token) — and starts the
// checks — only where this browser could ever show one at all: real browsers always define Notification
// (permission.mjs's own available() already tells "no" apart by the same check, for a browser that offers no
// notifications); without it the checks would only run uselessly, and watchForAcceptance's own interval would never be
// cleared (no page of this kind is ever closed from here) — exactly what every test that loads this page without faking
// a browser's Notification must not be left running after it.
function startNotifications() {
  try {
    notificationsStore = openStore(T.instance);
  } catch {
    return; // StorageUnavailable: a browser that refuses storage holds no switch, and no check runs
  }
  if (typeof globalThis.Notification === "undefined") return;
  const instanceHost = connect(parseAddress(`https://github.com/${T.instance}`), { token: ghToken() });
  watchForAcceptance({ store: notificationsStore, instance: { repository: T.instance, host: instanceHost }, addressOf: addressOfNotification });
}

// ---------------------------------------------------------------- this page's context, handed to every view

let app = null;
function context() {
  return {
    T, GITLAB, SERVER, store, kept, session, state, REPO_KEY, DASHBOARD,
    ghToken, token, once, loadSnapshot, readAt, writeTarget, loadProducts, paths, fileText, recIndex, readRecords, statusOf,
    recordsOf, verified, prerequisitesOf, openQueues, acceptedCache, headersCache, shownSecrets,
    main, h, md, renderMermaid, stepHtml, diffHtml, gitlabWriteRefusal, rateLimitText, reloadAndRoute, tokenStepLink, writeErrorText,
    writeAccessRefused: (e) => writeAccessRefused(e, T.product),
    noteRefusal, errorText, showBanner, gitlabShown, productHref, renderProductSelector, loadFile, present, notThere,
    seq: () => routeSeq,
    setFlash: (text) => { flash = text; },
    // MOD-browser-store's store of the instance (UC-047; settings-view.mjs's line *Notifications*), null while this
    // browser refused it (StorageUnavailable).
    notificationsStore,
  };
}

// ---------------------------------------------------------------- routing

// THE MENU FOLLOWS THE PROCESS: the site's menu, each entry leading to the first of its views whose file is built; the entry of
// the view shown is marked.
let available = null;
function markTab(kind) {
  const entry = entryOf(kind || "uc");
  document.querySelectorAll(".tabs [data-entry]").forEach((t) => t.classList.toggle("active", t.dataset.entry === entry));
}
async function renderTabs() {
  const el = document.getElementById("tabs");
  if (el) el.innerHTML = menuHtml({ built: builtViews(builtFiles), tabs: true });
  const [kind, a] = location.hash.replace(/^#/, "").split("/");
  markTab(kind === "review" ? a : kind);
}

async function route() {
  routeSeq += 1;
  const [kind, a, b] = location.hash.replace(/^#/, "").split("/");
  markTab(kind === "review" ? a : kind);
  // The views of the repository read what they show first.
  if (state.commit && ["", "uc", "arc", "spec", "review"].includes(kind || "")) main().innerHTML = `<p class="muted">Reading…</p>`;
  try {
    await available;
    if (kind === "add") {
      const addProduct = settingsPages.routes.find((r) => r.name === "add-product");
      await addProduct.render(main(), {
        instance: { repository: T.instance }, product: null, store: openStore(T.instance),
        go(_route, { product }) { location.search = productHref(parseProductAddress(product)).slice(1); },
      }, {});
      if (a) {
        const input = main().querySelector("input.address");
        input.value = decodeURIComponent(a);
        input.dispatchEvent(new Event("input"));
      }
      return;
    }
    // A view by its name; an address no view answers — or a view whose file is not there yet — shows the use cases.
    const v = DASHBOARD.find((x) => x.view && x.view === kind);
    const views = v && built.has(v.file) ? await loadFile(v.file).catch((e) => { if (notThere(e)) return null; throw e; }) : null;
    if (views?.routes?.[v.view]) {
      linkStylesheet(views.stylesheet);
      await views.routes[v.view](app, a, b);
    } else {
      const uc = await loadFile(DASHBOARD.find((x) => x.view === "uc").file);
      linkStylesheet(uc.stylesheet);
      await uc.routes.uc(app);
    }
    // A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE · AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — on every view.
    const own = ownShown();
    document.getElementById("token-banner").innerHTML = (ghToken()
      ? tokenBannerHtml({ expires: store.getTokenExpiry(), refused: Boolean(store.getTokenTest()?.refused) }) : "")
      + (own ? tokenBannerHtml({ expires: own.expires, refused: Boolean(own.tested?.refused), product: T.product }) : "");
    if (flash) {
      main().insertAdjacentHTML("afterbegin", `<section class="panel notice flash"><p>${flash}</p></section>`);
      flash = null;
    }
  } catch (e) {
    main().innerHTML = `<p class="warn">${h(errorText(noteRefusal(e)))}</p>`;
  }
  window.scrollTo(0, 0);
}

async function start() {
  T = deriveTarget(location);
  T.product = T.product || parseProductAddress(`https://github.com/${T.repo}`);
  GITLAB = isGitLab(T.product);
  SERVER = GITLAB ? T.product.host : "GitHub";
  store = productStore(T.instance);
  // The texts of files read before, by blob SHA (settings-store.mjs; cleared by "Clear everything").
  kept = fileTexts();
  // The product's key among the texts this browser keeps: its server and repository.
  REPO_KEY = `${T.product.host}/${T.product.repo}`;
  startNotifications(); // UC-047: the review pages start the checks, with MOD-browser-store's store of the instance
  app = context();
  available = renderTabs();
  loadProducts();
  renderProductSelector();
  const early = /^#(settings|add|setup)/.test(location.hash);
  if (early) {
    addEventListener("hashchange", route);
    route();
  }
  try {
    await loadSnapshot();
    document.getElementById("repo-line").innerHTML =
      `<a href="${h(T.product.address)}" target="_blank" rel="noopener">${h(GITLAB ? T.product.address : T.repo)}</a> · ${h(T.ref)} · <code>${h(state.commit.slice(0, 12))}</code>`;
  } catch (e) {
    noteRefusal(e);
    state.loadError = e;
    if (early) { loadProductSettings(app); return; }
    main().innerHTML = loadErrorHtml({ error: e, product: T.product, ref: T.ref, hasToken: Boolean(token()), own: ownTokenOf(T.product) });
    addEventListener("hashchange", route);
    return;
  }
  if (!early) { addEventListener("hashchange", route); route(); } else loadProductSettings(app);
}

if (globalThis.document) start();
