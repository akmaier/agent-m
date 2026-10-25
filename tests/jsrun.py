# Module: MOD-test-document
"""Run a JavaScript expression against the ES modules under src/ and return its JSON value.

The SPEC names Python files as checks for behaviour that lives in the modules' code. Rather than re-implementing that
behaviour in Python (two implementations drift apart), these tests ask node.

Every module file below src/ is reached in the expression by its file name in camelCase — `preloads` for preloads.mjs —
and is imported when the expression names it. A file in a folder of src/ that holds an index.mjs — the folder of a module
of the architecture — is reached by the folder's name instead: its index.mjs as `repositoryHosts` for
src/repository-hosts/, another of its files as `repositoryHostsGithub` for src/repository-hosts/github.mjs.
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"


def namespace(path: Path) -> str:
    """repository-hosts.mjs -> repositoryHosts: the name a module file is reached by in an expression."""
    first, *rest = re.split(r"[-_.]", path.stem)
    return first + "".join(p[:1].upper() + p[1:] for p in rest)


def name_of(f: Path) -> str:
    """The name a file is reached by: a file of a module's folder (one that holds an index.mjs) by the folder's name."""
    if f.is_relative_to(SRC) and (f.parent / "index.mjs").exists():
        folder = f.parent.name
        return namespace(Path(folder + ".mjs")) if f.stem == "index" else namespace(Path(f"{folder}-{f.stem}.mjs"))
    return namespace(f)


def module_files() -> dict:
    """{ name: path } for every module file of the site."""
    found = {}
    for f in sorted(SRC.rglob("*.mjs")):
        name = name_of(f)
        if name in found:
            raise AssertionError(f"two module files are reached by the name {name}: {found.get(name)} and {f}")
        found[name] = f
    return found


def js(expr: str):
    named = {n: p for n, p in module_files().items() if re.search(rf"\b{re.escape(n)}\b", expr)}
    code = ("".join(f"import * as {n} from '{p.as_uri()}';" for n, p in named.items())
            + f"const v = await (async () => {{ {expr} }})();"
            "process.stdout.write(JSON.stringify(v === undefined ? null : v));")
    r = subprocess.run(["node", "--input-type=module"], input=code, capture_output=True, text=True)
    if r.returncode != 0:
        raise AssertionError(r.stderr.strip()[-800:])
    return json.loads(r.stdout)
