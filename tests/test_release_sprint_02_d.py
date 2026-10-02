# Guards: NO SERVER; ARTIFACTS ARE MARKDOWN; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
# Level: release
# Release test of sprint 02, strand D (ITM-145), written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md,
# who implemented none of the strand's items; started on sprint/02 at a22de0a, 2026-10-02. A repository check runs under no
# module (ARC-020 decision 5), and so does its release test.
"""ITM-050: the three repository checks of the hard product rules refuse a planted violation each and pass the repository.

The checks are run as CI runs them — `python3 -m unittest <check>` in the tests folder — on a copy of this repository: every
tracked file, as it stands in the working tree, in a temporary git repository of its own (the checks read what git tracks).
First the copy as it is, which every check must pass; then, one at a time, a violation of the rule planted into the copy and
added to its index, which the check must refuse, naming the planted file; then the plant is taken out again. Where the rule
permits something, a plant of that kind must pass. The violations are written from the rules' texts:

- NO SERVER — "the built site contains no call to an origin other than the configured endpoints, the repository servers of the
  instance and its products, the mail provider's API and sign-in, the local bridge, the jump host's HTTPS address, and the
  package registries and resource hosts the page names before it calls them": a beacon to an analytics host, a script from a
  CDN in the page, an image from a tracker in a Markdown file the dashboard renders. Permitted: a view that names GitHub's API,
  Microsoft Graph and the local bridge and reads through the git host's reader.
- ARTIFACTS ARE MARKDOWN — "every artifact Agent M produces is Markdown, with diagrams written as Mermaid inside it": a diagram
  kept as an SVG file, a PlantUML diagram in a use case, an approval record as JSON, and Agent M's own writer putting an image
  diagram into the SPEC skeleton of a new product. Permitted: a Mermaid diagram.
- THE PRODUCT REPOSITORY IS SELF-SUFFICIENT — "no artifact references a file or service that exists only inside Agent M": the
  SPEC skeleton Agent M writes into a new product naming a tool of Agent M, or linking the dashboard's address. Permitted: the
  skeleton naming the product's own queue folder (as it does).

The plants into Agent M's writer change the copy only; the code of this repository is not touched. Agent M's own SPEC.md is not
copied — a placeholder stands in its place, since no test opens it (ITM-128) and the checks need the file, not its text. Not the
item's own tests, not its measurement record: expectations from the rules only. About 8 seconds.
"""
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKS = {"NO SERVER": "test_no_backend", "ARTIFACTS ARE MARKDOWN": "test_artifact_format",
          "THE PRODUCT REPOSITORY IS SELF-SUFFICIENT": "test_self_sufficient"}
SKELETON = "No requirement yet. Requirements enter through the approval queues in"
# Runs one check module in the copy's tests folder, as `python3 -m unittest <module>` would, leaving out its counter-proof tests.
RUNNER = """import sys, unittest
module = __import__(sys.argv[1])
def flat(s):
    for t in s:
        yield from (flat(t) if isinstance(t, unittest.TestSuite) else [t])
suite = unittest.TestSuite(t for t in flat(unittest.defaultTestLoader.loadTestsFromModule(module)) if "counter_proof" not in t.id())
print(f"Ran {suite.countTestCases()} tests of {sys.argv[1]}")
sys.exit(0 if unittest.TextTestRunner(verbosity=2).run(suite).wasSuccessful() else 1)
"""


def git(cwd, *args):
    return subprocess.run(["git", "-C", str(cwd), *args], capture_output=True, text=True, check=True).stdout


class ProductRuleChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp(prefix="itm145-")
        cls.copy = Path(cls.tmp) / "agent-m"
        tracked = [f for f in git(ROOT, "ls-files", "-z").split("\0") if f and (ROOT / f).is_file()]
        for f in tracked:
            (cls.copy / f).parent.mkdir(parents=True, exist_ok=True)
            if f == "SPEC.md":
                # No test opens Agent M's own SPEC.md (ITM-128); the checks need a SPEC.md in its place, not its text.
                (cls.copy / f).write_text("# Agent M — Specification\n\n**VERBINDLICH (SPEC)**\n\nThe copy of a release test.\n",
                                          encoding="utf-8")
                continue
            shutil.copy2(ROOT / f, cls.copy / f)
        git(cls.copy, "init", "-q")
        git(cls.copy, "add", "-A")

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def run_check(self, rule):
        """The check of `rule` over the copy: its module's tests, without its own counter-proofs on planted texts — those do not
        read the repository, and a red one would make the run red whatever the copy holds."""
        env = {k: v for k, v in os.environ.items() if not k.startswith("PYTHON")}
        r = subprocess.run([sys.executable, "-c", RUNNER, CHECKS[rule]], cwd=self.copy / "tests", capture_output=True,
                           text=True, env=env, timeout=300)
        return r.returncode, r.stdout + r.stderr

    def planted(self, files):
        """A context in which `files` ({ path: text }) stand in the copy and its index; afterwards the copy is as before."""
        test = self

        class Plant:
            def __enter__(self):
                self.before = {p: (test.copy / p).read_bytes() if (test.copy / p).exists() else None for p in files}
                for p, text in files.items():
                    (test.copy / p).parent.mkdir(parents=True, exist_ok=True)
                    (test.copy / p).write_text(text, encoding="utf-8")
                    git(test.copy, "add", "--", p)

            def __exit__(self, *exc):
                for p, old in self.before.items():
                    if old is None:
                        git(test.copy, "rm", "-q", "--cached", "-f", "--", p)
                        (test.copy / p).unlink()
                    else:
                        (test.copy / p).write_bytes(old)
                        git(test.copy, "add", "--", p)
        return Plant()

    def assert_refused(self, rule, files, names):
        with self.planted(files):
            code, out = self.run_check(rule)
        self.assertNotEqual(code, 0, f"{rule}: the planted violation passed the check\n{out[-1500:]}")
        self.assertIn(names, out, f"{rule}: the refusal names {names}")

    def assert_passes(self, rule, files):
        with self.planted(files):
            code, out = self.run_check(rule)
        self.assertEqual(code, 0, f"{rule}: a permitted plant was refused\n{out[-1500:]}")

    def writer(self, extra):
        """review-core.mjs of the copy, its SPEC skeleton for a new product (Add product) ending in `extra`."""
        text = (self.copy / "docs/assets/review-core.mjs").read_text(encoding="utf-8")
        self.assertEqual(text.count(SKELETON), 1, "the SPEC skeleton Agent M writes into a new product")
        return {"docs/assets/review-core.mjs": text.replace(SKELETON, SKELETON.replace("No requirement yet.", f"No requirement yet. {extra}"))}

    # ------------------------------------------------------------------------------------------------ the repository

    # ITM-050 · NO SERVER, ARTIFACTS ARE MARKDOWN, THE PRODUCT REPOSITORY IS SELF-SUFFICIENT: the repository as it is passes each
    # check. Expected: exit 0 for all three, on the copy before any plant.
    def test_the_repository_passes_the_three_checks(self):
        for rule in CHECKS:
            code, out = self.run_check(rule)
            self.assertEqual(code, 0, f"{rule}\n{out[-1500:]}")
            self.assertRegex(out, r"Ran [1-9]\d* tests?", f"{rule}: the check ran")

    # ------------------------------------------------------------------------------------------------ NO SERVER

    # Expected: each plant refused, the planted file named — a beacon to an analytics host from a view, a script from a CDN in
    # the page, a tracker image in a Markdown file the dashboard renders.
    def test_no_server_refuses_a_call_to_another_origin(self):
        self.assert_refused("NO SERVER", {"docs/assets/dashboard/stats.mjs":
                            '// Module: MOD-dashboard-app\nexport function count(data) {\n'
                            '  navigator.sendBeacon("https://stats.example.net/hit", JSON.stringify(data));\n}\n'},
                            "docs/assets/dashboard/stats.mjs")
        page = (self.copy / "docs/index.html").read_text(encoding="utf-8")
        self.assertIn("</head>", page)
        self.assert_refused("NO SERVER", {"docs/index.html": page.replace("</head>", '<script src="https://cdn.example.org/lib.js"></script>\n</head>', 1)},
                            "docs/index.html")
        self.assert_refused("NO SERVER", {"docs/measurements/2026-10-02_planted.md":
                            "# Planted\n\n**MESSUNG**\n\n![traffic](https://tracker.example.org/p.png)\n"},
                            "docs/measurements/2026-10-02_planted.md")

    # Expected: a view that names the repository server, the mail provider and the local bridge, and reads through the git host's
    # reader, passes.
    def test_no_server_passes_the_permitted_origins(self):
        self.assert_passes("NO SERVER", {"docs/assets/dashboard/planted-view.mjs":
                           '// Module: MOD-dashboard-app\nimport { fetchText } from "../git-host.mjs";\n'
                           'export const API = "https://api.github.com/repos/";\n'
                           'export const MAIL = "https://graph.microsoft.com/v1.0/me/messages";\n'
                           'export const BRIDGE = "http://127.0.0.1:8765/jobs";\n'
                           'export const read = (repo, token) => fetchText(`${API}${repo}`, {}, token);\n'})

    # ------------------------------------------------------------------------------------------------ ARTIFACTS ARE MARKDOWN

    # Expected: each plant refused, the planted file named — a diagram kept as an SVG file among the architecture, a use case whose
    # diagram is PlantUML, an approval record as JSON, and Agent M's own writer putting an image diagram into the SPEC skeleton of
    # a new product (named by the file the writer writes, SPEC.md).
    def test_artifacts_are_markdown_refuses_another_format(self):
        self.assert_refused("ARTIFACTS ARE MARKDOWN", {"docs/architecture/components.svg":
                            '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>\n'},
                            "docs/architecture/components.svg")
        uc = (self.copy / "docs/use-cases/UC-001-add-a-managed-product.md").read_text(encoding="utf-8")
        self.assert_refused("ARTIFACTS ARE MARKDOWN", {"docs/use-cases/UC-001-add-a-managed-product.md":
                            uc + "\n```plantuml\nAuthor -> Dashboard: Add product\n```\n"},
                            "docs/use-cases/UC-001-add-a-managed-product.md")
        self.assert_refused("ARTIFACTS ARE MARKDOWN", {"docs/approvals/UC-001-0123456789ab.json":
                            '{"file": "docs/use-cases/UC-001-x.md", "blob": "0123456789ab"}\n'},
                            "docs/approvals/UC-001-0123456789ab.json")
        self.assert_refused("ARTIFACTS ARE MARKDOWN", self.writer("![the flow](flow.png)"), "flow.png")

    # Expected: a Mermaid diagram in a measurement passes.
    def test_artifacts_are_markdown_passes_a_mermaid_diagram(self):
        self.assert_passes("ARTIFACTS ARE MARKDOWN", {"docs/measurements/2026-10-02_planted.md":
                           "# Planted\n\n**MESSUNG**\n\n```mermaid\nflowchart LR\n  a --> b\n```\n"})

    # ------------------------------------------------------------------------------------------------ SELF-SUFFICIENT

    # Expected: each plant refused, naming what the written SPEC.md references — a tool of Agent M's repository
    # (tools/apply_approvals.py), the dashboard's address on Agent M's Pages site.
    def test_self_sufficient_refuses_a_reference_into_agent_m(self):
        self.assert_refused("THE PRODUCT REPOSITORY IS SELF-SUFFICIENT", self.writer("Without a token, tools/apply_approvals.py writes them."),
                            "tools/apply_approvals.py")
        self.assert_refused("THE PRODUCT REPOSITORY IS SELF-SUFFICIENT", self.writer("Review them on https://akmaier.github.io/agent-m/#spec."),
                            "https://akmaier.github.io/agent-m/#spec")

    # Expected: the skeleton naming another folder of the product itself passes.
    def test_self_sufficient_passes_a_reference_into_the_product(self):
        self.assert_passes("THE PRODUCT REPOSITORY IS SELF-SUFFICIENT", self.writer("Use cases go into docs/use-cases/."))


if __name__ == "__main__":
    unittest.main()
