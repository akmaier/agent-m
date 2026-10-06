"""Run a JavaScript expression against the dashboard's ES modules and return its JSON value.

The SPEC names Python files as checks for behaviour that lives in docs/assets/*.mjs. Rather than
re-implementing that behaviour in Python (two implementations drift apart), these tests ask node.

Every module file below docs/assets/ (the vendored libraries excepted) and below src/ is reached in the expression by its
file name in camelCase — `gitHost` for git-host.mjs, `bridgeTunnel` for bridge-tunnel.mjs, `settingsStore`, `reviewCore` — and
is imported when the expression names it. A file in a folder of src/ that holds an index.mjs — the folder of a module of
the architecture — is reached by the folder's name instead: its index.mjs as `repositoryHosts` for src/repository-hosts/,
another of its files as `repositoryHostsGithub` for src/repository-hosts/github.mjs. `core` (review-core.mjs) and `store`
(settings-store.mjs) are always there.
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "assets"
SRC = ROOT / "src"
ALIASES = {"core": "review-core.mjs", "store": "settings-store.mjs"}


def namespace(path: Path) -> str:
    """git-host.mjs -> gitHost: the name a module file is reached by in an expression."""
    first, *rest = re.split(r"[-_.]", path.stem)
    return first + "".join(p[:1].upper() + p[1:] for p in rest)


def name_of(f: Path) -> str:
    """The name a file is reached by: a file of a module's folder (one that holds an index.mjs) by the folder's name."""
    if f.is_relative_to(SRC) and (f.parent / "index.mjs").exists():
        folder = f.parent.name
        return namespace(Path(folder + ".mjs")) if f.stem == "index" else namespace(Path(f"{folder}-{f.stem}.mjs"))
    return namespace(f)


def module_files() -> dict:
    """{ name: path } for every module file of the site, and the two aliases."""
    found = {}
    for f in [*sorted(ASSETS.rglob("*.mjs")), *sorted(SRC.rglob("*.mjs"))]:
        if f.is_relative_to(ASSETS) and "vendor" in f.relative_to(ASSETS).parts:
            continue
        name = name_of(f)
        if name in found or name in ALIASES:
            raise AssertionError(f"two module files are reached by the name {name}: {found.get(name)} and {f}")
        found[name] = f
    return {**{a: ASSETS / f for a, f in ALIASES.items()}, **found}


def js(expr: str):
    named = {n: p for n, p in module_files().items() if n in ALIASES or re.search(rf"\b{re.escape(n)}\b", expr)}
    code = ("".join(f"import * as {n} from '{p.as_uri()}';" for n, p in named.items())
            + f"const v = await (async () => {{ {expr} }})();"
            "process.stdout.write(JSON.stringify(v === undefined ? null : v));")
    r = subprocess.run(["node", "--input-type=module", "-e", code], capture_output=True, text=True)
    if r.returncode != 0:
        raise AssertionError(r.stderr.strip()[-800:])
    return json.loads(r.stdout)
