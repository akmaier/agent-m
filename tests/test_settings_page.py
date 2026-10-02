# Module: MOD-dashboard-app
# Guards: EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A STORED SECRET IS HIDDEN UNTIL SHOWN; A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; THE DASHBOARD WRITES THE TUNNEL COMMANDS; A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY; UC-042
# Level: component
"""SPEC §7 EVERY SETTING IS REACHED FROM ONE PAGE · A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS
SHOWN · A STORED SECRET IS HIDDEN UNTIL SHOWN · A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE (UC-042).
A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY: changing a product setting commits to the product's repository
(docs/assets/dashboard/writes.mjs savePseudonymisation), and the browser's store holds none — moved back here, unchanged but for
the module the write is reached by, from tests/test_settings_in_the_core.py when the writes left the kernel (ITM-124).

The browser section of the settings page is rendered by settingsView.browserSettingsHtml; the page inserts
that HTML as it is. So "appears on the page" is checked on the HTML the page shows.
"""
import json
import re
import unittest

from jsrun import ASSETS, js

STORE = ASSETS / "settings-store.mjs"


def dashboard_text(shell: bool = True) -> str:
    """The dashboard's own files (MOD-dashboard-app): the shell, dashboard-app.mjs, and every view and settings section under
    docs/assets/dashboard/ — what a test that read the one app file reads now; `shell=False`: the views alone."""
    views = sorted((ASSETS / "dashboard").rglob("*.mjs"))
    return "\n".join(f.read_text(encoding="utf-8") for f in ([ASSETS / "dashboard-app.mjs"] if shell else []) + views)
KEY_RE = re.compile(r"""PREFIX\s*\+\s*["']([^"']+)["']""")
SECRET = "github_pat_11SECRETVALUEabcdefghijklmnop"


def keys_written(store_source: str) -> list[str]:
    """Every localStorage key the store module can write: each is a constant PREFIX + "name"."""
    return ["agent-m." + k for k in KEY_RE.findall(store_source)]


def keys_without_place(store_source: str, page_html: str) -> list[str]:
    return [k for k in keys_written(store_source) if f'data-setting-key="{k}"' not in page_html]


def page(entries: dict, shown=(), now="2026-09-30") -> str:
    # The last test of each setting is kept in the browser beside it (ITM-136), so the entries carry it.
    return js(f"return settingsView.browserSettingsHtml({{ entries: {json.dumps(entries)}, shown: {json.dumps(list(shown))},"
              f" now: new Date('{now}T12:00:00Z') }});")


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
            self.assertRegex(call.strip(), r"^(TOKEN_KEY|TOKEN_EXPIRY_KEY|TOKEN_TEST_KEY|PRODUCTS_KEY|GITLAB_TOKENS_KEY|JUMP_HOST_KEY|REMOTE_SESSIONS_KEY|k)$", call)
        self.assertIn("KEYS.includes(k)", src, "putEntries writes only the named keys")

    def test_counter_proof_a_key_without_a_place_fails(self):
        fixture = STORE.read_text(encoding="utf-8") + '\nexport const BRIDGE_KEY = PREFIX + "bridge-token";\n'
        self.assertEqual(keys_without_place(fixture, page(full_entries())), ["agent-m.bridge-token"])


class TestedAndCleared(unittest.TestCase):
    def test_each_browser_setting_has_test_and_clear(self):
        html = page(full_entries())
        rows = re.findall(r'<div class="setting" data-setting-row="([^"]+)">(.*?)</div><!--/setting-->', html, re.S)
        self.assertEqual(sorted(r for r, _ in rows), ["github-token", "gitlab-tokens", "jump-host", "products", "remote-sessions"])
        for name, body in rows:
            self.assertIn("data-test=", body, name)
            self.assertIn("data-clear=", body, name)
        self.assertIn('data-remove-product="https://github.com/alice/thesis"', html)

    def test_the_last_test_is_read_from_the_browser(self):
        # UC-042 step 1 (ITM-136): the line shows the last test kept in this browser beside the token, not one of this page only.
        kept = js("return { [store.TOKEN_KEY]: '" + SECRET + "', [store.TOKEN_TEST_KEY]: JSON.stringify({ ok: '2026-09-29' }) };")
        self.assertIn('<p class="state">✓ works — tested 2026-09-29</p>', page(kept))
        refused = js("return { [store.TOKEN_KEY]: '" + SECRET + "', [store.TOKEN_TEST_KEY]: JSON.stringify({ refused: true }) };")
        self.assertIn('<p class="state">✗ refused — GitHub did not accept it at the last use</p>', page(refused))
        # Counter-proof: without a kept test the line says so.
        self.assertIn('<p class="state">stored — not tested on this page yet</p>', page({"agent-m.github-token": SECRET}))

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
        v = js("return [settingsView.defaultExpiry(new Date('2026-09-30T08:00:00Z')),"
               " new URL(settingsView.tokenLinkUrl('a/agent-m')).searchParams.get('expires_in')];")
        self.assertEqual(v, ["2026-12-29", "90"])

    def test_warning_from_fourteen_days_before(self):
        w = js("const n = new Date('2026-09-30T12:00:00Z'); return ['2026-10-15', '2026-10-14', '2026-09-30', '2026-09-29', null]"
               ".map((d) => settingsView.expiryWarning(d, n));")
        self.assertIsNone(w[0], "15 days before: no warning yet")
        self.assertEqual((w[1]["days"], w[1]["expired"]), (14, False))
        self.assertIn("2026-10-14", w[1]["text"])
        self.assertEqual(w[1]["renewUrl"], "https://github.com/settings/personal-access-tokens")
        self.assertEqual((w[2]["days"], w[2]["expired"]), (0, False))
        self.assertTrue(w[3]["expired"])
        self.assertIsNone(w[4], "no date recorded: nothing to warn of")

    def test_the_banner_on_every_page_carries_renew(self):
        b = js("return [settingsView.tokenBannerHtml({ expires: '2026-10-10', now: new Date('2026-09-30T12:00:00Z') }),"
               " settingsView.tokenBannerHtml({ expires: '2026-12-29', now: new Date('2026-09-30T12:00:00Z') }),"
               " settingsView.tokenBannerHtml({ expires: null, refused: true, now: new Date('2026-09-30T12:00:00Z') })];")
        self.assertIn("2026-10-10", b[0])
        self.assertIn("Renew", b[0])
        self.assertIn("https://github.com/settings/personal-access-tokens", b[0])
        self.assertIn("Regenerate token", b[0])
        self.assertEqual(b[1], "", "counter-proof: far from expiry, no banner")
        self.assertIn("GitHub token", b[2])
        self.assertIn("Renew", b[2])
        app = (ASSETS / "dashboard-app.mjs").read_text(encoding="utf-8")
        route = re.search(r"async function route\(\).*?\n}\n", app, re.S).group(0)
        self.assertIn("tokenBannerHtml(", route, "the banner is added in route(), which renders every view")

    def test_storing_a_token_asks_for_its_expiry(self):
        app = dashboard_text()
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
               "await writes.savePseudonymisation({ repo: 'alice/thesis', branch: 'main', token: 'github_pat_t', authority: writes.clickAuthority({ isTrusted: true }),"
               " current: null, currentBlob: null, off: true, acknowledged: true });"
               "return [calls, [...mem.keys()]];")
        calls, keys = v
        self.assertIn("PATCH /repos/alice/thesis/git/refs/heads/main", calls, "changing a product setting commits to the product")
        self.assertEqual(keys, ["agent-m.github-token"], "counter-proof: localStorage holds no product setting")


GL_ADDR = "https://gitlab.example.org/grp/sub/proj"
GL_SECRET = "glpat-GITLABSECRETvalue0123456789"


def gitlab_entries(expires="2026-12-29", tested=None) -> dict:
    # tested: the token's last test, kept beside it in its entry (ITM-136), or none.
    extra = f", tested: {json.dumps(tested)}" if tested is not None else ""
    return js("return { [store.GITLAB_TOKENS_KEY]: JSON.stringify({ '" + GL_ADDR + "': { token: '" + GL_SECRET + "', expires: '"
              + expires + "'" + extra + " } }), [store.PRODUCTS_KEY]: JSON.stringify(['" + GL_ADDR + "']) };")


class GitLabTokensOnThePage(unittest.TestCase):
    """UC-042: one line per GitLab project token — hidden with Show, Test, Change with its expiry date, Clear."""

    def line(self, html):
        rows = dict(re.findall(r'<div class="setting" data-setting-row="([^"]+)">(.*?)</div><!--/setting-->', html, re.S))
        return rows["gitlab-tokens"]

    def test_one_line_per_token_with_test_change_clear(self):
        body = self.line(page(gitlab_entries()))
        self.assertIn(f'data-setting-key="agent-m.gitlab-tokens"', body)
        self.assertIn(GL_ADDR, body)
        for control in (f'data-test-gitlab="{GL_ADDR}"', f'data-change-gitlab="{GL_ADDR}"', f'data-clear-gitlab="{GL_ADDR}"'):
            self.assertIn(control, body, control)
        self.assertIn("2026-12-29", body, "the expiry date recorded with the token")
        self.assertIn(f"{GL_ADDR}/-/settings/access_tokens", body, "where it is renewed")

    def test_the_token_is_hidden_until_shown(self):
        html = page(gitlab_entries())
        holding = [t for t in re.findall(r"<input\b[^>]*>", html) if GL_SECRET in t]
        self.assertEqual(len(holding), 1)
        self.assertRegex(holding[0], r'type="password"')
        self.assertNotIn(GL_SECRET, re.sub(r"<input\b[^>]*>", "", html))
        self.assertIn(f'data-show="agent-m.gitlab-tokens {GL_ADDR}"', html)
        shown = page(gitlab_entries(), shown=[f"agent-m.gitlab-tokens {GL_ADDR}"])
        tag = [t for t in re.findall(r"<input\b[^>]*>", shown) if GL_SECRET in t][0]
        self.assertRegex(tag, r'type="text"')

    def test_expiry_warned_and_refusal_named(self):
        self.assertIn("⚠", self.line(page(gitlab_entries("2026-10-05"))))
        refused = page(gitlab_entries(tested={"refused": True}))
        self.assertIn("refused", self.line(refused))

    def test_counter_proof_no_token_no_line_but_the_setting_keeps_its_place(self):
        body = self.line(page({}))
        self.assertNotIn("data-test-gitlab=", body)
        self.assertIn('data-setting-key="agent-m.gitlab-tokens"', body)
        self.assertIn("data-test=", body)
        self.assertIn("data-clear=", body)


JUMP = {"host": "jump.example.org", "user": "agentm", "portFrom": 20001, "portTo": 20010,
        "reverseKey": "~/.ssh/agent-m-jump", "forwardKey": "~/.ssh/id_ed25519"}
BRIDGE_SECRET = "bridgeSECRETtoken0123456789"


def remote_entries(jump=JUMP) -> dict:
    return js("const j = " + json.dumps(jump) + "; const s = bridgeTunnel.addRemoteSession(j, [], { name: 'lab-pc', bridgePort: 8765, token: '"
              + BRIDGE_SECRET + "' }); return { [store.JUMP_HOST_KEY]: JSON.stringify(j), [store.REMOTE_SESSIONS_KEY]: JSON.stringify(s) };")


class JumpHostAndRemoteSessions(unittest.TestCase):
    """SPEC §7 THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS (UC-042, UC-011 1c): tested, cleared, the bridge token hidden until
    shown; §6 THE DASHBOARD WRITES THE TUNNEL COMMANDS — on the page, with copy buttons."""

    def rows(self, html):
        return dict(re.findall(r'<div class="setting" data-setting-row="([^"]+)">(.*?)</div><!--/setting-->', html, re.S))

    def test_the_jump_host_is_shown_with_test_change_clear(self):
        body = self.rows(page(remote_entries()))["jump-host"]
        for must in ('data-setting-key="agent-m.jump-host"', "agentm@jump.example.org", "20001", "20010", "~/.ssh/agent-m-jump",
                     "~/.ssh/id_ed25519", 'data-test="agent-m.jump-host"', 'data-change="agent-m.jump-host"', 'data-clear="agent-m.jump-host"'):
            self.assertIn(must, body)

    def test_each_session_has_its_commands_test_and_clear(self):
        body = self.rows(page(remote_entries()))["remote-sessions"]
        for must in ("lab-pc", 'data-test-session="lab-pc"', 'data-clear-session="lab-pc"', "http://localhost:20001",
                     "-R 127.0.0.1:20001:127.0.0.1:8765 agentm@jump.example.org", "-L 127.0.0.1:20001:127.0.0.1:20001 agentm@jump.example.org",
                     'data-add-session'):
            self.assertIn(must, body)
        self.assertEqual(len(re.findall(r'data-copy="ssh -N', body)), 2, "a copy button for each command")

    def test_the_bridge_token_is_hidden_until_shown(self):
        html = page(remote_entries())
        holding = [t for t in re.findall(r"<input\b[^>]*>", html) if BRIDGE_SECRET in t]
        self.assertEqual(len(holding), 1)
        self.assertRegex(holding[0], r'type="password"')
        self.assertNotIn(BRIDGE_SECRET, re.sub(r"<input\b[^>]*>", "", html), "not in a command, a copy button or a label")
        self.assertIn('data-show="agent-m.remote-sessions lab-pc"', html)

    def test_counter_proof_after_show_the_bridge_token_appears_in_full(self):
        html = page(remote_entries(), shown=["agent-m.remote-sessions lab-pc"])
        tag = [t for t in re.findall(r"<input\b[^>]*>", html) if BRIDGE_SECRET in t][0]
        self.assertRegex(tag, r'type="text"')

    def test_without_a_jump_host_no_command_is_written(self):
        entries = remote_entries()
        del entries["agent-m.jump-host"]
        body = self.rows(page(entries))["remote-sessions"]
        self.assertNotIn("ssh -N", body)
        self.assertIn("jump host", body.lower())


if __name__ == "__main__":
    unittest.main()
