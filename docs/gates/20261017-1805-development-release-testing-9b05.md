---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8dd5e116ae96209a586346e91f9eb8604c88adb2
  - https://github.com/akmaier/agent-m/pull/740
date: 2026-10-17 18:05 UTC
---
# Development → Release testing: ITM-807, the git-host tests leave the token banner to the frame

**REGISTER**

## Reason

ITM-807, pull request #740 into `sprint/team1/74`, at head `8dd5e116`. It is one commit. Run 39056353646 passed ten of
ten. The diff against the sprint branch is `tests/review-core.d/git-host.test.mjs`, +2/−9.

**The acceptance is met.**
- The header names MOD-repository-hosts, and its item history `(ITM-008)` is gone.
- The import from `settings-view.mjs` is gone, and so are the two banner assertion groups.
- The `tokenRefusal` assertions and the Guards line stay. The file passes 19 of 19 before and after.
- **No red, as declared.** The item is declared as refactoring, and `A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`
  applies. CI is green on its one commit.

**The requirement stays guarded in between.** The removed assertions guarded `A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE`
and a GitLab token's renewal page. `tests/test_settings_page.py`, the SPEC's Check of that requirement, still asserts
`expiryWarning` and `tokenBannerHtml` at `:121-143`, until ITM-683 re-points it onto the frame's warning. The live
refusal line is asserted by release-sprint-01 `:915-937`, which is unchanged.

**No other test changes result.** All 62 release files give the same result for each test before and after; the five
local failures are the known environment cases. ITM-018 passes. The counter-proof, a changed GitLab `renewUrl`, fails one
case.

**MOD-repository-hosts changes in one test file only.** None of its code changes, as `74.md` told Team 2.

**The reading.** The developer read the changed file in part: its header and the case it changed (`:1-60`, `:340-379`).
The change removes nine lines in those parts, which were read, so it does not hold the gate. Reading the changed file in
full is the brief's rule, and the gap goes to the feedback.

**Findings.** `(ITM-006)` at `:26` of the test body is item history, removed by ITM-689 when it moves the rest. The five
environment failures are known.
