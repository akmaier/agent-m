# Module: MOD-browser-store
# Guards: CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
# Level: unit
"""SPEC §7 CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
COOKIE = re.compile(r"document\s*\.\s*cookie|cookieStore")


def cookie_users():
    """The entry pages and every module file of the site — under src/ and docs/assets/, vendored libraries excepted — that write a cookie."""
    modules = [f for root in (ROOT / "src", DOCS / "assets") for f in root.rglob("*.mjs") if "vendor" not in f.parts]
    files = [ROOT / "index.html", *DOCS.glob("*.html"), *modules]
    return [f.name for f in files if COOKIE.search(f.read_text(encoding="utf-8"))]


class NoCookie(unittest.TestCase):
    def test_no_site_code_writes_a_cookie(self):
        self.assertTrue((ROOT / "src" / "browser-store" / "store.mjs").exists(), "known positive: the store's files are among those read")
        self.assertEqual(cookie_users(), [])

    def test_counter_proof(self):
        self.assertTrue(COOKIE.search('document.cookie = "t=" + token'))
        self.assertTrue(COOKIE.search("await cookieStore.set('t', token)"))


if __name__ == "__main__":
    unittest.main()
