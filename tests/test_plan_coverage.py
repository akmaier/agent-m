# Module: MOD-model-catalogue
# Guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031; UC-035
# Level: release
"""SPEC section 1 - the check named tests/test_plan_coverage.py.

The cases live in tests/test_plan_coverage.md. This file loads them and asks MOD-model-catalogue, in Node, for the plan
that planGrid derives for a fixture product's accepted requirements and a shipped model.
"""
import json
import re
import subprocess
import unittest
from pathlib import Path

DATA = Path(__file__).with_suffix(".md")
ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "src" / "model-catalogue" / "index.mjs").as_uri()

JS = """
import { catalogue, planGrid } from "__INDEX__";
const input = __INPUT__;
const snapshot = { repository: { server: "github", origin: "https://github.com", path: "fixture/instance",
  web: "https://github.com/fixture/instance" }, ref: "main", commit: "a".repeat(40), paths: [],
  read: async () => null, blob: () => null };
const model = (await catalogue(snapshot)).models.find((candidate) => candidate.name === input.model);
const requirements = input.requirements ?? Array.from({ length: input.generated }, (_, i) => "REQUIREMENT " + i);
let out;
try {
  if (input.kind === "added") {
    const before = planGrid(requirements, model).entries;
    const after = planGrid([...requirements, input.added], model).entries;
    out = { before: before.length, after: after.length, added: after.length - before.length,
      newRequirementPhases: after.filter((e) => e.requirement === input.added).length };
  } else {
    const grid = planGrid(requirements, model);
    const pairs = new Set(grid.entries.map((e) => e.requirement + "\\u0000" + e.phase));
    const phases = requirements.length ? model.phases.map((p) => p.name) : [];
    const complete = requirements.every((r) => phases.every((p) => pairs.has(r + "\\u0000" + p)));
    out = { phases: complete ? phases : null, entries: grid.entries.length === pairs.size ? grid.entries.length : -1,
      count: grid.count };
  }
} catch (error) {
  out = { error: error.name };
}
process.stdout.write(JSON.stringify(out));
"""


def fence(body: str, heading: str) -> str:
    match = re.search(rf"^### {re.escape(heading)}\n\n```[a-z]*\n(.*?)\n```", body, re.M | re.S)
    if not match:
        raise AssertionError(f"missing fenced block under {heading}")
    return match.group(1)


def cases(*kinds: str) -> list[dict]:
    text = DATA.read_text(encoding="utf-8")
    found = [{"name": m.group("name"), "case": json.loads(fence(m.group("body"), "Case"))}
             for m in re.finditer(r"^## (?P<name>[^\n]+)\n(?P<body>.*?)(?=^## |\Z)", text, re.M | re.S)]
    chosen = [c for c in found if c["case"]["input"]["kind"] in kinds]
    if not chosen:
        raise AssertionError(f"no cases of {kinds} loaded")
    return chosen


def plan(case_input: dict) -> dict:
    code = JS.replace("__INDEX__", INDEX).replace("__INPUT__", json.dumps(case_input))
    done = subprocess.run(["node", "--input-type=module", "-e", code], cwd=ROOT, capture_output=True, text=True)
    if done.returncode != 0:
        raise AssertionError(done.stderr.strip()[-1200:])
    return json.loads(done.stdout)


class TestPlanCoverage(unittest.TestCase):
    def check(self, *kinds: str):
        for loaded in cases(*kinds):
            with self.subTest(case=loaded["name"]):
                self.assertEqual(plan(loaded["case"]["input"]), loaded["case"]["expected"])

    # TST-777001 · level: release · module: MOD-model-catalogue
    # guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031; UC-035
    # given: a fixture product with N accepted requirements (3, then 42) and the shipped V-model of seven phases
    # input: planGrid(requirements, V-model)
    # expect: exactly N x 7 entries, each requirement once in each of the seven phases, and the count reads as UC-031 step 5 shows it, "42 requirements x 7 phases = 294 plan entries" for 42
    def test_every_requirement_stands_once_in_every_phase(self):
        self.check("grid")

    # TST-777002 · level: release · module: MOD-model-catalogue
    # guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031
    # given: a fixture product with 5 accepted requirements and the shipped V-model of seven phases
    # input: planGrid for the 5 requirements, and again after one more requirement is accepted
    # expect: the plan grows from 35 to 42 entries, by exactly 7, and the new requirement stands in all seven phases
    def test_one_more_requirement_adds_one_entry_per_phase(self):
        self.check("added")

    # TST-777003 · level: release · module: MOD-model-catalogue
    # guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031; UC-035
    # given: a fixture product with no accepted requirement and the shipped V-model
    # input: planGrid([], V-model)
    # expect: no plan entry, and a count of "0 requirements x 7 phases = 0 plan entries"
    def test_no_requirement_gives_empty_phases(self):
        self.check("empty")

    # TST-777004 · level: release · module: MOD-model-catalogue
    # guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031
    # given: a fixture product with two accepted requirements and the shipped Kanban model, which is pulled
    # input: planGrid(requirements, Kanban)
    # expect: the error NotPlanned and no plan
    def test_a_pulled_model_is_refused(self):
        self.check("refused")


if __name__ == "__main__":
    unittest.main()
