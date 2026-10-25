# Module: MOD-repository-hosts
# Guards: A CREDENTIAL IS NEVER PLACED IN A URL
# Level: component
"""SPEC §7 A CREDENTIAL IS NEVER PLACED IN A URL — through MOD-repository-hosts' interface (src/repository-hosts/index.mjs)."""
import unittest

from jsrun import js

TOKEN = "github_pat_SECRET0123456789"
HOST = (f"const sent = []; globalThis.fetch = async (u) => {{ sent.push(String(u)); return new Response('{{}}', {{ status: 404 }}); }};"
        f"const host = repositoryHosts.connect(repositoryHosts.parseAddress('https://github.com/a/b'), {{ token: '{TOKEN}' }});")


class NoCredentialInUrl(unittest.TestCase):
    # Expected: a request whose address would hold the token — a read of a branch named like it — is refused with a TypeError that
    # names the address, and nothing is sent; an address with a user name and token in it is no repository's address. Known
    # positive: a read of another branch is sent.
    def test_a_request_whose_address_holds_the_token_is_refused(self):
        v = js(HOST + f"let e = null; try {{ await host.readSnapshot('{TOKEN}'); }} catch (x) {{ e = x; }}"
               "const refused = [e?.name, String(e?.message)]; await host.readSnapshot('main').catch(() => null);"
               f"let p = null; try {{ repositoryHosts.parseAddress('https://oauth2:{TOKEN}@github.com/a/b'); }} catch (x) {{ p = x.name; }}"
               "return { refused, sent, p };")
        self.assertEqual(v["refused"][0], "TypeError")
        self.assertIn("address", v["refused"][1])
        self.assertNotIn(TOKEN, v["refused"][1])
        self.assertEqual(len(v["sent"]), 1, "only the read of main was sent")
        self.assertNotIn(TOKEN, v["sent"][0])
        self.assertEqual(v["p"], "TypeError")

    # Expected: the pages of GitHub the dashboard links — the new-file page, the editor, a file, a run, the token pages — take no
    # token among their arguments and carry none, though the host was connected with one.
    def test_github_links_take_no_token(self):
        v = js(HOST + "const l = host.webLinks();"
               "const pages = [l.newFile('docs/x.md', 'kind: x'), l.editFile('SPEC.md'), l.file('SPEC.md', 'main'), l.run('1'),"
               " l.newToken('Agent M', 'd', 30), l.tokens, l.secrets, l.actions];"
               "return { arity: [l.newFile.length, l.editFile.length, l.file.length], pages };")
        self.assertEqual(v["arity"], [2, 1, 2])
        self.assertEqual(len(v["pages"]), 8)
        self.assertEqual([p for p in v["pages"] if TOKEN in p], [])


if __name__ == "__main__":
    unittest.main()
