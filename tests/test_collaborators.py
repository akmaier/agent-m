# Module: MOD-personal-data
# Guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
# Level: release
"""SPEC section 14 - the check named tests/test_collaborators.py.

The cases live in tests/test_collaborators.md. This file loads them and drives the real namedPersonFindings of
MOD-personal-data in Node, with the collaborators file read by the schema the module gives (MOD-documents readRegister).
"""
import json
import re
import subprocess
import unittest
from pathlib import Path

DATA = Path(__file__).with_suffix(".md")
ROOT = Path(__file__).resolve().parents[1]
PERSONAL = (ROOT / "src" / "personal-data" / "index.mjs").as_uri()
DOCUMENTS = (ROOT / "src" / "documents" / "index.mjs").as_uri()

JS_CHECK = r"""
import { readRegister } from "__DOCUMENTS_URL__";
import { namedPersonFindings, settingsSchemas } from "__PERSONAL_URL__";

async function run(input) {
  const { collaborators: schema } = await settingsSchemas();
  const document = input.collaborators === null ? null : readRegister(schema, "docs/collaborators.md", input.collaborators).document;
  const known = { names: input.names, addresses: [], phones: [], accounts: [] };
  const found = namedPersonFindings(input.text, input.artifact, known, document, input.accounts);
  return { findings: found.map((f) => ({ artifact: f.artifact, line: f.line, kind: f.kind, rule: f.rule })) };
}
"""


def fence(body: str, heading: str) -> str:
    match = re.search(rf"^### {re.escape(heading)}\n\n```[a-z]*\n(.*?)\n```", body, re.M | re.S)
    if not match:
        raise AssertionError(f"missing fenced block under {heading}")
    return match.group(1)


def cases() -> list[dict]:
    text = DATA.read_text(encoding="utf-8")
    found = []
    for match in re.finditer(r"^## (?P<name>[^\n]+)\n(?P<body>.*?)(?=^## |\Z)", text, re.M | re.S):
        found.append({"name": match.group("name"), "case": json.loads(fence(match.group("body"), "Case"))})
    if not found:
        raise AssertionError("no cases loaded")
    return found


def result(case: dict) -> dict:
    code = (JS_CHECK.replace("__DOCUMENTS_URL__", DOCUMENTS).replace("__PERSONAL_URL__", PERSONAL)
            + f"\nconst input = {json.dumps(case['input'])};"
              "\nprocess.stdout.write(JSON.stringify(await run(input)));")
    run = subprocess.run(["node", "--input-type=module", "-e", code], cwd=ROOT, capture_output=True, text=True)
    if run.returncode != 0:
        raise AssertionError(run.stderr.strip()[-1200:])
    return json.loads(run.stdout)


class TestCollaborators(unittest.TestCase):
    # TST-840001 · level: release · module: MOD-personal-data
    # guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
    # given: the Markdown cases beside this file, each a collaborators file, the accounts of the server and a generated artifact
    # input: namedPersonFindings with a known name that is unlisted and no account, a listed collaborator's name, and an account name
    # expect: the unlisted name is reported with artifact and line; the listed collaborator's name and the account name pass
    def test_a_person_is_named_only_by_account_or_with_consent(self):
        for loaded in cases():
            with self.subTest(case=loaded["name"]):
                self.assertEqual(result(loaded["case"]), loaded["case"]["expected"])


if __name__ == "__main__":
    unittest.main()
