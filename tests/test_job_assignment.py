# Module: MOD-work-plans
# Module: MOD-product-process
# Module: MOD-participant-list
# Module: MOD-agent-processes
# Guards: A JOB GOES ONLY TO A HOLDER OF ITS ROLE; A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; A ROLE NAMES THE CAPABILITIES IT NEEDS; UC-034
# Level: release
"""SPEC sections 13 and 5 - the check named tests/test_job_assignment.py, for A JOB GOES ONLY TO A HOLDER OF ITS ROLE, A JOB RUNS ON A
CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL and A ROLE NAMES THE CAPABILITIES IT NEEDS.

For the last two, a job of a role is handed to an agent of the instance's register: MOD-participant-list's participantsOf joins the register
with the connections this browser's settings offer (MOD-prompt-bar's endpointsOffered and sessionsOffered), eligible decides which of them the
job is sent to with the role's capabilities as its need, and MOD-agent-processes' agentDriver starts a fixture coding agent on that connection,
whose arguments name the model it is started with. Reading the text leaves open: "a job is sent to a connection" is read as the participants
eligible admits, each an agent on one connection, since a job's record names that connection's route (MOD-job-ledger).

The cases live in tests/test_job_assignment.md. This file loads them. The product is the fixture of the parallel sprints of tests/parallel_sprints_fixture.py: two teams, each with its own role assignment and its own
running sprint, and the participants alice, dev-a and dev-b. For each job of a case - an item of a team's running sprint - node asks MOD-work-plans' startable, which decides whether a job starts for an item and
to whom it goes, once for each participant of the product on its own, with the role assignment of the job's team (MOD-product-process' holdsRole decides who holds a role in it), and the check compares the
participants the job may go to with the case's, which the case states itself.

Written for ITM-805 by developer-sonnet-j, who built none of the code it checks in MOD-product-process (built by developer-opus-e and without a trailer); of MOD-work-plans' startable it built nothing - developer-sonnet-j's
two commits in src/work-plans are backlogFindings (ITM-817) and teamSprint (ITM-1330), which this check does not run (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
Reading the text leaves open: "hands out jobs" is read as the participants that MOD-work-plans' startable admits for the job's item, since the page offers a job only to those (MOD-implementation-pages,
Interfaces: implement) and a start record names one of them.
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js
from parallel_sprints_fixture import CURRENT, WORKFLOW, prelude

DATA = Path(__file__).with_suffix(".md")
ROOT = Path(__file__).resolve().parents[1]


def sections() -> list[dict]:
    text = DATA.read_text(encoding="utf-8")
    found = []
    for match in re.finditer(r"^## (?P<name>[^\n]+)\n(?P<body>.*?)(?=^## |\Z)", text, re.M | re.S):
        block = re.search(r"^### Case\n\n```json\n(.*?)\n```", match.group("body"), re.M | re.S)
        if not block:
            raise AssertionError(f"missing Case block under {match.group('name')}")
        found.append({"name": match.group("name"), "case": json.loads(block.group(1))})
    if not found:
        raise AssertionError("no cases loaded")
    return found


def of_group(group: str) -> dict:
    chosen = [s for s in sections() if s["case"]["group"] == group]
    if len(chosen) != 1:
        raise AssertionError(f"expected one case of the group {group}, found {len(chosen)}")
    return chosen[0]


def holders(case: dict) -> list:
    """For each job of the case, the participants startable admits for it, asked one at a time under the job's role assignment."""
    texts = {f"docs/role-assignments/{team}.md": text for team, text in case["assignments"].items()}
    return js(prelude(texts) + f"""
      const jobs = {json.dumps(case["jobs"])}; const current = {json.dumps(CURRENT)};
      const states = items.map((item) => ({{ item: item.id, state: 'ready', reason: null, job: null, pullRequest: null }}));
      const held = workPlans.heldItems(sprints, items, architecture, []);
      return jobs.map(({{ team, item }}) => participants.filter((each) => workPlans.startable(item, states,
        {{ workflow, assignment: assignment(team), sprint: sprintAt(current[team]), held, wip: null, participants: [each] }}).startable).map((each) => each.name));""")


# The adapter of the groups model, capability and capability-removed. `input`: the case and the capabilities of its role. The instance's register
# is read with MOD-participant-list's participantSchema and joined (participantsOf) with the connections MOD-prompt-bar's endpointsOffered and
# sessionsOffered give from a store of the case's settings, the fixture Bridge of tests/browser-connections-fixture.mjs answering; each job is
# judged by eligible with the role's capabilities as its need, and, where a connection takes it, MOD-agent-processes' agentDriver starts a fixture
# `claude` on a PATH of its own with that participant, which records its arguments. Only controlled executables run; nothing leaves the fixtures.
ROUTED = r"""
const url = (path) => `file://${ROOT}/${path}`;
const { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } = await import("node:fs");
const { tmpdir } = await import("node:os"), { join } = await import("node:path");
const fixture = await import(url("tests/browser-connections-fixture.mjs")), bar = await import(url("src/prompt-bar/index.mjs"));
const list = await import(url("src/participant-list/index.mjs")), docs = await import(url("src/documents/index.mjs"));
const agents = await import(url("src/agent-processes/index.mjs"));
const { case: c, needs } = input;
const REGISTER = ["# Participants of this instance", "", "| Name | Type | Model |", "|---|---|---|", ...c.register.map((row) => `| ${row.join(" | ")} |`), ""].join("\n");
const bridge = fixture.withBridge(c.bridgeAgents);
let offered;
try { offered = [...bar.endpointsOffered(fixture.storeWith(c.settings)), ...await bar.sessionsOffered(fixture.storeWith(c.settings))]; }
finally { bridge.restore(); }
const participants = list.participantsOf(docs.readDocument(list.participantSchema(), "docs/participants.md", REGISTER), offered);
const AGENT = { name: "claude", installed: true, version: "2.0.0", loggedIn: true,
  install: { macos: "https://example.invalid/", windows: "https://example.invalid/", linux: "https://example.invalid/" } };
async function startedWith(participant) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-job-assignment-")));
  const bin = join(root, "bin"), workdir = join(root, "work"), record = join(root, "argv.json");
  mkdirSync(bin); mkdirSync(workdir);
  const script = join(bin, "claude-fixture.mjs");
  writeFileSync(script, `import { writeFileSync } from "node:fs";\nfor await (const _ of process.stdin) {}\nwriteFileSync(${JSON.stringify(record)}, JSON.stringify(process.argv.slice(2)));\nprocess.stdout.write(JSON.stringify({ type: "result", result: "done" }) + "\\n");\n`);
  writeFileSync(join(bin, "claude"), `#!/bin/sh\nexec '${process.execPath}' '${script}' "$@"\n`, { mode: 0o755 });
  const prior = { PATH: process.env.PATH, CI: process.env.CI, GITHUB_ACTIONS: process.env.GITHUB_ACTIONS, GITLAB_CI: process.env.GITLAB_CI };
  process.env.PATH = bin; delete process.env.CI; delete process.env.GITHUB_ACTIONS; delete process.env.GITLAB_CI;
  try {
    await agents.agentDriver(AGENT, { workdir, keyVariable: null }, participant).send({ prompt: "fixture task", parts: [], output: null, findings: [], previous: null, workdir: null });
    const argv = JSON.parse(readFileSync(record, "utf8"));
    const at = argv.indexOf("--model");
    return at < 0 ? null : argv[at + 1];
  } finally {
    for (const [name, value] of Object.entries(prior)) { if (value === undefined) delete process.env[name]; else process.env[name] = value; }
    rmSync(root, { recursive: true, force: true });
  }
}
const out = [];
for (const agent of c.jobs) {
  const judged = list.eligible(participants.filter((each) => each.name === agent), { capabilities: needs });
  const to = judged.eligible[0] ?? null;
  // A Bridge's coding agent is started by its route's agent; this fixture holds claude alone.
  if (to && !/ agent claude$/.test(to.route ?? "")) throw new Error("the fixture starts claude alone, not " + to.route);
  out.push({ connections: judged.eligible.map((each) => each.route), startedWith: to ? await startedWith(to) : null,
    reasons: judged.leftOut.flatMap((each) => each.reasons) });
}
return out;
"""


def routed(case: dict) -> list:
    """For each job of the case, the connections it is sent to, the model its coding agent is started with and the reasons of those left out."""
    role = next(r for r in WORKFLOW["roles"] if r["name"] == case["role"])
    argument = {"case": case, "needs": role["capabilities"]}
    return js(f"const input = {json.dumps(argument)}; const ROOT = {json.dumps(str(ROOT))};\n{ROUTED}")


class TestJobAssignment(unittest.TestCase):
    # TST-805601 · level: release · module: MOD-work-plans
    # guards: A JOB GOES ONLY TO A HOLDER OF ITS ROLE
    # given: the fixture product of two teams, team1's Developers dev-a, team2's dev-b, and the case teams: ITM-005 of team1's running sprint and ITM-008 of team2's
    # input: startable for each job once for each participant alone, under the role assignment of the job's own team
    # expect: ITM-005 may go to dev-a alone; ITM-008 to dev-b alone: each job goes only to a holder of its role in its team's assignment, and dev-b, a holder in the other team, is not offered team1's job
    def test_each_teams_job_goes_to_the_holder_of_the_role_in_that_teams_assignment(self):
        loaded = of_group("teams")
        self.assertEqual(holders(loaded["case"]), loaded["case"]["expected"])

    # TST-805602 · level: release · module: MOD-work-plans
    # guards: A JOB GOES ONLY TO A HOLDER OF ITS ROLE
    # given: the cases several, other, capable and swapped: team1's assignment giving Developers to dev-a and dev-b; team2's giving them to dev-b alone; to alice, who cannot run tests; and the two teams' holders swapped
    # input: startable for each job once for each participant alone
    # expect: a role held by two participants of a team lets the job go to either, and the other team's job still to its own holder; the assignment decides, not the participant's name or team: swapped, the jobs go to the other participants; a holder without the capabilities the role needs is offered no job, and the other team's job still goes to dev-b; alice, the Product Owner, is offered none
    def test_the_assignment_of_the_job_decides_who_receives_it(self):
        for group in ("several", "other", "capable", "swapped"):
            loaded = of_group(group)
            with self.subTest(case=loaded["name"]):
                self.assertEqual(holders(loaded["case"]), loaded["case"]["expected"])

    # TST-805603 · level: release · module: MOD-work-plans
    # guards: A JOB GOES ONLY TO A HOLDER OF ITS ROLE
    # given: the case teams, and the same product asked for every participant at once: startable with dev-a, dev-b and alice together under team1's assignment
    # input: startable of ITM-005 and of ITM-008 with all participants, and with only the participant that is no holder of the role in the job's team
    # expect: with all participants the jobs start - the assignment has a holder -; with dev-b alone ITM-005 does not start and the reason names the role Developers and team1, with dev-a alone ITM-008 does not start and the reason names team2
    def test_a_job_whose_team_has_no_holder_among_those_asked_does_not_start_and_says_which_team(self):
        got = js(prelude() + f"""
          const states = items.map((item) => ({{ item: item.id, state: 'ready', reason: null, job: null, pullRequest: null }}));
          const held = workPlans.heldItems(sprints, items, architecture, []);
          const current = {json.dumps(CURRENT)};
          const ask = (team, item, who) => workPlans.startable(item, states, {{ workflow, assignment: assignment(team), sprint: sprintAt(current[team]), held, wip: null,
            participants: participants.filter((each) => who.includes(each.name)) }});
          return {{ all: [ask('team1', 'ITM-005', ['alice', 'dev-a', 'dev-b']).startable, ask('team2', 'ITM-008', ['alice', 'dev-a', 'dev-b']).startable],
            wrong: [ask('team1', 'ITM-005', ['dev-b']), ask('team2', 'ITM-008', ['dev-a'])] }};""")
        self.assertEqual(got["all"], [True, True])
        self.assertFalse(got["wrong"][0]["startable"])
        self.assertIn("Developers has no holder in team1", " ".join(got["wrong"][0]["reasons"]))
        self.assertFalse(got["wrong"][1]["startable"])
        self.assertIn("Developers has no holder in team2", " ".join(got["wrong"][1]["reasons"]))

    # TST-20261109601 · level: release · module: MOD-participant-list
    # guards: A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL
    # given: the case model: the register's agents dev-a of model-x and dev-b of model-y, and alice, a person; this browser's one connection, the coding agent claude of the Bridge lab, offering model-x with every capability the role Developers needs
    # input: a job of the role Developers handed to dev-a and one to dev-b, each judged by eligible over the register joined with the browser's connections; the coding agent started by agentDriver on the connection that takes it, a fixture claude recording its arguments
    # expect: dev-a's job is sent to the connection bridge lab agent claude alone and its agent is started with --model model-x; counter-proof: dev-b's job is sent nowhere, its one reason naming the model model-y, and no agent is started
    def test_a_job_runs_on_a_connection_that_offers_its_agents_model_with_that_model(self):
        loaded = of_group("model")
        self.assertEqual(routed(loaded["case"]), loaded["case"]["expected"])

    # TST-20261109602 · level: release · module: MOD-participant-list
    # guards: A ROLE NAMES THE CAPABILITIES IT NEEDS
    # given: the case capability: the agent dev-c of model-z, which two connections offer — the endpoint ep1 with draft text and read the repository, and the coding agent claude of the Bridge lab with run code and tests among its capabilities —; and the case capability-removed, the same without the Bridge's session
    # input: a job of the role Developers, which needs read the repository, write to the repository and run code and tests, handed to dev-c, judged by eligible; the coding agent started by agentDriver on the connection that takes it
    # expect: the job is sent only to bridge lab agent claude, started with --model model-z, the endpoint left out for the capabilities it lacks, run code and tests among them; counter-proof: without the session the job is sent nowhere and the missing capabilities are named
    def test_a_job_of_a_role_goes_only_to_a_connection_with_every_capability_the_role_needs(self):
        for group in ("capability", "capability-removed"):
            loaded = of_group(group)
            with self.subTest(case=loaded["name"]):
                self.assertEqual(routed(loaded["case"]), loaded["case"]["expected"])


if __name__ == "__main__":
    unittest.main()
