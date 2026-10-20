# Module: MOD-documents
# Guards: NO SECRET IN THE REPOSITORY; A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
# Level: system
"""SPEC section 0 and section 17 - the check named tests/test_no_secret_written.py, for NO SECRET IN THE REPOSITORY ("a generated artifact containing a
configured secret value fails the run") and A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE ("a configured resource credential written into
`docs/resources.md` fails the run; counter-proof: the secret's name alone passes").

The cases live in tests/test_no_secret_written.md. This file only loads them and asks node to run the real code over them: in the mode `commit`, the
repository host of src/repository-hosts/ connected with the configured secrets, asked to commit the files a run would write, over a `fetch` that counts the
requests and answers none; in the mode `list`, a docs/resources.md read with the resource schema of src/resource-list/ and checked with its
resourceFindings. A refused commit must name the path and never repeat the value. Each secret value is a made-up text that stands in no other file.

Written for ITM-1131 by a participant who built none of the behaviour it checks (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
NO_SECRET = "NO SECRET IN THE REPOSITORY"
NAMES_SECRET = "A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE"

# The adapter. `input` is the case's input; the value holds what the case may state: `refused`, `named`, `requests` (0, or "some"), `echoed`, `errorRules`.
WORLD = r"""
const secretsOf = [...(input.secrets ?? []), ...(input.token ? [input.token] : [])];
const echoes = (text) => secretsOf.some((secret) => String(text).includes(secret));
if (input.mode === "list") {
  const document_ = documents.readDocument(resourceList.resourceSchema(), "docs/resources.md", input.text);
  const rows = document_.sections[0]?.rows ?? [];
  const resources = rows.map(({ cells: c }) => ({ name: c.Name, kind: c.Kind, address: c.Address, pin: c.Pin ?? null, licence: c.Licence ?? null, maintainer: c.Maintainer ?? null,
    route: c.Route ?? "", place: c["Processing place"] ?? null, paid: c.Paid === "yes" ? true : c.Paid === "no" ? false : null, secret: c.Secret ?? null }));
  const found = resourceList.resourceFindings(resources);
  return { errorRules: found.filter((each) => each.kind === "error").map((each) => each.rule), echoed: found.some((each) => echoes(JSON.stringify(each))) };
}
let requests = 0;
const realFetch = globalThis.fetch;
globalThis.fetch = async () => { requests += 1; throw new TypeError("the test's network answers nothing"); };
try {
  const host = repositoryHosts.connect(repositoryHosts.parseAddress("https://github.com/alice/thesis-tool"), { token: input.token ?? null, secrets: input.secrets ?? [] });
  const files = input.files.map((file) => (file.bytes === undefined ? file : { path: file.path, bytes: new TextEncoder().encode(file.bytes) }));
  let failure = null;
  try { await host.commitFiles({ branch: "main", expectedHead: "0".repeat(40), files, message: input.message ?? "a commit" }); } catch (error) { failure = error; }
  return { refused: failure?.name === "SecretRefused", named: failure?.name === "SecretRefused" ? failure.path : null, requests: requests === 0 ? 0 : "some",
    echoed: failure ? echoes(`${failure.message} ${failure.path ?? ""} ${JSON.stringify(failure)}`) : false };
} finally { globalThis.fetch = realFetch; }
"""


def cases(section: str, data: Path = DATA) -> list[dict]:
    text = data.read_text(encoding="utf-8")
    body = re.search(rf"^## {re.escape(section)}\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    if not body:
        raise AssertionError(f"missing section {section}")
    found = [{"name": m.group(1), "case": json.loads(m.group(2))}
             for m in re.finditer(r"^### ([^\n]+)\n\n```json\n(.*?)\n```", body.group(1), re.M | re.S)]
    if not found:
        raise AssertionError(f"no cases under {section}")
    return found


def run_world(argument: dict) -> dict:
    return js(f"const input = {json.dumps(argument)};\n{WORLD}")


def check(test: unittest.TestCase, section: str) -> None:
    for loaded in cases(section):
        with test.subTest(case=loaded["name"]):
            got = run_world(loaded["case"]["input"])
            wanted = loaded["case"]["expected"]
            test.assertEqual({key: got[key] for key in wanted}, wanted)


class TestNoSecretWritten(unittest.TestCase):
    # TST-1131001 · level: system · module: MOD-documents
    # guards: NO SECRET IN THE REPOSITORY
    # given: the cases under that requirement in the Markdown file beside this one: a job record, a file given as bytes and an artifact quoting the person's token, each holding a configured secret; and the counter-proof, the same record without the value
    # input: the real repository host connected with the secrets, asked to commit the files, over a spy that counts the requests
    # expect: each artifact that holds a secret is refused as SecretRefused naming its path, before any request, and the refusal repeats no value; the artifact without the value goes past the check to the server
    def test_a_generated_artifact_holding_a_configured_secret_fails_the_run(self):
        check(self, NO_SECRET)

    # TST-1131002 · level: system · module: MOD-documents
    # guards: A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
    # given: the cases under that requirement in the Markdown file beside this one: a docs/resources.md whose Secret column holds a value, read as a list and committed through the host with the value configured; and the counter-proofs, the name of a secret alone (a CI secret by name, `browser`, no secret)
    # input: the list read with the resource schema and checked with resourceFindings; the same text committed by the host
    # expect: the value is an error under the requirement and the commit is refused, naming docs/resources.md and repeating no value; the secret's name alone gives no error and is committed
    def test_a_configured_resource_credential_in_the_resource_list_fails_the_run(self):
        check(self, NAMES_SECRET)


if __name__ == "__main__":
    unittest.main()
