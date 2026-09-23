"""SPEC §7 A CLEAR IS A REAL CLEAR — clearing removes the entries from storage, not only from a form."""
import unittest

from jsrun import js

FAKE = "const mem = new Map(); const fake = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k), get length() { return mem.size; }, key: i => [...mem.keys()][i] ?? null };"


class ClearRemovesStorage(unittest.TestCase):
    def test_clear_leaves_no_agent_m_key(self):
        v = js(FAKE + "fake.setItem('other-app', 'keep'); const s = store.createStore(fake);"
               "s.setToken('github_pat_x'); s.clear(); return [s.getToken(), [...mem.keys()]];")
        self.assertEqual(v, [None, ["other-app"]])

    def test_counter_proof_a_form_reset_is_not_a_clear(self):
        # What a broken clear looks like: the store still answers with the token.
        v = js(FAKE + "const s = store.createStore(fake); s.setToken('t'); return s.getToken();")
        self.assertEqual(v, "t")


if __name__ == "__main__":
    unittest.main()
