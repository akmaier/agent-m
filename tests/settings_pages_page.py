# Module: MOD-settings-pages
# Level: component
"""The live Settings page, for the Python Checks of MOD-settings-pages: it renders the route `settings` (or another route of the module)
in the DOM of tests/settings-pages-harness.mjs over a browser store the caller fills, and runs the caller's JavaScript against it.
It is code only; it holds no expected result.

    live(body, setup={key: value}, now="2026-09-30")

`body` is the text of an async function body that returns JSON. It finds, besides the Python names of tests/jsrun.py:
  render(name = "settings", extra = {})  the route's page in a fresh element (extra is added to the route's context);
  lines(root)                            every section of the page that opens with a heading: { node, title, buttons: [text] };
  pressed(button)                        a person's click; resolves when the page has taken it;
  byClass, elements, click, turn         the helpers of the harness;
  went                                   the [route, params] pairs the page asked to go to;
  bs, store                              MOD-browser-store and the store the page reads.
`setup` is written with writeSetting before the page is drawn; `now` (YYYY-MM-DD) is the day Date.now() gives.
"""
import json

from jsrun import ROOT, js

HARNESS = (ROOT / "tests" / "settings-pages-harness.mjs").as_uri()
SETTINGS_PAGES = (ROOT / "src" / "settings-pages" / "index.mjs").as_uri()
BROWSER_STORE = (ROOT / "src" / "browser-store" / "index.mjs").as_uri()

PRELUDE = """
const { installDocument, byClass, elements, click, turn } = await import(%(harness)s);
installDocument();
const mem = new Map();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null } });
globalThis.confirm = () => true;
const fixedNow = %(now)s;
if (fixedNow !== null) Date.now = () => fixedNow;
const pages = await import(%(pages)s);
const bs = await import(%(browser_store)s);
const store = bs.openStore("akmaier/agent-m");
for (const [key, value] of Object.entries(%(setup)s)) bs.writeSetting(store, key, value);
const host = { async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "public" }; },
  async readSnapshot() { return { commit: "1".repeat(40), paths: [], blob: () => null, async read() { return null; } }; } };
const went = [];
async function render(name = "settings", extra = {}) {
  const route = pages.view.routes.find((r) => r.name === name);
  const target = document.createElement("div");
  await route.render(target, { instance: { repository: "akmaier/agent-m", host }, product: null, store, go: (n, p) => went.push([n, p]), ...extra }, {});
  return target;
}
const heading = (e) => e.childNodes.find((c) => c.nodeType === 1 && /^h[34]$/.test(c.localName));
const lines = (root) => elements(root, (e) => e.localName === "section" && heading(e))
  .map((node) => ({ node, title: heading(node).textContent, buttons: elements(node, (e) => e.localName === "button").map((b) => b.textContent) }));
const pressed = async (button) => { await click(button); for (let i = 0; i < 5; i += 1) await turn(); };
"""


def live(body: str, setup: dict | None = None, now: str | None = None):
    fixed = "null" if now is None else str(int(__import__("datetime").datetime.fromisoformat(now + "T12:00:00+00:00").timestamp() * 1000))
    prelude = PRELUDE % {"harness": json.dumps(HARNESS), "pages": json.dumps(SETTINGS_PAGES), "browser_store": json.dumps(BROWSER_STORE),
                         "setup": json.dumps(setup or {}), "now": fixed}
    return js(prelude + body)
