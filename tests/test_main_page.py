# Guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; THE MENU FOLLOWS THE PROCESS; THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M'S OWN PROGRESS; THE BUILD IS SHOWN AS IT HAPPENS
# Level: unit
"""SPEC §10 — the main page at the root of the instance's site (UC-046).

The page's derivations and its HTML are pure functions of src/home/progress.mjs and src/home/cards.mjs, and its menu is
src/site/menu.mjs; they are asked through node (tests/jsrun.py). The fixture product is tests/fixtures/main-page/: a SPEC
of three requirements — one guarded by a test file that is there, one by a test file that is not, one at review —, one
decided SPEC change entry, four use cases of which three are accepted, an implementation plan of two steps, and one job
working on the first step. Its tree is computed here as git computes it: every file with its blob SHA. Node reads the files
itself, by path, from the fixture folder. Counter-proofs: docs/measurements/2026-10-05_main-page.md."""
import hashlib
import json
import re
import unittest
from pathlib import Path

from jsrun import js

TESTS = Path(__file__).resolve().parent
ROOT = TESTS.parent
FIX = TESTS / "fixtures" / "main-page"
PROCESS = ["Requirements", "Use cases", "Architecture", "Implementation", "Tests", "Releases", "Maintenance", "Settings"]
JOB = "docs/jobs/JOB-20261005-0900-a1b2.md"
NOW = "2026-10-05T10:30:00Z"


def blob(data: bytes) -> str:
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


TREE = [{"path": p.relative_to(FIX).as_posix(), "sha": blob(p.read_bytes())} for p in sorted(FIX.rglob("*")) if p.is_file()]
UC4 = next(e for e in TREE if e["path"].startswith("docs/use-cases/UC-004-"))
UC4_RECORD = f"docs/approvals/UC-004-{UC4['sha'][:12]}.md"
JOB_ENDED = (FIX / JOB).read_text(encoding="utf-8").replace("start: 2026-10-05T09:00:00Z\n",
                                                             "start: 2026-10-05T09:00:00Z\nend: 2026-10-05T10:00:00Z\nstate: done\n")


def pr(number, item, state="open", merged_at=None):
    """A pull request in the shape of the git host's pullRequests, naming `item` in its head branch."""
    return {"number": number, "title": f"{item}: the work", "head": f"job/{item}", "base": "main", "state": state,
            "openedAt": "2026-10-05T09:05:00.000Z", "mergedAt": merged_at, "mergeCommit": None, "participantLine": None, "ci": None}


def facts(*, extra_paths=(), texts=None, prs=(), ci="passed", tags=()) -> str:
    """A node expression that binds `f` to the fixture product's facts. extra_paths: paths added to the tree (a record
    planted for the counter-proof); texts: { path: text } read instead of the fixture's file."""
    tree = TREE + [{"path": p, "sha": "0" * 40} for p in extra_paths]
    return ("const fs = await import('node:fs');"
            f"const FIX = {json.dumps(str(FIX))}; const tree = {json.dumps(tree)}; const over = {json.dumps(texts or {})};"
            "const text = async (p) => p in over ? over[p] : tree.some((e) => e.path === p) ? fs.readFileSync(FIX + '/' + p, 'utf8') : null;"
            f"const f = await progress.productFacts({{ tree, text, pullRequests: async () => {json.dumps(list(prs))},"
            f" ci: async () => {json.dumps(ci)}, tags: async () => {json.dumps(list(tags))} }});")


def stages(**kw) -> dict:
    return {s["key"]: s for s in js(facts(**kw) + "return progress.stages(f);")}


def card(**kw) -> str:
    """The product's card as the main page shows it."""
    return js(facts(**kw) + f"return cards.cardHtml({{ kind: 'product', title: 'fixture/product', "
                            f"address: 'https://github.com/fixture/product', facts: f, now: new Date({json.dumps(NOW)}) }});")


def text_of(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def labels(html: str) -> list:
    """The labels of a menu's entries, in the order they stand."""
    return [text_of(m[1]) for m in re.findall(r"<(a|span)\b[^>]*\bdata-stage=\"[^\"]+\"[^>]*>(.*?)</\1>", html, re.S)]


class TheMenuFollowsTheProcess(unittest.TestCase):
    def assert_follows_process(self, entries):
        self.assertEqual([e.replace("⚙", "").strip() for e in entries], PROCESS)

    def test_the_menu_lists_the_stages_in_the_order_of_the_process(self):
        self.assert_follows_process(js("return menu.MENU.map((e) => e.label);"))

    def test_the_rendered_menu_stands_in_the_same_order(self):
        html = js("return menu.menuHtml({ built: new Set(['spec', 'uc', 'arc', 'backlog', 'settings']) });")
        self.assert_follows_process(labels(html))

    def test_counter_proof_a_menu_with_two_stages_swapped_fails(self):
        swapped = js("const m = menu.MENU.map((e) => e.label); [m[1], m[2]] = [m[2], m[1]]; return m;")
        with self.assertRaises(AssertionError):
            self.assert_follows_process(swapped)

    def test_a_stage_whose_page_is_built_links_to_it_and_one_not_built_is_named_without_a_link(self):
        html = js("return menu.menuHtml({ built: new Set(['uc']), href: (v) => 'docs/#' + v });")
        self.assertRegex(html, r'<a [^>]*href="docs/#uc"[^>]*data-stage="use-cases"')
        self.assertRegex(html, r'<span [^>]*data-stage="tests"[^>]*>Tests</span>')
        self.assertNotRegex(html, r'data-stage="tests"[^>]*href=|href="[^"]*#tests"')

    def test_the_main_page_and_the_review_pages_carry_the_menu(self):
        for page in ("index.html", "docs/index.html"):
            self.assertRegex((ROOT / page).read_text(encoding="utf-8"), r'<nav [^>]*id="tabs"', page)


class TheMainPageShowsWhatGoesOnInTheInstance(unittest.TestCase):
    def test_the_root_of_the_site_is_the_main_page(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertRegex(html, r'<script type="module" src="src/home/home\.mjs"></script>')
        for part in ('id="cards"', 'id="waits"'):
            self.assertIn(part, html)

    def test_what_waits_for_a_person_is_listed_with_the_page_where_it_is_decided(self):
        waits = js(facts() + "return progress.waiting(f);")
        self.assertEqual(waits, [{"kind": "use-case", "id": "UC-004", "view": "uc"}])


class EachProductsProgressByStage(unittest.TestCase):
    def test_three_of_four_use_cases_accepted_show_the_use_case_stage_at_75_percent(self):
        self.assertEqual(stages()["use-cases"]["share"], 0.75)
        self.assertRegex(text_of(card()), r"Use cases 75 % 3 of 4 accepted")

    def test_counter_proof_with_all_four_accepted_the_stage_is_at_100_percent(self):
        self.assertEqual(stages(extra_paths=[UC4_RECORD])["use-cases"]["share"], 1)
        self.assertRegex(text_of(card(extra_paths=[UC4_RECORD])), r"Use cases 100 % 4 of 4 accepted")

    def test_the_six_stages_stand_in_their_order(self):
        self.assertEqual([s["label"] for s in js(facts() + "return progress.stages(f);")],
                         ["Requirements", "Use cases", "Architecture", "Implementation", "Tests", "Release"])

    def test_each_stage_is_filled_by_the_share_of_its_work_that_is_accepted_or_done(self):
        got = {k: s["share"] for k, s in stages().items()}
        # Requirements: the one change entry is decided and the SPEC holds requirements. Architecture: no file yet.
        # Implementation: neither step's pull request is merged. Tests: one of three requirements names a test file that is
        # there, and CI passed. Release: no tag.
        self.assertEqual(got, {"requirements": 1, "use-cases": 0.75, "architecture": 0, "implementation": 0,
                               "tests": 1 / 3, "release": 0})

    def test_counter_proof_a_red_ci_guards_no_requirement(self):
        self.assertEqual(stages(ci="failed")["tests"]["share"], 0)

    def test_the_stage_the_product_is_in_is_marked(self):
        self.assertRegex(card(), r'<li class="stage is-current"[^>]*data-stage="use-cases"')


class WithoutAProductTheMainPageShowsAgentMsOwnProgress(unittest.TestCase):
    def test_without_a_product_the_bar_shows_agent_m(self):
        self.assertEqual(js("return progress.cardsFor({ products: [], instance: 'reader/agent-m' });"),
                         [{"kind": "agent-m", "repo": "reader/agent-m", "address": "https://github.com/reader/agent-m"}])

    def test_counter_proof_with_one_product_the_bar_shows_the_product(self):
        self.assertEqual(js("return progress.cardsFor({ products: ['https://github.com/alice/thesis-tool'], "
                            "instance: 'reader/agent-m' });"),
                         [{"kind": "product", "repo": "alice/thesis-tool", "address": "https://github.com/alice/thesis-tool"}])

    def test_agent_ms_bar_is_full_once_its_first_release_is_tagged(self):
        got = js(facts(tags=["v2026.1.0"]) + "return progress.stages(f, { agentM: true }).map((s) => s.share);")
        self.assertEqual(got, [1, 1, 1, 1, 1, 1])
        self.assertEqual(js(facts(tags=["v2026.1.0"]) + "return progress.overall(progress.stages(f, { agentM: true }));"), 1)

    def test_counter_proof_before_its_first_release_the_bar_shows_the_shares(self):
        got = js(facts() + "return progress.stages(f, { agentM: true }).map((s) => s.share);")
        self.assertEqual(got, [1, 0.75, 0, 0, 1 / 3, 0])


class TheBuildIsShownAsItHappens(unittest.TestCase):
    def test_a_running_job_is_shown_beside_its_step(self):
        rows = js(facts(prs=[pr(7, "ITM-201")]) + "return f.implementation.rows;")
        self.assertEqual([(r["id"], r["state"], r["job"] and r["job"]["id"]) for r in rows],
                         [("ITM-201", "in progress", "JOB-20261005-0900-a1b2")])
        shown = text_of(card(prs=[pr(7, "ITM-201")]))
        self.assertRegex(shown, r"ITM-201 Implement the reader in progress JOB-20261005-0900-a1b2 · coder-a · running for 1 h 30 min")

    def test_counter_proof_once_the_job_has_ended_the_step_shows_done(self):
        merged = [pr(7, "ITM-201", state="merged", merged_at="2026-10-05T10:05:00.000Z")]
        rows = js(facts(prs=merged, texts={JOB: JOB_ENDED}) + "return f.implementation.rows;")
        self.assertEqual([(r["id"], r["state"], r["job"]) for r in rows], [("ITM-201", "done", None)])
        self.assertRegex(text_of(card(prs=merged, texts={JOB: JOB_ENDED})), r"ITM-201 Implement the reader done")
        self.assertEqual(js(facts(prs=merged, texts={JOB: JOB_ENDED}) + "return progress.stages(f)[3].share;"), 0.5)


if __name__ == "__main__":
    unittest.main()
