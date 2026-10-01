// Review core — the logic of the Pages dashboard, free of DOM so that it runs under node --test.
//
// SPEC §10: acceptance is a commit by the accepting person, on the server that hosts the repository
// (GitHub or a GitLab server), that adds an approval record; the record names the exact text by its git
// blob SHA; status is derived from the records, never stored. The dashboard reads with GET only
// (fetchText) and writes only on a person's click, with that person's token, as one commit
// (commitFiles for GitHub, commitFilesGitLab for GitLab). Each token goes only to the API of the server
// that issued it (fetchText, authHeaders) — the requests themselves are made in git-host.mjs. The SPEC-section logic
// mirrors tools/apply_approvals.py (the workflow side); tests/review-core.test.mjs checks that both hash the same bytes.
//
// Module: MOD-review-core

import {
  fetchText, REPO_RE, parseProductAddress, isGitLab, gitlabTokenPageUrl, commitFiles, gitlabAuth, gitlabApiBase, gitlabProject,
  gitlabSnapshot, commitFilesGitLab, writeFiles, tokenIdentity, tokenRefusal,
} from "./git-host.mjs";
import { jumpHostProblem, tunnelCommands } from "./bridge-tunnel.mjs";
import { settingKeys, parseJson, sessionList, gitlabTokenMap } from "./settings-store.mjs";
import { SLUG, reviewedId, kindOfPath, parseArchitecture, specRequirements, identifierKept } from "./artifacts.mjs";
// The two save functions of the product settings below still write here; they read the settings line and the collaborators
// file of the pseudonymiser until the writes leave the kernel (ITM-003, ITM-008).
import { SETTING_LINE, formatCollaborators } from "./pseudonymiser.mjs";

// ---------------------------------------------------------------- instance and products (SPEC §10)

export const UPSTREAM = "akmaier/agent-m";

// The product is chosen with ?repo=owner/name (GitHub) or ?product=<address> (GitHub or GitLab). A GitLab
// product adds `product` (parseProductAddress) and `refGiven` (false: its default branch is read from GitLab).
export function deriveTarget({ hostname, pathname, search }) {
  const owner = hostname.endsWith(".github.io") ? hostname.split(".")[0] : null;
  const name = pathname.split("/").filter(Boolean)[0];
  const instance = owner && name ? `${owner}/${name}` : UPSTREAM;
  const q = new URLSearchParams(search || "");
  const refOk = q.get("ref") && /^[A-Za-z0-9._\/-]{1,200}$/.test(q.get("ref")) && !q.get("ref").includes("..");
  const ref = refOk ? q.get("ref") : "main";
  const chosen = q.get("product") ? parseProductAddress(q.get("product")) : null;
  if (chosen && !chosen.error && chosen.kind === "gitlab") return { instance, repo: chosen.repo, ref, product: chosen, refGiven: Boolean(refOk) };
  const wanted = chosen && !chosen.error ? chosen.repo : q.get("repo");
  const repo = wanted && REPO_RE.test(wanted) && !wanted.includes("..") ? wanted : instance;
  return { instance, repo, ref };
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

// ---------------------------------------------------------------- approval records

const UC_KEYS = ["kind", "file", "blob"];
const SPEC_KEYS = ["kind", "queue", "entry", "proposal", "blob", "target", "anchor", "section"];

export function useCaseRecord(file, blob) {
  return { kind: "use-case", file, blob };
}

// The record of any reviewed file — use case, architecture decision or module: the same three lines, its kind from its path.
export function reviewedRecord(file, blob) {
  const kind = kindOfPath(file);
  if (!kind) throw new Error(`${file} is not a reviewed file (docs/use-cases/UC-…, docs/architecture/ARC-… or MOD-…)`);
  return { kind, file, blob };
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

// STATUS IS DERIVED FROM THE RECORDS, for every reviewed file: records of its own kind that name its path.
export function deriveReviewedStatus(file, currentBlob, records) {
  const kind = kindOfPath(file);
  const mine = records.filter((r) => r.kind === kind && r.file === file);
  if (mine.some((r) => r.blob === currentBlob)) return "accepted";
  return mine.length ? "changed" : "open";
}

// Where an accepted entry's text stands in the SPEC: at the line it wrote there, its proposal's first line
// (replaceSection puts the proposal at the anchor's place). Not at its anchor as it stood before acceptance —
// the proposal may have rewritten that line (queue 2026-09-30g, entry 01) or renamed its heading. When the
// proposal starts with its anchor, both are the same line.
const writtenAnchor = (proposalText) => String(proposalText ?? "").split("\n")[0];

// An accepted entry counts as applied while the SPEC holds its text at the place the entry wrote it. Only that
// section is compared: an entry may carry headings that later entries of its queue fill (queue
// 2026-09-24g, entry 05), and filling them must not turn the entry into "superseded".
export function deriveSpecStatus({ queue, nr, anchor, bis, proposalPath, proposalText, proposalBlob, sectionBlob,
  specText, decisions, records }) {
  const d = decisions.get(nr);
  if (d && d.decision === "uebernommen") {
    const written = writtenAnchor(proposalText);
    const inSpec = extractSection(specText, written, bis);
    const own = bis ? { lines: proposalText.split("\n"), from: 0, to: proposalText.split("\n").length }
      : extractSection(proposalText, written, null);
    if (inSpec.error || own.error) return "superseded";
    return sectionText(inSpec) === sectionText(own) ? "applied" : "superseded";
  }
  const mine = records.filter((r) => r.kind === "spec" && r.queue === queue && Number(r.entry) === nr
    && r.proposal === proposalPath);
  if (mine.some((r) => r.blob === proposalBlob && r.section === sectionBlob)) return "approved";
  return mine.length ? "stale" : "open";
}

// ---------------------------------------------------------------- differences (one diff for every view)

// Line diff by longest common subsequence: [[" " | "+" | "-", line]].
export function lineDiff(a, b) {
  const x = a.replace(/\n$/, "").split("\n"), y = b.replace(/\n$/, "").split("\n");
  const n = x.length, m = y.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) { out.push([" ", x[i]]); i++; j++; }
    else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) { out.push(["+", y[j]]); j++; }
    else { out.push(["-", x[i]]); i++; }
  }
  return out;
}

// Only the lines that differ.
export const changedLines = (a, b) => lineDiff(a, b).filter(([k]) => k !== " ");

export function diffHtml(a, b) {
  const d = lineDiff(a, b);
  if (!d.some(([k]) => k !== " ")) return `<p class="muted">No difference.</p>`;
  return `<pre class="diff">${d.map(([k, l]) => `<span class="d${k === "+" ? "add" : k === "-" ? "del" : "ctx"}">${esc(k)} ${esc(l)}</span>`).join("\n")}</pre>`;
}

// ---------------------------------------------------------------- the last accepted text (UC-008 2a, SPEC §10)
//
// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT: the text named by the most recent approval record for the same
// identifier, matched by identifier and not by path, so that a renamed file (UC-010) still finds what was accepted before.
// AN APPROVAL NAMES THE EXACT TEXT: that text is read from the server by the blob SHA the record names, and refused unless it
// hashes to that SHA.
//
// "Most recent" is the record committed last. How that is found without loading the history of the repository: for each
// record of the identifier, the server's list of commits is asked for the newest commit that touches that record's path, at
// the commit the dashboard has pinned (GitHub: GET /repos/{o}/{r}/commits?path=<record>&sha=<pinned>&per_page=1, its
// commit.committer.date; GitLab: GET /projects/:id/repository/commits?path=<record>&ref_name=<pinned>&per_page=1, its
// committed_date). A record is never edited after it is added (docs/approvals/README.md), so that commit is the one that added
// it. One request per record, and none when the identifier has only one record. Two records committed in the same second
// cannot be ordered this way; the dashboard then says so instead of guessing.

const HEX40 = /^[0-9a-f]{40}$/;

// Every approval record of that identifier, whatever path it names (not the records of SPEC changes).
export const recordsForId = (records, id) => records.filter((r) => r.kind !== "spec" && r.file && reviewedId(r.file) === id);

const b64text = (s) => new TextDecoder().decode(Uint8Array.from(atob(String(s).replace(/\s+/g, "")), (c) => c.charCodeAt(0)));

// A file's text by its blob SHA: from `cache` when it holds a text that hashes to that SHA — git never changes the text
// behind a SHA —, otherwise by read(), and then kept in `cache` if what was read hashes to the SHA. A cached text that does
// not hash to its SHA is never used; it is read again and replaced. The cache is optional and may fail at any step: every
// access is caught, and the text is then simply read. cache: { get(key) -> text | null, put(key, text) } (settings-store.mjs).
export async function readByBlob({ sha, read, cache = null, key = null }) {
  const k = key ?? sha, keep = Boolean(cache) && HEX40.test(String(sha));
  if (keep) {
    let t = null;
    try { t = await cache.get(k); } catch { t = null; }
    if (typeof t === "string" && await gitBlobSha(t) === sha) return t;
  }
  const text = await read();
  if (keep && typeof text === "string" && await gitBlobSha(text) === sha) {
    try { await cache.put(k, text); } catch { /* the page works without the cache */ }
  }
  return text;
}

// The exact text of a blob, read by its SHA from the product's server; refused unless it hashes to that SHA.
// GitHub: product absent or a github.com product (repo); GitLab: a GitLab product (its own project token).
// cache, cacheKey: where this browser keeps file texts by blob SHA (readByBlob).
export async function readBlob({ product = null, repo = null, blob, token = null, cache = null, cacheKey = null }) {
  if (!HEX40.test(String(blob))) throw new Error(`not a blob SHA: ${blob}`);
  const text = await readByBlob({ sha: blob, cache, key: cacheKey, read: async () => {
    if (isGitLab(product)) return fetchText(`${gitlabApiBase(product)}/repository/blobs/${blob}/raw`, {}, gitlabAuth(product, token));
    const r = repo ?? product?.repo;
    if (!REPO_RE.test(r) || r.includes("..")) throw new Error(`not a repository: ${r}`);
    const j = JSON.parse(await fetchText(`https://api.github.com/repos/${r}/git/blobs/${blob}`,
      { headers: { Accept: "application/vnd.github+json" } }, token));
    return j.encoding === "base64" ? b64text(j.content) : String(j.content ?? "");
  } });
  if (await gitBlobSha(text) !== blob) throw new Error(`the text read for blob ${blob.slice(0, 12)} does not match that blob SHA`);
  return text;
}

// When the record at `path` was committed: the date of the newest commit touching it at `commit` -> ISO string.
export async function recordCommittedAt({ product = null, repo = null, commit, path, token = null }) {
  const q = (ref) => `path=${encodeURIComponent(path)}&${ref}=${encodeURIComponent(commit)}&per_page=1`;
  if (isGitLab(product)) {
    const list = JSON.parse(await fetchText(`${gitlabApiBase(product)}/repository/commits?${q("ref_name")}`, {}, gitlabAuth(product, token)));
    if (!list.length) throw new Error(`${path}: no commit found`);
    return list[0].committed_date;
  }
  const r = repo ?? product?.repo;
  const list = JSON.parse(await fetchText(`https://api.github.com/repos/${r}/commits?${q("sha")}`,
    { headers: { Accept: "application/vnd.github+json" } }, token));
  if (!list.length) throw new Error(`${path}: no commit found`);
  return list[0].commit.committer.date;
}

// The last accepted text of identifier `id`: { record, text, committedAt, count } or null when it has no record.
// records: parsed records, each with `_path`, its own path in docs/approvals/.
// cache, repoKey: this browser's file texts by blob SHA (readByBlob), kept under `${repoKey}/${blob}`.
export async function lastAccepted({ product = null, repo = null, commit, token = null, records, id, cache = null, repoKey = null }) {
  const mine = recordsForId(records, id);
  if (!mine.length) return null;
  let record = mine[0], committedAt = null;
  if (mine.length > 1) {
    const dated = await Promise.all(mine.map(async (r) =>
      ({ r, at: await recordCommittedAt({ product, repo, commit, path: r._path, token }) })));
    const t = (d) => Date.parse(d.at);
    if (dated.some((d) => Number.isNaN(t(d)))) throw new Error(`the commit date of an approval record of ${id} could not be read`);
    dated.sort((a, b) => t(b) - t(a));
    if (t(dated[0]) === t(dated[1])) {
      throw new Error(`two approval records of ${id} were committed at the same time (${dated[0].at}), so which is the last cannot be told: ` +
        `${dated[0].r._path}, ${dated[1].r._path}`);
    }
    ({ r: record, at: committedAt } = dated[0]);
  }
  const text = await readBlob({ product, repo, blob: record.blob, token, cache, cacheKey: repoKey ? `${repoKey}/${record.blob}` : null });
  return { record, text, committedAt, count: mine.length };
}

// ---------------------------------------------------------------- status from the names in the tree (load per view)
//
// STATUS IS DERIVED FROM THE RECORDS — read first from their names. A record is written at approvalPath(id, blob):
// docs/approvals/<ID>-<first 12 hex of the accepted blob>.md for a use case, an architecture decision or a module (ID from its
// front matter, which names the file), and docs/approvals/spec-<queue folder>-<nn>-<first 12 hex of the proposal's blob>.md for
// a SPEC entry. The tree names every record with the page's first two requests, so whether a record exists for a file's current
// blob is known without reading one. A name only points at a record: where what a record says decides — a file that is opened,
// the last accepted text, an acceptance — the record itself is read, and a name its content contradicts counts as no record
// (AN APPROVAL NAMES THE EXACT TEXT). A name of neither form is always read; so is every record of an identifier whose names
// alone cannot decide.

const RECORD_NAME = /^docs\/approvals\/([^/]+)-([0-9a-f]{12})\.md$/;
const SPEC_RECORD_ID = /^spec-(.+)-(\d{2,})$/;
const RECORD_ID = new RegExp(`^(?:[A-Z]+-\\d{3,}|MOD-${SLUG})$`);
const specKey = (queue, nr) => `${String(queue).split("/").pop()}#${Number(nr)}`;

// The records named in a tree -> { byId: Map(ID -> [{ path, hex }]), spec: Map("<queue folder>#<nr>" -> [{ path, hex }]),
// unknown: [path] } — unknown: a record whose name follows neither form.
export function recordIndex(paths) {
  const byId = new Map(), spec = new Map(), unknown = [];
  const add = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
  for (const p of paths) {
    if (!/^docs\/approvals\/[^/]+\.md$/.test(p) || p.endsWith("/README.md")) continue;
    const m = RECORD_NAME.exec(p), s = m && SPEC_RECORD_ID.exec(m[1]);
    if (s) add(spec, specKey(s[1], s[2]), { path: p, hex: m[2] });
    else if (m && RECORD_ID.test(m[1])) add(byId, m[1], { path: p, hex: m[2] });
    else unknown.push(p);
  }
  return { byId, spec, unknown };
}

// The status of the reviewed file at `path`, whose current blob is `blob`, as deriveReviewedStatus gives it from all records.
// ids: the identifiers its records may be named by (its path's, and its front matter's where that was read).
// read(paths) -> the parsed records at those paths, each with `_path`. verify: decide from the records' content, never from a
// name — for a file that is opened. -> { status, record: the path of the record naming the current text, or null, byName }
export async function statusByNames({ index, path, blob, ids = [], read, verify = false }) {
  const named = [...new Set([reviewedId(path), ...ids].filter(Boolean))].flatMap((id) => index.byId.get(id) || []);
  const other = index.unknown.length ? (await read(index.unknown)).filter((r) => r.kind !== "spec" && r.file === path) : [];
  if (!verify && !other.length) {
    const hit = named.find((n) => n.hex === String(blob).slice(0, 12));
    if (hit) return { status: "accepted", record: hit.path, byName: true };
    if (!named.length) return { status: "open", record: null, byName: true };
  }
  const recs = [...(await read(named.map((n) => n.path))), ...other];
  const kind = kindOfPath(path);
  return { status: deriveReviewedStatus(path, blob, recs), byName: false,
    record: recs.find((r) => r.kind === kind && r.file === path && r.blob === blob)?._path ?? null };
}

// The status of a SPEC entry as deriveSpecStatus gives it from all records. entry: deriveSpecStatus's arguments without
// `records`. A decided entry needs no record; an undecided one reads only the records named for it (their names cannot carry
// the SPEC section's SHA that decides between approved and stale).
export async function specStatusByNames({ index, entry, read }) {
  const d = entry.decisions.get(entry.nr);
  if (d && d.decision === "uebernommen") return deriveSpecStatus({ ...entry, records: [] });
  const named = index.spec.get(specKey(entry.queue, entry.nr)) || [];
  const other = index.unknown.length ? (await read(index.unknown)).filter((r) => r.kind === "spec") : [];
  if (!named.length && !other.length) return "open";
  return deriveSpecStatus({ ...entry, records: [...(await read(named.map((n) => n.path))), ...other] });
}

// ---------------------------------------------------------------- architecture prerequisites (SPEC §11; UC-022, UC-023)

// ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS (UC-022 10a, UC-023 4b): every requirement the file names stands in the SPEC and
// is not withdrawn, every use case it names is accepted. useCases: [{ id, path, blob, status, record }] as the page derived
// them. -> { open: [{ name, reason }], useCases: the accepted ones it rests on, with the record that accepts each }
export function architecturePrerequisites({ arch, specText, useCases }) {
  const reqs = specRequirements(specText), open = [], rests = [];
  for (const n of arch.requirements) {
    const r = reqs.get(n);
    if (!r) open.push({ name: n, reason: "not in SPEC.md" });
    else if (r.withdrawn) open.push({ name: n, reason: "withdrawn in SPEC.md" });
  }
  for (const id of arch.useCases) {
    const u = useCases.find((x) => x.id === id);
    if (!u) open.push({ name: id, reason: "no such use case" });
    else if (u.status !== "accepted" || !u.record) open.push({ name: id, reason: u.status === "changed" ? "changed since it was accepted" : "not accepted yet" });
    else rests.push({ id, path: u.path, blob: u.blob, record: u.record });
  }
  return { open, useCases: rests };
}

// The accept panel while something the file names is open: no Accept that could be pressed, each open item named.
export function prerequisitesHtml(open) {
  if (!open.length) return "";
  return `<section class="panel accept blocked">
    <h3>Accept</h3>
    <p class="notice">This file can be accepted once everything it names is accepted. Still open:</p>
    <ul class="names">${open.map((o) => `<li><strong>${esc(o.name)}</strong> — ${esc(o.reason)}</li>`).join("")}</ul>
    <p><button class="btn primary" disabled>Accept</button></p>
    <details class="explain"><summary>What is this?</summary><div>An architecture decision or a module rests on the
      requirements and use cases it names (ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS). If one of them is still under review, the
      decision would be taken for a text that may still change. Accept the use cases on the <em>Use cases</em> tab and the
      requirements through <em>SPEC changes</em>, or edit this file so that it names only accepted ones.</div></details>
  </section>`;
}

// Checked again on the commit an acceptance is written on (planAcceptance): the text is the one shown (checked before), its
// impact list was shown if it is a change, and what it names is still accepted there. -> a reason, or null.
async function architectureRefusal(it, text, get) {
  if (it.changed && it.impactShown !== true) return "its impact list was not shown — open it again";
  const arch = parseArchitecture(it.path, text);
  const reqs = specRequirements((await get("SPEC.md")) ?? "");
  for (const n of arch.requirements) {
    const r = reqs.get(n);
    if (!r || r.withdrawn) return `${n} is ${r ? "withdrawn" : "not"} in SPEC.md on the branch — it can be accepted once that is settled`;
  }
  for (const id of arch.useCases) {
    const u = (it.requires || []).find((x) => x.id === id);
    if (!u) return `${id} is not accepted — accept it first`;
    const ucText = await get(u.path), rec = u.record ? await get(u.record) : null;
    const r = rec === null ? null : parseRecord(rec);
    if (ucText === null || await gitBlobSha(ucText) !== u.blob || !r || r.kind !== "use-case" || r.file !== u.path || r.blob !== u.blob) {
      return `${id} changed or lost its approval on the branch since this page was loaded — open it again`;
    }
  }
  return null;
}

// ---------------------------------------------------------------- the impact list as the page shows it (UC-023 step 4)

export function impactHtml(imp) {
  const li = (xs) => (xs.length ? xs.map((x) => `<code>${esc(x)}</code>`).join(", ") : "—");
  const rows = imp.affected.map((a) => `<li><strong>${esc(a.id)}</strong>${a.breaks ? ` <span class="badge b-stale">breaks</span>` : ""}
      — ${esc(a.reasons.join("; "))}<br>
      <span class="small">Code: ${a.code.length ? li(a.code) : "<em>no code yet</em>"} · Tests: ${li(a.tests)}</span></li>`).join("");
  const n = imp.names;
  return `<h3>Impact of this change</h3>
    ${imp.removedInterfaces.length || imp.alteredInterfaces.length ? `<p class="small">Interfaces removed: ${li(imp.removedInterfaces)} ·
      altered: ${li(imp.alteredInterfaces)}</p>` : ""}
    <p class="small"><strong>Affected modules</strong></p>
    <ul class="names">${rows || "<li>none — no module follows this decision</li>"}</ul>
    <p class="small"><strong>Requirements and use cases</strong> — named before and now: ${li(n.kept)} · newly named: ${li(n.added)} ·
      no longer named: ${li(n.removed)}</p>
    <details class="explain"><summary>What is this?</summary><div>Before a change to an accepted decision or module is accepted,
      the dashboard derives from the repository at the commit shown what hangs on it (AN ARCHITECTURE CHANGE IS NOT ACCEPTED
      WITHOUT AN IMPACT LIST): the modules that follow the decision or use an interface the change alters or removes — those
      that use a removed one first, marked <em>breaks</em> —, the code files and tests that name each in a header line
      <code>Module: MOD-…</code>, and the requirements and use cases the file names. Accepting changes no code: the code still
      reflects the old architecture until an implementation job changes it.</div></details>`;
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

// UC-001 3c · A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN: the steps on the page gitlabTokenPageUrl (git-host.mjs) opens.
export function gitlabTokenSteps(product) {
  return [
    `The button opens Settings → Access tokens of ${product.repo} on ${product.host}; there, press “Add new token”.`,
    "Token name: Agent M.",
    `Expiration date: a date of your choice — ${TOKEN_DAYS} days from today is a good default. Enter the same date below.`,
    "Select a role: Maintainer — GitLab lets only Maintainers push to a protected default branch. Select scopes: api — nothing else.",
    "Press “Create project access token” and copy the token GitLab now shows — it starts with glpat- and is shown only once.",
  ];
}

// UC-001 3d: the server offers no project access tokens, or the person is not Maintainer — and why a personal
// token is broader. GitLab: "On GitLab.com, project access tokens require a Premium or Ultimate subscription …
// On GitLab Self-Managed … available with any license"; prerequisite "The Maintainer or Owner role for the project".
export function gitlabNoProjectTokens(product) {
  const where = product.host === "gitlab.com"
    ? "On gitlab.com, project access tokens need a Premium or Ultimate subscription: a project on the Free tier offers none " +
      "(the Access tokens page says so, or has no “Add new token”)."
    : `${product.host} is a self-managed GitLab: it offers project access tokens with any licence, unless its administrators or ` +
      "the project's group have switched their creation off.";
  return `${where} To create one you need the Maintainer or Owner role in the project — if Settings → Access tokens is not ` +
    "in your sidebar, you do not have it: ask a Maintainer to create the token for you, or to give you the role. " +
    `A personal access token would also work here, but it is broader: with scope api it reaches every project you can reach on ` +
    `${product.host}, not only this one (A TOKEN IS SCOPED TO WHAT IT WRITES). You decide. Either way, Agent M stores it for ` +
    "this product only and sends it only to this project's API.";
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

// The role a GitLab token acts with (GitLab's access levels), and whether it can write to a protected default branch: only
// Maintainer (40) and Owner (50) can under GitLab's default protection.
const GITLAB_ROLES = { 10: "Guest", 15: "Planner", 20: "Reporter", 30: "Developer", 40: "Maintainer", 50: "Owner" };
export function gitlabRole(level) {
  const role = GITLAB_ROLES[level] || null;
  const canWrite = Number.isInteger(level) && level >= 40;
  return { role, canWrite, note: canWrite ? "" : `${role ? `role ${role}` : "this token"} cannot write to a protected default branch — ` +
    "the token needs role Maintainer" };
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// EVERY STEP EXPLAINS ITSELF: the only way to render a step, and it refuses one without explanation.
export function stepHtml({ title, body, explain }) {
  if (!explain || !String(explain).trim()) throw new Error(`step "${title}" has no \"explain\" text (EVERY STEP EXPLAINS ITSELF)`);
  return `<section class="step"><h3>${esc(title)}</h3>${body}` +
    `<details class="explain"><summary>What is this?</summary><div>${explain}</div></details></section>`;
}

// Saving an edit of a reviewed file (EDITS ARE PREPARED ON THE DASHBOARD): refused, before anything is sent, when the text
// carries another identifier than the one the file was opened with (AN EDITED FILE KEEPS ITS IDENTIFIER); written only if the
// file is still the text the editor opened (A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE). openedId null: a file without
// an identifier, such as a SPEC proposal.
export async function saveReviewedFile({ repo = null, product = null, branch, token, click, path, text, openedId, expectBlob }) {
  const refused = identifierKept(openedId, text);
  if (refused) throw new Error(refused);
  return writeFiles({ repo, product, branch, token, click, message: `edit ${String(path).split("/").pop()} (Agent M dashboard)`,
    files: [{ path, content: text, expectBlob: expectBlob || null }] });
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
// accepted: the entry is already written into the SPEC — its current text is read where it wrote it (writtenAnchor),
// as deriveSpecStatus reads it.
export function sectionForEntry({ specText, entries, nr, accepted = false, _seen = [] }) {
  const e = entries.find((x) => x.nr === nr);
  if (accepted) {
    const s = extractSection(specText, writtenAnchor(e.proposalText), e.bis);
    return s.error ? { error: s.error, needs: [] } : { current: sectionText(s), needs: [], spec: specText };
  }
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

// SEVERAL FILES ARE ACCEPTED IN ONE CLICK — a review page (UC-008 3e, UC-022 step 10, UC-023 step 5): every reviewed file of one
// area that is not accepted is shown, in the page's order; those that can be accepted are counted, and their items are what
// "Accept all N shown" accepts — through acceptItems, like ticked files. A file that names something not accepted
// (ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS), a change shown without its impact list (AN ARCHITECTURE CHANGE IS NOT ACCEPTED
// WITHOUT AN IMPACT LIST), or a file the page could not show as it must be (`problem`) is shown, not counted, and named.
// files: [{ item, status, open: [{ name, reason }], problem: text | null }] — item as acceptItems takes it, naming the blob of
// the text the page rendered. -> { shown, items, blocked: [{ label, open, problem }] }
export function reviewPage(files) {
  const shown = files.filter((f) => f.status !== "accepted");
  const why = (f) => f.problem || (f.item.kind !== "use-case" && f.item.changed && f.item.impactShown !== true
    ? "its impact list could not be shown" : null);
  const counted = (f) => !(f.open || []).length && !why(f);
  return { shown, items: shown.filter(counted).map((f) => f.item),
    blocked: shown.filter((f) => !counted(f)).map((f) => ({ label: itemLabel(f.item), open: f.open || [], problem: why(f) })) };
}

// The files of one acceptance commit, computed from the commit it is written on.
// read(path) -> text or null on that commit. -> { files, accepted, leftOut: [{ label, reason }] }
export async function planAcceptance({ items, read, now = new Date() }) {
  const texts = new Map(), files = new Map(), accepted = [], leftOut = [];
  const get = async (p) => { if (!texts.has(p)) texts.set(p, await read(p)); return texts.get(p); };
  const out = (it, reason) => leftOut.push({ label: itemLabel(it), reason });
  for (const it of items.filter((x) => x.kind !== "spec")) {
    const text = await get(it.path);
    if (text === null) { out(it, "the file no longer exists"); continue; }
    if (await gitBlobSha(text) !== it.blob) { out(it, "the file changed after it was shown — open it again"); continue; }
    if (it.kind !== "use-case") {
      const why = await architectureRefusal(it, text, get);
      if (why) { out(it, why); continue; }
    }
    files.set(approvalPath(it.id, it.blob), recordText(it.kind === "use-case" ? useCaseRecord(it.path, it.blob) : reviewedRecord(it.path, it.blob)));
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
// product: a GitLab product (parseProductAddress) — the commit is then made there (writeFiles). If GitLab wrote the
// commit on a newer head than the one checked, `warning` names the files this acceptance read that changed in between.
export async function acceptItems({ repo, product = null, branch, token, click, items, readAt, now = new Date() }) {
  if (!items.length) throw new Error("nothing ticked");
  const gaps = missingNeeds(items);
  if (gaps.length) throw new Error(gaps.map((g) => g.message).join(" "));
  let plan = null;
  const read = new Set();
  try {
    const commit = await writeFiles({ repo, product, branch, token, click,
      message: () => `accept ${plan.accepted.join(", ")} (Agent M dashboard)`,
      files: async (head) => {
        plan = await planAcceptance({ items, read: (p) => { read.add(p); return readAt(head, p); }, now });
        return plan.files;
      } });
    const changed = (commit.changedMeanwhile || []).filter((p) => read.has(p));
    const warning = changed.length
      ? `GitLab wrote this commit on ${String(commit.parent).slice(0, 7)}, a newer state than the one checked (${String(commit.base).slice(0, 7)}): ` +
        `a commit that arrived at the same moment changed ${changed.join(", ")}. The acceptance was checked on the older text — open ` +
        "these files again and look whether it still covers them."
      : null;
    return { commit, accepted: plan.accepted, leftOut: plan.leftOut, warning };
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
// For a GitLab product, `token` is its project token, and the product's server is the only one contacted.
export async function addProduct({ address, token, click, store }) {
  if (!click || click.isTrusted !== true) throw new Error("a write needs a person's click");
  const product = parseProductAddress(address);
  if (product.error) throw new Error(product.error);
  if (isGitLab(product)) {
    if (!token) throw new Error("A GitLab product is written with its project token — store it in Step B first.");
    const info = await gitlabProject({ product, token });
    if (!info.default_branch) throw new Error(`${product.address} has no branch yet — push a first commit to it, then add it here.`);
    const snap = await gitlabSnapshot({ product, ref: info.default_branch, token });
    const files = missingLayout(snap.tree.map((e) => e.path), product.repo);
    const commit = files.length
      ? await commitFilesGitLab({ product, branch: info.default_branch, token, click, files,
        message: "Add the Agent M review layout (Agent M dashboard)" })
      : null;
    store.addProduct(product.address);
    return { commit, product };
  }
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

function tokenStateLine(token, expires, tokenState, now, server = "GitHub") {
  if (!token) return "— not set";
  if (tokenState?.refused) return `✗ refused — ${esc(server)} did not accept it at the last use`;
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
      <em>Remove</em> and <em>Clear</em> take them off this browser's list and change nothing in their repositories. A GitLab
      product's project token goes with it.</div></details>
  </div><!--/setting-->`;
  // A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN: one line per token, hidden with Show, Test, Change, Clear, and the
  // project's Access tokens page, where it is renewed (AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED).
  const gl = gitlabTokenMap(entries[K_GITLAB]);
  const lines = Object.entries(gl).map(([a, t]) => {
    const p = parseProductAddress(a), ok = !p.error && isGitLab(p), showKey = `${K_GITLAB} ${a}`;
    const st = tokenState?.gitlab?.[a];
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
    const showKey = `${K_SESSIONS} ${s.name}`, st = tokenState?.sessions?.[s.name];
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

// ---------------------------------------------------------------- product settings (UC-042 4–5, SPEC §14)
//
// A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY: docs/settings.md, one line `- name: value` per setting; a
// setting that is not listed has its default. PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF.

export const PRODUCT_SETTINGS_PATH = "docs/settings.md";
export const COLLABORATORS_PATH = "docs/collaborators.md";

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
export function pseudonymisationOffNotice({ repo, isPublic, server = "GitHub" }) {
  return `With pseudonymisation off, report data from mails — the names, addresses and other details of the people ` +
    `who write — enters the issues and the repository of ${repo} unchanged. This is advisable only on a protected, ` +
    `non-public data space. Issue texts themselves stay neutral either way.` +
    (isPublic ? ` ${server} reports ${repo} as public: the data will be published — anyone on the internet can read it.` : "");
}

export const PSEUDONYMISATION_ON_NOTE = "Data written while pseudonymisation was off stays in the repository's history; removing it " +
  "needs a rewrite of that history.";

// One click commits docs/settings.md to the product (A PERSON'S OWN INPUT IS COMMITTED DIRECTLY); switching
// off needs the tick under the notice. current/currentBlob: the file as shown (null if absent).
export async function savePseudonymisation({ repo, product = null, branch, token, click, current, currentBlob, off, acknowledged }) {
  if (off && acknowledged !== true) throw new Error("Tick “I have read this” under the notice first.");
  return writeFiles({ repo, product, branch, token, click, message: `settings: pseudonymisation ${off ? "off" : "on"} (Agent M dashboard)`,
    files: [{ path: PRODUCT_SETTINGS_PATH, content: setProductSetting(current, "pseudonymisation", off ? "off" : null, repo ?? product?.repo),
      expectBlob: currentBlob || null }] });
}

export async function saveCollaborators({ repo, product = null, branch, token, click, list, currentBlob }) {
  return writeFiles({ repo, product, branch, token, click, message: "collaborators: update (Agent M dashboard)",
    files: [{ path: COLLABORATORS_PATH, content: formatCollaborators(list, repo ?? product?.repo), expectBlob: currentBlob || null }] });
}
