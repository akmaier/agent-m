---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1e3f3eb77e24ca6a33fa292ad1dc39883747873e
  - https://github.com/akmaier/agent-m/pull/1257
date: 2026-10-20 22:37 UTC
---
# Development → Release testing: ITM-1167, the job-workflow test reads git's refusal in any language

**REGISTER**

## Reason

ITM-1167, pull request #1257 into `sprint/team2/101`, passes on `1e3f3eb7`. CI is green on 23 of 23 checks.

1. **The reading.** The description names the required passages.
2. **The change.** Only `tests/workflow-entries-job-workflow.test.mjs` changes, MOD-workflow-entries' unit test.
   - "Not written" is now decided by git's listing, `isWritten` with `git ls-tree --name-only main -- <path>`, and not by
     git's words.
   - It has a known positive: the first run's gate record is on `main`.
3. **Red, where it can be.** The defect is the machine's language. CI's git speaks English, so CI cannot show it, and the
   pull request says so.
   - On the base, the test fails under `LC_ALL=de_DE.UTF-8` with git's "existiert nicht". This gate saw the same on
     `main` on this machine.
   - On the head it passes under `de_DE`, `C` and `LANG=de_DE`.
   - The item is a test fix, and adds no behaviour. This red at the base, in the locale that shows the defect, is its red.
4. **Counter-proof.** A gate commit planted on `main` fails the test under both locales.
5. **Release runs on the head:** traceability 8 of 8, and the Python checks 10 with 4 subtests.
