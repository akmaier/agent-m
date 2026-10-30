# 13. Process execution and jobs: accepting a use case puts the modules it changes into the backlog

**The change.** A new requirement, `ACCEPTING A USE CASE PUTS THE MODULES IT CHANGES INTO THE BACKLOG`, after `A BACKLOG
ITEM NAMES THE MODULES IT CHANGES`. The rest of the section is as it stands.

**Why.** The release tests of UC-023 found that after an acceptance no list of the affected modules with their items is
shown (finding UC023-S4, TST-739013). akmaier, 2026-10-30: "When I accept the use case, I want the affected modules to be
checked and entered into the backlog as tasks automatically", and, asked whether he meant the acceptance of an
architecture change or of a use case: "I meant UC-008". Today items enter the backlog only on the Product Owner's own click
(UC-032 steps 2-4, 2a), so no text lets an acceptance fill it.

**Design principles** (AGENTS.md §2):
- One responsibility per rule: the rule says what an acceptance adds to the backlog; what an item names stays with `A
  BACKLOG ITEM NAMES WHAT IT REALISES` and `A BACKLOG ITEM NAMES THE MODULES IT CHANGES`. `NO MODULE IS CHECKED AGAINST
  THE USE CASES`, which keeps every test from reading the SPEC's or a use case's text, is not touched: the check this
  rule asks for is a participant's, not a test's.
- Nothing twice: an item not yet done that names the module already stands for it, so no second one is added.
- Nothing the SPEC already says: that the items are written under the accepting person's account is `THE DASHBOARD WRITES
  ONLY ON A PERSON'S CLICK`, and that the click's consequences are Agent M's is `ONE CLICK PER DECISION`; neither is
  repeated. Where the check's participant is named before it is sent is `THE PAGE NAMES WHERE IT SENDS`.
- Adding one of a kind changes nothing of another kind: a model that plans in advance keeps its plan (UC-045); the backlog's
  other sources (UC-032, UC-033) are unchanged.
- No special first case: a new use case's first acceptance and every later acceptance of a change go the same way, one by
  one or several in one click (`SEVERAL FILES ARE ACCEPTED IN ONE CLICK`).

**Impact list.**
- ACCEPTING A USE CASE PUTS THE MODULES IT CHANGES INTO THE BACKLOG: added; named by UC-008, changed in the same commit,
  open for acceptance. Its check `tests/test_backlog_from_acceptance.py` is to be written.
- Architecture to follow once accepted: MOD-review-pages and MOD-approvals (the Accept of a use case starts the check and
  names its participant before sending), MOD-job-catalogue (the kind that checks — `propose-items` or a kind of its own —
  and a writer that runs on the acceptance click), MOD-work-plans (`saveItems`, the items written).

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
