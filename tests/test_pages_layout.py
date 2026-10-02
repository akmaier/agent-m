# Guards: THE PAGES ROOT IS DOCS; ONE REVIEW LAYOUT FOR EVERY PRODUCT
# Level: unit
"""SPEC §10 THE PAGES ROOT IS DOCS · ONE REVIEW LAYOUT FOR EVERY PRODUCT.

The check of the origins the site calls (§0 NO SERVER) is in tests/test_no_backend.py, the file the SPEC names for it."""
import unittest

from artifact_checks import DOCS


class PagesLayout(unittest.TestCase):
    def test_layout(self):
        for p in ["index.html", ".nojekyll", "use-cases", "approvals", "spec-freigaben"]:
            self.assertTrue((DOCS / p).exists(), p)


if __name__ == "__main__":
    unittest.main()
