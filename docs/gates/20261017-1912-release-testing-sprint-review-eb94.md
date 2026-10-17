---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 305893b661d5d2618b161d0d2776dd8893f3605d
  - https://github.com/akmaier/agent-m/pull/747
date: 2026-10-17 19:12 UTC
---
# Release testing → Sprint review: sprint team1/74

**REGISTER**

## Reason

Sprint team1/74 was ended on `sprint/team1/74` at `305893b6`. Its items are merged on the heads their gates passed:
- ITM-807 with #740 at `8dd5e116`;
- ITM-808 with #741 at `917f3b2e`;
- ITM-685 with #742 at `ca654793`;
- ITM-683 with #743 at `87373adb`, which holds #744 and #745.

**The release tests.** Run 39061257849, on #747 at `305893b6`, runs every level (mode=all, read by the Scrum Master in
each log) and passes all ten jobs. I read the eight saved node logs (`sm-747-*.log`).
- Each ends with `# fail 0`. There are 3804 tests and 12 todos, the known findings.
- **The release tests the sprint touched:** `ok 198 - release · UC-042 1a: a token expiring within fourteen days is warned
  of on every page, with Renew`, and `ok 228 - TST-475301`. The non-release `ok 66 - UC-042 1a` is the frame's line.
- **The release tests named every sprint:** `ok 158 - TST-418104`, `ok 117 - TST-276901`, `ok 404 - TST-377012` and
  `ok 405 - TST-377013`.
