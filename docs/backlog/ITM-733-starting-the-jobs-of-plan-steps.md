---
id: ITM-733
title: Starting the jobs of the selected plan steps
level: module
realises:
  - UC-024
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - A PARTICIPANT DECLARES ITS CAPABILITIES
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - A GATE NAMES WHO DECIDES IT
  - WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET
  - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - THE PAGE NAMES WHERE IT SENDS
  - ONE CLICK PER DECISION
  - A REFACTORING JOB BEGINS WITHOUT A FAILING TEST
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-732
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-733 Starting the jobs of the selected plan steps

**REGISTER**

## Outcome

The route `implement` (ITM-732) gains UC-024 steps 5 to 7, as MOD-implementation-pages states it:
- for each selected step, the participants that hold the implementing role in the role assignment and declare *write
  to the repository* and *run code and tests*, each with where it processes data (`holdsRole`, `eligible`), and the
  folded explanation of the three kinds (ITM-725); none: the reason and a link to the participants (5a); a participant in a
  place a linked source forbids offered only where the job can be done without that content, which is named (5b);
- the attempt limit, whether a participant merges its pull request itself, and *refactoring* (3a), choosing the kind
  `refactor` instead of `implement`;
- the target branch — the default branch, or the phase's branch the declaration sets —, every gate the jobs will meet
  with its decider (`workflowOf`), and what is sent where;
- *Start jobs*, one click: each job's start record committed and handed over on its participant's route through
  `queueJob`; a bridge or runner that does not answer named and nothing started (7a); a token that may not start
  workflows leading to the workflow's *Run workflow* page with the job's inputs named (7b).

## Acceptance

- In a small DOM with fixture participants, role assignment and host: only holders of the role with both capabilities
  offered; the branch and gates named; *Start jobs* commits one start record per step through `queueJob`, with the
  attempt limit, the merge choice and the kind `refactor` when ticked.
- 5a, 7a and 7b as stated; without *Start jobs*, nothing is sent.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
