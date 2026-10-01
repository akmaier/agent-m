# Module: MOD-artifacts
"""Shared checks for the review artifacts under docs/ (SPEC §4, §10, §11).

The checks are functions that return a list of problems, so that each test can run them once on
the real files and once on a deliberately broken copy — the counter-proof of
SOFTWARE_MAINTENANCE §4.0a rule 5, built into the suite instead of run once by hand.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
USE_CASE_NAME = re.compile(r"^UC-(\d{3})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
REQUIRED_SECTIONS = ["## Actors", "## Precondition", "## Main flow", "## Alternative flows",
                     "## Postcondition"]
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
# The twin of docs/assets/artifacts/use-cases.mjs useCaseProblems: the same checks in the same order, each finding's rule
# and `what` word for word; tests/artifacts-twin.test.mjs compares the two on the same files.

FIELDS = "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION"
REALISES = "A USE CASE REALISES NAMED REQUIREMENTS"
MERMAID = "DIAGRAMS ARE MERMAID IN MARKDOWN"
ONE_FILE = "ONE USE CASE, ONE FILE"
MERMAID_OPEN = re.compile(r"^```mermaid\s*$")
MD_IMAGE = re.compile(r"!\[[^\]]*\]\(\s*<?([^\s)>]+)")
HTML_IMAGE = re.compile(r"""<img\b[^>]*?\bsrc\s*=\s*["']?([^"'\s>]+)""", re.I)
IMAGE_TYPE = re.compile(r"\.(png|jpe?g|gif|svg|webp)$", re.I)


def diagram_images(body: str) -> list[str]:
    """The address of every Markdown image or HTML <img> whose address, without query or fragment, is an image file."""
    found = [(m.start(), m.group(1)) for rx in (MD_IMAGE, HTML_IMAGE) for m in rx.finditer(body)
             if IMAGE_TYPE.search(re.sub(r"[?#].*$", "", m.group(1)))]
    return [t for _, t in sorted(found)]


def use_case_findings(name: str, text: str, known_names=None) -> list[dict]:
    """Every format error of a use case as {rule, what}. known_names: the requirements a name under `realises` must
    match; None checks only the form of each name."""
    out = []

    def add(rule, what):
        out.append({"rule": rule, "what": what})

    m = USE_CASE_NAME.match(name)
    if not m:
        add(ONE_FILE, "file name is not UC-<nnn>-<slug>.md")
    fields, body = front_matter(text)
    if not fields:
        add(ONE_FILE, "no front matter")
        return out
    if m and fields.get("id") != f"UC-{m.group(1)}":
        shown = f'"{fields["id"]}"' if isinstance(fields.get("id"), str) else "(none)"
        add(ONE_FILE, f"id {shown} does not match the file name (UC-{m.group(1)})")
    for key in ("title", "area"):
        if not fields.get(key) or not isinstance(fields[key], str):
            add(FIELDS, f"missing {key}")
    if "stage" in fields:
        add(FIELDS, "key 'stage' is now 'area'")
    if not isinstance(fields.get("actors"), list) or not fields["actors"]:
        add(FIELDS, "actors must be a non-empty list")
    realises = fields.get("realises") if isinstance(fields.get("realises"), list) else None
    if not realises:
        add(REALISES, "realises must be a non-empty list")
    known = None if known_names is None else set(known_names)
    for n in realises or []:
        if not is_requirement_name(n):
            add(REALISES, f'realises: "{n}" is not a requirement name')
        elif known is not None and n not in known:
            add(REALISES, f'realises "{n}" matches no requirement')
    lines = body.split("\n")
    for s in REQUIRED_SECTIONS:
        if not any(line.rstrip() == s for line in lines):
            add(FIELDS, f"missing section {s!r}")
    if not any(MERMAID_OPEN.match(line) for line in lines):
        add(MERMAID, "no Mermaid diagram")
    for target in diagram_images(body):
        add(MERMAID, f"diagram stored as an image file ({target})")
    return out


def use_case_problems(name: str, text: str, known_names=None) -> list[str]:
    return [f"{name}: {f['what']}" for f in use_case_findings(name, text, known_names)]


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
