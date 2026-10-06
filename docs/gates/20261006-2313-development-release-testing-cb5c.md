---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b1a001f0d7a1306815231c9a6ef141923af9211b
  - https://github.com/akmaier/agent-m/pull/131
date: 2026-10-06 23:13 UTC
---
# Development → Release testing: ITM-228

**REGISTER**

## Reason

ITM-228, pull request #131 by developer-opus-c, on head `b1a001f`, against the item as `main` holds it since `d29f321`.
All five points hold:
- The first commit, `1b1f85f`, holds only `tests/source-register-links.test.mjs`, and CI was red on it: its 4 tests.
- CI is green on the head, in a run made after #130 had merged into `sprint/06`.
- Only MOD-source-register's folder — `index.mjs` and the new `links.schema.md` — and tests naming the module change. The
  one changed expected result is the one the amended Acceptance allows: the reads at load gain `links.schema.md`.
- The 4 new tests have 5 counter-proofs.
- The Acceptance holds:
  - `entry` and `links`;
  - a links file read and written back byte for byte;
  - a row without version or hash refused;
  - this instance's `docs/sources.md` read, unchanged.
