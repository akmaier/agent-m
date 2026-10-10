# Module: MOD-dashboard-app
# Guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
# Level: component
"""SPEC §13 PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — for the item states of the Backlog tab (ITM-147); the job states
are checked here by ITM-085.

Everything the process dashboard shows is computed from the repositories and the runtimes. In the app harness
(tests/app-harness.mjs), the real dashboard shows the Backlog tab of a fixture product with one team, its running sprint,
three items and a fake of GitHub's pulls API; then all local storage and the cached file texts are deleted and the page is
loaded again: it shows the same page and the same item states. Counter-proof: a state planted into local storage changes
nothing shown.

The page runs in node, asked from here; node reads every file itself (never through the command line, whose length Linux
limits). Counter-proofs: docs/measurements/2026-10-01_backlog-tab.md.
"""
import json
import subprocess
import unittest
from pathlib import Path

TESTS = Path(__file__).resolve().parent

SCRIPT = r"""
const { readFileSync } = await import("node:fs");
const { repoServer, fakeCaches, openDashboard, REPO } = await import(__HARNESS__);
const MODEL = readFileSync(__MODEL__, "utf8");
const item = (id, realises) => `---\nid: ${id}\ntitle: The work of ${id}\nlevel: module\nrealises:\n` +
  realises.map((r) => `  - ${r}\n`).join("") + `modules:\n  - MOD-fixture\nbuilds_on: []\ntests:\n  - unit\norigin:\n  - refinement\n` +
  `---\n# ${id} The work of ${id}\n\n## Outcome\n\nDone.\n\n## Acceptance\n\n- a unit test.\n`;
const files = {
  "SPEC.md": "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nA rule.\n*Check:* no automatic check; at review.\n",
  "docs/process.md": `---\nmodel: fixture-scrum-wip\nmodel_file: docs/process-models/fixture.md\nmodel_version: ${"a".repeat(40)}\n---\n# How\n`,
  "docs/role-assignments/team1.md": "# team1\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | owner |\n| Builders | developer-x |\n",
  "docs/process-models/fixture.md": MODEL,
  "docs/backlog/sprints/team1/01.md": "---\nsprint: 1\ngoal: Derive the states\nstart: 2026-10-01\nend:\ncloser: owner\n" +
    "branch: sprint/team1/01\nselection:\n  - ITM-001\n  - ITM-002\n  - ITM-003\n---\n# team1 Sprint 01\n",
  "docs/backlog/ITM-001-one.md": item("ITM-001", ["RULE ONE"]),
  "docs/backlog/ITM-002-two.md": item("ITM-002", ["RULE ONE"]),
  "docs/backlog/ITM-003-three.md": item("ITM-003", ["RULE NOT ACCEPTED"]),
};
const pr = (number, ref, merged = null) => ({ number, title: `${ref}: work`, head: { ref: `team/${ref}`, sha: "b".repeat(40) },
  base: { ref: "sprint/team1/01" }, state: merged ? "closed" : "open", created_at: "2026-10-01T10:00:00Z", merged_at: merged,
  merge_commit_sha: merged ? "f".repeat(40) : null, body: "developer-x · started from sprint/team1/01" });
const PRS = [pr(1, "ITM-001"), pr(2, "ITM-002", "2026-10-01T11:00:00Z")];
const pulls = async (url, init) => url.pathname === `/repos/${REPO}/pulls` && init.method === "GET"
  ? new Response(JSON.stringify(PRS.filter((p) => !url.searchParams.get("base") || p.base.ref === url.searchParams.get("base"))),
    { status: 200, headers: { "Content-Type": "application/json" } }) : null;
const server = () => repoServer({ files, handlers: [pulls] });
// The item states as the team's panel shows them: each row of its sprint's items carries data-item and the state's badge.
const states = (html) => {
  const at = html.indexOf('data-team="team1"'), end = html.indexOf('data-part="backlog"');
  const panel = at < 0 ? "" : html.slice(at, end < 0 ? undefined : end);
  return Object.fromEntries([...panel.matchAll(/<tr data-item="(ITM-\d{3})">[^]*?<span class="badge [^"]*">([^<]+)<\/span>/g)]
    .map((m) => [m[1], m[2]]));
};
const planted = __PLANTED__;
async function withPlanted(entries, f) {
  const define = Object.defineProperty;
  Object.defineProperty = function (o, k, d) {
    if (o === globalThis && k === "localStorage" && d && d.value) for (const [a, b] of Object.entries(entries)) d.value.setItem(a, b);
    return define.call(Object, o, k, d);
  };
  try { return await f(); } finally { Object.defineProperty = define; }
}
const caches = fakeCaches();
const first = await openDashboard({ server: await server(), hash: "#backlog", caches });
const kept = await openDashboard({ server: await server(), hash: "#backlog", caches });
const cleared = await openDashboard({ server: await server(), hash: "#backlog", caches: fakeCaches(), token: null });
const withState = await withPlanted(planted, async () => openDashboard({ server: await server(), hash: "#backlog", caches }));
const out = { first: first.main(), kept: kept.main(), cleared: cleared.main(), planted: withState.main(), states: states(first.main()),
  plantedStates: states(withState.main()) };
process.stdout.write(JSON.stringify(out));
"""

PLANTED = {k: json.dumps({"ITM-001": "done", "ITM-002": "blocked", "ITM-003": "ready"})
           for k in ["agent-m.item-states", "agent-m.backlog", "agent-m.board", "agent-m.sprint", "agent-m.progress"]}


def run_page() -> dict:
    code = (SCRIPT.replace("__HARNESS__", json.dumps((TESTS / "app-harness.mjs").as_uri()))
            .replace("__MODEL__", json.dumps(str(TESTS / "fixtures" / "flow" / "scrum-wip.md")))
            .replace("__PLANTED__", json.dumps(PLANTED)))
    r = subprocess.run(["node", "--input-type=module", "-e", code], capture_output=True, text=True, cwd=TESTS)
    if r.returncode != 0:
        raise AssertionError(r.stderr.strip()[-1500:])
    return json.loads(r.stdout)


class ItemStatesAreDerived(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page = run_page()

    def test_the_page_shows_the_derived_states(self):
        self.assertEqual(self.page["states"], {"ITM-001": "in progress", "ITM-002": "done", "ITM-003": "waiting for acceptance"})

    def test_deleting_local_storage_and_the_cached_texts_shows_the_same_page(self):
        self.assertIn('data-team="team1"', self.page["first"])
        self.assertEqual(self.page["kept"], self.page["first"], "a load from the kept texts")
        self.assertEqual(self.page["cleared"], self.page["first"], "a load after deleting local storage and the kept texts")

    def test_counter_proof_a_state_planted_into_local_storage_changes_nothing_shown(self):
        self.assertEqual(len(self.page["plantedStates"]), 3, "the page is shown with the state planted")
        self.assertEqual(self.page["planted"], self.page["first"])
        self.assertEqual(self.page["plantedStates"], self.page["states"])


if __name__ == "__main__":
    unittest.main()
