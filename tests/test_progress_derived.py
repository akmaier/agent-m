# Module: MOD-dashboard-app
# Guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
# Level: component
"""SPEC §13 PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — for the item states of the Backlog tab (ITM-147) and the progress
bar on the main page (ITM-162); the job states are checked here by ITM-085.

Everything the process dashboard shows is computed from the repositories and the runtimes. In the app harness
(tests/app-harness.mjs), the real dashboard shows the Backlog tab of a fixture product with a sprint, an order, three items
and a fake of GitHub's pulls API; then all local storage and the cached file texts are deleted and the page is loaded again:
it shows the same board and the same item states. Counter-proof: a state planted into local storage changes nothing shown.
The same for the bar beside the board: the main page of the same product, loaded again after deleting all local storage and the
cached file texts, shows the same bar with the same counts; counts planted into local storage change nothing shown.

The page runs in node, asked from here; node reads every file itself (never through the command line, whose length Linux
limits). Counter-proofs: docs/measurements/2026-10-01_backlog-tab.md.
"""
import functools
import json
import subprocess
import unittest
from pathlib import Path

TESTS = Path(__file__).resolve().parent

SCRIPT = r"""
const { readFileSync } = await import("node:fs");
const { repoServer, fakeCaches, openDashboard, REPO } = await import(__HARNESS__);
const MODEL = readFileSync(__MODEL__, "utf8");
const item = (id, realises) => `---\nid: ${id}\ntitle: The work of ${id}\nkind: implementation\nlevel: 1\nrealises:\n` +
  realises.map((r) => `  - ${r}\n`).join("") + `modules:\n  - MOD-fixture\ndepends_on: []\norigin: refinement\n---\n# ${id}\n`;
const files = {
  "SPEC.md": "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nA rule.\n*Check:* no automatic check; at review.\n",
  "docs/process.md": "---\nmodel: fixture-scrum-wip\nmodel_file: docs/process-models/fixture.md\n---\n# How\n",
  "docs/process-models/fixture.md": MODEL,
  "docs/backlog/order.md": "# Order\n\n1. ITM-001\n2. ITM-002\n3. ITM-003\n",
  "docs/backlog/sprints/sprint-01.md": "---\nid: sprint-01\ngoal: Derive the board\nstart: 2026-10-01\nend:\nselection:\n" +
    "  - ITM-001\n  - ITM-002\n  - ITM-003\ncloser: closer\nbranch: sprint/01\nmodel: fixture-scrum-wip\nplanned_by: owner\n---\n# Sprint\n",
  "docs/backlog/ITM-001-one.md": item("ITM-001", ["RULE ONE"]),
  "docs/backlog/ITM-002-two.md": item("ITM-002", ["RULE ONE"]),
  "docs/backlog/ITM-003-three.md": item("ITM-003", ["RULE NOT ACCEPTED"]),
};
const pr = (number, ref, merged = null) => ({ number, title: `${ref}: work`, head: { ref: `team/${ref}`, sha: "b".repeat(40) },
  base: { ref: "sprint/01" }, state: merged ? "closed" : "open", created_at: "2026-10-01T10:00:00Z", merged_at: merged,
  merge_commit_sha: merged ? "f".repeat(40) : null, body: "developer-x · started from sprint/01" });
const PRS = [pr(1, "ITM-001"), pr(2, "ITM-002", "2026-10-01T11:00:00Z")];
const pulls = async (url, init) => url.pathname === `/repos/${REPO}/pulls` && init.method === "GET"
  ? new Response(JSON.stringify(PRS.filter((p) => !url.searchParams.get("base") || p.base.ref === url.searchParams.get("base"))),
    { status: 200, headers: { "Content-Type": "application/json" } }) : null;
const server = () => repoServer({ files, handlers: [pulls] });
// The item states as the board shows them: each card carries data-item and sits in a column carrying data-column.
const states = (html) => Object.fromEntries([...html.matchAll(/data-column="([^"]+)"|data-item="(ITM-\d{3})"/g)]
  .reduce((acc, m) => { if (m[1]) acc.col = m[1]; else acc.out.push([m[2], acc.col]); return acc; }, { col: null, out: [] }).out);
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
// The bar on the main page (the address without a fragment), in its slot outside <main>, and the numbers it carries.
const bar = (page) => page.el("progress-bar");
const numbers = (html) => Object.fromEntries([...html.matchAll(/\sdata-(total|done|in-progress|blocked|not-started|percent-done)="(\d+)"/g)]
  .map((m) => [m[1], Number(m[2])]));
const barCaches = fakeCaches();
const barFirst = await openDashboard({ server: await server(), hash: "", caches: barCaches });
const barKept = await openDashboard({ server: await server(), hash: "", caches: barCaches });
const barCleared = await openDashboard({ server: await server(), hash: "", caches: fakeCaches(), token: null });
const barPlanted = await withPlanted(planted, async () => openDashboard({ server: await server(), hash: "", caches: barCaches }));
const out = { first: first.main(), kept: kept.main(), cleared: cleared.main(), planted: withState.main(), states: states(first.main()),
  plantedStates: states(withState.main()),
  bar: { first: bar(barFirst), kept: bar(barKept), cleared: bar(barCleared), planted: bar(barPlanted), numbers: numbers(bar(barFirst)),
    plantedNumbers: numbers(bar(barPlanted)) } };
process.stdout.write(JSON.stringify(out));
"""

PLANTED = {k: json.dumps({"ITM-001": "done", "ITM-002": "blocked", "ITM-003": "ready", "total": 99, "done": 99, "percent": 100})
           for k in ["agent-m.item-states", "agent-m.backlog", "agent-m.board", "agent-m.sprint", "agent-m.progress",
                     "agent-m.progress-bar"]}


@functools.lru_cache(maxsize=None)
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

    def test_the_board_shows_the_derived_states(self):
        self.assertEqual(self.page["states"], {"ITM-001": "in progress", "ITM-002": "done", "ITM-003": "waiting for acceptance"})

    def test_deleting_local_storage_and_the_cached_texts_shows_the_same_board(self):
        self.assertIn("data-board", self.page["first"])
        self.assertEqual(self.page["kept"], self.page["first"], "a load from the kept texts")
        self.assertEqual(self.page["cleared"], self.page["first"], "a load after deleting local storage and the kept texts")

    def test_counter_proof_a_state_planted_into_local_storage_changes_nothing_shown(self):
        self.assertEqual(len(self.page["plantedStates"]), 3, "the board is shown with the state planted")
        self.assertEqual(self.page["planted"], self.page["first"])
        self.assertEqual(self.page["plantedStates"], self.page["states"])


class TheBarIsDerived(unittest.TestCase):
    """The progress bar beside the board (ITM-162): the same product's main page."""

    @classmethod
    def setUpClass(cls):
        cls.bar = run_page()["bar"]

    def test_the_bar_shows_the_derived_counts(self):
        self.assertEqual(self.bar["numbers"], {"total": 3, "done": 1, "in-progress": 1, "blocked": 0, "not-started": 1,
                                               "percent-done": 33})

    def test_deleting_local_storage_and_the_cached_texts_shows_the_same_bar(self):
        self.assertIn("data-progress-bar", self.bar["first"])
        self.assertEqual(self.bar["kept"], self.bar["first"], "a load from the kept texts")
        self.assertEqual(self.bar["cleared"], self.bar["first"], "a load after deleting local storage and the kept texts")

    def test_counter_proof_counts_planted_into_local_storage_change_nothing_shown(self):
        self.assertIn("data-progress-bar", self.bar["planted"], "the bar is shown with the counts planted")
        self.assertEqual(self.bar["planted"], self.bar["first"])
        self.assertEqual(self.bar["plantedNumbers"], self.bar["numbers"])


if __name__ == "__main__":
    unittest.main()
