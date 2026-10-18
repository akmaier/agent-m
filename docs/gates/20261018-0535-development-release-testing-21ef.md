---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - f1b66907f4d5bacddc333b56a37aa1189f723891
  - https://github.com/akmaier/agent-m/pull/841
date: 2026-10-18 05:35 UTC
---
# Development → Release testing: ITM-725, the explanations of arranging and of implementing

**REGISTER**

## Reason

ITM-725 (MOD-site-frame, `explanations.md`), pull request #841 into `sprint/team2/88`, is rejected on one condition:
the topic `coding-participants` says something about the CI agent that no accepted text gives. This fails check 5,
because the Outcome asks for the three kinds as UC-024 names them.

**The sentence.** Of the CI agent on a self-hosted runner, the topic says "the agent's calls are billed per use by its
provider". The accepted texts say otherwise or say nothing:
- UC-010:40 and UC-044:45 say per-use billing of level 1 only, a job on the server's machines with an API key as a CI
  secret.
- UC-024:83-85 names this kind as "a CI agent in a workflow on a self-hosted runner on that agent's machine".
- UC-017:60-63 has that runner reach the agent locally on its machine.
- UC-044:45 gives such a local agent the agent's own login, the person's subscription.
- The existing topic `participant-ci-agent` also ties the billing to GitHub's machines.

The rework removes the claim or gives the self-hosted case only what the texts say. The same `participant-ci-agent`
sentence is also where "a job takes the time of a workflow run" comes from. A self-hosted job is still a workflow run,
so that claim is not contradicted.

**Every other sentence was checked against UC-021 and UC-024 in the original, and holds.**
- `group-is-a-heading` follows UC-021:30-37, 72-73, 82-83, 2c, 3b and the Postcondition.
- `implementation-route` follows UC-024:59-70. The split "chapter 6 plan-driven, chapter 7 agile" is accepted text in
  UC-031:87.
- `coding-participants` follows UC-024:83-85 and steps 5, 8 and 9, and UC-017:58-66. Its CLI agent claims ("starts at
  once", "a working folder of its own") come from `participant-cli-agent` and from UC-011:37 and UC-044:75. Saying that
  the sandboxed agent's speed is given nowhere is honest; nothing is invented there.

**The developer's points.**
- **The test file changed between the red and the green commit.** The red commit still proves what the Acceptance asks.
  Run 39100444246 failed on `d0a40cf1` at each new test's first assertion, "known positive: explanations.md holds the
  topic …", so it is red because the topics are missing, not because of the small DOM. The green commit changes only
  the fixture: it now imports `tests/site-frame.test.mjs`, the harness that the sibling explanation tests import.
  The one assertion rewrite, `getAttribute("open") === null` to `hasAttribute("open") === false`, asserts the same
  thing. No expected claim changed. The small DOM of 88.md could never have turned green, so the switch is the right
  repair, and the deviation is stated in the pull request.
- **TST-725005's SHA-256 pins.** They are the right guard for the three topics that the new comparison reuses. They
  are narrower than "no existing topic changes", which covers all 104 topics. That wider claim rests on the diff:
  `git diff 909cb8f3 f1b66907 -- src/site-frame/explanations.md` removes or changes 0 lines and adds 33, and
  `index.mjs` (`explain`) is unchanged. A later item that changes one of the three topics has to name this test.

**The other checks hold.**
1. The first commit holds only the test, and CI is red on it. No stub was committed.
2. Run 39100596732 is green on f1b66907.
3. Two files changed: `src/site-frame/explanations.md` and the new test, whose header names MOD-site-frame.
4. TST-725001 to 725005 each name their guarded requirements and the module. Four counter-proofs were replayed in a
   checkout of the head, and each failed its test:
   - 725001: an unclosed `*oops`;
   - 725003: chapter 7 changed to chapter 5;
   - 725004: "starts at once" changed to "starts later";
   - 725005: the `participant-cli-agent` text changed.

   The restored head passes 23 of 23.

**Agreement 83.** The Bridge packages were installed as CI does. All 70 release `.mjs` tests and the 4 site-frame tests
then ran on the head: 822 tests, 813 pass, 7 todo, 1 skipped, 1 fail. The two Python release tests passed 8, with 2
skipped. The one failure, TST-320321902 in `release-uc-019-change-requirements-by-prompt.test.mjs`, also fails on the
base 909cb8f3 in the same combined run. It passes alone on both, 24 of 24. So it is not the item's.
