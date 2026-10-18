---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1db204150bcd323d70bf55bc4bc433e38f4d3da4
  - https://github.com/akmaier/agent-m/pull/841
date: 2026-10-18 05:41 UTC
---
# Development → Release testing: ITM-725, the explanations of arranging and of implementing

**REGISTER**

## Reason

ITM-725 (MOD-site-frame, `explanations.md`), pull request #841 into `sprint/team2/88`, passes on its rework. This
follows the rejection on f1b66907 (`20261018-0535-development-release-testing-21ef.md`). The new head holds two commits
after that one:
- `596ff109` is the fix;
- `1db20415` merges `sprint/team2/88` at 97c54d45 (#842).

Against the sprint head, the pull request still changes only `src/site-frame/explanations.md` and the new test.

**The condition of the rejection is gone.** The per-use billing of the self-hosted CI agent is removed. TST-725004 now
asserts that the topic says nothing is "billed". Each changed sentence was checked in the original:
- **The CLI agent.** "no key is needed and your subscription pays" is UC-044:73-74 and UC-044:45.
- **The sandboxed agent's setup.** "the Bridge runs inside the sandbox, and the tunnel reaches it" is UC-017:37 ("the
  Bridge in it, through a tunnel") and UC-024:84.
- **The CI agent's speed.** It now says only "a job takes the time of a workflow run".

**The developer's open point.** "starts at once" (CLI agent) and "a job takes the time of a workflow run" (CI agent)
stand in no use case. Reusing them is admissible, for three reasons:
- They are the product's existing explanations, `participant-cli-agent` and `participant-ci-agent`, merged through
  their own gates.
- UC-024 step 5 asks for speed, and a comparison of the three kinds has to agree with the topics it compares.
- No accepted text contradicts them. `participant-ci-agent` says the workflow-run time beside GitHub's machines, but a
  job on a self-hosted runner is still a workflow run.

The billing claim was different: UC-044:45 contradicts it for an agent on its own machine. If akmaier wants a speed
written in a use case, the place is UC-011 or UC-024 step 5. The same goes for the sandboxed agent, for which the topic
says that no speed is given.

**The checks.**
1. The first commit, `d0a40cf1`, holds only the test. CI run 39100444246 is red on it because the topics are missing.
   No stub was committed.
2. CI run 39101258649 is green on 1db20415.
3. Two files changed: `explanations.md`, which removes or changes 0 lines against 909cb8f3, and the new test, whose
   header names MOD-site-frame. `explain` is unchanged.
4. TST-725001 to 725005 each name their requirements and the module. Three counter-proofs were replayed in a checkout
   of the head, and each failed its test:
   - the old billing sentence restored made the new no-"billed" assertion of 725004 fail;
   - "no key" changed to "a key" made the subscription claim of 725004 fail;
   - "no test guards it" changed to "a test guards it" made 725002 fail.

   The restored head passes 23 of 23.
5. The Acceptance holds. `explain` gives each new topic folded, with its text. No existing topic changes: the diff
   shows it, and TST-725005 pins the three participant topics. The red commit and the harness change were judged in
   the first record.

**Agreement 83.** The Bridge packages were installed as CI does. All 70 release `.mjs` tests and the site-frame tests
then ran on the head: 822 tests, 813 pass, 7 todo, 1 skipped, 1 fail. The two Python release tests passed 8, with 2
skipped. The one failure is TST-320321902, the same one that fails on base 909cb8f3 in the combined run. It passes
alone, 24 of 24, so it is not the item's.
