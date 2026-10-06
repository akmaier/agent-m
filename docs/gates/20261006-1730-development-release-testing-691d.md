---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - ed172b20c81baf66c429d6269d83431e358c7ef9
  - https://github.com/akmaier/agent-m/pull/115
date: 2026-10-06 17:30 UTC
---
# Development → Release testing: the no-server check and the modules' own data files

**REGISTER**

## Reason

A change between jobs, not an item. Pull request #115 by scrum-master-session, on head `ed172b2`, was checked against
`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`, for ITM-215 to ITM-218. What holds:
- It changes only `tests/test_no_backend.py`, whose header names no module.
- It is a check of the whole repository, and the five module files state the reads of their own data files that it allows.
- CI is green on the head.
- The new test's counter-proofs are recorded.

Why it is rejected:
- Its folder entries count a module's fetches exactly. So they require one fetch in each of the five folders as soon as the
  folder holds code, where the requirement lets the check only allow it.
- ITM-213 builds MOD-documents without its own schema files, so its CI would turn red. On this head, a staged
  `src/documents/index.mjs` without a fetch fails `test_requests_leave_only_through_the_known_channels`: `src/documents/:
  fetch found 0 times, permitted 1`. At `2487fe6` it passes.

Missing: entries that allow at most one fetch per folder, or MOD-documents' entry left out until an item builds its own
schema files.
