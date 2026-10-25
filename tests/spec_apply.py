# Module: MOD-spec-changes
# Guards: A STALE APPROVAL IS NOT APPLIED; THE APPROVED TEXT IS TAKEN VERBATIM; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
# Level: unit
"""The helpers of the tests that write an approved SPEC change into a throwaway repository: the record's text, a blob's SHA, a section of a text,
and the two writers of an approved entry on the repository in `root`, its files written back as the writer writes them:

- `apply(root)` — what the instance's workflow does, MOD-spec-changes' applyApproved; it returns (1, report) when a record is refused and
  (0, report) otherwise; the report holds one line per record, "<record>: applied" or "<record>: refused — <reason>" with applyApproved's reason.
- `accept(root, shown)` — the dashboard's acceptance commit, MOD-spec-changes' acceptEntries on the host of tests/memory-host.mjs, made by a
  person who was shown the entries `shown` ([{ queue, entry, proposalBlob, sectionBlob }]); it returns (refused, paths): the refusals, each
  { queue, entry, reason }, and the paths the commit wrote — none while any entry is refused.
- `entry_view(root, queue, entry)` — what the reviewer sees beside an entry, MOD-spec-changes' entryView, with the graph stored for the commit
  (tests/stored-graph-fake.mjs): { current, createdBy, state }.

A repository without docs/sources.md gets, for both writers, the register entry and the link a product needs for the source "PO" its
requirements name (`A PRODUCT LINKS THE SOURCES THAT APPLY`), those of tests/fixtures/gates/; they are not written into it. Deterministic, no network."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

from jsrun import js

ROOT = Path(__file__).resolve().parents[1]

SPEC_KEYS = ["kind", "queue", "entry", "proposal", "blob", "target", "anchor", "section"]


def blob_sha(text: str) -> str:
    data = text.encode("utf-8")
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


def record_text(r: dict) -> str:
    """A record as a person writes it on GitHub's page: one `key: value` line each, in the order of SPEC_KEYS."""
    return "".join(f"{k}: {r[k]}\n" for k in SPEC_KEYS)


def parse_record(text: str) -> dict:
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"^([a-z]+):[ \t]*(.*)$", text, re.M)}


def extract_section(text: str, anchor: str):
    """The section of `text` whose heading line is `anchor`, as MOD-spec-document's sectionText gives its exact bytes -> a section, or the reason there is none."""
    found = js("return specDocument.sectionText(args.text, args.anchor);".replace("args.text", json.dumps(text)).replace("args.anchor", json.dumps(anchor)))
    return found if found is not None else f"no section {anchor!r} in the text"


def section_text(sec) -> str:
    if sec is None or (isinstance(sec, str) and sec.startswith("no section ")):
        raise ValueError(sec)
    return sec


# The repository in `root` (process.argv[2]) as a list of paths and their texts, with the source "PO" where it links none.
PRELUDE = r"""
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
const root = process.argv[2];
const walk = (dir) => readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) => (e.name === ".git" ? [] : e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const virtual = new Map();
if (!walk("").includes("docs/sources.md")) {
  for (const p of ["docs/sources.md", "docs/sources/SRC-po.md"]) virtual.set(p, readFileSync(new URL(`./fixtures/gates/${p}`, %(host)s), "utf8"));
}
const paths = [...walk(""), ...virtual.keys()];
const bytes = (p) => (virtual.has(p) ? Buffer.from(virtual.get(p)) : readFileSync(join(root, p)));
const files = Object.fromEntries(paths.map((p) => [p, bytes(p).toString("utf8")]));
const write = (p, text) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), text); };
"""

RUN = PRELUDE + r"""
import { applyApproved } from %(changes)s;
const blob = (p) => { if (!paths.includes(p)) return null; const b = bytes(p); return createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${b.length}\0`), b])).digest("hex"); };
const snapshot = { commit: "0".repeat(40), paths, read: async (p) => (paths.includes(p) ? bytes(p).toString("utf8") : null), blob };
const { files: written, applied, refused } = await applyApproved(snapshot, new Date());
for (const [p, text] of Object.entries(written)) write(p, text);
process.stdout.write(JSON.stringify({ applied, refused }));
"""

ACCEPT = PRELUDE + r"""
import { acceptEntries } from %(changes)s;
import { readDocument } from %(documents)s;
import { sourceSchemas } from %(register)s;
import { memoryHost } from %(host)s;
const shown = JSON.parse(process.argv[3]);
const sources = { links: readDocument(sourceSchemas().links, "docs/sources.md", files["docs/sources.md"]),
  register: paths.filter((p) => /^docs\/sources\/[^/]+\.md$/.test(p)).map((p) => readDocument(sourceSchemas().entry, p, files[p])) };
const product = memoryHost(files);
const done = await acceptEntries(product.host, shown, "reviewer", new Date(process.argv[4]), sources);
const [commit] = product.commits();
for (const f of commit?.files ?? []) write(f.path, f.text);
process.stdout.write(JSON.stringify({ refused: done.refused ?? [], paths: (commit?.files ?? []).map((f) => f.path) }));
"""

VIEW = PRELUDE + r"""
import { entryView } from %(changes)s;
import { memoryHost } from %(host)s;
import { withStoredGraph } from %(graph)s;
const view = await entryView(process.argv[3], Number(process.argv[4]), withStoredGraph(await memoryHost(files).host.readSnapshot("main")));
process.stdout.write(JSON.stringify({ current: view.current, createdBy: view.createdBy, state: view.state }));
"""

MODULES = {"changes": "src/spec-changes/index.mjs", "documents": "src/documents/index.mjs", "register": "src/source-register/index.mjs",
           "host": "tests/memory-host.mjs", "graph": "tests/stored-graph-fake.mjs"}


def node(script: str, *args) -> dict:
    code = script % {name: json.dumps((ROOT / path).as_uri()) for name, path in MODULES.items()}
    r = subprocess.run(["node", "--input-type=module", "-", *map(str, args)], input=code, capture_output=True, text=True)
    if r.returncode != 0:
        raise AssertionError(r.stderr.strip()[:900])
    return json.loads(r.stdout)


def apply(root) -> tuple[int, str]:
    done = node(RUN, root)
    lines = [f"{Path(p).name}: applied" for p in done["applied"]] + [f"{Path(x['record']).name}: refused — {x['reason']}" for x in done["refused"]]
    return (1 if done["refused"] else 0), "\n".join(lines)


def accept(root, shown: list, now: str = "2026-10-01T12:00:00Z") -> tuple[list, list]:
    done = node(ACCEPT, root, json.dumps(shown), now)
    return done["refused"], done["paths"]


def entry_view(root, queue: str, entry: int) -> dict:
    return node(VIEW, root, queue, entry)
