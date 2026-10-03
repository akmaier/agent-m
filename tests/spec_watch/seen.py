# Module: MOD-artifacts
# Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022
# Level: release
# The reading of the SPEC-read watcher's log, by tester-opus (claude-opus-5-5) — ITM-128's acceptance criterion as corrected on
# 2026-10-02, read by tests/test_release_sprint_02_c.py since ITM-144 and run by CI's last step since ITM-158:
#
#     python3 tests/spec_watch/seen.py <log>
#
# exit 0 — the watcher ran in CI's Python processes and in every node test file, and every open of Agent M's own SPEC.md it saw
#          comes from a whole-repository scan;
# exit 1 — an open of SPEC.md by name: each one printed with the test file:line frames it came from;
# exit 2 — not measured: no log, no Python process noted a read, or a node test file did not start under the watcher.
"""An open of SPEC.md comes from a whole-repository scan when its call site — the same chain of test file:line frames — opens, in
the same run, more than half of the repository's other committed Markdown files. A test that opens SPEC.md by name does so from
a line that opens it alone (or with a handful of others), and stays a finding; a `git` command or a node process naming the file
is never a scan."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STARTED = "node start "


def committed_markdown(repo: Path) -> set:
    """The repository's committed Markdown files other than SPEC.md — what a whole-repository scan opens beside it."""
    out = subprocess.run(["git", "-C", str(repo), "ls-files", "-z", "--", "*.md"], capture_output=True, text=True, check=True)
    return {f for f in out.stdout.split("\0") if f and f != "SPEC.md"}


def not_from_a_scan(seen: list, markdown: set) -> list:
    """The watcher's lines on SPEC.md that do not come from a whole-repository scan (ITM-128's corrected criterion): all but a
    Python open whose call site — its chain of test file:line frames — opened, in the same run, more than half of `markdown`.
    A git command or a node process naming the file is no scan. A node process's start is no line on SPEC.md."""
    reads = {}
    for line in seen:
        if line.startswith("python read "):
            what, _, frames = line.rpartition(" <- ")
            reads.setdefault(frames, set()).add(what[len("python read "):])
    return [line for line in seen if not line.startswith(("python read ", STARTED))
            and not (line.startswith("python open ")
                     and 2 * len(reads.get(line.rpartition(" <- ")[2], set()) & markdown) > len(markdown))]


def check(seen: list, markdown: set, node_tests: list) -> tuple:
    """(exit code, report) for the lines of one run's log: the node test files that must each have started under the watcher
    are `node_tests` (paths relative to the repository)."""
    started = {Path(l[len(STARTED):]).as_posix() for l in seen if l.startswith(STARTED)}
    unwatched = [t for t in node_tests if not any(s == t or s.endswith("/" + t) for s in started)]
    python_reads = sum(l.startswith("python read ") for l in seen)
    if not python_reads or unwatched:
        why = ([] if python_reads else ["no Python process noted a read — the Python watcher did not run (PYTHONPATH)"]) \
            + [f"{t} did not start under the watcher (NODE_OPTIONS)" for t in unwatched]
        return 2, "SPEC-read watcher: NOT MEASURED\n" + "\n".join("  " + w for w in why)
    found = not_from_a_scan(seen, markdown)
    if found:
        return 1, ("SPEC-read watcher: Agent M's own SPEC.md opened by name — ITM-128, KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE "
                   f"({len(found)}):\n" + "\n".join("  " + l for l in found))
    scans = {}
    for l in seen:
        if l.startswith("python open "):
            scans[l.rpartition(" <- ")[2]] = scans.get(l.rpartition(" <- ")[2], 0) + 1
    return 0, (f"SPEC-read watcher: nothing opened SPEC.md by name — {python_reads} Python reads noted, "
               f"{len(node_tests)} of {len(node_tests)} node test files watched, "
               f"{sum(l.startswith(STARTED) for l in seen)} node processes started; "
               f"opens of SPEC.md from whole-repository scans: {len(scans)}"
               + "".join(f"\n  {n}x <- {s}" for s, n in sorted(scans.items())))


def main(argv: list) -> int:
    log = Path(argv[1]) if len(argv) > 1 else None
    if log is None or not log.is_file():
        print(f"SPEC-read watcher: NOT MEASURED\n  no log at {log}")
        return 2
    seen = [l for l in log.read_text(encoding="utf-8").splitlines() if l]
    node_tests = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "tests").glob("*.test.mjs"))
    code, report = check(seen, committed_markdown(ROOT), node_tests)
    print(report)
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv))
