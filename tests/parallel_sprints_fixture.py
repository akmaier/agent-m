# Module: MOD-work-plans
"""The fixture product of the parallel sprints, which tests/test_parallel_sprints.py, tests/test_time_box_selection.py and
tests/test_wip_limit.py share: tests/fixtures/parallel-sprints/ — its data in product.md (the modules and the interfaces they
use, the items and the modules they change, the pull requests, the process, the participants), its teams' sprint records
under docs/backlog/sprints/<team>/ and its role assignments under docs/role-assignments/.

MOD-work-plans is asked through node (tests/jsrun.py): heldItems, conflicts and startable. node reads the sprint records and
the role assignments itself, with its own fs, through MOD-documents' readDocument and the schemas of MOD-work-plans and
MOD-product-process. The items and the module files are handed over in the form of MOD-documents' Document — MOD-documents'
artifactSchemas, which would read them, is not built yet. Everything an expectation needs is read here from the data, never
from the code under test.
"""
import json
import re
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "parallel-sprints"
WIP_LIMIT = 2
# The sprint each team runs now.
CURRENT = {"team1": "docs/backlog/sprints/team1/01.md", "team2": "docs/backlog/sprints/team2/02.md"}
SPRINTS = sorted(p.relative_to(FIX).as_posix() for p in (FIX / "docs" / "backlog" / "sprints").rglob("*.md"))


def tables(text: str) -> dict:
    """The tables of a Markdown text, by the heading they stand under: each row as a dict by column, a cell `—` as ""."""
    found, heading, columns = {}, None, None
    for line in text.splitlines():
        if line.startswith("## "):
            heading, columns = line.strip(), None
            continue
        if not line.startswith("|") or heading is None:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if columns is None:
            columns = cells
        elif not set("".join(cells)) <= set("-: "):
            found.setdefault(heading, []).append({c: ("" if v == "—" else v) for c, v in zip(columns, cells)})
    return found


def split(cell: str) -> list:
    return [part.strip() for part in cell.split(",") if part.strip()]


DATA = tables((FIX / "product.md").read_text(encoding="utf-8"))
MODULES = {row["Module"]: split(row["Uses"]) for row in DATA["## Modules"]}
ITEMS = {row["Item"]: split(row["Modules"]) for row in DATA["## Items"]}
PULL_REQUESTS = [{"number": int(row["Number"]), "title": f"Pull request {row['Number']}", "branch": row["Branch"],
                  "base": row["Base"], "head": "a" * 40, "state": row["State"], "draft": False,
                  "url": f"https://github.com/alice/product/pull/{row['Number']}", "opened": "2026-10-01T08:00:00Z",
                  "merged": row["Merged"] or None, "closed": row["Merged"] or None} for row in DATA["## Pull requests"]]
SELECTIONS = {path: re.findall(r"^  - (ITM-\d{3})$", (FIX / path).read_text(encoding="utf-8").split("\n---")[0], re.M)
              for path in SPRINTS}


def uses_of(item: str) -> set:
    """The modules whose interfaces the modules an item changes use, read from the data."""
    return {use.split(".")[0] for module in ITEMS[item] for use in MODULES[module]}


# The items and module files, in the form of MOD-documents' Document; the workflow in MOD-product-process' Workflow form; the
# participants in MOD-participant-list's Participant form.
ITEM_DOCUMENTS = [{"kind": "item", "path": f"docs/backlog/{item}-work.md", "id": item, "title": item,
                   "fields": {"id": item, "modules": modules, "builds_on": []}, "sections": [], "appended": [], "body": ""}
                  for item, modules in ITEMS.items()]
MODULE_DOCUMENTS = [{"kind": "module", "path": f"docs/architecture/{module}.md", "id": module, "title": module,
                     "fields": {"id": module, "uses": uses}, "sections": [], "appended": [], "body": ""}
                    for module, uses in MODULES.items()]
WORKFLOW = {"model": {"name": "fixture", "kind": "pulled", "flow": {"wip": WIP_LIMIT, "timeBox": None, "sprints": True}},
            "phases": [{"name": row["Phase"], "roles": split(row["Roles"]), "produces": split(row["Produces"])}
                       for row in DATA["## Process"]],
            "roles": [{"name": row["Role"], "filledBy": "either", "howMany": "several", "capabilities": split(row["Capabilities"])}
                      for row in DATA["## Roles"]]}
PARTICIPANTS = [{"name": row["Name"], "type": "CLI agent", "model": "fixture-model", "capabilities": split(row["Capabilities"]),
                 "place": "this machine", "route": "bridge"} for row in DATA["## Participants"]]


def prelude(texts: dict | None = None, paths: list | None = None) -> str:
    """JavaScript that reads the fixture's sprint records — those of `paths`, all by default; `texts` in place of a file's
    text where given — and its role assignments, and holds the data as `sprints`, `items`, `architecture`, `workflow`,
    `participants`."""
    return ("const fs = await import('node:fs');"
            f"const FIX = {json.dumps(str(FIX))}; const over = {json.dumps(texts or {})};"
            "const read = (p) => over[p] ?? fs.readFileSync(FIX + '/' + p, 'utf8');"
            f"const sprints = {json.dumps(SPRINTS if paths is None else paths)}"
            ".map((p) => documents.readDocument(workPlans.planSchemas.sprint, p, read(p)));"
            "const sprintAt = (p) => sprints.find((s) => s.path === p);"
            "const assignment = (team) => documents.readDocument(productProcess.roleAssignmentSchema,"
            " `docs/role-assignments/${team}.md`, read(`docs/role-assignments/${team}.md`));"
            f"const items = {json.dumps(ITEM_DOCUMENTS)}; const architecture = {json.dumps(MODULE_DOCUMENTS)};"
            f"const workflow = {json.dumps(WORKFLOW)}; const participants = {json.dumps(PARTICIPANTS)};")


def held(pull_requests=None, texts: dict | None = None, paths: list | None = None) -> list:
    """heldItems over the fixture's sprints — those of `paths`, all by default —, with the pull requests given — the data's by
    default, "unknown" for none read."""
    prs = PULL_REQUESTS if pull_requests is None else pull_requests
    return js(prelude(texts, paths) + f"return workPlans.heldItems(sprints, items, architecture, {json.dumps(prs)});")


def conflicts_of(item: str, team: str, held_items: list) -> list:
    return js(prelude() + f"return workPlans.conflicts(items.find((i) => i.id === {json.dumps(item)}), {json.dumps(team)},"
                          f" {json.dumps(held_items)}, architecture);")


def start(item: str, team: str, states: list, wip=WIP_LIMIT) -> dict:
    """startable for `item` under `team`'s role assignment and current sprint, with the held items of the data's pull
    requests, the given states — ItemState objects —, and the limit `wip`."""
    return js(prelude() + f"const held = workPlans.heldItems(sprints, items, architecture, {json.dumps(PULL_REQUESTS)});"
                          f"return workPlans.startable({json.dumps(item)}, {json.dumps(states)}, {{ workflow,"
                          f" assignment: assignment({json.dumps(team)}), sprint: sprintAt({json.dumps(CURRENT[team])}), held,"
                          f" wip: {json.dumps(wip)}, participants }});")


def state(item: str, value: str, pull_request=None, job=None) -> dict:
    """An ItemState: `value` one of its states; `pull_request` an open one's number — the item waits for review."""
    return {"item": item, "state": value, "reason": None, "job": job, "pullRequest": pull_request}


def all_ready() -> list:
    return [state(item, "ready") for item in ITEMS]
