# Module: MOD-artifacts
# Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022
# Level: release
# Release test of sprint 02, strand C (ITM-144), written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md,
# who implemented none of the strand's items; started on sprint/02 at a7b4b9f, 2026-10-01. Case 26 changed by its author,
# tester-opus (claude-opus-5-5), on sprint/02 at 5957157, 2026-10-02, to ITM-128's corrected criterion (S1 decided no defect).
"""ITM-128: no test of the repository opens Agent M's own SPEC.md — its acceptance criterion "No file under tests/ opens the
repository's own SPEC.md as a source of expected values; reading a fixture's SPEC.md stays allowed", after the process rule KEIN
SPEC-ZUGRIFF AUS PRODUKT-CODE ("Kein Produkt-Code öffnet ein SPEC-Dokument zum Lesen — kein Test, kein Skript, kein Generator").
The rule ITM-128 realises, ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS, is checked on fixture text instead
(tests/release-sprint-02-c-*.test.mjs).

The criterion as the Product Owner corrected it on 2026-10-02 (ITM-128, *Acceptance criteria*): "A whole-repository scan — a
test that opens every committed file, or every artifact, of the repository to check each against a rule — … opens SPEC.md as
one file among all and does not fall under this criterion". Read here so that it is checked without a list of today's scans: an
open of SPEC.md comes from a whole-repository scan when its call site — the same chain of test file:line frames — opens, in the
same run, more than half of the repository's other committed Markdown files. A test that opens SPEC.md by name does so from a
line that opens it alone (or with a handful of others), and stays a finding; a `git` command or a node process naming the file
is never a scan.

Checked over the repository's files by running them, not by reading them: both suites run once more, as CI runs them, with a
watcher in every process they start — a Python audit hook (sitecustomize, for every Python process) and a module that node
loads first (NODE_OPTIONS, for every node process) — which notes every open of the watched file and every `git` command run
inside the repository that names it, a Python open with the test file:line frames it came from. A test that reads the file under
any spelling of its path, through any reader, is seen; a fixture's SPEC.md is another file and is not. For the Python suite the
watcher also notes every other file of the repository that is opened, with its frames, so that a scan can be told from a read by
name. The watcher, and the telling apart, are first shown on a planted repository (CLAUDE.md §6a.2: a negative result counts
only once the probe has hit a known positive). This file does not run itself.
"""
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TESTS = ROOT / "tests"
THIS = Path(__file__).stem

# Every Python process: an audit hook on `open` and on starting a `git` that names the file inside the watched folder.
SITECUSTOMIZE = textwrap.dedent('''
    import os, sys
    _WATCH = os.path.realpath(os.environ["RELEASE_WATCH_FILE"]); _LOG = os.environ["RELEASE_WATCH_LOG"]
    _BASE, _HOME = os.path.basename(_WATCH), os.path.dirname(_WATCH)
    _READS = bool(os.environ.get("RELEASE_WATCH_READS"))  # also note every other file of the folder that is opened
    _open = open
    _busy = []  # the watcher's own opens (the log, the source lines of the frames) are not noted
    def _note(what):
        import traceback
        _busy.append(1)
        try:
            where = " | ".join(f"{os.path.basename(f.filename)}:{f.lineno}" for f in traceback.extract_stack()[:-2]
                               if os.path.basename(f.filename).startswith(("test", "release")))
            with _open(_LOG, "a", encoding="utf-8") as fh:
                fh.write(f"python {what} <- {where or sys.argv[0]}\\n")
        finally:
            _busy.pop()
    def _hook(event, args):
        if _busy:
            return
        if event == "open" and isinstance(args[0], (str, bytes, os.PathLike)):
            real = os.path.realpath(os.fsdecode(args[0]))
            if real == _WATCH:
                _note("open " + os.fsdecode(args[0]))
            elif _READS and real.startswith(_HOME + os.sep):
                _note("read " + os.path.relpath(real, _HOME))
        elif event == "subprocess.Popen":
            argv = args[1] if isinstance(args[1], (list, tuple)) else [args[1]]
            words = [os.fsdecode(a) for a in argv if isinstance(a, (str, bytes, os.PathLike))]
            cwd = os.path.realpath(os.fsdecode(args[2]) if args[2] else os.getcwd())
            if "-C" in words[1:-1]:  # git -C <dir> runs in <dir>
                cwd = os.path.realpath(os.path.join(cwd, words[words.index("-C", 1) + 1]))
            if words and os.path.basename(words[0]) == "git" and any(_BASE in w for w in words) \\
                    and (cwd + os.sep).startswith(_HOME + os.sep):
                _note("git " + " ".join(words))
    sys.addaudithook(_hook)
''')

# Every node process: the readers of node:fs and node:fs/promises, and the starters of node:child_process, wrapped.
NODE_HOOK = textwrap.dedent('''
    import fs from "node:fs";
    import cp from "node:child_process";
    import { syncBuiltinESMExports } from "node:module";
    import path from "node:path";
    import { fileURLToPath } from "node:url";
    const real = (p) => { try { return fs.realpathSync.native(p); } catch { return path.resolve(p); } };
    const WATCH = real(process.env.RELEASE_WATCH_FILE), LOG = process.env.RELEASE_WATCH_LOG;
    const BASE = path.basename(WATCH), HOME = path.dirname(WATCH);
    const note = (what) => fs.appendFileSync(LOG, `node ${what} <- ${process.argv[1] ?? "?"}\\n`);
    const asPath = (p) => (p instanceof URL ? fileURLToPath(p) : Buffer.isBuffer(p) ? p.toString()
      : typeof p === "string" ? (p.startsWith("file:") ? fileURLToPath(p) : p) : null);
    const hit = (p) => { const s = asPath(p); return s !== null && real(s) === WATCH; };
    const wrap = (obj, names, label) => { for (const n of names) { const f = obj[n]; if (typeof f !== "function") continue;
      obj[n] = function (p, ...rest) { if (hit(p)) note(`${label}.${n} ${asPath(p)}`); return f.call(this, p, ...rest); }; } };
    wrap(fs, ["readFileSync", "readFile", "openSync", "open", "createReadStream"], "fs");
    wrap(fs.promises, ["readFile", "open"], "fs.promises");
    for (const n of ["spawn", "spawnSync", "execFile", "execFileSync", "exec", "execSync"]) {
      const f = cp[n];
      cp[n] = function (cmd, ...rest) {
        const args = Array.isArray(rest[0]) ? rest[0] : [], opts = (Array.isArray(rest[0]) ? rest[1] : rest[0]) || {};
        const words = [String(cmd), ...args.map(String)].join(" ");
        let cwd = real(typeof opts === "object" && opts.cwd ? (opts.cwd instanceof URL ? fileURLToPath(opts.cwd) : String(opts.cwd)) : process.cwd());
        const c = args.map(String).indexOf("-C");
        if (c >= 0 && c + 1 < args.length) cwd = real(path.resolve(cwd, String(args[c + 1])));  // git -C <dir> runs in <dir>
        if (/^(?:\\S*\\/)?git(?:\\s|$)/.test(words) && words.includes(BASE) && (cwd + path.sep).startsWith(HOME + path.sep)) note(`git ${words}`);
        return f.call(this, cmd, ...rest);
      };
    }
    syncBuiltinESMExports();
''')


def watched(cmd: list, cwd: Path, watch: Path, reads: bool = False) -> tuple:
    """Run cmd with the watcher in every Python and node process it starts -> (completed process, the lines it noted). With
    `reads`, a Python process also notes every other file it opens in the watched file's folder ("python read <path> <- …")."""
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        (d / "sitecustomize.py").write_text(SITECUSTOMIZE, encoding="utf-8")
        (d / "watch.mjs").write_text(NODE_HOOK, encoding="utf-8")
        log = d / "seen.log"
        log.write_text("", encoding="utf-8")
        env = dict(os.environ, RELEASE_WATCH_FILE=str(watch), RELEASE_WATCH_LOG=str(log),
                   **({"RELEASE_WATCH_READS": "1"} if reads else {}),
                   PYTHONPATH=os.pathsep.join(filter(None, [str(d), os.environ.get("PYTHONPATH")])),
                   NODE_OPTIONS=" ".join(filter(None, [f"--import={(d / 'watch.mjs').as_uri()}", os.environ.get("NODE_OPTIONS")])))
        run = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True)
        return run, [l for l in log.read_text(encoding="utf-8").splitlines() if l]


def committed_markdown(repo: Path) -> set:
    """The repository's committed Markdown files other than SPEC.md — what a whole-repository scan opens beside it."""
    out = subprocess.run(["git", "-C", str(repo), "ls-files", "-z", "--", "*.md"], capture_output=True, text=True, check=True)
    return {f for f in out.stdout.split("\0") if f and f != "SPEC.md"}


def not_from_a_scan(seen: list, markdown: set) -> list:
    """The watcher's lines on SPEC.md that do not come from a whole-repository scan (ITM-128's corrected criterion): all but a
    Python open whose call site — its chain of test file:line frames — opened, in the same run, more than half of `markdown`.
    A git command or a node process naming the file is no scan."""
    reads = {}
    for line in seen:
        if line.startswith("python read "):
            what, _, frames = line.rpartition(" <- ")
            reads.setdefault(frames, set()).add(what[len("python read "):])
    return [line for line in seen if not line.startswith("python read ")
            and not (line.startswith("python open ")
                     and 2 * len(reads.get(line.rpartition(" <- ")[2], set()) & markdown) > len(markdown))]


class TheWatcherSeesAKnownRead(unittest.TestCase):
    """The known positive: a planted SPEC.md in a scratch repository, opened in every way a test could, is seen each time; the
    fixture SPEC.md beside it, opened the same ways, is not. And the telling apart of case 26: the open by a test that scans
    every committed file is told to come from a scan; each open by name, the git command and the node read are not."""

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
                import subprocess, unittest
                from pathlib import Path
                HERE = Path(__file__).resolve().parent
                class T(unittest.TestCase):
                    def test_reads(self):
                        open(HERE.parent / "SPEC.md").read()
                        (HERE / ".." / "SPEC.md").read_text()
                        subprocess.run(["git", "-C", str(HERE.parent), "show", "HEAD:SPEC.md"], capture_output=True, check=True)
                        (HERE / "fixtures" / "SPEC.md").read_text()
                        subprocess.run(["node", "-e", "require('fs').readFileSync(process.argv[1])", str(HERE.parent / "SPEC.md")], check=True)
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
            node, seen_node = watched(["node", "--test", "tests/a.test.mjs"], repo, repo / "SPEC.md")
            self.assertEqual(node.returncode, 0, node.stdout[-1500:] + node.stderr[-1500:])
            py, seen_all = watched([sys.executable, "-m", "unittest", "-q", "test_a", "test_scan"], repo / "tests", repo / "SPEC.md",
                                   reads=True)
            self.assertEqual(py.returncode, 0, py.stderr[-1500:])
            markdown = committed_markdown(repo)
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


# Both suites run once more here, which takes longer than everything else of a CI run: this class runs in the nightly workflow
# (.github/workflows/nightly.yml), which sets AGENT_M_NIGHTLY=1, and is skipped on every push.
NIGHTLY = os.environ.get("AGENT_M_NIGHTLY") == "1"


@unittest.skipUnless(NIGHTLY, "runs nightly: it runs both suites once more (.github/workflows/nightly.yml)")
class NoTestOpensAgentMsOwnSpec(unittest.TestCase):
    """Both suites, run as CI runs them, with Agent M's own SPEC.md watched. Expected: the suites run; no node test opens it,
    and every Python open of it comes from a whole-repository scan (ITM-128's corrected criterion)."""

    def test_no_node_test_opens_agent_ms_own_spec(self):
        files = sorted(str(p.relative_to(ROOT)) for p in TESTS.glob("*.test.mjs"))
        run, seen = watched(["node", "--test", *files], ROOT, ROOT / "SPEC.md")
        self.assertTrue(files and run.returncode == 0, run.stdout[-2000:] + run.stderr[-2000:])
        self.assertEqual(seen, [])

    def test_every_python_open_of_agent_ms_own_spec_comes_from_a_whole_repository_scan(self):
        # Finding S1 (2026-10-01) decided no defect on 2026-10-02: the two scans it saw open SPEC.md as one file among all.
        modules = sorted(p.stem for p in TESTS.glob("test*.py") if p.stem != THIS)
        run, seen = watched([sys.executable, "-m", "unittest", "-q", *modules], TESTS, ROOT / "SPEC.md", reads=True)
        self.assertTrue(modules and run.returncode == 0, run.stderr[-2000:])
        self.assertEqual(not_from_a_scan(seen, committed_markdown(ROOT)), [])


if __name__ == "__main__":
    unittest.main()
