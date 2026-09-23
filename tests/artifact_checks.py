"""Shared checks for the review artifacts under docs/ (SPEC §4, §10).

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


def use_case_problems(name: str, text: str) -> list[str]:
    p = []
    m = USE_CASE_NAME.match(name)
    if not m:
        p.append(f"{name}: file name is not UC-<nnn>-<slug>.md")
    fields, body = front_matter(text)
    if not fields:
        p.append(f"{name}: no front matter")
        return p
    if m and fields.get("id") != f"UC-{m.group(1)}":
        p.append(f"{name}: id {fields.get('id')!r} does not match the file name")
    for key in ("title", "stage"):
        if not fields.get(key) or not isinstance(fields[key], str):
            p.append(f"{name}: missing {key}")
    for key in ("actors", "realises"):
        if not isinstance(fields.get(key), list) or not fields[key]:
            p.append(f"{name}: {key} must be a non-empty list")
    for s in REQUIRED_SECTIONS:
        if not re.search(rf"^{re.escape(s)}\s*$", body, re.M):
            p.append(f"{name}: missing section {s!r}")
    if "```mermaid" not in body:
        p.append(f"{name}: no Mermaid diagram")
    if re.search(r"!\[[^\]]*\]\([^)]*\.(png|jpe?g|gif|svg|webp)\)", body, re.I):
        p.append(f"{name}: diagram stored as an image file")
    return p


def record_fields(text: str) -> dict:
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"^([a-z]+):[ \t]*(.*)$", text, re.M)}


def record_problems(name: str, text: str, root: Path = ROOT) -> list[str]:
    r = record_fields(text)
    p = []
    kind = r.get("kind")
    need = {"use-case": ["file", "blob"],
            "spec": ["queue", "entry", "proposal", "blob", "target", "anchor", "section"]}.get(kind)
    if need is None:
        return [f"{name}: unknown kind {kind!r}"]
    for k in need:
        if not r.get(k):
            p.append(f"{name}: missing {k}")
    for k in ("blob", "section"):
        if k in need and r.get(k) and not HEX40.match(r[k]):
            p.append(f"{name}: {k} is not a 40-digit blob SHA")
    path = r.get("file") if kind == "use-case" else r.get("proposal")
    if path and not (root / path).is_file():
        p.append(f"{name}: {path} does not exist")
    if r.get("blob") and r["blob"][:12] not in name:
        p.append(f"{name}: file name does not carry the blob prefix")
    return p
