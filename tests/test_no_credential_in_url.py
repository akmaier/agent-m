"""SPEC §7 A CREDENTIAL IS NEVER PLACED IN A URL."""
import unittest

from jsrun import js


class NoCredentialInUrl(unittest.TestCase):
    def test_fetch_refuses_a_url_that_contains_the_token(self):
        v = js("try { await core.fetchText('https://api.github.com/repos/a/b?access_token=github_pat_SECRET', {}, 'github_pat_SECRET'); return 'sent'; }"
               " catch (e) { return String(e.message); }")
        self.assertIn("URL", v)

    def test_github_links_take_no_token(self):
        v = js("return [core.newFileUrl.length, core.editUrl.length, core.blobUrl.length];")
        self.assertEqual(v, [4, 3, 3])


if __name__ == "__main__":
    unittest.main()
