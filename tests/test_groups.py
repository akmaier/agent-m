# Module: MOD-artifacts
# Guards: ARTIFACTS ARE ARRANGED IN NESTED GROUPS; A GROUP CARRIES NO IDENTIFIER; A GROUP HOLDS ONE KIND OF ARTIFACT; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN; REGROUPING LEAVES THE GROUPED FILE UNCHANGED; AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
# Level: unit
"""SPEC §1 — the group files under docs/groups/ as the dashboard reads and writes them
(docs/assets/artifacts/groups.mjs: parseGroupFile, formatGroupFile, hierarchy, applyMoves; ARC-020 decision 3).

A group file is a heading, one explaining paragraph and a nested Markdown list: an item that is an identifier — for
requirements, a name in capitals — is a member, any other item is a group title, nesting by two spaces. The fixtures are
tests/fixtures/groups/: one canonical file per kind, the broken copies under broken/ with the findings each one must yield
in broken/expected.json, and a small product under repo/ for the regrouping and for the group titles named by artifacts.
The dashboard's module is asked through node (tests/jsrun.py). The SPEC itself is never read (KEIN SPEC-ZUGRIFF AUS
PRODUKT-CODE): the requirement names come with the fixtures. Counter-proofs: docs/measurements/2026-10-01_group-files.md.
"""
import hashlib
import json
import re
import shutil
import tempfile
import unittest
from pathlib import Path

from artifact_checks import DOCS, ROOT, front_matter
from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "groups"
BROKEN = FIX / "broken"
REPO = FIX / "repo"

# EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN — the file of each kind under docs/groups/ (UC-021).
GROUP_FILES = {"requirements.md": "requirement", "use-cases.md": "use-case", "architecture.md": "architecture-decision",
               "modules.md": "module", "tests.md": "test"}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def call(expr: str, **data):
    """Run `expr` against the dashboard's modules with the JSON values `data` bound as D."""
    return js(f"const D = {json.dumps(data)}; {expr}")


def parse(text: str) -> dict:
    return call("return groups.parseGroupFile(D.text);", text=text)


def outline(nodes: list) -> list:
    """A tree as nested lists: a group as [title, [its children]], a member as its identifier."""
    return [[n["title"], outline(n["children"])] if "title" in n else n["id"] for n in nodes]


def members(nodes: list) -> list:
    return [x for n in nodes for x in (members(n["children"]) if "title" in n else [n["id"]])]


def titles(nodes: list) -> list:
    return [x for n in nodes if "title" in n for x in [n["title"], *titles(n["children"])]]


def regroup(text: str, moves: list, kind=None) -> dict:
    """UC-021: read a group file, apply the moves, write the canonical text — the regrouping as the dashboard does it."""
    return call("const t = groups.parseGroupFile(D.text); if (D.kind) t.kind = D.kind;"
                "const r = groups.applyMoves(t, D.moves);"
                "return { tree: r.tree, refused: r.refused, text: groups.formatGroupFile(r.tree) };",
                text=text, moves=moves, kind=kind)


def blob_sha(data: bytes) -> str:
    """The git blob SHA of a file's bytes (AN APPROVAL NAMES THE EXACT TEXT)."""
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


def blob_shas(root: Path) -> dict:
    return {p.relative_to(root).as_posix(): blob_sha(p.read_bytes()) for p in sorted(root.rglob("*")) if p.is_file()}


# ---------------------------------------------------------------- A GROUP CARRIES NO IDENTIFIER, across the artifacts

HEADER = re.compile(r"^[^A-Za-z0-9'\"`]*(Module|Guards):\s*(.+?)\s*$")
CODE = {".mjs", ".js", ".py", ".ts", ".sh", ".yml"}
NOT_OWN = {"node_modules", "vendor", "products"}


def references(root: Path) -> list:
    """Every place an artifact expects an identifier: (file, key, value) — realises, forced_by, follows, uses and modules
    in the front matter of use cases, architecture files and backlog items, and the Module and Guards lines among the
    first 20 lines of code and tests."""
    out = []
    for folder, pattern in (("use-cases", "UC-*.md"), ("architecture", "*.md"), ("backlog", "ITM-*.md")):
        for f in sorted((root / "docs" / folder).glob(pattern)):
            fields, _ = front_matter(read(f))
            for key in ("realises", "forced_by", "follows", "uses", "modules"):
                for v in fields.get(key) if isinstance(fields.get(key), list) else []:
                    out.append((f.relative_to(root).as_posix(), key, v.split(".")[0] if key == "uses" else v))
    for f in sorted(root.rglob("*")):
        rel = f.relative_to(root)
        if not f.is_file() or f.suffix not in CODE or any(p.startswith(".") or p in NOT_OWN for p in rel.parts[:-1]) \
                or rel.parts[:2] == ("tests", "fixtures"):
            continue
        for line in read(f).split("\n")[:20]:
            m = HEADER.match(line)
            if m:
                out += [(rel.as_posix(), m.group(1), v.strip()) for v in m.group(2).split(";") if v.strip()]
    return out


def group_titles_named(root: Path) -> list:
    """Every reference to an identifier that is the title of a group in one of the product's group files."""
    texts = [read(f) for f in sorted((root / "docs" / "groups").glob("*.md"))]
    trees = call("return D.texts.map((t) => groups.parseGroupFile(t));", texts=texts)
    group_titles = {t for tree in trees for t in titles(tree["children"])}
    return [f'{f}: {key} "{v}" is a group title' for f, key, v in references(root) if v in group_titles]


# ---------------------------------------------------------------- the rules

class ArrangedInNestedGroups(unittest.TestCase):
    """ARTIFACTS ARE ARRANGED IN NESTED GROUPS — each kind in a hierarchy of named groups of any depth."""

    def test_every_kind_reads_as_its_nested_hierarchy(self):
        expected = {
            "requirements.md": ("requirement", [
                ["Identity", ["EVERY EXPORT HAS A NAME",
                              ["Naming", ["A NAME, WITH A COMMA", ["Owners", ["THE AUTHOR'S OWN EXPORT"]]]]]],
                ["Formats", ["EXPORT AS CSV"]], ["Withdrawn", ["EXPORT AS PDF"]]]),
            "use-cases.md": ("use-case", [["Export", ["UC-001", ["Scheduled", ["UC-003"]]]], ["Import", ["UC-002"]]]),
            "architecture.md": ("architecture-decision", [["Storage", ["ARC-001", ["Formats", ["ARC-002"]]]],
                                                          ["Withdrawn", ["ARC-003"]]]),
            "modules.md": ("module", [["Kernel", ["MOD-export", ["Readers", ["MOD-csv-reader"]]]], ["Shells", ["MOD-page"]]]),
            "tests.md": ("test", [["Export", ["TST-001", ["Edge cases", ["TST-002", "TST-010"]]]], ["Import", ["TST-003"]]]),
        }
        for name, (kind, tree) in expected.items():
            parsed = parse(read(FIX / name))
            self.assertEqual(parsed["kind"], kind, name)
            self.assertEqual(outline(parsed["children"]), tree, name)
            self.assertEqual(parsed["problems"], [], name)
        heading = parse(read(FIX / "requirements.md"))
        self.assertEqual(heading["heading"], "Requirements of the export tool — groups")
        self.assertEqual(heading["intro"], "The hierarchy of the requirements, one group per list item, each member by its "
                         "name in capitals. A group has\nno identifier; a requirement not listed here is shown at the top level.")

    def test_a_list_not_nested_by_two_spaces_is_read_as_far_as_it_goes(self):
        parsed = parse(read(BROKEN / "not-a-nested-list.md"))
        self.assertEqual(outline(parsed["children"]), [["Export", ["UC-001", "UC-002", "UC-003"]], ["Import", ["UC-004"]]])

    def test_format_of_parse_is_the_text_of_a_canonical_file(self):
        files = [FIX / n for n in GROUP_FILES] + [FIX / "format" / "canonical.md"] + sorted((REPO / "docs" / "groups").glob("*.md"))
        texts = [read(f) for f in files]
        back = call("return D.texts.map((t) => groups.formatGroupFile(groups.parseGroupFile(t)));", texts=texts)
        for f, text, again in zip(files, texts, back):
            self.assertEqual(again, text, f.name)

    def test_format_writes_the_canonical_text(self):
        text = call("return groups.formatGroupFile(groups.parseGroupFile(D.text));", text=read(FIX / "format" / "not-canonical.md"))
        self.assertEqual(text, read(FIX / "format" / "canonical.md"))

    def test_format_writes_the_heading_it_is_given(self):
        text = call("return groups.formatGroupFile(groups.parseGroupFile(D.text), 'Use cases — groups');",
                    text=read(FIX / "use-cases.md"))
        self.assertEqual(text, read(FIX / "use-cases.md").replace("# Use cases of the export tool — groups", "# Use cases — groups"))


class GroupFileFindings(unittest.TestCase):
    """Every broken copy yields exactly its findings, in the compiler form of ARC-007; the complete files yield none."""

    def test_every_broken_fixture_yields_exactly_the_findings_expected_json_names(self):
        expected = json.loads(read(BROKEN / "expected.json"))
        self.assertEqual(sorted(p.name for p in BROKEN.glob("*.md")), sorted(expected))
        for name, want in expected.items():
            found = call("return groups.hierarchy(groups.parseGroupFile(D.text), D.items).problems;",
                         text=read(BROKEN / name), items=want["items"])
            self.assertEqual(sorted([f["line"], f["kind"], f["rule"], f["what"]] for f in found), sorted(want["problems"]), name)
            for f in found:
                self.assertTrue(f["artifact"], name)
                self.assertGreater(len(f["fix"]), 10, f"{name}: a correction is named")

    def test_the_complete_files_yield_no_finding(self):
        items = {"requirements.md": ["EVERY EXPORT HAS A NAME", "A NAME, WITH A COMMA", "THE AUTHOR'S OWN EXPORT", "EXPORT AS CSV",
                                     {"id": "EXPORT AS PDF", "withdrawn": True}],
                 "use-cases.md": ["UC-001", "UC-002", "UC-003"],
                 "architecture.md": ["ARC-001", "ARC-002", {"id": "ARC-003", "withdrawn": True}],
                 "modules.md": ["MOD-export", "MOD-csv-reader", "MOD-page"],
                 "tests.md": ["TST-001", "TST-002", "TST-003", "TST-010"]}
        for name, known in items.items():
            found = call("return groups.hierarchy(groups.parseGroupFile(D.text), D.items).problems;", text=read(FIX / name), items=known)
            self.assertEqual(found, [], name)


class GroupCarriesNoIdentifier(unittest.TestCase):
    """A GROUP CARRIES NO IDENTIFIER — a group is named by its title; no artifact names a group title where an identifier
    is expected."""

    def test_a_group_is_named_by_its_title_only(self):
        def groups_of(nodes):
            return [n for n in nodes if "title" in n for n in [n, *groups_of(n["children"])]]
        found = groups_of(parse(read(FIX / "requirements.md"))["children"])
        self.assertEqual(len(found), 5)
        for g in found:
            self.assertEqual(sorted(g), ["children", "line", "title"], g["title"])

    def test_a_title_written_like_an_identifier_is_reported(self):
        found = call("return groups.hierarchy(groups.parseGroupFile(D.text), D.items).problems.map((p) => [p.line, p.rule]);",
                     text=read(BROKEN / "title-like-an-identifier.md"), items=["MOD-export", "MOD-csv-reader", "MOD-page"])
        self.assertEqual(found, [[5, "A GROUP CARRIES NO IDENTIFIER"], [7, "A GROUP CARRIES NO IDENTIFIER"],
                                 [9, "A GROUP CARRIES NO IDENTIFIER"]])

    def test_no_artifact_of_this_repository_names_a_group_title_where_an_identifier_is_expected(self):
        self.assertTrue((DOCS / "groups").is_dir())
        self.assertTrue(references(ROOT), "the references are read at all")
        self.assertEqual(group_titles_named(ROOT), [])

    def test_a_group_title_named_as_an_identifier_is_found(self):
        self.assertEqual(group_titles_named(REPO), [], "the fixture product names no group title")
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            shutil.copytree(REPO, root)
            uc = root / "docs" / "use-cases" / "UC-001-export-the-list.md"
            uc.write_text(read(uc).replace("  - EXPORT AS CSV\n", "  - EXPORT AS CSV\n  - Kernel\n"), encoding="utf-8")
            test = root / "tests" / "export.test.js"
            test.write_text(read(test).replace("// Module: MOD-export", "// Module: Shells"), encoding="utf-8")
            item = root / "docs" / "backlog" / "ITM-001-export-as-csv.md"
            item.write_text(read(item).replace("  - UC-001\n", "  - Export\n"), encoding="utf-8")
            self.assertEqual(sorted(group_titles_named(root)), [
                'docs/backlog/ITM-001-export-as-csv.md: realises "Export" is a group title',
                'docs/use-cases/UC-001-export-the-list.md: realises "Kernel" is a group title',
                'tests/export.test.js: Module "Shells" is a group title'])


class OneKindOfArtifact(unittest.TestCase):
    """A GROUP HOLDS ONE KIND OF ARTIFACT — a member of another kind is reported, and a move into a group of another kind
    is refused."""

    def test_a_member_of_another_kind_is_reported(self):
        found = call("return groups.hierarchy(groups.parseGroupFile(D.text), D.items).problems.map((p) => [p.artifact, p.rule]);",
                     text=read(BROKEN / "mixed-kinds.md"), items=["UC-001"])
        self.assertEqual(sorted(found), [["EXPORT AS CSV", "A GROUP HOLDS ONE KIND OF ARTIFACT"],
                                         ["ITM-001", "A GROUP HOLDS ONE KIND OF ARTIFACT"],
                                         ["MOD-export", "A GROUP HOLDS ONE KIND OF ARTIFACT"]])

    def test_a_move_into_a_group_of_another_kind_is_refused(self):
        r = regroup(read(FIX / "requirements.md"), [{"op": "move", "item": "UC-007", "to": ["Formats"]},
                                                    {"op": "move", "item": "MOD-export", "to": []}])
        self.assertEqual([x["reason"] for x in r["refused"]], ["UC-007 is a use case, not a requirement",
                                                               "MOD-export is a module, not a requirement"])
        self.assertEqual(r["text"], read(FIX / "requirements.md"), "nothing was moved")

    def test_an_empty_hierarchy_holds_the_kind_it_is_given(self):
        r = regroup("", [{"op": "create", "title": "Export", "in": []}, {"op": "move", "item": "UC-001", "to": ["Export"]},
                         {"op": "move", "item": "ARC-001", "to": ["Export"]}], kind="use-case")
        self.assertEqual([x["reason"] for x in r["refused"]], ["ARC-001 is an architecture decision, not a use case"])
        self.assertEqual(outline(r["tree"]["children"]), [["Export", ["UC-001"]]])


class OnePlaceInTheHierarchy(unittest.TestCase):
    """AN ITEM HAS ONE PLACE IN ITS HIERARCHY — exactly once, in one group or at the top level; a move leaves no copy."""

    def test_an_item_listed_twice_is_reported_in_both_places(self):
        h = call("return groups.hierarchy(groups.parseGroupFile(D.text), D.items);", text=read(BROKEN / "twice.md"),
                 items=["UC-001", "UC-002"])
        self.assertEqual([[p["line"], p["rule"]] for p in h["problems"]], [[9, "AN ITEM HAS ONE PLACE IN ITS HIERARCHY"]])
        self.assertEqual(outline(h["tree"]["children"]), [["Export", ["UC-001", "UC-002"]], ["Import", ["UC-001"]]],
                         "both places are shown, so that the author can keep one")

    def test_every_known_item_has_exactly_one_place(self):
        known = ["UC-001", "UC-002", "UC-003", "UC-004"]
        h = call("return groups.hierarchy(groups.parseGroupFile(D.text), D.items);", text=read(FIX / "use-cases.md"), items=known)
        self.assertEqual(h["problems"], [])
        self.assertEqual(sorted(members(h["tree"]["children"])), known)

    def test_a_moved_item_or_group_leaves_no_copy_behind(self):
        r = regroup(read(FIX / "use-cases.md"), [{"op": "move", "item": "UC-001", "to": ["Import"]},
                                                 {"op": "move", "group": ["Export", "Scheduled"], "to": ["Import"]}])
        self.assertEqual(r["refused"], [])
        self.assertEqual(outline(r["tree"]["children"]), [["Export", []], ["Import", ["UC-002", "UC-001", ["Scheduled", ["UC-003"]]]]])
        r = regroup(read(FIX / "use-cases.md"), [{"op": "move", "item": "UC-003", "to": []}])
        self.assertEqual(outline(r["tree"]["children"]), [["Export", ["UC-001", ["Scheduled", []]]], ["Import", ["UC-002"]], "UC-003"])

    def test_create_rename_and_delete_change_only_groups(self):
        r = regroup(read(FIX / "use-cases.md"), [
            {"op": "create", "title": "Derivation", "in": ["Export"]},
            {"op": "rename", "group": ["Import"], "title": "Reading"},
            {"op": "delete", "group": ["Export", "Derivation"]},
            {"op": "create", "title": "Later", "in": []},
        ])
        self.assertEqual(r["refused"], [])
        self.assertEqual(outline(r["tree"]["children"]), [["Export", ["UC-001", ["Scheduled", ["UC-003"]]]], ["Reading", ["UC-002"]],
                                                          ["Later", []]])

    def test_a_move_that_would_lose_or_duplicate_is_refused(self):
        r = regroup(read(FIX / "use-cases.md"), [
            {"op": "delete", "group": ["Export"]},
            {"op": "move", "group": ["Export"], "to": ["Export", "Scheduled"]},
            {"op": "create", "title": "Import", "in": []},
            {"op": "move", "item": "UC-001", "to": ["Nowhere"]},
            {"op": "rename", "group": ["Export"], "title": "Import"},
            {"op": "split", "group": ["Export"]},
        ])
        self.assertEqual([x["reason"] for x in r["refused"]], [
            'the group "Export" is not empty; move what it holds out first',
            'the group "Export" cannot be moved into itself or a group inside it',
            'a group "Import" exists there already',
            'there is no group "Nowhere"',
            'a group "Import" exists there already',
            'unknown change "split"',
        ])
        self.assertEqual(r["text"], read(FIX / "use-cases.md"))

    def test_apply_moves_leaves_the_tree_it_is_given_as_it_was(self):
        same = call("const t = groups.parseGroupFile(D.text), before = JSON.stringify(t);"
                    "groups.applyMoves(t, [{ op: 'move', item: 'UC-001', to: ['Import'] }, { op: 'rename', group: ['Import'], title: 'X' }]);"
                    "return JSON.stringify(t) === before;", text=read(FIX / "use-cases.md"))
        self.assertTrue(same)


class OwnGroupFile(unittest.TestCase):
    """EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN — docs/groups/<kind>.md, one kind each, every member by its
    identifier."""

    def items(self, kind: str):
        """The known items of a kind in this repository, with their withdrawal, read from the artifacts; None where they
        cannot be read without the SPEC or the test headers (requirements, tests): then only the form is checked."""
        pattern = {"use-case": "use-cases/UC-*.md", "architecture-decision": "architecture/ARC-*.md",
                   "module": "architecture/MOD-*.md"}.get(kind)
        if pattern is None:
            return None
        out = []
        if kind == "module":
            # A module is designed in a json module block of an architecture decision (ARC-020 decision 2).
            for f in sorted(DOCS.glob("architecture/ARC-*.md")):
                for block in re.findall(r"```json module\n(.*?)\n```", read(f), re.S):
                    out.append({"id": json.loads(block)["id"], "withdrawn": False})
        for f in sorted(DOCS.glob(pattern)):
            fields, _ = front_matter(read(f))
            out.append({"id": fields.get("id"), "withdrawn": bool(fields.get("withdrawn"))})
        return out

    def test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind(self):
        files = sorted((DOCS / "groups").glob("*.md"))
        self.assertTrue(files)
        for f in files:
            self.assertIn(f.name, GROUP_FILES, f"{f.name}: a group file is named after its kind")
            kind = GROUP_FILES[f.name]
            items = self.items(kind)
            h = call("const t = groups.parseGroupFile(D.text);"
                     "return { kind: t.kind, again: groups.formatGroupFile(t), h: groups.hierarchy(t, D.items) };",
                     text=read(f), items=items)
            self.assertEqual(h["kind"], kind, f.name)
            self.assertEqual(h["again"], read(f), f"{f.name} is canonical")
            self.assertEqual(h["h"]["problems"], [], f.name)
            if items is not None:
                self.assertEqual(sorted(members(h["h"]["tree"]["children"])), sorted(i["id"] for i in items), f.name)

    def test_the_group_file_holds_titles_and_identifiers_only(self):
        r = regroup(read(FIX / "modules.md"), [{"op": "create", "title": "Writers", "in": ["Kernel"]},
                                               {"op": "move", "item": "MOD-export", "to": ["Kernel", "Writers"]}])
        head = "# Modules of the export tool — groups\n\nThe hierarchy of the modules, each member by its identifier.\n\n"
        self.assertEqual(r["text"], head + "- Kernel\n  - Readers\n    - MOD-csv-reader\n  - Writers\n    - MOD-export\n"
                                          "- Shells\n  - MOD-page\n")


class RegroupingLeavesTheGroupedFilesUnchanged(unittest.TestCase):
    """REGROUPING LEAVES THE GROUPED FILE UNCHANGED — blob SHAs of SPEC.md and of all artifact files are equal before and
    after a regrouping."""

    def test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            shutil.copytree(REPO, root)
            before = blob_shas(root)
            for name, moves in (("use-cases.md", [{"op": "move", "item": "UC-002", "to": ["Export"]},
                                                  {"op": "delete", "group": ["Naming"]}]),
                                ("modules.md", [{"op": "rename", "group": ["Shells"], "title": "Pages"},
                                                {"op": "move", "item": "MOD-page", "to": []}])):
                f = root / "docs" / "groups" / name
                r = regroup(read(f), moves)
                self.assertEqual(r["refused"], [], name)
                f.write_text(r["text"], encoding="utf-8")
            after = blob_shas(root)
            self.assertEqual(sorted(after), sorted(before), "no file was added or removed")
            changed = sorted(p for p in before if before[p] != after[p])
            self.assertEqual(changed, ["docs/groups/modules.md", "docs/groups/use-cases.md"])
            self.assertIn("SPEC.md", before)
            self.assertEqual(outline(parse(read(root / "docs" / "groups" / "use-cases.md"))["children"]),
                             [["Export", ["UC-001", "UC-002"]]])
            self.assertEqual(outline(parse(read(root / "docs" / "groups" / "modules.md"))["children"]),
                             [["Kernel", ["MOD-export"]], ["Pages", []], "MOD-page"])


class UngroupedItemAtTheTopLevel(unittest.TestCase):
    """AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL — marked *not yet placed* until it is moved."""

    def test_an_item_no_group_names_is_shown_at_the_top_level_not_yet_placed(self):
        h = call("return groups.hierarchy(groups.parseGroupFile(D.text), D.items);", text=read(FIX / "use-cases.md"),
                 items=["UC-001", "UC-002", "UC-003", "UC-005", "UC-004"])
        self.assertEqual(h["problems"], [])
        top = h["tree"]["children"]
        self.assertEqual(outline(top), [["Export", ["UC-001", ["Scheduled", ["UC-003"]]]], ["Import", ["UC-002"]], "UC-005", "UC-004"])
        self.assertEqual([n.get("notYetPlaced", False) for n in top], [False, False, True, True])
        self.assertNotIn("notYetPlaced", top[0]["children"][0], "a placed item is not marked")

    def test_without_a_group_file_every_item_is_at_the_top_level(self):
        h = call("return groups.hierarchy(groups.parseGroupFile(''), D.items);", items=["MOD-b", "MOD-a"])
        self.assertEqual(outline(h["tree"]["children"]), ["MOD-b", "MOD-a"])
        self.assertEqual(h["tree"]["kind"], "module")

    def test_a_not_yet_placed_item_is_written_only_once_it_is_moved(self):
        r = call("const h = groups.hierarchy(groups.parseGroupFile(D.text), D.items).tree;"
                 "const moved = groups.applyMoves(h, [{ op: 'move', item: 'UC-004', to: ['Import'] }]).tree;"
                 "return [groups.formatGroupFile(h), groups.formatGroupFile(moved)];",
                 text=read(FIX / "use-cases.md"), items=["UC-001", "UC-002", "UC-003", "UC-004", "UC-005"])
        self.assertEqual(r[0], read(FIX / "use-cases.md"))
        self.assertEqual(r[1], read(FIX / "use-cases.md").replace("  - UC-002\n", "  - UC-002\n  - UC-004\n"))

    def test_an_unknown_member_and_a_withdrawn_one_outside_withdrawn_are_named(self):
        h = call("return groups.hierarchy(groups.parseGroupFile(D.text), D.items);", text=read(BROKEN / "unknown-and-withdrawn.md"),
                 items=["ARC-001", {"id": "ARC-002", "withdrawn": True}, {"id": "ARC-003", "withdrawn": True}])
        storage = h["tree"]["children"][0]["children"]
        self.assertEqual([(n["id"], n.get("unknown", False), n.get("withdrawn", False)) for n in storage],
                         [("ARC-001", False, False), ("ARC-009", True, False), ("ARC-003", False, True)])


if __name__ == "__main__":
    unittest.main()
