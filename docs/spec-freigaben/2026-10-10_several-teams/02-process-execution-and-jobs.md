## 13. Process execution and jobs

**A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED** *(PO A. Maier)*
A process model definition can be declared for a product only after Agent M has validated it
without errors.
*Check:* `tests/test_model_validation.py`. Each rule has a definition that breaks it and must be
rejected: a transition naming a phase the model lacks, a verification pair naming a phase the model lacks, a gate
without artifacts or condition, a role without capabilities, a phase without a role, a missing
declaration of whether work is planned or pulled from a backlog. Each book model in the shipped
catalogue must pass.

**A PLAN COVERS THE WHOLE SPECIFICATION** *(PO A. Maier)*
In a model that plans its work in advance, the product's plan contains every accepted requirement
in every phase the model defines.
*Check:* `tests/test_plan_coverage.py`. For a fixture product with N accepted requirements and a
V-model definition of P phases, the derived plan has exactly N × P entries. Accepting one more
requirement adds P entries.

**A PLANNED MODEL IMPLEMENTS ITS IMPLEMENTATION PLAN** *(PO A. Maier)*
In a model that plans its work in advance, an implementation job starts only for a step of the product's implementation
plan.
*Check:* `tests/test_job_preconditions.py` — in a V-model fixture, a job for work that no step of the plan names does not
start and says so; counter-proof: a job for a step of the plan starts.

**AN IMPLEMENTATION PLAN ASSEMBLES THE SYSTEM FROM ITS MODULES** *(PO A. Maier; Vibe Coding, ch. 6)*
A product's implementation plan orders the modules of each subsystem by the interfaces they use, then the integration of
each subsystem, then the system.
*Check:* `tests/test_implementation_plan.py` — a drafted plan that leaves a module, a subsystem or the system without a step,
or orders a module before one whose interface it uses, is refused and the gap named; counter-proof: a plan in the order of
the interfaces is accepted.

**A PLAN STEP NAMES THE TESTS OF ITS LEVEL** *(PO A. Maier; Vibe Coding, ch. 6)*
Every step of an implementation plan names the tests of its level: unit tests for a module, component tests for a
subsystem, system and release tests for the system.
*Check:* `tests/test_implementation_plan.py` — a step without the tests of its level, or with tests of another level, is
refused; counter-proof: a step naming the tests of its level is accepted.

**THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY** *(PO A. Maier)*
A product's implementation plan is kept as Markdown under `docs/plan/` of the product's own repository.
*Check:* `tests/test_plan_layout.py` — a fixture product's plan is read from `docs/plan/`; counter-proof: a plan written
anywhere else is not found.

**AGILE IMPLEMENTATION STARTS FROM THE BACKLOG** *(PO A. Maier)*
In a model that pulls its work from a backlog, every implementation job implements one item of the
product's backlog.
*Check:* `tests/test_job_from_backlog.py`. Starting an implementation job without an item is refused
for a Scrum and a Kanban fixture.

**THE BACKLOG LIVES IN THE PRODUCT REPOSITORY** *(PO A. Maier)*
A product's backlog is kept as Markdown under `docs/backlog/` of the product's own repository.
*Check:* `tests/test_backlog_layout.py`

**A BACKLOG ITEM NAMES WHAT IT REALISES** *(PO A. Maier)*
Every backlog item names at least one requirement or use case that it realises.
*Check:* `tests/test_backlog_item_fields.py`

**A BACKLOG ITEM NAMES THE MODULES IT CHANGES** *(PO A. Maier)*
Every backlog item names the modules of the architecture that its implementation changes.
*Check:* `tests/test_backlog_item_fields.py` — an item that names no module, or a module the architecture does not
describe, is reported; counter-proof: an item naming modules the architecture describes passes.

**NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED** *(PO A. Maier)*
An implementation job starts for a backlog item only when every requirement and use case the item
names is accepted.
*Check:* `tests/test_job_preconditions.py`. An item that names one open proposal cannot be started.
The same item can be started after an approval record names the proposal's text.

**NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT** *(Vibe Coding, ch. 7 §4)*
When a product's model sets a work-in-progress limit, no implementation job starts while the number
of items in progress under the job's role assignment has reached that limit.
*Check:* `tests/test_wip_limit.py`. With limit 2 and two items in progress, a third start is refused
with the limit named. With one of the two done, the start succeeds. With two teams, a team's two items in progress do not
refuse a start by the other team.

**A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT** *(Vibe Coding, ch. 7 §5; PO A. Maier)*
When a product's model works in sprints, a team's implementation jobs start only for items selected for
that team's current sprint.
*Check:* `tests/test_time_box_selection.py` — counter-proof: with two teams, an item selected for the other team's sprint
does not start.

**EVERY TEAM RUNS SPRINTS OF ITS OWN** *(PO A. Maier)*
Each team of a product plans, starts and closes sprints of its own, which may run at the same time as the sprints of the
product's other teams.
*Check:* `tests/test_parallel_sprints.py` — three fixture teams run sprints at the same time, and each closes its own;
counter-proof: closing one leaves the others running.

**A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH** *(PO A. Maier)*
An item selected for a team's sprint is held by that sprint until its change is merged into the default branch or the
item returns to the backlog.
*Check:* `tests/test_parallel_sprints.py` — a done item of a closed sprint whose increment is not merged is still held;
after the merge into the default branch it is not; counter-proof: an unfinished item sent back to the backlog is no
longer held.

**SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES** *(PO A. Maier)*
Of two items held by sprints of different teams, neither changes a module that the other changes or uses through the
interfaces its modules' files name.
*Check:* `tests/test_parallel_sprints.py` — with module A using module B, a selection is refused, naming the other team's
sprint, its held item and the module, when its item changes a module the held item changes, when it changes B while the
held item changes A, when it changes A while the held item changes B, and when it selects the held item itself;
counter-proof: an item whose modules neither change nor use those of the held item is accepted.

**SPRINT PLANNING SHOWS WHAT THE OTHER TEAMS' SPRINTS HOLD** *(PO A. Maier)*
When a team plans or changes a sprint, every item held by another team's sprint is listed with that sprint, the modules
the item changes and the modules they use.
*Check:* `tests/test_parallel_sprints.py` — the planning of a fixture team lists the items another team's sprint holds,
with their sprint and modules, and marks every item they keep from being selected with that sprint, item and module;
counter-proof: while no other team's sprint holds an item, nothing is listed and no item is marked.

**A JOB GOES ONLY TO A HOLDER OF ITS ROLE** *(PO A. Maier)*
A job is handed only to a participant that the job's role assignment assigns to the role the job belongs to.
*Check:* `tests/test_job_assignment.py` — in a Kanban fixture, a job goes to any of the role assignment's three Developers;
counter-proof: with two teams, a job of one team is not handed to a Developer that only the other team assigns.

**A JOB STOPS AT EVERY GATE** *(PO A. Maier; Vibe Coding, ch. 11 §8)*
A job that reaches a gate of the product's workflow waits in the state *waiting at a gate* until the
decision of that gate's decider is recorded.
*Check:* `tests/test_job_gate.py`. A fixture job reaching a gate does not proceed while no decision of
the gate's decider is recorded, nor on a record by anyone else. It proceeds on the decider's record — a
person's, an agent's or a CI check's, as the gate names.

**A GATE NAMES WHO DECIDES IT** *(PO A. Maier)*
Every gate names its decider: a role of the model, held by a person or an agent as the role allows, or
an automated check whose result decides.
*Check:* `tests/test_model_validation.py` — a gate without a decider is rejected; counter-proof: a gate
decided by a role and one decided by a named CI check both pass validation.

**A GATE IS DECIDED WITHIN THE JOB'S ROLE ASSIGNMENT** *(PO A. Maier)*
A gate that a job reaches is passed only by a decision of a holder of the deciding role in the job's role assignment.
*Check:* `tests/test_job_gate.py` — in a V-model fixture with three Reviewers, the record of any of them other than the
author passes the gate; counter-proof: with two teams, a record by the other team's Product Owner leaves the job waiting.

**A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS** *(PO A. Maier; Vibe Coding, ch. 12 §2, ch. 13 §6)*
A gate's decision recorded by the participant that did the work the gate checks does not pass it.
*Check:* `tests/test_job_gate.py` — the implementing agent's own record leaves the job waiting;
counter-proof: a second agent holding the deciding role passes it.

**A JOB IS RECORDED IN ITS PRODUCT REPOSITORY** *(PO A. Maier)*
Every job has a record `docs/jobs/JOB-<id>.md` in the repository of the product it works on — the
instance's own repository for a job of the instance — naming its inputs, participant, runtime and
start, and, once it has ended, its end state and results.
*Check:* `tests/test_job_record.py`

**A JOB IDENTIFIER IS NEVER REUSED** *(PO A. Maier)*
No two jobs of a product share an identifier, a retried job included.
*Check:* `tests/test_job_record.py`

**PROGRESS AND JOB STATE ARE DERIVED, NOT STORED** *(PO A. Maier)*
Everything the process dashboard and the job dashboard show is computed from the repositories and
the runtimes. Neither dashboard stores a status of its own.
*Check:* `tests/test_progress_derived.py`. Deleting all local storage and reloading shows the same
progress and the same job states.

**PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE** *(PO A. Maier; Vibe Coding, ch. 15 §2–3)*
The process dashboard shows a product's progress in the measure its model definition names: plan
entries per phase against the plan, remaining items per time box, or items per state over time.
*Check:* `tests/test_progress_view.py`. A V-model, a Scrum and a Kanban fixture each render their
declared measure. A definition naming an unknown measure fails validation.

**ONE DASHBOARD SHOWS EVERY JOB** *(PO A. Maier)*
The job dashboard of an instance lists every job of every product it manages. Each job appears with
its state (queued, running, waiting at a gate, done, failed, cancelled or ended without record), its
participant, where it runs, what it works on, its elapsed time and a link to its log.
*Check:* `tests/test_job_dashboard.py`. Fixture jobs in two products and three runtimes appear in
one list. A job state outside the seven is rejected.

**A CANCELLED JOB WRITES NOTHING MORE** *(PO A. Maier)*
After a person cancels a job, the job commits nothing further to any repository.
*Check:* `tests/test_job_cancel.py`. A fixture job cancelled between its test commit and its
implementation commit leaves the branch at the test commit.

**NO COST IS GUESSED** *(PO A. Maier; Vibe Coding, ch. 15 §4)*
A job shows a cost only when its runtime reports one, or when the runtime reports usage and the
participant declares a price for it. In every other case the cost is shown as unknown.
*Check:* `tests/test_job_cost.py`. A job whose runtime reports neither cost nor usage shows
"unknown", never zero.

**A PRODUCT DECLARES ITS DEFINITION OF DONE** *(PO A. Maier; Vibe Coding, ch. 7 §5, after the Scrum Guide)*
A product declares, in a data file of its own repository, the conditions an implementation job's
pull request must meet before it counts as done.
*Check:* `tests/test_definition_of_done.py`

**THE DEFAULT DEFINITION OF DONE IS THE JOB RULES** *(PO A. Maier)*
Without a declaration, a pull request is done when its CI run is green, the job's first commit held
only failing tests — or, for a refactoring job, CI was green on every commit and no expected result
changed —, it changes only the job's modules, every new test names the requirement it guards and the
module it exercises, and every gate the workflow places before the merge is recorded.
*Check:* `tests/test_definition_of_done.py`

**A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS** *(PO A. Maier)*
An implementation job's pull request is merged only when every condition of the product's Definition
of Done holds, checked in the product's CI.
*Check:* `tests/test_definition_of_done.py` — a pull request missing one condition is not mergeable;
counter-proof: with all conditions met it is.

**A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT** *(Vibe Coding, ch. 7 §5; PO A. Maier)*
A sprint of a product is closed only after a review of its increment is recorded: what was done,
who took part, and the feedback, which enters the backlog as items.
*Check:* `tests/test_time_box_close.py`

**A SPRINT ENDS WITH A RETROSPECTIVE** *(Vibe Coding, ch. 7 §5; PO A. Maier)*
A sprint of a product is closed only after its retrospective is recorded: what the team — people
and agents — will change in how it works.
*Check:* `tests/test_time_box_close.py`

**A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN** *(PO A. Maier)*
A product may give a phase or a sprint a branch of its own, into which
its work is merged; merging that branch into the default branch is then the gate at its end, decided
by the role the model names for that gate — in Scrum the Product Owner, after the review of the
increment.
*Check:* `tests/test_phase_branch.py`

**WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET** *(PO A. Maier)*
Without a branch for the current phase or sprint, the work of every job is merged into the default
branch.
*Check:* `tests/test_phase_branch.py`

**A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION** *(PO A. Maier)*
A person can start one run over any selection of the product's accepted work — one module, several or
all, or, in a model that works from a backlog, backlog items — and Agent M carries it out as jobs in the
phases, order, roles and gates of the product's declared process model.
*Check:* `tests/test_process_run.py` — a V-model fixture with three accepted modules yields, from one
start, the jobs of every phase for all three in the model's order.

**A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS** *(PO A. Maier)*
Within a run, each job starts by itself as soon as the jobs it depends on are done, until the run is
finished, waits at a gate its model gives to a person, or reaches one of its limits.
*Check:* `tests/test_process_run.py` — a fixture run of five jobs without a person's gate needs one start
and no further click; counter-proof: with a gate decided by a person, it waits there and nowhere else.

**A RUN FOLLOWS THE MODULES' INTERFACES** *(PO A. Maier)*
Within a run, a module is implemented only after every module whose interfaces it uses.
*Check:* `tests/test_process_run.py` — for modules A → B → C and D, C starts after B and B after A, while D
runs alongside; counter-proof: a cycle in the interfaces is refused before the run starts, and named.

**A RUN SETS UP CI BEFORE IT IMPLEMENTS** *(PO A. Maier)*
A run whose product has no CI configuration generated from its test schedule creates it before its first
implementation job.
*Check:* `tests/test_process_run.py`

**A RUN HAS LIMITS FIXED AT ITS START** *(PO A. Maier)*
Before a run starts, it states how many jobs may run at once, its cost limit and its correction-round
limit, and it stops starting jobs when one of them is reached.
*Check:* `tests/test_process_run.py` — a run whose reported cost reaches its limit starts no further job
and says why; counter-proof: below the limit it continues.

**A RUN IS A JOB THAT NAMES ITS JOBS** *(PO A. Maier)*
A run is recorded as a job whose record lists every job it started, and each of those jobs names the run.
*Check:* `tests/test_job_record.py`

**A RUN ENDS WITH THE VALIDATION OF ITS MODULES** *(PO A. Maier)*
When a run ends, the dashboard shows for its selection what each module realises, which code and tests
belong to it, and every gap.
*Check:* `tests/test_process_run.py`

**CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT** *(PO A. Maier)*
The Product Owner may assign closing a sprint — its review, its retrospective and the decisions on its
unfinished items — to a participant of the product, a person or an agent.
*Check:* `tests/test_time_box_close.py` — a sprint whose close is assigned to an agent fixture is closed
with a review and a retrospective recorded by that agent.

**A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF** *(PO A. Maier)*
When closing a sprint is assigned to an agent, its job starts by itself when the sprint's time box ends or, in a
sprint without one, when every selected item is done.
*Check:* `tests/test_time_box_close.py`

**AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM** *(PO A. Maier)*
A review recorded by an agent names the sources of its feedback — issues, mails, job records, test
results — and states that no stakeholder took part unless one did.
*Check:* `tests/test_time_box_close.py` — a review by an agent without stakeholder input says so; counter-
proof: a review listing a stakeholder names where their feedback is recorded.

**AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF** *(PO A. Maier)*
A change to the process model, the Definition of Done or a participant's instructions that an agent's
retrospective recommends is proposed for a person's acceptance and not applied by the agent.
*Check:* `tests/test_time_box_close.py` — after an agent's retrospective, the model, the Definition of Done
and the participants are byte-identical, and the proposed changes are open for acceptance.
