#!/usr/bin/env python3
"""Write approved SPEC changes into SPEC.md — the workflow half of SPEC §10. stdlib only.

    python3 tools/apply_approvals.py            # from the repository root
    python3 tools/apply_approvals.py --repo DIR

A person approves a SPEC change by committing an approval record to `docs/approvals/` in GitHub's
web interface (AN ACCEPTED SPEC CHANGE IS WRITTEN BY A WORKFLOW). This script finds every `kind:
spec` record that has not been applied yet and, for each one:

  1. checks that the proposal file still has the blob SHA the record names,
  2. checks that the SPEC section still has the blob SHA the reviewer saw beside it,
  3. checks that the record's anchor is the anchor the queue lists for that entry,
  4. replaces the section with the proposal text byte for byte,
  5. appends `| time | nr | uebernommen | approval:<record> |` to the queue's entscheidungen.md.

If any check fails, it writes nothing for that record (A STALE APPROVAL IS NOT APPLIED) and exits 1
after handling the others. The section logic is the one of scripts/spec_dashboard.py in the process
repository; docs/assets/review-core.mjs implements the same for the dashboard, and
tests/review-core.test.mjs checks that both hash the same bytes. It commits nothing — the workflow
does that.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import re
import sys
from pathlib import Path

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


def section_text(sec) -> str:
    if isinstance(sec, str):
        raise ValueError(sec)
    lines, von, bis = sec
    return "\n".join(lines[von:bis]).rstrip("\n") + "\n"


def queue_entry(queue_dir: Path, nr: int):
    text = (queue_dir / "index.md").read_text(encoding="utf-8")
    for line in text.split("\n"):
        if not line.startswith("|"):
            continue
        sp = [s.strip() for s in line.strip().strip("|").split("|")]
        if len(sp) >= 5 and re.fullmatch(r"\d+", sp[0]) and int(sp[0]) == nr:
            bis = sp[3].replace("\\|", "|")
            return sp[2].replace("\\|", "|"), (None if bis in ("—", "-", "") else bis)
    return None


def applied_records(queue_dir: Path) -> set[str]:
    p = queue_dir / "entscheidungen.md"
    if not p.exists():
        return set()
    return set(re.findall(r"\|\s*approval:([^\s|]+)\s*\|", p.read_text(encoding="utf-8")))


def apply(root: Path) -> tuple[int, str]:
    root = Path(root)
    report, rc = [], 0
    for rec_path in sorted((root / APPROVALS).glob("*.md")):
        if rec_path.name == "README.md":  # documents the format with example records
            continue
        r = parse_record(rec_path.read_text(encoding="utf-8"))
        if r.get("kind") != "spec":
            continue
        name = rec_path.name
        missing = [k for k in SPEC_KEYS if not r.get(k)]
        if missing:
            report.append(f"{name}: refused — missing {', '.join(missing)}")
            rc = 1
            continue
        queue = r["queue"].rstrip("/")
        proposal = r["proposal"]
        if not queue.startswith(QUEUES) or not proposal.startswith(queue + "/") \
                or ".." in proposal or ".." in queue:
            report.append(f"{name}: refused — proposal {proposal!r} is not a file of queue {queue!r}")
            rc = 1
            continue
        qdir = root / queue
        if not (qdir / "index.md").is_file():
            report.append(f"{name}: refused — queue {queue} has no index.md")
            rc = 1
            continue
        if name in applied_records(qdir):
            continue
        nr = int(r["entry"])
        entry = queue_entry(qdir, nr)
        if entry is None:
            report.append(f"{name}: refused — queue has no entry {nr}")
            rc = 1
            continue
        anchor, bis = entry
        if anchor != r["anchor"]:
            report.append(f"{name}: refused — record anchor {r['anchor']!r} is not the queue's anchor {anchor!r}")
            rc = 1
            continue
        prop_file = root / proposal
        if not prop_file.is_file():
            report.append(f"{name}: refused — proposal {proposal} does not exist")
            rc = 1
            continue
        prop = prop_file.read_text(encoding="utf-8")
        if blob_sha(prop) != r["blob"]:
            report.append(f"{name}: refused — proposal changed after approval ({blob_sha(prop)[:12]} ≠ {r['blob'][:12]})")
            rc = 1
            continue
        target = root / r["target"]
        spec = target.read_text(encoding="utf-8")
        sec = extract_section(spec, anchor, bis)
        if isinstance(sec, str):
            report.append(f"{name}: refused — {sec}")
            rc = 1
            continue
        if blob_sha(section_text(sec)) != r["section"]:
            report.append(f"{name}: refused — SPEC section changed after approval")
            rc = 1
            continue
        lines, von, ende = sec
        new = lines[:von] + prop.rstrip("\n").split("\n") + lines[ende:]
        out = "\n".join(new)
        # A section that runs to the end of the file includes the empty string after the final
        # newline; replacing it would drop that newline (scripts/spec_dashboard.py does exactly
        # that — measured on this SPEC, 2026-09-23). Keep the file's ending as it was.
        if spec.endswith("\n") and not out.endswith("\n"):
            out += "\n"
        target.write_text(out, encoding="utf-8")
        now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        with (qdir / "entscheidungen.md").open("a", encoding="utf-8") as fh:
            fh.write(f"| {now} | {nr} | uebernommen | approval:{name} |\n")
        report.append(f"{name}: applied — {r['target']} {anchor}")
    return rc, "\n".join(report)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--repo", default=".")
    a = ap.parse_args(argv)
    rc, report = apply(Path(a.repo))
    print(report or "nothing to apply")
    return rc


if __name__ == "__main__":
    sys.exit(main())
