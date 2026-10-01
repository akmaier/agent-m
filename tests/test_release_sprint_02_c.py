# Module: MOD-artifacts
# Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022
# Level: release
# Release test of sprint 02, strand C (ITM-144), written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md,
# who implemented none of the strand's items; started on sprint/02 at a7b4b9f, 2026-10-01.
"""ITM-128: no test of the repository opens Agent M's own SPEC.md — its acceptance criterion "No file under tests/ opens the
repository's own SPEC.md; reading a fixture's SPEC.md stays allowed", after the process rule KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE
("Kein Produkt-Code öffnet ein SPEC-Dokument zum Lesen — kein Test, kein Skript, kein Generator"). The rule ITM-128 realises,
ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS, is checked on fixture text instead (tests/release-sprint-02-c-*.test.mjs).

Checked over the repository's files by running them, not by reading them: both suites run once more, as CI runs them, with a
watcher in every process they start — a Python audit hook (sitecustomize, for every Python process) and a module that node
loads first (NODE_OPTIONS, for every node process) — which notes every open of the watched file and every `git` command run
inside the repository that names it. A test that reads the file under any spelling of its path, through any reader, is seen;
a fixture's SPEC.md is another file and is not. The watcher is first shown to see each way of opening a planted file
(CLAUDE.md §6a.2: a negative result counts only once the probe has hit a known positive). This file does not run itself.
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
    _open = open
    def _note(what):
        import traceback
        where = " | ".join(f"{os.path.basename(f.filename)}:{f.lineno}" for f in traceback.extract_stack()[:-2]
                           if os.path.basename(f.filename).startswith(("test", "release")))
        with _open(_LOG, "a", encoding="utf-8") as fh:
            fh.write(f"python {what} <- {where or sys.argv[0]}\\n")
    def _hook(event, args):
        if event == "open" and isinstance(args[0], (str, bytes, os.PathLike)):
            if os.path.realpath(os.fsdecode(args[0])) == _WATCH:
                _note("open " + os.fsdecode(args[0]))
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


def watched(cmd: list, cwd: Path, watch: Path) -> tuple:
    """Run cmd with the watcher in every Python and node process it starts -> (completed process, the lines it noted)."""
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        (d / "sitecustomize.py").write_text(SITECUSTOMIZE, encoding="utf-8")
        (d / "watch.mjs").write_text(NODE_HOOK, encoding="utf-8")
        log = d / "seen.log"
        log.write_text("", encoding="utf-8")
        env = dict(os.environ, RELEASE_WATCH_FILE=str(watch), RELEASE_WATCH_LOG=str(log),
                   PYTHONPATH=os.pathsep.join(filter(None, [str(d), os.environ.get("PYTHONPATH")])),
                   NODE_OPTIONS=" ".join(filter(None, [f"--import={(d / 'watch.mjs').as_uri()}", os.environ.get("NODE_OPTIONS")])))
        run = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True)
        return run, [l for l in log.read_text(encoding="utf-8").splitlines() if l]


class TheWatcherSeesAKnownRead(unittest.TestCase):
    """The known positive: a planted SPEC.md in a scratch repository, opened in every way a test could, is seen each time; the
    fixture SPEC.md beside it, opened the same ways, is not."""

    def test_every_way_of_opening_the_watched_file_is_seen_and_a_fixture_is_not(self):
        with tempfile.TemporaryDirectory() as d:
            repo = Path(d)
            (repo / "tests" / "fixtures").mkdir(parents=True)
            for p in (repo / "SPEC.md", repo / "tests" / "fixtures" / "SPEC.md"):
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
            node, seen_node = watched(["node", "--test", "tests/a.test.mjs"], repo, repo / "SPEC.md")
            self.assertEqual(node.returncode, 0, node.stdout[-1500:] + node.stderr[-1500:])
            py, seen_py = watched([sys.executable, "-m", "unittest", "-q", "test_a"], repo / "tests", repo / "SPEC.md")
            self.assertEqual(py.returncode, 0, py.stderr[-1500:])
        # A reader may open the file through another (readFileSync through openSync on some versions): each planted way of
        # opening it must be seen at least once.
        kinds = lambda seen: {l.split(" ")[0] + " " + l.split(" ")[1] for l in seen}
        self.assertLessEqual({"node fs.promises.readFile", "node fs.readFileSync", "node git"}, kinds(seen_node), seen_node)
        self.assertLessEqual({"node fs.readFileSync", "python git", "python open"}, kinds(seen_py), seen_py)
        self.assertEqual(sum(l.startswith("python open") for l in seen_py), 2, seen_py)
        self.assertFalse([l for l in seen_node + seen_py if "fixtures" in l], "a fixture's SPEC.md is not the watched file")


class NoTestOpensAgentMsOwnSpec(unittest.TestCase):
    """Both suites, run as CI runs them, with Agent M's own SPEC.md watched. Expected: the suites run, and nothing is seen."""

    def test_no_node_test_opens_agent_ms_own_spec(self):
        files = sorted(str(p.relative_to(ROOT)) for p in TESTS.glob("*.test.mjs"))
        run, seen = watched(["node", "--test", *files], ROOT, ROOT / "SPEC.md")
        self.assertTrue(files and run.returncode == 0, run.stdout[-2000:] + run.stderr[-2000:])
        self.assertEqual(seen, [])

    @unittest.expectedFailure  # finding S1 — back to Development: ITM-128 (its acceptance criterion); one reader came with ITM-050
    def test_no_python_test_opens_agent_ms_own_spec(self):
        modules = sorted(p.stem for p in TESTS.glob("test*.py") if p.stem != THIS)
        run, seen = watched([sys.executable, "-m", "unittest", "-q", *modules], TESTS, ROOT / "SPEC.md")
        self.assertTrue(modules and run.returncode == 0, run.stderr[-2000:])
        self.assertEqual(seen, [])


if __name__ == "__main__":
    unittest.main()
