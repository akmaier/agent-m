# Guards: THE PAGES ROOT IS DOCS; ONE REVIEW LAYOUT FOR EVERY PRODUCT; NO SERVER
# Level: unit
"""SPEC §10 THE PAGES ROOT IS DOCS · ONE REVIEW LAYOUT FOR EVERY PRODUCT · §0 NO SERVER."""
import re
import unittest

from artifact_checks import DOCS

# The only origins the site may call (§0 NO SERVER). github.com is navigation, not a call:
# links there open GitHub's own editor. localhost is the local bridge, which §0's check names — reached on this
# machine, directly or through the forward of a tunnel (§6 A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL).
ALLOWED = {"api.github.com", "raw.githubusercontent.com", "github.com", "localhost"}


def foreign_origins(text: str) -> set[str]:
    return {h for h in re.findall(r"https?://([a-z0-9.-]+)", text) if h not in ALLOWED}


class PagesLayout(unittest.TestCase):
    def test_layout(self):
        for p in ["index.html", ".nojekyll", "use-cases", "approvals", "spec-freigaben"]:
            self.assertTrue((DOCS / p).exists(), p)

    def test_site_code_calls_no_foreign_origin(self):
        found = {}
        # Every module file of the site, the dashboard's views under assets/dashboard/ included (vendored libraries excepted).
        own = [f for f in (DOCS / "assets").rglob("*.mjs") if "vendor" not in f.relative_to(DOCS / "assets").parts]
        for f in list(DOCS.glob("*.html")) + own + list((DOCS / "assets").glob("*.css")):
            o = foreign_origins(f.read_text(encoding="utf-8"))
            if o:
                found[f.name] = sorted(o)
        self.assertEqual(found, {})

    def test_counter_proof(self):
        self.assertEqual(foreign_origins('fetchText("https://api.github.com/repos")'), set())
        self.assertEqual(foreign_origins('<script src="https://cdn.jsdelivr.net/npm/x"></script>'),
                         {"cdn.jsdelivr.net"})


if __name__ == "__main__":
    unittest.main()
