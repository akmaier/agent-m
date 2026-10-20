---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 8cefcb61ed5a50231ec9258fb4b734f1f7bf266c
  - https://github.com/akmaier/agent-m/pull/1189
date: 2026-10-20 12:02 UTC
---
# Development → Release testing: ITM-1150, the usability tests of the site take a small part of their shard's two minutes

**REGISTER**

## Reason

ITM-1150, pull request #1189, passes on `8cefcb61`. Its gate waited for the 20 runs that its acceptance asks for
(`docs/backlog/sprints/team2/97.md`, "#1189 (ITM-1150) is neither passed nor rejected").

1. **The 20 runs.** node (6) of run 39347202503 ran in attempts 1 to 20, each started after the last ended, and every
   attempt succeeded. They took 36 s at the shortest and 67 s at the longest, so every one is under 90 s.
   - They are recorded on the pull request (issuecomment-6290355849).
   - This gate read the same 20 attempts again, from the jobs API's `started_at` and `completed_at`, with the same
     result.
2. **The cause** is named as a data-flow path in the pull request: the drawing of 35 routes at two widths in one window
   took about 40 s. It now runs in six windows, and node (6) fell from 129 s to 36-67 s.
3. **Refactoring.** No expected result changes. CI is green on its one commit.
4. **The rest of the time.** openbox is installed with `apt` on every run. That step stays inside the job's two minutes
   (`.github/workflows/tests.yml:66`), and the 20 runs include it.
5. **Its merge.** #1189's base, `sprint/team2/97`, is merged and closed. ITM-1150 is in the backlog. It merges once a
   team 2 sprint can select it free of team 1's holds, and #1189 is retargeted to that sprint's branch.
