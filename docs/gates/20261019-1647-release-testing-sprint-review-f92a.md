---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - f0374207cae339586087b15a59c11f04c46f3c1b
  - https://github.com/akmaier/agent-m/pull/1096
date: 2026-10-19 16:47 UTC
---
# Release testing → Sprint review: sprint team2/96

**REGISTER**

## Reason

Sprint team2/96 is closed, with its Review recorded in `docs/backlog/sprints/team2/96.md`. Its head is `f0374207`. Sixteen
items are done, each merged at the head its gate passed. The second parent of each merge on the first-parent line equals
the gated head:

| Item | Pull request | Gated head | Note |
|---|---|---|---|
| ITM-994 | #1064 | `cdfa64c0` | |
| ITM-855 | #1065 | `09b587ce` | |
| ITM-851 | #1066 | `814ce9df` | |
| ITM-586 | #1073 | `706d279c` | |
| ITM-850 | #1072 | `11592906` | |
| ITM-746 | #1079 | `e3565da6` | after one rejection |
| ITM-763 | #1082 | `1adfa0c7` | |
| ITM-747 | #1084 | `810603ae` | |
| ITM-761 | #1081 | `55332e07` | after one rejection |
| ITM-764 | #1089 | `0a834d1c` | |
| ITM-1057 | #1090 | `55eff5ef` | |
| ITM-1038 | #1091 | `054eb5b6` | |
| ITM-1024 | #1061 | `3ec669ec` | after the rejection for team 1's hold |
| ITM-1005 | #1063 | `c3833171` | |
| ITM-1077 | #1094 | `9297a555` | |
| ITM-682 | #1075 | `6b08b53a` | |

ITM-499 was met before it was built. ITM-1025 waited for its draft, which akmaier has since accepted, and goes into sprint 97.

**The release tests.** Run 39285452200, on #1096 at `f0374207`, runs every level (mode=all) and passes 20 of 20 jobs.
- Among them are the desktop-shell tests of ITM-1005. They need Linux and xvfb, and run here for the first time.
- They also include the release files of this sprint: `test_mail_import`, `test_mail_privacy` and
  `release-sprint-02-a-dashboard-app`.

**The merge of `main`** (`f0374207`). Its only conflict was the set `HANDED` in
`tests/release-sprint-02-a-dashboard-app.test.mjs:536`. It keeps team 2's `release` (ITM-682) and team 1's `arrange`; the
file passes, 18 of 18. Nothing else of `main` is changed by it.

**No installed packages in the history.** `git log 30e4f94b..f0374207 -- src/bridge-build/node_modules` prints nothing.
