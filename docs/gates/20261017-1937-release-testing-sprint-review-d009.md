---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 4352e66142d7ffe6b2944dba8c8b9f4cb8774019
  - https://github.com/akmaier/agent-m/pull/758
date: 2026-10-17 19:37 UTC
---
# Release testing → Sprint review: sprint team2/76

**REGISTER**

## Reason

Sprint team2/76 was ended on `sprint/team2/76` at `4352e661`. Its done items are merged on the heads their gates passed:
- ITM-815 with #750 at `94130c6b`;
- ITM-813 with #749 at `bc15f114`;
- ITM-814 with #748 at `dd9c0f9d`;
- ITM-777 with #753 at `34fc68d6`;
- ITM-742 with #751 at `13c89506`;
- ITM-750 with #752 at `fc554823`;
- ITM-743 with #755 at `f5d0cc9e`.

ITM-702 is not done (#746 rejected) and went back to the backlog at the close.

**The release tests.** Run 39063001429, on #758 at `4352e661`, runs every level: each of the ten jobs runs `mode=all`,
as the base is `main`, not a sprint branch. All ten pass. I read the ten logs.
- **python (0) and (1)** end `OK`: 281 tests (2 skipped, 5 expected failures) and 231 tests (3 skipped).
- **The release tests of the sprint, each `# Level: release`, all 13 cases `ok`:**
  - ITM-813: `test_bridge_loopback` (1 case) and `test_bridge_token` (3);
  - ITM-814: `test_mail_import` (3);
  - ITM-815: `test_bridge_agents` (2);
  - ITM-777: `test_plan_coverage` (4).
  Each file holds as many `def test_` as the log shows `ok` lines for it.
- **node (0) to (7):** seven logs end `# fail 0`, 3373 tests, 10 todos, the known findings. The log of node (2) ends
  without the TAP summary lines; its step "Dashboard core" and the job conclude `success`, and it prints no `not ok`.

**Who wrote them.** The release tests were written by developer-sonnet-f, -g and -h in this sprint; none of them
implemented the behaviour of MOD-bridge-http, MOD-mail-records, MOD-agent-processes or MOD-model-catalogue (the first
`## Selection` of `docs/backlog/sprints/team2/76.md`).
