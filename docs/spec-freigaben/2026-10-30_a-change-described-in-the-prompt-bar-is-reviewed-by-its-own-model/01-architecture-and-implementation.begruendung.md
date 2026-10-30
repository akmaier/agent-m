# 11. Architecture and implementation: a change described in the prompt bar is reviewed by its own model

**The change.** `NO REVIEWER IS THE DRAFTER` no longer binds the review of a change described in the prompt bar; its
check gains that counter-proof. The rest of the section is as it stands.

**Why.** The release tests of UC-023 found that a change described in the prompt bar is checked by no reviewing
participant (finding UC023-S3, TST-739011; gate `docs/gates/20261030-0753-development-release-testing-c739.md`): the bar,
the one route to *Describe the change*, offers one participant and prepares the change with no reviewer, so
`AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT` does not hold there. akmaier, 2026-10-30: "In case of a change
from the prompt bar, the review is performed by the prompt bar model", and, asked whether another model the bar offers or
the same one: "The same model". The bar's model drafts the change it hands over (UC-049 4a.1), so its review is a review
by the drafter, which the rule forbade.

**Design principles** (AGENTS.md §2):
- One responsibility per rule: the exception stands in the one rule it qualifies; who reviews in the bar is the
  architecture's (MOD-prompt-bar), not the SPEC's.
- Nothing twice: no second rule restates the reviewer condition for the bar.
- Nothing the SPEC already says: that the draft is reviewed at all is `AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON
  SEES IT`, unchanged; that the bar's model counts as a participant is `THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE
  BOUND AS PARTICIPANTS ARE`, unchanged.
- Adding one of a kind changes nothing of another kind: the derivation's review (UC-022) and *Check this edit* keep a
  reviewer that differs from the drafter.
- No special first case: the exception is by route, not by first or later change. It does make the bar's route differ
  from UC-022's run panel; that difference is akmaier's decision.

**Impact list.**
- NO REVIEWER IS THE DRAFTER: changed; named by UC-022, UC-023, ARC-046, MOD-participant-list, ITM-442, ITM-731, the
  sprints team1/27 and team2/62, `docs/groups/requirements.md`, `src/job-runner/prepare.mjs`, `src/review-pages/jobs.mjs`,
  `tests/test_architecture_review.py`, `tests/job-runner-prepare.test.mjs`, `tests/participant-list-fit.test.mjs`,
  `tests/review-pages-check-this-edit.test.mjs`, `tests/review-pages-draft-architecture.test.mjs`,
  `tests/system-uc-022-derive-architecture.test.mjs`, `tests/system-uc-023-modify-the-architecture.test.mjs`,
  `tests/release-uc-023-described-change.test.mjs`, and the fixture `tests/fixtures/requirements-repair/`.
- Architecture drafted in the same commit, open for acceptance: MOD-prompt-bar (the bar's model reviews its own handed-over
  draft), MOD-job-runner (`prepareJob`'s `selfReview`).
- Use case still to follow: UC-023's actor *Reviewing participant* ("another participant, using another model") and
  step 2 ("the author chooses a deriving and a reviewing participant") hold for its other routes only.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
