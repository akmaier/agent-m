---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 47cc8d84b3ee073ba57e134727803ee7a9575816
  - https://github.com/akmaier/agent-m/pull/777
date: 2026-10-17 21:16 UTC
---
# Development → Release testing: ITM-833, the specification view reads the register in one batch

**REGISTER**

## Reason

ITM-833, pull request #777 into `sprint/team1/77`, at head `47cc8d84`. It is mergeable, and run 39069920061 passed ten of
ten. It changes `src/trace-pages/subject.mjs` and adds two test files, +202/−2.

**Red, then code.** The tests-only commit `836af925` was red in run 39069681005 on exactly its three new cases: the system
case with a token and two unit cases. The code was pushed after the run had ended.

**The acceptance is met.**
- `personsSource` names the links file and the register's entries to `Snapshot.readMany` before it reads them. Where the
  register is in another snapshot, it reads the entries ahead there. Where no batch exists, nothing changes.
- `#spec` with a token goes from 9 requests to 7 at this repository's size. The base reproduced 9 and 120, the known
  positive from ITM-710's gate. Without a token it stays at 120.
- TST-833201 counts 6 against 8 on the test repository. TST-833202 guards the case without a token.
- Three planted faults are caught.
- The node suite fails the same 49 tests by name on the base and the head, all known environment cases. The fetch spy saw
  no real request, and ITM-018 passes.

**Readings accepted.**
- The three reads are `personsSource`'s on the default branch of the specification route.
- `sourcesOf` in `flow.mjs` stays as it is. Batching it changes a gaps case the item does not name, so it is ITM-846.

**Findings, registered.**
- ITM-845: `#spec`'s frame read-ahead could take the register in its first wave (MOD-site-frame).
- ITM-846: an opened requirement's `sourcesOf` reads the register singly (MOD-trace-pages).

**Process.** The brief's contradiction about writing scripts is corrected by the Scrum Master: measurement and probe scripts
are written with the Write tool.
