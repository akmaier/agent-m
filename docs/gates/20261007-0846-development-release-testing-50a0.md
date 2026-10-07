---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 820544223fbfe7adb21ee892e76ade7b3a62d7ed
  - https://github.com/akmaier/agent-m/pull/153
date: 2026-10-07 08:46 UTC
---
# Development → Release testing: the participant developer-deepseek-a

**REGISTER**

## Reason

A change of the instance's participants at akmaier's instruction of 2026-10-07, a developer role for DeepSeek from the next
sprint on, merged into `main`, not into a sprint branch: pull request #153 by scrum-master-session, on head `8205442`,
branched from `main` at `bec0ef8`.
- CI is green on the head (python and node).
- It is what the instruction asks and nothing more:
  - a row for developer-deepseek-a in `docs/participants.md`;
  - its name in the role Developers of `docs/process.md`;
  - the one pinned expectation of Agent M's own declaration in `tests/product-process.test.mjs`, which follows from it, as
    #134 did. The test's counter-proof is in the pull request.
- The row meets the participant requirements:
  - a CLI agent (`A PARTICIPANT HAS ONE OF FIVE TYPES`);
  - the six capabilities of the list, every one the role Developers needs among them (`A PARTICIPANT DECLARES ITS
    CAPABILITIES`, `A ROLE NAMES THE CAPABILITIES IT NEEDS`);
  - NHR@FAU, Erlangen (`A PARTICIPANT DECLARES WHERE IT PROCESSES DATA`);
  - the model `deepseek-ai/DeepSeek-V4-Flash-0731` (`A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL`);
  - no key, token or password in any changed file (`NO SECRET IN THE REPOSITORY`).

Noted: akmaier's words name "DeepSeek-0673"; the row names the one DeepSeek model the NHR@FAU gateway lists, as the pull
request states.
