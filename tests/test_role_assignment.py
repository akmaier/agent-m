# Module: MOD-product-process
# Guards: THE PROCESS NAMES ROLES, NOT PARTICIPANTS; A ROLE ASSIGNMENT FILLS THE ROLES; A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM; A PARTICIPANT MAY SERVE SEVERAL TEAMS
# Level: component
"""SPEC §5 — a product's process names its roles, and its role assignments fill them.

This instance is the product: its process declaration docs/process.md, its role assignments docs/role-assignments/*.md
and its participant list docs/participants.md are read as they stand, with MOD-product-process' schemas through
MOD-documents, and judged with declarationFindings and roleAssignmentFindings against the workflow of the model the
declaration names, as the instance's docs/process-models/ holds it — asked through node (tests/jsrun.py). The instance's
SPEC is not opened: the declaration adds no gate a requirement names, so its findings do not depend on it. Each check runs
first on a copy of these files with one change that it must find.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

ROOT = Path(__file__).resolve().parent.parent
NAMES_ROLES = "THE PROCESS NAMES ROLES, NOT PARTICIPANTS"
FILLS = "A ROLE ASSIGNMENT FILLS THE ROLES"
ONE_OR_PER_TEAM = "A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM"
ASSIGNMENTS = "docs/role-assignments/"


def instance_files() -> dict:
    """The files the checks read, by their paths in the instance."""
    paths = ["docs/process.md", "docs/participants.md",
             *[p.relative_to(ROOT).as_posix() for p in sorted((ROOT / "docs" / "process-models").glob("*.md"))],
             *[p.relative_to(ROOT).as_posix() for p in sorted((ROOT / "docs" / "role-assignments").glob("*.md"))]]
    return {path: (ROOT / path).read_text(encoding="utf-8") for path in paths}


def judged(files: dict, sprints: str | None = None) -> dict:
    """The findings of the declaration and of the role assignments among `files`, each as [path, line, kind, rule, what]:
    `declaration` those of declarationFindings, `schema` those documentFindings names for each assignment by its schema,
    `assignments` those of roleAssignmentFindings over all of them; `sprints` whether the declared model works in sprints;
    `holders` each assignment's participants. With `sprints` given, the declared model's row Sprints says it."""
    return js(f"""
      const files = {json.dumps(files)};
      const sprintsAre = {json.dumps(sprints)};
      const declared = documents.readDocument(productProcess.declarationSchema, 'docs/process.md', files['docs/process.md']);
      const modelPath = String(declared.fields.model_file);
      if (sprintsAre !== null) files[modelPath] = files[modelPath].replace(/^\\| Sprints \\| \\w+ \\|$/m, `| Sprints | ${{sprintsAre}} |`);
      const snap = {{ repository: {{ server: 'github', origin: 'https://github.com', path: 'instance/agent-m',
          web: 'https://github.com/instance/agent-m' }}, ref: 'main', commit: '0'.repeat(40), paths: Object.keys(files),
        read: async (p) => files[p] ?? null, blob: () => null }};
      const cat = await modelCatalogue.catalogue(snap);
      const listed = documents.readDocument(participantList.participantSchema(), 'docs/participants.md', files['docs/participants.md']);
      const chosen = cat.models.find((m) => m.path === modelPath);
      const wf = productProcess.workflowOf(declared, chosen, [], '');
      const filled = Object.keys(files).filter((p) => p.startsWith('{ASSIGNMENTS}')).sort()
        .map((p) => documents.readDocument(productProcess.roleAssignmentSchema, p, files[p]));
      const brief = (f) => [f.artifact, f.line, f.kind, f.rule, f.what];
      return {{
        declaration: productProcess.declarationFindings(declared, cat, listed, '').map(brief),
        schema: filled.flatMap((a) => documents.documentFindings(productProcess.roleAssignmentSchema, a)).map(brief),
        assignments: productProcess.roleAssignmentFindings(filled, wf, listed, []).map(brief),
        sprints: chosen?.flow?.sprints ?? null,
        holders: Object.fromEntries(filled.map((a) => [a.path,
          (a.sections.find((s) => s.heading === '## Roles')?.rows ?? []).flatMap((r) => r.cells.Participants ?? [])])),
      }};
    """)


def with_rule(found: list, rule: str) -> list:
    return [f for f in found if f[3] == rule]


def errors(found: list) -> list:
    return [f for f in found if f[2] == "error"]


def first_assignment(files: dict) -> str:
    return sorted(p for p in files if p.startswith(ASSIGNMENTS))[0]


class ProcessNamesRoles(unittest.TestCase):
    """THE PROCESS NAMES ROLES, NOT PARTICIPANTS"""

    def test_known_positive_a_declaration_naming_a_participant_is_found(self):
        files = instance_files()
        named = next(iter(judged(files)["holders"].values()))[0]
        files["docs/process.md"] = files["docs/process.md"].rstrip("\n") + f"\n\n{named} reviews every increment.\n"
        found = with_rule(judged(files)["declaration"], NAMES_ROLES)
        self.assertEqual(len(found), 1, found)
        self.assertIn(named, found[0][4])

    def test_the_declaration_names_no_participant_of_the_instances_list(self):
        self.assertEqual(with_rule(judged(instance_files())["declaration"], NAMES_ROLES), [])


class RoleAssignmentFillsTheRoles(unittest.TestCase):
    """A ROLE ASSIGNMENT FILLS THE ROLES"""

    def test_known_positive_a_role_the_process_lacks_and_a_line_besides_the_table_are_found(self):
        files = instance_files()
        path = first_assignment(files)
        files[path] = files[path].rstrip("\n") + "\n| Release manager | po-opus |\n\nThe team meets on Mondays.\n"
        found = with_rule(judged(files)["assignments"], FILLS)
        self.assertEqual([(f[0], f[2]) for f in found], [(path, "error"), (path, "error")], found)
        self.assertTrue(any("Release manager" in f[4] for f in found), found)
        self.assertTrue(any("The team meets on Mondays." in f[4] for f in found), found)

    def test_each_role_assignment_gives_participants_to_the_roles_of_the_process_and_holds_nothing_else(self):
        result = judged(instance_files())
        self.assertTrue(result["holders"], "the instance has a role assignment")
        for path, holders in result["holders"].items():
            self.assertTrue(holders, f"{path} gives the roles participants")
        self.assertEqual(errors(result["schema"]), [])
        self.assertEqual(with_rule(result["assignments"], FILLS), [])


class OneRoleAssignmentOrOnePerTeam(unittest.TestCase):
    """A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM"""

    def test_known_positive_several_role_assignments_without_sprints_are_found(self):
        files = instance_files()
        teams = [p for p in files if p.startswith(ASSIGNMENTS)]
        if len(teams) < 2:
            files[f"{ASSIGNMENTS}zz-second.md"] = files[teams[0]]
            teams.append(f"{ASSIGNMENTS}zz-second.md")
        found = with_rule(judged(files, sprints="no")["assignments"], ONE_OR_PER_TEAM)
        self.assertEqual(sorted(f[0] for f in found), sorted(teams))
        alone = {p: t for p, t in files.items() if not p.startswith(ASSIGNMENTS) or p == sorted(teams)[0]}
        self.assertEqual(with_rule(judged(alone, sprints="no")["assignments"], ONE_OR_PER_TEAM), [])

    def test_the_number_of_role_assignments_fits_the_model_one_or_one_per_team(self):
        result = judged(instance_files())
        count = len(result["holders"])
        if result["sprints"]:
            self.assertGreaterEqual(count, 1, "a model with sprints: one role assignment per team")
        else:
            self.assertEqual(count, 1, "a model without sprints: one role assignment")
        self.assertEqual(with_rule(result["assignments"], ONE_OR_PER_TEAM), [])


class ParticipantMayServeSeveralTeams(unittest.TestCase):
    """A PARTICIPANT MAY SERVE SEVERAL TEAMS"""

    def test_a_participant_holding_roles_in_two_teams_is_no_finding(self):
        files = instance_files()
        teams = sorted(p for p in files if p.startswith(ASSIGNMENTS))
        if len(teams) < 2:
            files[f"{ASSIGNMENTS}zz-second.md"] = files[teams[0]]
            teams.append(f"{ASSIGNMENTS}zz-second.md")
        result = judged(files, sprints="yes")
        shared = set(result["holders"][teams[0]]) & set(result["holders"][teams[1]])
        self.assertTrue(shared, "known positive: a participant holds roles in two teams")
        self.assertEqual([f for f in errors(result["assignments"]) if any(name in f[4] for name in shared)], [])


if __name__ == "__main__":
    unittest.main()
