# 11. Architecture and implementation: no reviewing participant of an architecture checks a module against the use cases

**The change.** `NO MODULE IS CHECKED AGAINST THE USE CASES` names whom it binds: the reviewing participants of an
architecture. The rest of the section is as it stands.

**Why.** akmaier, 2026-10-30, wants accepting a use case (UC-008) to check the modules it affects and put them into the
backlog (entry 02). Finding which modules a use case's text changes judges modules against that use case. The rule as it
stands — "No module is checked against the use cases." — forbids that for anyone. In its context it is the last of the
levels of the architecture's review (`THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION`, `EVERY USE CASE IS CHECKED
AGAINST THE ARCHITECTURE`, `A SUBSYSTEM IS CHECKED AGAINST THE SYSTEM`, `A MODULE IS CHECKED AGAINST ITS SUBSYSTEM`): a
reviewer judges a module against its subsystem, never against the use cases, since the architecture is cut by function,
not by use-case step (`THE ARCHITECTURE IS CUT BY FUNCTION, NOT BY USE-CASE STEP`). Narrowed to those reviewers, the rule
keeps that purpose whole and no longer forbids the planning check of entry 02.

**Design principles** (AGENTS.md §2):
- One responsibility per rule: the rule keeps one concern, the levels of the architecture's review.
- Nothing twice: no exception is written into entry 02; the rule's scope is stated once, here.
- Nothing the SPEC already says: `A MODULE IS CHECKED AGAINST ITS SUBSYSTEM` already says what a reviewer checks a module
  against; this rule only bounds what it may not.
- Adding one of a kind changes nothing of another kind: the architecture's review (UC-022, UC-023) is unchanged.
- No special first case: it holds for the first architecture and for every change alike.

**Impact list.**
- NO MODULE IS CHECKED AGAINST THE USE CASES: changed; named by UC-022, UC-023, UC-025, ARC-046,
  `docs/groups/requirements.md` and the fixture `tests/fixtures/requirements-repair/`. Its check is at review; no test
  changes.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
