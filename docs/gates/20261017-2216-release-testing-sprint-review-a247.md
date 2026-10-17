---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5a4a736a031f46675065bc2285b64f675a52c608
  - https://github.com/akmaier/agent-m/pull/796
date: 2026-10-17 22:16 UTC
---
# Release testing → Sprint review: sprint team1/78

**REGISTER**

## Reason

Sprint team1/78 was ended on `sprint/team1/78` at `5a4a736a`. Its items are merged on the heads their gates passed:
- ITM-841 with #790 at `809b23e6`;
- ITM-844 with #791 at `863227a2`;
- ITM-827 with #793 at `b364c3ef`.

ITM-845 left the sprint.

**The release tests.** Run 39074150679, on #796 at `5a4a736a`, runs every level (mode=all, read by the Scrum Master in
each log) and passes all ten jobs. I read the eight saved node logs (`sm-796-*.log`).
- Each ends with `# fail 0`. There are 3950 tests and 12 todos, the known findings.
- No release test was changed this sprint, and the release files gave the same results on each item's base and head.
- **The release tests named every sprint:** `ok 164 - TST-418104`, `ok 154 - TST-276901`, `ok 392 - TST-377012` and
  `ok 393 - TST-377013`.
