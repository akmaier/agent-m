---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 26cad447824ba729f0b8ce33ae605c06d60a34c2
  - https://github.com/akmaier/agent-m/pull/445
date: 2026-10-12 19:39 UTC
---
# Development → Release testing: ITM-458, a source entry's schema names its rule

**REGISTER**

## Reason

ITM-458, pull request #445 by developer-sonnet-c into `sprint/team1/22`, head `26cad44`. The first commit `5edd8c4`
holds only `tests/source-register-rule.test.mjs`, and CI was red on it (run 38297719573): its three tests fail, and no
other test does. CI is green on `26cad44` (run 38298775681, 2066 tests, 0 failures). The change is one line of
`src/source-register/source.schema.md`; the new test names MOD-source-register and its guard, and 9 faults are recorded,
none surviving. The Acceptance holds: an entry missing a required field gives a finding naming the rule, and nothing
throws; a valid entry gives none.

The reading weighed: the rule `THE INSTANCE KEEPS THE SOURCE REGISTER` stands in `SPEC.md` by that exact name (line
177: "An instance lists every requirement source it knows in `docs/sources/` of its own repository, one file per
source"), and MOD-source-register's file names it for the register whose entries this schema reads — "sources (`THE
INSTANCE KEEPS THE SOURCE REGISTER`) — each source a typed record". Over this repository's register, a finding of
`SRC-po-a-maier` or `SRC-vibe-coding` now names the rule where it threw before. That TST-286903 and TST-286904 fail
only in a full local run under load is noted for the review.
