# Module: MOD-artifacts
# Guards: A REQUIREMENT HAS A REGISTERED SOURCE; A RESOURCE'S TERMS ENTER AS A SOURCE
# Level: unit
"""SPEC §2 A REQUIREMENT HAS A REGISTERED SOURCE — every requirement names at least one source linked to
its product. §15 A RESOURCE'S TERMS ENTER AS A SOURCE — a requirement naming a resource entry as its source
is rejected; counter-proof: the same requirement naming the registered licence source passes.

Sources and resource entries are named by their identifiers (SRC-…, RES-…; EVERY ARTIFACT HAS AN
IDENTIFIER). The linked sources are given as the product's docs/sources.md would list them. The texts are
the fixture tests/fixtures/requirements/spec.md, never Agent M's own SPEC.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

SPEC = (Path(__file__).resolve().parent / "fixtures" / "requirements" / "spec.md").read_text(encoding="utf-8")
LINKED = ["SRC-po", "SRC-model-licence", "SRC-iec-62304"]
REGISTERED = "A REQUIREMENT HAS A REGISTERED SOURCE"
TERMS = "A RESOURCE'S TERMS ENTER AS A SOURCE"
SOLD = "THE PRODUCT IS NOT SOLD"
SOLD_SOURCE = "*(SRC-model-licence, 2026-09-24,\nreworded 2026-09-30)*"


def findings(text: str, name: str, linked=LINKED) -> list:
    return js(f"const r = requirements.parseRequirements({json.dumps(text)}).get({json.dumps(name)});"
              f"return requirements.requirementProblems(r, {json.dumps(linked)});")


def kinds(fs: list) -> list:
    return [(f["kind"], f["rule"]) for f in fs]


class RequirementHasSource(unittest.TestCase):
    def test_a_linked_source_is_a_registered_source(self):
        for name in ("THE EXPORT IS A PDF", SOLD, "EVERY CHANGE IS VERIFIED"):
            self.assertEqual(findings(SPEC, name), [], name)
        self.assertEqual(findings(SPEC, "THE EXPORT IS A PDF", [{"source": "SRC-po", "version": "1"}]), [],
                         "links as docs/sources.md lists them, each with its version")

    def test_counter_proof_a_source_the_product_does_not_link(self):
        self.assertEqual(kinds(findings(SPEC, "THE EXPORT IS A PDF", ["SRC-model-licence"])), [("error", REGISTERED)],
                         "SRC-po is registered but not linked to this product")
        self.assertEqual(kinds(findings(SPEC.replace("*(SRC-po, 2026-09-24)*", "*(PO A. Maier, 2026-09-24)*"),
                                        "THE EXPORT IS A PDF")), [("error", REGISTERED)], "no source identifier at all")
        self.assertEqual(kinds(findings(SPEC.replace("*(SRC-po, 2026-09-24)*", "*(SRC-po, SRC-other, 2026-09-24)*"),
                                        "THE EXPORT IS A PDF")), [("error", REGISTERED)],
                         "a second source the product does not link")

    def test_a_resource_entry_named_as_source_is_rejected(self):
        # The resource entry RES-model records which licence applies; it does not by itself create a requirement.
        as_resource = SPEC.replace(SOLD_SOURCE, "*(RES-model, 2026-09-24,\nreworded 2026-09-30)*")
        fs = findings(as_resource, SOLD)
        self.assertIn(("error", TERMS), kinds(fs))
        self.assertTrue(all(f["kind"] == "error" for f in fs))
        # Counter-proof: the same requirement naming the registered licence source passes.
        self.assertEqual(findings(SPEC, SOLD), [])
        # A resource entry among linked sources is still rejected.
        both = SPEC.replace(SOLD_SOURCE, "*(SRC-model-licence, RES-model, 2026-09-24,\nreworded 2026-09-30)*")
        self.assertEqual(kinds(findings(both, SOLD)), [("error", TERMS)])


if __name__ == "__main__":
    unittest.main()
