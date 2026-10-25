# Module: MOD-browser-store
# Guards: CONFIGURATION LIVES IN THE BROWSER
# Level: unit
"""SPEC §7 CONFIGURATION LIVES IN THE BROWSER — the token goes to the browser store and nowhere else."""
import re
import unittest

from jsrun import ROOT, SRC, js

# Browser storage: localStorage, sessionStorage, IndexedDB and Cache Storage (`caches`).
STORAGE_ACCESS = re.compile(r"\b(?:globalThis|window|self)\s*\.\s*(?:localStorage|sessionStorage|indexedDB|caches)\b|\b(?:localStorage|sessionStorage|indexedDB|caches)\s*[.\[]")
# A line of a comment, which may name the storage it explains without touching it.
COMMENT_LINE = re.compile(r"^\s*(?://|/\*|\*).*$", re.M)
FAKE = ("const mem = new Map(); globalThis.localStorage = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)),"
        " removeItem: k => mem.delete(k), get length() { return mem.size; }, key: i => [...mem.keys()][i] ?? null };")


def storage_users() -> dict:
    """{ path from the repository's root: the storages its code touches } for every module file of the site (vendored libraries
    excepted), its comments aside."""
    files = [f for f in sorted(SRC.rglob("*.mjs")) if "vendor" not in f.parts]
    users = {}
    for f in files:
        code = COMMENT_LINE.sub("", f.read_text(encoding="utf-8"))
        found = sorted({re.search(r"localStorage|sessionStorage|indexedDB|caches", m.group(0)).group(0) for m in STORAGE_ACCESS.finditer(code)})
        if found:
            users[f.relative_to(ROOT).as_posix()] = found
    return users


class ConfigClientSide(unittest.TestCase):
    def test_token_lands_in_the_given_browser_store(self):
        v = js(FAKE + "const s = browserStore.openStore('akmaier/agent-m');"
               " browserStore.writeSetting(s, 'github-token', { value: 'github_pat_x', name: 'GitHub token', expires: null, stored: '2026-10-25' });"
               " return [browserStore.readSetting(s, 'github-token').value, [...mem.keys()]];")
        self.assertEqual(v, ["github_pat_x", ["agent-m:akmaier/agent-m:github-token"]])

    def test_only_the_store_module_touches_browser_storage(self):
        # Every module file of the site: the configuration is touched only by MOD-browser-store's store.mjs. The live app's start
        # touches Cache Storage alone, to remove the store of file texts an earlier version kept, which holds no configuration.
        self.assertEqual(storage_users(), {"src/browser-store/store.mjs": ["localStorage", "sessionStorage"],
                                           "src/site-frame/dashboard-app.mjs": ["caches"]})

    def test_counter_proof_access_not_the_word(self):
        self.assertTrue(STORAGE_ACCESS.search("localStorage.setItem('k', t)"))
        self.assertTrue(STORAGE_ACCESS.search("globalThis.sessionStorage['k']"))
        self.assertTrue(STORAGE_ACCESS.search("indexedDB.open('x')"))
        self.assertTrue(STORAGE_ACCESS.search("storage = globalThis.localStorage;"))
        self.assertTrue(STORAGE_ACCESS.search("await caches.open('x')"))
        self.assertTrue(STORAGE_ACCESS.search("const s = globalThis.caches ?? null;"))
        self.assertFalse(STORAGE_ACCESS.search("const headersCache = new Map(); acceptedCache.has(k)"))
        self.assertFalse(STORAGE_ACCESS.search("saved in this browser (its <code>localStorage</code>)"))
        self.assertEqual(COMMENT_LINE.sub("", "// kept in localStorage.\nlocalStorage.getItem(k);\n").strip(), "localStorage.getItem(k);")


if __name__ == "__main__":
    unittest.main()
