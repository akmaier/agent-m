# Module: MOD-work-items
# Guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; UC-032
# Level: unit
"""SPEC §13 THE BACKLOG LIVES IN THE PRODUCT REPOSITORY — a product's backlog is kept as Markdown under docs/backlog/ of
the product's own repository: one file docs/backlog/ITM-<nnn>-<slug>.md per item, the order docs/backlog/order.md and,
in a model with sprints, the sprint records under docs/backlog/sprints/ (UC-032, postcondition). No state is stored in
them.

docs/assets/work-items.mjs (MOD-work-items) reads them: parseItem(path, text) an item into its parts, with a problem for
a file that is not where and what an item must be; backlogOrder(text, items) the order and the items it does not name
yet, appended at the bottom. The fixtures are the backlog of a small product under tests/fixtures/backlog/docs/backlog/;
Agent M's own backlog is read as it stands — it is the backlog of the instance's own product, not its SPEC, which no test
reads (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE). The module is asked through node (tests/jsrun.py).
Counter-proofs: docs/measurements/2026-10-01_backlog-items.md.
"""
import json
import re
import unittest
from pathlib import Path

from artifact_checks import DOCS
from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "backlog"
BACKLOG = FIX / "docs" / "backlog"
LIVES = "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY"
ID = "EVERY ARTIFACT HAS AN IDENTIFIER"
ITEM_FILE = re.compile(r"^ITM-\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def files(backlog: Path) -> dict:
    """{ docs/backlog/<name>: text } of every item file of a backlog folder."""
    return {f"docs/backlog/{p.name}": read(p) for p in sorted(backlog.glob("ITM-*.md"))}


def items_js(backlog: Path) -> str:
    """JavaScript that reads every item file of a backlog folder with node's own fs into `items` — a whole backlog is
    too long for one argument of the command line on Linux (`OSError: Argument list too long` in CI)."""
    return (f"const fs = await import('node:fs'); const dir = {json.dumps(str(backlog))};"
            "const items = fs.readdirSync(dir).filter((n) => /^ITM-.*\\.md$/.test(n)).sort()"
            ".map((n) => workItems.parseItem('docs/backlog/' + n, fs.readFileSync(dir + '/' + n, 'utf8')));")


def parse(path: str, text: str) -> dict:
    return js(f"return workItems.parseItem({json.dumps(path)}, {json.dumps(text)});")


def order(text: str, items: dict) -> dict:
    return js(f"const items = Object.entries({json.dumps(items)}).map(([p, t]) => workItems.parseItem(p, t));"
              f"return workItems.backlogOrder({json.dumps(text)}, items);")


def edited(text: str, old: str, new: str) -> str:
    assert text.count(old) == 1, old
    return text.replace(old, new)


ITEM = "docs/backlog/ITM-014-export-thesis-as-pdf.md"
TEXT = read(BACKLOG / "ITM-014-export-thesis-as-pdf.md")


class TestAnItemIsRead(unittest.TestCase):
    def test_an_item_is_read_into_its_parts(self):
        item = parse(ITEM, TEXT)
        self.assertEqual((item["path"], item["id"], item["title"], item["kind"], item["level"]),
                         (ITEM, "ITM-014", "Export the thesis as PDF", "implementation", 1))
        self.assertEqual(item["realises"], ["EXPORT IS A PDF", "UC-003"])
        self.assertEqual((item["modules"], item["dependsOn"]), (["MOD-export"], ["ITM-016"]))
        self.assertEqual(item["origins"], ["https://github.com/alice/thesis-tool/issues/57"])
        self.assertEqual(item["issues"], ["https://github.com/alice/thesis-tool/issues/57"])
        self.assertEqual(item["outcome"], "The thesis is exported as one PDF file, figures included.")
        self.assertEqual(item["acceptance"], "- A thesis with two figures is exported as a PDF that shows both.")
        self.assertEqual((item["lines"]["id"], item["lines"]["realises"], item["lines"]["origin"]), (2, 6, 13))
        self.assertEqual(item["problems"], [])

    def test_lists_may_be_empty_and_an_origin_may_name_several_issues(self):
        item = parse("docs/backlog/ITM-015-title-page.md", read(BACKLOG / "ITM-015-title-page.md"))
        self.assertEqual((item["modules"], item["dependsOn"], item["level"]), ([], [], 2))
        self.assertEqual(item["origins"], ["https://github.com/alice/thesis-tool/issues/58",
                                           "https://gitlab.example.org/group/sub/thesis/-/issues/4"])
        self.assertEqual(item["issues"], item["origins"])
        self.assertEqual(item["problems"], [])

    def test_an_origin_that_is_no_issue_is_kept_as_it_is_written(self):
        item = parse("docs/backlog/ITM-016-read-the-chapters.md", read(BACKLOG / "ITM-016-read-the-chapters.md"))
        self.assertEqual((item["origins"], item["issues"]), (["backlog refinement 2026-09-30"], []))
        self.assertEqual((item["kind"], item["realises"]), ("refactoring", ["UC-001"]))

    def test_a_section_the_item_lacks_is_read_as_empty(self):
        item = parse("docs/backlog/ITM-017-measure-the-export-time.md", read(BACKLOG / "ITM-017-measure-the-export-time.md"))
        self.assertEqual((item["kind"], item["acceptance"]), ("measurement", ""))
        self.assertEqual(item["outcome"], "The time to export a thesis of 300 pages, measured and recorded.")


class TestWhereAnItemLives(unittest.TestCase):
    def test_every_item_of_the_fixture_backlog_is_where_an_item_must_be(self):
        for path, text in files(BACKLOG).items():
            self.assertEqual(parse(path, text)["problems"], [], path)

    def test_counter_proof_an_item_elsewhere_or_named_otherwise_is_a_problem(self):
        for path in ("docs/items/ITM-014-export-thesis-as-pdf.md", "backlog/ITM-014-export-thesis-as-pdf.md",
                     "docs/backlog/sprints/ITM-014-export-thesis-as-pdf.md", "docs/backlog/ITM-014-export-thesis-as-pdf.txt",
                     "docs/backlog/ITM-14-export-thesis-as-pdf.md", "docs/backlog/ITM-014.md",
                     "docs/backlog/ITM-014-Export-Thesis.md"):
            found = parse(path, TEXT)["problems"]
            self.assertEqual([(f["rule"], f["line"], f["kind"]) for f in found], [(LIVES, 1, "error")], path)
            self.assertEqual(found[0]["artifact"], path)
            self.assertGreater(len(found[0]["fix"]), 10, path)

    def test_counter_proof_an_identifier_other_than_the_file_name_is_a_problem(self):
        found = parse(ITEM, edited(TEXT, "id: ITM-014\n", "id: ITM-041\n"))["problems"]
        self.assertEqual([(f["rule"], f["line"]) for f in found], [(ID, 2)])

    def test_counter_proof_a_file_without_front_matter_is_no_item(self):
        found = parse(ITEM, TEXT.split("---\n", 2)[2])["problems"]
        self.assertEqual([(f["rule"], f["line"], f["what"]) for f in found], [(LIVES, 1, "the item has no front matter")])


class TestTheOrder(unittest.TestCase):
    ORDER = read(BACKLOG / "order.md")

    def test_the_order_names_items_and_the_rest_is_appended_at_the_bottom(self):
        got = order(self.ORDER, files(BACKLOG))
        self.assertEqual(got["order"], ["ITM-016", "ITM-014", "ITM-015", "ITM-017"])
        self.assertEqual(got["unplaced"], ["ITM-015", "ITM-017"])
        self.assertEqual(got["problems"], [])

    def test_the_order_follows_the_lines_not_their_numbers(self):
        text = edited(edited(self.ORDER, "1. ITM-016", "2. ITM-016"), "2. ITM-014", "1. ITM-014")
        self.assertEqual(order(text, files(BACKLOG))["order"][:2], ["ITM-016", "ITM-014"])

    def test_an_order_naming_every_item_leaves_nothing_unplaced(self):
        text = edited(self.ORDER, "2. ITM-014\n", "2. ITM-014\n3. ITM-017\n4. ITM-015\n")
        got = order(text, files(BACKLOG))
        self.assertEqual((got["order"], got["unplaced"]), (["ITM-016", "ITM-014", "ITM-017", "ITM-015"], []))

    def test_without_an_order_file_every_item_is_unplaced_in_the_order_of_its_identifier(self):
        got = order("", files(BACKLOG))
        self.assertEqual(got["order"], ["ITM-014", "ITM-015", "ITM-016", "ITM-017"])
        self.assertEqual(got["unplaced"], got["order"])

    def test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem(self):
        text = edited(self.ORDER, "2. ITM-014\n", "2. ITM-014\n3. ITM-099\n4. ITM-016\n")
        got = order(text, files(BACKLOG))
        self.assertEqual(got["order"], ["ITM-016", "ITM-014", "ITM-015", "ITM-017"])
        self.assertEqual([(f["line"], f["rule"], f["what"]) for f in got["problems"]],
                         [(11, LIVES, "the order names ITM-099, which is no item of the backlog"),
                          (12, LIVES, "the order names ITM-016 a second time")])
        self.assertTrue(all(f["artifact"] == "docs/backlog/order.md" and f["kind"] == "error" for f in got["problems"]))

    def test_prose_and_other_lists_of_the_order_file_are_not_read_as_items(self):
        text = self.ORDER + "\nSee ITM-017 for the measurement.\n\n- **ITM-015** waits for a decision.\n"
        self.assertEqual(order(text, files(BACKLOG))["unplaced"], ["ITM-015", "ITM-017"])


class TestAgentMsOwnBacklog(unittest.TestCase):
    """The backlog of this repository: Agent M is the instance's own product (`docs/process.md`)."""

    OWN = DOCS / "backlog"

    def test_the_backlog_is_markdown_under_docs_backlog(self):
        names = sorted(p.relative_to(self.OWN).as_posix() for p in self.OWN.rglob("*") if p.is_file())
        items = [n for n in names if ITEM_FILE.match(n)]
        sprints = [n for n in names if re.match(r"^sprints/[a-z0-9-]+\.md$", n)]
        self.assertTrue(items)
        self.assertTrue(sprints, "a model with sprints keeps its sprint records under docs/backlog/sprints/")
        self.assertEqual(sorted(set(names) - set(items) - set(sprints)), ["order.md"])

    def test_every_item_of_this_repository_is_read_without_a_problem(self):
        own = files(self.OWN)
        count, found = js(items_js(self.OWN) + "return [items.length, items"
                          ".filter((i) => i.problems.length || !i.id || !i.title || !i.realises.length || !i.origins.length)"
                          ".map((i) => [i.path, i.problems])];")
        self.assertEqual(found, [])
        self.assertEqual(count, len(own), "node read every item file Python sees")
        self.assertGreater(len(own), 100)

    def test_the_order_of_this_repository_places_every_item_once(self):
        own = files(self.OWN)
        got = js(items_js(self.OWN) + f"return workItems.backlogOrder({json.dumps(read(self.OWN / 'order.md'))}, items);")
        self.assertEqual((got["unplaced"], got["problems"]), ([], []))
        self.assertEqual(sorted(got["order"]), sorted(re.match(r"ITM-\d{3}", Path(p).name).group(0) for p in own))


if __name__ == "__main__":
    unittest.main()
