// Review core — the logic of the Pages dashboard, free of DOM so that it runs under node --test.
//
// SPEC §10: acceptance is a commit in GitHub that adds an approval record; the record names the
// exact text by its git blob SHA; status is derived from the records, never stored. The dashboard
// holds no credential and only reads. The SPEC-section logic mirrors tools/apply_approvals.py
// (the workflow side); tests/review-core.test.mjs checks that both hash the same bytes.

export const ALLOWED_ORIGINS = new Set(["https://api.github.com", "https://raw.githubusercontent.com"]);
export const MAX_URL_VALUE = 1000; // NO TEXT TRAVELS IN A URL — a record is ~400 bytes

// ---------------------------------------------------------------- reading (GET only, no credential)

export async function fetchText(url, init = {}) {
  const u = new URL(url, globalThis.location?.href);
  const sameOrigin = globalThis.location && u.origin === globalThis.location.origin;
  if (!sameOrigin && !ALLOWED_ORIGINS.has(u.origin)) throw new Error(`origin not allowed: ${u.origin}`);
  if ((init.method || "GET").toUpperCase() !== "GET") throw new Error("only GET is allowed");
  const h = init.headers || {};
  if (Object.keys(h).some((k) => /^authorization$/i.test(k)) || init.credentials === "include") {
    throw new Error("the review dashboard sends no credential");
  }
  const r = await fetch(u, { method: "GET", headers: h, credentials: "omit", cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${u.href}`);
  return r.text();
}

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
