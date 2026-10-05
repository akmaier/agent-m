# Guards: THE PAGES ROOT IS THE REPOSITORY ROOT; DOCUMENTS ARE REVIEWED AND EDITED UNDER DOCS; ONE REVIEW LAYOUT FOR EVERY PRODUCT
# Level: unit
"""SPEC §10 THE PAGES ROOT IS THE REPOSITORY ROOT · DOCUMENTS ARE REVIEWED AND EDITED UNDER DOCS · ONE REVIEW LAYOUT FOR
EVERY PRODUCT.

The Pages site is served from the root of the default branch (Settings → Pages: `main`, `/ (root)`, as README.md and UC-014
tell a fork): the root holds the main page and a `.nojekyll`, so that Pages serves the repository's files as they are; the
review pages and the review layout are under docs/. Which folder Pages serves is a setting of GitHub, which no file of the
repository can show; the files it serves are checked here.

The check of the origins the site calls (§0 NO SERVER) is in tests/test_no_backend.py, the file the SPEC names for it."""
import unittest

from artifact_checks import DOCS, ROOT


class PagesLayout(unittest.TestCase):
    def test_the_root_holds_the_main_page(self):
        for p in ["index.html", ".nojekyll"]:
            self.assertTrue((ROOT / p).is_file(), p)

    def test_the_review_pages_and_the_review_layout_are_under_docs(self):
        for p in ["index.html", "use-cases", "approvals", "spec-freigaben"]:
            self.assertTrue((DOCS / p).exists(), p)


if __name__ == "__main__":
    unittest.main()
