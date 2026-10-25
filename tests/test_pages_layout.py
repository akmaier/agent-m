# Module: MOD-site-frame
# Guards: THE PAGES ROOT IS THE REPOSITORY ROOT; DOCUMENTS ARE REVIEWED AND EDITED UNDER DOCS; ONE REVIEW LAYOUT FOR EVERY PRODUCT
# Guards: AGENT M'S SOURCE CODE LIVES IN SRC
# Level: unit
"""SPEC §10 THE PAGES ROOT IS THE REPOSITORY ROOT · DOCUMENTS ARE REVIEWED AND EDITED UNDER DOCS · ONE REVIEW LAYOUT FOR
EVERY PRODUCT.

The Pages site is served from the root of the default branch (Settings → Pages: `main`, `/ (root)`, as README.md and UC-014
tell a fork): the root holds the main page and a `.nojekyll`, so that Pages serves the repository's files as they are; the
review pages and the review layout are under docs/. Which folder Pages serves is a setting of GitHub, which no file of the
repository can show; the files it serves are checked here.

The check of the origins the site calls (§0 NO SERVER) is in tests/test_no_backend.py, the file the SPEC names for it."""
import re
import subprocess
import unittest

from artifact_checks import DOCS, ROOT


class PagesLayout(unittest.TestCase):
    def test_the_root_holds_the_main_page(self):
        for p in ["index.html", ".nojekyll"]:
            self.assertTrue((ROOT / p).is_file(), p)

    def test_the_review_pages_and_the_review_layout_are_under_docs(self):
        # ONE REVIEW LAYOUT FOR EVERY PRODUCT: "use cases in `docs/use-cases/`, architecture decisions in `docs/architecture/`, SPEC
        # change queues in `docs/spec-freigaben/`, approval records in `docs/approvals/`".
        for p in ["index.html", "use-cases", "architecture", "approvals", "spec-freigaben"]:
            self.assertTrue((DOCS / p).exists(), p)

    # Expected: the review page's entry page loads exactly one script, the app's module under src/, and docs/assets/ holds no
    # vendored library (the renderer's own copies under src/markdown-render/vendor/ are the site's one set).
    def test_the_review_page_loads_no_library_of_its_own(self):
        page = (DOCS / "index.html").read_text(encoding="utf-8")
        scripts = re.findall(r"<script\b[^>]*\bsrc=\"([^\"]+)\"", page)
        self.assertEqual(scripts, ["../src/site-frame/dashboard-app.mjs"])
        self.assertTrue((ROOT / "src" / "markdown-render" / "vendor" / "mermaid.min.js").is_file(), "known positive: the module's copy")
        self.assertFalse((DOCS / "assets" / "vendor").exists())


    # AGENT M'S SOURCE CODE LIVES IN SRC: "Every script, style sheet and library of Agent M lives under `src/` of its repository, apart
    # from its tests and its CI workflows." Check: "no script, style sheet or library of Agent M lies outside `src/`, `tests/` and
    # `.github/workflows/`". The files are those git tracks; a script, style sheet or library is a file of these extensions.
    # Expected: none outside the three folders. Known positive: the same listing finds such files under src/.
    def test_no_script_style_sheet_or_library_lies_outside_src_tests_and_the_workflows(self):
        tracked = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.split("\n")
        code = [p for p in tracked if re.search(r"\.(mjs|cjs|js|ts|css|py|sh|wasm)$", p)]
        self.assertTrue(any(p.startswith("src/") for p in code), "known positive: the listing finds the code under src/")
        outside = [p for p in code if not p.startswith(("src/", "tests/", ".github/workflows/"))]
        self.assertEqual(outside, [])

    # Counter-proof: the same selection over a listing that holds a planted script outside the three folders names it.
    def test_counter_proof_a_script_outside_the_three_folders_is_named(self):
        listing = ["src/a/index.mjs", "tests/t.test.mjs", ".github/workflows/w.yml", "docs/assets/planted.mjs", "docs/x.md"]
        code = [p for p in listing if re.search(r"\.(mjs|cjs|js|ts|css|py|sh|wasm)$", p)]
        self.assertEqual([p for p in code if not p.startswith(("src/", "tests/", ".github/workflows/"))], ["docs/assets/planted.mjs"])


if __name__ == "__main__":
    unittest.main()
