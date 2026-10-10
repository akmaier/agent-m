# Module: MOD-participant-list
# Guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT HAS ONE OF FIVE TYPES; A PARTICIPANT DECLARES ITS CAPABILITIES; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
# Level: component
"""SPEC §5 — an instance lists its participants once, in docs/participants.md, and each row declares what the rules ask.

The instance repository's documents — every Markdown file under docs/ and at its root — are scanned for participant
lists: a file whose name begins with `participants`, or one that holds, outside a code fence, a table with the columns of
MOD-participant-list's participantSchema. The names the product's role assignments docs/role-assignments/*.md give, read
with MOD-product-process' roleAssignmentSchema, are resolved against the participants participantsOf gives for
docs/participants.md. The register's rows are judged with MOD-documents' documentFindings and participantSchema, whose
columns name the rule each guards. All of it is asked through node (tests/jsrun.py). Each check runs first on a copy with
one change that it must find.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

ROOT = Path(__file__).resolve().parent.parent
REGISTER = "docs/participants.md"
ASSIGNMENTS = "docs/role-assignments/"
ONCE = "PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE"
FIVE_TYPES = "A PARTICIPANT HAS ONE OF FIVE TYPES"
CAPABILITIES = "A PARTICIPANT DECLARES ITS CAPABILITIES"
PLACE = "A PARTICIPANT DECLARES WHERE IT PROCESSES DATA"
MODEL = "A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL"


def documents_of_the_instance() -> dict:
    """Every Markdown file under docs/ and at the root of the instance repository, by its path."""
    paths = sorted({*ROOT.glob("*.md"), *(ROOT / "docs").rglob("*.md")})
    return {p.relative_to(ROOT).as_posix(): p.read_text(encoding="utf-8") for p in paths}


def role_files() -> dict:
    """The register and the product's role assignments, by their paths."""
    paths = [REGISTER, *[p.relative_to(ROOT).as_posix() for p in sorted((ROOT / ASSIGNMENTS).glob("*.md"))]]
    return {path: (ROOT / path).read_text(encoding="utf-8") for path in paths}


def register_header() -> str:
    """The header row of the register's table, from the columns participantSchema names."""
    columns = js("return participantList.participantSchema().sections[0].table.columns.map((c) => c.name);")
    return "| " + " | ".join(columns) + " |"


def participant_lists(documents: dict) -> list:
    """The paths among `documents` that are participant lists: named so, or holding the register's table outside a fence."""
    header = register_header()
    found = []
    for path, text in documents.items():
        fenced, holds = False, False
        for line in text.split("\n"):
            if line.lstrip().startswith(("```", "~~~")):
                fenced = not fenced
            elif not fenced and line.strip() == header:
                holds = True
        if Path(path).name.startswith("participants") or holds:
            found.append(path)
    return sorted(found)


def unresolved(files: dict) -> list:
    """Each name a role assignment among `files` gives that the register's participants do not hold, as [path, name]."""
    return js(f"""
      const files = {json.dumps(files)};
      const register = documents.readDocument(participantList.participantSchema(), '{REGISTER}', files['{REGISTER}']);
      const listed = new Set(participantList.participantsOf(register).map((p) => p.name));
      return Object.keys(files).filter((p) => p.startsWith('{ASSIGNMENTS}')).sort().flatMap((p) => {{
        const assignment = documents.readDocument(productProcess.roleAssignmentSchema, p, files[p]);
        const rows = assignment.sections.find((s) => s.heading === '## Roles')?.rows ?? [];
        return rows.flatMap((r) => r.cells.Participants ?? []).filter((name) => !listed.has(name)).map((name) => [p, name]);
      }});
    """)


def assigned(files: dict) -> list:
    """Every name the role assignments among `files` give, as [path, name]."""
    return js(f"""
      const files = {json.dumps(files)};
      return Object.keys(files).filter((p) => p.startsWith('{ASSIGNMENTS}')).sort().flatMap((p) => {{
        const assignment = documents.readDocument(productProcess.roleAssignmentSchema, p, files[p]);
        const rows = assignment.sections.find((s) => s.heading === '## Roles')?.rows ?? [];
        return rows.flatMap((r) => r.cells.Participants ?? []).map((name) => [p, name]);
      }});
    """)


def register_findings(text: str) -> list:
    """The findings participantSchema names for a register with this text, each as [line, kind, rule, what]."""
    return js(f"""
      const schema = participantList.participantSchema();
      const register = documents.readDocument(schema, '{REGISTER}', {json.dumps(text)});
      return documents.documentFindings(schema, register).map((f) => [f.line, f.kind, f.rule, f.what]);
    """)


def first_of_type(text: str, kind: str) -> str:
    """The name of the register's first participant of this type."""
    return js(f"""
      const register = documents.readDocument(participantList.participantSchema(), '{REGISTER}', {json.dumps(text)});
      return participantList.participantsOf(register).find((p) => p.type === {json.dumps(kind)}).name;
    """)


def line_of(text: str, name: str) -> int:
    """The line of the register's row of this participant."""
    return next(n for n, line in enumerate(text.split("\n"), start=1) if line.startswith(f"| {name} |"))


def with_cell(text: str, name: str, column: str, value: str) -> str:
    """The register with one cell of this participant's row set to `value`."""
    columns = register_header().strip("| ").split(" | ")
    lines = text.split("\n")
    n = line_of(text, name) - 1
    cells = [cell.strip() for cell in lines[n].strip().strip("|").split("|")]
    cells[columns.index(column)] = value
    lines[n] = "| " + " | ".join(cells) + " |"
    return "\n".join(lines)


class ConfiguredOncePerInstance(unittest.TestCase):
    """PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE"""

    def test_known_positive_a_second_list_by_its_name_or_its_table_is_found_and_an_example_in_a_fence_is_not(self):
        register = role_files()[REGISTER]
        header = register_header()
        documents = {
            REGISTER: register,
            "docs/teams/participants_of_team_x.md": "# Team X participants\n\nThe list is docs/participants.md.\n",
            "docs/teams/team-x.md": register.replace("# Participants of this instance", "# Participants of Team X"),
            "docs/architecture/example.md": f"# Example\n\n```markdown\n{header}\n|---|\n| someone | person |\n```\n",
        }
        self.assertEqual(participant_lists(documents),
                         [REGISTER, "docs/teams/participants_of_team_x.md", "docs/teams/team-x.md"])

    def test_docs_participants_md_is_the_instances_only_participant_list(self):
        self.assertEqual(participant_lists(documents_of_the_instance()), [REGISTER])

    def test_known_positive_an_assigned_name_the_list_does_not_hold_is_found(self):
        files = role_files()
        path, name = assigned(files)[0]
        files[path] = files[path].replace(f"| {name} |", "| nobody-listed |", 1).replace(f" {name},", " nobody-listed,", 1)
        self.assertEqual(unresolved(files), [[path, "nobody-listed"]])

    def test_the_list_holds_every_name_the_role_assignments_give(self):
        files = role_files()
        self.assertTrue(assigned(files), "known positive: the role assignments give names")
        self.assertEqual(unresolved(files), [])


class RowsDeclareWhatTheRulesAsk(unittest.TestCase):
    """A PARTICIPANT HAS ONE OF FIVE TYPES · A PARTICIPANT DECLARES ITS CAPABILITIES · A PARTICIPANT DECLARES WHERE IT
    PROCESSES DATA"""

    def test_known_positive_a_row_that_breaks_a_rule_is_an_error_on_its_line_naming_that_rule(self):
        register = role_files()[REGISTER]
        agent = first_of_type(register, "CLI agent")
        for column, value, rule in [("Type", "robot", FIVE_TYPES), ("Capabilities", "fly", CAPABILITIES),
                                    ("Processing place", "—", PLACE)]:
            with self.subTest(column):
                found = register_findings(with_cell(register, agent, column, value))
                self.assertEqual([f[:3] for f in found if f[1] == "error"], [[line_of(register, agent), "error", rule]])

    def test_every_row_of_this_instances_list_fits_the_register_schema(self):
        self.assertEqual([f for f in register_findings(role_files()[REGISTER]) if f[1] == "error"], [])


class LanguageModelNamesItsModel(unittest.TestCase):
    """A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL"""

    def test_a_cli_agent_entry_without_a_model_is_rejected(self):
        register = role_files()[REGISTER]
        agent = first_of_type(register, "CLI agent")
        found = register_findings(with_cell(register, agent, "Model", "—"))
        self.assertEqual([f[:3] for f in found if f[1] == "error"], [[line_of(register, agent), "error", MODEL]])

    def test_counter_proof_the_same_entry_naming_its_model_is_accepted_and_a_person_needs_none(self):
        register = role_files()[REGISTER]
        agent, person = first_of_type(register, "CLI agent"), first_of_type(register, "person")
        found = register_findings(with_cell(register, agent, "Model", "example-model"))
        self.assertEqual([f for f in found if f[0] in (line_of(register, agent), line_of(register, person))], [])
        self.assertEqual(with_cell(register, person, "Model", "—"), register, "known positive: the person names no model")


if __name__ == "__main__":
    unittest.main()
