# §9: what an agent decides in its role is committed directly; two checks name their module's test file

## 1. The Product Owner may be an agent

**Finding (backlog refinement, 2026-10-01).** The PO made the agent `po-fable` the Product Owner of Agent M
(`docs/process.md`, Roles; the model `scrum-wip` lets the role be filled by "either"). The use cases say the
role is a person's: UC-032 — actor "the person the product assigned to the role that orders the backlog",
precondition "with a person in the ordering role (UC-002)"; UC-002 step 4 — "*Product Owner* — a person, who
orders the backlog"; ARC-006 — `docs/backlog/` is written by "a person, a sprint-close job". The SPEC itself
assigns the role to no kind of participant (`A PROCESS MODEL ORGANISES PEOPLE AND AGENTS`, `A GATE NAMES WHO
DECIDES IT`), but two of its rules decide what an agent's writes are:

- `A GENERATED ARTIFACT IS A PROPOSAL` — "Everything Agent M generates counts as a proposal until a person
  accepts it."
- `A PERSON'S OWN INPUT IS COMMITTED DIRECTLY` — covers a *person* in the role only.

So the question: is what an agent holding the Product Owner role writes — the backlog and its order, a
sprint's selection, its end, a gate's decision — a proposal awaiting a person, or the role's decision?

**Options weighed.**
- (A) *The role's decision* — committed under the agent's name, not shown for acceptance. Consistent with
  `A GATE NAMES WHO DECIDES IT` ("held by a person or an agent as the role allows") and with
  `CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT`, which already let an agent decide and record; the
  records it writes (gate records, sprint records) are evidence by `A RECORD IS EVIDENCE, NOT A PROPOSAL`.
  Needs one new rule, because the backlog, the order and the selection are not records.
- (B) *A proposal awaiting a person* — no SPEC change, but: no acceptance path exists for a backlog order or a
  sprint selection (`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON` names use cases, decisions, modules and
  SPEC changes only), so B needs more rules than A; gates would still be decided by the agent (`A GATE NAMES
  WHO DECIDES IT`), so the role would be half the agent's and half the person's; and the PO's decision to make
  `po-fable` the Product Owner would be void in everything but name.

**Proposed: (A)**, as a new rule `A DECISION OF AN AGENT IN ITS ROLE IS COMMITTED DIRECTLY`, placed after
`A PERSON'S OWN INPUT IS COMMITTED DIRECTLY`, its counterpart for persons. It changes nothing that stays with
persons: SPEC changes, acceptance of use cases, decisions and modules, the release test report, every mail,
signing (`THE BRIDGE IS SIGNED BY ITS PUBLISHER`) and process changes are each bound to a person by a rule of
their own, which the occasion names; and `A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS` still
keeps an agent from deciding on its own work (queue item 6, `docs/process.md`). `A GENERATED ARTIFACT IS A
PROPOSAL` keeps its wording; like `A RECORD IS EVIDENCE, NOT A PROPOSAL`, the new rule names the case it
does not cover. If the PO prefers the exception written into `A GENERATED ARTIFACT IS A PROPOSAL` itself, that
is a second change to the same section.

**Check.** `tests/test_job_assignment.py`, beside `A JOB GOES ONLY TO A HOLDER OF ITS ROLE`, whose counter-proof
it shares: an order from an agent that does not hold the role is refused.

**Impact list** (`A GENERATED ARTIFACT IS A PROPOSAL`, `A PERSON'S OWN INPUT IS COMMITTED DIRECTLY`, the new
name):
- UC-032 — goal, actor, precondition; new alternative flow 1c for an agent in the role; realises the new name.
  Updated in the same commit, open for review.
- UC-002 — step 4: "*Product Owner* — a person or an agent". Updated in the same commit.
- ARC-006 — the table row for `docs/backlog/`: written by "the holder of the role that orders the backlog — a
  person or an agent —, a sprint-close job". Updated in the same commit. Not changed: its sentence that lists
  *backlog items* among the artifacts that are open until an approval record names them — no use case
  realises that (UC-032 commits items as the Product Owner's input); a PO decision, see the return.
- UC-041 — 1a gains one sentence: a closing agent that also holds the deciding role does not pass the merge
  gate on its own review. Updated in the same commit.
- UC-033, UC-034, UC-043 — name the Product Owner without saying person or agent; unchanged.
- MOD-run-engine (`A JOB GOES ONLY TO A HOLDER OF ITS ROLE`, `tests/test_job_assignment.py`) is where the new
  rule is checked; adding it to a module's `realises` waits for acceptance of this entry, as in queue
  2026-10-01 (`ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`).
- MOD-review-core (`A GENERATED ARTIFACT IS A PROPOSAL`), ITM-014 (characterises it) — unchanged: backlog
  files are not among the reviewed kinds the core derives a status for.
- MOD-dashboard-app, the twelve use cases realising `A PERSON'S OWN INPUT IS COMMITTED DIRECTLY` and a comment
  in `docs/assets/review-core.mjs` citing it — its text is unchanged except the check file (part 2).

## 2. Two checks name their module's test file

As in entries 02–04 of this queue: ARC-016 decision 1 moves every check that names
`tests/review-core.test.mjs` into the test file of the module that realises the rule (ARC-020 decision 5).
The source keeps its original text and adds "changed 2026-10-01"; rule and occasion are untouched.

| Requirement | Check before | Check after | Module (`realises`) | Backlog items quoting the old file |
|---|---|---|---|---|
| `A PERSON'S OWN INPUT IS COMMITTED DIRECTLY` | `tests/review-core.test.mjs` | `tests/dashboard-app.test.mjs` | MOD-dashboard-app | — |
| `ADDING A PRODUCT CREATES ITS LAYOUT` | `tests/review-core.test.mjs` | `tests/dashboard-app.test.mjs` | MOD-dashboard-app | — |

`A GENERATED ARTIFACT IS A PROPOSAL`, `A RECORD IS EVIDENCE, NOT A PROPOSAL` and `A REVIEWED ARTIFACT ENTERS
THE DEFAULT BRANCH AS OPEN` belong to MOD-review-core and keep `tests/review-core.test.mjs`. The rest of §9 is
carried over byte for byte.
