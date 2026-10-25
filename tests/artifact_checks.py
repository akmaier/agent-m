# Module: MOD-documents
"""Shared checks for the review artifacts under docs/ (SPEC §4, §10, §11).

The checks are functions that return a list of problems, so that each test can run them once on
the real files and once on a deliberately broken copy — the counter-proof of
SOFTWARE_MAINTENANCE §4.0a rule 5, built into the suite instead of run once by hand.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from jsrun import js

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
HEX40 = re.compile(r"^[0-9a-f]{40}$")


def front_matter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end < 0:
        return {}, text
    fields, key = {}, None
    for line in text[4:end].split("\n"):
        m = re.match(r"^([a-z][a-z0-9_-]*):\s*(.*)$", line)
        if m:
            key = m.group(1)
            fields[key] = m.group(2).strip() if m.group(2).strip() else []
        elif key and re.match(r"^\s+-\s+", line):
            fields.setdefault(key, [])
            if isinstance(fields[key], list):
                fields[key].append(re.sub(r"^\s+-\s+", "", line).strip())
    return fields, text[end + 5:]


# ---------------------------------------------------------------- use cases (SPEC §4, §10)
# A use case is read and checked by MOD-documents — documentFindings, by the use-case schema artifactSchemas gives —; the names
# it realises are looked up on MOD-trace-graph's graph (graphFindings), and a use case that realises nothing is a gap the graph
# lists (coverageGaps). The data reaches node hex-encoded, so that no word of a text names a module for jsrun to import.


def module_call(expr: str, data):
    """The value of `expr` through tests/jsrun.py, where `D` is the JSON value `data`."""
    hexed = json.dumps(data).encode("utf-8").hex()
    return js(f"const D = JSON.parse(Buffer.from({json.dumps(hexed)}, 'hex').toString('utf8')); {expr}")


def use_case_findings(files: dict) -> dict:
    """{ path: [{ line, rule, what }] } — documentFindings of each use case of { path: text }, read by the use-case schema."""
    return module_call("const s = documents.artifactSchemas().useCase;"
                       "return Object.fromEntries(Object.entries(D).map(([p, t]) => [p, documents.documentFindings(s,"
                       " documents.readDocument(s, p, t)).map((f) => ({ line: f.line, rule: f.rule, what: f.what }))]));",
                       files)


def product_spec(names) -> str:
    """The SPEC.md of a fixture product that holds one requirement of each name — never Agent M's own SPEC."""
    return "# Fixture product — Specification\n\n## Rules\n\n" + "".join(
        f"**{n}** *(PO)*\nA rule.\n*Check:* no automatic check; at review\n\n" for n in names)


def use_case_graph(files: dict, names) -> dict:
    """{ findings, unrealised } over the graph traceGraph builds from the use cases of { path: text } beside a SPEC of the
    requirements `names`: each finding of graphFindings as { artifact, line, rule, what }, and the use cases that coverageGaps
    lists as realising no requirement."""
    return module_call("const files = { ...D.files, 'SPEC.md': D.spec };"
                       "const g = await traceGraph.traceGraph({ paths: Object.keys(files), read: async (p) => files[p] ?? null });"
                       "return { findings: traceGraph.graphFindings(g).map((f) => ({ artifact: f.artifact, line: f.line,"
                       " rule: f.rule, what: f.what })), unrealised: traceGraph.coverageGaps(g).useCasesWithoutRequirement };",
                       {"files": files, "spec": product_spec(names)})


# ---------------------------------------------------------------- architecture files (SPEC §11)
# The same format as docs/assets/artifacts.mjs parseArchitecture reads; tests/test_architecture_files.py.

SLUG = r"[a-z0-9]+(?:-[a-z0-9]+)*"
ARC_NAME = re.compile(rf"^ARC-(\d{{3}})-{SLUG}\.md$")
MOD_NAME = re.compile(rf"^(MOD-{SLUG})\.md$")
UC_ID = re.compile(r"^UC-\d{3}$")
ARC_ID = re.compile(r"^ARC-\d{3}$")
IFACE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
USE = re.compile(rf"^MOD-{SLUG}\.[A-Za-z_][A-Za-z0-9_]*$")
ARC_SECTIONS = ["## Context", "## Decision", "## Alternatives", "## Consequences"]
MOD_SECTIONS = ["## Responsibility", "## Interfaces"]


def is_requirement_name(s: str) -> bool:
    """A requirement is named by its name in capitals (THE NAME IS THE ID AND IT SURVIVES)."""
    return bool(s) and not re.search(r"[a-z]", s) and bool(re.search(r"[A-Z]", s)) \
        and not re.match(r"^(UC|ARC|MOD|SRC|TST|ITM|RES|JOB)-", s)


def as_list(v):
    """`key:` with list items, or an empty `key:` / `key: []`, is a list; anything else is not."""
    if v == "[]":
        return []
    return v if isinstance(v, list) else None


def section_body(body: str, heading: str) -> str:
    m = re.search(rf"^{re.escape(heading)}\s*$", body, re.M)
    if not m:
        return ""
    rest = body[m.end():]
    n = re.search(r"^#{1,2} ", rest, re.M)
    return rest[:n.start()] if n else rest


def described_interfaces(body: str) -> list[str]:
    """Each provided interface is described by a bullet `- `name…`` in the Interfaces section."""
    return re.findall(r"^- `([A-Za-z_][A-Za-z0-9_]*)", section_body(body, "## Interfaces"), re.M)


def architecture_problems(name: str, text: str) -> list[str]:
    arc, mod = ARC_NAME.match(name), MOD_NAME.match(name)
    if not arc and not mod:
        return [f"{name}: file name is neither ARC-<nnn>-<slug>.md nor MOD-<slug>.md"]
    p = []
    fields, body = front_matter(text)
    if not fields:
        return [f"{name}: no front matter"]
    want = f"ARC-{arc.group(1)}" if arc else mod.group(1)
    if fields.get("id") != want:
        p.append(f"{name}: id {fields.get('id')!r} does not match the file name ({want})")
    if not fields.get("title") or not isinstance(fields["title"], str):
        p.append(f"{name}: missing title")

    def items(key, ok, what, non_empty=False):
        v = as_list(fields.get(key)) if key in fields else None
        if v is None:
            p.append(f"{name}: {key} must be a list" + (" naming at least one item" if non_empty else " (empty: `{key}:`)".format(key=key)))
            return []
        if non_empty and not v:
            p.append(f"{name}: {key} must name at least one item")
        for x in v:
            if not ok(x):
                p.append(f"{name}: {key}: {x!r} is not {what}")
        return v

    origin = lambda x: bool(UC_ID.match(x)) or is_requirement_name(x)  # noqa: E731
    if arc:
        items("forced_by", origin, "a use case (UC-<nnn>) or a requirement name", non_empty=True)
        for k in ("realises", "follows", "uses", "provides"):
            if k in fields:
                p.append(f"{name}: key {k!r} belongs to a module")
        sections = ARC_SECTIONS
    else:
        items("realises", origin, "a use case (UC-<nnn>) or a requirement name")
        items("follows", lambda x: bool(ARC_ID.match(x)), "an architecture decision (ARC-<nnn>)")
        items("uses", lambda x: bool(USE.match(x)), "an interface of another module (MOD-<slug>.<interface>)")
        provides = items("provides", lambda x: bool(IFACE.match(x)), "an interface name")
        if "forced_by" in fields:
            p.append(f"{name}: key 'forced_by' belongs to an architecture decision")
        if len(set(provides)) != len(provides):
            p.append(f"{name}: provides names an interface twice")
        described = described_interfaces(body)
        for i in provides:
            if IFACE.match(i) and i not in described:
                p.append(f"{name}: interface {i!r} is not described in ## Interfaces (a bullet - `{i}…`)")
        sections = MOD_SECTIONS
    for s in sections:
        if not re.search(rf"^{re.escape(s)}\s*$", body, re.M):
            p.append(f"{name}: missing section {s!r}")
    if re.search(r"!\[[^\]]*\]\([^)]*\.(png|jpe?g|gif|svg|webp)\)", body, re.I):
        p.append(f"{name}: diagram stored as an image file")
    return p


def record_fields(text: str) -> dict:
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"^([a-z]+):[ \t]*(.*)$", text, re.M)}


def renamed_use_case(path: str, root: Path = ROOT) -> bool:
    """A record names a use case's file as it was called when accepted. A use case keeps its ID when its
    file is renamed, so a record whose file is gone still names an existing use case if its ID does.
    The same holds for an architecture decision; a module's identifier is its whole file name."""
    m = re.match(r"^docs/use-cases/(UC-\d{3})-[^/]+\.md$", path)
    if m:
        return any((root / "docs" / "use-cases").glob(f"{m.group(1)}-*.md"))
    m = re.match(r"^docs/architecture/(ARC-\d{3})-[^/]+\.md$", path)
    return bool(m) and any((root / "docs" / "architecture").glob(f"{m.group(1)}-*.md"))


# The kinds of reviewed file and where each lives (ONE REVIEW LAYOUT FOR EVERY PRODUCT).
REVIEWED = {"use-case": re.compile(r"^docs/use-cases/(UC-\d{3})-[^/]+\.md$"),
            "architecture-decision": re.compile(r"^docs/architecture/(ARC-\d{3})-[^/]+\.md$"),
            "module": re.compile(rf"^docs/architecture/(MOD-{SLUG})\.md$")}


def record_problems(name: str, text: str, root: Path = ROOT) -> list[str]:
    r = record_fields(text)
    p = []
    kind = r.get("kind")
    need = {"use-case": ["file", "blob"], "architecture-decision": ["file", "blob"], "module": ["file", "blob"],
            "spec": ["queue", "entry", "proposal", "blob", "target", "anchor", "section"]}.get(kind)
    if need is None:
        return [f"{name}: unknown kind {kind!r}"]
    for k in need:
        if not r.get(k):
            p.append(f"{name}: missing {k}")
    for k in ("blob", "section"):
        if k in need and r.get(k) and not HEX40.match(r[k]):
            p.append(f"{name}: {k} is not a 40-digit blob SHA")
    path = r.get("proposal") if kind == "spec" else r.get("file")
    if path and not (root / path).is_file() and not renamed_use_case(path, root):
        p.append(f"{name}: {path} does not exist")
    if kind in REVIEWED and path:
        m = REVIEWED[kind].match(path)
        if not m:
            p.append(f"{name}: {path} is not the file of a {kind}")
        elif kind != "use-case" and not name.startswith(m.group(1) + "-"):
            p.append(f"{name}: the record's name does not start with the identifier {m.group(1)}")
    if r.get("blob") and r["blob"][:12] not in name:
        p.append(f"{name}: file name does not carry the blob prefix")
    return p
