"""SPEC §7 CONFIGURATION LIVES IN THE BROWSER — the token goes to the browser store and nowhere else."""
import re
import unittest
from pathlib import Path

from jsrun import ASSETS, js

FAKE = "const mem = new Map(); const fake = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k), get length() { return mem.size; }, key: i => [...mem.keys()][i] ?? null };"


class ConfigClientSide(unittest.TestCase):
    def test_token_lands_in_the_given_browser_store(self):
        v = js(FAKE + "const s = store.createStore(fake); s.setToken('github_pat_x');"
               "return [s.getToken(), [...mem.keys()]];")
        self.assertEqual(v, ["github_pat_x", ["agent-m.github-token"]])

    def test_only_the_store_module_touches_browser_storage(self):
        users = [f.name for f in ASSETS.glob("*.mjs")
                 if re.search(r"\b(localStorage|sessionStorage|indexedDB)\b", f.read_text(encoding="utf-8"))]
        self.assertEqual(users, ["settings-store.mjs"])


if __name__ == "__main__":
    unittest.main()
