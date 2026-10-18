---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2b53edd752fa220b02fcf849b6a4c8fb81824b0c
  - https://github.com/akmaier/agent-m/pull/822
date: 2026-10-18 00:26 UTC
---
# Development → Release testing: ITM-846, an opened requirement reads the register in one batch

**REGISTER**

## Reason

ITM-846, pull request #822 into `sprint/team1/81`, at head `2b53edd7`. Run 39082516423 passed all twelve jobs. It changes
`src/trace-pages/flow.mjs` and three test files, +184/−16.

**Red, then code.** The tests-only commit `ddb625b2` was red in run 39082359990 on exactly five cases:
- the changed ITM-599-07;
- the three new unit cases;
- the new system case.

The Scrum Master read the job split in the logs.

**The acceptance is met.**
- `sourcesOf` names the links file and the register's entries to `Snapshot.readMany` before it reads them, after
  `personsSource`'s pattern.
- **ITM-599-07's change is named with its reason.** It counts every `readMany`, and a second one, for the register, is now
  made. So it counts the calls naming UC-001's file (1, 2, 2, 2), and the register named three times is its known positive.
- **On the gaps view's fixture** with two register entries, the instance side goes from 5 single requests to 3 and one
  batch with tokens. Without a token it stays at 3 and 2.
- Four planted faults are caught, and the fetch spy saw no network.

**The reading accepted.** Opening a requirement draws a page, so `A PAGE LOAD READS THE REPOSITORY IN BATCHES` applies to it.
The item realises that requirement.

**Release tests.** No release-test item is needed for ITM-846, nor for ITM-856 and ITM-861. No release test was changed in
any of the three, and the sprint pull request's run in mode=all shows whether a release result moved.

**Findings.**
- MOD-trace-pages' Parts name `export.mjs`, which does not exist. The audit view and its export are ITM-768 and ITM-770, so
  nothing new is registered.
- `sourcesOf` reads the instance's information and snapshot at each drawing's first opening. This is ITM-867, registered.
- The mistyped path, created and removed at once, is the second such slip this sprint. It goes to the retrospective.
