# 3. Requirements: no history

**The change.** 16 occasions removed; every source keeps who or what decided, without date or edit note. Every other rule and check is carried over byte for byte.

**Changed in this section:**
- `A REQUIREMENT HAS FIVE FIELDS` removed — the name is not reused.
- `A REQUIREMENT HAS FOUR FIELDS` — replaces `A REQUIREMENT HAS FIVE FIELDS`: no date, no occasion.

**Why.** The SPEC states only what holds now; its history is in git. Why a rule exists is recorded with the decision that accepted it, not beside the rule. The SPEC no longer cites SOFTWARE_MAINTENANCE.md: Agent M replaces it.

**Impact list.**
- `A REQUIREMENT HAS FIVE FIELDS`: MOD-artifacts, UC-005, UC-018; backlog: `docs/backlog/ITM-009-requirement-format-and-checks.md`, `docs/backlog/ITM-127-a-source-named-as-written-is-no-error.md`, `docs/backlog/ITM-144-release-tests-of-sprint-02-strand-c.md`, `docs/backlog/sprints/sprint-01.md`; tests: `tests/artifacts-checks.test.mjs`, `tests/fixtures/flow/agent-m/sprint-01.md`, `tests/release-sprint-02-c-artifacts.test.mjs`, `tests/test_requirement_fields.py`; code: `docs/assets/artifacts/requirements.mjs`.
