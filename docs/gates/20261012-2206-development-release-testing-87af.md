---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 6e6263b6c5cc3ba0e0f4f2512752fd66d7ba9953
  - https://github.com/akmaier/agent-m/pull/462
date: 2026-10-12 22:06 UTC
---
# Development → Release testing: ITM-384, a smaller part of a source is a set of its files

**REGISTER**

## Reason

ITM-384, pull request #462 by developer-sonnet-c into `sprint/team1/24`, head `6e6263b`. The condition that does not
hold: a version of one file is sent whole whatever the job's `part` names, even a file it does not hold, where
MOD-source-register's file refuses "`NotInVersion { files }` for a part that names a file the version does not hold",
whatever the version's size. "A version of one file has none", a smaller part, means a part naming its one file sends
it whole; it does not let a name the version lacks pass. The rework checks the names for every version.

The rest was read too and stands for the rework: the tests-only commit `cd77779` was red (run 38313633159), the code is
green (run 38314376234), and 21 faults are killed; the named files in the version's order, an empty list as the whole
version, a file only hashed as not held. The part's name now lists the files sent and then the link's part, as the
module file gives it — "the part's name names the version, the files sent and the part the product's link names" —; its
readers, the prompt's heading, the destinations' list and the runner's comparison of parts by recipe and name, read it
whole and depend on no form of it.
