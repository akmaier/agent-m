---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 5af2f460fd281c648040ac44cc58b21c4e9b9667
  - https://github.com/akmaier/agent-m/pull/1240
date: 2026-10-20 21:18 UTC
---
# Development → Release testing: ITM-587's system test (UC-014 steps 1 to 5 and 3a)

**REGISTER**

## Reason

Pull request #1240 into `sprint/team2/98` passes on `5af2f460`. CI is green on 23 of 23 checks. ITM-587 went back to
Development for the `system` level its item declares (`docs/backlog/sprints/team2/98.md`, "Release testing").

1. **One commit, test only.** It adds `tests/settings-pages-get-your-own-system.test.mjs`: TST-587020 to 023, level
   `system`, naming MOD-settings-pages and MOD-site-frame.
   - The test starts the frame with `startPage` over MOD-settings-pages' real view, reads the address through the frame's
     routing, and draws the route into the page.
   - It covers each step's exact page, refusing a name GitHub does not allow, *Later*, `#get-your-own/step=actions`,
     and each step's folded explanation.
2. **Red evidence.** These are tests of built code, so the evidence is five faults planted in
   `src/settings-pages/get-your-own.mjs`, listed in the pull request's comment with the test each one fails.
   - This gate planted one more, Step 2 linking another page than Pages' settings. Run with #1241's test on the merged
     heads, it fails both files, and they pass again once it is restored.
3. **Reading.** One passage of each required text is named in the pull request's comment.
4. **Local run.** On `sprint/team2/98` merged with #1240 and #1241: 14 tests, 14 pass.
