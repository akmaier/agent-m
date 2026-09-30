"""SPEC §7 EVERY SETTING IS REACHED FROM ONE PAGE · A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS
SHOWN · A STORED SECRET IS HIDDEN UNTIL SHOWN · A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE ·
A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY (UC-042).

The browser section of the settings page is rendered by core.browserSettingsHtml; the page inserts
that HTML as it is. So "appears on the page" is checked on the HTML the page shows.
"""
import json
import re
import unittest

from jsrun import ASSETS, js

STORE = ASSETS / "settings-store.mjs"
KEY_RE = re.compile(r"""PREFIX\s*\+\s*["']([^"']+)["']""")
SECRET = "github_pat_11SECRETVALUEabcdefghijklmnop"


def keys_written(store_source: str) -> list[str]:
    """Every localStorage key the store module can write: each is a constant PREFIX + "name"."""
    return ["agent-m." + k for k in KEY_RE.findall(store_source)]


def keys_without_place(store_source: str, page_html: str) -> list[str]:
    return [k for k in keys_written(store_source) if f'data-setting-key="{k}"' not in page_html]


def page(entries: dict, shown=(), now="2026-09-30", state=None) -> str:
    return js(f"return core.browserSettingsHtml({{ entries: {json.dumps(entries)}, shown: {json.dumps(list(shown))},"
              f" now: new Date('{now}T12:00:00Z'), tokenState: {json.dumps(state)} }});")


def full_entries() -> dict:
    return js("return { [store.TOKEN_KEY]: '" + SECRET + "', [store.TOKEN_EXPIRY_KEY]: '2026-12-29',"
              " [store.PRODUCTS_KEY]: JSON.stringify(['https://github.com/alice/thesis']) };")


class EverySettingOnOnePage(unittest.TestCase):
    def test_every_key_the_store_writes_has_a_place_on_the_page(self):
        src = STORE.read_text(encoding="utf-8")
        self.assertGreaterEqual(len(keys_written(src)), 3)
        self.assertEqual(keys_without_place(src, page({})), [], "empty browser")
        self.assertEqual(keys_without_place(src, page(full_entries())), [], "everything stored")

    def test_the_store_writes_no_key_but_its_named_ones(self):
        # A key built any other way (a template, a variable) would escape the check above.
        src = STORE.read_text(encoding="utf-8")
        for call in re.findall(r"setItem\(([^,]+),", src):
            self.assertRegex(call.strip(), r"^(TOKEN_KEY|TOKEN_EXPIRY_KEY|PRODUCTS_KEY|k)$", call)
        self.assertIn("KEYS.includes(k)", src, "putEntries writes only the named keys")

    def test_counter_proof_a_key_without_a_place_fails(self):
        fixture = STORE.read_text(encoding="utf-8") + '\nexport const BRIDGE_KEY = PREFIX + "bridge-token";\n'
        self.assertEqual(keys_without_place(fixture, page(full_entries())), ["agent-m.bridge-token"])


class TestedAndCleared(unittest.TestCase):
    def test_each_browser_setting_has_test_and_clear(self):
        html = page(full_entries())
        rows = re.findall(r'<div class="setting" data-setting-row="([^"]+)">(.*?)</div><!--/setting-->', html, re.S)
        self.assertEqual(sorted(r for r, _ in rows), ["github-token", "products"])
        for name, body in rows:
            self.assertIn("data-test=", body, name)
            self.assertIn("data-clear=", body, name)
        self.assertIn('data-remove-product="https://github.com/alice/thesis"', html)

    def test_counter_proof_a_row_without_clear_is_seen(self):
        body = '<div class="setting" data-setting-row="x"><button data-test="x">Test</button></div><!--/setting-->'
        rows = re.findall(r'<div class="setting" data-setting-row="([^"]+)">(.*?)</div><!--/setting-->', body, re.S)
        self.assertNotIn("data-clear=", rows[0][1])


class SecretHiddenUntilShown(unittest.TestCase):
    def test_a_stored_secret_is_rendered_hidden(self):
        html = page(full_entries())
        tags = re.findall(r"<input\b[^>]*>", html)
        holding = [t for t in tags if SECRET in t]
        self.assertEqual(len(holding), 1)
        self.assertRegex(holding[0], r'type="password"')
        without_inputs = re.sub(r"<input\b[^>]*>", "", html)
        self.assertNotIn(SECRET, without_inputs)
        self.assertNotIn(SECRET[-4:], without_inputs, "not even its last characters in clear")
        self.assertIn('data-show="agent-m.github-token"', html)

    def test_counter_proof_after_show_it_appears_in_full(self):
        html = page(full_entries(), shown=["agent-m.github-token"])
        tag = [t for t in re.findall(r"<input\b[^>]*>", html) if SECRET in t][0]
        self.assertRegex(tag, r'type="text"')
        self.assertIn(f'value="{SECRET}"', tag)


class ExpiryWarnedInAdvance(unittest.TestCase):
    def test_default_expiry_is_the_links_90_days(self):
        v = js("return [core.defaultExpiry(new Date('2026-09-30T08:00:00Z')),"
               " new URL(core.tokenLinkUrl('a/agent-m')).searchParams.get('expires_in')];")
        self.assertEqual(v, ["2026-12-29", "90"])

    def test_warning_from_fourteen_days_before(self):
        w = js("const n = new Date('2026-09-30T12:00:00Z'); return ['2026-10-15', '2026-10-14', '2026-09-30', '2026-09-29', null]"
               ".map((d) => core.expiryWarning(d, n));")
        self.assertIsNone(w[0], "15 days before: no warning yet")
        self.assertEqual((w[1]["days"], w[1]["expired"]), (14, False))
        self.assertIn("2026-10-14", w[1]["text"])
        self.assertEqual(w[1]["renewUrl"], "https://github.com/settings/personal-access-tokens")
        self.assertEqual((w[2]["days"], w[2]["expired"]), (0, False))
        self.assertTrue(w[3]["expired"])
        self.assertIsNone(w[4], "no date recorded: nothing to warn of")

    def test_the_banner_on_every_page_carries_renew(self):
        b = js("return [core.tokenBannerHtml({ expires: '2026-10-10', now: new Date('2026-09-30T12:00:00Z') }),"
               " core.tokenBannerHtml({ expires: '2026-12-29', now: new Date('2026-09-30T12:00:00Z') }),"
               " core.tokenBannerHtml({ expires: null, refused: true, now: new Date('2026-09-30T12:00:00Z') })];")
        self.assertIn("2026-10-10", b[0])
        self.assertIn("Renew", b[0])
        self.assertIn("https://github.com/settings/personal-access-tokens", b[0])
        self.assertIn("Regenerate token", b[0])
        self.assertEqual(b[1], "", "counter-proof: far from expiry, no banner")
        self.assertIn("GitHub token", b[2])
        self.assertIn("Renew", b[2])
        app = (ASSETS / "review-app.mjs").read_text(encoding="utf-8")
        route = re.search(r"async function route\(\).*?\n}\n", app, re.S).group(0)
        self.assertIn("tokenBannerHtml(", route, "the banner is added in route(), which renders every view")

    def test_storing_a_token_asks_for_its_expiry(self):
        app = (ASSETS / "review-app.mjs").read_text(encoding="utf-8")
        for fn in ("viewSettings", "storeKeyStep"):
            body = re.search(rf"function {fn}\(.*?\n}}\n", app, re.S).group(0)
            self.assertRegex(body, r'<input type="date"[^>]*value="\$\{h\(defaultExpiry\(\)\)\}"', fn)
        self.assertEqual(len(re.findall(r"store\.setToken\(\w+, \w+", app)), 2, "both places store the date with the token")

    def test_the_state_line_names_the_expiry(self):
        html = page(full_entries(), now="2026-12-20")
        self.assertIn("expires on 2026-12-29", html)
        self.assertIn("⚠", html)


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
