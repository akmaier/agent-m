---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - fe2b477242d627710c5206314efd7c2d77562cc1
  - https://github.com/akmaier/agent-m/pull/607
date: 2026-10-16 17:10 UTC
---
# Release testing → Sprint review: sprint team1/47

**REGISTER**

## Reason

Sprint team1/47 was ended on `sprint/team1/47` at `fe2b4772`. The gate on `f6a65aa2` (`1624`) was rejected because
ITM-018 failed on a test header, and the mend #608 is merged. Every item of the last selections is merged, each on the
head its gate passed:
- ITM-508 with #600, and ITM-511 with #599;
- ITM-509 with #601, and ITM-507 with #602;
- ITM-553 with #603, and ITM-549 with #604, after its rework;
- ITM-557 with #605, and ITM-514 with #606;
- the mend with #608.

ITM-551 moves into the next sprint, as decided.

**The release tests of the selected items.** Run 38937315429, on #607 at `fe2b4772`, runs every test. It passes all ten
jobs on its first attempt, with no re-run. Among them:
- `ok 148 - ITM-018 · the graph of this repository's commit: derived, by identifier, gaps listed, nothing blocked`
  (job 117095957801), which failed before the mend;
- `ok 121 - TST-276901`, the release test whose fixture ITM-557 changed, on Linux with the lock wait for the first time
  (job 117095958067);
- the two UC-019 release tests that ITM-514 rewrote.

ITM-557's release test was changed by a developer who implemented none of MOD-desktop-shell. ITM-514's were changed by
one who implemented none of ITM-507, ITM-508 or ITM-551.
