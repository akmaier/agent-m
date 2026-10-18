// Dashboard — the browser runtime's composition root and router. SPEC §10; ARC-003 (shells).
//
// Reads one pinned commit of the product — on GitHub or on a GitLab server (its REST API v4, at the same pinned commit) —
// through the public repository Host reads. The review addresses — #uc, #arc, #review, #spec and the routes' own names — are
// handed to MOD-review-pages' routes (reviewTargets), which render the use cases, the architecture and the SPEC change entries and
// make their decisions on a person's click; a GitLab product without its project token is read-only and links to the step that
// stores it. A page load reads the commit and its tree, then the files the route shows in batches (readAhead); the routes then take
// the files they show from that pinned Snapshot. Every read goes through the git host (GET only), and each token only to the API of
// the server that issued it.
//
// Module: MOD-dashboard-app
//
// The other views are files of their own, docs/assets/dashboard/<view>-view.mjs — each loaded by its name from one table
// (DASHBOARD, src/site/views.mjs, which the main page reads too). The menu above the views is the site's one menu, in the order of the process (src/site/menu.mjs).
// Which of the table's files are built is read from one data file beside them, docs/assets/dashboard/built.json, so that a page
// load asks for no file that is not there (one 404 each on GitHub Pages); a change that adds a view adds its file and its line
// there. A view module exports `routes`: { <route>: (app, …parts of the address) }, and may export `stylesheet`, a
// stylesheet of its own beside style.css. It gets `app`, this page's context: what is read, what is kept, and the helpers every
// view uses. The notices about a token — its expiry and its refusal — are the frame's (notices.mjs), drawn into the slot `token-banner`.
// Nothing here runs on import outside a page (no `document`), so that tests import the shell's own texts.

import { marked } from "../../docs/assets/vendor/marked.esm.js";
import DOMPurify from "../../docs/assets/vendor/purify.es.mjs";
import builtFiles from "../../docs/assets/dashboard/built.json" with { type: "json" };
import { retireFileTexts } from "../../docs/assets/settings-store.mjs";
import { productStore } from "../../docs/assets/product-store-adapter.mjs";
import {
  REPO_RE, parseProductAddress, isGitLab, tokenRefusal, usedUpLimit,
} from "../../docs/assets/git-host.mjs";
import {
  parseRecord, readByBlob, recordIndex, statusByNames, parseQueueIndex, parseDecisions,
} from "../../docs/assets/review-core.mjs";
import { ARCHITECTURE_FILE } from "../../docs/assets/artifacts.mjs";
import { DASHBOARD, builtViews } from "../site/views.mjs";
import { menuHtml, entryOf } from "../site/menu.mjs";
import { UPSTREAM, instanceOf } from "../site/instance-repository.mjs";
// The checks of what waits for acceptance, started on the review pages (UC-047; sprint 07's change between jobs: the
// dashboard reaches MOD-notifications, as ITM-236's Outcome names it) — through each module's own interface.
import { openStore, secretValues } from "../browser-store/index.mjs";
import { parseAddress, connect } from "../repository-hosts/index.mjs";
import { watchForAcceptance } from "../notifications/index.mjs";
import { view as settingsPages } from "../settings-pages/index.mjs";
import { view as reviewPages } from "../review-pages/index.mjs";
import { view as tracePages } from "../trace-pages/index.mjs";
import { registerStrategies } from "../job-runner/index.mjs";
import { explain } from "./index.mjs";
import { routeOf } from "./routing.mjs";
import { noticePlace, showTokenNotices } from "./notices.mjs";

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
  if (!modules.has(file)) modules.set(file, import(new URL(`../../docs/assets/dashboard/${file}`, import.meta.url).href));
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
  link.href = new URL(`../../docs/assets/dashboard/${file}`, import.meta.url).href;
  document.head.append(link);
}

// ---------------------------------------------------------------- texts and HTML every view uses

// EVERY STEP EXPLAINS ITSELF: the only way to render a step, and it refuses one without explanation.
export function stepHtml({ title, body, explain }) {
  if (!explain || !String(explain).trim()) throw new Error(`step "${title}" has no \"explain\" text (EVERY STEP EXPLAINS ITSELF)`);
  return `<section class="step"><h3>${h(title)}</h3>${body}` +
    `<details class="explain"><summary>What is this?</summary><div>${explain}</div></details></section>`;
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
  const limited = !gl && !hasToken && /403|429/.test(msg), forbidden = !gl && hasToken && /403/.test(msg), missing = !gl && (e?.name === "NotFound" || /404/.test(msg));
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
let T, GITLAB, SERVER, store, host, hostAddress, hostToken, snapshot, snapshotHost;
// The GitHub token (the instance's key, UC-014).
const ghToken = () => store.getToken();
// The token that writes to the product shown (settings-store tokenFor): a GitLab product's own project token (A GITLAB PRODUCT
// USES A PROJECT ACCESS TOKEN), never the GitHub token; a GitHub product's own token, or the instance's while it has none (A
// GITHUB PRODUCT USES A TOKEN OF ITS OWN).
const token = () => store.tokenFor(T.product);
// The values of every secret stored at this moment, which no commit made through a host the app connects may hold (NO SECRET IN THE REPOSITORY).
const secrets = () => secretValues(openStore(T.instance));
// A Host retains the credential it was connected with. Reuse its Snapshot and blob memory while the selected repository and
// actual credential are unchanged; create a new Host after Settings changes or clears that credential.
function currentHost() {
  const address = T.product.address;
  const currentToken = JSON.stringify([token() || null, secrets()]);
  if (!host || hostAddress !== address || hostToken !== currentToken) {
    const changed = Boolean(host);
    host = connect(parseAddress(address), { token: token() || null, secrets: secrets() });
    hostAddress = address;
    hostToken = currentToken;
    if (changed) {
      snapshot = null;
      snapshotHost = null;
      memo = new Map();
      state.records = null;
    }
  }
  return host;
}
// The product whose own token a request to `p` carries — a GitLab product, or a GitHub product with a token of its own —, so that
// a refusal names that token; null where the instance's token was used.
const ownTokenOf = (p) => (isGitLab(p) || (p?.address && !p.error && store.getGitHubProductToken(p.address)) ? p : null);
// The pinned commit and its tree (every file with its blob SHA). Everything else is read by the view that shows it (`once`).
const state = { commit: null, tree: [], byPath: new Map(), records: null, products: [] };
let flash = null; // the outcome of the last acceptance, shown once above the next view

// ---------------------------------------------------------------- loading
//
// A page load reads the commit the branch points at and that commit's tree — two requests. The tree names every file with its
// blob SHA. The files the route shows are read in batches (readAhead); each view then takes what it shows once per commit
// (`once`): a file by its blob SHA through the pinned Snapshot, whose texts the batches have brought.
// The status of a reviewed file comes from the names of the approval records in the tree (statusByNames); a record is read
// where its content decides.

let memo = new Map(); // what this page has read or derived at state.commit
function once(key, f) {
  if (!memo.has(key)) memo.set(key, f().catch((e) => { memo.delete(key); throw e; }));
  return memo.get(key);
}

async function loadSnapshot() {
  const before = state.commit;
  const activeHost = currentHost();
  // GITLAB PRODUCTS ARE SUPPORTED: its default branch unless ?ref= names one, resolved to one commit.
  if (GITLAB && !T.refGiven) T.ref = (await activeHost.repositoryInfo()).defaultBranch || T.ref;
  const snap = await activeHost.readSnapshot(T.ref);
  snapshot = snap;
  snapshotHost = activeHost;
  state.commit = snap.commit;
  state.tree = snap.paths.map((path) => ({ path, sha: snap.blob(path) }));
  state.byPath = new Map(state.tree.map((e) => [e.path, e]));
  if (state.commit !== before) { memo = new Map(); state.records = null; }
}

// A page load reads the files a route shows in batches, ahead of the reads of the views (Snapshot.readMany): each route's
// paths are taken from the tree, so no view changes. A route whose list of files depends on files it has read — the open
// queues' proposals — reads them in a second wave. Each wave is one batch per hundred
// files; a path the tree does not hold is left out, and a file the batch could not give is read by its own fileText.
const USE_CASE_PATH = /^docs\/use-cases\/UC-\d{3}-[^/]+\.md$/;
const QUEUE_INDEX_PATH = /^docs\/spec-freigaben\/[^/]+\/index\.md$/;
const QUEUE_HEAD_PATH = /^docs\/spec-freigaben\/[^/]+\/(?:index|entscheidungen)\.md$/;
const ITEM_PATH = /^docs\/backlog\/ITM-\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const SPRINT_PATH = /^docs\/backlog\/sprints\/([^/]+)\/\d+\.md$/;
const ASSIGNMENT_PATH = /^docs\/role-assignments\/([^/]+)\.md$/;
const MODULE_PATH = /^docs\/architecture\/MOD-[^/]+\.md$/;
const DECISION_PATH = /^docs\/architecture\/ARC-\d{3}-[^/]+\.md$/;
const pathsOf = (...res) => state.tree.map((e) => e.path).filter((p) => res.some((re) => re.test(p)));
// The approval records a status of `path` reads: statusByNames run with a reader that notes what it is asked.
async function recordsRead(path, blob) {
  const asked = [];
  try { await statusByNames({ index: recIndex(), path, blob, read: async (list) => { asked.push(...list); return list.map(() => ({})); } }); } catch { /* only what it asked */ }
  return asked;
}
const recordsOfAll = async (paths) => (await Promise.all(paths.map((p) => recordsRead(p, state.byPath.get(p).sha)))).flat();
async function readWave(paths) {
  const wanted = [...new Set(paths)].filter((p) => state.byPath.has(p));
  if (wanted.length) await (await pinned()).readMany(wanted);
}
// The proposals, and the files they change, of the SPEC change queues that still have an entry to decide
// (the route spec-entry reads them): read from the queues' index and decisions files, which the first wave brought.
async function openProposals() {
  const lists = await Promise.all(pathsOf(QUEUE_INDEX_PATH).map(async (index) => {
    const dir = index.replace(/\/index\.md$/, "");
    const [indexText, decisionText] = await Promise.all([fileText(index), fileText(`${dir}/entscheidungen.md`)]);
    const { target, entries } = parseQueueIndex(indexText), decisions = parseDecisions(decisionText);
    if (entries.length > 0 && entries.every((en) => decisions.get(en.nr)?.decision === "uebernommen")) return [];
    return entries.flatMap((en) => {
      const prefix = `${dir}/${String(en.nr).padStart(2, "0")}-`;
      const proposal = pathsOf(/\.md$/).find((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/") && !p.endsWith(".begruendung.md"));
      return [proposal, (target || en.file).replace(/^`|`$/g, "").replace(/^products\/[^/]+\//, "")];
    });
  }));
  return lists.flat().filter(Boolean);
}
async function readAhead(kind) {
  if (kind === "" || kind === "uc") {
    await readWave(pathsOf(USE_CASE_PATH));
  } else if (kind === "arc") {
    await readWave(pathsOf(ARCHITECTURE_FILE));
  } else if (kind === "use-case") {
    await readWave(pathsOf(USE_CASE_PATH));
  } else if (kind === "decision") {
    await readWave(pathsOf(DECISION_PATH));
  } else if (kind === "module") {
    await readWave(pathsOf(MODULE_PATH));
  } else if (kind === "spec") {
    await readWave(["SPEC.md", ...pathsOf(QUEUE_HEAD_PATH)]);
    await readWave(await openProposals());
  } else if (kind === "backlog") {
    // The module files are read for a product with more than one team (backlog-view.mjs context).
    const teams = new Set([...pathsOf(ASSIGNMENT_PATH).map((p) => ASSIGNMENT_PATH.exec(p)[1]), ...pathsOf(SPRINT_PATH).map((p) => SPRINT_PATH.exec(p)[1])]);
    await readWave(["docs/process.md", "SPEC.md", ...pathsOf(ITEM_PATH, SPRINT_PATH, ASSIGNMENT_PATH), ...(teams.size > 1 ? pathsOf(MODULE_PATH) : []),
      ...await recordsOfAll(pathsOf(USE_CASE_PATH))]);
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

// A file of the pinned commit, by its blob SHA — "" for a file the tree does not hold. Snapshot.read is the public Host
// interface for this address and credential lifetime; without an injected cache, readByBlob returns Snapshot.read's text.
// The load's one snapshot: the one loadSnapshot read, or, after Settings changed the host, the same commit read through the new one.
async function pinned() {
  const activeHost = currentHost();
  if (snapshotHost !== activeHost) {
    snapshot = await activeHost.readSnapshot(state.commit);
    snapshotHost = activeHost;
  }
  return snapshot;
}
function fileText(path) {
  const e = state.byPath.get(path);
  if (!e) return Promise.resolve("");
  currentHost();
  return once(`file:${path}`, () => readByBlob({ sha: e.sha, read: async () => {
    const text = await (await pinned()).read(path);
    if (text === null && !GITLAB) throw Object.assign(new Error(`404 Not Found — ${path} at ${state.commit}`), { status: 404 });
    return text ?? "";
  } }));
}

// The approval records named in the tree, and those read so far (each parsed, with its own path).
const recIndex = () => (state.records ??= recordIndex(state.tree.map((e) => e.path)));
const readRecords = (list) => Promise.all(list.map((p) => once(`record:${p}`, async () => ({ ...parseRecord(await fileText(p)), _path: p }))));
// STATUS IS DERIVED FROM THE RECORDS: from their names in the tree.
const statusOf = (path, blob, ids = [], verify = false) => statusByNames({ index: recIndex(), path, blob, ids, read: readRecords, verify });
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
// The notices at the top of every view: the frame's own notices (MOD-site-frame, showTokenNotices) of the GitHub token and of the
// shown product's own token, each expiring or refused at its last use (its kept last test). Their place is the page's slot
// `token-banner`, made at the start of the page.
let tokenNotices = null;
function showBanner() {
  if (!tokenNotices) return;
  const slot = document.getElementById("token-banner");
  tokenNotices.replaceChildren();
  const address = parseAddress(T.product.address);
  const isInstance = address.server === "github" && address.path === T.instance;
  showTokenNotices({ store: openStore(T.instance), instance: { host: connect(parseAddress(`https://github.com/${T.instance}`), { secrets: secrets() }) },
    product: isInstance ? null : { address: T.product.address, host: connect(address, { secrets: secrets() }) } });
  // The slot holds the place only while it holds a notice, so that it stays empty (and hidden by the page's style) otherwise.
  slot.replaceChildren(...(tokenNotices.children.length ? [tokenNotices] : []));
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
// architecture decision and a module ("ONE ARCHITECTURE DECISION, ONE FILE · ONE MODULE, ONE FILE"),
// #spec/<queue>/<nn> for one SPEC change entry (MOD-progress-measures' id "spec-<queue>-<nn>"),
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
  watchForAcceptance({ store: notificationsStore, instance: { repository: T.instance, host: instanceHostFollowingToken() }, addressOf: addressOfNotification });
}

// The instance's host for the checks, which keep it for the page's whole life: each call of its functions goes through a host connected
// with the GitHub token stored at that moment, a new one when the token was cleared, replaced or stored since (A CLEAR IS A REAL CLEAR).
function instanceHostFollowingToken() {
  const address = parseAddress(`https://github.com/${T.instance}`);
  let held = null, heldToken = null;
  const current = () => {
    const stored = JSON.stringify([ghToken() || null, secrets()]);
    if (!held || stored !== heldToken) {
      held = connect(address, { token: ghToken() || null, secrets: secrets() });
      heldToken = stored;
    }
    return held;
  };
  return Object.freeze(Object.fromEntries(Object.entries(current()).map(([name, member]) =>
    [name, typeof member === "function" ? (...given) => current()[name](...given) : member])));
}

// ---------------------------------------------------------------- this page's context, handed to every view

let app = null;
function context() {
  return {
    T, GITLAB, SERVER, store, state, DASHBOARD,
    ghToken, token, once, loadSnapshot, writeTarget, loadProducts, paths, fileText, recIndex, readRecords, statusOf, shownSecrets,
    main, h, md, renderMermaid, rateLimitText, reloadAndRoute, writeErrorText,
    noteRefusal, errorText, showBanner, gitlabShown, productHref, renderProductSelector, loadFile, present, notThere,
    seq: () => routeSeq,
    setFlash: (text) => { flash = text; },
    // MOD-browser-store's store of the instance (UC-047; settings-view.mjs's line *Notifications*), null while this
    // browser refused it (StorageUnavailable).
    notificationsStore,
  };
}

// ---------------------------------------------------------------- the review pages' routes (MOD-review-pages)
//
// The live addresses lead where they led, through MOD-review-pages' routes: #uc, #uc/<id>, #arc, #arc/<id>, #review/uc, #review/arc,
// #spec and #spec/<queue>/<nn>; the routes' own names (#use-case/id=…, #decision, #module/id=…, #spec-entry/id=…, #requirement/name=…,
// #requirements/section=…, #draft/subject=…) are served as they are, since the pages' links use them.

const REVIEW_ROUTES = new Set(reviewPages.routes.map((route) => route.name));
const decoded = (part) => decodeURIComponent(part);

// The routes the address shows, each { name, params }, or null for an address that is no review address.
function reviewTargets(kind, a, b) {
  if (kind === "uc") return [{ name: "use-case", params: a ? { id: decoded(a) } : {} }];
  if (kind === "arc") {
    if (!a) return [{ name: "decision", params: {} }, { name: "module", params: {} }];
    return [{ name: decoded(a).startsWith("MOD-") ? "module" : "decision", params: { id: decoded(a) } }];
  }
  if (kind === "review") {
    if (a === "uc") return [{ name: "use-case", params: { id: "all" } }];
    if (a === "arc") return [{ name: "decision", params: { id: "all" } }];
    return [{ name: "use-case", params: {} }];
  }
  if (kind === "spec") return a && b ? [{ name: "spec-entry", params: { id: `spec-${decoded(a)}-${b}` } }] : [];
  if (REVIEW_ROUTES.has(kind)) return [{ name: kind, params: routeOf(location.hash).params }];
  return null;
}

// The host the review pages read through: the app's own. While a page is being loaded it hands the snapshot this load read, whose texts the
// batches brought, so that the page asks the server for neither the commit nor the tree again (A PAGE LOAD READS THE REPOSITORY IN BATCHES);
// a click after the load — a decision — reads the branch as it is then. Its repository information is read once. A commit it makes reads the new
// head, so that the next page shows it.
let pagesHosts = null; // { of, host }
let loading = 0; // pages being loaded
let written = null; // the snapshot read after a commit the pages made, until the page shown again has taken it
function pagesHost() {
  const real = currentHost();
  if (pagesHosts?.of === real) return pagesHosts.host;
  let info = null;
  // A refusal of the token by the server marks the token that was used, as every other view marks it (AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED).
  const noted = (call) => async (...given) => {
    try {
      return await call(...given);
    } catch (e) {
      throw noteRefusal(e);
    }
  };
  const host = Object.freeze({
    ...Object.fromEntries(Object.entries(real).map(([name, member]) => [name, typeof member === "function" ? noted(member) : member])),
    repositoryInfo: noted(() => (info ??= real.repositoryInfo().catch((e) => { info = null; throw e; }))),
    readSnapshot: noted(async (ref) => {
      if (ref === T.ref && snapshot && snapshotHost === real && (loading > 0 || written === snapshot)) {
        written = null;
        return snapshot;
      }
      return real.readSnapshot(ref);
    }),
    // The head a commit made is read once, for the app; the page shown again after it takes that read (the next one) and does not read it anew.
    commitFiles: noted(async (change) => {
      const made = await real.commitFiles(change);
      await loadSnapshot();
      written = snapshot;
      return made;
    }),
  });
  pagesHosts = { of: real, host };
  return host;
}

// The strategies of the review pages' kinds, registered with the job runner once under the owner of each set; a set the owner registered on an
// earlier load of the page counts as registered, as start.mjs counts it.
function registerReviewStrategies() {
  for (const [at, strategies] of reviewPages.strategies.entries()) {
    const owner = `MOD-review-pages#${at}`;
    try {
      registerStrategies(owner, strategies);
    } catch (e) {
      if (e.name !== "DuplicateStrategy" || e.owners[0] !== owner) throw e;
    }
  }
}

let strategiesRegistered = false;
// The ViewContext of the review pages for the product shown: the product is the instance itself when the address names the instance.
function reviewContext() {
  if (!strategiesRegistered) {
    registerReviewStrategies();
    strategiesRegistered = true;
  }
  const address = parseAddress(T.product.address);
  const shown = pagesHost();
  const isInstance = address.server === "github" && address.path === T.instance;
  return {
    page: "review",
    instance: { repository: T.instance, host: isInstance ? shown : connect(parseAddress(`https://github.com/${T.instance}`), { token: ghToken(), secrets: secrets() }) },
    product: isInstance ? null : { address: T.product.address, kind: address.server, host: shown, tokenStored: Boolean(token()) },
    store: openStore(T.instance),
    // The step that stores a product's token is this page's #add; any other route is written as the frame writes it.
    go(route, params = {}) {
      if (route === "add-product") location.hash = params.address ? `#add/${encodeURIComponent(params.address)}` : "#add";
      else location.hash = `#${[route, ...Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)].join("/")}`;
    },
  };
}

// Each route draws into an element of its own in <main>: a route that was left meanwhile draws into an element no longer there.
async function renderReviewPages(targets, lead = []) {
  const context = reviewContext();
  const boxes = targets.map(() => document.createElement("div"));
  main().replaceChildren(...lead, ...boxes);
  loading += 1;
  try {
    if (!targets.length) await renderSpecification(context);
    for (const [at, { name, params }] of targets.entries()) {
      await reviewPages.routes.find((route) => route.name === name).render(boxes[at], context, params);
      if (name === "module" && !params.id) await renderComponents(context);
    }
  } finally {
    loading -= 1;
  }
}

// The component diagram under the lists of the architecture (UC-025 step 5): MOD-trace-pages' route `trace` with its view `modules`, read through the same host.
async function renderComponents(context) {
  const box = document.createElement("div");
  main().append(box);
  await tracePages.routes.find((route) => route.name === "trace").render(box,
    { instance: { host: context.instance.host }, product: { host: (context.product ?? context.instance).host } }, { key: "modules", ref: T.ref });
}

// The specification browser under the open SPEC changes (MOD-trace-pages' route `trace`), read through the same host.
async function renderSpecification(context) {
  const box = document.createElement("div");
  main().append(box);
  await tracePages.routes.find((route) => route.name === "trace").render(box,
    { instance: { host: context.instance.host }, product: { host: (context.product ?? context.instance).host } }, { key: "specification", ref: T.ref });
}

// UC-014 step 6: while this browser holds no key for the instance, the start page opens with Finish setting up your instance.
function setupBanner() {
  const node = (name, className, ...children) => {
    const made = document.createElement(name);
    if (className) made.className = className;
    made.append(...children);
    return made;
  };
  const link = (className, href, text) => {
    const made = node("a", className, text);
    made.setAttribute("href", href);
    return made;
  };
  return node("section", "panel setup-banner", node("h3", null, "Finish setting up your instance"),
    node("p", null, "This browser has no key for ", node("strong", null, T.instance), " yet. Without one you can read and review; accepting and editing " +
      "then go through GitHub's own pages, and products cannot be added."),
    node("p", null, link("btn primary", "#setup", "Set up now"), " ", link("btn", "#settings", "Import settings"), " ",
      node("span", "muted small", "— from a file exported in another browser (Settings → Export settings).")));
}
const showsSetup = (kind, a) => (kind === "" || kind === "uc") && !a && !GITLAB && !ghToken();

// How acceptance works: the topic `accepting`, folded.
function renderHow() {
  const fold = explain("accepting", "How acceptance works");
  fold.open = true;
  main().replaceChildren(fold);
}

// ---------------------------------------------------------------- routing

// THE MENU FOLLOWS THE PROCESS: the site's menu, each entry leading to the first of its views whose file is built; the entry of
// the view shown is marked.
let available = null;
function markTab(kind) {
  // A route of the review pages named as it is (#use-case/…, #decision) is under the menu entry its route names.
  const entry = entryOf(kind || "uc") ?? reviewPages.routes.find((route) => route.name === kind)?.entry ?? null;
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
    loadProducts();
    renderProductSelector();
    if (state.commit && !a && ["", "uc", "arc", "spec", "backlog", "use-case", "decision", "module"].includes(kind || "")) await readAhead(kind || "");
    const reviewed = reviewTargets(kind, a, b);
    if (reviewed) {
      await renderReviewPages(reviewed, showsSetup(kind, a) ? [setupBanner()] : []);
    } else if (kind === "how") {
      renderHow();
    } else if (kind === "settings") {
      const settings = settingsPages.routes.find((r) => r.name === "settings");
      const settingsStore = openStore(T.instance);
      const address = parseAddress(T.product.address);
      await settings.render(main(), {
        instance: {
          repository: T.instance,
          host: connect(parseAddress(`https://github.com/${T.instance}`), { token: ghToken(), secrets: secrets() }),
        },
        product: { address: T.product.address, kind: address.server, host: connect(address, { token: store.tokenFor(T.product), secrets: secrets() }) },
        store: settingsStore,
        go(route, params = {}) {
          if (route === "add-product") location.hash = params.address ? `#add/${encodeURIComponent(params.address)}` : "#add";
          if (route === "endpoints") location.hash = params.name ? `#endpoints/${encodeURIComponent(params.name)}` : "#endpoints";
          if (route === "bridge") location.hash = "#bridge";
          if (route === "main") location.search = productHref(parseProductAddress(params.product)).slice(1);
        },
      }, {});
    } else if (kind === "add") {
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
    else if (kind === "endpoints") {
      const endpoints = settingsPages.routes.find((r) => r.name === "endpoints");
      await endpoints.render(main(), {
        instance: { repository: T.instance }, product: null, store: openStore(T.instance),
        go(route, params = {}) {
          if (route === "endpoints") location.hash = params.name ? `#endpoints/${encodeURIComponent(params.name)}` : "#endpoints";
          if (route === "bridge") location.hash = "#bridge";
        },
      }, { name: a ? decodeURIComponent(a) : "" });
    } else if (kind === "setup") {
      const setup = settingsPages.routes.find((r) => r.name === "setup");
      await setup.render(main(), {
        instance: { repository: T.instance }, product: null, store: openStore(T.instance),
        go(route) {
          if (route === "settings") location.hash = "#settings";
          if (route === "add-product") location.hash = "#add";
          if (route === "main") location.hash = "#uc";
        },
      }, {});
    } else if (kind === "bridge") {
      const bridge = settingsPages.routes.find((r) => r.name === "bridge");
      await bridge.render(main(), {
        instance: { repository: T.instance }, product: null, store: openStore(T.instance),
        go(route, params = {}) {
          if (route === "endpoints") location.hash = params.name ? `#endpoints/${encodeURIComponent(params.name)}` : "#endpoints";
          if (route === "bridge") location.hash = "#bridge";
        },
      }, {});
    } else {
      // A view by its name; an address no view answers — or a view whose file is not there yet — shows the use cases.
      const v = DASHBOARD.find((x) => x.view && x.view === kind);
      const views = v && built.has(v.file) ? await loadFile(v.file).catch((e) => { if (notThere(e)) return null; throw e; }) : null;
      if (views?.routes?.[v.view]) {
        linkStylesheet(views.stylesheet);
        await views.routes[v.view](app, a, b);
      } else {
        await renderReviewPages(reviewTargets("uc"), GITLAB || ghToken() ? [] : [setupBanner()]);
      }
    }
    // A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE · AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — on every view.
    showBanner();
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
  tokenNotices = noticePlace();
  currentHost();
  await retireFileTexts();
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
    if (early) return;
    main().innerHTML = loadErrorHtml({ error: e, product: T.product, ref: T.ref, hasToken: Boolean(token()), own: ownTokenOf(T.product) });
    addEventListener("hashchange", route);
    return;
  }
  if (!early) { addEventListener("hashchange", route); route(); }
}

if (globalThis.document) start();
