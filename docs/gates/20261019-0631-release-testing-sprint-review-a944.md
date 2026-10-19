---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1e9c8ff1dfc19e7330232421bfa6aa32a4db3854
  - https://github.com/akmaier/agent-m/pull/944
date: 2026-10-19 06:31 UTC
---
# Release testing → Sprint review: sprint team1/92

**REGISTER**

## Reason

Sprint team1/92, pull request #944 of `sprint/team1/92` into `main`, on head `1e9c8ff1`. **Thirteen pull requests are
merged, each on the head its gate passed:**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-915 | #922 | `804b1313` |
| ITM-639 | #921 | `ffc18e68` |
| ITM-703 | #933 | `0d06eaaf` |
| ITM-951 | #932 | `9b962f83` |
| ITM-512 | #935 | `dafced1a` |
| ITM-638 | #934 | `b8860a85` |
| ITM-669 | #931 | `e86be6bb` |
| ITM-670 | #939 | `8603efee` |
| TST-639008's mark (ITM-638's follow-up) | #941 | `0340f71a` |
| ITM-999 | #940 | `f771e2a7` |
| ITM-670 | #942 | `5ea726e3` |
| ITM-865 | #937 | `f5ccda4e` |
| ITM-670 | #943 | `31daa803` |

The unfinished items are in 92.md, as the Product Owner decided them.

**The release tests.** Run 39209850235 ran on `1e9c8ff1` against `main` in mode=all and passed all twenty jobs on its first
attempt.
- **TST-412100 passes** (python (2), 45 s), since team 2's ITM-1001 hands node the code on its standard input. That was the
  wait recorded in 92.md.
- **The sixteen node logs** (`sm-944-*.log`, read from each job's raw log) each end with `# fail 0`: 4,421 tests and 49
  todos, the known findings. They are fewer than sprint 91's because the frame's 18 tests no longer run inside 29 other
  files (ITM-670).
- **The four python logs** each end with `OK`: 542 tests.
- **The release tests named every sprint pass:** `ok 111 - TST-418104`, `ok 85 - TST-276901`, `ok 183 - TST-377012` and
  `ok 184 - TST-377013`.
- **The release tests of this sprint ran in CI for the first time and pass:**
  - `release-uc-015-link-sources`: 8 of 8, including step 1, whose todo #941 removed;
  - `release-uc-016-new-version`: 9 passing and one todo, step 5's "marked source changed", FINDING ITM-657.
- **Every job ends within two minutes.** The longest are node (5) at 79 s, node (7) at 73 s and python (3) at 65 s.
