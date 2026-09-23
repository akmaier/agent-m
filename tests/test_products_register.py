"""SPEC §10 THE INSTANCE LISTS ITS PRODUCTS IN A FILE — docs/products.md."""
import unittest
from pathlib import Path

from jsrun import js

REGISTER = Path(__file__).resolve().parents[1] / "docs" / "products.md"


def parse(text):
    return js(f"return core.parseProducts({text!r});")


class ProductsRegister(unittest.TestCase):
    def test_register_exists_and_parses(self):
        self.assertTrue(REGISTER.is_file())
        products = parse(REGISTER.read_text(encoding="utf-8"))
        repos = [p["repo"] for p in products]
        self.assertEqual(len(repos), len(set(repos)), "duplicate product")

    def test_examples_in_code_blocks_are_not_products(self):
        # docs/products.md shows the format in a code block; that line must not become a product.
        self.assertEqual(parse("# P\n\n```\n- `owner/name` — example\n```\n\n- `a/b`\n"),
                         [{"repo": "a/b", "note": ""}])
        self.assertNotIn("owner/name", [p["repo"] for p in parse(REGISTER.read_text(encoding="utf-8"))])

    def test_counter_proof(self):
        text = "# P\n\n- `akmaier/dvd_database` — DVD shelf\n- `a/b`\n* `not/a-list-marker`\n- akmaier/no-backticks\n- `../evil`\n"
        self.assertEqual(parse(text), [{"repo": "akmaier/dvd_database", "note": "DVD shelf"},
                                       {"repo": "a/b", "note": ""}])


if __name__ == "__main__":
    unittest.main()
