# Module: MOD-artifacts
# Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022
# Level: release
# Release test of sprint 02, strand C (ITM-144), written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md,
# who implemented none of the strand's items; started on sprint/02 at a7b4b9f, 2026-10-01. Case 26 changed by its author,
# tester-opus (claude-opus-5-5), on sprint/02 at 5957157, 2026-10-02, to ITM-128's corrected criterion (S1 decided no defect).
# Cases 25 and 26 moved by their author, tester-opus (claude-opus-5-5), on sprint/03 at fc61996, 2026-10-03, into CI's one run
# of the two suites (ITM-158): .github/workflows/tests.yml runs both under the watcher of tests/spec_watch/ and its last step
# reads the log with tests/spec_watch/seen.py.
"""ITM-128: no test of the repository opens Agent M's own SPEC.md — its acceptance criterion "No file under tests/ opens the
repository's own SPEC.md as a source of expected values; reading a fixture's SPEC.md stays allowed", after the process rule KEIN
SPEC-ZUGRIFF AUS PRODUKT-CODE ("Kein Produkt-Code öffnet ein SPEC-Dokument zum Lesen — kein Test, kein Skript, kein Generator").
The rule ITM-128 realises, ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS, is checked on fixture text instead
(tests/release-sprint-02-c-*.test.mjs).

The criterion as the Product Owner corrected it on 2026-10-02 (ITM-128, *Acceptance criteria*): "A whole-repository scan — a
test that opens every committed file, or every artifact, of the repository to check each against a rule — … opens SPEC.md as
one file among all and does not fall under this criterion". Read so that it is checked without a list of today's scans: an
open of SPEC.md comes from a whole-repository scan when its call site — the same chain of test file:line frames — opens, in the
same run, more than half of the repository's other committed Markdown files (tests/spec_watch/seen.py). A test that opens
SPEC.md by name does so from a line that opens it alone (or with a handful of others), and stays a finding; a `git` command or a
node process naming the file is never a scan.

Checked over the repository's files by running them, not by reading them — in CI's one run of the two suites (ITM-158): every
Python process loads tests/spec_watch/sitecustomize.py (an audit hook, through PYTHONPATH) and every node process
tests/spec_watch/watch.mjs (through NODE_OPTIONS); they note every open of the watched file and every `git` command run inside
the repository that names it, with the test file:line frames it came from, and the Python half every other file of the
repository that is opened, so that a scan can be told from a read by name. CI's last step reads the log
(tests/spec_watch/seen.py): red on a read by name, each one listed with its test file and line; not measured — red as well —
when no `python -m unittest` or a node test file did not start under the watcher. A test that reads the file under any
spelling of its path, through any reader, is seen; a fixture's SPEC.md is another file and is not.

What stays here is the known positive (CLAUDE.md §6a.2: a negative result counts only once the probe has hit a known positive):
the same files and the same reading, on a planted repository. This file runs no suite.
"""
import importlib.util
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WATCH = ROOT / "tests" / "spec_watch"  # the folder .github/workflows/tests.yml names

_spec = importlib.util.spec_from_file_location("spec_watch_seen", WATCH / "seen.py")
seen_py = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(seen_py)
committed_markdown, not_from_a_scan, check = seen_py.committed_markdown, seen_py.not_from_a_scan, seen_py.check
STARTED, PY_STARTED = seen_py.STARTED, seen_py.PY_STARTED


def watched(cmd: list, cwd: Path, watch: Path, reads: bool = False) -> tuple:
    """Run cmd with the watcher in every Python and node process it starts, as CI's steps set it -> (completed process, the
    lines it noted). With `reads`, a Python process also notes every other file it opens in the watched file's folder
    ("python read <path> <- …")."""
    with tempfile.TemporaryDirectory() as d:
        log = Path(d) / "seen.log"
        log.write_text("", encoding="utf-8")
        hook = f"--import={(WATCH / 'watch.mjs').as_uri()}"
        env = {k: v for k, v in os.environ.items() if not k.startswith("RELEASE_WATCH_")}
        env.update(RELEASE_WATCH_FILE=str(watch), RELEASE_WATCH_LOG=str(log), **({"RELEASE_WATCH_READS": "1"} if reads else {}),
                   PYTHONPATH=os.pathsep.join([str(WATCH)] + [p for p in env.get("PYTHONPATH", "").split(os.pathsep)
                                                                if p and p != str(WATCH)]),
                   NODE_OPTIONS=" ".join([hook] + [o for o in env.get("NODE_OPTIONS", "").split() if o != hook]))
        run = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True)
        return run, [l for l in log.read_text(encoding="utf-8").splitlines() if l]


class TheWatcherSeesAKnownRead(unittest.TestCase):
    """The known positive: a planted SPEC.md in a scratch repository, opened in every way a test could, is seen each time; the
    fixture SPEC.md beside it, opened the same ways, is not. And the telling apart of case 26: the open by a test that scans
    every committed file is told to come from a scan; each open by name, the git command and the node read are not. And the
    reading CI's last step makes: red on the planted reads, each named by its test file and line; not measured without the
    watcher's lines."""

    def test_every_way_of_opening_the_watched_file_is_seen_and_a_fixture_is_not(self):
        with tempfile.TemporaryDirectory() as d:
            repo = Path(d)
            (repo / "tests" / "fixtures").mkdir(parents=True)
            (repo / "docs").mkdir()
            for p in (repo / "SPEC.md", repo / "tests" / "fixtures" / "SPEC.md", repo / "README.md", repo / "docs" / "a.md",
                      repo / "docs" / "b.md"):
                p.write_text("# S\n", encoding="utf-8")
            git = lambda *a: subprocess.run(["git", "-C", str(repo), *a], capture_output=True, text=True, check=True)
            git("init", "-q"); git("-c", "user.email=t@e.org", "-c", "user.name=t", "add", "-A")
            git("-c", "user.email=t@e.org", "-c", "user.name=t", "commit", "-q", "-m", "c")
            (repo / "tests" / "a.test.mjs").write_text(textwrap.dedent('''
                import { readFileSync } from "node:fs";
                import { readFile } from "node:fs/promises";
                import { execFileSync } from "node:child_process";
                readFileSync(new URL("../SPEC.md", import.meta.url));
                await readFile(new URL("../SPEC.md", import.meta.url).pathname, "utf8");
                execFileSync("git", ["show", "HEAD:SPEC.md"], { cwd: new URL("..", import.meta.url) });
                readFileSync(new URL("./fixtures/SPEC.md", import.meta.url));
                await readFile(new URL("./fixtures/SPEC.md", import.meta.url).pathname, "utf8");
            '''), encoding="utf-8")
            (repo / "tests" / "test_a.py").write_text(textwrap.dedent('''
                import subprocess, sys, unittest
                from pathlib import Path
                HERE = Path(__file__).resolve().parent
                class T(unittest.TestCase):
                    def test_reads(self):
                        subprocess.run([sys.executable, "-c", "import sys\\nprint(sys.argv)", "a\\nb"], capture_output=True, check=True)
                        open(HERE.parent / "SPEC.md").read()
                        (HERE / ".." / "SPEC.md").read_text()
                        subprocess.run(["git", "-C", str(HERE.parent), "show", "HEAD:SPEC.md"], capture_output=True, check=True)
                        (HERE / "fixtures" / "SPEC.md").read_text()
                        subprocess.run(["node", "-e", "require('fs').readFileSync(process.argv[2])", "a\\nb", str(HERE.parent / "SPEC.md")], check=True)
            '''), encoding="utf-8")
            (repo / "tests" / "test_scan.py").write_text(textwrap.dedent('''
                import subprocess, unittest
                from pathlib import Path
                ROOT = Path(__file__).resolve().parents[1]
                class S(unittest.TestCase):
                    def test_every_committed_file(self):
                        out = subprocess.run(["git", "-C", str(ROOT), "ls-files", "-z"], capture_output=True, text=True, check=True)
                        for f in filter(None, out.stdout.split("\\0")):
                            (ROOT / f).read_bytes()
            '''), encoding="utf-8")
            node, logged_node = watched(["node", "--test", "tests/a.test.mjs"], repo, repo / "SPEC.md")
            self.assertEqual(node.returncode, 0, node.stdout[-1500:] + node.stderr[-1500:])
            py, logged_py = watched([sys.executable, "-m", "unittest", "-q", "test_a", "test_scan"], repo / "tests",
                                    repo / "SPEC.md", reads=True)
            self.assertEqual(py.returncode, 0, py.stderr[-1500:])
            markdown = committed_markdown(repo)
        # Every process notes its start — the node test file, the Python suite's command line —, so that CI can tell a run the
        # watcher missed.
        self.assertTrue(any(l.startswith(STARTED) and l.endswith("/tests/a.test.mjs") for l in logged_node), logged_node)
        self.assertIn(PY_STARTED + "-m unittest -q test_a test_scan", logged_py)
        # One note, one line — also for a `-c` script and an argument with line breaks.
        self.assertIn(PY_STARTED + "-c import sys print(sys.argv) a b", logged_py)
        self.assertEqual([l for l in logged_node + logged_py if not l.startswith(("python ", "node "))], [])
        seen_node = [l for l in logged_node if not l.startswith((STARTED, PY_STARTED))]
        seen_all = [l for l in logged_py if not l.startswith((STARTED, PY_STARTED))]
        seen_py = [l for l in seen_all if not l.startswith("python read ")]
        # A reader may open the file through another (readFileSync through openSync on some versions): each planted way of
        # opening it must be seen at least once.
        kinds = lambda seen: {l.split(" ")[0] + " " + l.split(" ")[1] for l in seen}
        self.assertLessEqual({"node fs.promises.readFile", "node fs.readFileSync", "node git"}, kinds(seen_node), seen_node)
        self.assertLessEqual({"node fs.readFileSync", "python git", "python open"}, kinds(seen_py), seen_py)
        self.assertEqual(sum(l.startswith("python open") and "test_a.py:" in l for l in seen_py), 2, seen_py)
        self.assertFalse([l for l in seen_node + seen_py if "fixtures" in l], "a fixture's SPEC.md is not the watched file")
        # The telling apart: the scan's open is the only one that comes from a scan; it is seen with its test file:line.
        self.assertEqual(markdown, {"README.md", "docs/a.md", "docs/b.md", "tests/fixtures/SPEC.md"})
        scan = [l for l in seen_py if l.startswith("python open") and "test_scan.py:" in l]
        self.assertEqual(len(scan), 1, seen_py)
        self.assertEqual(not_from_a_scan(seen_all, markdown), [l for l in seen_py if l not in scan])
        self.assertEqual(not_from_a_scan(seen_node, markdown), seen_node)
        # Each read by name names the case it came from: the node test file and line, the Python test file, line and function.
        self.assertTrue(all(" <- a.test.mjs:" in l for l in seen_node), seen_node)
        self.assertTrue(all("test_a.py:" in l and " test_reads" in l for l in seen_py if l not in scan
                            and not l.startswith("node ")), seen_py)
        # CI's last step on these lines: red, every read by name listed with the line that names its case; the scan's open not.
        code, report = check(logged_node + logged_py, markdown, ["tests/a.test.mjs"])
        self.assertEqual(code, 1, report)
        self.assertEqual([l for l in report.splitlines()[1:]], ["  " + l for l in not_from_a_scan(seen_node + seen_all, markdown)])
        self.assertNotIn("test_scan.py", report)
        # Not measured, never green, when the watcher's own lines are missing: no `python -m unittest` that started under it —
        # a Python process a node test starts, reading files, is not the suite —, or a node test file that did not start under it.
        no_suite = [l for l in logged_node + logged_py if not l.startswith(PY_STARTED) and "test_a.py" not in l
                    and not l.startswith(("node fs", "node git"))] + [PY_STARTED + "-c pass"]
        self.assertTrue(any(l.startswith("python read ") for l in no_suite), no_suite)
        self.assertEqual(check(no_suite, markdown, ["tests/a.test.mjs"])[0], 2)
        self.assertEqual(check(logged_node + logged_py, markdown, ["tests/a.test.mjs", "tests/b.test.mjs"])[0], 2)
        self.assertEqual(check([l for l in logged_py if "test_a.py" not in l and not l.startswith(("node fs", "node git"))],
                               markdown, [])[0], 0)


if __name__ == "__main__":
    unittest.main()
