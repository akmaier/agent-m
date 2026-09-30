// Review core — the logic of the Pages dashboard, free of DOM so that it runs under node --test.
//
// SPEC §10: acceptance is a commit in GitHub that adds an approval record; the record names the
// exact text by its git blob SHA; status is derived from the records, never stored. The dashboard
// holds no credential and only reads. The SPEC-section logic mirrors tools/apply_approvals.py
// (the workflow side); tests/review-core.test.mjs checks that both hash the same bytes.

export const ALLOWED_ORIGINS = new Set(["https://api.github.com", "https://raw.githubusercontent.com"]);
export const MAX_URL_VALUE = 1000; // NO TEXT TRAVELS IN A URL — a record is ~400 bytes

// ---------------------------------------------------------------- reading (GET only, no credential)

export const TOKEN_DESTINATIONS = ["https://api.github.com"];

// The only way the dashboard reads. SPEC §7/§10: GET only; the GitHub token, if any, goes only to
// GitHub's API as a header built here — never in a URL, never to another origin, never by a caller.
export async function fetchText(url, init = {}, token = null) {
  const u = new URL(url, globalThis.location?.href);
  const sameOrigin = globalThis.location && u.origin === globalThis.location.origin;
  if (!sameOrigin && !ALLOWED_ORIGINS.has(u.origin)) throw new Error(`origin not allowed: ${u.origin}`);
  if ((init.method || "GET").toUpperCase() !== "GET") throw new Error("only GET is allowed");
  const h = { ...(init.headers || {}) };
  if (Object.keys(h).some((k) => /^authorization$/i.test(k))) throw new Error("no caller-set authorization header");
  if (init.credentials === "include") throw new Error("the dashboard sends no browser credential");
  if (token) {
    if (u.href.includes(token)) throw new Error("A credential is never placed in a URL");
    if (!TOKEN_DESTINATIONS.includes(u.origin)) throw new Error(`the token may only go to ${TOKEN_DESTINATIONS.join(", ")}`);
    Object.assign(h, authHeaders(u.href, token));
  }
  const r = await fetch(u, { method: "GET", headers: h, credentials: "omit", cache: "no-store" });
  if (!r.ok) throw Object.assign(new Error(`${r.status} ${r.statusText} — ${u.origin}${u.pathname}`), { status: r.status });
  return r.text();
}

export function authHeaders(url, token) {
  if (!token) return {};
  return TOKEN_DESTINATIONS.includes(new URL(url).origin) ? { Authorization: `Bearer ${token}` } : {};
}

// ---------------------------------------------------------------- instance and products (SPEC §10)

const REPO_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;
export const UPSTREAM = "akmaier/agent-m";

export function deriveTarget({ hostname, pathname, search }) {
  const owner = hostname.endsWith(".github.io") ? hostname.split(".")[0] : null;
  const name = pathname.split("/").filter(Boolean)[0];
  const instance = owner && name ? `${owner}/${name}` : UPSTREAM;
  const q = new URLSearchParams(search || "");
  const wanted = q.get("repo");
  const repo = wanted && REPO_RE.test(wanted) && !wanted.includes("..") ? wanted : instance;
  const ref = q.get("ref") && /^[A-Za-z0-9._\/-]{1,200}$/.test(q.get("ref")) && !q.get("ref").includes("..") ? q.get("ref") : "main";
  return { instance, repo, ref };
}

// A PRODUCT IS NAMED BY ITS ADDRESS: the web address of its repository, as copied from the browser.
// -> { address, host, repo } for a github.com repository, or { error }. GitLab addresses are
// recognised but not yet supported by this dashboard.
export function parseProductAddress(input) {
  const s = String(input ?? "").trim();
  let u;
  try { u = new URL(s); } catch { return { error: "Paste the repository's address, e.g. https://github.com/owner/name." }; }
  if (u.protocol !== "https:") return { error: "The address must use https." };
  const parts = u.pathname.split("/").filter(Boolean);
  if (u.hostname !== "github.com") {
    return { error: /gitlab|gitos/i.test(u.hostname) || parts.length >= 2
      ? `${u.hostname} looks like a GitLab server — GitLab products cannot be added on this dashboard yet.`
      : `${u.hostname} is not a repository host this dashboard supports.` };
  }
  if (parts.length < 2) return { error: "The address names an owner and a repository: https://github.com/owner/name." };
  const repo = `${parts[0]}/${parts[1].replace(/\.git$/, "")}`;
  if (!REPO_RE.test(repo) || repo.includes("..")) return { error: `not a repository: ${repo}` };
  return { address: `https://github.com/${repo}`, host: "github.com", repo };
}

// ---------------------------------------------------------------- settings texts (SPEC §7)

export function sharedOriginNotice(owner) {
  return `Everything Agent M stores in this browser is stored for the address https://${owner}.github.io — ` +
    `not only for this instance. Every other GitHub Pages site of ${owner} is served from the same address ` +
    `and can read it, including any script those sites load. If that is not acceptable, run your instance ` +
    `under a GitHub owner (account or organisation) that has no other Pages sites.`;
}

export const canStore = (acknowledged) => acknowledged === true;

export const TOKEN_GUIDANCE = `A fine-grained personal access token is a key you create on GitHub. It lets this page act for you
in exactly the repositories you choose, and nowhere else.
— Repository access: Only select repositories — this instance and the products it manages, nothing else.
— Permissions (one token serves every feature, so you create only one):
  Contents: read and write — to save and accept: every edit and acceptance is a commit you ask for by clicking.
  Issues: read and write — for reports that become issues in a product.
  Actions: read and write — to start a run of a workflow, such as the tests.
  Metadata: read — GitHub requires it for every token; it reads names and settings, nothing else.
— Expiration: 90 days is preset; GitHub mails you before it expires, and you can renew it.
Why this scope: these four are what Agent M's features need, and nothing more is asked for; the repository
choice keeps them to this instance and the products you add.
Where the token goes: only to https://api.github.com, as an Authorization header. Never to the model endpoint,
never into a URL, never into a repository.`;

// ---------------------------------------------------------------- git blob identity

export async function gitBlobSha(text) {
  const body = new TextEncoder().encode(text);
  const head = new TextEncoder().encode(`blob ${body.length}\0`);
  const all = new Uint8Array(head.length + body.length);
  all.set(head);
  all.set(body, head.length);
  const d = await crypto.subtle.digest("SHA-1", all);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------- use-case front matter

export function parseFrontMatter(text) {
  if (!text.startsWith("---\n")) return { fields: {}, body: text };
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) return { fields: {}, body: text };
  const fields = {};
  let key = null;
  for (const line of text.slice(4, end).split("\n")) {
    const m = line.match(/^([a-z][a-z0-9_-]*):\s*(.*)$/);
    if (m) {
      key = m[1];
      fields[key] = m[2].trim() ? m[2].trim() : [];
    } else if (key && /^\s+-\s+/.test(line) && Array.isArray(fields[key])) {
      fields[key].push(line.replace(/^\s+-\s+/, "").trim());
    }
  }
  return { fields, body: text.slice(end + 5) };
}

// ---------------------------------------------------------------- approval records

const UC_KEYS = ["kind", "file", "blob"];
const SPEC_KEYS = ["kind", "queue", "entry", "proposal", "blob", "target", "anchor", "section"];

export function useCaseRecord(file, blob) {
  return { kind: "use-case", file, blob };
}

export function specRecord({ queue, entry, proposal, blob, target, anchor, section }) {
  return { kind: "spec", queue, entry: String(entry).padStart(2, "0"), proposal, blob, target, anchor, section };
}

export function recordText(r) {
  const keys = r.kind === "spec" ? SPEC_KEYS : UC_KEYS;
  return keys.map((k) => `${k}: ${r[k]}`).join("\n") + "\n";
}

export function parseRecord(text) {
  const r = {};
  for (const m of text.matchAll(/^([a-z]+):[ \t]*(.*)$/gm)) r[m[1]] = m[2].trim();
  return r;
}

export function approvalPath(id, blob) {
  return `docs/approvals/${id}-${blob.slice(0, 12)}.md`;
}

// ---------------------------------------------------------------- GitHub links (navigation only)

const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");

export function newFileUrl(repo, ref, path, value) {
  if (value.length > MAX_URL_VALUE) throw new Error("NO TEXT TRAVELS IN A URL: value too long for a record");
  return `https://github.com/${repo}/new/${encPath(ref)}?filename=${encodeURIComponent(path)}&value=${encodeURIComponent(value)}`;
}

export function editUrl(repo, ref, path) {
  return `https://github.com/${repo}/edit/${encPath(ref)}/${encPath(path)}`;
}

export function blobUrl(repo, ref, path) {
  return `https://github.com/${repo}/blob/${encPath(ref)}/${encPath(path)}`;
}

// ---------------------------------------------------------------- SPEC sections (as spec_dashboard.py)

export function extractSection(text, anchor, bis = null) {
  const lines = text.split("\n");
  const fenced = [];
  let open = false;
  for (const l of lines) {
    if (l.trimStart().startsWith("```")) { fenced.push(true); open = !open; } else fenced.push(open);
  }
  const hits = lines.map((l, i) => (l.trim() === anchor.trim() && !fenced[i] ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) return { error: `anchor found ${hits.length} times instead of exactly once` };
  const from = hits[0];
  let to = lines.length;
  if (bis) {
    const after = lines.map((l, i) => (i > from && l.trim() === bis.trim() && !fenced[i] ? i : -1)).filter((i) => i >= 0);
    if (after.length !== 1) return { error: `end anchor found ${after.length} times instead of exactly once` };
    to = after[0];
  } else if (!/^#{1,6} /.test(lines[from])) {
    to = from + 1;
  } else {
    const level = lines[from].match(/^#+/)[0].length;
    for (let i = from + 1; i < lines.length; i++) {
      if (fenced[i]) continue;
      const m = lines[i].match(/^(#{1,6}) /);
      if (m && m[1].length <= level) { to = i; break; }
    }
  }
  return { lines, from, to };
}

// The bytes both sides hash: the section's lines, trailing newlines trimmed, one newline added.
export function sectionText(s) {
  if (s.error) throw new Error(s.error);
  return s.lines.slice(s.from, s.to).join("\n").replace(/\n+$/, "") + "\n";
}

// ---------------------------------------------------------------- queues (index.md, entscheidungen.md)

export function parseQueueIndex(text) {
  const m = text.match(/^\*\*Zieldatei aller Eintr\S*ge:\*\*\s*`([^`]+)`/m);
  const entries = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("|")) continue;
    const sp = line.trim().replace(/^\||\|$/g, "").split("|").map((s) => s.trim());
    if (sp.length < 5 || !/^\d+$/.test(sp[0])) continue;
    const bis = sp[3].replace(/\\\|/g, "|");
    entries.push({ nr: Number(sp[0]), file: sp[1].replace(/`/g, ""), anchor: sp[2].replace(/\\\|/g, "|"),
      bis: ["—", "-", ""].includes(bis) ? null : bis });
  }
  return { target: m ? m[1] : null, entries };
}

export function parseDecisions(text) {
  const out = new Map();
  for (const line of text.split("\n")) {
    if (!line.startsWith("|")) continue;
    const sp = line.trim().replace(/^\||\|$/g, "").split("|").map((s) => s.trim());
    if (sp.length < 4 || !/^\d+$/.test(sp[1])) continue;
    out.set(Number(sp[1]), { when: sp[0], decision: sp[2], ref: sp[3] });
  }
  return out;
}

// ---------------------------------------------------------------- derived status

export function deriveUseCaseStatus(file, currentBlob, records) {
  const mine = records.filter((r) => r.kind === "use-case" && r.file === file);
  if (mine.some((r) => r.blob === currentBlob)) return "accepted";
  return mine.length ? "changed" : "open";
}

// An accepted entry counts as applied while the SPEC section at its anchor is still its text. Only that
// section is compared: an entry may carry headings that later entries of its queue fill (queue
// 2026-09-24g, entry 05), and filling them must not turn the entry into "superseded".
export function deriveSpecStatus({ queue, nr, anchor, bis, proposalPath, proposalText, proposalBlob, sectionBlob,
  specText, decisions, records }) {
  const d = decisions.get(nr);
  if (d && d.decision === "uebernommen") {
    const inSpec = extractSection(specText, anchor, bis);
    const own = bis ? { lines: proposalText.split("\n"), from: 0, to: proposalText.split("\n").length }
      : extractSection(proposalText, anchor, null);
    if (inSpec.error || own.error) return "superseded";
    return sectionText(inSpec) === sectionText(own) ? "applied" : "superseded";
  }
  const mine = records.filter((r) => r.kind === "spec" && r.queue === queue && Number(r.entry) === nr
    && r.proposal === proposalPath);
  if (mine.some((r) => r.blob === proposalBlob && r.section === sectionBlob)) return "approved";
  return mine.length ? "stale" : "open";
}

// ---------------------------------------------------------------- guided token setup (SPEC §7)

// The prefilled link's expiry; the date a token is stored with is preset to it (A TOKEN'S EXPIRY IS WARNED OF
// IN ADVANCE).
export const TOKEN_DAYS = 90;

export function tokenLinkUrl(instance) {
  const q = new URLSearchParams({
    name: `Agent M · ${instance}`,
    description: `Agent M dashboard of ${instance}: commits, issues and runs you ask for by clicking.`,
    expires_in: String(TOKEN_DAYS),
    // ONE GITHUB TOKEN SERVES EVERY FEATURE. Parameter names as documented by GitHub ("Pre-filling
    // fine-grained personal access token details using URL parameters", docs.github.com).
    contents: "write",
    issues: "write",
    actions: "write",
    metadata: "read",
  });
  return `https://github.com/settings/personal-access-tokens/new?${q}`;
}

export function repositoryChoiceSteps(instance, product) {
  const repos = [...new Set([instance, product].filter(Boolean))];
  return [
    "Under “Repository access”, choose “Only select repositories”. GitHub preselects “All repositories”, " +
      "which would give Agent M write access to everything you own.",
    `Open “Select repositories” and pick ${repos.map((r) => `“${r}”`).join(" and ")} — nothing else.`,
    "Leave the permissions as they are (Contents: read and write, Issues: read and write, Actions: read and write, " +
      "Metadata: read), scroll down and press “Generate token”.",
    "Copy the token GitHub now shows — it starts with github_pat_ and is shown only once.",
  ];
}

export const tokenListUrl = () => "https://github.com/settings/personal-access-tokens";

// UC-001: the instance's token (created in UC-014) is extended by one repository — same token,
// nothing to copy. The token's name is the one tokenLinkUrl gave it, so the person can find it.
export function extendTokenSteps(instance, product) {
  const name = new URLSearchParams(new URL(tokenLinkUrl(instance)).search).get("name");
  return [
    `Click the token “${name}”, then “Edit”.`,
    `Under “Repository access” → “Select repositories”, add “${product}” — keep “${instance}” selected.`,
    "Press “Update” at the bottom. The token itself stays the same — nothing to copy, nothing to paste here.",
  ];
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// EVERY STEP EXPLAINS ITSELF: the only way to render a step, and it refuses one without explanation.
export function stepHtml({ title, body, explain }) {
  if (!explain || !String(explain).trim()) throw new Error(`step "${title}" has no \"explain\" text (EVERY STEP EXPLAINS ITSELF)`);
  return `<section class="step"><h3>${esc(title)}</h3>${body}` +
    `<details class="explain"><summary>What is this?</summary><div>${explain}</div></details></section>`;
}

// ---------------------------------------------------------------- writing (SPEC §9, §10)

// THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK. Every write needs the click event that caused it;
// `isTrusted` is set by the browser for real user input only and cannot be set by a script.
// All files go into ONE commit, fast-forward only — nobody else's work is ever overwritten.
// `files` may be a function of the branch head: it then computes the files from that very commit, so
// that every check it makes is made on the commit the new one is written on (A STALE APPROVAL IS NOT
// APPLIED). A later commit on the branch makes the fast-forward fail, and nothing is written.
export async function commitFiles({ repo, branch, files, message, token, click }) {
  if (!click || click.isTrusted !== true) throw new Error("a write needs a person's click");
  if (!token) throw new Error("writing needs a stored token");
  if (!REPO_RE.test(repo) || repo.includes("..")) throw new Error(`not a repository: ${repo}`);
  if (typeof files !== "function" && !files.length) throw new Error("nothing to write");
  const api = `https://api.github.com/repos/${repo}`;
  const call = async (method, path, body) => {
    const r = await fetch(api + path, { method, credentials: "omit", cache: "no-store",
      headers: { Accept: "application/vnd.github+json", ...authHeaders(api, token), ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined });
    const text = await r.text();
    if (!r.ok) {
      let msg = text;
      try { msg = JSON.parse(text).message || text; } catch { /* keep raw */ }
      const e = new Error(`${method} ${path}: ${r.status} ${msg}`);
      e.status = r.status;
      throw e;
    }
    return text ? JSON.parse(text) : {};
  };
  const ref = encodeURIComponent(branch).replace(/%2F/g, "/");
  const head = (await call("GET", `/git/ref/heads/${ref}`)).object.sha;
  if (typeof files === "function") files = await files(head);
  if (!files.length) throw new Error("nothing to write");
  for (const f of files) {
    if (!f.expectBlob) continue;
    let current = null;
    try {
      current = (await call("GET", `/contents/${f.path.split("/").map(encodeURIComponent).join("/")}?ref=${head}`)).sha;
    } catch (e) { if (e.status !== 404) throw e; }
    if (current !== f.expectBlob) throw new Error(`${f.path} changed since you opened it — reload and look at the new text first`);
  }
  const baseTree = (await call("GET", `/git/commits/${head}`)).tree.sha;
  const tree = await call("POST", "/git/trees", { base_tree: baseTree,
    tree: files.map((f) => ({ path: f.path, mode: "100644", type: "blob", content: f.content })) });
  if (typeof message === "function") message = message();
  const commit = await call("POST", "/git/commits", { message, tree: tree.sha, parents: [head] });
  await call("PATCH", `/git/refs/heads/${ref}`, { sha: commit.sha, force: false });
  return { sha: commit.sha, url: commit.html_url || `https://github.com/${repo}/commit/${commit.sha}` };
}

// ---------------------------------------------------------------- accepting (UC-006 4–7, 4d, 5a · UC-008 3d)
//
// AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL: with a token, one commit holds the approval
// record, the replaced SPEC section (the proposal byte for byte) and the decision row — the same bytes
// tools/apply_approvals.py writes without a token, which then finds the row and skips the record.
// SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER · A STALE APPROVAL IS NOT
// APPLIED: every ticked item names the text that was shown; one that changed is left out and named.

// The row tools/apply_approvals.py appends to a queue's entscheidungen.md.
export function decisionRow(nr, recordName, now = new Date()) {
  return `| ${now.toISOString().slice(0, 16).replace("T", " ")} UTC | ${Number(nr)} | uebernommen | approval:${recordName} |\n`;
}

const APPLIED_RE = /\|\s*approval:([^\s|]+)\s*\|/g; // as applied_records() in tools/apply_approvals.py

// Replace a section with the proposal, as tools/apply_approvals.py does, keeping the file's final newline.
export function replaceSection(text, anchor, bis, proposal) {
  const s = extractSection(text, anchor, bis);
  if (s.error) throw new Error(s.error);
  const out = [...s.lines.slice(0, s.from), ...proposal.replace(/\n+$/, "").split("\n"), ...s.lines.slice(s.to)].join("\n");
  return text.endsWith("\n") && !out.endsWith("\n") ? out + "\n" : out;
}

const pad2 = (n) => String(n).padStart(2, "0");

// The SPEC section an entry replaces, and the entries of its queue that must be written before it
// because they create its anchor (queue 2026-09-24g: entry 05 creates the headings of 06–10).
// entries: [{ nr, anchor, bis, proposalText }] of one queue. -> { current, needs } or { error, needs: [] }
export function sectionForEntry({ specText, entries, nr, _seen = [] }) {
  const e = entries.find((x) => x.nr === nr);
  const own = extractSection(specText, e.anchor, e.bis);
  if (!own.error) return { current: sectionText(own), needs: [], spec: specText };
  const creator = entries.find((c) => c.nr !== nr && !_seen.includes(c.nr) && c.anchor.trim() !== e.anchor.trim()
    && !extractSection(c.proposalText || "", e.anchor, null).error);
  if (!creator) return { error: own.error, needs: [] };
  const before = sectionForEntry({ specText, entries, nr: creator.nr, _seen: [..._seen, nr] });
  if (before.error) return { error: own.error, needs: [] };
  let spec;
  try { spec = replaceSection(before.spec, creator.anchor, creator.bis, creator.proposalText); } catch { return { error: own.error, needs: [] }; }
  const after = extractSection(spec, e.anchor, e.bis);
  if (after.error) return { error: after.error, needs: [] };
  return { current: sectionText(after), needs: [...before.needs, creator.nr], spec };
}

export const itemLabel = (it) => (it.kind === "spec" ? `${it.qname} ${it.nn}` : it.id);

export function needsMessage(it, missing) {
  const names = missing.map((n) => `entry ${pad2(n)}`).join(", ");
  return `${itemLabel(it)}: its heading “${it.anchor}” is created by ${names} of this queue — accept it together with or after ${names}.`;
}

// Ticked SPEC entries whose anchor another entry of their queue creates, without that entry ticked.
export function missingNeeds(items) {
  const out = [];
  for (const it of items) {
    if (it.kind !== "spec" || !it.needs?.length) continue;
    const have = new Set(items.filter((x) => x.kind === "spec" && x.queue === it.queue).map((x) => Number(x.nr)));
    const missing = it.needs.filter((n) => !have.has(Number(n)));
    if (missing.length) out.push({ item: it, missing, message: needsMessage(it, missing) });
  }
  return out;
}

// What the reviewer was shown, and what they ticked. Only a shown item can be ticked, and its tick
// accepts exactly the text that was shown (AN APPROVAL NAMES THE EXACT TEXT).
export function createReviewSession() {
  const shown = new Map(), ticked = new Set();
  const key = (it) => (it.kind === "spec" ? `spec:${it.queue}:${Number(it.nr)}` : `uc:${it.path}`);
  return {
    key,
    show(it) { shown.set(key(it), it); return key(it); },
    wasShown: (k) => shown.has(k),
    get: (k) => shown.get(k),
    isTicked: (k) => ticked.has(k),
    tick(k, on) {
      if (!shown.has(k)) return false;
      if (on) ticked.add(k); else ticked.delete(k);
      return true;
    },
    untick(labels) { for (const k of [...ticked]) if (labels.includes(itemLabel(shown.get(k)))) ticked.delete(k); },
    items: () => [...ticked].map((k) => shown.get(k)),
  };
}

// The files of one acceptance commit, computed from the commit it is written on.
// read(path) -> text or null on that commit. -> { files, accepted, leftOut: [{ label, reason }] }
export async function planAcceptance({ items, read, now = new Date() }) {
  const texts = new Map(), files = new Map(), accepted = [], leftOut = [];
  const get = async (p) => { if (!texts.has(p)) texts.set(p, await read(p)); return texts.get(p); };
  const out = (it, reason) => leftOut.push({ label: itemLabel(it), reason });
  for (const it of items.filter((x) => x.kind === "use-case")) {
    const text = await get(it.path);
    if (text === null) { out(it, "the file no longer exists"); continue; }
    if (await gitBlobSha(text) !== it.blob) { out(it, "the file changed after it was shown — open it again"); continue; }
    files.set(approvalPath(it.id, it.blob), recordText(useCaseRecord(it.path, it.blob)));
    accepted.push(itemLabel(it));
  }
  const specItems = items.filter((x) => x.kind === "spec");
  for (const q of [...new Set(specItems.map((x) => x.queue))]) {
    const idx = parseQueueIndex((await get(`${q}/index.md`)) ?? "");
    const pos = (it) => idx.entries.findIndex((e) => e.nr === Number(it.nr));
    const ordered = specItems.filter((x) => x.queue === q).sort((a, b) => pos(a) - pos(b) || a.nr - b.nr);
    const decPath = `${q}/entscheidungen.md`;
    const decText = (await get(decPath)) ?? "";
    const applied = new Set([...decText.matchAll(APPLIED_RE)].map((m) => m[1]));
    const rows = [], written = new Set();
    for (const it of ordered) {
      const en = idx.entries.find((e) => e.nr === Number(it.nr));
      if (!en) { out(it, "the entry is no longer in the queue's index"); continue; }
      if (en.anchor !== it.anchor || (en.bis ?? null) !== (it.bis ?? null)) { out(it, "the queue's index changed after it was shown"); continue; }
      const recPath = approvalPath(`spec-${it.qname}-${it.nn}`, it.proposalBlob), recName = recPath.split("/").pop();
      if (applied.has(recName)) { out(it, "already written into the SPEC"); continue; }
      const prop = await get(it.proposalPath);
      if (prop === null) { out(it, "the proposal no longer exists"); continue; }
      if (await gitBlobSha(prop) !== it.proposalBlob) { out(it, "the proposal changed after it was shown — open it again"); continue; }
      const spec = await get(it.targetPath);
      const sec = extractSection(spec ?? "", it.anchor, it.bis);
      if (sec.error) {
        const missing = (it.needs || []).filter((n) => !written.has(Number(n)));
        out(it, missing.length ? `${needsMessage(it, missing).replace(/^[^:]*: /, "")} It is not written in this commit.`
          : `${sec.error} in ${it.targetPath}`);
        continue;
      }
      if (await gitBlobSha(sectionText(sec)) !== it.sectionBlob) { out(it, "the SPEC section changed after it was shown — open it again"); continue; }
      texts.set(it.targetPath, replaceSection(spec, it.anchor, it.bis, prop));
      files.set(it.targetPath, texts.get(it.targetPath));
      files.set(recPath, recordText(specRecord({ queue: it.queue, entry: it.nr, proposal: it.proposalPath, blob: it.proposalBlob,
        target: it.targetPath, anchor: it.anchor, section: it.sectionBlob })));
      rows.push(decisionRow(it.nr, recName, now));
      written.add(Number(it.nr));
      accepted.push(itemLabel(it));
    }
    if (rows.length) files.set(decPath, (decText && !decText.endsWith("\n") ? decText + "\n" : decText) + rows.join(""));
  }
  return { files: [...files].map(([path, content]) => ({ path, content })), accepted, leftOut };
}

// One click: check the order, then plan and commit on the same head. readAt(head, path) -> text | null.
// -> { commit, accepted, leftOut }; commit is null when everything was left out (nothing written).
export async function acceptItems({ repo, branch, token, click, items, readAt, now = new Date() }) {
  if (!items.length) throw new Error("nothing ticked");
  const gaps = missingNeeds(items);
  if (gaps.length) throw new Error(gaps.map((g) => g.message).join(" "));
  let plan = null;
  try {
    const commit = await commitFiles({ repo, branch, token, click,
      message: () => `accept ${plan.accepted.join(", ")} (Agent M dashboard)`,
      files: async (head) => {
        plan = await planAcceptance({ items, read: (p) => readAt(head, p), now });
        return plan.files;
      } });
    return { commit, accepted: plan.accepted, leftOut: plan.leftOut };
  } catch (e) {
    if (plan && !plan.files.length) return { commit: null, accepted: [], leftOut: plan.leftOut };
    throw e;
  }
}

// ---------------------------------------------------------------- adding a product (UC-001)

export function missingLayout(existingPaths, product) {
  const have = new Set(existingPaths);
  const hasPrefix = (p) => existingPaths.some((x) => x.startsWith(p));
  const out = [];
  const add = (path, dirPrefix, content) => { if (!have.has(path) && !(dirPrefix && hasPrefix(dirPrefix))) out.push({ path, content }); };
  add("docs/use-cases/README.md", "docs/use-cases/", `# Use cases of ${product}\n\nOne file per use case, \`UC-<nnn>-<slug>.md\`. Reviewed on the Agent M dashboard.\n`);
  add("docs/approvals/README.md", "docs/approvals/", "# Approval records\n\nOne file per acceptance, written by the Agent M dashboard. Never edited to change a status.\n");
  add("docs/spec-freigaben/README.md", "docs/spec-freigaben/", "# SPEC change queues\n\nOne folder per queue; each entry is accepted on the Agent M dashboard.\n");
  add("SPEC.md", null, `# ${product} — Specification\n\n**VERBINDLICH (SPEC)**\n\nNo requirement yet. Requirements enter through the approval queues in \`docs/spec-freigaben/\`.\n`);
  add("CHANGELOG.md", null, `# Changelog of ${product}\n\nCalendar versions \`YYYY.MINOR.PATCH\`. No release yet.\n`);
  return out;
}

// UC-001 Step C, one click: read the product repository, write only its missing layout into its default
// branch, then add its address to the list in this browser. Nothing is written into the instance
// repository (NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY). A refused write adds nothing to the list.
// store: the browser store of settings-store.mjs. -> { commit: { sha, url } | null, product }
export async function addProduct({ address, token, click, store }) {
  if (!click || click.isTrusted !== true) throw new Error("a write needs a person's click");
  const product = parseProductAddress(address);
  if (product.error) throw new Error(product.error);
  const api = `https://api.github.com/repos/${product.repo}`;
  const info = JSON.parse(await fetchText(api, { headers: { Accept: "application/vnd.github+json" } }, token));
  const tree = JSON.parse(await fetchText(`${api}/git/trees/${encodeURIComponent(info.default_branch)}?recursive=1`, {}, token));
  const files = missingLayout(tree.tree.filter((e) => e.type === "blob").map((e) => e.path), product.repo);
  const commit = files.length
    ? await commitFiles({ repo: product.repo, branch: info.default_branch, token, click, files,
      message: "Add the Agent M review layout (Agent M dashboard)" })
    : null;
  store.addProduct(product.address);
  return { commit, product };
}

// ---------------------------------------------------------------- settings in one place (UC-042, SPEC §7)
//
// EVERY SETTING IS REACHED FROM ONE PAGE: the browser section of the settings page is this HTML, one
// row per setting, each key of settings-store.mjs with its place (data-setting-key). The page inserts
// it as it is, so tests/test_settings_page.py checks what the person sees.

const K_TOKEN = "agent-m.github-token", K_EXPIRES = "agent-m.github-token-expires", K_PRODUCTS = "agent-m.products";

export const BROWSER_SETTINGS = [
  { key: K_TOKEN, label: "GitHub token", secret: true,
    grants: "writes — commits, issues and workflow runs — to every repository it was given, under your account" },
  { key: K_EXPIRES, label: "GitHub token expiry date", secret: false, partOf: K_TOKEN },
  { key: K_PRODUCTS, label: "Products", secret: false },
];
const settingLabel = (k) => BROWSER_SETTINGS.find((s) => s.key === k)?.label ?? k;

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

export const RENEW_TEXT = "On GitHub's list of your tokens, open this one and press “Regenerate token”: the new value keeps the " +
  "token's permissions and repositories. Then paste it under Settings → GitHub token → Change.";

// A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE: from fourteen days before the date recorded with the token.
export function expiryWarning(expires, now = new Date()) {
  const days = daysUntil(expires, now);
  if (days === null || days > EXPIRY_WARN_DAYS) return null;
  const expired = days < 0;
  return { days, expired, renewUrl: tokenListUrl(), renew: RENEW_TEXT,
    text: expired ? `Your GitHub token expired on ${expires}.`
      : `Your GitHub token expires on ${expires} (${days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}).` };
}

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED: GitHub answers 401 to a token it no longer accepts
// (expired, regenerated or deleted). 403 and 404 are a missing permission or repository, not this.
export function tokenRefusal(e) {
  const status = e?.status ?? Number((/(?:^|: )(\d{3})\b/.exec(e?.message || "") || [])[1]);
  if (status !== 401) return null;
  return { token: "GitHub token", renewUrl: tokenListUrl(), renew: RENEW_TEXT,
    text: "GitHub refused your GitHub token — it has expired, or was regenerated or deleted on GitHub." };
}

// The line shown at the top of every view while the token is refused or expires within fourteen days.
export function tokenBannerHtml({ expires, refused = false, now = new Date() }) {
  const r = refused ? tokenRefusal({ status: 401 }) : expiryWarning(expires, now);
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

function tokenStateLine(token, expires, tokenState, now) {
  if (!token) return "— not set";
  if (tokenState?.refused) return "✗ refused — GitHub did not accept it at the last use";
  const w = expiryWarning(expires, now);
  if (w) return `⚠ ${w.expired ? "expired on" : "expires on"} ${esc(expires)}`;
  if (tokenState?.ok) return `✓ works — tested ${esc(tokenState.ok)}`;
  return "stored — not tested on this page yet";
}

// The browser section: one row per setting, each with Test and Clear (A BROWSER SETTING IS TESTED AND
// CLEARED WHERE IT IS SHOWN). entries: { key: raw value } from the store; shown: keys revealed by Show.
export function browserSettingsHtml({ entries = {}, shown = [], tokenState = null, now = new Date() }) {
  const token = entries[K_TOKEN] || null, expires = entries[K_EXPIRES] || null;
  let products = [];
  try { products = JSON.parse(entries[K_PRODUCTS] || "[]"); } catch { products = []; }
  if (!Array.isArray(products)) products = [];
  const tokenRow = `<div class="setting" data-setting-row="github-token">
    <h4 data-setting-key="${K_TOKEN}">GitHub token</h4>
    <p class="state">${tokenStateLine(token, expires, tokenState, now)}</p>
    ${token ? `<p>${secretFieldHtml({ key: K_TOKEN, value: token, shown: shown.includes(K_TOKEN), label: "Stored GitHub token" })}</p>` : ""}
    <p data-setting-key="${K_EXPIRES}">Expires on: <strong>${expires ? esc(expires) : "—"}</strong>
      <span class="muted small">— the date entered when the token was stored; the dashboard warns ${EXPIRY_WARN_DAYS} days before.</span></p>
    <p><button class="btn" data-test="${K_TOKEN}" ${token ? "" : "disabled"}>Test</button>
      <button class="btn" data-change="${K_TOKEN}">${token ? "Change" : "Store a token"}</button>
      <button class="btn" data-clear="${K_TOKEN}" ${token ? "" : "disabled"}>Clear</button></p>
    <p class="result muted" data-result="${K_TOKEN}"></p>
    <details class="explain"><summary>What is this?</summary><div>The key that lets this page commit, open issues and start
      runs for you in the repositories you gave it. Kept in this browser's <code>localStorage</code>, sent only to
      https://api.github.com as a header. <em>Test</em> reads your instance with it; <em>Clear</em> removes it and its date
      from this browser — accepting and editing then go through GitHub's own pages, products cannot be added, and private
      repositories cannot be read.</div></details>
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
      <em>Remove</em> and <em>Clear</em> take them off this browser's list and change nothing in their repositories.</div></details>
  </div><!--/setting-->`;
  return tokenRow + productRow;
}

// ---------------------------------------------------------------- export and import (UC-042 6, UC-014 7a)

export const SETTINGS_FORMAT = "agent-m-settings";
export const PBKDF2_ITERATIONS = 600000;
export const PASSPHRASE_NOTICE = "A forgotten passphrase cannot be recovered: without it, nobody — you included — can read the file.";

// AN EXPORT STATES THAT IT CONTAINS SECRETS: each stored secret by name, and what it grants.
export function exportNotice(entries = {}) {
  const secrets = BROWSER_SETTINGS.filter((s) => s.secret && entries[s.key]);
  const what = secrets.length ? secrets.map((s) => `your ${s.label}, which ${s.grants}`).join("; ") : "no token, key or password (none is stored)";
  return `The file contains every setting of this browser in full, including ${what}. It opens all of that to ` +
    `whoever holds the file — keep it like a password, or lock it with a passphrase.`;
}

const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function passphraseKey(passphrase, salt, iterations) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, base,
    { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

// SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS · AN EXPORT CAN BE LOCKED WITH A PASSPHRASE.
// entries: { key: raw value }. Locked: PBKDF2 (SHA-256, random salt) → AES-GCM (random IV); salt, IV and
// iteration count are stored beside the ciphertext. -> the file's text (JSON).
export async function exportSettings(entries, { passphrase = "", now = new Date() } = {}) {
  const head = { format: SETTINGS_FORMAT, version: 1, exported: now.toISOString(),
    note: "Contains the tokens, keys and passwords of an Agent M dashboard. Whoever holds it can use them." };
  if (!passphrase) return JSON.stringify({ ...head, settings: entries }, null, 2) + "\n";
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await passphraseKey(passphrase, salt, PBKDF2_ITERATIONS);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(entries)));
  return JSON.stringify({ ...head, locked: { kdf: "PBKDF2", hash: "SHA-256", iterations: PBKDF2_ITERATIONS, salt: b64(salt),
    cipher: "AES-GCM", iv: b64(iv), data: b64(data) } }, null, 2) + "\n";
}

// -> { key: raw value }. A locked file without passphrase throws { locked: true }; a wrong passphrase
// throws { wrongPassphrase: true } — in both cases nothing has been read, so nothing can be imported.
export async function readSettingsFile(text, passphrase = "") {
  let f;
  try { f = JSON.parse(text); } catch { f = null; }
  if (!f || f.format !== SETTINGS_FORMAT) throw new Error("This is not an Agent M settings file.");
  let settings = f.settings;
  if (f.locked) {
    if (!passphrase) throw Object.assign(new Error("This file is locked — enter its passphrase."), { locked: true });
    try {
      const L = f.locked;
      const key = await passphraseKey(passphrase, unb64(L.salt), L.iterations);
      settings = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(L.iv) }, key, unb64(L.data))));
    } catch {
      throw Object.assign(new Error("Wrong passphrase, or the file is damaged — nothing was imported."), { wrongPassphrase: true });
    }
  }
  if (!settings || typeof settings !== "object") throw new Error("The file holds no settings.");
  return Object.fromEntries(Object.entries(settings).filter(([, v]) => typeof v === "string"));
}

// UC-042 6a: what this browser has is kept; only what is missing is added; both are listed. A token that is
// kept keeps its own expiry date. -> { put, added, kept, ignored }
export function mergeSettings(current, incoming) {
  const known = new Set(BROWSER_SETTINGS.map((s) => s.key));
  const put = {}, added = [], kept = [], ignored = [];
  const list = (v) => { try { const a = JSON.parse(v || "[]"); return Array.isArray(a) ? a.filter((x) => typeof x === "string") : []; } catch { return []; } };
  for (const [k, v] of Object.entries(incoming)) {
    if (!known.has(k)) { ignored.push(k); continue; }
    if (k === K_EXPIRES) continue; // follows its token, below
    if (k === K_PRODUCTS) {
      const have = list(current[k]), fresh = list(v).filter((a) => !have.includes(a));
      kept.push(...list(v).filter((a) => have.includes(a)).map((a) => `product ${a}`));
      added.push(...fresh.map((a) => `product ${a}`));
      if (fresh.length) put[k] = JSON.stringify([...have, ...fresh]);
      continue;
    }
    if (current[k]) { kept.push(settingLabel(k)); continue; }
    put[k] = v;
    added.push(settingLabel(k));
    if (k === K_TOKEN && incoming[K_EXPIRES]) put[K_EXPIRES] = incoming[K_EXPIRES];
  }
  return { put, added, kept, ignored };
}

// ---------------------------------------------------------------- product settings (UC-042 4–5, SPEC §14)
//
// A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY: docs/settings.md, one line `- name: value` per setting; a
// setting that is not listed has its default. PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF.

export const PRODUCT_SETTINGS_PATH = "docs/settings.md";
export const COLLABORATORS_PATH = "docs/collaborators.md";
const SETTING_LINE = /^- ([a-z][a-z0-9-]*):[ \t]*(.+?)[ \t]*$/;

export function parseProductSettings(text) {
  const out = {};
  for (const line of String(text || "").split("\n")) {
    const m = SETTING_LINE.exec(line);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

export const pseudonymisationOn = (text) => parseProductSettings(text).pseudonymisation !== "off";

// Set one setting's line (value null removes it); every other line of the file stays as it was.
export function setProductSetting(text, name, value, product) {
  let t = text || `# Settings of ${product}\n\nHow this product is developed, for everyone who works on it and every agent that runs for it.\n` +
    "Changed on the Agent M dashboard (Settings). One line `- name: value` per setting; a setting not listed has its default.\n\n";
  const lines = t.split("\n");
  const at = lines.findIndex((l) => SETTING_LINE.exec(l)?.[1] === name);
  if (at >= 0) {
    if (value === null) lines.splice(at, 1); else lines[at] = `- ${name}: ${value}`;
    return lines.join("\n");
  }
  if (value === null) return t;
  if (!t.endsWith("\n")) t += "\n";
  return `${t}- ${name}: ${value}\n`;
}

// SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS — shown before the switch can be saved.
export function pseudonymisationOffNotice({ repo, isPublic }) {
  return `With pseudonymisation off, report data from mails — the names, addresses and other details of the people ` +
    `who write — enters the issues and the repository of ${repo} unchanged. This is advisable only on a protected, ` +
    `non-public data space. Issue texts themselves stay neutral either way.` +
    (isPublic ? ` GitHub reports ${repo} as public: the data will be published — anyone on the internet can read it.` : "");
}

export const PSEUDONYMISATION_ON_NOTE = "Data written while pseudonymisation was off stays in the repository's history; removing it " +
  "needs a rewrite of that history.";

// One click commits docs/settings.md to the product (A PERSON'S OWN INPUT IS COMMITTED DIRECTLY); switching
// off needs the tick under the notice. current/currentBlob: the file as shown (null if absent).
export async function savePseudonymisation({ repo, branch, token, click, current, currentBlob, off, acknowledged }) {
  if (off && acknowledged !== true) throw new Error("Tick “I have read this” under the notice first.");
  return commitFiles({ repo, branch, token, click, message: `settings: pseudonymisation ${off ? "off" : "on"} (Agent M dashboard)`,
    files: [{ path: PRODUCT_SETTINGS_PATH, content: setProductSetting(current, "pseudonymisation", off ? "off" : null, repo),
      expectBlob: currentBlob || null }] });
}

// A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT: docs/collaborators.md, one table row per person who agreed
// to be named — name, account, date agreed.
const ACCOUNT_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;

export function parseCollaborators(text) {
  const out = [];
  for (const line of String(text || "").split("\n")) {
    const m = /^\|\s*([^|]+?)\s*\|\s*@?([A-Za-z0-9-]+)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*$/.exec(line);
    if (m) out.push({ name: m[1], account: m[2], agreed: m[3] });
  }
  return out;
}

export function formatCollaborators(list, product) {
  return `# Collaborators of ${product}\n\nPeople who agreed to be named in this repository, with the date they agreed. Anyone else is\n` +
    "named only by their account. Changed on the Agent M dashboard (Settings).\n\n| Name | Account | Agreed on |\n|---|---|---|\n" +
    list.map((c) => `| ${c.name} | @${c.account} | ${c.agreed} |\n`).join("");
}

export function addCollaborator(list, { name, account, agreed, consent }) {
  if (consent !== true) throw new Error("Tick “this person has agreed to be named” — without it, a person is named only by account.");
  const n = String(name ?? "").trim(), a = String(account ?? "").trim().replace(/^@/, ""), d = String(agreed ?? "").trim();
  if (!n || /[|\n]/.test(n)) throw new Error("Enter the person's name (without “|”).");
  if (!ACCOUNT_RE.test(a)) throw new Error(`“${a}” is not a GitHub account name.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error("Enter the date they agreed as YYYY-MM-DD.");
  if (list.some((c) => c.account.toLowerCase() === a.toLowerCase())) throw new Error(`@${a} is already listed.`);
  return [...list, { name: n, account: a, agreed: d }];
}

export const removeCollaborator = (list, account) => list.filter((c) => c.account !== account);

export async function saveCollaborators({ repo, branch, token, click, list, currentBlob }) {
  return commitFiles({ repo, branch, token, click, message: "collaborators: update (Agent M dashboard)",
    files: [{ path: COLLABORATORS_PATH, content: formatCollaborators(list, repo), expectBlob: currentBlob || null }] });
}
