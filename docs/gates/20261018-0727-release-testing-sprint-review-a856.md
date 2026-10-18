---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4b1b82000e653a615351afaca8c81c61a9a871d8
  - https://github.com/akmaier/agent-m/pull/856
date: 2026-10-18 07:27 UTC
---
# Release testing → Sprint review: sprint team1/87

**REGISTER**

## Reason

Sprint team1/87, pull request #856 of `sprint/team1/87` into `main`, on head `4b1b8200`. **Twelve items are merged, each
on the head its gate passed:**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-868 | #844 | `a3bebf84` |
| ITM-874 | #845 | `17b78bd5` |
| ITM-870 | #847 | `a6bd984f` |
| ITM-735 | #846 | `2c7666f7` |
| ITM-883 | #849 | `8cc4c4bf` |
| ITM-882 | #848 | `212356a8` |
| ITM-876 | #850 | `261efc16` |
| ITM-884 | #851 | `c9e9bad1` |
| ITM-896 | #852 | `0b9903be` |
| ITM-885 | #853 | `bdc08c8a` |
| ITM-877 | #854 | `9910633a` |
| ITM-879 | #855 | `9c47b71c` |

ITM-875 and ITM-895 stopped and went back to the backlog. ITM-878, ITM-886 and ITM-894 left the sprint, as 87.md records.

**The release tests.** Run 39107553408 ran on `4b1b8200`, event `pull_request`, in mode=all: each of the eight saved node
logs (`sm-856-*.log`) holds its step "Run mode=all". It passed all twelve jobs.
- Each node log ends with `# fail 0`. There are 4309 tests and 12 todos, the known findings.
- **The sprint's new tests pass:** `ok 351 - TST-868001`, `ok 311 - TST-874001`, `ok 314 - TST-870001`,
  `ok 492 - TST-735001`, `ok 276 - TST-883001`, `ok 448 - TST-882001`, `ok 182 - TST-876001`, `ok 313 - TST-884001`,
  `ok 446 - TST-896001`, `ok 86 - TST-885001`, `ok 276 - TST-877001`, `ok 379 - TST-879001`.
- **The release tests named every sprint pass:** `ok 212 - TST-418104`, `ok 184 - TST-276901`, `ok 465 - TST-377012` and
  `ok 466 - TST-377013`.
- **One release test changed this sprint,** by a participant who built none of the item: UC-006 4d in
  `tests/release-sprint-01-dashboard-app.test.mjs`, by developer-sonnet-b (#855). It does not run in CI's node jobs. It
  passed on #855's head in the Product Owner's gate run, with the Bridge packages installed as CI does.
