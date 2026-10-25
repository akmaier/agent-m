# Module: MOD-browser-store
# Guards: A CLEAR IS A REAL CLEAR
# Level: unit
"""SPEC §7 A CLEAR IS A REAL CLEAR — clearing removes the entries from storage, not only from a form."""
import unittest

from jsrun import js

FAKE = ("const mem = new Map(); globalThis.localStorage = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)),"
        " removeItem: k => mem.delete(k), get length() { return mem.size; }, key: i => [...mem.keys()][i] ?? null };"
        " const s = browserStore.openStore('akmaier/agent-m');"
        " browserStore.writeSetting(s, 'github-token', { value: 'github_pat_x', name: 'GitHub token', expires: null, stored: '2026-10-25' });"
        " browserStore.writeSetting(s, 'products', ['https://github.com/a/b']);")
READ = "[browserStore.readSetting(s, 'github-token'), browserStore.readSetting(s, 'products'), [...mem.keys()]]"


class ClearRemovesStorage(unittest.TestCase):
    def test_clear_leaves_no_agent_m_key(self):
        v = js(FAKE + f" mem.set('other-app', 'keep'); browserStore.clearEverything(s); return {READ};")
        self.assertEqual(v, [None, None, ["other-app"]])

    def test_clearing_one_setting_removes_its_entry(self):
        v = js(FAKE + f" browserStore.clearSetting(s, 'github-token'); return {READ};")
        self.assertEqual(v, [None, ["https://github.com/a/b"], ["agent-m:akmaier/agent-m:products"]])

    def test_counter_proof_a_form_reset_is_not_a_clear(self):
        # What a broken clear looks like: the store still answers with the token.
        v = js(FAKE + f" return {READ};")
        self.assertEqual(v[0]["value"], "github_pat_x")
        self.assertEqual(v[1], ["https://github.com/a/b"])


if __name__ == "__main__":
    unittest.main()
