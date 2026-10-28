# 13. Process execution and jobs: a request in the prompt bar is done as a deviation from the process

**The change.** Three new requirements, after `A JOB GOES ONLY TO A HOLDER OF ITS ROLE`:
- `A REQUEST IN THE PROMPT BAR IS DONE AS A DEVIATION FROM THE PROCESS` — a job the bar spawns at a person's request is
  done by the endpoint or CLI session the person chose, whatever the rules on the origin of a job in a plan or backlog, on
  a sprint's selection, on the work-in-progress limit, on role assignments and on gates would require of it.
- `A DEVIATION FROM THE PROCESS DECIDES NOTHING` — such a job decides no gate, closes no sprint and merges no pull request.
- `A DEVIATION FROM THE PROCESS NAMES WHO ASKED FOR IT` — its record names the deviation with the person who asked.

**Why.** akmaier, 2026-10-28: "Option B is better for our case. We need to allow deviation. The team stuff is only for
working in scrum. We don't need to work scrum for tiny fixes." Earlier: "Whatever I say to nemotron should be executable.
The open page is merely for providing context, not to restrict abilities." and "I want it to be able to edit, but not
approve of course." The occasion: JOB-20261027-1854-ab8c, a request to Nemotron to implement ITM-1177 and open a pull
request, ended `not run: implement — its result does not wait for a person, so it is started from the dashboard, by its
start rules, for a holder of its role`.

**What forbids it today, read against the texts.**
- `AGILE IMPLEMENTATION STARTS FROM THE BACKLOG` — "every implementation job implements one item": forbids a code change
  without an item. Not in the way of ITM-1177, in the way of a tiny fix.
- `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT` — binds "a team's implementation jobs"; a job of the person is no
  team's, so the sentence alone does not forbid it. MOD-work-plans' `startable` and MOD-prompt-bar apply it to every
  hand-over on an item.
- `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT` — counts "under the job's role assignment"; a job without one is left
  undefined by the sentence; the architecture applies the item's team's assignment.
- `A JOB GOES ONLY TO A HOLDER OF ITS ROLE` with `THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS
  ARE` ("holds no role") — forbids it: the endpoint may receive no job that belongs to a role.
- `A JOB STOPS AT EVERY GATE` with `A GATE IS DECIDED WITHIN THE JOB'S ROLE ASSIGNMENT` — a job without a role assignment
  at a gate would wait for ever.
- `NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED` — forbids it only for an item that names an open proposal; not for
  ITM-1177 as long as what it realises is accepted.
- UC-049 4a.2 ("the job goes to that participant, never to the endpoint itself") and 4f ("A hand-over of any other kind is
  not run there"), MOD-workflow-entries' `onRecordsChanged` and MOD-prompt-bar's hand-over: forbid it outright; the code
  is `src/workflow-entries/product.mjs`, `handedOver`.

**Design** (AGENTS.md §2; book ch. 7, 10 §3, 12 §5, §10):
- *One general sentence, not exceptions in each rule* (Nothing twice; Nothing the SPEC already says). The new sentence
  names the kinds of rule it sets aside — origin in a plan or backlog, a sprint's selection, the work-in-progress limit,
  role assignments, gates — and leaves their texts as they are, since each still holds for every job of the workflow.
- *Keep what is not in the person's way.* Every rule on what a job produces and how it reaches the default branch stays:
  `NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED` (an item names only accepted requirements and use cases — acceptance
  stays with akmaier, AGENTS.md §2), `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`, the refactoring rules, `AN
  IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` (a change without an item names its modules in the hand-over), `CODE
  ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI`, `A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF
  DONE HOLDS`, the chapters a job receives, `EVERY MODEL READS AGENT M'S AGENTS.MD FIRST`, `NO MODEL READS A
  CREDENTIAL`, the restricted sources, and the capabilities a kind needs (`THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE
  BOUND AS PARTICIPANTS ARE` is unchanged).
- *Edit, never approve* (ch. 12 §10: the agent proposes through a pull request, a person merges). Acceptance is already
  the person's commit (`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`), so the second sentence names only what the SPEC
  does not yet say: a deviation decides no gate, closes no sprint and merges no pull request. CI still gates the merge
  (ch. 12 §5).
- *One responsibility per rule*: what may start, what it may not decide, and what its record says are three sentences.
- *No special first case*: the deviation holds for every job the bar spawns, an endpoint's or a CLI session's, with an
  item or without, the conversation's own job on GitHub Actions included.
- *Least astonishment*: a deviation's pull request goes into the default branch. `WORK MERGES INTO THE DEFAULT BRANCH
  UNLESS A BRANCH IS SET` already gives that, since a deviation is in no phase and no sprint; nothing is added for it.

**A sprint that holds the same item.** Allowed (UC-049 4g). The deviation runs; it is no job of the team. While it runs,
the item is *in progress* and counts towards that team's work-in-progress limit, as every job on an item does
(MOD-work-plans' item states). Its pull request goes into the default branch, so its merge makes the item *done* and ends
the sprint's hold (`A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH`); a team job on the item no longer
starts, since the item is done. A team job already running goes on; the person who merges takes one pull request and
closes the other.

**Consequences accepted.**
- A gate of the product's workflow — one a process requirement adds included — does not stop a deviation; the person's
  merge is the only check after CI and the Definition of Done.
- What the teams' sprints hold is not checked against a deviation: it may change a module that a sprint's item changes
  or uses; the later pull request then meets the conflict at its merge.
- While UC-049 is open after this change, ITM-1177, which realises UC-049, cannot start by `NOTHING IS IMPLEMENTED BEFORE
  IT IS ACCEPTED` until UC-049 is accepted again.

**Impact list.**
- Requirements: the three above, new. Checks: `tests/prompt-bar-deviation.test.mjs` (new), `tests/test_job_record.py`.
  Read with them, unchanged: `AGILE IMPLEMENTATION STARTS FROM THE BACKLOG`, `A PLANNED MODEL IMPLEMENTS ITS
  IMPLEMENTATION PLAN`, `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT`, `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR
  IT`, `A JOB GOES ONLY TO A HOLDER OF ITS ROLE`, `A JOB STOPS AT EVERY GATE`, `A GATE IS DECIDED WITHIN THE JOB'S ROLE
  ASSIGNMENT`, `THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE`; their checks start jobs from
  the dashboard and stay valid.
- Use cases: UC-049 (realises the three; 4a.2, 4a.3, 4a.5, 4f, the new 4g, the postcondition), changed in the same commit,
  open for acceptance. UC-024, UC-032 and UC-034 are unchanged: they describe the workflow's jobs.
- Architecture, changed after acceptance (`ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES`):
  - MOD-workflow-entries, `onRecordsChanged`/`onDispatch`: a hand-over in the same run is run for every kind but the
    conversation's own and the kinds that decide a gate or close a sprint, without asking `review: person` or whether it
    works on an item; a kind that works in a checkout is run in the job's checkout with MOD-checkout-tools' tools and
    `checkoutPrompt`; its context holds no gate. Code: `src/workflow-entries/product.mjs`, `handedOver`.
  - MOD-prompt-bar, the hand-over: queued for the endpoint or CLI session itself, never for a participant of the list;
    `startable` and `holdsRole` are not asked; only the acceptance of what an item names, the kind's own preconditions and
    the refusal of a deciding kind keep it from starting.
  - MOD-job-ledger: the start record's field for the deviation and the person who asked.
  - MOD-runtimes, `branch-and-pull-request`: for a deviation, the pull request goes into the default branch; it never
    merges, as already stated.
  - MOD-job-runner, `handOverParams`: the `MOD-` identifiers a hand-over names become the job's `modules`.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
