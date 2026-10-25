# 12. Tests and continuous integration: the two-minute check reads the generated CI

**The change.** The *Check* of `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES` names the workflow MOD-test-schedule
generates from Agent M's declared schedule, `.github/workflows/agent-m-tests.yml`, in place of `.github/workflows/tests.yml`.
The requirement itself is unchanged.

**Why.** `tests.yml` is transitional: "Transitional CI until MOD-test-schedule generates Agent M's declared schedule"
(`.github/workflows/tests.yml:1-3`). ITM-476 replaces it with the configuration generated from Agent M's schedule
(`THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE`), after which a check naming `tests.yml` would check a file that is
gone. akmaier's request of 2026-10-25 to get the test pages working leads here: the runs page shows the records CI writes,
and CI writes them only from the generated configuration.

**Design principles** (AGENTS.md §2): nothing twice — the check reads the one CI configuration Agent M has; the rule is
not restated.

**Impact list.**
- A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES: its check `tests/test_ci_budget.py`, which MOD-test-schedule's Parts take over.
- MOD-test-schedule: the generated jobs carry the schedule's time limit (architecture draft of the same day).
- ITM-476: replaces `tests.yml` and `nightly.yml` once the generated configuration covers them.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
