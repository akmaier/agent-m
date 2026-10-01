// Settings — every setting Agent M uses, on one page (SPEC §7, UC-042): what this browser keeps, what the product keeps in its
// repository, export and import, and clearing everything. Also the texts of the GitHub token that the setup and add-product
// steps show too — the prefilled link, the repository choice, the guidance — and the line about an expiring or refused token
// at the top of every view.
//
// Module: MOD-dashboard-app
//
// Route #settings. Every view function gets `app`, the page's context (dashboard-app.mjs); the texts and HTML builders above
// them are plain functions.

import { canStore, gitlabRole } from "../review-core.mjs";
import { savePseudonymisation, saveCollaborators, clickAuthority } from "./writes.mjs";
import {
  settingKeys, parseJson, sessionList, gitlabTokenMap, tokenTest, sessionTest, exportSettings, readSettingsFile, mergeSettings,
} from "../settings-store.mjs";
import {
  parseProductAddress, isGitLab, repositoryInfo, gitlabTokenPageUrl, tokenIdentity, tokenRefusal, requiredPermissions,
} from "../git-host.mjs";
import { jumpHostProblem, tunnelCommands, addRemoteSession, nextFreePort, probeLocalPort } from "../bridge-tunnel.mjs";
import {
  pseudonymisationOn, parseCollaborators, addCollaborator, removeCollaborator, PRODUCT_SETTINGS_PATH, COLLABORATORS_PATH,
} from "../pseudonymiser.mjs";

export const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const esc = h;
export const today = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- settings texts (SPEC §7)

export function sharedOriginNotice(owner) {
  return `Everything Agent M stores in this browser is stored for the address https://${owner}.github.io — ` +
    `not only for this instance. Every other GitHub Pages site of ${owner} is served from the same address ` +
    `and can read it, including any script those sites load. If that is not acceptable, run your instance ` +
    `under a GitHub owner (account or organisation) that has no other Pages sites.`;
}

// ONE GITHUB TOKEN SERVES EVERY FEATURE: the token's permissions from the one list of MOD-git-host, each as the person reads it
// on GitHub's page — "Contents: read and write", "Metadata: read".
export const GITHUB_PERMISSIONS = requiredPermissions("github.com").github;
export const permissionLabel = (p) => `${p.permission}: ${p.access === "read" ? "read" : "read and write"}`;
const permissionLabels = () => GITHUB_PERMISSIONS.map(permissionLabel).join(", ");

export const TOKEN_GUIDANCE = `A fine-grained personal access token is a key you create on GitHub. It lets this page act for you
in exactly the repositories you choose, and nowhere else.
— Repository access: Only select repositories — this instance and the products it manages, nothing else.
— Permissions (one token serves every feature, so you create only one):
${GITHUB_PERMISSIONS.map((p) => `  ${permissionLabel(p)} — ${p.why}.`).join("\n")}
— Expiration: 90 days is preset; GitHub mails you before it expires, and you can renew it.
Why this scope: these permissions are what Agent M's features need, and nothing more is asked for; the repository
choice keeps them to this instance and the products you add.
Where the token goes: only to https://api.github.com, as an Authorization header. Never to the model endpoint,
never into a URL, never into a repository.`;

// ---------------------------------------------------------------- guided token setup (SPEC §7)

// The prefilled link's expiry; the date a token is stored with is preset to it (A TOKEN'S EXPIRY IS WARNED OF
// IN ADVANCE).
export const TOKEN_DAYS = 90;

export function tokenLinkUrl(instance) {
  const q = new URLSearchParams({
    name: `Agent M · ${instance}`,
    description: `Agent M dashboard of ${instance}: commits, issues, pull requests and runs of the work you start.`,
    expires_in: String(TOKEN_DAYS),
    // ONE GITHUB TOKEN SERVES EVERY FEATURE: the parameters of the one list (requiredPermissions, git-host.mjs).
    ...Object.fromEntries(GITHUB_PERMISSIONS.map((p) => [p.param, p.access])),
  });
  return `https://github.com/settings/personal-access-tokens/new?${q}`;
}

export function repositoryChoiceSteps(instance, product) {
  const repos = [...new Set([instance, product].filter(Boolean))];
  return [
    "Under “Repository access”, choose “Only select repositories”. GitHub preselects “All repositories”, " +
      "which would give Agent M write access to everything you own.",
    `Open “Select repositories” and pick ${repos.map((r) => `“${r}”`).join(" and ")} — nothing else.`,
    `Leave the permissions as they are (${permissionLabels()}), scroll down and press “Generate token”.`,
    "Copy the token GitHub now shows — it starts with github_pat_ and is shown only once.",
  ];
}

// ---------------------------------------------------------------- settings in one place (UC-042, SPEC §7)
//
// EVERY SETTING IS REACHED FROM ONE PAGE: the browser section of the settings page is this HTML, one
// row per setting, each key of settings-store.mjs with its place (data-setting-key). The page inserts
// it as it is, so tests/test_settings_page.py checks what the person sees.

const K_TOKEN = "agent-m.github-token", K_EXPIRES = "agent-m.github-token-expires", K_PRODUCTS = "agent-m.products";
const K_TESTED = "agent-m.github-token-tested";
const K_GITLAB = "agent-m.gitlab-tokens";
const K_JUMP = "agent-m.jump-host", K_SESSIONS = "agent-m.remote-sessions";

export const EXPIRY_WARN_DAYS = 14;
const DAY = 864e5;
const isoDay = (d) => d.toISOString().slice(0, 10);

export function defaultExpiry(now = new Date()) {
  return isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + TOKEN_DAYS * DAY));
}

function daysUntil(date, now) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  if (!m) return null;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((Date.UTC(+m[1], +m[2] - 1, +m[3]) - today) / DAY);
}

// A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE: from fourteen days before the date recorded with the token.
export function expiryWarning(expires, now = new Date(), product = null) {
  const days = daysUntil(expires, now);
  if (days === null || days > EXPIRY_WARN_DAYS) return null;
  const expired = days < 0, id = tokenIdentity(product);
  return { days, expired, renewUrl: id.renewUrl, renew: id.renew,
    text: expired ? `Your ${id.token} expired on ${expires}.`
      : `Your ${id.token} expires on ${expires} (${days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}).` };
}

// The line shown at the top of every view while the token is refused or expires within fourteen days.
export function tokenBannerHtml({ expires, refused = false, now = new Date(), product = null }) {
  const r = refused ? tokenRefusal({ status: 401 }, product) : expiryWarning(expires, now, product);
  if (!r) return "";
  return `<section class="panel notice token-banner"><p><strong>${esc(r.text)}</strong>
    <a class="btn small" href="${esc(r.renewUrl)}" target="_blank" rel="noopener">Renew ↗</a></p>
    <p class="small">${esc(r.renew)}</p></section>`;
}

// A STORED SECRET IS HIDDEN UNTIL SHOWN: a password field; Show re-renders it as text, in full.
export function secretFieldHtml({ key, value, shown = false, label }) {
  return `<input class="secret" type="${shown ? "text" : "password"}" readonly value="${esc(value)}" aria-label="${esc(label)}"
      autocomplete="off" spellcheck="false"> <button class="btn small" data-show="${esc(key)}">${shown ? "Hide" : "Show"}</button>`;
}

// UC-042 step 1: the state of a token's line — its last test (tokenTest of MOD-settings-store), kept in this browser beside it.
function tokenStateLine(token, expires, tested, now, server = "GitHub") {
  if (!token) return "— not set";
  if (tested?.refused) return `✗ refused — ${esc(server)} did not accept it at the last use`;
  const w = expiryWarning(expires, now);
  if (w) return `⚠ ${w.expired ? "expired on" : "expires on"} ${esc(expires)}`;
  if (tested?.ok) return `✓ works — tested ${esc(tested.ok)}`;
  return "stored — not tested on this page yet";
}

// The browser section: one row per setting, each with Test and Clear (A BROWSER SETTING IS TESTED AND
// CLEARED WHERE IT IS SHOWN). entries: { key: raw value } from the store — each setting's last test among them, kept beside it
// (UC-042 step 1); shown: keys revealed by Show.
export function browserSettingsHtml({ entries = {}, shown = [], now = new Date() }) {
  const token = entries[K_TOKEN] || null, expires = entries[K_EXPIRES] || null, tested = tokenTest(parseJson(entries[K_TESTED], null));
  let products = [];
  try { products = JSON.parse(entries[K_PRODUCTS] || "[]"); } catch { products = []; }
  if (!Array.isArray(products)) products = [];
  const tokenRow = `<div class="setting" data-setting-row="github-token">
    <h4 data-setting-key="${K_TOKEN}">GitHub token</h4>
    <p class="state">${tokenStateLine(token, expires, tested, now)}</p>
    ${token ? `<p>${secretFieldHtml({ key: K_TOKEN, value: token, shown: shown.includes(K_TOKEN), label: "Stored GitHub token" })}</p>` : ""}
    <p data-setting-key="${K_EXPIRES}">Expires on: <strong>${expires ? esc(expires) : "—"}</strong>
      <span class="muted small">— the date entered when the token was stored; the dashboard warns ${EXPIRY_WARN_DAYS} days before.</span></p>
    <p data-setting-key="${K_TESTED}"><button class="btn" data-test="${K_TOKEN}" ${token ? "" : "disabled"}>Test</button>
      <button class="btn" data-change="${K_TOKEN}">${token ? "Change" : "Store a token"}</button>
      <button class="btn" data-clear="${K_TOKEN}" ${token ? "" : "disabled"}>Clear</button></p>
    <p class="result muted" data-result="${K_TOKEN}"></p>
    <details class="explain"><summary>What is this?</summary><div>The key that lets this page commit, open issues and start
      runs for you in the repositories you gave it. Kept in this browser's <code>localStorage</code>, sent only to
      https://api.github.com as a header. <em>Test</em> reads your instance with it; its answer — or GitHub's refusal at the
      token's last use — is kept beside the token, so this line shows it after a reload too. <em>Clear</em> removes the token, its
      date and its last test from this browser — accepting and editing then go through GitHub's own pages, products cannot be
      added, and private repositories cannot be read.</div></details>
  </div><!--/setting-->`;
  const productRow = `<div class="setting" data-setting-row="products">
    <h4 data-setting-key="${K_PRODUCTS}">Products</h4>
    <p class="state">${products.length ? `${products.length} in this browser` : "— not set"}</p>
    ${products.length ? `<ul class="names">${products.map((a) => `<li>${esc(a)}
      <button class="btn small" data-remove-product="${esc(a)}">Remove</button></li>`).join("")}</ul>` : ""}
    <p><button class="btn" data-test="${K_PRODUCTS}" ${products.length && token ? "" : "disabled"}>Test</button>
      <button class="btn" data-clear="${K_PRODUCTS}" ${products.length ? "" : "disabled"}>Clear</button></p>
    <p class="result muted" data-result="${K_PRODUCTS}"></p>
    <details class="explain"><summary>What is this?</summary><div>The addresses of the products this dashboard manages, kept
      in this browser only — the instance repository names none. <em>Test</em> checks that your token reaches each;
      <em>Remove</em> and <em>Clear</em> take them off this browser's list and change nothing in their repositories. A GitLab
      product's project token goes with it.</div></details>
  </div><!--/setting-->`;
  // A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN: one line per token, hidden with Show, Test, Change, Clear, and the
  // project's Access tokens page, where it is renewed (AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED).
  const gl = gitlabTokenMap(entries[K_GITLAB]);
  const lines = Object.entries(gl).map(([a, t]) => {
    const p = parseProductAddress(a), ok = !p.error && isGitLab(p), showKey = `${K_GITLAB} ${a}`;
    const st = t.tested;
    const w = ok ? expiryWarning(t.expires, now, p) : null;
    const state = st?.refused ? `✗ refused — ${esc(ok ? p.host : "the server")} did not accept it at the last use`
      : w ? `⚠ ${w.expired ? "expired on" : "expires on"} ${esc(t.expires)}` : st?.ok ? `✓ works — tested ${esc(st.ok)}` : "stored — not tested on this page yet";
    return `<div class="gitlab-token">
      <p><strong>${esc(a)}</strong> — <span class="state">${state}</span></p>
      <p>${secretFieldHtml({ key: showKey, value: t.token, shown: shown.includes(showKey), label: `Stored GitLab project token for ${a}` })}</p>
      <p>Expires on: <strong>${t.expires ? esc(t.expires) : "—"}</strong></p>
      <p><button class="btn" data-test-gitlab="${esc(a)}">Test</button>
        <button class="btn" data-change-gitlab="${esc(a)}">Change</button>
        <button class="btn" data-clear-gitlab="${esc(a)}">Clear</button>
        ${ok ? `<a class="btn small" href="${esc(gitlabTokenPageUrl(p))}" target="_blank" rel="noopener">Access tokens page ↗</a>` : ""}</p>
      <div class="gitlab-change" data-change-form="${esc(a)}"></div>
      <p class="result muted" data-result-gitlab="${esc(a)}"></p>
    </div>`;
  }).join("");
  const n = Object.keys(gl).length;
  const gitlabRow = `<div class="setting" data-setting-row="gitlab-tokens">
    <h4 data-setting-key="${K_GITLAB}">GitLab project tokens</h4>
    <p class="state">${n ? `${n} in this browser — one per GitLab product` : "— not set"}</p>
    ${lines}
    <p><button class="btn" data-test="${K_GITLAB}" ${n ? "" : "disabled"}>Test all</button>
      <button class="btn" data-clear="${K_GITLAB}" ${n ? "" : "disabled"}>Clear all</button></p>
    <p class="result muted" data-result="${K_GITLAB}"></p>
    <details class="explain"><summary>What is this?</summary><div>Each GitLab product has its own project access token, created on
      that project's Settings → Access tokens page with role Maintainer and scope api (<em>+ Add product</em> guides you). Kept in this
      browser's <code>localStorage</code> under the product's address and sent only to that project's API on its own server, as a
      header — never to GitHub, another GitLab or the model endpoint. <em>Test</em> reads the project with it; <em>Clear</em> removes it
      from this browser — the product can then still be read if it is public, but not accepted in or edited. A token is renewed by
      <em>Rotate</em> on the project's Access tokens page.</div></details>
  </div><!--/setting-->`;
  // THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS · THE DASHBOARD WRITES THE TUNNEL COMMANDS (UC-011 1c, UC-042).
  const jump = parseJson(entries[K_JUMP], null), jumpBad = jump ? jumpHostProblem(jump) : "not set";
  const jumpRow = `<div class="setting" data-setting-row="jump-host">
    <h4 data-setting-key="${K_JUMP}">Jump host</h4>
    <p class="state">${jump ? (jumpBad ? `✗ ${esc(jumpBad)}` : `${esc(jump.user)}@${esc(jump.host)} — ports ${esc(jump.portFrom)}–${esc(jump.portTo)}`)
      : "— not set"}</p>
    ${jump ? `<p class="small">SSH key file on the machine behind NAT: <code>${esc(jump.reverseKey || "ssh's default")}</code> · on your
      machine: <code>${esc(jump.forwardKey || "ssh's default")}</code></p>` : ""}
    <p><button class="btn" data-test="${K_JUMP}" ${jump ? "" : "disabled"}>Test</button>
      <button class="btn" data-change="${K_JUMP}">${jump ? "Change" : "Set the jump host"}</button>
      <button class="btn" data-clear="${K_JUMP}" ${jump ? "" : "disabled"}>Clear</button></p>
    <div class="jump-form" data-jump-form></div>
    <p class="result muted" data-result="${K_JUMP}"></p>
    <details class="explain"><summary>What is this?</summary><div>A machine behind NAT accepts no incoming connection, so its CLI
      session is reached through a host that both your machine and that one can reach by SSH — the <em>jump host</em>. Here you
      name it, the SSH user, the port range the sessions may use there, and which key file each machine uses (its name only: the
      keys stay in <code>~/.ssh</code> of the two machines, a web page cannot use them). Kept in this browser's
      <code>localStorage</code>. <em>Test</em> checks the settings and asks each session's local port whether the tunnel is up — a
      web page cannot open SSH itself; <em>Clear</em> removes the jump host, and no command can be written until it is set again.</div></details>
  </div><!--/setting-->`;
  const sessions = sessionList(entries[K_SESSIONS]);
  const sessionLines = sessions.map((s) => {
    let cmds = null;
    try { cmds = jump && !jumpBad ? tunnelCommands(jump, s) : null; } catch { cmds = null; }
    const showKey = `${K_SESSIONS} ${s.name}`, st = sessionTest(s.tested);
    const state = st?.up ? `✓ something answered at localhost:${esc(s.port)} — tested ${esc(st.up)}`
      : st?.down ? `✗ nothing answered at localhost:${esc(s.port)} — start both commands` : "not tested on this page yet";
    const copy = (c) => `<pre class="cmd">${esc(c)}</pre><button class="btn small" data-copy="${esc(c)}">Copy</button>`;
    return `<div class="remote-session">
      <p><strong>${esc(s.name)}</strong> — port ${esc(s.port)} on the jump host · bridge port ${esc(s.bridgePort)} · <span class="state">${state}</span></p>
      <p>Bridge token: ${s.token ? secretFieldHtml({ key: showKey, value: s.token, shown: shown.includes(showKey), label: `Bridge token of ${s.name}` })
        : "— none stored"}</p>
      ${cmds ? `<p>1. On the machine behind NAT — keep it running, e.g. as a service or under <code>autossh</code>:</p>${copy(cmds.reverse)}
      <p>2. On your machine:</p>${copy(cmds.forward)}
      <p>3. The dashboard then reaches this session at <code>${esc(cmds.url)}</code>.</p>`
        : `<p class="warn">No commands: set the jump host above first.</p>`}
      <p><button class="btn" data-test-session="${esc(s.name)}">Test</button>
        <button class="btn" data-clear-session="${esc(s.name)}">Clear</button></p>
      <p class="result muted" data-result-session="${esc(s.name)}"></p>
    </div>`;
  }).join("");
  const sessionsRow = `<div class="setting" data-setting-row="remote-sessions">
    <h4 data-setting-key="${K_SESSIONS}">Remote sessions</h4>
    <p class="state">${sessions.length ? `${sessions.length} in this browser` : "— not set"}</p>
    ${sessionLines}
    <p><button class="btn" data-add-session ${jump && !jumpBad ? "" : "disabled"}>+ Remote session</button>
      <button class="btn" data-test="${K_SESSIONS}" ${sessions.length ? "" : "disabled"}>Test all</button>
      <button class="btn" data-clear="${K_SESSIONS}" ${sessions.length ? "" : "disabled"}>Clear all</button></p>
    <div class="session-form" data-session-form></div>
    <p class="result muted" data-result="${K_SESSIONS}"></p>
    <details class="explain"><summary>What is this?</summary><div>One line per CLI session on a machine behind NAT. Each gets its own
      port from the jump host's range — the lowest free one unless you choose — and keeps the token its bridge printed when it was
      paired. The two commands are written from these settings: the <em>reverse tunnel</em> runs on the machine behind NAT and opens
      the port on the jump host's loopback address only (<code>127.0.0.1</code>), so only someone who can log in there reaches it; the
      <em>forward</em> runs on your machine and brings that port to <code>localhost</code>. The bridge token is kept in this browser's
      <code>localStorage</code>, hidden until <em>Show</em>, and is in no command. <em>Test</em> asks whether anything answers at the
      session's local port; <em>Clear</em> removes the session and its token from this browser.</div></details>
  </div><!--/setting-->`;
  return tokenRow + productRow + gitlabRow + jumpRow + sessionsRow;
}

// ---------------------------------------------------------------- export and import (UC-042 6, UC-014 7a)

export const PASSPHRASE_NOTICE = "A forgotten passphrase cannot be recovered: without it, nobody — you included — can read the file.";

// AN EXPORT STATES THAT IT CONTAINS SECRETS: each stored secret by name, and what it grants.
export function exportNotice(entries = {}) {
  const secrets = settingKeys.filter((s) => s.secret && entries[s.key]);
  const what = secrets.length ? secrets.map((s) => `your ${s.label}, which ${s.grants}`).join("; ") : "no token, key or password (none is stored)";
  return `The file contains every setting of this browser in full, including ${what}. It opens all of that to ` +
    `whoever holds the file — keep it like a password, or lock it with a passphrase.`;
}

// SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS — shown before the switch can be saved.
export function pseudonymisationOffNotice({ repo, isPublic, server = "GitHub" }) {
  return `With pseudonymisation off, report data from mails — the names, addresses and other details of the people ` +
    `who write — enters the issues and the repository of ${repo} unchanged. This is advisable only on a protected, ` +
    `non-public data space. Issue texts themselves stay neutral either way.` +
    (isPublic ? ` ${server} reports ${repo} as public: the data will be published — anyone on the internet can read it.` : "");
}

export const PSEUDONYMISATION_ON_NOTE = "Data written while pseudonymisation was off stays in the repository's history; removing it " +
  "needs a rewrite of that history.";

// What the setting does (REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS, A REWRITTEN TEXT IS CHECKED BY THREE LLMS,
// NO CHECKER IS THE REWRITER, PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF) — the setting's folded explanation.
export const PSEUDONYMISATION_EXPLANATION = "With pseudonymisation on — the default — attachments, logs, error messages, the text of " +
  "screenshots and data files from mails reach this product's issues and repository only as a participant's rewriting that " +
  "mentions no person and keeps the technical content: “the user's home folder” instead of a path with a user name. Before it " +
  "is written, three LLM participants with three different models — none of them the one that rewrote it — each check the " +
  "rewriting for any mention of a person; one finding is enough to send it back. Switch it off only where the repository is a " +
  "protected, non-public data space.";

// The page: its head, the notice before anything is stored, then its sections in the order of the dashboard's table (DASHBOARD in
// dashboard-app.mjs). A section built in is written here; one of its own file is shown only when that file is there.
// The sections of their own file that are there, per page: found when the settings page is first opened.
const sectionsThere = new WeakMap();
async function findSections(app) {
  if (!sectionsThere.has(app)) {
    const own = app.DASHBOARD.filter((x) => x.section && !x.builtIn);
    const there = await Promise.all(own.map((x) => app.present(x.file)));
    sectionsThere.set(app, own.filter((_, i) => there[i]));
  }
  return sectionsThere.get(app);
}

function viewSettings(app) {
  const { T, store, main } = app;
  const ghToken = app.ghToken;
  const owner = T.instance.split("/")[0];
  const stored = ghToken();
  const head = `
    <section class="head"><h2>Settings</h2>
      <p class="muted">Every setting Agent M uses: what this browser keeps, what the product <strong>${h(T.repo)}</strong>
      keeps in its repository, and a file to move this browser's settings to another one.</p></section>
    <section class="panel notice">
      <h3>Before you store anything</h3>
      <p>${h(sharedOriginNotice(owner))}</p>
      <label><input type="checkbox" id="ack"> I have read this.</label>
    </section>`;
  const builtIn = {
    browser: `
    <section class="panel">
      <h3>This browser</h3>
      <div id="browser-settings"></div>
      <div id="token-change" ${stored ? "hidden" : ""}>
        <h4>${stored ? "Change the GitHub token" : "Store a GitHub token"}</h4>
        <p><a class="btn" href="${h(tokenLinkUrl(T.instance))}" target="_blank" rel="noopener">Open GitHub's token page (prefilled) ↗</a></p>
        <ol class="choices">${repositoryChoiceSteps(T.instance, null).map((x) => `<li>${h(x)}</li>`).join("")}</ol>
        <details class="explain"><summary>What is this?</summary><pre class="guidance">${h(TOKEN_GUIDANCE)}</pre></details>
        <p><input type="password" id="token-input" autocomplete="off" spellcheck="false" disabled
          placeholder="github_pat_…" aria-label="GitHub token"></p>
        <p><label>Expires on <input type="date" id="token-expires" value="${h(defaultExpiry())}" disabled></label>
          <span class="muted small">Preset to the ${TOKEN_DAYS} days of the prefilled link — correct it if you chose another date on GitHub.
          The dashboard warns ${EXPIRY_WARN_DAYS} days before.</span></p>
        <p><button class="btn primary" id="token-save" disabled>Store token</button></p>
      </div>
      <p id="token-msg" class="muted"></p>
      <details class="explain"><summary>What is this?</summary><div>These settings belong to you on this computer. They are kept
        in this browser's <code>localStorage</code> only — never in a cookie, an address or a repository — and every other
        GitHub Pages site of ${h(owner)} can read them. <em>Clear</em> removes an entry from the browser's storage itself.</div></details>
    </section>`,
    product: `
    <section class="panel" id="product-settings"><h3>Product · ${h(T.product.address)}</h3><p class="muted">Reading its settings…</p></section>`,
    export: `
    <section class="panel">
      <h3>Export and import</h3>
      <p class="notice">${h(exportNotice(store.entries()))}</p>
      <p><label>Passphrase (optional) <input type="password" id="export-pass" autocomplete="new-password"></label>
        <label>Repeat it <input type="password" id="export-pass2" autocomplete="new-password"></label></p>
      <p class="muted small">${h(PASSPHRASE_NOTICE)}</p>
      <p><button class="btn primary" id="export-go">Export settings</button></p>
      <p><label>Settings file <input type="file" id="import-file" accept=".json,application/json"></label>
        <label>Passphrase, if the file is locked <input type="password" id="import-pass" autocomplete="off"></label></p>
      <p><button class="btn" id="import-go" disabled>Import settings</button>
        <span class="muted small">Tick “I have read this” at the top first — an import stores tokens in this browser.</span></p>
      <p id="io-msg" class="muted"></p>
      <details class="explain"><summary>What is this?</summary><div><em>Export</em> saves one file, on this computer only, with
        everything listed under “This browser” — the token itself included — so that another browser is set up by one
        <em>Import</em>. Agent M writes the file to no repository and puts it in no address. Locked with a passphrase, it is
        encrypted in this browser (PBKDF2 and AES-GCM of the Web Crypto API). An import keeps what this browser already has and
        adds only what is missing, and lists both.</div></details>
    </section>`,
    clear: `
    <section class="panel">
      <h3>Clear everything in this browser</h3>
      <p><button class="btn" id="token-clear">Clear everything Agent M stored</button></p>
      <details class="explain"><summary>What is this?</summary><div>Removes the GitHub token, its date, the product list, every
        GitLab project token, the jump host and the remote sessions with their bridge tokens from this browser's storage, and the
        texts of repository files this page kept so as not to read them again. Nothing in any repository changes.</div></details>
    </section>`,
  };
  const own = sectionsThere.get(app) || [];
  const sections = app.DASHBOARD.filter((x) => x.section && (x.builtIn || own.includes(x)));
  main().innerHTML = head + sections.map((x) => (x.builtIn ? builtIn[x.section]
    : `\n    <section class="panel" data-settings-section="${h(x.section)}"></section>`)).join("");
  renderBrowserSettings(app);
  wireSettings(app);
  loadProductSettings(app);
  renderSections(app, own);
}

// A section of its own file: its module's renderSection(app, box) fills its place.
async function renderSections(app, sections) {
  for (const x of sections) {
    const box = app.main().querySelector(`[data-settings-section="${x.section}"]`);
    if (box) await (await app.loadFile(x.file)).renderSection(app, box);
  }
}

export function renderBrowserSettings(app) {
  const { T, store, state, shownSecrets, showBanner, noteRefusal, errorText, loadProducts, renderProductSelector } = app;
  const ghToken = app.ghToken;
  const box = document.getElementById("browser-settings");
  box.innerHTML = browserSettingsHtml({ entries: store.entries(), shown: [...shownSecrets] });
  const say = (key, text) => { box.querySelector(`[data-result="${key}"]`).textContent = text; };
  wireRemoteSettings(app, box, say);
  box.querySelectorAll("[data-show]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.show;
    if (shownSecrets.has(k)) shownSecrets.delete(k); else shownSecrets.add(k);
    renderBrowserSettings(app);
  }));
  box.querySelectorAll('[data-change="agent-m.github-token"]').forEach((b) => b.addEventListener("click", () => {
    document.getElementById("token-change").hidden = false;
    document.getElementById("ack").focus();
  }));
  box.querySelector(`[data-test="agent-m.github-token"]`)?.addEventListener("click", async () => {
    say("agent-m.github-token", `Reading ${T.instance}…`);
    try {
      await repositoryInfo({ product: githubRepository(T.instance), token: ghToken() });
      store.setTokenTest({ ok: today() });
      showBanner();
      renderBrowserSettings(app);
      say("agent-m.github-token", `GitHub accepted the token: it can read ${T.instance}.`);
    } catch (e) {
      noteRefusal(e, null);
      renderBrowserSettings(app);
      say("agent-m.github-token", app.rateLimitText(e, null) || `The token cannot read ${T.instance}: ${errorText(e, null)}`);
    }
  });
  box.querySelector(`[data-test="agent-m.products"]`)?.addEventListener("click", async () => {
    say("agent-m.products", "Checking each product…");
    const res = await Promise.all(state.products.map(async (p) => [p.address, await reachOf(app, p)]));
    box.querySelector(`[data-result="agent-m.products"]`).innerHTML = res.map(reachLine).join("<br>");
  });
  // GitLab project tokens (UC-042): Test reads the project with its own token; Change stores a new value with its
  // expiry date, after the notice at the top; Clear removes it from this browser.
  const glSay = (a, text) => { const el = [...box.querySelectorAll("[data-result-gitlab]")].find((x) => x.dataset.resultGitlab === a); if (el) el.textContent = text; };
  const testGitLab = async (a) => {
    const p = parseProductAddress(a);
    if (p.error || !isGitLab(p)) return `${a}: ${p.error || "not a GitLab address"}`;
    const x = await checkGitLab(app, p, store.getGitLabToken(a)?.token);
    if (x.ok) store.setGitLabTokenTest(a, { ok: today() });
    return reachLine([a, x]).replace(/<[^>]+>/g, "");
  };
  box.querySelectorAll("[data-test-gitlab]").forEach((b) => b.addEventListener("click", async () => {
    const a = b.dataset.testGitlab;
    glSay(a, `Reading ${a}…`);
    const line = await testGitLab(a);
    showBanner();
    renderBrowserSettings(app);
    glSay(a, line);
  }));
  box.querySelector(`[data-test="agent-m.gitlab-tokens"]`)?.addEventListener("click", async () => {
    say("agent-m.gitlab-tokens", "Checking each GitLab project token…");
    const lines = await Promise.all(Object.keys(store.gitLabTokens()).map(testGitLab));
    showBanner();
    renderBrowserSettings(app);
    say("agent-m.gitlab-tokens", lines.join(" · "));
  });
  box.querySelectorAll("[data-change-gitlab]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.changeGitlab, form = [...box.querySelectorAll("[data-change-form]")].find((x) => x.dataset.changeForm === a);
    if (!document.getElementById("ack").checked) { glSay(a, "Tick “I have read this” at the top of the page first."); document.getElementById("ack").focus(); return; }
    form.innerHTML = `<p><input type="password" data-gl-token autocomplete="off" spellcheck="false" placeholder="glpat-…" aria-label="New GitLab project token for ${h(a)}">
      <label>Expires on <input type="date" data-gl-expires value="${h(defaultExpiry())}"></label>
      <button class="btn primary" data-gl-store>Store</button></p>
      <p class="muted small">The expiry date GitLab showed for the token. The dashboard warns ${EXPIRY_WARN_DAYS} days before.</p>`;
    form.querySelector("[data-gl-store]").addEventListener("click", () => {
      const v = form.querySelector("[data-gl-token]").value.trim(), exp = form.querySelector("[data-gl-expires]").value;
      const bad = gitlabTokenProblem(v, exp);
      if (bad) { glSay(a, bad); return; }
      store.setGitLabToken(a, v, exp);
      showBanner();
      renderBrowserSettings(app);
      glSay(a, "Stored. Press Test to check it.");
    });
  }));
  box.querySelectorAll("[data-clear-gitlab]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.clearGitlab;
    if (!confirm(`Clear the GitLab project token for ${a} from this browser? Without it, that product can be read only if it is public, and nothing can be accepted or saved in it.`)) return;
    store.clearGitLabToken(a);
    shownSecrets.delete(`agent-m.gitlab-tokens ${a}`);
    showBanner();
    renderBrowserSettings(app);
  }));
  box.querySelector(`[data-clear="agent-m.gitlab-tokens"]`)?.addEventListener("click", () => {
    if (!confirm("Clear every GitLab project token from this browser? GitLab products can then be read only if they are public, and nothing can be accepted or saved in them.")) return;
    for (const a of Object.keys(store.gitLabTokens())) store.clearGitLabToken(a);
    showBanner();
    renderBrowserSettings(app);
  });
  box.querySelector(`[data-clear="agent-m.github-token"]`)?.addEventListener("click", () => {
    if (!confirm("Clear the GitHub token from this browser? Without it, accepting and editing go through GitHub's own pages, " +
      "products cannot be added, and private repositories cannot be read.")) return;
    store.clearToken();
    shownSecrets.clear();
    showBanner();
    viewSettings(app);
    document.getElementById("token-msg").textContent = ghToken() ? "Clearing failed — the token is still stored." : "The token is gone from this browser.";
  });
  box.querySelector(`[data-clear="agent-m.products"]`)?.addEventListener("click", () => {
    if (!confirm("Clear the product list of this browser, with the GitLab products' project tokens? The products' repositories do not change; add them again to see them here.")) return;
    store.clearProducts();
    loadProducts();
    renderProductSelector();
    renderBrowserSettings(app);
  });
  box.querySelectorAll("[data-remove-product]").forEach((b) => b.addEventListener("click", () => {
    if (!confirm(`Remove ${b.dataset.removeProduct} from this browser's list${store.getGitLabToken(b.dataset.removeProduct) ? ", with its project token" : ""}? Its repository does not change.`)) return;
    store.removeProduct(b.dataset.removeProduct);
    loadProducts();
    renderProductSelector();
    renderBrowserSettings(app);
  }));
}

// THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS: set, tested, cleared here; the commands are copied from the page
// (THE DASHBOARD WRITES THE TUNNEL COMMANDS). A web page cannot open SSH: Test asks each session's local port whether the
// forward, and through it the reverse tunnel, answers.
function wireRemoteSettings(app, box, say) {
  const { store, shownSecrets } = app;
  const J = "agent-m.jump-host", R = "agent-m.remote-sessions";
  const one = (attr, v) => [...box.querySelectorAll(`[${attr}]`)].find((x) => x.getAttribute(attr) === v);
  const sessionSay = (name, text) => { const el = one("data-result-session", name); if (el) el.textContent = text; };
  box.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    await navigator.clipboard.writeText(b.dataset.copy);
    b.textContent = "Copied ✓";
  }));
  const testSession = async (sess) => {
    const up = await probeLocalPort(sess.port);
    store.setRemoteSessionTest(sess.name, up ? { up: today() } : { down: true });
    return up ? `${sess.name}: something answers at localhost:${sess.port} — the tunnel is up.`
      : `${sess.name}: nothing answers at localhost:${sess.port} — start the reverse tunnel on the machine behind NAT and the forward here.`;
  };
  box.querySelector(`[data-change="${J}"]`)?.addEventListener("click", () => {
    const j = store.getJumpHost() || {}, form = box.querySelector("[data-jump-form]");
    const v = (k, d = "") => h(j[k] ?? d);
    form.innerHTML = `<p><label>Host name <input data-j="host" value="${v("host")}" placeholder="jump.example.org" spellcheck="false"></label>
      <label>SSH user <input data-j="user" value="${v("user")}" placeholder="agentm" spellcheck="false"></label></p>
      <p><label>Ports from <input data-j="portFrom" type="number" value="${v("portFrom", 20001)}"></label>
      <label>to <input data-j="portTo" type="number" value="${v("portTo", 20010)}"></label></p>
      <p><label>Key file on the machine behind NAT <input data-j="reverseKey" value="${v("reverseKey")}" placeholder="~/.ssh/id_ed25519" spellcheck="false"></label>
      <label>Key file on your machine <input data-j="forwardKey" value="${v("forwardKey")}" placeholder="~/.ssh/id_ed25519" spellcheck="false"></label></p>
      <p class="muted small">The names of the key files only — the keys stay in <code>~/.ssh</code>. Empty: ssh uses its default key.</p>
      <p><button class="btn primary" data-jump-save>Store</button></p>`;
    form.querySelector("[data-jump-save]").addEventListener("click", () => {
      const get = (k) => form.querySelector(`[data-j="${k}"]`).value.trim();
      const next = { host: get("host"), user: get("user"), portFrom: Number(get("portFrom")), portTo: Number(get("portTo")),
        reverseKey: get("reverseKey"), forwardKey: get("forwardKey") };
      const bad = jumpHostProblem(next);
      if (bad) { say(J, bad); return; }
      const outside = store.getRemoteSessions().filter((x) => x.port < next.portFrom || x.port > next.portTo);
      if (outside.length) { say(J, `The range must keep the ports of ${outside.map((x) => `${x.name} (${x.port})`).join(", ")} — or clear those sessions first.`); return; }
      store.setJumpHost(next);
      renderBrowserSettings(app);
      say(J, "Stored. The commands below are written from it.");
    });
  });
  box.querySelector(`[data-clear="${J}"]`)?.addEventListener("click", () => {
    if (!confirm("Clear the jump host from this browser? The remote sessions stay, but no tunnel command can be written until it is set again.")) return;
    store.clearJumpHost();
    renderBrowserSettings(app);
  });
  box.querySelector(`[data-test="${J}"]`)?.addEventListener("click", async () => {
    const bad = jumpHostProblem(store.getJumpHost());
    if (bad) { say(J, bad); return; }
    const list = store.getRemoteSessions();
    say(J, list.length ? "Asking each session's local port…" : "The settings are complete. Add a remote session to test a tunnel.");
    if (!list.length) return;
    const lines = [];
    for (const x of list) lines.push(await testSession(x));
    renderBrowserSettings(app);
    say(J, `The settings are complete. ${lines.join(" ")}`);
  });
  box.querySelector("[data-add-session]")?.addEventListener("click", () => {
    const form = box.querySelector("[data-session-form]"), jump = store.getJumpHost();
    let free = "";
    try { free = nextFreePort(jump, store.getRemoteSessions()); } catch (e) { say(R, e.message); return; }
    form.innerHTML = `<p><label>Name <input data-s="name" placeholder="lab-pc" spellcheck="false"></label>
      <label>Port on the jump host <input data-s="port" type="number" value="${h(free)}"></label>
      <label>Bridge port on that machine <input data-s="bridgePort" type="number" placeholder="the port the bridge listens on"></label></p>
      <p><label>Bridge token <input data-s="token" type="password" autocomplete="off" spellcheck="false"
        placeholder="the token the bridge printed when paired"></label></p>
      <p class="muted small">The port is the lowest free one of ${h(jump.portFrom)}–${h(jump.portTo)}; change it only if you need another.
        Storing the token needs the tick “I have read this” at the top of the page.</p>
      <p><button class="btn primary" data-session-save>Add</button></p>`;
    form.querySelector("[data-session-save]").addEventListener("click", () => {
      const get = (k) => form.querySelector(`[data-s="${k}"]`).value.trim();
      if (get("token") && !canStore(document.getElementById("ack").checked)) {
        say(R, "Tick “I have read this” at the top of the page first — the bridge token is stored in this browser.");
        document.getElementById("ack").focus();
        return;
      }
      try {
        store.setRemoteSessions(addRemoteSession(store.getJumpHost(), store.getRemoteSessions(),
          { name: get("name"), port: get("port") === "" ? null : Number(get("port")), bridgePort: Number(get("bridgePort")), token: get("token") }));
      } catch (e) { say(R, e.message); return; }
      renderBrowserSettings(app);
      say(R, "Added. Run the two commands, then press Test.");
    });
  });
  box.querySelectorAll("[data-test-session]").forEach((b) => b.addEventListener("click", async () => {
    const x = store.getRemoteSessions().find((y) => y.name === b.dataset.testSession);
    if (!x) return;
    sessionSay(x.name, `Asking localhost:${x.port}…`);
    const line = await testSession(x);
    renderBrowserSettings(app);
    sessionSay(x.name, line);
  }));
  box.querySelector(`[data-test="${R}"]`)?.addEventListener("click", async () => {
    say(R, "Asking each session's local port…");
    const lines = [];
    for (const x of store.getRemoteSessions()) lines.push(await testSession(x));
    renderBrowserSettings(app);
    say(R, lines.join(" "));
  });
  box.querySelectorAll("[data-clear-session]").forEach((b) => b.addEventListener("click", () => {
    const name = b.dataset.clearSession;
    if (!confirm(`Clear the remote session ${name} and its bridge token from this browser? Its port becomes free again.`)) return;
    store.clearRemoteSession(name);
    shownSecrets.delete(`${R} ${name}`);
    renderBrowserSettings(app);
  }));
  box.querySelector(`[data-clear="${R}"]`)?.addEventListener("click", () => {
    if (!confirm("Clear every remote session and its bridge token from this browser?")) return;
    store.clearRemoteSessions();
    for (const k of [...shownSecrets]) if (k.startsWith(`${R} `)) shownSecrets.delete(k);
    renderBrowserSettings(app);
  });
}

function wireSettings(app) {
  const { store, kept, shownSecrets, showBanner, loadProducts, renderProductSelector } = app;
  const ghToken = app.ghToken;
  const ack = document.getElementById("ack"), input = document.getElementById("token-input");
  const expires = document.getElementById("token-expires"), save = document.getElementById("token-save");
  const msg = document.getElementById("token-msg"), importGo = document.getElementById("import-go");
  ack.addEventListener("change", () => {
    input.disabled = expires.disabled = save.disabled = importGo.disabled = !canStore(ack.checked);
  });
  save.addEventListener("click", () => {
    const v = input.value.trim(), exp = expires.value;
    if (!canStore(ack.checked) || !v) return;
    if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(v)) { msg.textContent = "That is not a GitHub token — it starts with github_pat_ and is long."; return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exp)) { msg.textContent = "Enter the date the token expires — GitHub showed it when you created the token."; return; }
    store.setToken(v, exp);
    input.value = "";
    showBanner();
    viewSettings(app);
    document.getElementById("token-msg").textContent = "Stored. Press Test to check it; reload to read with it.";
  });
  document.getElementById("token-clear").addEventListener("click", async () => {
    if (!confirm("Clear everything Agent M stored in this browser — the GitHub token, its date, the product list, every GitLab project token, the jump host, the remote sessions with their bridge tokens, and the kept texts of repository files?")) return;
    store.clear();
    // A CLEAR IS A REAL CLEAR: the file texts kept by blob SHA go too.
    const textsGone = await kept.clear();
    shownSecrets.clear();
    loadProducts();
    renderProductSelector();
    showBanner();
    viewSettings(app);
    document.getElementById("token-msg").textContent = Object.keys(store.entries()).length || !textsGone
      ? "Clearing failed — something is still stored." : "Nothing stored any more.";
  });
  document.getElementById("export-go").addEventListener("click", () => saveExport(app));
  importGo.addEventListener("click", async () => {
    const out = document.getElementById("io-msg"), file = document.getElementById("import-file").files[0];
    if (!canStore(ack.checked)) return;
    if (!file) { out.textContent = "Choose the settings file first."; return; }
    try {
      const settings = await readSettingsFile(await file.text(), document.getElementById("import-pass").value);
      const m = mergeSettings(store.entries(), settings);
      store.putEntries(m.put);
      loadProducts();
      renderProductSelector();
      showBanner();
      viewSettings(app);
      document.getElementById("io-msg").innerHTML = `Imported.<br>Added: ${h(m.added.join(", ") || "nothing — this browser had everything")}.` +
        `${m.kept.length ? `<br>Kept as this browser had them: ${h(m.kept.join(", "))}.` : ""}` +
        `${m.ignored.length ? `<br>Not known to this dashboard, not stored: ${h(m.ignored.join(", "))}.` : ""}`;
    } catch (e) { out.textContent = e.message; }
  });
}

// SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS: the file is handed to the browser's download,
// on this computer only — never committed, never sent, never put into an address.
async function saveExport(app) {
  const { store } = app;
  const out = document.getElementById("io-msg");
  const p1 = document.getElementById("export-pass").value, p2 = document.getElementById("export-pass2").value;
  if (p1 !== p2) { out.textContent = "The two passphrases differ — nothing was saved."; return; }
  out.textContent = p1 ? "Locking the file…" : "Saving…";
  const text = await exportSettings(store.entries(), { passphrase: p1 });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = `agent-m-settings-${today()}${p1 ? "-locked" : ""}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  out.textContent = p1 ? "Saved, locked with your passphrase." : "Saved. The file holds your token in clear — keep it like a password.";
}

// UC-042 4–5: the selected product's settings, read from its repository at the loaded commit and changed
// only by a commit on a click. Without a token the section is read-only (UC-042 3a).
export async function loadProductSettings(app) {
  const { T, GITLAB, SERVER, state, noteRefusal, errorText, writeErrorText } = app;
  const token = app.token;
  const box = document.getElementById("product-settings");
  if (!box) return;
  if (!state.commit) {
    // Opened directly on #settings, the page renders before the repository is read; start() calls again.
    if (state.loadError) box.innerHTML = `<h3>Product · ${h(T.product.address)}</h3><p class="warn">${h(T.product.address)} could not be read
      (${h(errorText(state.loadError))}), so its settings cannot be shown.</p>`;
    return;
  }
  const entry = (p) => state.tree.find((e) => e.path === p) || null;
  const sEntry = entry(PRODUCT_SETTINGS_PATH), cEntry = entry(COLLABORATORS_PATH);
  let settingsText = null, collText = null, reach;
  try {
    [settingsText, collText, reach] = await Promise.all([sEntry ? app.fileText(sEntry.path) : null, cEntry ? app.fileText(cEntry.path) : null,
      GITLAB ? checkGitLab(app, T.product, token()) : checkReach(app, T.repo)]);
  } catch (e) {
    noteRefusal(e);
    box.innerHTML = `<h3>Product · ${h(T.product.address)}</h3><p class="warn">${h(errorText(e))}</p>`;
    return;
  }
  if (!document.body.contains(box)) return;
  const on = pseudonymisationOn(settingsText), people = parseCollaborators(collText);
  const isPublic = reach.ok ? !reach.priv : false, canWrite = Boolean(token());
  const address = T.product.address;
  box.innerHTML = `
    <h3>Product · ${h(address)}</h3>
    <p class="muted small">Kept in <code>${h(T.repo)}</code> itself, so they bind everyone who works on it. Saving is one commit under your account.
      ${canWrite ? "" : GITLAB ? `Read-only: this browser has no project token for it. <a href="#add/${h(encodeURIComponent(address))}">Store the project's token</a> (UC-001).`
        : `Read-only: this browser has no token. <a href="#add/${h(encodeURIComponent(address))}">Give your token access to it</a> (UC-001).`}</p>
    <div class="setting">
      <h4>Pseudonymisation — <span class="state">${on ? "on (the default)" : "off"}</span></h4>
      <p class="muted small">Kept in <code>${h(PRODUCT_SETTINGS_PATH)}</code>${sEntry ? "" : " (not written yet — on is the default)"}.</p>
      ${!canWrite ? "" : on ? `
      <p><button class="btn" id="pseudo-off">Switch off…</button></p>
      <div id="pseudo-confirm" hidden>
        <p class="notice">${h(pseudonymisationOffNotice({ repo: T.repo, isPublic, server: SERVER }))}</p>
        <p><label><input type="checkbox" id="pseudo-ack"> I have read this.</label></p>
        <p><button class="btn primary" id="pseudo-save" disabled>Save: pseudonymisation off</button></p>
      </div>` : `
      <p class="muted small">${h(PSEUDONYMISATION_ON_NOTE)}</p>
      <p><button class="btn primary" id="pseudo-on">Switch on and save</button></p>`}
      <p class="result muted" id="pseudo-msg"></p>
      <details class="explain"><summary>What is this?</summary><div>${h(PSEUDONYMISATION_EXPLANATION)}</div></details>
    </div>
    <div class="setting">
      <h4>Collaborators — ${people.length ? `${people.length} named` : "none named"}</h4>
      <p class="muted small">Kept in <code>${h(COLLABORATORS_PATH)}</code>. A person is named in this repository only by their
        account, or by name if they are listed here as having agreed.</p>
      ${people.length ? `<table class="list"><thead><tr><th>Name</th><th>Account</th><th>Agreed on</th>${canWrite ? "<th></th>" : ""}</tr></thead><tbody>
        ${people.map((c) => `<tr><td>${h(c.name)}</td><td>@${h(c.account)}</td><td>${h(c.agreed)}</td>
          ${canWrite ? `<td><button class="btn small" data-remove-collaborator="${h(c.account)}">Remove</button></td>` : ""}</tr>`).join("")}
      </tbody></table>` : ""}
      ${canWrite ? `<p><label>Name <input id="coll-name" autocomplete="off"></label>
        <label>Account <input id="coll-account" placeholder="${GITLAB ? "gitlab-username" : "github-login"}" autocomplete="off" spellcheck="false"></label>
        <label>Agreed on <input type="date" id="coll-agreed" value="${h(today())}"></label></p>
      <p><label><input type="checkbox" id="coll-consent"> This person has agreed to be named.</label></p>
      <p><button class="btn primary" id="coll-add">+ Collaborator and save</button></p>` : ""}
      <p class="result muted" id="coll-msg"></p>
      <details class="explain"><summary>What is this?</summary><div>Commits already name people by their account. A name
        beyond that is its bearer's decision, like being a co-author: it is written down here, with the date they agreed,
        where everyone can check it. Removing someone takes them off this list with one commit; earlier commits keep the
        name in the repository's history, and files that still name them have to be changed by hand.</div></details>
    </div>`;
  if (!canWrite) return;
  const commitSetting = async (ev, off, out) => {
    ev.currentTarget.disabled = true;
    out.textContent = "Committing…";
    try {
      const c = await savePseudonymisation({ ...app.writeTarget(), branch: T.ref, token: token(), authority: clickAuthority(ev), current: settingsText,
        currentBlob: sEntry?.sha, off, acknowledged: off ? document.getElementById("pseudo-ack").checked : false });
      app.setFlash(`Pseudonymisation ${off ? "off" : "on"} — <a href="${h(c.url)}" target="_blank" rel="noopener">commit ${h(c.sha.slice(0, 7))}</a>.`);
      await app.reloadAndRoute();
    } catch (e) { noteRefusal(e); out.textContent = writeErrorText(e); ev.target.disabled = false; }
  };
  const out = document.getElementById("pseudo-msg");
  document.getElementById("pseudo-off")?.addEventListener("click", () => { document.getElementById("pseudo-confirm").hidden = false; });
  document.getElementById("pseudo-ack")?.addEventListener("change", (ev) => { document.getElementById("pseudo-save").disabled = !ev.target.checked; });
  document.getElementById("pseudo-save")?.addEventListener("click", (ev) => commitSetting(ev, true, out));
  document.getElementById("pseudo-on")?.addEventListener("click", (ev) => commitSetting(ev, false, out));
  const cOut = document.getElementById("coll-msg");
  const commitPeople = async (ev, list, what) => {
    ev.currentTarget.disabled = true;
    cOut.textContent = "Committing…";
    try {
      const c = await saveCollaborators({ ...app.writeTarget(), branch: T.ref, token: token(), authority: clickAuthority(ev), list, currentBlob: cEntry?.sha });
      app.setFlash(`${h(what)} — <a href="${h(c.url)}" target="_blank" rel="noopener">commit ${h(c.sha.slice(0, 7))}</a>.`);
      await app.reloadAndRoute();
    } catch (e) { noteRefusal(e); cOut.textContent = writeErrorText(e); ev.target.disabled = false; }
  };
  document.getElementById("coll-add").addEventListener("click", (ev) => {
    let list;
    try {
      list = addCollaborator(people, { name: document.getElementById("coll-name").value, account: document.getElementById("coll-account").value,
        agreed: document.getElementById("coll-agreed").value, consent: document.getElementById("coll-consent").checked, gitlab: GITLAB });
    } catch (e) { cOut.textContent = e.message; return; }
    commitPeople(ev, list, `Added ${list.at(-1).name} (@${list.at(-1).account})`);
  });
  box.querySelectorAll("[data-remove-collaborator]").forEach((b) => b.addEventListener("click", (ev) => {
    commitPeople(ev, removeCollaborator(people, b.dataset.removeCollaborator),
      `Removed @${b.dataset.removeCollaborator}; earlier commits keep the name in the history`);
  }));
}

// A repository on github.com, as the git host's reads take it: by its owner/name.
const githubRepository = (repo) => ({ repo });

export async function checkReach(app, repo) {
  const { noteRefusal, errorText } = app;
  const ghToken = app.ghToken;
  try {
    const r = await repositoryInfo({ product: githubRepository(repo), token: ghToken() });
    return { ok: true, priv: r.visibility !== "public", branch: r.defaultBranch };
  } catch (e) { noteRefusal(e, null); return { ok: false, error: errorText(e, null) }; }
}

// A GitLab project read with its own project token (or none), through what MOD-git-host's repositoryInfo reports: reachable,
// and with which role the token acts — below Maintainer it cannot write to a protected default branch (gitlabRole). An answer
// that reports neither a visibility nor a default branch did not come from a GitLab server (ITM-130).
export async function checkGitLab(app, p, tok) {
  const { noteRefusal, errorText } = app;
  try {
    const r = await repositoryInfo({ product: p, token: tok });
    if (!r.visibility && !r.defaultBranch) return { ok: false, error: `${p.host} did not answer as a GitLab server.` };
    const role = gitlabRole(r.role);
    return { ok: true, priv: r.visibility !== "public", branch: r.defaultBranch, role: role.role, canWrite: role.canWrite,
      note: role.note, tokenUsed: Boolean(tok) };
  } catch (e) {
    noteRefusal(e, p);
    if (e instanceof TypeError) {
      return { ok: false, error: `${p.host} could not be reached from this page — it must be a GitLab server that accepts requests ` +
        "from this address, and your network must reach it." };
    }
    return { ok: false, error: e.status === 404 ? (tok ? "the token does not reach this project, or the address is wrong"
      : "not found — a private project can be read only with its project token") : errorText(e, p) };
  }
}

const reachOf = (app, p) => (isGitLab(p) ? checkGitLab(app, p, app.store.getGitLabToken(p.address)?.token) : checkReach(app, p.repo));

export const reachLine = ([r, x]) => !x.ok ? `✗ ${h(r)}: ${h(x.error)}`
  : "role" in x ? `✓ ${h(r)} reachable${x.tokenUsed ? (x.role ? ` — the token acts as ${h(x.role)}` : "") +
      (x.canWrite ? "" : ` — ${h(x.note)}`) : " — without a token: read-only here"}`
  : `✓ ${h(r)} reachable${x.priv ? "" : " — public, so write access is confirmed only by the first write"}`;

// What is wrong with a pasted GitLab token and its date, or null.
export function gitlabTokenProblem(v, exp) {
  if (/^(github_pat_|ghp_)/.test(v)) return "That is a GitHub token. A GitLab product needs the project access token created on GitLab.";
  if (!/^\S{20,}$/.test(v)) return "That is not a GitLab token — it is long, has no spaces, and usually starts with glpat-.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(exp)) return "Enter the date the token expires — GitLab showed it when you created the token.";
  return null;
}

export const routes = { settings: async (app) => { await findSections(app); viewSettings(app); } };
