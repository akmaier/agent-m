# Module: MOD-work-plans
"""The fixture product of the parallel sprints, which tests/test_parallel_sprints.py, tests/test_time_box_selection.py and
tests/test_wip_limit.py share: tests/fixtures/parallel-sprints/ — its data in product.md (the modules and the interfaces they
use, the items and the modules they change, the pull requests, the process, the participants), its teams' sprint records
under docs/backlog/sprints/<team>/ and its role assignments under docs/role-assignments/.

MOD-work-plans is asked through node (tests/jsrun.py): heldItems, conflicts and startable. node reads the sprint records and
the role assignments itself, with its own fs, through MOD-documents' readDocument and the schemas of MOD-work-plans and
MOD-product-process. The items and the module files are handed over in the form of MOD-documents' Document. The Backlog page
of the real dashboard is asked through node too (planning_page), over the fixture product as a repository: its sprint
records and role assignments, and an item file and a module file for each item and module of the data. Everything an
expectation needs is read here from the data, never from the code under test.
"""
import json
import re
import subprocess
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


# The declaration's sprint branch, a pattern startSprint fills with the team and its sprint's number.
BRANCH_PATTERN = "sprint/<team>/<nn>"


def host_prelude() -> str:
    """JavaScript that, after prelude(), holds `host`, a fake of MOD-repository-hosts' Host over the fixture product at one
    head, HEAD: its sprint records, an item file per item of the data, and a declaration whose sprint branch is
    BRANCH_PATTERN; each call recorded in `calls`, each commit applied to its files. And `declaration`, `model` and `held`
    — the held items at HEAD."""
    return ("const HEAD = 'a'.repeat(40); const calls = [];"
            "const itemFile = (doc) => ['---', `id: ${doc.id}`, `title: ${doc.id} the work`, 'level: module', 'realises:',"
            " '  - UC-032', 'modules:', ...doc.fields.modules.map((m) => `  - ${m}`), 'builds_on: []', 'tests:', '  - unit',"
            " 'origin:', '  - UC-032', '---', `# ${doc.id} ${doc.id} the work`, '', '## Outcome', '', 'Done.', '', '## Acceptance', '',"
            " '- a unit test.', ''].join('\\n');"
            f"const files = Object.fromEntries([...{json.dumps(SPRINTS)}.map((p) => [p, read(p)]),"
            " ...items.map((i) => [`docs/backlog/${i.id}-work.md`, itemFile(i)])]);"
            "const host = { async repositoryInfo() { return { defaultBranch: 'main' }; },"
            " async readSnapshot(ref) { calls.push(['readSnapshot', ref]); return { ref, commit: HEAD, paths: Object.keys(files),"
            " blob: (p) => (p in files ? p : null), read: async (p) => files[p] ?? null }; },"
            " async createBranch(name, from) { calls.push(['createBranch', name, from]); },"
            " async commitFiles(change) { calls.push(['commitFiles', change.files.map((f) => f.path)]);"
            " for (const f of change.files) files[f.path] = f.text; return { commit: 'c'.repeat(40), url: 'https://example.org/c' }; } };"
            "const declaration = documents.readDocument(productProcess.declarationSchema, 'docs/process.md', ['---', 'model: fixture',"
            " 'model_file: docs/process-models/fixture.md', `model_version: ${HEAD}`, '---', '# How', '', '## Practices', '', '- none', '',"
            f" '## Branches', '', '| Phase or time box | Branch |', '|---|---|', '| Sprint | {BRANCH_PATTERN} |', '',"
            " '## Definition of Done', '', 'The job rules hold.', ''].join('\\n'));"
            "const model = workflow.model;"
            f"const held = workPlans.heldItems(sprints, items, architecture, {json.dumps(PULL_REQUESTS)});")


def state(item: str, value: str, pull_request=None, job=None) -> dict:
    """An ItemState: `value` one of its states; `pull_request` an open one's number — the item waits for review."""
    return {"item": item, "state": value, "reason": None, "job": job, "pullRequest": pull_request}


def all_ready() -> list:
    return [state(item, "ready") for item in ITEMS]


# The Backlog page of the real dashboard, in tests/app-harness.mjs over the fixture product as one repository, with a fake of
# GitHub's pulls API that answers the data's pull requests. The model is Scrum with a work-in-progress limit
# (tests/fixtures/flow/scrum-wip.md); each item realises RULE ONE, which the product's SPEC holds.
PAGE = r"""
const { readFileSync, readdirSync } = await import("node:fs");
const { repoServer, openDashboard, REPO } = await import(__HARNESS__);
const FIX = __FIX__, DATA = __DATA__, TEAM = __TEAM__;
const read = (p) => readFileSync(`${FIX}/${p}`, "utf8");
const itemFile = (id, modules) => ["---", `id: ${id}`, `title: ${id} the work`, "level: module", "realises:", "  - RULE ONE",
  "modules:", ...modules.map((m) => `  - ${m}`), "builds_on: []", "tests:", "  - unit", "origin:", "  - RULE ONE", "---",
  `# ${id} ${id} the work`, "", "## Outcome", "", "Done.", "", "## Acceptance", "", "- a unit test.", ""].join("\n");
const moduleFile = (id, uses) => ["---", `id: ${id}`, `title: The module ${id}`, `folder: src/${id.slice(4)}/`, "realises:",
  "  - RULE ONE", "follows:", "  - ARC-001", ...(uses.length ? ["uses:", ...uses.map((u) => `  - ${u}`)] : ["uses: []"]),
  "provides:", "  - read", "---", `# ${id} The module ${id}`, ""].join("\n");
const assignments = readdirSync(`${FIX}/docs/role-assignments`).map((f) => `docs/role-assignments/${f}`);
const files = {
  "SPEC.md": "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nThe rule the items realise.\n*Check:* at review.\n",
  "docs/process.md": ["---", "model: fixture", "model_file: docs/process-models/fixture.md", `model_version: ${"a".repeat(40)}`,
    "---", "# How the fixture product is developed", "", "## Practices", "", "- none", "", "## Branches", "",
    "| Phase or time box | Branch |", "|---|---|", "| Sprint | `sprint/<team>/<nn>` |", "", "## Definition of Done", "",
    "The job rules hold.", ""].join("\n"),
  "docs/process-models/fixture.md": readFileSync(DATA.model, "utf8"),
  ...Object.fromEntries([...DATA.sprints, ...assignments].map((p) => [p, read(p)])),
  ...Object.fromEntries(Object.entries(DATA.items).map(([id, modules]) => [`docs/backlog/${id}-work.md`, itemFile(id, modules)])),
  ...Object.fromEntries(Object.entries(DATA.modules).map(([id, uses]) => [`docs/architecture/${id}.md`, moduleFile(id, uses)])),
};
const pulls = DATA.pullRequests.map((p) => ({ number: p.number, title: p.title, head: { ref: p.branch, sha: p.head },
  base: { ref: p.base }, state: p.state === "open" ? "open" : "closed", created_at: p.opened, merged_at: p.merged,
  merge_commit_sha: p.merged ? "f".repeat(40) : null, body: "" }));
const pullsApi = async (url, init) => {
  if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${REPO}/pulls`) return null;
  if (init.method !== "GET") return new Response("{}", { status: 405 });
  const base = url.searchParams.get("base"), state = url.searchParams.get("state") ?? "open";
  const per = Number(url.searchParams.get("per_page") ?? 30), page = Number(url.searchParams.get("page") ?? 1);
  const list = pulls.filter((p) => !base || p.base.ref === base).filter((p) => state === "all" || p.state === state)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return new Response(JSON.stringify(list.slice((page - 1) * per, page * per)), { status: 200, headers: { "Content-Type": "application/json" } });
};
const page = await openDashboard({ server: await repoServer({ files, handlers: [pullsApi] }), hash: "#backlog" });
await page.click(`[data-plan="${TEAM}"]`);
process.stdout.write(JSON.stringify({ html: page.main() }));
"""


def planning_page(team: str) -> str:
    """The HTML of the Backlog page, as the real dashboard shows it over the fixture product, with Plan sprint open for
    `team`. node reads the fixture's files itself; the data's items, modules and pull requests are handed to it."""
    tests = Path(__file__).resolve().parent
    data = {"model": str(tests / "fixtures" / "flow" / "scrum-wip.md"), "sprints": SPRINTS, "items": ITEMS, "modules": MODULES,
            "pullRequests": PULL_REQUESTS}
    code = (PAGE.replace("__HARNESS__", json.dumps((tests / "app-harness.mjs").as_uri())).replace("__FIX__", json.dumps(str(FIX)))
            .replace("__DATA__", json.dumps(data)).replace("__TEAM__", json.dumps(team)))
    r = subprocess.run(["node", "--input-type=module", "-e", code], capture_output=True, text=True, cwd=tests)
    if r.returncode != 0:
        raise AssertionError(r.stderr.strip()[-1500:])
    return json.loads(r.stdout)["html"]
