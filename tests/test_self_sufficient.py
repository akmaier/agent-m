# Guards: THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
# Level: unit
"""SPEC §0 THE PRODUCT REPOSITORY IS SELF-SUFFICIENT — no artifact references a file or service that exists only inside
Agent M.

The fixture product is made by Agent M's own writers, through node (tests/jsrun.py), as the dashboard makes it: the layout
that *Add product* commits (missingLayout); the files of one acceptance commit for a use case and for a SPEC entry
(planAcceptance — the approval records, the decision row, the replaced SPEC section); the product settings and the
collaborators the settings page commits. Besides them the product holds only what a person put there — the use case and
the queue entry that were accepted.

A reference is a Markdown link target (resolved against the file's folder), a path in a code span or in the prose (read
from the repository's root, as these texts write them), or an address. It reaches a file that exists only inside Agent M
when the path is a file or folder of this repository and of nothing in the product; it reaches a service that exists only
inside Agent M when the address is the local bridge (a loopback name) or Agent M's own repository or Pages site. A path that exists in neither, such as a placeholder, reaches nothing.

Only tracked files of this repository count as "inside Agent M", so a scratch file changes nothing. Counter-proofs:
docs/measurements/2026-10-01_product-rules-repository-checks.md."""
import posixpath
import re
import subprocess
import unittest
from pathlib import Path

from jsrun import js

ROOT = Path(__file__).resolve().parents[1]
PRODUCT = "fixture-owner/fixture-product"

# Agent M's own repository, whose Pages site is the upstream dashboard (UPSTREAM of the dashboard's shell).
AGENT_M = "akmaier/agent-m"

# Agent M's writers, run on a fixture product. -> { written: [{ path, content }], inputs: [{ path, content }] }
FIXTURE_PRODUCT = r"""
const P = %(product)s;
const repo = new Map();
const layout = core.missingLayout([], P);
for (const f of layout) repo.set(f.path, f.content);
const uc = "---\nid: UC-001\ntitle: Fixture\n---\n# UC-001 Fixture\n";
const q = "docs/spec-freigaben/2026-10-01_fixture";
const anchor = repo.get("SPEC.md").split("\n").find((l) => l.startsWith("No requirement yet."));
const index = "# Fixture queue\n\n**Zieldatei aller Einträge:** `SPEC.md`\n\n| Nr | Datei | Anker | bis | Commits |\n|---|---|---|---|---|\n"
  + `| 01 | \`01-fixture.md\` | ${anchor} | — | — |\n`;
const prop = "**A FIXTURE RULE** *(PO, 2026-10-01)*\nThe fixture holds.\n";
const inputs = [["docs/use-cases/UC-001-fixture.md", uc], [`${q}/index.md`, index], [`${q}/01-fixture.md`, prop]];
for (const [p, t] of inputs) repo.set(p, t);
const items = [
  { kind: "use-case", id: "UC-001", path: "docs/use-cases/UC-001-fixture.md", blob: await core.gitBlobSha(uc) },
  { kind: "spec", queue: q, qname: "2026-10-01_fixture", nr: 1, nn: "01", proposalPath: `${q}/01-fixture.md`,
    proposalBlob: await core.gitBlobSha(prop), targetPath: "SPEC.md", anchor, bis: null, needs: [],
    sectionBlob: await core.gitBlobSha(core.sectionText(core.extractSection(repo.get("SPEC.md"), anchor, null))) },
];
const plan = await core.planAcceptance({ items, read: async (p) => (repo.has(p) ? repo.get(p) : null),
  now: new Date("2026-10-01T12:00:00Z") });
if (plan.leftOut.length) throw new Error("the fixture acceptance left out " + JSON.stringify(plan.leftOut));
const written = [...layout, ...plan.files,
  { path: pseudonymiser.PRODUCT_SETTINGS_PATH, content: pseudonymiser.setProductSetting("", "pseudonymisation", "off", P) },
  { path: pseudonymiser.COLLABORATORS_PATH, content: pseudonymiser.formatCollaborators(
    [{ name: "Fixture Person", account: "fixture-account", agreed: "2026-10-01" }], P) }];
return { written, inputs: inputs.map(([path, content]) => ({ path, content })) };
"""

_fixture = None


def fixture_product() -> dict:
    """The fixture product, made once per run: { written, inputs }."""
    global _fixture
    if _fixture is None:
        _fixture = js(FIXTURE_PRODUCT % {"product": '"' + PRODUCT + '"'})
    return _fixture


def agent_m_files() -> list[str]:
    out = subprocess.run(["git", "-C", str(ROOT), "ls-files", "-z"], capture_output=True, text=True, check=True).stdout
    return [f for f in out.split("\0") if f]


def exists_in(path: str, files) -> bool:
    p = path.strip("/")
    return bool(p) and any(f == p or f.startswith(p + "/") for f in files)


ADDRESS = re.compile(r"\b(?:https?|wss?)://[^\s)<>\"'`\]|]+", re.I)
LINK = re.compile(r"\]\(\s*<?([^)\s>]+)")
CODE_SPAN = re.compile(r"`([^`\n]+)`")
EXTENSION = r"\.(?:md|mjs|js|py|json|ya?ml|html|css|txt|toml|sh)"
BARE_PATH = re.compile(rf"(?<![\w/.<>-])(?:[\w.-]+/)+[\w.-]*(?![\w/<>-])|(?<![\w/.<>-])[\w-]+(?:\.[\w-]+)*{EXTENSION}\b")
LOOPBACK = {"localhost", "127.0.0.1", "[::1]", "0.0.0.0"}


def references(path: str, text: str) -> tuple[list[str], list[str]]:
    """-> (paths from the repository's root, addresses) that the text refers to."""
    addresses = [a.rstrip(".,;:!") for a in ADDRESS.findall(text)]
    rest = ADDRESS.sub(" ", text)
    paths = []
    for target in LINK.findall(rest):
        target = target.split("#")[0].split("?")[0]
        if target and not re.match(r"^[a-z][a-z0-9+.-]*:", target, re.I):
            paths.append(posixpath.normpath(posixpath.join(posixpath.dirname(path), target)) if not target.startswith("/")
                         else target.lstrip("/"))
    rest = LINK.sub(" ", rest)
    for span in CODE_SPAN.findall(rest):
        paths += [m.group(0) for m in BARE_PATH.finditer(span)]
    rest = CODE_SPAN.sub(" ", rest)
    paths += [m.group(0) for m in BARE_PATH.finditer(rest)]
    paths = [p.rstrip(".,;:!") for p in paths]
    return [p for p in paths if p and "<" not in p and ">" not in p], addresses


def agent_m_service(address: str, upstream: str) -> bool:
    m = re.match(r"^[a-z]+://(\[[0-9a-f:]+\]|[^/:?#]+)(?::\d+)?(/[^?#]*)?", address, re.I)
    if not m:
        return False
    host, where = m.group(1).lower(), (m.group(2) or "/").lower()
    owner, name = upstream.lower().split("/")
    return (host in LOOPBACK
            or (host in ("github.com", "raw.githubusercontent.com") and (where + "/").startswith(f"/{owner}/{name}/"))
            or (host == "api.github.com" and (where + "/").startswith(f"/repos/{owner}/{name}/"))
            or (host == f"{owner}.github.io" and (where + "/").startswith(f"/{name}/")))


def self_sufficiency_findings(written: list[dict], product_paths: list[str], agent_m: list[str], upstream: str) -> list[str]:
    """Every reference of a written artifact to a file or service that exists only inside Agent M."""
    found = []
    for f in written:
        paths, addresses = references(f["path"], f["content"])
        for p in paths:
            if exists_in(p, agent_m) and not exists_in(p, product_paths):
                found.append(f"{f['path']}: {p} exists only inside Agent M")
        for a in addresses:
            if agent_m_service(a, upstream):
                found.append(f"{f['path']}: {a} is a service of Agent M")
    return found


class ProductRepositoryIsSelfSufficient(unittest.TestCase):
    def setUp(self):
        self.fx = fixture_product()
        self.product = [f["path"] for f in self.fx["written"] + self.fx["inputs"]]

    def test_the_fixture_product_is_made_by_agent_ms_writers(self):
        # Not vacuous: the layout, both approval records, the decision row, the written SPEC and the two settings files.
        paths = sorted({f["path"] for f in self.fx["written"]})
        for p in ("SPEC.md", "CHANGELOG.md", "docs/use-cases/README.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md",
                  "docs/spec-freigaben/2026-10-01_fixture/entscheidungen.md", "docs/settings.md", "docs/collaborators.md"):
            self.assertIn(p, paths)
        self.assertEqual(len([p for p in paths if p.startswith("docs/approvals/") and not p.endswith("README.md")]), 2)
        # The SPEC is written twice — the skeleton of Add product, then the section the acceptance replaced.
        self.assertIn("A FIXTURE RULE", [f["content"] for f in self.fx["written"] if f["path"] == "SPEC.md"][-1])

    def test_the_reader_finds_the_references_the_fixture_makes(self):
        # A known positive for the reader: the SPEC skeleton names the queue folder, the records name the files they accept.
        found = {p for f in self.fx["written"] for p in references(f["path"], f["content"])[0]}
        self.assertIn("docs/spec-freigaben/", found)
        self.assertIn("docs/use-cases/UC-001-fixture.md", found)
        self.assertIn("docs/spec-freigaben/2026-10-01_fixture", found)

    def test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m(self):
        self.assertEqual(self_sufficiency_findings(self.fx["written"], self.product, agent_m_files(), AGENT_M), [])

    # ---------------------------------------------------------------- counter-proofs, on planted texts

    def test_counter_proof_a_file_of_agent_m_is_found(self):
        agent_m = agent_m_files()
        planted = [{"path": "docs/approvals/README.md", "content": (
            "Written by `docs/assets/review-core.mjs`; without a token tools/apply_approvals.py writes the section.\n"
            "See [the rules](../../SPEC.md) and [the plan](../../PLAN.md#x) and the queues in `docs/spec-freigaben/`.\n")}]
        self.assertEqual(self_sufficiency_findings(planted, self.product, agent_m, AGENT_M),
                         ["docs/approvals/README.md: PLAN.md exists only inside Agent M",
                          "docs/approvals/README.md: docs/assets/review-core.mjs exists only inside Agent M",
                          "docs/approvals/README.md: tools/apply_approvals.py exists only inside Agent M"])

    def test_counter_proof_a_service_of_agent_m_is_found(self):
        planted = [{"path": "docs/settings.md", "content": (
            "Changed on https://akmaier.github.io/agent-m/#settings or through http://localhost:8765/jobs.\n"
            "Source: https://github.com/akmaier/agent-m/blob/main/SPEC.md and https://api.github.com/repos/akmaier/agent-m/contents.\n"
            "Not Agent M: https://github.com/akmaier/agent-mx, https://other.github.io/agent-m/, https://api.github.com/user.\n")}]
        self.assertEqual(self_sufficiency_findings(planted, self.product, [], "akmaier/agent-m"),
                         ["docs/settings.md: https://akmaier.github.io/agent-m/#settings is a service of Agent M",
                          "docs/settings.md: http://localhost:8765/jobs is a service of Agent M",
                          "docs/settings.md: https://github.com/akmaier/agent-m/blob/main/SPEC.md is a service of Agent M",
                          "docs/settings.md: https://api.github.com/repos/akmaier/agent-m/contents is a service of Agent M"])

    def test_counter_proof_what_the_product_holds_or_nobody_holds_is_no_finding(self):
        planted = [{"path": "SPEC.md", "content": "Queues in `docs/spec-freigaben/`, one file per use case `UC-<nnn>-<slug>.md`,\n"
                                                  "and docs/use-cases/UC-001-fixture.md; the CHANGELOG.md; a typo docs/nowhere/x.md.\n"}]
        self.assertEqual(self_sufficiency_findings(planted, self.product, agent_m_files(), AGENT_M), [])


if __name__ == "__main__":
    unittest.main()
