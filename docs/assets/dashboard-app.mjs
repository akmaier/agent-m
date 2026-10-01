// Dashboard — the browser runtime's composition root and router. SPEC §10; ARC-003 (shells).
//
// Reads one pinned commit of the product — on GitHub (two API calls, then immutable raw files) or on a
// GitLab server (its REST API v4, at the same pinned commit) — and renders use cases and SPEC change
// proposals. A page load reads only the commit and its tree; each view then reads the files it shows, each by its blob
// SHA and kept in this browser by that SHA, so that a file is read again only when it changed. With a stored token, a
// person's click commits an edit or an acceptance (dashboard/writes.mjs); an accepted SPEC change is written in
// the same commit as its approval record. Without a token, GitHub's own pages are opened, prefilled; a GitLab product
// without its project token is read-only and links to the step that stores it. Every read goes through fetchText (GET only), and each token only to
// the API of the server that issued it.
//
// Module: MOD-dashboard-app
//
// The views are files of their own, docs/assets/dashboard/<view>-view.mjs, and the settings page's sections
// docs/assets/dashboard/settings/<section>.mjs — each loaded by its name from one table (DASHBOARD), which also makes the tab
// bar. A view module exports `routes`: { <route>: (app, …parts of the address) }, and may export `stylesheet`, a stylesheet of
// its own beside style.css; a section module exports `renderSection(app, box)`. Both get `app`, this page's context: what is
// read, what is kept, and the helpers every view uses.
// Nothing here runs on import outside a page (no `document`), so that tests import the shell's own texts.

import { marked } from "./vendor/marked.esm.js";
import DOMPurify from "./vendor/purify.es.mjs";
import { browserStore, fileTexts } from "./settings-store.mjs";
import {
  fetchText, parseProductAddress, isGitLab, gitlabProject, gitlabSnapshot, gitlabReadFile, tokenRefusal, usedUpLimit,
} from "./git-host.mjs";
import {
  deriveTarget, parseRecord, createReviewSession, readByBlob, recordIndex, statusByNames, recordsForId, lineDiff,
  architecturePrerequisites,
} from "./review-core.mjs";
import { tokenBannerHtml, renderBrowserSettings, loadProductSettings } from "./dashboard/settings-view.mjs";

const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

// ---------------------------------------------------------------- the views and the settings sections (one table)
//
// Every view and every settings section the accepted use cases call for, in the order of the tab bar and of the settings page.
// A view or section whose file does not exist yet is not shown; a later item adds one as a new file, without editing this one.
// view: the route (#<view>/…); tab: its label in the tab bar, if it has a tab. section: a part of the settings page; built in:
// written by settings-view.mjs itself.
export const DASHBOARD = [
  { view: "uc", file: "review-views.mjs", tab: "Use cases", useCases: ["UC-008"] },
  { view: "arc", file: "review-views.mjs", tab: "Architecture", useCases: ["UC-022", "UC-023"] },
  { view: "spec", file: "spec-changes-view.mjs", tab: "SPEC changes", useCases: ["UC-006", "UC-018"] },
  { view: "review", file: "review-views.mjs", useCases: ["UC-008", "UC-022", "UC-023"] },
  { view: "specification", file: "specification-view.mjs", tab: "Specification", useCases: ["UC-020"] },
  { view: "arrange", file: "arrange-view.mjs", useCases: ["UC-021"] },
  { view: "derive-requirements", file: "derive-requirements-view.mjs", useCases: ["UC-005"] },
  { view: "derive-use-cases", file: "derive-use-cases-view.mjs", useCases: ["UC-007"] },
  { view: "derive-architecture", file: "derive-architecture-view.mjs", useCases: ["UC-022"] },
  { view: "modules", file: "modules-view.mjs", tab: "Modules", useCases: ["UC-025"] },
  { view: "library", file: "library-view.mjs", tab: "Library", useCases: ["UC-004", "UC-016"] },
  { view: "sources", file: "sources-view.mjs", useCases: ["UC-015"] },
  { view: "resources", file: "resources-view.mjs", tab: "Resources", useCases: ["UC-040"] },
  { view: "participants", file: "participants-view.mjs", tab: "Participants", useCases: ["UC-017"] },
  { view: "process-models", file: "process-models-view.mjs", tab: "Process models", useCases: ["UC-031"] },
  { view: "process", file: "process-view.mjs", tab: "How this product is developed", useCases: ["UC-002"] },
  { view: "backlog", file: "backlog-view.mjs", tab: "Backlog", useCases: ["UC-032", "UC-033"] },
  { view: "progress", file: "progress-view.mjs", tab: "Progress", useCases: ["UC-035"] },
  { view: "sprint-close", file: "sprint-close-view.mjs", useCases: ["UC-041"] },
  { view: "jobs", file: "jobs-view.mjs", tab: "Jobs", useCases: ["UC-036"] },
  { view: "run", file: "run-view.mjs", tab: "Run", useCases: ["UC-043", "UC-034", "UC-024"] },
  { view: "tests", file: "tests-runs-view.mjs", tab: "Tests", useCases: ["UC-028"] },
  { view: "tests-browser", file: "tests-browser-view.mjs", useCases: ["UC-029"] },
  { view: "tests-schedule", file: "tests-schedule-view.mjs", useCases: ["UC-027"] },
  { view: "tests-generate", file: "tests-generate-view.mjs", useCases: ["UC-026"] },
  { view: "release", file: "release-view.mjs", tab: "Release", useCases: ["UC-013"] },
  { view: "audit", file: "audit-view.mjs", useCases: ["UC-030"] },
  { view: "issues", file: "issues-view.mjs", tab: "Issues", useCases: ["UC-012", "UC-033"] },
  { view: "mail", file: "mail-view.mjs", tab: "Mail", useCases: ["UC-038"] },
  { view: "mail-replies", file: "mail-replies-view.mjs", useCases: ["UC-039"] },
  { view: "how", file: "how-view.mjs", tab: "How acceptance works", useCases: ["UC-006", "UC-008"] },
  { view: "settings", file: "settings-view.mjs", tab: "Settings", icon: "⚙", title: "Every setting Agent M uses", useCases: ["UC-042"] },
  { view: "add", file: "add-product-view.mjs", useCases: ["UC-001"] },
  { view: "setup", file: "setup-view.mjs", useCases: ["UC-014"] },
  { view: "get-your-own", file: "get-your-own-view.mjs", useCases: ["UC-014"] },
  { section: "browser", builtIn: true, useCases: ["UC-042"] },
  { section: "endpoints", file: "settings/endpoints.mjs", useCases: ["UC-003"] },
  { section: "mailbox", file: "settings/mailbox.mjs", useCases: ["UC-037"] },
  { section: "bridge", file: "settings/bridge.mjs", useCases: ["UC-044"] },
  { section: "instance", file: "settings/instance.mjs", useCases: ["UC-042"] },
  { section: "product", builtIn: true, useCases: ["UC-042"] },
  { section: "export", builtIn: true, useCases: ["UC-042"] },
  { section: "clear", builtIn: true, useCases: ["UC-042"] },
];

const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// The tab bar: one link per view with a tab whose file is there, in the table's order.
export function tabsHtml(views) {
  return views.filter((v) => v.view && v.tab).map((v) => `<a href="#${h(v.view)}" role="tab" id="tab-${h(v.view)}"${v.title
    ? ` title="${h(v.title)}"` : ""}>${v.icon ? `<span aria-hidden="true">${h(v.icon)}</span> ` : ""}${h(v.tab)}</a>`).join("\n");
}

// A view's file, loaded once per page. A file that is not there yet: a browser's import of it fails with a TypeError, node's
// with ERR_MODULE_NOT_FOUND. A file that is there but fails otherwise is shown, so that opening it names the error.
const modules = new Map();
function loadFile(file) {
  if (!modules.has(file)) modules.set(file, import(new URL(`dashboard/${file}`, import.meta.url).href));
  return modules.get(file);
}
const notThere = (e) => e?.code === "ERR_MODULE_NOT_FOUND" || e instanceof TypeError;
async function present(file) {
  try { await loadFile(file); return true; } catch (e) { return !notThere(e); }
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
// revoked token is answered with 401 instead, and named by tokenRefusal.
export function gitlabWriteRefusal(e, product) {
  if (e?.status !== 403) return null;
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

// Why a write was refused, in the product's terms — a used-up limit first, then GitLab's 403, then GitHub's 403 or 404 as the
// token's missing permission; null when none of these applies (the caller then shows errorText).
export function writeRefusalText(e, product, now = new Date()) {
  const limit = rateLimitText(e, product, now);
  if (limit) return limit;
  if (isGitLab(product)) return gitlabWriteRefusal(e, product);
  return /403|404/.test(e?.message || "")
    ? `Your token cannot write to ${product.repo} (${e.message}). Extend it in Settings, or remove it to use GitHub's page instead.`
    : null;
}

// The page shown when the product's commit cannot be read: the server's answer, and what it means here. A used-up rate limit
// is named instead (A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN); a refused token is named with its renewal (AN
// EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED). hasToken: whether a token for this product is stored.
export function loadErrorHtml({ error: e, product, ref, hasToken, now = new Date() }) {
  const gl = isGitLab(product), name = gl ? product.address : product.repo;
  const limit = rateLimitText(e, product, now);
  if (limit) return `<p class="warn">Could not read ${h(name)} @ ${h(ref)}: ${h(limit)}</p>`;
  const refused = tokenRefusal(e, gl ? product : null);
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

// The instance is the fork this page is served from; the product is chosen with ?repo= or ?product= (SPEC §10). Set by start().
let T, GITLAB, SERVER, store, kept, REPO_KEY;
// The GitHub token (the instance's key, UC-014).
const ghToken = () => store.getToken();
// The token that writes to the product shown: the GitHub token, or — for a GitLab product — its own project token
// (A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN). Never the other one.
const token = () => (GITLAB ? store.getGitLabToken(T.product.address)?.token || null : store.getToken());
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
  if (GITLAB) {
    // GITLAB PRODUCTS ARE SUPPORTED: its default branch unless ?ref= names one, resolved to one commit.
    if (!T.refGiven) T.ref = (await gitlabProject({ product: T.product, token: token() })).default_branch || T.ref;
    const snap = await gitlabSnapshot({ product: T.product, ref: T.ref, token: token() });
    state.commit = snap.commit;
    state.tree = snap.tree;
  } else {
    const [owner, name] = T.repo.split("/");
    const commitJson = JSON.parse(await fetchText(`${API}/repos/${owner}/${name}/commits/${encodeURIComponent(T.ref)}`,
      { headers: { Accept: "application/vnd.github+json" } }, token()));
    state.commit = commitJson.sha;
    const tree = JSON.parse(await fetchText(`${API}/repos/${owner}/${name}/git/trees/${state.commit}?recursive=1`, {}, token()));
    state.tree = tree.tree.filter((e) => e.type === "blob");
  }
  state.byPath = new Map(state.tree.map((e) => [e.path, e]));
  if (state.commit !== before) { memo = new Map(); state.records = null; verified.clear(); }
}

// Without a token, files come from GitHub's raw host (public repositories). With a token, they come
// through the API, the only place the token may go (SPEC §7 A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT) —
// which is also what makes private repositories readable. A GitLab product is read through its own
// server's API, with its project token if one is stored.
const encP = (path) => path.split("/").map(encodeURIComponent).join("/");
const raw = (path) => (GITLAB
  ? gitlabReadFile({ product: T.product, commit: state.commit, path, token: token() }).then((t) => t ?? "")
  : token()
    ? fetchText(`${API}/repos/${T.repo}/contents/${encP(path)}?ref=${state.commit}`,
      { headers: { Accept: "application/vnd.github.raw+json" } }, token())
    : fetchText(`${RAW}/${T.repo}/${state.commit}/${encP(path)}`));

// A file on the commit an acceptance is written on (dashboard/writes.mjs acceptItems); null if it is absent.
async function readAt(head, path) {
  if (GITLAB) return gitlabReadFile({ product: T.product, commit: head, path, token: token() });
  try {
    return await fetchText(`${API}/repos/${T.repo}/contents/${encP(path)}?ref=${encodeURIComponent(head)}`,
      { headers: { Accept: "application/vnd.github.raw+json" } }, token());
  } catch (e) {
    if (/^404\b/.test(e.message)) return null;
    throw e;
  }
}

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

// Why a write was refused, in the product's terms (writeRefusalText).
const writeErrorText = (e) => writeRefusalText(e, T.product) || errorText(e);

// ---------------------------------------------------------------- tokens refused or expiring (SPEC §7)

const shownSecrets = new Set(); // keys revealed by Show on this page; any other view hides them again
// This page's last answers about the tokens: the GitHub token, and each GitLab project token by its address.
const tokenState = { ok: null, refused: false, gitlab: {}, sessions: {} };

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED: a 401 anywhere marks the token that was used as refused —
// the GitHub token, or the project token of the GitLab product (`product`) — and the line at the top of every
// view says which token and where it is renewed.
function noteRefusal(e, product = T.product) {
  if (tokenRefusal(e)) {
    if (isGitLab(product)) tokenState.gitlab[product.address] = { refused: true, ok: null };
    else { tokenState.refused = true; tokenState.ok = null; }
    showBanner();
    if (document.getElementById("browser-settings")) renderBrowserSettings(app);
  }
  return e;
}
// Any refusal, in words: a used-up rate limit by its name, a refused token with where it is renewed, else the server's answer.
const errorText = (e, product = T.product) => {
  const limit = rateLimitText(e, product);
  if (limit) return limit;
  const r = tokenRefusal(e, isGitLab(product) ? product : null);
  return r ? `${r.text} Renew it with the link at the top of the page.` : e.message;
};
const gitlabShown = () => (GITLAB ? store.getGitLabToken(T.product.address) : null);
function showBanner() {
  const el = document.getElementById("token-banner"), gl = gitlabShown();
  if (el) el.innerHTML = (ghToken() ? tokenBannerHtml({ expires: store.getTokenExpiry(), refused: tokenState.refused }) : "")
    + (gl ? tokenBannerHtml({ expires: gl.expires, refused: Boolean(tokenState.gitlab[T.product.address]?.refused), product: T.product }) : "");
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

// ---------------------------------------------------------------- this page's context, handed to every view

let app = null;
function context() {
  return {
    T, GITLAB, SERVER, store, kept, session, state, REPO_KEY, API, DASHBOARD,
    ghToken, token, once, loadSnapshot, readAt, writeTarget, loadProducts, paths, fileText, recIndex, readRecords, statusOf,
    recordsOf, verified, prerequisitesOf, openQueues, acceptedCache, headersCache, shownSecrets, tokenState,
    main, h, md, renderMermaid, stepHtml, diffHtml, gitlabWriteRefusal, rateLimitText, reloadAndRoute, tokenStepLink, writeErrorText,
    noteRefusal, errorText, showBanner, gitlabShown, productHref, renderProductSelector, loadFile, present, notThere,
    seq: () => routeSeq,
    setFlash: (text) => { flash = text; },
  };
}

// ---------------------------------------------------------------- routing

// The views with a tab whose file is there, found once per page: the tab bar shows only those.
let available = null;
function markTab(kind) {
  document.querySelectorAll(".tabs a").forEach((t) => t.classList.toggle("active", t.getAttribute("href") === `#${kind || "uc"}`));
}
async function renderTabs() {
  const tabs = DASHBOARD.filter((v) => v.view && v.tab);
  const there = await Promise.all(tabs.map((v) => present(v.file)));
  const el = document.getElementById("tabs");
  if (el) el.innerHTML = tabsHtml(tabs.filter((_, i) => there[i]));
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
    // A view by its name; an address no view answers — or a view whose file is not there yet — shows the use cases.
    const v = DASHBOARD.find((x) => x.view && x.view === kind);
    const views = v ? await loadFile(v.file).catch((e) => { if (notThere(e)) return null; throw e; }) : null;
    if (views?.routes?.[v.view]) {
      linkStylesheet(views.stylesheet);
      await views.routes[v.view](app, a, b);
    } else {
      const uc = await loadFile(DASHBOARD.find((x) => x.view === "uc").file);
      linkStylesheet(uc.stylesheet);
      await uc.routes.uc(app);
    }
    // A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE · AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — on every view.
    const gl = gitlabShown();
    document.getElementById("token-banner").innerHTML = (ghToken()
      ? tokenBannerHtml({ expires: store.getTokenExpiry(), refused: tokenState.refused }) : "")
      + (gl ? tokenBannerHtml({ expires: gl.expires, refused: Boolean(tokenState.gitlab[T.product.address]?.refused), product: T.product }) : "");
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
  store = browserStore();
  // The texts of files read before, by blob SHA (settings-store.mjs; cleared by "Clear everything").
  kept = fileTexts();
  // The product's key among the texts this browser keeps: its server and repository.
  REPO_KEY = `${T.product.host}/${T.product.repo}`;
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
    main().innerHTML = loadErrorHtml({ error: e, product: T.product, ref: T.ref, hasToken: Boolean(token()) });
    addEventListener("hashchange", route);
    return;
  }
  if (!early) { addEventListener("hashchange", route); route(); } else loadProductSettings(app);
}

if (globalThis.document) start();
