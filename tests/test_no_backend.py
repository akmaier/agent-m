# Guards: NO SERVER
# Level: unit
"""SPEC §0 NO SERVER — the built site contains no call to an origin other than the configured endpoints, the
repository servers of the instance and its products, the mail provider's API and sign-in, the local bridge, the jump
host's HTTPS address, and the package registries and resource hosts the page names before it calls them.

The built site is what Pages serves from the root of the repository (THE PAGES ROOT IS THE REPOSITORY ROOT) and a browser
runs. There is no build step, so it is the tracked files of the site: the main page index.html at the root, src/ with its
modules, style sheets and the lab's logo, and docs/ with the review pages, their modules, the vendored libraries, and the
Markdown files the review pages render — besides docs/, the root's README.md and PLAN.md; the SPEC is read by no test
on its own (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE). Three checks:

1. Every address written into the site's own code names a permitted host. Configured endpoints, the GitLab servers of
   products and the jump host come from the settings or from a product's address and are never written into the code,
   so the hosts that may stand there literally are GitHub's (the repository server of the instance and of GitHub
   products; github.com itself is navigation to GitHub's own pages), Microsoft Graph and its sign-in (the mail
   provider), the loopback names of the local bridge, and the two pages the site only links to — the lab's and the
   book's —, which no channel of check 2 may call. A package registry or resource host enters this list together with
   the notice that names it before it is called.
2. A request leaves the page only through a known channel, in the own code and in the vendored libraries alike: the git
   host's request helper, whose origin gate admits only the instance's own origin, GitHub's API and raw hosts and the
   product's own GitLab project (`prepare` in git-host.mjs, tested in tests/review-core.d/git-host.test.mjs); the
   bridge probe on localhost; the dashboard's own view files and style sheets. Every other fetch, XMLHttpRequest,
   WebSocket, EventSource, beacon, worker, dynamic import, created loading element, CSS import or url() is a finding,
   unless it is listed below with the reason it calls no other origin — each listed one exactly as often as listed.
3. No Markdown file the site serves loads anything from an address of a host outside the list of check 1 — the
   dashboard renders these files, and an image or frame in them would be fetched from its host. Code spans and fenced
   blocks are rendered as text and are not read.

The check of the own code's addresses moved here from tests/test_pages_layout.py (ITM-050). Only tracked files are
read, so a scratch file in a working tree changes nothing. Counter-proofs:
docs/measurements/2026-10-01_product-rules-repository-checks.md."""
import re
import subprocess
import unittest
from pathlib import Path

from test_artifact_format import outside_code

ROOT = Path(__file__).resolve().parents[1]
VENDOR = "docs/assets/vendor/"
CODE = (".html", ".css", ".mjs", ".js")

PERMITTED_HOSTS = {
    # The repository server of the instance and of GitHub products: its API, its raw files, its own pages.
    "api.github.com", "raw.githubusercontent.com", "github.com",
    # The mail provider: Microsoft Graph and its sign-in (Microsoft 365).
    "graph.microsoft.com", "login.microsoftonline.com",
    # The local bridge, on this machine or at the near end of a tunnel's forward.
    "localhost", "127.0.0.1", "[::1]",
    # Navigation only, never called: the Pattern Recognition Lab and the book, linked from the main page's footer.
    "lme.tf.fau.de", "link.springer.com",
}

ADDRESS = re.compile(r"\b(?:https?|wss?)://(\[[0-9a-f:]+\]|[a-z0-9.-]+)", re.I)

CHANNELS = [
    ("fetch", re.compile(r"(?<![\w$.])fetch\s*\((?!\)\s*\{)")),  # a call, not a method named fetch being defined
    ("XMLHttpRequest", re.compile(r"\bXMLHttpRequest\b")),
    ("WebSocket", re.compile(r"\bWebSocket\b")),
    ("EventSource", re.compile(r"\bEventSource\b")),
    ("sendBeacon", re.compile(r"\bsendBeacon\b")),
    ("importScripts", re.compile(r"\bimportScripts\b")),
    ("Worker", re.compile(r"\bnew\s+(?:Shared)?Worker\b")),
    ("import()", re.compile(r"(?<![\w$.])import\(")),
    ("loading element", re.compile(
        r"createElement(?:NS)?\(\s*(?:[^,()]*,\s*)?[\"'](?:script|link|iframe|frame|img|image|object|embed|audio|video|source)[\"']")),
    ("loading tag", re.compile(
        r"<(?:script|link|iframe|frame|img|image|object|embed|audio|video|source|track)\b[^>]*?\b(?:src|href|data|srcset|poster)"
        r"\s*=\s*[\"']?\s*(?:[a-z][a-z0-9+.-]*:)?//", re.I)),
    ("@import", re.compile(r"@import\b", re.I)),
    ("url()", re.compile(r"url\(\s*[\"']?\s*(?:[a-z][a-z0-9+.-]*:)?//", re.I)),
]


def _prepared(text: str, at: int) -> bool:
    """git-host.mjs: the fetch sends the URL that prepare() returned in the lines just above it."""
    before = text[:at].split("\n")[-3:]
    return text[at:].startswith(("fetch(u,", "fetch(u)")) and any(re.search(r"const \[u,[^\]]*\] = prepare\(", l) for l in before)


def _own_origin(text: str, at: int) -> bool:
    """dashboard-app.mjs: a view file or its style sheet, resolved against the module's own address."""
    window = text[at:at + 400]
    return "new URL(`dashboard/" in window and "import.meta.url" in window


# (file, channel) -> (how often, why it calls no other origin, evidence(text, offset) -> bool or None)
PERMITTED_CHANNELS = {
    ("docs/assets/git-host.mjs", "fetch"): (2, "the request helper and fetchText send only what the origin gate prepare() let through", _prepared),
    ("docs/assets/bridge-tunnel.mjs", "fetch"): (1, "the probe of a remote session's forward, on localhost",
                                                  lambda t, i: t[i:].startswith("fetch(`http://localhost:")),
    ("docs/assets/dashboard-app.mjs", "import()"): (1, "a view file of the dashboard, from its own origin", _own_origin),
    ("docs/assets/dashboard-app.mjs", "loading element"): (1, "a view's style sheet, from its own origin", _own_origin),
    ("docs/assets/vendor/mermaid.min.js", "Worker"): (1, "elkjs builds a worker only from a workerUrl option, which the dashboard never sets", None),
    ("docs/assets/vendor/mermaid.min.js", "loading element"): (1, "KaTeX's \\includegraphics, rendered only when trusted; mermaid renders KaTeX untrusted", None),
    ("docs/assets/vendor/mermaid.min.js", "@import"): (1, "the name of the at-rule in mermaid's CSS parser, not a style sheet", None),
}


SITE = ("index.html", "src", "docs", "README.md", "PLAN.md")


def tracked(*paths: str) -> list[str]:
    out = subprocess.run(["git", "-C", str(ROOT), "ls-files", "-z", "--", *(paths or SITE)], capture_output=True, text=True,
                         check=True).stdout
    return [f for f in out.split("\0") if f and (ROOT / f).is_file()]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8", errors="replace")


def foreign_hosts(text: str) -> set[str]:
    return {h.lower() for h in ADDRESS.findall(text)} - PERMITTED_HOSTS


def channel_findings(files: dict[str, str], permitted=PERMITTED_CHANNELS) -> list[str]:
    """Every request channel of the given site files that is not a permitted one, and every permitted one whose count or
    evidence does not hold. files: { path: text }."""
    found, seen = [], {}
    for path, text in sorted(files.items()):
        for name, rx in CHANNELS:
            for m in rx.finditer(text):
                key = (path, name)
                seen[key] = seen.get(key, 0) + 1
                line = text.count("\n", 0, m.start()) + 1
                if key not in permitted:
                    found.append(f"{path}:{line}: {name}: {text[m.start():m.start() + 60].splitlines()[0]}")
                    continue
                evidence = permitted[key][2]
                if evidence and not evidence(text, m.start()):
                    found.append(f"{path}:{line}: {name}: not {permitted[key][1]}")
    for key, (count, why, _) in permitted.items():
        if key[0] in files and seen.get(key, 0) != count:
            found.append(f"{key[0]}: {key[1]} found {seen.get(key, 0)} times, permitted {count} ({why})")
    return found


def markdown_loads(text: str) -> list[str]:
    """Addresses a rendered Markdown text would load from: images, and tags that load (script, frame, embed …). Code spans
    and fenced blocks are shown as text and load nothing."""
    text = outside_code(text)[0]
    image = re.findall(r"!\[[^\]]*\]\(\s*<?((?:[a-z][a-z0-9+.-]*:)?//[^)\s>]+)", text, re.I)
    tags = re.findall(r"<(?:script|link|iframe|frame|img|image|object|embed|audio|video|source|track)\b[^>]*?\b"
                      r"(?:src|href|data|srcset|poster)\s*=\s*[\"']?\s*((?:[a-z][a-z0-9+.-]*:)?//[^\"'\s>]+)", text, re.I)
    return image + tags


def host_of(address: str) -> str:
    m = re.match(r"^(?:[a-z][a-z0-9+.-]*:)?//(\[[0-9a-f:]+\]|[^/:?#]+)", address, re.I)
    return m.group(1).lower() if m else ""


class NoServer(unittest.TestCase):
    def setUp(self):
        self.files = {f: read(f) for f in tracked() if f.endswith(CODE)}

    def test_the_site_has_code_to_check(self):
        # A scan that finds no file proves nothing: the page, the dashboard's modules and the vendored libraries are there.
        for f in ("index.html", "src/home/home.mjs", "docs/index.html", "docs/assets/dashboard-app.mjs", "docs/assets/git-host.mjs",
                  "docs/assets/vendor/mermaid.min.js"):
            self.assertIn(f, self.files)

    def test_every_address_in_the_own_code_names_a_permitted_host(self):
        found = {f: sorted(foreign_hosts(t)) for f, t in self.files.items() if not f.startswith(VENDOR) and foreign_hosts(t)}
        self.assertEqual(found, {})

    def test_requests_leave_only_through_the_known_channels(self):
        self.assertEqual(channel_findings(self.files), [])

    def test_the_dashboard_sets_no_worker_address_for_mermaid(self):
        # The evidence for the one Worker in mermaid: elkjs constructs it only from a workerUrl option.
        own = [f for f, t in self.files.items() if not f.startswith(VENDOR) and "workerUrl" in t]
        self.assertEqual(own, [])

    def test_mermaid_renders_katex_untrusted(self):
        # The evidence for KaTeX's image element: \includegraphics is rendered only when the trust setting allows it.
        calls = re.findall(r"renderToString\([^,]+,\{([^}]*)\}", self.files["docs/assets/vendor/mermaid.min.js"])
        self.assertTrue(calls, "no renderToString call found — the evidence would be vacuous")
        self.assertEqual([c for c in calls if "trust" in c], [])

    def test_no_served_markdown_loads_from_another_host(self):
        found = {}
        for f in tracked():
            if f.endswith(".md"):
                bad = [a for a in markdown_loads(read(f)) if host_of(a) not in PERMITTED_HOSTS]
                if bad:
                    found[f] = bad
        self.assertEqual(found, {})

    # ---------------------------------------------------------------- counter-proofs, on planted texts

    def test_counter_proof_a_foreign_address_is_found(self):
        self.assertEqual(foreign_hosts('fetchText("https://api.github.com/repos")'), set())
        self.assertEqual(foreign_hosts("http://127.0.0.1:8765/ and http://[::1]:8765/ and https://graph.microsoft.com/v1.0/me"), set())
        self.assertEqual(foreign_hosts('<script src="https://cdn.jsdelivr.net/npm/x"></script>'), {"cdn.jsdelivr.net"})
        self.assertEqual(foreign_hosts("const BASE = 'wss://telemetry.example.org/s';"), {"telemetry.example.org"})

    def test_counter_proof_an_unknown_channel_is_found(self):
        planted = {
            "docs/assets/new-view.mjs": "await fetch(url);\nnavigator.sendBeacon(u, d);\nnew WebSocket(u);\nconst x = new XMLHttpRequest();\n"
                                        "await import(`https://esm.sh/x`);\nnew Worker(u);\nconst s = document.createElement('script');\n"
                                        "el.innerHTML = `<img src=\"//pixel.example/p.gif\">`;\n",
            "docs/assets/style.css": "@import url('https://fonts.example/f.css');\nbody { background: url(//img.example/b.png); }\n",
            "docs/index.html": '<link rel="stylesheet" href="https://cdn.example/x.css">\n',
        }
        kinds = sorted({f.split(": ")[1] for f in channel_findings(planted)})
        self.assertEqual(kinds, ["@import", "WebSocket", "Worker", "XMLHttpRequest", "fetch", "import()", "loading element",
                                 "loading tag", "sendBeacon", "url()"])

    def test_counter_proof_a_permitted_channel_without_its_evidence_is_found(self):
        unprepared = {"docs/assets/git-host.mjs": "export async function request(url) {\n  return fetch(url);\n}\n"
                                                  "async function f(u) { const [u, i] = prepare(x); return fetch(u, i); }\n"}
        self.assertEqual(channel_findings(unprepared),
                         ["docs/assets/git-host.mjs:2: fetch: not the request helper and fetchText send only what the origin gate "
                          "prepare() let through"])
        elsewhere = {"docs/assets/bridge-tunnel.mjs": "await fetch(`https://jump.example/${port}/`);\n"}
        self.assertEqual(len(channel_findings(elsewhere)), 1)
        twice = {"docs/assets/vendor/mermaid.min.js": "new Worker(a);new Worker(b);var k='@import';"
                                                      "document.createElement(\"img\");"}
        self.assertEqual(channel_findings(twice),
                         ["docs/assets/vendor/mermaid.min.js: Worker found 2 times, permitted 1 (elkjs builds a worker only from "
                          "a workerUrl option, which the dashboard never sets)"])

    def test_counter_proof_a_method_named_fetch_or_a_comment_is_no_call(self):
        self.assertEqual(channel_findings({"docs/assets/x.mjs": "class P { fetch(){ return this.t } }\nthis.parser.fetch().text;\n"
                                                                "// the settings by name, export and import (UC-042)\nfetchText(u);\n"}), [])

    def test_counter_proof_a_markdown_file_that_loads_from_another_host(self):
        text = ("![flow](https://tracker.example/p.png)\n<img src='//cdn.example/x.svg'>\n<iframe src=\"https://embed.example/\"></iframe>\n"
                "![badge](https://github.com/o/r/actions/workflows/t.yml/badge.svg)\n![local](diagram.png)\n[a link](https://example.org/)\n"
                "Shown as text: `![](https://code.example/p.png)`\n```html\n<script src=\"https://fence.example/x.js\"></script>\n```\n")
        self.assertEqual([host_of(a) for a in markdown_loads(text)],
                         ["tracker.example", "github.com", "cdn.example", "embed.example"])


if __name__ == "__main__":
    unittest.main()
