# Module: MOD-spec-changes
# Guards: A STALE APPROVAL IS NOT APPLIED; THE APPROVED TEXT IS TAKEN VERBATIM; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
# Level: unit
"""The helpers of the tests that write an approved SPEC change into a throwaway repository: the record's text, a blob's SHA, a section of a text, and
`apply(root)` — what the instance's workflow does, MOD-spec-changes' applyApproved on the repository in `root`, its files written as the entry writes them.
Deterministic, no network. `apply` returns (1, report) when a record is refused and (0, report) otherwise; the report holds one line per record,
"<record>: applied" or "<record>: refused — <reason>" with applyApproved's reason."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

from jsrun import js

ROOT = Path(__file__).resolve().parents[1]

APPROVALS = "docs/approvals"
QUEUES = "docs/spec-freigaben/"
SPEC_KEYS = ["kind", "queue", "entry", "proposal", "blob", "target", "anchor", "section"]


def blob_sha(text: str) -> str:
    data = text.encode("utf-8")
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


def record_text(r: dict) -> str:
    return "".join(f"{k}: {r[k]}\n" for k in SPEC_KEYS)


def parse_record(text: str) -> dict:
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"^([a-z]+):[ \t]*(.*)$", text, re.M)}


def extract_section(text: str, anchor: str, bis: str | None = None):
    """The section of `text` whose heading line is `anchor`, as MOD-spec-document's sectionText gives its exact bytes -> a section, or the reason there is none."""
    found = js("return specDocument.sectionText(args.text, args.anchor);".replace("args.text", json.dumps(text)).replace("args.anchor", json.dumps(anchor)))
    return found if found is not None else f"no section {anchor!r} in the text"


def section_text(sec) -> str:
    if sec is None or (isinstance(sec, str) and sec.startswith("no section ")):
        raise ValueError(sec)
    return sec


# The section as the dashboard's own acceptance (docs/assets/review-core.mjs) takes it: the lines to the next heading, trailing blank lines dropped.
def legacy_extract_section(text: str, anchor: str, bis: str | None = None):
    """-> (lines, from, to) or an error string. Headings inside code fences do not count."""
    lines = text.split("\n")
    fenced, open_ = [], False
    for l in lines:
        if l.lstrip().startswith("```"):
            fenced.append(True)
            open_ = not open_
        else:
            fenced.append(open_)
    hits = [i for i, l in enumerate(lines) if l.strip() == anchor.strip() and not fenced[i]]
    if len(hits) != 1:
        return f"anchor found {len(hits)} times instead of exactly once"
    von = hits[0]
    if bis:
        after = [i for i, l in enumerate(lines) if i > von and l.strip() == bis.strip() and not fenced[i]]
        if len(after) != 1:
            return f"end anchor found {len(after)} times instead of exactly once"
        return lines, von, after[0]
    if not re.match(r"#{1,6} ", lines[von]):
        return lines, von, von + 1
    level = len(re.match(r"#*", lines[von]).group(0))
    for i in range(von + 1, len(lines)):
        if fenced[i]:
            continue
        m = re.match(r"(#{1,6}) ", lines[i])
        if m and len(m.group(1)) <= level:
            return lines, von, i
    return lines, von, len(lines)


def legacy_section_text(sec) -> str:
    if isinstance(sec, str):
        raise ValueError(sec)
    lines, von, bis = sec
    return "\n".join(lines[von:bis]).rstrip("\n") + "\n"


RUN = r"""
import { applyApproved } from %s;
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
const root = process.argv[2];
const walk = (dir) => readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) => (e.name === ".git" ? [] : e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const virtual = new Map();
if (!walk("").includes("docs/sources.md")) {
  // A product whose requirements name the source "PO" links it: the register entry and the link a product needs (`A PRODUCT LINKS THE SOURCES THAT APPLY`).
  const hash = "a".repeat(64);
  virtual.set("docs/sources.md", ["# Sources", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-po | 2026-10-01 | ${hash} | |`, ""].join("\n"));
  virtual.set("docs/sources/SRC-po.md", ["---", "id: SRC-po", "title: PO", "kind: person", "authority: normative", "licence: fixture", "identifier: fixture", "---", "# SRC-po PO", "", "A fixture source.", "",
    "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", `| \`2026-10-01\` | 2026-10-01 | fixture | fixture | version hash \`${hash}\` |`, ""].join("\n"));
}
const paths = [...walk(""), ...virtual.keys()];
const bytes = (p) => (virtual.has(p) ? Buffer.from(virtual.get(p)) : readFileSync(join(root, p)));
const blob = (p) => { if (!paths.includes(p)) return null; const b = bytes(p); return createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${b.length}\0`), b])).digest("hex"); };
const snapshot = { commit: "0".repeat(40), paths, read: async (p) => (paths.includes(p) ? bytes(p).toString("utf8") : null), blob };
const { files, applied, refused } = await applyApproved(snapshot, new Date());
for (const [p, text] of Object.entries(files)) writeFileSync(join(root, p), text);
process.stdout.write(JSON.stringify({ applied, refused }));
"""


def apply(root) -> tuple[int, str]:
    uri = (ROOT / "src/spec-changes/index.mjs").as_uri()
    r = subprocess.run(["node", "--input-type=module", "-", str(root)], input=RUN % json.dumps(uri), capture_output=True, text=True)
    if r.returncode != 0:
        raise AssertionError(r.stderr.strip()[:900])
    done = json.loads(r.stdout)
    lines = [f"{Path(p).name}: applied" for p in done["applied"]] + [f"{Path(x['record']).name}: refused — {x['reason']}" for x in done["refused"]]
    return (1 if done["refused"] else 0), "\n".join(lines)
