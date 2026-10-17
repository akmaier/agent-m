---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7fad7d24a86c853a2d8efa1a9098cb2d0912db1e
  - https://github.com/akmaier/agent-m/pull/762
date: 2026-10-17 20:04 UTC
---
# Release testing → Sprint review: sprint team1/75

**REGISTER**

## Reason

Sprint team1/75 was ended on `sprint/team1/75` at `7fad7d24`. Its items are merged on the heads their gates passed:
- ITM-811 with #756 at `14043a27`;
- ITM-718 with #754 at `9cdf3794`;
- ITM-688 with #757 at `ab62a267`;
- ITM-810 with #761 at `23132f94`.

**The release tests.** Run 39064974676, on #762 at `7fad7d24`, runs every level (mode=all, read by the Scrum Master in
each log) and passes all ten jobs. I read the eight saved node logs (`sm-762-*.log`).
- Each ends with `# fail 0`. There are 3842 tests and 12 todos, the known findings.
- **The release tests nearest this sprint's changes:**
  - ITM-129 `ok 121` and `ok 122`, and ITM-130 `ok 123` to `ok 126`, which ITM-810's first draft had touched;
  - ITM-130's `lastAccepted refuses a text that does not hash to the record's blob` (`ok 142`), beside ITM-718;
  - UC-042 1a `ok 198`.
- **The release tests named every sprint:** `ok 158 - TST-418104`, `ok 117 - TST-276901`, `ok 408 - TST-377012` and
  `ok 409 - TST-377013`.
