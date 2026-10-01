"""SPEC §7 CONFIGURATION LIVES IN THE BROWSER — the token goes to the browser store and nowhere else."""
import re
import unittest
from pathlib import Path

from jsrun import ASSETS, js

# Browser storage: localStorage, sessionStorage, IndexedDB and Cache Storage (`caches`, where the texts of files read are kept).
STORAGE_ACCESS = re.compile(r"\b(?:globalThis|window|self)\s*\.\s*(?:localStorage|sessionStorage|indexedDB|caches)\b|\b(?:localStorage|sessionStorage|indexedDB|caches)\s*[.\[]")
FAKE = "const mem = new Map(); const fake = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k), get length() { return mem.size; }, key: i => [...mem.keys()][i] ?? null };"


class ConfigClientSide(unittest.TestCase):
    def test_token_lands_in_the_given_browser_store(self):
        v = js(FAKE + "const s = store.createStore(fake); s.setToken('github_pat_x');"
               "return [s.getToken(), [...mem.keys()]];")
        self.assertEqual(v, ["github_pat_x", ["agent-m.github-token"]])

    def test_only_the_store_module_touches_browser_storage(self):
        # Every module file of the site, the dashboard's views under docs/assets/dashboard/ included (vendored libraries excepted).
        files = [f for f in sorted(ASSETS.rglob("*.mjs")) if "vendor" not in f.relative_to(ASSETS).parts]
        users = [f.name for f in files if STORAGE_ACCESS.search(f.read_text(encoding="utf-8"))]
        self.assertEqual(users, ["settings-store.mjs"])

    def test_counter_proof_access_not_the_word(self):
        self.assertTrue(STORAGE_ACCESS.search("localStorage.setItem('k', t)"))
        self.assertTrue(STORAGE_ACCESS.search("globalThis.sessionStorage['k']"))
        self.assertTrue(STORAGE_ACCESS.search("indexedDB.open('x')"))
        self.assertTrue(STORAGE_ACCESS.search("storage = globalThis.localStorage;"))
        self.assertTrue(STORAGE_ACCESS.search("await caches.open('x')"))
        self.assertTrue(STORAGE_ACCESS.search("const s = globalThis.caches ?? null;"))
        self.assertFalse(STORAGE_ACCESS.search("const headersCache = new Map(); acceptedCache.has(k)"))
        self.assertFalse(STORAGE_ACCESS.search("saved in this browser (its <code>localStorage</code>)"))


if __name__ == "__main__":
    unittest.main()
