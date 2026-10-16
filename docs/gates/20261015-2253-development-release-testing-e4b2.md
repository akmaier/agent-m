---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 88487c075fc2d2f0cb502779faf34980706df71d
  - https://github.com/akmaier/agent-m/pull/530
date: 2026-10-15 22:53 UTC
---
# Development → Release testing: sprint team1/29, between jobs — the prompt bar's own schema files in the no-backend check

**REGISTER**

## Reason

The change between jobs of sprint team1/29, pull request #530 by developer-sonnet-e, head `88487c07`, one commit.

- CI is green on the head (run 38819902915, ten of ten jobs).
- The kind, in place of checks 1, 3 and 5:
  - Only `tests/test_no_backend.py` changed, a check of the whole repository.
  - It now allows MOD-prompt-bar what the module's file states it uses: its Parts name `conversation.schema.md` and
    `recording.schema.md` as its own data files.
  - The permission takes the form of MOD-participant-list's and MOD-job-ledger's: at most one `fetch`, in the
    `ownFile` form, of addresses resolved from `./` against the module's own address.
  - No module's folder changes.
  - It is the kind "lets a check of the whole repository allow a module what the module's file states that it uses".
- The new test names the module and states its expected findings in its own text. A change between jobs needs no red
  tests-only commit.
- The pull request recorded no counter-proof for the test's positive case, so I ran one on the head. With the entry
  removed from `PERMITTED_CHANNELS`, the new test fails, and it passes again with the entry restored. Its four refused
  forms are counter-proofs of the restriction.
