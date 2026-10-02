// applyApprovals — what the instance's apply workflow writes for every `kind: spec` approval record committed without the
// dashboard (SPEC §10 WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE · A STALE APPROVAL IS NOT APPLIED; UC-006 4c).
//
// Module: MOD-review-core
//
// The checks and the bytes are those of the dashboard's acceptance commit (planAcceptance in ../review-core.mjs): the
// proposal and the SPEC section must still have the blob SHAs the record names, the section is replaced by the proposal
// byte for byte, and the decision row is the one planAcceptance writes. Record by record, in the order of their names, as
// tools/apply_approvals.py does — with the same report, line for line —, which this engine replaces (ITM-017 retires it).
// Where the Python tool reads a text with universal newlines (findings F1–F3,
// docs/measurements/2026-10-01_apply-approvals-in-the-engine.md), this engine reads it as its bytes decode, so a CR is a
// byte like any other.
//
// It never reads and never writes itself (ARC-003): read(path) is a port — on the commit the workflow runs on, a file's
// text or null, and for a folder (a path ending in "/") the names of the files in it or null. It returns the files of the
// commit; the shell commits them.

import { gitBlobSha, parseRecord, extractSection, sectionText, parseQueueIndex, replaceSection, decisionRow }
  from "../review-core.mjs";

const APPROVALS = "docs/approvals/";
const QUEUES = "docs/spec-freigaben/";
const SPEC_KEYS = ["kind", "queue", "entry", "proposal", "blob", "target", "anchor", "section"];
const APPLIED_RE = /\|\s*approval:([^\s|]+)\s*\|/g; // as planAcceptance and applied_records() of the Python tool

// Names in the order Python sorts them: by code point, not by UTF-16 unit.
const byCodePoint = (a, b) => {
  const x = [...a].map((c) => c.codePointAt(0)), y = [...b].map((c) => c.codePointAt(0));
  for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i];
  return x.length - y.length;
};

// A text as Python's repr() writes it, for the report lines the Python tool writes with !r.
const NOT_PRINTABLE = /^[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}\p{Zl}\p{Zp}\p{Zs}]$/u;
function pyRepr(s) {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = q;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (ch === q || ch === "\\") out += `\\${ch}`;
    else if (ch === "\t") out += "\\t";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (c < 0x20 || c === 0x7f) out += `\\x${c.toString(16).padStart(2, "0")}`;
    else if (c < 0x7f || !NOT_PRINTABLE.test(ch)) out += ch;
    else if (c < 0x100) out += `\\x${c.toString(16).padStart(2, "0")}`;
    else if (c < 0x10000) out += `\\u${c.toString(16).padStart(4, "0")}`;
    else out += `\\U${c.toString(16).padStart(8, "0")}`;
  }
  return out + q;
}

// The entry number of a record, as Python's int() reads the digits the queue's index uses; null when it is no number.
const entryNumber = (s) => (/^[+-]?\d+(?:_\d+)*$/.test(s) ? Number(s.replace(/_/g, "")) : null);

const head = (s, n) => [...String(s)].slice(0, n).join("");

// -> { files: [{ path, content }], report: the report text, one line per record handled, refused: [{ record, reason }] }
export async function applyApprovals({ read, now = new Date() }) {
  const texts = new Map(), changed = new Set(), report = [], refused = [];
  const get = async (p) => { if (!texts.has(p)) texts.set(p, await read(p)); return texts.get(p); };
  const put = (p, t) => { texts.set(p, t); changed.add(p); };
  const refuse = (name, reason) => { report.push(`${name}: refused — ${reason}`); refused.push({ record: name, reason }); };

  const listed = await read(APPROVALS);
  const names = (Array.isArray(listed) ? listed : []).filter((n) => n.endsWith(".md") && n !== "README.md").sort(byCodePoint);
  for (const name of names) {
    const r = parseRecord((await get(APPROVALS + name)) ?? "");
    if (r.kind !== "spec") continue;
    const missing = SPEC_KEYS.filter((k) => !r[k]);
    if (missing.length) { refuse(name, `missing ${missing.join(", ")}`); continue; }
    const queue = r.queue.replace(/\/+$/, ""), proposal = r.proposal;
    if (!queue.startsWith(QUEUES) || !proposal.startsWith(`${queue}/`) || proposal.includes("..") || queue.includes("..")) {
      refuse(name, `proposal ${pyRepr(proposal)} is not a file of queue ${pyRepr(queue)}`); continue;
    }
    const index = await get(`${queue}/index.md`);
    if (typeof index !== "string") { refuse(name, `queue ${queue} has no index.md`); continue; }
    const decPath = `${queue}/entscheidungen.md`;
    const decText = (await get(decPath)) ?? "";
    if (new Set([...decText.matchAll(APPLIED_RE)].map((m) => m[1])).has(name)) continue;
    const nr = entryNumber(r.entry);
    if (nr === null) { refuse(name, `entry ${pyRepr(r.entry)} is not a number`); continue; }
    const entry = parseQueueIndex(index).entries.find((e) => e.nr === nr);
    if (!entry) { refuse(name, `queue has no entry ${nr}`); continue; }
    if (entry.anchor !== r.anchor) {
      refuse(name, `record anchor ${pyRepr(r.anchor)} is not the queue's anchor ${pyRepr(entry.anchor)}`); continue;
    }
    const prop = await get(proposal);
    if (typeof prop !== "string") { refuse(name, `proposal ${proposal} does not exist`); continue; }
    const propBlob = await gitBlobSha(prop);
    if (propBlob !== r.blob) { refuse(name, `proposal changed after approval (${head(propBlob, 12)} ≠ ${head(r.blob, 12)})`); continue; }
    const spec = await get(r.target);
    if (typeof spec !== "string") { refuse(name, `target ${r.target} does not exist`); continue; }
    const sec = extractSection(spec, entry.anchor, entry.bis);
    if (sec.error) { refuse(name, sec.error); continue; }
    if (await gitBlobSha(sectionText(sec)) !== r.section) { refuse(name, "SPEC section changed after approval"); continue; }
    put(r.target, replaceSection(spec, entry.anchor, entry.bis, prop));
    put(decPath, (decText && !decText.endsWith("\n") ? `${decText}\n` : decText) + decisionRow(nr, name, now));
    report.push(`${name}: applied — ${r.target} ${entry.anchor}`);
  }
  return { files: [...changed].map((path) => ({ path, content: texts.get(path) })), report: report.join("\n"), refused };
}
