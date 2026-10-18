---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 91dd1a314c908b28ed789de84629dab3c9b80e11
  - https://github.com/akmaier/agent-m/pull/864
date: 2026-10-18 08:08 UTC
---
# Development → Release testing: ITM-891, the done check counts the gate records of its own pull request

**REGISTER**

## Reason

ITM-891, pull request #864 into `sprint/team2/89` (`dc1649b7`), at head `91dd1a31`. Run 39109995897 passed all
twelve jobs on the merge of the head into `dc1649b7`, the sprint's current head. The tests-only commit `e7e314be` was
red in run 39109894660 on exactly TST-891001.

**Scope.** `src/product-process/done.mjs`; the new TST-891001 in `tests/product-process-done.test.mjs`; and
`tests/test_definition_of_done.py`, whose fixture facts gain `pullRequest.url`, no expected result changed.

**The reading accepted.** A record whose `on` names a commit or an address counts only if one is the pull request's
commit or address; one with only `<path>@<blob>` entries names no pull request and counts, as TST-409106 needs.

**The fixture change** is fixture preparation: real facts carry the url (`PullRequest.url`). Without it the release
test's own records are not the pull request's and its cases turn "pending" (replayed). Its findings are the same.

**Known positive.** A rejection of another pull request alone gives "pending"; one naming the own commit "rejected".

**Agreement 83.** The release tests of sprint 06 (UC-002), sprint 16, UC-006, 013 and 017, system-uc-002, and
test_definition_of_done, test_implementation_job, test_no_backend, test_participants, test_role_assignment pass; all 25
tests importing product-process pass.

**Counter-proofs.** Four planted faults each made a test fail: no filter, the commit alternative removed, the address
alternative removed, and the artifact-only reading removed (TST-409106).

**Drafted.** The module text drafted for akmaier in `6c58fd63`: `on` names the pull request's address, and doneCheck counts
the pull request's own records.

**Finding.** The url is set in the test's JS code, not in its cases' data file.
