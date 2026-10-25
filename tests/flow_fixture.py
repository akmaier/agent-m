# Module: MOD-work-plans
"""The fixture product of one team that the tests of item states, of a job's start and of the work-in-progress limit share
(tests/test_wip_limit.py, tests/test_time_box_selection.py, tests/test_job_from_backlog.py): the backlog of
tests/fixtures/backlog/docs/backlog/ (ITM-014 to ITM-017; every name they realise accepted, and every module they name
described, in tests/fixtures/backlog/known.json), the process models under tests/fixtures/flow/, and the pull requests, job
rows and the running sprint built here as data.

MOD-work-plans is asked through node (tests/jsrun.py). itemStates derives each item's state from the approval statuses, the
job rows and the pull requests given; startable says whether a job may start for an item. The items are read with
MOD-documents' item schema, the sprint with MOD-work-plans' own; the model's flow control, phases and roles are what
MOD-model-catalogue's catalogue reads from the fixture model, made the product's workflow by MOD-product-process' workflowOf.
The product has one role assignment, docs/role-assignments/product.md: Owner alice, Builders and Checker dev-a, a CLI agent
with all the roles need. Every file is read by node itself with its own fs — never passed through the command line, whose
length Linux limits.
"""
import json
from pathlib import Path

from jsrun import js

TESTS = Path(__file__).resolve().parent
FIX = TESTS / "fixtures" / "flow"
BACKLOG = TESTS / "fixtures" / "backlog" / "docs" / "backlog"
KNOWN = json.loads((TESTS / "fixtures" / "backlog" / "known.json").read_text(encoding="utf-8"))
ITEMS = sorted(p.name.split("-", 2)[0] + "-" + p.name.split("-", 2)[1] for p in BACKLOG.glob("ITM-*.md"))

# The product's one role assignment, and its participants in MOD-participant-list's Participant form.
ASSIGNMENT = "\n".join(["# product", "", "## Roles", "", "| Role | Participants |", "|---|---|", "| Owner | alice |",
                        "| Builders | dev-a |", "| Checker | dev-a |", ""])
PARTICIPANTS = [
    {"name": "alice", "type": "person", "model": None, "capabilities": ["read the repository", "write to the repository"],
     "place": None, "route": "person"},
    {"name": "dev-a", "type": "CLI agent", "model": "fixture-model", "place": "this machine", "route": "bridge",
     "capabilities": ["read the repository", "write to the repository", "run code and tests", "use tools"]},
]

# Every file the expressions read, by node's fs: `items`, the fixture backlog's items as Documents; `architecture`, a module
# file for each module known.json describes; `statuses`, every name known.json holds as accepted — or those of `accepted`;
# `workflowOf(name)`, the product's workflow under the fixture model `name`; `assignment`; `sprintOf(selection)`, the
# team's running sprint selecting those items, or null.
PRELUDE = (
    "const fs = await import('node:fs');"
    f"const FIX = {json.dumps(str(FIX))}; const BACKLOG = {json.dumps(str(BACKLOG))};"
    "const read = (p) => fs.readFileSync(p, 'utf8');"
    "const items = fs.readdirSync(BACKLOG).filter((n) => /^ITM-.*\\.md$/.test(n)).sort()"
    ".map((n) => documents.readDocument(documents.artifactSchemas().item, 'docs/backlog/' + n, read(BACKLOG + '/' + n)));"
    f"const architecture = {json.dumps(KNOWN['modules'])}.map((id) => ({{ kind: 'module', path: `docs/architecture/${{id}}.md`,"
    " id, fields: { id, uses: [] }, sections: [] }));"
    "const statusesOf = (names) => new Map(names.map((id) => [id, { id, kind: /^UC-/.test(id) ? 'use-case' : 'requirement',"
    " status: 'accepted' }]));"
    "const declaration = documents.readDocument(productProcess.declarationSchema, 'docs/process.md', ['---', 'model: fixture',"
    " 'model_file: docs/process-models/fixture.md', `model_version: ${'b'.repeat(40)}`, '---', '# How', '', '## Practices', '',"
    " '- none', '', '## Branches', '', '| Phase or time box | Branch |', '|---|---|', '| Sprint | sprint/<team>/<nn> |', '',"
    " '## Definition of Done', '', 'The job rules hold.', ''].join('\\n'));"
    "const workflowOf = async (name) => { const path = 'docs/process-models/fixture.md';"
    " const files = { [path]: read(FIX + '/' + name + '.md') };"
    " const snapshot = { paths: [path], read: async (p) => files[p] ?? null, blob: (p) => (p in files ? 'b'.repeat(40) : null) };"
    " const model = (await modelCatalogue.catalogue(snapshot)).models.find((m) => m.path === path);"
    " return productProcess.workflowOf(declaration, model, [], ''); };"
    f"const assignment = documents.readDocument(productProcess.roleAssignmentSchema, 'docs/role-assignments/product.md',"
    f" {json.dumps(ASSIGNMENT)});"
    f"const participants = {json.dumps(PARTICIPANTS)};"
    "const sprintOf = (selection) => selection && documents.readDocument(workPlans.planSchemas.sprint,"
    " 'docs/backlog/sprints/product/01.md', ['---', 'sprint: 1', 'goal: The export', 'start: 2026-09-15', 'end:',"
    " 'closer: alice', 'branch:', 'selection:', ...selection.map((id) => `  - ${id}`), '---', '# product Sprint 01', ''].join('\\n'));"
)


def pr(number, item, state="open", opened="2026-09-16T08:00:00Z", merged=None, title=None, branch=None):
    """A pull request in MOD-repository-hosts' PullRequest form, naming `item` in its branch and its title."""
    return {"number": number, "title": title if title is not None else f"{item}: the work", "branch": branch or f"team/{item}",
            "base": "main", "head": "a" * 40, "state": state, "draft": False,
            "url": f"https://github.com/alice/thesis-tool/pull/{number}", "opened": opened,
            "merged": merged or ("2026-09-17T10:00:00Z" if state == "merged" else None),
            "closed": None if state == "open" else (merged or "2026-09-17T10:00:00Z")}


def job(id, item, state, start="2026-09-16T09:00:00Z"):
    """A job in MOD-job-ledger's JobRow form: its record, naming the item it works on and its start, and its state."""
    return {"record": {"id": id, "worksOn": [item], "start": start}, "state": state}


def run(item, model, *, prs=(), jobs=(), sprint=None, accepted=None) -> dict:
    """{ states, start }: itemStates of the fixture backlog under the fixture model `model`, from the pull requests `prs`, the
    job rows `jobs` and the accepted names `accepted` (None: all of known.json); and startable for `item` — an identifier,
    or None for a start without an item — with those states, the product's role assignment, the running sprint selecting
    `sprint` (a list of identifiers, or None for no sprint running), the items it holds, and the model's WIP limit."""
    names = KNOWN["requirements"] + KNOWN["useCases"] if accepted is None else accepted
    return js(PRELUDE
              + f"const workflow = await workflowOf({json.dumps(model)});"
              + f"const facts = {{ statuses: statusesOf({json.dumps(names)}), queues: [], jobs: {json.dumps(list(jobs))},"
              + f" pullRequests: {json.dumps(list(prs))}, gates: [], workflow }};"
              + "const states = workPlans.itemStates(items, null, facts);"
              + f"const sprint = sprintOf({json.dumps(sprint)});"
              + f"const held = sprint ? workPlans.heldItems([sprint], items, architecture, {json.dumps(list(prs))}) : [];"
              + f"const start = workPlans.startable({json.dumps(item)}, states, {{ workflow, assignment, sprint, held,"
              + " wip: workflow.model.flow?.wip ?? null, participants });"
              + "return { states, start };")


def state_of(result: dict, item: str) -> dict:
    """The ItemState of `item` in a run's states."""
    return next(s for s in result["states"] if s["item"] == item)


def starts(result: dict) -> bool:
    return result["start"] == {"startable": True}


def reasons(result: dict) -> list:
    return result["start"].get("reasons", [])
