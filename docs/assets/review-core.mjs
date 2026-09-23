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
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${u.origin}${u.pathname}`);
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

export function parseProducts(text) {
  const out = [];
  let fenced = false;
  for (const line of text.split("\n")) {
    if (line.trimStart().startsWith("```")) { fenced = !fenced; continue; }
    if (fenced) continue; // format examples in code blocks are not products
    const m = line.match(/^- `([^`]+)`(?:\s+—\s+(.*))?\s*$/);
    if (m && REPO_RE.test(m[1]) && !m[1].includes("..") && !out.some((p) => p.repo === m[1])) {
      out.push({ repo: m[1], note: (m[2] || "").trim() });
    }
  }
  return out;
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
— Permission: Contents, read and write. That is all: accepting, editing and adding a product are commits.
— Expiration: 90 days is preset; GitHub mails you before it expires, and you can renew it.
Why this scope: every write the dashboard makes is a commit you asked for by clicking; no other permission
is needed, so none is asked for.
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

export function deriveSpecStatus({ queue, nr, proposalPath, proposalText, proposalBlob, sectionBlob,
  specText, decisions, records }) {
  const d = decisions.get(nr);
  if (d && d.decision === "uebernommen") {
    return specText.includes(proposalText.replace(/\n+$/, "")) ? "applied" : "superseded";
  }
  const mine = records.filter((r) => r.kind === "spec" && r.queue === queue && Number(r.entry) === nr
    && r.proposal === proposalPath);
  if (mine.some((r) => r.blob === proposalBlob && r.section === sectionBlob)) return "approved";
  return mine.length ? "stale" : "open";
}

// ---------------------------------------------------------------- guided token setup (SPEC §7)

export function tokenLinkUrl(instance) {
  const q = new URLSearchParams({
    name: `Agent M · ${instance}`,
    description: `Agent M dashboard of ${instance}: commits you ask for by clicking (accept, edit, add product).`,
    expires_in: "90",
    contents: "write",
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
    "Leave the permissions as they are (Contents: read and write), scroll down and press “Generate token”.",
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
export async function commitFiles({ repo, branch, files, message, token, click }) {
  if (!click || click.isTrusted !== true) throw new Error("a write needs a person's click");
  if (!token) throw new Error("writing needs a stored token");
  if (!REPO_RE.test(repo) || repo.includes("..")) throw new Error(`not a repository: ${repo}`);
  if (!files.length) throw new Error("nothing to write");
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
  const commit = await call("POST", "/git/commits", { message, tree: tree.sha, parents: [head] });
  await call("PATCH", `/git/refs/heads/${ref}`, { sha: commit.sha, force: false });
  return { sha: commit.sha, url: commit.html_url || `https://github.com/${repo}/commit/${commit.sha}` };
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

export function addProductText(text, repo, note) {
  if (!REPO_RE.test(repo) || repo.includes("..")) throw new Error(`not a repository: ${repo}`);
  if (parseProducts(text).some((p) => p.repo === repo)) return text;
  const clean = String(note || "").replace(/[\r\n`]/g, " ").trim();
  return (text.endsWith("\n") ? text : text + "\n") + `- \`${repo}\`${clean ? ` — ${clean}` : ""}\n`;
}
