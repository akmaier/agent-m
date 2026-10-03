# Module: MOD-artifacts
# Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022
# Level: release
# The Python half of the SPEC-read watcher of tests/test_release_sprint_02_c.py (ITM-128, ITM-144, ITM-158), by tester-opus
# (claude-opus-5-5). Loaded by every Python process whose PYTHONPATH names this folder — CI's Python step, and the processes
# the release test starts. Without RELEASE_WATCH_FILE and RELEASE_WATCH_LOG it does nothing.
#
# An audit hook notes every `open` of the watched file and every `git` started inside the watched file's folder that names it,
# each with the test file:line frames it came from ("<file>:<line> <function>", innermost last). With RELEASE_WATCH_READS it
# also notes every other file of that folder a process opens ("python read <path> <- …"), so that a whole-repository scan can
# be told from a read by name (ITM-128's corrected criterion). The watcher's own opens are not noted.
import os
import sys

_WATCH, _LOG = os.environ.get("RELEASE_WATCH_FILE"), os.environ.get("RELEASE_WATCH_LOG")
if _WATCH and _LOG:
    _WATCH = os.path.realpath(_WATCH)
    _BASE, _HOME = os.path.basename(_WATCH), os.path.dirname(_WATCH)
    _READS = bool(os.environ.get("RELEASE_WATCH_READS"))  # also note every other file of the folder that is opened
    _open = open
    _busy = []  # the watcher's own opens (the log, the source lines of the frames) are not noted

    def _note(what):
        import traceback
        _busy.append(1)
        try:
            where = " | ".join(f"{os.path.basename(f.filename)}:{f.lineno} {f.name}" for f in traceback.extract_stack()[:-2]
                               if os.path.basename(f.filename).startswith(("test", "release")))
            with _open(_LOG, "a", encoding="utf-8") as fh:
                fh.write(f"python {what} <- {where or sys.argv[0]}\n")
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
            if words and os.path.basename(words[0]) == "git" and any(_BASE in w for w in words) \
                    and (cwd + os.sep).startswith(_HOME + os.sep):
                _note("git " + " ".join(words))

    sys.addaudithook(_hook)
