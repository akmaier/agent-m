---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - cf904ec0b5a9fc40ae174ee6742dfeafd508b869
  - https://github.com/akmaier/agent-m/pull/733
date: 2026-10-17 13:39 UTC
---
# Development → Release testing: ITM-704, the library reads the register in batches

**REGISTER**

## Reason

ITM-704, pull request #733 into `sprint/team1/73`, at head `cf904ec0`. It is mergeable, and run 39037203059 passed ten of
ten. It changes six files, +265/−24.

**Red first.** The tests-only commit `0364eaf6` was red in run 39036695584:
- node (2): 7 failures, TST-704001, 002, 005, 006, 008, 009 and 010;
- node (3): 1 failure, TST-591313's budget.

These are exactly the new and changed tests.

**The change** is three lines of `readRegisterOf` (`src/settings-pages/library.mjs:60-72`). It gathers the register's
paths and calls `await snapshot.readMany?.(paths)` before the reads. Nothing else in `src` changes.

**Requests with a token,** from the committed tests TST-704010 and TST-591313:

| Click | Base | Head |
|---|---|---|
| library, this repository's 2 entries | 6 | 5 |
| library, 250 entries | 254 | 7 |
| `library/SRC-ai-act` with two products | 14 | 13 |

Without a token, nothing changes.

**Planted faults** are caught: all of the snapshot's paths named, no `?.`, and no `readMany`. The full suite fails the
same 30 tests on the base and the head. No release test changed result, ITM-018 passes, and the fetch spy saw no
network, checked against a known positive.

**Readings.** The three readings are accepted:
- one request per hundred entries;
- `readMany` first, with `?.`;
- a text the snapshot holds is skipped by its blob.

The ten changed cases are in MOD-settings-pages' own tests. They keep what they assert, except that a read in a batch
counts as a read and a batch request does not count as a write, as ITM-678 read it.

**Modules.** `tests/settings-pages-sources.d/github.mjs` and `tests/system-uc-015-sources-through-the-frame.test.mjs`
name MOD-site-frame as well, so it joins ITM-704's modules for them. ITM-704 changes no code of MOD-site-frame, and
ITM-680's draft does not change these files.

**No concurrency lead.** `readRegisterOf` makes one read-ahead on its own snapshot, so no file is read twice within a
call.

**Findings, registered in this commit:**
- The header's item history in `library.mjs:23` is noted in ITM-705, which changes the library's routes. ITM-704 did not
  touch the header.
- The settings pages' fake now answers the batch request. This is noted in ITM-712.
- The `sources` click at this repository's size was not counted. It is no fault lead: the committed TST-704009 shows
  `sources` reading in batches.
