# Module: MOD-work-plans
# Guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; UC-032
# Level: unit
"""SPEC §13 THE BACKLOG LIVES IN THE PRODUCT REPOSITORY — a product's backlog is kept as Markdown under docs/backlog/ of
the product's own repository: one file docs/backlog/ITM-<nnn>-<slug>.md per item and, in a model with sprints, each
team's sprint records under docs/backlog/sprints/<team>/ (UC-032, postcondition). No state is stored in them, and no
order: the backlog keeps none of its own (UC-032).

An item is a document of MOD-documents' item schema (artifactSchemas().item), read with readDocument; documentFindings names
a file that is not where and what an item must be. MOD-work-plans' itemStates lists the items of a backlog, each after the
items it builds on. The fixtures are the backlog of a small product under tests/fixtures/backlog/docs/backlog/; Agent M's
own backlog is read as it stands — it is the backlog of the instance's own product, not its SPEC, which no test reads. The
modules are asked through node (tests/jsrun.py).
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
ITEM_FILE = re.compile(r"^ITM-\d{3,}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def files(backlog: Path) -> dict:
    """{ docs/backlog/<name>: text } of every item file of a backlog folder."""
    return {f"docs/backlog/{p.name}": read(p) for p in sorted(backlog.glob("ITM-*.md"))}


def items_js(backlog: Path) -> str:
    """JavaScript that reads every item file of a backlog folder with node's own fs into `items`, each a Document of the item
    schema — a whole backlog is too long for one argument of the command line on Linux."""
    return (f"const fs = await import('node:fs'); const dir = {json.dumps(str(backlog))};"
            "const schema = documents.artifactSchemas().item;"
            "const items = fs.readdirSync(dir).filter((n) => /^ITM-.*\\.md$/.test(n)).sort()"
            ".map((n) => documents.readDocument(schema, 'docs/backlog/' + n, fs.readFileSync(dir + '/' + n, 'utf8')));")


def read_item(path: str, text: str) -> dict:
    """{ document, findings }: the item read with the item schema, and the findings documentFindings gives on it."""
    return js("const schema = documents.artifactSchemas().item;"
              f"const document = documents.readDocument(schema, {json.dumps(path)}, {json.dumps(text)});"
              "return { document, findings: documents.documentFindings(schema, document) };")


def listed(items: dict) -> list:
    """The identifiers of the items, in the order itemStates lists the backlog."""
    return js("const schema = documents.artifactSchemas().item;"
              f"const items = Object.entries({json.dumps(items)}).map(([p, t]) => documents.readDocument(schema, p, t));"
              "return workPlans.itemStates(items, null, { statuses: new Map(), queues: [], jobs: [], pullRequests: [],"
              " gates: [], workflow: null }).map((s) => s.item);")


def edited(text: str, old: str, new: str) -> str:
    assert text.count(old) == 1, old
    return text.replace(old, new)


ITEM = "docs/backlog/ITM-014-export-thesis-as-pdf.md"
TEXT = read(BACKLOG / "ITM-014-export-thesis-as-pdf.md")


def before(order: list, items: dict) -> None:
    """Every item of `order` once, each after the items it builds on that the backlog holds — read here from the files."""
    ids = [re.search(r"^id: (ITM-\d{3,})$", t, re.M).group(1) for t in items.values()]
    assert sorted(order) == sorted(ids), (order, ids)
    for text in items.values():
        me = re.search(r"^id: (ITM-\d{3,})$", text, re.M).group(1)
        block = re.search(r"^builds_on:\n((?:  - .*\n)*)", text, re.M)
        for on in re.findall(r"ITM-\d{3,}", block.group(1) if block else ""):
            if on in ids and on != me:
                assert order.index(on) < order.index(me), f"{on} before {me} in {order}"


class TestAnItemIsRead(unittest.TestCase):
    def test_an_item_is_read_into_its_parts(self):
        got = read_item(ITEM, TEXT)
        item = got["document"]
        self.assertEqual((item["path"], item["id"], item["fields"]["title"], item["fields"]["level"]),
                         (ITEM, "ITM-014", "Export the thesis as PDF", "module"))
        self.assertEqual(item["fields"]["realises"], ["EXPORT IS A PDF", "UC-003"])
        self.assertEqual((item["fields"]["modules"], item["fields"]["builds_on"]), (["MOD-export"], ["ITM-016"]))
        self.assertEqual(item["fields"]["origin"], ["https://github.com/alice/thesis-tool/issues/57"])
        sections = {s["heading"]: s["text"].strip() for s in item["sections"]}
        self.assertEqual(sections["## Outcome"], "The thesis is exported as one PDF file, figures included.")
        self.assertEqual(sections["## Acceptance"], "- A thesis with two figures is exported as a PDF that shows both.")
        self.assertEqual(got["findings"], [])

    def test_an_origin_may_name_several_issues(self):
        item = read_item("docs/backlog/ITM-015-title-page.md", read(BACKLOG / "ITM-015-title-page.md"))["document"]
        self.assertEqual((item["fields"]["modules"], item["fields"]["builds_on"]), (["MOD-title-page"], []))
        self.assertEqual(item["fields"]["origin"], ["https://github.com/alice/thesis-tool/issues/58",
                                                    "https://gitlab.example.org/group/sub/thesis/-/issues/4"])

    def test_an_origin_that_is_no_issue_is_kept_as_it_is_written(self):
        item = read_item("docs/backlog/ITM-016-read-the-chapters.md", read(BACKLOG / "ITM-016-read-the-chapters.md"))["document"]
        self.assertEqual((item["fields"]["origin"], item["fields"]["realises"]), (["backlog refinement 2026-09-30"], ["UC-001"]))


class TestWhereAnItemLives(unittest.TestCase):
    def test_every_item_of_the_fixture_backlog_is_where_an_item_must_be(self):
        for path, text in files(BACKLOG).items():
            self.assertEqual(read_item(path, text)["findings"], [], path)

    def test_counter_proof_an_item_elsewhere_or_named_otherwise_is_a_problem(self):
        for path in ("docs/items/ITM-014-export-thesis-as-pdf.md", "backlog/ITM-014-export-thesis-as-pdf.md",
                     "docs/backlog/sprints/ITM-014-export-thesis-as-pdf.md", "docs/backlog/ITM-014-export-thesis-as-pdf.txt",
                     "docs/backlog/ITM-14-export-thesis-as-pdf.md", "docs/backlog/ITM-014.md",
                     "docs/backlog/ITM-014-Export-Thesis.md"):
            found = read_item(path, TEXT)["findings"]
            self.assertEqual([(f["rule"], f["line"], f["kind"]) for f in found], [(LIVES, 1, "error")], path)
            self.assertEqual(found[0]["artifact"], "ITM-014", path)
            self.assertGreater(len(found[0]["fix"]), 10, path)

    def test_counter_proof_a_file_without_front_matter_is_no_item(self):
        found = read_item(ITEM, TEXT.split("---\n", 2)[2])["findings"]
        self.assertTrue(found)
        self.assertTrue(all(f["kind"] == "error" for f in found))
        self.assertIn(("EVERY ARTIFACT HAS AN IDENTIFIER", "the key id is required, and left out"),
                      [(f["rule"], f["what"]) for f in found])


class TestTheOrderTheBacklogIsListedIn(unittest.TestCase):
    """The fixture backlog: ITM-014 and ITM-017 build on ITM-016; ITM-015 and ITM-016 build on nothing."""

    def test_each_item_comes_after_the_items_it_builds_on(self):
        backlog = files(BACKLOG)
        order = listed(backlog)
        before(order, backlog)
        self.assertLess(order.index("ITM-016"), order.index("ITM-014"))
        self.assertLess(order.index("ITM-016"), order.index("ITM-017"))

    def test_counter_proof_without_an_item_built_on_the_items_stand_as_given(self):
        backlog = files(BACKLOG)
        for path in (ITEM, "docs/backlog/ITM-017-measure-the-export-time.md"):
            backlog[path] = edited(backlog[path], "builds_on:\n  - ITM-016", "builds_on: []")
        self.assertEqual(listed(backlog), ["ITM-014", "ITM-015", "ITM-016", "ITM-017"])

    def test_an_item_built_on_that_the_backlog_lacks_holds_nothing_back(self):
        backlog = files(BACKLOG)
        backlog[ITEM] = edited(backlog[ITEM], "  - ITM-016", "  - ITM-099")
        order = listed(backlog)
        self.assertEqual(sorted(order), ["ITM-014", "ITM-015", "ITM-016", "ITM-017"])
        self.assertEqual(order[0], "ITM-014")

    def test_items_that_build_on_each_other_in_a_circle_are_each_listed_once(self):
        backlog = files(BACKLOG)
        backlog["docs/backlog/ITM-016-read-the-chapters.md"] = edited(
            backlog["docs/backlog/ITM-016-read-the-chapters.md"], "builds_on: []", "builds_on:\n  - ITM-015")
        backlog["docs/backlog/ITM-015-title-page.md"] = edited(
            backlog["docs/backlog/ITM-015-title-page.md"], "builds_on: []", "builds_on:\n  - ITM-016")
        order = listed(backlog)
        self.assertEqual(sorted(order), ["ITM-014", "ITM-015", "ITM-016", "ITM-017"])
        self.assertEqual(len(order), len(set(order)))


class TestItemsTakeThreeOrMoreDigits(unittest.TestCase):
    """ITM-<nnn> takes three or more digits (MOD-identifiers, Data)."""

    def numbered(self, number: int) -> str:
        return edited(edited(TEXT, "id: ITM-014\n", f"id: ITM-{number}\n"), "# ITM-014 ", f"# ITM-{number} ")

    def test_an_item_of_four_digits_is_where_and_what_an_item_must_be(self):
        got = read_item("docs/backlog/ITM-1000-export-thesis-as-pdf.md", self.numbered(1000))
        self.assertEqual((got["document"]["id"], got["findings"]), ("ITM-1000", []))

    def test_an_item_of_three_digits_is_still_read(self):
        got = read_item("docs/backlog/ITM-999-export-thesis-as-pdf.md", self.numbered(999))
        self.assertEqual((got["document"]["id"], got["findings"]), ("ITM-999", []))

    def test_counter_proof_an_item_of_two_digits_is_still_refused(self):
        found = read_item("docs/backlog/ITM-99-export-thesis-as-pdf.md", self.numbered(99))["findings"]
        self.assertIn((LIVES, 1, "error"), [(f["rule"], f["line"], f["kind"]) for f in found])
        self.assertIn("EVERY ARTIFACT HAS AN IDENTIFIER", [f["rule"] for f in found])

    def test_an_item_is_listed_after_the_four_digit_item_it_builds_on(self):
        unbuilt = lambda n: edited(self.numbered(n), "builds_on:\n  - ITM-016", "builds_on: []")
        backlog = {f"docs/backlog/ITM-{n}-export-thesis-as-pdf.md": unbuilt(n) for n in (203, 1000)}
        path = "docs/backlog/ITM-203-export-thesis-as-pdf.md"
        backlog[path] = edited(backlog[path], "builds_on: []", "builds_on:\n  - ITM-1000")
        self.assertEqual(listed(backlog), ["ITM-1000", "ITM-203"])


@unittest.skipUnless(any((DOCS / "backlog").glob("ITM-*.md")), "this repository has no backlog items")
class TestAgentMsOwnBacklog(unittest.TestCase):
    """The backlog of this repository: Agent M is the instance's own product (`docs/process.md`)."""

    OWN = DOCS / "backlog"

    def test_the_backlog_is_markdown_under_docs_backlog(self):
        names = sorted(p.relative_to(self.OWN).as_posix() for p in self.OWN.rglob("*") if p.is_file())
        items = [n for n in names if ITEM_FILE.match(n)]
        sprints = [n for n in names if re.match(r"^sprints/[a-z0-9-]+/\d+\.md$", n)]
        self.assertTrue(items)
        self.assertTrue(sprints, "a model with sprints keeps each team's sprint records under docs/backlog/sprints/<team>/")
        self.assertEqual(sorted(set(names) - set(items) - set(sprints)), [],
                         "the backlog holds its items and the teams' sprints, and nothing else: no order, no sprint "
                         "outside a team's folder")

    def test_every_item_of_this_repository_is_where_an_item_must_be(self):
        own = files(self.OWN)
        # The findings of where an item is kept: those that name its path. Known positive first: the first item, kept
        # under docs/items/, has one.
        count, misplaced, found = js(
            items_js(self.OWN) + f"const rule = {json.dumps(LIVES)};"
            "const where = (i) => documents.documentFindings(schema, i)"
            ".filter((f) => f.rule === rule && f.kind === 'error' && /^the path /.test(f.what)).map((f) => f.what);"
            "const first = items[0]; const elsewhere = documents.readDocument(schema, first.path.replace('docs/backlog/', 'docs/items/'),"
            " first.body);"
            "return [items.length, where(elsewhere), items.map((i) => [i.path, where(i)]).filter(([, f]) => f.length)];")
        self.assertEqual(len(misplaced), 1, "known positive: an item under docs/items/ is not where an item must be")
        self.assertEqual(found, [])
        self.assertEqual(count, len(own), "node read every item file Python sees")

    def test_the_backlog_of_this_repository_is_listed_with_every_item_once(self):
        own = files(self.OWN)
        got = js(items_js(self.OWN) + "return workPlans.itemStates(items, null, { statuses: new Map(), queues: [], jobs: [],"
                 " pullRequests: [], gates: [], workflow: null }).map((s) => s.item);")
        self.assertEqual(sorted(got), sorted(re.match(r"ITM-\d{3,}", Path(p).name).group(0) for p in own))
        self.assertEqual(len(got), len(set(got)))


if __name__ == "__main__":
    unittest.main()
