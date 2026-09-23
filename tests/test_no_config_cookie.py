"""SPEC §7 CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE."""
import re
import unittest
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1] / "docs"
COOKIE = re.compile(r"document\s*\.\s*cookie|cookieStore")


def cookie_users():
    files = list(DOCS.glob("*.html")) + list((DOCS / "assets").glob("*.mjs"))
    return [f.name for f in files if COOKIE.search(f.read_text(encoding="utf-8"))]


class NoCookie(unittest.TestCase):
    def test_no_site_code_writes_a_cookie(self):
        self.assertEqual(cookie_users(), [])

    def test_counter_proof(self):
        self.assertTrue(COOKIE.search('document.cookie = "t=" + token'))
        self.assertTrue(COOKIE.search("await cookieStore.set('t', token)"))


if __name__ == "__main__":
    unittest.main()
