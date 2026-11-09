# Module: MOD-spec-changes
# Guards: THE PERSON WHO PROMPTS IS A SOURCE
# Level: release
"""SPEC section 1 - the check named tests/test_prompted_source.py.

The cases live in tests/test_prompted_source.md. This file loads them, takes the prompting person's account from
MOD-source-register's personAccount, judges the sections a prompted change drafts — the texts it saves — with the
correction loop's check requirement-form for a job whose source is that account, and judges them with sourceFindings
against a product that neither registers nor links that account.
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")

JS_CHECK = """
const schemas = sourceRegister.sourceSchemas();
const SHA = "0".repeat(64);
const text = (...lines) => `${lines.join("\\n")}\\n`;
function entryText(entry) {
  return text("---", `id: ${entry.id}`, `title: ${entry.title}`, `kind: ${entry.kind}`,
    "authority: normative", "licence: may be republished - fixture",
    ...(entry.identifier === null || entry.identifier === undefined ? [] : [`identifier: ${entry.identifier}`]),
    "---", `# ${entry.id} ${entry.title}`, "", "A fixture source.", "", "## Versions", "",
    "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
    "| `2026-10-13` | 2026-10-13 | fixture | this repository | one file, hashed only |");
}
function entryDocument(entry) {
  return documents.readDocument(schemas.entry, `docs/sources/${entry.id}.md`, entryText(entry));
}
function linksDocument(linked) {
  const rows = linked.map((id) => `| ${id} | 2026-10-13 | ${SHA} | |`);
  return documents.readDocument(schemas.links, "docs/sources.md", text("# The sources this product meets", "",
    "| Source | Version | Hash | Part |", "|---|---|---|---|", ...rows));
}
async function promptedSourceResult(input) {
  const links = linksDocument(input.linked ?? []);
  const register = (input.entries ?? []).map(entryDocument);
  // The person's account, as personAccount gives it for the instance's snapshot: the owner of the instance's repository.
  const source = sourceRegister.personAccount({ repository: { server: "github", path: input.instance } });
  // The sections the change drafts, the person's account written where the case writes <account>; the counter-proof writes another source there.
  const sections = input.sections.map((text) => text.split("<account>").join(input.dropAccount ? "Unlinked Source" : source));
  const snapshot = { read: async (path) => (path === "SPEC.md" ? input.spec : null) };
  const form = await jobRunnerBuiltins.builtins.checks["requirement-form"]({ sections, why: "the instruction" }, { params: { source }, product: { snapshot } });
  const spec = specDocument.parseSpec(sections.join("\\n"));
  const findings = sourceRegister.sourceFindings([...spec.requirements.values()], links, register).map((found) => found.rule);
  return { source, sections, form: form.map((found) => [found.artifact, found.rule]), findings };
}
"""


def fence(body: str, heading: str) -> str:
    match = re.search(rf"^### {re.escape(heading)}\n\n```[a-z]*\n(.*?)\n```", body, re.M | re.S)
    if not match:
        raise AssertionError(f"missing fenced block under {heading}")
    return match.group(1)


def sections() -> list[dict]:
    text = DATA.read_text(encoding="utf-8")
    found = []
    for match in re.finditer(r"^## (?P<name>[^\n]+)\n(?P<body>.*?)(?=^## |\Z)", text, re.M | re.S):
        found.append({"name": match.group("name"), "body": match.group("body")})
    if not found:
        raise AssertionError("no cases loaded")
    return found


def cases() -> list[dict]:
    return [{"name": section["name"], "case": json.loads(fence(section["body"], "Case"))} for section in sections()]


def result(case: dict) -> dict:
    return js(JS_CHECK + "return await promptedSourceResult(%s);" % json.dumps(case))


class TestPromptedSource(unittest.TestCase):
    # TST-416100 · level: release · module: system
    # guards: THE PERSON WHO PROMPTS IS A SOURCE; A REQUIREMENT HAS A REGISTERED SOURCE
    # given: Markdown fixture cases: an instance owned by alice, a register with only bob's person entry, a product that links only bob,
    #   a product SPEC and the section a prompted change drafts, one requirement changed and one added
    # input: personAccount, the check requirement-form over the drafted section, then sourceFindings over it
    # expect: every drafted requirement names github.com/alice and passes both; counter-proof: with another source in its place, each fails both
    def test_prompted_requirement_changes_use_the_persons_account(self):
        loaded = cases()
        self.assertEqual(len(loaded), 2)
        for item in loaded:
            with self.subTest(case=item["name"]):
                self.assertEqual(result(item["case"]), item["case"]["expected"])

    # TST-416101 · level: release · module: system
    # guards: THE PERSON WHO PROMPTS IS A SOURCE
    # given: the two prompt cases
    # input: the loaded expected results
    # expect: the data holds the account path, with the account in every section and no finding, and the counter-proof with findings of both checks
    def test_cases_cover_the_account_and_its_counter_proof(self):
        expected = [case["case"]["expected"] for case in cases()]
        named = next(item for item in expected if not item["form"])
        self.assertEqual(named["source"], "github.com/alice")
        self.assertTrue(all("github.com/alice)*" in section for section in named["sections"]))
        self.assertEqual([named["form"], named["findings"]], [[], []])
        self.assertTrue(any(item["form"] and item["findings"] for item in expected))


if __name__ == "__main__":
    unittest.main()
