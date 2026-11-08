# Module: MOD-spec-changes
# Guards: THE PERSON WHO PROMPTS IS A SOURCE
# Level: release
"""SPEC section 1 - the check named tests/test_prompted_source.py.

The cases live in tests/test_prompted_source.md. This file loads them, takes the prompting person's account from
MOD-source-register's personAccount, asks MOD-spec-changes for the sections a prompted change would save, and judges
those sections with sourceFindings against a product that neither registers nor links that account.
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
function promptedSourceResult(input) {
  const links = linksDocument(input.linked ?? []);
  const register = (input.entries ?? []).map(entryDocument);
  // The person's account, as personAccount gives it for the instance's snapshot: the owner of the instance's repository.
  const source = sourceRegister.personAccount({ repository: { server: "github", path: input.instance } });
  const sections = specChanges.entrySections(input.spec, { candidates: input.candidates ?? [] }, input.classes ?? [], source);
  // Counter-proof: the same sections with the account taken out of every source.
  const saved = sections.map((section) => input.dropAccount ? section.text.split(`; ${source})*`).join("; Unlinked Source)*").split(`(${source})*`).join("(Unlinked Source)*") : section.text);
  const spec = specDocument.parseSpec(saved.join("\\n"));
  const findings = sourceRegister.sourceFindings([...spec.requirements.values()], links, register).map((found) => found.rule);
  return { source, sections: input.dropAccount ? [] : sections, findings };
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
    return js(JS_CHECK + "return promptedSourceResult(%s);" % json.dumps(case))


class TestPromptedSource(unittest.TestCase):
    # TST-416100 · level: release · module: system
    # guards: THE PERSON WHO PROMPTS IS A SOURCE; A REQUIREMENT HAS A REGISTERED SOURCE
    # given: Markdown fixture cases: an instance owned by alice, a register with only bob's person entry, a product that links nothing,
    #   a product SPEC and prompted candidates
    # input: personAccount, entrySections, then sourceFindings over the saved sections
    # expect: every drafted requirement names github.com/alice and passes; counter-proof: with the account taken out, each fails
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
    # expect: the data holds the account path, with the account in every section and no finding, and the counter-proof with findings
    def test_cases_cover_the_account_and_its_counter_proof(self):
        expected = [case["case"]["expected"] for case in cases()]
        named = next(item for item in expected if item["sections"])
        self.assertEqual(named["source"], "github.com/alice")
        self.assertTrue(all("github.com/alice)*" in section["text"] for section in named["sections"]))
        self.assertFalse(any("github.com/alice, " in section["text"] for section in named["sections"]), "the account stands alone, with no passage")
        self.assertEqual(named["findings"], [])
        self.assertTrue(any(item["findings"] for item in expected))


if __name__ == "__main__":
    unittest.main()
