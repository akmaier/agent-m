---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - be5e59b302e013062c62a5f7ea0e0787de2c6ee3
  - https://github.com/akmaier/agent-m/pull/1116
date: 2026-10-19 17:40 UTC
---
# Development → Release testing: ITM-1043, a withdrawn collaborator's Remove lists the files that still name them

**REGISTER**

## Reason

ITM-1043, pull request #1116 into `sprint/team2/97`, passes on `be5e59b3`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `8d30a872` holds only the test, and CI failed on it. The later tests-only commit `be5e59b3` puts the
   register into the fixture, so that the reading of point 3 has its counter-proof.
2. **The accepted text.** UC-042 5a (UC-042.md:147-149): *Remove* "lists the files on the default branch that still name
   them". MOD-settings-pages.md:260-261 uses `MOD-personal-data.namedPersonFindings` for it.
   - The page reads the default branch's files in one batch (`readMany`) and lists each that names the person.
   - It says so where none does, and names the reason where they cannot be read.
3. **Readings accepted.**
   - The collaborators' register itself is not listed: it is where the person is removed.
   - Names are found by their parts, as MOD-personal-data finds them.
4. **Scope.** `src/settings-pages/settings.mjs` and the test.
