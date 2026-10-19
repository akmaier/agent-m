---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2fa69ae43b620eb92edaa3f68c80a2c0317192d1
  - https://github.com/akmaier/agent-m/pull/1022
date: 2026-10-19 10:58 UTC
---
# Development → Release testing: ITM-1040, passed — the explanations of declaring a resource

**REGISTER**

## Reason

ITM-1040 (MOD-site-frame), pull request #1022 into `sprint/team1/93`, passes on `2fa69ae4`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-d`.**
  - `622e6f33` holds only tests: `tests/site-frame-resource-explanations.test.mjs`.
  - `9306e10a` and `2fa69ae4` change only `src/site-frame/explanations.md`.
- **The red,** run 39240591891, job 118020170871: `# fail 3`, `# todo 0`, `# cancelled 0`, exactly the tests of the topics
  `resources`, `resource-kind` and `resource-licence`.
- **What was met before is named in the pull request.** The leaked-key warning of step 5 stood in `resource-licence`, and
  the frame's topic check is ITM-646's (`tests/site-frame-topics-check.test.mjs`). So no test was added for them.
- **The reading:** developer-sonnet-d read SPEC.md and chapters 9, 11, 12 and 13 in full earlier in this session, for
  ITM-1037, which AGENTS.md §1 asks before work starts.
- **CI:** run 39241020085 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`0cb36730`) is clean.
- **Replayed in a clean worktree at the head:**
  - `site-frame-resource-explanations` and `site-frame-topics-check` pass 7 of 7.
  - Counter-proof: with `622e6f33`'s `explanations.md`, the 3 tests fail.
