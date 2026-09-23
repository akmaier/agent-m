"""Run a JavaScript expression against the dashboard's ES modules and return its JSON value.

The SPEC names Python files as checks for behaviour that lives in docs/assets/*.mjs. Rather than
re-implementing that behaviour in Python (two implementations drift apart), these tests ask node.
"""
import json
import subprocess
from pathlib import Path

ASSETS = Path(__file__).resolve().parents[1] / "docs" / "assets"


def js(expr: str):
    code = (f"import * as core from '{(ASSETS / 'review-core.mjs').as_uri()}';"
            f"import * as store from '{(ASSETS / 'settings-store.mjs').as_uri()}';"
            f"const v = await (async () => {{ {expr} }})();"
            "process.stdout.write(JSON.stringify(v === undefined ? null : v));")
    r = subprocess.run(["node", "--input-type=module", "-e", code], capture_output=True, text=True)
    if r.returncode != 0:
        raise AssertionError(r.stderr.strip()[-800:])
    return json.loads(r.stdout)
