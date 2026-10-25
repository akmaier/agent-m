# Module: MOD-spec-document
# Guards: A REQUIREMENT HAS A REGISTERED SOURCE; A RESOURCE'S TERMS ENTER AS A SOURCE
# Level: unit
"""SPEC §2 A REQUIREMENT HAS A REGISTERED SOURCE — every requirement names at least one source linked to
its product. §15 A RESOURCE'S TERMS ENTER AS A SOURCE — a requirement naming a resource entry as its source
is rejected; counter-proof: the same requirement naming the registered licence source passes.

The requirements are read by MOD-spec-document (parseSpec) and judged by MOD-source-register's sourceFindings
against the instance's register and the product's links, each read through MOD-documents with the schemas
sourceSchemas gives. An item of a requirement's source names the register entry whose identifier or title it
begins with, followed by the end of the item or by `, ` and the part it draws on. The register holds four
entries, three of them linked to the product: SRC-po, titled "PO A. Maier"; SRC-model-licence; SRC-iec-62304;
and SRC-other, which the product does not link. A resource entry (RES-…) is no register entry. The texts are
the fixture tests/fixtures/requirements/spec.md, never Agent M's own SPEC.
"""
import unittest
from pathlib import Path

from artifact_checks import module_call

SPEC = (Path(__file__).resolve().parent / "fixtures" / "requirements" / "spec.md").read_text(encoding="utf-8")
REGISTER = [("SRC-po", "PO A. Maier"), ("SRC-model-licence", "The licence of the model"),
            ("SRC-iec-62304", "Medical device software"), ("SRC-other", "Another source")]
LINKED = ["SRC-po", "SRC-model-licence", "SRC-iec-62304"]
REGISTERED = "A REQUIREMENT HAS A REGISTERED SOURCE"
TERMS = "A RESOURCE'S TERMS ENTER AS A SOURCE"
SOLD = "THE PRODUCT IS NOT SOLD"
SOLD_SOURCE = "*(SRC-model-licence, its terms\nof use)*"
NAMED = "A NAMED RULE STAYS ONE"
PDF = "THE EXPORT IS A PDF"
PDF_SOURCE = "*(SRC-po)*"


def findings(text: str, names, linked=LINKED) -> list:
    """sourceFindings of the requirements `names` of the SPEC `text`, against the register above and a links file of the
    product that links `linked`."""
    return module_call(
        "const { entry, links } = sourceRegister.sourceSchemas();"
        "const register = D.register.map(([id, title]) => documents.readDocument(entry, `docs/sources/${id}.md`,"
        " ['---', `id: ${id}`, `title: ${title}`, 'kind: document', 'authority: normative',"
        " 'licence: may be republished — fixture', '---', `# ${id} ${title}`, '', 'A fixture source.', ''].join('\\n')));"
        "const linkFile = documents.readDocument(links, 'docs/sources.md', ['# The sources this product meets', '',"
        " '| Source | Version | Hash | Part |', '|---|---|---|---|',"
        " ...D.linked.map((id) => `| ${id} | 2026-10-05 | ${'0'.repeat(64)} |  |`), ''].join('\\n'));"
        "const spec = specDocument.parseSpec(D.text);"
        "return sourceRegister.sourceFindings(D.names.map((n) => spec.requirements.get(n)), linkFile, register);",
        {"text": text, "names": list(names), "linked": linked, "register": REGISTER})


def kinds(fs: list) -> list:
    return [(f["kind"], f["rule"]) for f in fs]


class RequirementHasSource(unittest.TestCase):
    def test_a_linked_source_is_a_registered_source(self):
        for name in (PDF, SOLD, "EVERY CHANGE IS VERIFIED"):
            self.assertEqual(findings(SPEC, [name]), [], name)

    def test_a_source_named_by_its_title_is_a_registered_source(self):
        # "PO A. Maier" is the title of SRC-po, which the product links.
        self.assertEqual(findings(SPEC, [NAMED]), [], "PO A. Maier")
        self.assertEqual(kinds(findings(SPEC, [NAMED], ["SRC-model-licence"])), [("error", REGISTERED)],
                         "known positive: the same title, its entry not linked")

    def test_counter_proof_a_source_the_product_does_not_link(self):
        self.assertEqual(kinds(findings(SPEC, [PDF], ["SRC-model-licence"])), [("error", REGISTERED)],
                         "SRC-po is registered but not linked to this product")
        self.assertEqual(kinds(findings(SPEC.replace(PDF_SOURCE, "*(SRC-other)*"), [PDF])), [("error", REGISTERED)],
                         "a registered source the product does not link")
        fs = findings(SPEC.replace("*(PO A. Maier)*", "*(PO B. Other)*"), [NAMED])
        self.assertEqual(kinds(fs), [("error", REGISTERED)], "a source that names no register entry")
        self.assertIn("PO B. Other", fs[0]["what"])

    def test_a_resource_entry_named_as_source_is_rejected(self):
        # The resource entry RES-model records which licence applies; it does not by itself create a requirement.
        as_resource = SPEC.replace(SOLD_SOURCE, "*(RES-model, its terms\nof use)*")
        self.assertEqual(kinds(findings(as_resource, [SOLD])), [("error", REGISTERED), ("error", TERMS)])
        # Counter-proof: the same requirement naming the registered licence source passes.
        self.assertEqual(findings(SPEC, [SOLD]), [])
        # A resource entry among linked sources is still rejected.
        both = SPEC.replace(SOLD_SOURCE, "*(SRC-model-licence; RES-model, its terms\nof use)*")
        self.assertEqual(kinds(findings(both, [SOLD])), [("error", TERMS)])
        # A resource entry beside a source named by its register entry's title is rejected too.
        named = SPEC.replace("*(PO A. Maier)*", "*(PO A. Maier; RES-model)*")
        self.assertEqual(kinds(findings(named, [NAMED])), [("error", TERMS)])


if __name__ == "__main__":
    unittest.main()
