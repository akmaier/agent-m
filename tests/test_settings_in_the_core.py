# Module: MOD-review-core
# Guards: THE SHARED PAGES ORIGIN IS DISCLOSED; A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY; UC-042
# Level: unit
"""SPEC §7 THE SHARED PAGES ORIGIN IS DISCLOSED · A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY (UC-042) — the parts the kernel
still holds (docs/assets/review-core.mjs canStore, savePseudonymisation).

Moved, unchanged, out of tests/test_settings_disclosure.py and tests/test_settings_page.py when those were split by module:
the gate before anything is stored, and the commit of a product setting to the product's repository.
"""
import unittest

from jsrun import ASSETS, js

STORE = ASSETS / "settings-store.mjs"


class SettingsDisclosure(unittest.TestCase):
    def test_nothing_can_be_stored_before_acknowledging(self):
        self.assertEqual(js("return [core.canStore(false), core.canStore(true)];"), [False, True])


class ProductSettingsInTheRepository(unittest.TestCase):
    def test_the_store_has_no_product_setting(self):
        src = STORE.read_text(encoding="utf-8")
        for word in ("pseudonym", "collaborator", "settings.md"):
            self.assertNotIn(word, src.lower())
        v = js("const mem = new Map(); const fake = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)),"
               " removeItem: k => mem.delete(k), get length() { return mem.size; }, key: i => [...mem.keys()][i] ?? null };"
               "const calls = []; globalThis.fetch = async (u, init) => { calls.push(init.method + ' ' + new URL(u).pathname);"
               " const ok = (o) => new Response(JSON.stringify(o)); const p = new URL(u).pathname;"
               " if (p.endsWith('/git/ref/heads/main')) return ok({ object: { sha: 'c0' } });"
               " if (p.endsWith('/git/commits/c0')) return ok({ tree: { sha: 't0' } });"
               " if (p.endsWith('/git/trees')) return ok({ sha: 't1' }); if (p.endsWith('/git/commits')) return ok({ sha: 'c1' });"
               " return ok({}); };"
               "store.createStore(fake).setToken('github_pat_t');"
               "await core.savePseudonymisation({ repo: 'alice/thesis', branch: 'main', token: 'github_pat_t', click: { isTrusted: true },"
               " current: null, currentBlob: null, off: true, acknowledged: true });"
               "return [calls, [...mem.keys()]];")
        calls, keys = v
        self.assertIn("PATCH /repos/alice/thesis/git/refs/heads/main", calls, "changing a product setting commits to the product")
        self.assertEqual(keys, ["agent-m.github-token"], "counter-proof: localStorage holds no product setting")


if __name__ == "__main__":
    unittest.main()
