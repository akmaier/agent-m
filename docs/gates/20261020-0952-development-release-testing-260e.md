---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 2ec69bc76f6b57eee67d38a9ccc50215a4a1362d
  - https://github.com/akmaier/agent-m/pull/1188
date: 2026-10-20 09:52 UTC
---
# Development → Release testing: ITM-965, the system and release tests of UC-038

**REGISTER**

## Reason

ITM-965, pull request #1188 into `sprint/team2/97`, passes on `2ec69bc7`. CI is green, on 20 of 20 jobs.

1. **Not the implementer.** ITM-963 and ITM-964, the items of UC-038, were built by developer-sonnet-h. developer-sonnet-g
   wrote these tests, and names its own items in the modules' history, none of UC-038.
2. **Red evidence.** It holds only tests, so the evidence is eleven faults planted in `src/maintenance-pages/mail.mjs`, each
   failing the cases its pull request names. The main flow and the flows 2a, 4b, 4c, 6a, 6c and 8a each have one.
   - TST-965102 (2a on the Bridge's route) has no fault of its own shown, since the container's disk failed. Flow 2a is
     caught on the Graph route by TST-965004.
3. **Scope.** Only test files change. The two world helpers name MOD-maintenance-pages in their headers, and gain only
   the creation of an issue and its refusal.
4. **The finding, TST-965202.** The SPEC names `tests/test_issue_to_spec.py` as the check of `EVOLUTION ENTERS THROUGH THE
   SPECIFICATION` (SPEC.md:840-843), and the file does not exist. The case is marked `todo`, so CI is green and the gap
   stays visible. It is **ITM-1152**, which builds on ITM-582 and ITM-584, since `src/issue-handling` is not built. The
   `todo` text names no item yet; ITM-1152's pull request removes the mark.
