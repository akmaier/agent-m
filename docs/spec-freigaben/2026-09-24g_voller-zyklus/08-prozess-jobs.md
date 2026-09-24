## 13. Process execution and jobs

**A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED** *(PO A. Maier, 2026-09-24)*
A process model definition can be declared for a product only after Agent M has validated it
without errors.
*Occasion:* PO, 2026-09-24: "we need to be able to configure process models". Once readers write
their own definitions (`THE CATALOGUE IS DATA`), a broken one, such as a gate that checks an
artifact no phase produces, would otherwise surface only when a job reaches that gate.
*Check:* `tests/test_model_validation.py`. Each rule has a definition that breaks it and must be
rejected: an unknown phase in the order, a verification pair naming a phase the model lacks, a gate
without artifacts or condition, a role without capabilities, a phase without a role, a missing
declaration of whether work is planned or pulled from a backlog. Each book model in the shipped
catalogue must pass.

**A PLAN COVERS THE WHOLE SPECIFICATION** *(PO A. Maier, 2026-09-24)*
In a model that plans its work in advance, the product's plan contains every accepted requirement
in every phase the model defines.
*Occasion:* PO, 2026-09-24: "V-Model: implement entire spec". Plan-driven models define most of the
work in advance, and progress is measured against that plan (Vibe Coding, ch. 6 §2). A requirement
missing from the plan is never designed, built or verified, and nobody notices.
*Check:* `tests/test_plan_coverage.py`. For a fixture product with N accepted requirements and a
V-model definition of P phases, the derived plan has exactly N × P entries. Accepting one more
requirement adds P entries.

**AGILE IMPLEMENTATION STARTS FROM THE BACKLOG** *(PO A. Maier, 2026-09-24)*
In a model that pulls its work from a backlog, every implementation job implements one item of the
product's backlog.
*Occasion:* PO, 2026-09-24: "agile methods need backlogs". The backlog is the synchronisation
artifact that stops parallel agents from duplicating or contradicting each other's work (Vibe Coding,
ch. 7 §5).
*Check:* `tests/test_job_from_backlog.py`. Starting an implementation job without an item is refused
for a Scrum and a Kanban fixture.

**THE BACKLOG LIVES IN THE PRODUCT REPOSITORY** *(PO A. Maier, 2026-09-24)*
A product's backlog is kept as Markdown under `docs/backlog/` of the product's own repository.
*Occasion:* the backlog is an artifact of the product. Kept anywhere else, it would be lost when
Agent M is removed (`THE PRODUCT REPOSITORY IS SELF-SUFFICIENT`), and it could not be versioned
alongside the code it describes.
*Check:* `tests/test_backlog_layout.py`

**A BACKLOG ITEM NAMES WHAT IT REALISES** *(PO A. Maier, 2026-09-24)*
Every backlog item names at least one requirement or use case that it realises.
*Occasion:* an item that realises nothing is either a missing requirement or work nobody asked for.
This rule applies `EVERY ARTIFACT NAMES ITS ORIGIN` to the backlog. It also makes the progress of
a requirement readable from its items.
*Check:* `tests/test_backlog_item_fields.py`

**NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED** *(PO A. Maier, 2026-09-24)*
An implementation job starts for a backlog item only when every requirement and use case the item
names is accepted.
*Occasion:* PO, 2026-09-24: "issues need to be transferable into the backlog". A change request may
enter the backlog early so that it is not lost. It still goes through the specification first
(`EVOLUTION ENTERS THROUGH THE SPECIFICATION`). This rule is what makes it wait.
*Check:* `tests/test_job_preconditions.py`. An item that names one open proposal cannot be started.
The same item can be started after an approval record names the proposal's text.

**NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT** *(Vibe Coding, ch. 7 §4)*
When a product's model sets a work-in-progress limit, no implementation job starts while the number
of the product's items in progress has reached that limit.
*Occasion:* the book's pull rule: new work is pulled only when active work is below the limit. With
agents, spawning is cheap, so the limit protects review capacity and budget instead of headcount
(ch. 7 §4). An item waiting for review counts as in progress.
*Check:* `tests/test_wip_limit.py`. With limit 2 and two items in progress, a third start is refused
with the limit named. With one of the two done, the start succeeds.

**A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT** *(Vibe Coding, ch. 7 §5)*
When a product's model works in time boxes, implementation jobs start only for items selected for
the current time box.
*Occasion:* in Scrum, sprint planning selects a subset of the product backlog into the sprint
backlog, and the team works from that (ch. 7 §5). The process repository runs its own sprints the
same way: sprint scope is fixed at planning (`SOFTWARE_MAINTENANCE.md`, phase 2).
*Check:* `tests/test_time_box_selection.py`

**A JOB GOES ONLY TO A HOLDER OF ITS ROLE** *(PO A. Maier, 2026-09-24)*
A job is handed only to a participant that the product has assigned to the role the job belongs to.
*Occasion:* the process model organises the people and agents of a product
(`A PROCESS MODEL ORGANISES PEOPLE AND AGENTS`). This holds only if the jobs follow the roles, so
that a participant that was never assigned as a Developer is never given code to write.
*Check:* `tests/test_job_assignment.py`

**A JOB STOPS AT EVERY GATE** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 11 §8)*
A job that reaches a gate of the product's workflow waits in the state *waiting for a person* until
a person's decision at that gate is recorded.
*Occasion:* the book calls this human-in-the-loop: the agent pauses at a high-impact checkpoint and
asks a person (ch. 11 §8). Gates come from the model and from process requirements
(`A PROCESS REQUIREMENT ADDS TO THE MODEL`). The merge of a pull request is not one of these gates: it
is decided by the holder of the review role, who may be an agent (`A MERGE IS DECIDED BY THE REVIEW
ROLE`).
*Check:* `tests/test_job_gate.py`. A fixture job reaching a gate does not proceed while no gate
record exists. It does not proceed on a record written by the job's own participant when that
participant is not a person. It proceeds once a person's record exists.

**PROGRESS AND JOB STATE ARE DERIVED, NOT STORED** *(PO A. Maier, 2026-09-24)*
Everything the process dashboard and the job dashboard show is computed from the repositories and
the runtimes. Neither dashboard stores a status of its own.
*Occasion:* a stored status drifts from what it describes (`STATUS IS DERIVED FROM THE RECORDS`,
`THE TRACEABILITY MATRIX IS DERIVED`). There is also no server to keep one (`NO SERVER`). An item is
in progress because a job for it is running or a pull request for it is open, not because a field
says so.
*Check:* `tests/test_progress_derived.py`. Deleting all local storage and reloading shows the same
progress and the same job states.

**PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 15 §2–3)*
The process dashboard shows a product's progress in the measure its model definition names: plan
entries per phase against the plan, remaining items per time box, or items per state over time.
*Occasion:* PO, 2026-09-24: "the software processes need dash boards to check the progress".
Software progress is intangible, and reporting exists so that drift is seen early enough to act on
(ch. 15 §2). A V-model product and a Kanban product have no common measure of "done". Each is shown
in the one its model defines.
*Check:* `tests/test_progress_view.py`. A V-model, a Scrum and a Kanban fixture each render their
declared measure. A definition naming an unknown measure fails validation.

**ONE DASHBOARD SHOWS EVERY JOB** *(PO A. Maier, 2026-09-24)*
The job dashboard of an instance lists every job of every product it manages. Each job appears with
its state (queued, running, waiting for a person, done, failed or cancelled), its participant, where
it runs, what it works on, its elapsed time and a link to its log.
*Occasion:* PO, 2026-09-24: "There should be dashboard that shows all running stages which allows
to inspect their status". Jobs run in several places at once: CI, a CLI agent, a sandbox. Without
one view, nobody knows what is running. The book's human-above-the-loop oversight also needs one
place to watch from (ch. 11 §8).
*Check:* `tests/test_job_dashboard.py`. Fixture jobs in two products and three runtimes appear in
one list. A job state outside the six is rejected.

**A CANCELLED JOB WRITES NOTHING MORE** *(PO A. Maier, 2026-09-24)*
After a person cancels a job, the job commits nothing further to any repository.
*Occasion:* a cancel that lets the job finish its push is not a cancel, and the person believes the
work stopped (compare `A CLEAR IS A REAL CLEAR`).
*Check:* `tests/test_job_cancel.py`. A fixture job cancelled between its test commit and its
implementation commit leaves the branch at the test commit.

**NO COST IS GUESSED** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 15 §4)*
A job shows a cost only when its runtime reports one, or when the runtime reports usage and the
participant declares a price for it. In every other case the cost is shown as unknown.
*Occasion:* PO's draft: "cost where known". The book warns that a precise-looking number can hide
weak inputs ("Radosophie", ch. 15 §4). An estimated cost shown beside measured ones reads as
measured.
*Check:* `tests/test_job_cost.py`. A job whose runtime reports neither cost nor usage shows
"unknown", never zero.

**A MERGE IS DECIDED BY THE REVIEW ROLE** *(PO A. Maier, 2026-09-24)*
The pull request of an implementation job is merged by the holder of the model's review role — in
Scrum the Scrum Master — who may be a person or an agent.
*Occasion:* PO, 2026-09-24: "The review gate is the scrum master; it can be human or an agent." The
gate before merge belongs to a role, like every other gate, so that the process model — not the
implementing job — decides who merges.
*Check:* `tests/test_job_gate.py` — a merge by a participant not holding the review role is refused;
counter-proof: by its holder it proceeds.

**A PHASE MAY HAVE A BRANCH OF ITS OWN** *(PO A. Maier, 2026-09-24)*
A product may assign a phase — a sprint, for example — a branch of its own, into which the phase's
work is merged; merging that branch into the default branch is then the gate at the end of the
phase.
*Occasion:* PO, 2026-09-24: "an entire scrum phase can be assigned an additional branch in git; then
the merge is the gate at the end of the phase, but this is optional." It lets a team review a whole
sprint's result at once, the way the sprint review does (ch. 7 §5).
*Check:* `tests/test_phase_branch.py`

**WORK MERGES INTO THE DEFAULT BRANCH UNLESS A PHASE BRANCH IS SET** *(PO A. Maier, 2026-09-24)*
Without a phase branch, the work of every job is merged into the default branch.
*Occasion:* PO, 2026-09-24: "it should be main by default." A phase branch is extra ceremony that a
small product does not need.
*Check:* `tests/test_phase_branch.py`
