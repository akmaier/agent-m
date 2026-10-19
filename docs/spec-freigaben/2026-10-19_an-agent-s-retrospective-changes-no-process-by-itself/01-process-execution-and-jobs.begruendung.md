# 13. Process execution and jobs: an agent's retrospective changes no process by itself

**The change.** `AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF` keeps its name and is reworded: a rule of the
development process — in the process model, the Definition of Done or a participant's instructions — changes only through
a change of the SPEC that a person accepts, never through an agent's retrospective or through instructions kept outside
the repository, where the person cannot read them. Its check adds the job definitions to what a retrospective leaves
byte-identical, and the input of each kind of job, which holds its prompt with its recipes' inputs and nothing else.

**Why.** akmaier, 2026-10-19:
- "I reject them clearly. Any change of the rules would have to go through spec and nothing else. I will not accept any
  change if it is not required to complete the project. Any unnecessary change, I will reject anyway and you do not have
  to present such a proposal."
- "Update AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF with what I just wrote to make it clear. There are no
  scratchpad briefs allowed that are not visible to the user."

The occasion: the Scrum Master briefed its developers from a file in its own scratchpad, outside the repository, and
added the changes its sprint retrospectives recommended to that file as rules, though the current sentence says such a
change "is proposed for a person's acceptance and not applied by the agent".

**One statement.** The rule is one sentence with one subject, the rule of the development process, and one statement of
where it changes; "never through …" names the two ways it does not (`ONE STATEMENT PER REQUIREMENT`).

**What the SPEC already says.** `ONE DEFINITION, THREE DRIVERS` (§6) has the prompts and job definitions exist exactly
once, as data in the repository. It does not say that nothing else may instruct a participant, nor that a retrospective
may change none of them; the reworded sentence says both, and names `ONE DEFINITION, THREE DRIVERS`' data as the only
place instructions live.

**What it leaves out.** "I will not accept any change if it is not required to complete the project" is the accepting
person's criterion when deciding, not a property of the system a test can check (`A RULE IS CHECKABLE`), so it is not
written into the rule.

**Impact list.** Artifacts that name the requirement:
- `docs/use-cases/UC-041-close-a-sprint.md`;
- `docs/architecture/ARC-042-process.md`;
- `tests/test_time_box_close.py`, whose check gains the job definitions and the SPEC change queue;
- `tests/test_job_reading.py`, which gains the check that a job's input holds nothing beyond its prompt and recipes;
- the fixtures `tests/fixtures/flow/agent-m/sprint-01.md` and `tests/fixtures/sprint-02-running/` (ITM-036 and
  `sprint-01.md`), which quote the name;
- the backlog items ITM-619 and ITM-991, the sprint records team1 04–08, 11, 12 and team2 10, and the gate record
  `docs/gates/20261016-0637-retrospective-sprint-planning-9b67.md`, which name it as records.

**What follows once it is accepted.** The two checks are extended by an item, with their counter-proofs.
