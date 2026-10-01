# Module: MOD-work-items
"""The fixture product the tests of sprints, item states and the work-in-progress limit share (tests/test_wip_limit.py,
tests/test_time_box_selection.py, tests/test_job_from_backlog.py): the backlog of ITM-033's fixture product
(tests/fixtures/backlog/docs/backlog/, ITM-014 to ITM-017, every name it realises accepted in known.json), the model
definitions and sprint records under tests/fixtures/flow/, and pull requests and job records built here as data.

docs/assets/work-items/flow.mjs (MOD-work-items) is asked through node (tests/jsrun.py). Every file is read by node
itself with its own fs — never passed through the command line, whose length Linux limits.
"""
import json
from pathlib import Path

from jsrun import js

TESTS = Path(__file__).resolve().parent
FIX = TESTS / "fixtures" / "flow"
BACKLOG = TESTS / "fixtures" / "backlog" / "docs" / "backlog"
KNOWN = json.loads((TESTS / "fixtures" / "backlog" / "known.json").read_text(encoding="utf-8"))

WIP = "NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT"
SELECTED = "A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT"
AGILE = "AGILE IMPLEMENTATION STARTS FROM THE BACKLOG"
ACCEPTED = "NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED"
DERIVED = "PROGRESS AND JOB STATE ARE DERIVED, NOT STORED"

# Every file the expressions read, by node's fs; `items` are the fixture backlog's items by identifier, `model(name)` a
# fixture model parsed, `sprintOf(name)` a fixture sprint record read.
PRELUDE = (
    "const fs = await import('node:fs');"
    f"const FIX = {json.dumps(str(FIX))}; const BACKLOG = {json.dumps(str(BACKLOG))};"
    "const read = (p) => fs.readFileSync(p, 'utf8');"
    "const items = Object.fromEntries(fs.readdirSync(BACKLOG).filter((n) => /^ITM-.*\\.md$/.test(n)).sort()"
    ".map((n) => workItems.parseItem('docs/backlog/' + n, read(BACKLOG + '/' + n))).map((i) => [i.id, i]));"
    "const order = workItems.backlogOrder(read(BACKLOG + '/order.md'), Object.values(items)).order;"
    "const model = (name) => processModel.parseModel(read(FIX + '/' + name + '.md'));"
    "const sprintOf = (name) => flow.sprint(read(FIX + '/sprints/' + name + '.md'));"
)


def pr(number, item, state="open", base="sprint/02", merged_at=None, title=None, head=None, opened_at="2026-09-16T08:00:00.000Z"):
    """A pull request in the shape of MOD-git-host's pullRequests (ITM-146), naming `item` in its head branch."""
    return {"number": number, "title": title if title is not None else f"{item}: the work", "head": head or f"team/{item}",
            "base": base, "state": state, "openedAt": opened_at,
            "mergedAt": merged_at or ("2026-09-17T10:00:00.000Z" if state == "merged" else None),
            "mergeCommit": "a" * 40 if state == "merged" else None, "participantLine": f"developer-b, {item}", "ci": None}


def job(id, item, state, start="2026-09-16T09:00:00.000Z", waits_for_person=False):
    """A job as a job record names it: its identifier, the item it works on, one of the seven states of ONE DASHBOARD
    SHOWS EVERY JOB, its start, and — waiting at a gate — whether that gate waits for a person."""
    return {"id": id, "item": item, "state": state, "start": start, "waitsForPerson": waits_for_person}


def item_state(item, model, *, prs=(), jobs=(), sprint=None, today=None, backlog=None, requirements=None, use_cases=None):
    """itemState for `item` — an identifier of the fixture backlog, or None for a start without an item — under the
    fixture model `model`, with the running sprint `sprint` (a fixture sprint's name, or None for none), the backlog
    `backlog` (identifiers; None: the fixture's order, all four items) and the accepted names (None: all of known.json)."""
    reqs = KNOWN["requirements"] if requirements is None else requirements
    ucs = KNOWN["useCases"] if use_cases is None else use_cases
    return js(PRELUDE
              + f"const m = model({json.dumps(model)});"
              + (f"const s = sprintOf({json.dumps(sprint)});" if sprint else "const s = null;")
              + f"const b = {json.dumps(backlog)} ?? order;"
              + f"const wip = {{ ...m.flow, kind: m.kind, sprint: s, backlog: b, today: {json.dumps(today)} }};"
              + f"return flow.itemState({'null' if item is None else f'items[{json.dumps(item)}]'}, "
              + f"{{ requirements: {json.dumps(reqs)}, useCases: {json.dumps(ucs)}, jobs: {json.dumps(list(jobs))}, "
              + f"pullRequests: {json.dumps(list(prs))}, wip }});")


def kinds(result: dict) -> list:
    """The kinds of the reasons, in their order."""
    return [r["kind"] for r in result["reasons"]]


def starts(result: dict) -> bool:
    """A start is allowed exactly when the item is ready and nothing refuses it."""
    return result["state"] == "ready" and result["reasons"] == []
