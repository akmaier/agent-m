# Module: MOD-group-document
# Guards: ARTIFACTS ARE ARRANGED IN NESTED GROUPS; A GROUP CARRIES NO IDENTIFIER; A GROUP HOLDS ONE KIND OF ARTIFACT; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN; REGROUPING LEAVES THE GROUPED FILE UNCHANGED; AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
# Level: unit
"""SPEC §1 — the group files under docs/groups/ as MOD-group-document reads, arranges and writes them
(src/group-document/index.mjs: parseGroupFile, groupFileText, applyMoves, hierarchy).

A group file is a title line, one line saying what the file arranges and a nested list: an item that is an identifier — for
requirements, a name in capitals — is a member, any other item is a group title, nesting by two spaces. The fixtures are
tests/fixtures/groups/: one file per kind to read, the broken copies under broken/, and a small product under repo/ for the
regrouping and for the group titles named by artifacts. The module is asked through node (tests/jsrun.py), by its folder's
name, `groupDocument`. The text of a canonical file is stated in this file, per kind: the module writes the title line and
the line below it from the kind, and a group's members before its groups, each in the order they stand. The SPEC itself is
never read (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE): the requirement names come with the fixtures.
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

# EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN — the file of each kind under docs/groups/ (UC-021), and what its title
# line and the line below it say.
KINDS = ["requirements", "use-cases", "architecture", "modules", "tests"]
HEADINGS = {
    "requirements": "# Requirements — groups\n\nThe hierarchy of the requirements, each member by its name.\n",
    "use-cases": "# Use cases — groups\n\nThe hierarchy of the use cases, each member by its identifier.\n",
    "architecture": "# Architecture decisions — groups\n\nThe hierarchy of the architecture decisions, each member by its identifier.\n",
    "modules": "# Modules — groups\n\nThe hierarchy of the modules, each member by its identifier.\n",
    "tests": "# Tests — groups\n\nThe hierarchy of the tests, each member by its identifier.\n",
}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def path_of(kind: str) -> str:
    return f"docs/groups/{kind}.md"


def call(expr: str, **data):
    """Run `expr` against MOD-group-document with the JSON values `data` bound as D."""
    return js(f"const D = {json.dumps(data)}; {expr}")


def parse(kind: str, text: str) -> dict:
    return call("return groupDocument.parseGroupFile(D.path, D.text);", path=path_of(kind), text=text)


def outline(node: dict) -> list:
    """What a group, or the tree, holds as nested lists in the order a group file writes it: its members as identifiers,
    then its groups, each as [title, what it holds]."""
    return [m["id"] for m in node["members"]] + [[g["title"], outline(g)] for g in node["groups"]]


def members(node: dict) -> list:
    return [m["id"] for m in node["members"]] + [x for g in node["groups"] for x in members(g)]


def titles(node: dict) -> list:
    return [x for g in node["groups"] for x in [g["title"], *titles(g)]]


def findings(kind: str, text: str, items: list) -> list:
    """hierarchy() of a group file read: [line, kind, rule, what] of each finding, in the module's order."""
    found = call("const h = groupDocument.hierarchy(groupDocument.parseGroupFile(D.path, D.text), D.items);"
                 "return h.findings;", path=path_of(kind), text=text, items=items)
    for f in found:
        assert f["artifact"] == path_of(kind) and len(f["fix"]) > 10, f
    return [[f["line"], f["kind"], f["rule"], f["what"]] for f in found]


def regroup(kind: str, text: str, moves: list) -> dict:
    """UC-021: read a group file, apply the moves, write the canonical text — the regrouping as the dashboard does it."""
    return call("const t = groupDocument.parseGroupFile(D.path, D.text);"
                "const r = groupDocument.applyMoves(t, D.moves);"
                "return { tree: r.tree, applied: r.applied, refused: r.refused, text: groupDocument.groupFileText(r.tree) };",
                path=path_of(kind), text=text, moves=moves)


def blob_sha(data: bytes) -> str:
    """The blob SHA of a file's bytes (AN APPROVAL NAMES THE EXACT TEXT)."""
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


def blob_shas(root: Path) -> dict:
    return {p.relative_to(root).as_posix(): blob_sha(p.read_bytes()) for p in sorted(root.rglob("*")) if p.is_file()}


# The canonical text of each file of tests/fixtures/groups/, as the module writes it.
CANONICAL = {
    "requirements": HEADINGS["requirements"] + "\n- Identity\n  - EVERY EXPORT HAS A NAME\n  - Naming\n    - A NAME, WITH A COMMA\n"
                    "    - Owners\n      - THE AUTHOR'S OWN EXPORT\n- Formats\n  - EXPORT AS CSV\n- Withdrawn\n  - EXPORT AS PDF\n",
    "use-cases": HEADINGS["use-cases"] + "\n- Export\n  - UC-001\n  - Scheduled\n    - UC-003\n- Import\n  - UC-002\n",
    "architecture": HEADINGS["architecture"] + "\n- Storage\n  - ARC-001\n  - Formats\n    - ARC-002\n- Withdrawn\n  - ARC-003\n",
    "modules": HEADINGS["modules"] + "\n- Kernel\n  - MOD-export\n  - Readers\n    - MOD-csv-reader\n- Shells\n  - MOD-page\n",
    "tests": HEADINGS["tests"] + "\n- Export\n  - TST-001\n  - Edge cases\n    - TST-002\n    - TST-010\n- Import\n  - TST-003\n",
}


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
    files = sorted((root / "docs" / "groups").glob("*.md"))
    trees = call("return D.files.map(([path, text]) => groupDocument.parseGroupFile(path, text));",
                 files=[[path_of(f.stem), read(f)] for f in files])
    group_titles = {t for tree in trees for t in titles(tree)}
    return [f'{f}: {key} "{v}" is a group title' for f, key, v in references(root) if v in group_titles]


# ---------------------------------------------------------------- the rules

class ArrangedInNestedGroups(unittest.TestCase):
    """ARTIFACTS ARE ARRANGED IN NESTED GROUPS — each kind in a hierarchy of named groups of any depth."""

    def test_every_kind_reads_as_its_nested_hierarchy(self):
        expected = {
            "requirements": [["Identity", ["EVERY EXPORT HAS A NAME",
                                           ["Naming", ["A NAME, WITH A COMMA", ["Owners", ["THE AUTHOR'S OWN EXPORT"]]]]]],
                             ["Formats", ["EXPORT AS CSV"]], ["Withdrawn", ["EXPORT AS PDF"]]],
            "use-cases": [["Export", ["UC-001", ["Scheduled", ["UC-003"]]]], ["Import", ["UC-002"]]],
            "architecture": [["Storage", ["ARC-001", ["Formats", ["ARC-002"]]]], ["Withdrawn", ["ARC-003"]]],
            "modules": [["Kernel", ["MOD-export", ["Readers", ["MOD-csv-reader"]]]], ["Shells", ["MOD-page"]]],
            "tests": [["Export", ["TST-001", ["Edge cases", ["TST-002", "TST-010"]]]], ["Import", ["TST-003"]]],
        }
        for kind, tree in expected.items():
            parsed = parse(kind, read(FIX / f"{kind}.md"))
            self.assertEqual(parsed["kind"], kind)
            self.assertEqual(outline(parsed), tree, kind)

    def test_a_list_not_nested_by_two_spaces_is_read_as_far_as_it_goes(self):
        # Input: the list of broken/not-a-nested-list.md — "- Export", an item of four spaces and one of two that holds an
        # item of four, a line "* Import" that is no item, "- Import" and its member. An item that holds items is a group
        # even when its text is an identifier: UC-002 is read as a group holding UC-003; "* Import" does not count.
        parsed = parse("use-cases", read(BROKEN / "not-a-nested-list.md"))
        self.assertEqual(outline(parsed), [["Export", ["UC-001", ["UC-002", ["UC-003"]]]], ["Import", ["UC-004"]]])
        self.assertEqual(findings("use-cases", read(BROKEN / "not-a-nested-list.md"), ["UC-001", "UC-002", "UC-003", "UC-004"]),
                         [[7, "error", "A GROUP CARRIES NO IDENTIFIER", 'the group title "UC-002" is an identifier']])

    def test_group_file_text_of_a_canonical_file_read_is_that_file(self):
        for kind, text in CANONICAL.items():
            back = call("return groupDocument.groupFileText(groupDocument.parseGroupFile(D.path, D.text));",
                        path=path_of(kind), text=text)
            self.assertEqual(back, text, kind)

    def test_group_file_text_writes_the_canonical_text_of_a_file_that_is_not(self):
        # Input: format/not-canonical.md — trailing spaces, a blank line between two items, no final newline.
        text = call("return groupDocument.groupFileText(groupDocument.parseGroupFile(D.path, D.text));",
                    path=path_of("use-cases"), text=read(FIX / "format" / "not-canonical.md"))
        self.assertEqual(text, HEADINGS["use-cases"] + "\n- Export\n  - UC-001\n  - UC-002\n- Import\n  - UC-003\n")

    def test_group_file_text_of_an_empty_tree_is_the_title_line_and_the_line_below_it(self):
        for kind, heading in HEADINGS.items():
            text = call("return groupDocument.groupFileText({ kind: D.kind, groups: [], members: [] });", kind=kind)
            self.assertEqual(text, heading, kind)

    def test_group_file_text_writes_the_members_of_a_group_before_its_groups(self):
        # Input: a group that stands before a member, in a group and at the top. Expected: members first at every level.
        text = "# x\n\ny\n\n- Export\n  - Scheduled\n    - UC-003\n  - UC-001\n- UC-002\n- Import\n"
        back = call("return groupDocument.groupFileText(groupDocument.parseGroupFile(D.path, D.text));",
                    path=path_of("use-cases"), text=text)
        self.assertEqual(back, HEADINGS["use-cases"] + "\n- UC-002\n- Export\n  - UC-001\n  - Scheduled\n    - UC-003\n- Import\n")

    def test_group_file_text_ignores_the_lines_and_leaves_the_tree_as_it_was(self):
        same = call("const t = groupDocument.parseGroupFile(D.path, D.text), before = JSON.stringify(t);"
                    "const text = groupDocument.groupFileText(t);"
                    "const untouched = JSON.stringify(t) === before;"
                    "const set = (n) => { n.line = 99; n.members.forEach((m) => { m.line = 7; }); n.groups.forEach(set); };"
                    "set(t); return [untouched, groupDocument.groupFileText(t) === text];",
                    path=path_of("use-cases"), text=read(FIX / "use-cases.md"))
        self.assertEqual(same, [True, True])


class GroupFileFindings(unittest.TestCase):
    """Every broken copy yields exactly its findings, in the compiler form of ARC-007; the complete files yield none."""

    def test_a_member_listed_twice_and_a_group_titled_by_an_identifier_are_reported_with_their_lines(self):
        self.assertEqual(findings("use-cases", read(BROKEN / "twice.md"), ["UC-001", "UC-002"]),
                         [[9, "error", "AN ITEM HAS ONE PLACE IN ITS HIERARCHY", "UC-001 is listed a second time (first on line 6)"]])
        text = ("# Modules — groups\n\nGroup titles written like identifiers.\n\n- MOD-kernel\n  - MOD-export\n- UC-007\n"
                "  - MOD-csv-reader\n- Shells\n  - MOD-page\n")
        self.assertEqual(findings("modules", text, ["MOD-export", "MOD-csv-reader", "MOD-page"]), [
            [5, "error", "A GROUP CARRIES NO IDENTIFIER", 'the group title "MOD-kernel" is an identifier'],
            [7, "error", "A GROUP CARRIES NO IDENTIFIER", 'the group title "UC-007" is an identifier']])

    def test_the_complete_files_yield_no_finding(self):
        items = {"requirements": ["EVERY EXPORT HAS A NAME", "A NAME, WITH A COMMA", "THE AUTHOR'S OWN EXPORT", "EXPORT AS CSV",
                                  "EXPORT AS PDF"],
                 "use-cases": ["UC-001", "UC-002", "UC-003"],
                 "architecture": ["ARC-001", "ARC-002", "ARC-003"],
                 "modules": ["MOD-export", "MOD-csv-reader", "MOD-page"],
                 "tests": ["TST-001", "TST-002", "TST-003", "TST-010"]}
        for kind, known in items.items():
            h = call("const h = groupDocument.hierarchy(groupDocument.parseGroupFile(D.path, D.text), D.items);"
                     "return [h.findings, h.ungrouped, h.unknown];", path=path_of(kind), text=read(FIX / f"{kind}.md"), items=known)
            self.assertEqual(h, [[], [], []], kind)


class GroupCarriesNoIdentifier(unittest.TestCase):
    """A GROUP CARRIES NO IDENTIFIER — a group is named by its title; no artifact names a group title where an identifier
    is expected."""

    def test_a_group_is_named_by_its_title_only(self):
        def groups_of(node):
            return [x for g in node["groups"] for x in [g, *groups_of(g)]]
        found = groups_of(parse("requirements", read(FIX / "requirements.md")))
        self.assertEqual(len(found), 5)
        for g in found:
            self.assertEqual(sorted(g), ["groups", "line", "members", "title"], g["title"])

    def test_a_group_titled_by_an_identifier_is_refused_when_created(self):
        # Input: the use-case group file of tests/fixtures/groups/, and two `create` moves titled UC-007 — at the top level
        # and inside "Export". Precondition: the file is canonical, so its text read and written again is CANONICAL.
        # Expected: neither move is applied; each is refused with the reason `"UC-007" is an identifier, and a group carries
        # none`; the tree and the file text are those it was given.
        moves = [{"op": "create", "title": "UC-007", "in": []}, {"op": "create", "title": "UC-007", "in": ["Export"]}]
        r = regroup("use-cases", read(FIX / "use-cases.md"), moves)
        self.assertEqual(r["applied"], [])
        self.assertEqual(r["refused"], [{"move": m, "reason": '"UC-007" is an identifier, and a group carries none'} for m in moves])
        self.assertEqual(outline(r["tree"]), [["Export", ["UC-001", ["Scheduled", ["UC-003"]]]], ["Import", ["UC-002"]]])
        self.assertEqual(r["text"], CANONICAL["use-cases"])

    def test_no_artifact_of_this_repository_names_a_group_title_where_an_identifier_is_expected(self):
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
    """A GROUP HOLDS ONE KIND OF ARTIFACT — a member of another kind is listed as unknown, and a move into a group of
    another kind is refused."""

    def test_a_member_of_another_kind_matches_no_item_and_is_listed_as_unknown(self):
        h = call("const h = groupDocument.hierarchy(groupDocument.parseGroupFile(D.path, D.text), D.items);"
                 "return [h.unknown, h.findings.length];", path=path_of("use-cases"), text=read(BROKEN / "mixed-kinds.md"),
                 items=["UC-001"])
        self.assertEqual(h, [["EXPORT AS CSV", "MOD-export", "ITM-001"], 0])

    def test_a_move_into_a_group_of_another_kind_is_refused(self):
        r = regroup("requirements", read(FIX / "requirements.md"), [{"op": "move", "item": "UC-007", "to": ["Formats"]},
                                                                      {"op": "move", "item": "MOD-export", "to": []}])
        self.assertEqual([x["reason"] for x in r["refused"]], ["UC-007 is a use case, not a requirement",
                                                               "MOD-export is a module, not a requirement"])
        self.assertEqual(r["applied"], [])
        self.assertEqual(r["text"], CANONICAL["requirements"], "nothing was moved")

    def test_an_empty_hierarchy_holds_the_kind_of_its_path(self):
        r = regroup("use-cases", "", [{"op": "create", "title": "Export", "in": []}, {"op": "move", "item": "UC-001", "to": ["Export"]},
                                       {"op": "move", "item": "ARC-001", "to": ["Export"]}])
        self.assertEqual([x["reason"] for x in r["refused"]], ["ARC-001 is an architecture decision, not a use case"])
        self.assertEqual(outline(r["tree"]), [["Export", ["UC-001"]]])
        self.assertEqual(r["text"], HEADINGS["use-cases"] + "\n- Export\n  - UC-001\n")


class OnePlaceInTheHierarchy(unittest.TestCase):
    """AN ITEM HAS ONE PLACE IN ITS HIERARCHY — exactly once, in one group or at the top level; a move leaves no copy."""

    def test_an_item_listed_twice_stays_in_both_places_so_that_the_author_can_keep_one(self):
        h = call("return groupDocument.hierarchy(groupDocument.parseGroupFile(D.path, D.text), D.items).tree;",
                 path=path_of("use-cases"), text=read(BROKEN / "twice.md"), items=["UC-001", "UC-002"])
        self.assertEqual(outline(h), [["Export", ["UC-001", "UC-002"]], ["Import", ["UC-001"]]])

    def test_every_known_item_has_exactly_one_place(self):
        known = ["UC-001", "UC-002", "UC-003", "UC-004"]
        h = call("return groupDocument.hierarchy(groupDocument.parseGroupFile(D.path, D.text), D.items);",
                 path=path_of("use-cases"), text=read(FIX / "use-cases.md"), items=known)
        self.assertEqual(h["findings"], [])
        self.assertEqual(sorted(members(h["tree"])), known)

    def test_a_moved_item_or_group_leaves_no_copy_behind(self):
        r = regroup("use-cases", read(FIX / "use-cases.md"), [{"op": "move", "item": "UC-001", "to": ["Import"]},
                                                              {"op": "move-group", "group": ["Export", "Scheduled"], "to": ["Import"]}])
        self.assertEqual(r["refused"], [])
        self.assertEqual(outline(r["tree"]), [["Export", []], ["Import", ["UC-002", "UC-001", ["Scheduled", ["UC-003"]]]]])
        r = regroup("use-cases", read(FIX / "use-cases.md"), [{"op": "move", "item": "UC-003", "to": []}])
        self.assertEqual(outline(r["tree"]), ["UC-003", ["Export", ["UC-001", ["Scheduled", []]]], ["Import", ["UC-002"]]])

    def test_create_rename_and_delete_change_only_groups(self):
        r = regroup("use-cases", read(FIX / "use-cases.md"), [
            {"op": "create", "title": "Derivation", "in": ["Export"]},
            {"op": "rename", "group": ["Import"], "title": "Reading"},
            {"op": "delete", "group": ["Export", "Derivation"]},
            {"op": "create", "title": "Later", "in": []},
        ])
        self.assertEqual(r["refused"], [])
        self.assertEqual(outline(r["tree"]), [["Export", ["UC-001", ["Scheduled", ["UC-003"]]]], ["Reading", ["UC-002"]], ["Later", []]])

    def test_a_move_that_would_lose_an_item_is_refused(self):
        r = regroup("use-cases", read(FIX / "use-cases.md"), [
            {"op": "delete", "group": ["Export"]},
            {"op": "move-group", "group": ["Export"], "to": ["Export", "Scheduled"]},
            {"op": "move", "item": "UC-001", "to": ["Nowhere"]},
            {"op": "split", "group": ["Export"]},
        ])
        self.assertEqual([x["reason"] for x in r["refused"]], [
            'the group "Export" is not empty; move what it holds out first',
            'the group "Export" cannot be moved into itself or a group inside it',
            'there is no group "Nowhere"',
            'unknown change "split"',
        ])
        self.assertEqual(r["text"], CANONICAL["use-cases"])

    def test_apply_moves_leaves_the_tree_it_is_given_as_it_was(self):
        same = call("const t = groupDocument.parseGroupFile(D.path, D.text), before = JSON.stringify(t);"
                    "groupDocument.applyMoves(t, [{ op: 'move', item: 'UC-001', to: ['Import'] },"
                    " { op: 'rename', group: ['Import'], title: 'X' }]);"
                    "return JSON.stringify(t) === before;", path=path_of("use-cases"), text=read(FIX / "use-cases.md"))
        self.assertTrue(same)


class OwnGroupFile(unittest.TestCase):
    """EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN — docs/groups/<kind>.md, one kind each, every member by its
    identifier."""

    def items(self, kind: str):
        """The identifiers of the known items of a kind in this repository, read from the artifacts; None where they cannot
        be read without the SPEC or the test headers (requirements, tests): then only the form is checked."""
        pattern = {"use-cases": "use-cases/UC-*.md", "architecture": "architecture/ARC-*.md",
                   "modules": "architecture/MOD-*.md"}.get(kind)
        if pattern is None:
            return None
        out = []
        if kind == "modules":
            # A module is designed in a json module block of an architecture decision (ARC-020 decision 2).
            for f in sorted(DOCS.glob("architecture/ARC-*.md")):
                for block in re.findall(r"```json module\n(.*?)\n```", read(f), re.S):
                    out.append(json.loads(block)["id"])
        for f in sorted(DOCS.glob(pattern)):
            fields, _ = front_matter(read(f))
            out.append(fields.get("id"))
        return out

    def test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind(self):
        files = sorted((DOCS / "groups").glob("*.md"))
        if not files:
            self.skipTest("this repository has no group files")
        for f in files:
            self.assertIn(f.stem, KINDS, f"{f.name}: a group file is named after its kind")
            kind = f.stem
            known = self.items(kind)
            h = call("const t = groupDocument.parseGroupFile(D.path, D.text);"
                     "const ids = (n) => [...n.members.map((m) => m.id), ...n.groups.flatMap(ids)];"
                     "return { kind: t.kind, again: groupDocument.groupFileText(t),"
                     " h: groupDocument.hierarchy(t, D.items ?? ids(t)) };",
                     path=path_of(kind), text=read(f), items=known)
            self.assertEqual(h["kind"], kind, f.name)
            self.assertEqual(h["again"], read(f), f"{f.name} is canonical")
            self.assertEqual(h["h"]["findings"], [], f.name)
            if known is not None:
                self.assertEqual(h["h"]["unknown"], [], f.name)
                self.assertEqual(sorted(members(h["h"]["tree"])), sorted(known), f.name)

    def test_the_group_file_holds_titles_and_identifiers_only(self):
        r = regroup("modules", read(FIX / "modules.md"), [{"op": "create", "title": "Writers", "in": ["Kernel"]},
                                                          {"op": "move", "item": "MOD-export", "to": ["Kernel", "Writers"]}])
        self.assertEqual(r["text"], HEADINGS["modules"] + "\n- Kernel\n  - Readers\n    - MOD-csv-reader\n  - Writers\n"
                                                         "    - MOD-export\n- Shells\n  - MOD-page\n")


class RegroupingLeavesTheGroupedFilesUnchanged(unittest.TestCase):
    """REGROUPING LEAVES THE GROUPED FILE UNCHANGED — blob SHAs of SPEC.md and of all artifact files are equal before and
    after a regrouping."""

    def test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            shutil.copytree(REPO, root)
            before = blob_shas(root)
            for kind, moves in (("use-cases", [{"op": "move", "item": "UC-002", "to": ["Export"]},
                                               {"op": "delete", "group": ["Naming"]}]),
                                ("modules", [{"op": "rename", "group": ["Shells"], "title": "Pages"},
                                             {"op": "move", "item": "MOD-page", "to": []}])):
                f = root / "docs" / "groups" / f"{kind}.md"
                r = regroup(kind, read(f), moves)
                self.assertEqual(r["refused"], [], kind)
                f.write_text(r["text"], encoding="utf-8")
            after = blob_shas(root)
            self.assertEqual(sorted(after), sorted(before), "no file was added or removed")
            changed = sorted(p for p in before if before[p] != after[p])
            self.assertEqual(changed, ["docs/groups/modules.md", "docs/groups/use-cases.md"])
            self.assertIn("SPEC.md", before)
            self.assertEqual(outline(parse("use-cases", read(root / "docs" / "groups" / "use-cases.md"))), [["Export", ["UC-001", "UC-002"]]])
            self.assertEqual(outline(parse("modules", read(root / "docs" / "groups" / "modules.md"))),
                             ["MOD-page", ["Kernel", ["MOD-export"]], ["Pages", []]])


class UngroupedItemAtTheTopLevel(unittest.TestCase):
    """AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL — in the hierarchy, and written only once a move has placed it."""

    def test_an_item_no_group_names_is_shown_at_the_top_level(self):
        h = call("return groupDocument.hierarchy(groupDocument.parseGroupFile(D.path, D.text), D.items);",
                 path=path_of("use-cases"), text=read(FIX / "use-cases.md"), items=["UC-001", "UC-002", "UC-003", "UC-005", "UC-004"])
        self.assertEqual(h["findings"], [])
        self.assertEqual(h["ungrouped"], ["UC-005", "UC-004"])
        self.assertEqual(outline(h["tree"]), ["UC-005", "UC-004", ["Export", ["UC-001", ["Scheduled", ["UC-003"]]]], ["Import", ["UC-002"]]])

    def test_without_a_group_file_every_item_is_at_the_top_level(self):
        h = call("return groupDocument.hierarchy(groupDocument.parseGroupFile(D.path, ''), D.items);",
                 path=path_of("modules"), items=["MOD-b", "MOD-a"])
        self.assertEqual(outline(h["tree"]), ["MOD-b", "MOD-a"])
        self.assertEqual(h["tree"]["kind"], "modules")

    def test_an_item_the_file_does_not_list_is_written_only_once_it_is_moved(self):
        text = read(FIX / "use-cases.md")
        r = call("const t = groupDocument.parseGroupFile(D.path, D.text);"
                 "const moved = groupDocument.applyMoves(t, [{ op: 'move', item: 'UC-004', to: ['Import'] }]).tree;"
                 "return [groupDocument.groupFileText(t), groupDocument.groupFileText(moved)];",
                 path=path_of("use-cases"), text=text)
        self.assertEqual(r[0], CANONICAL["use-cases"])
        self.assertEqual(r[1], CANONICAL["use-cases"].replace("  - UC-002\n", "  - UC-002\n  - UC-004\n"))

    def test_an_unknown_member_is_listed_and_stays_where_it_stands(self):
        h = call("return groupDocument.hierarchy(groupDocument.parseGroupFile(D.path, D.text), D.items);",
                 path=path_of("architecture"), text=read(BROKEN / "unknown-and-withdrawn.md"), items=["ARC-001", "ARC-002", "ARC-003"])
        self.assertEqual(h["unknown"], ["ARC-009"])
        self.assertEqual(h["findings"], [])
        self.assertEqual(outline(h["tree"]), [["Storage", ["ARC-001", "ARC-009", "ARC-003"]], ["Withdrawn", ["ARC-002"]]])


if __name__ == "__main__":
    unittest.main()
