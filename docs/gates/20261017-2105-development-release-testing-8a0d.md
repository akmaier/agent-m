---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 07a897ec93f48318f2b9aa45616c51a6cebdf60f
  - https://github.com/akmaier/agent-m/pull/775
date: 2026-10-17 21:05 UTC
---
# Development → Release testing: ITM-838

**REGISTER**

## Reason

ITM-838, MOD-personal-data's `checkersFor` and `namedPersonFindings`: pull request #775 into `sprint/team2/79`, on head
`07a897e`.

The condition that does not hold: check 5, the Outcome "a consenting collaborator of `docs/collaborators.md`"
(MOD-personal-data, Interfaces: "nor a collaborator who agreed"; `A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT`: "listed
as consenting"). `namedPersonFindings` (`src/personal-data/consent.mjs:15-18`) lets every row's Name pass without
reading its Agreed cell. Replayed on the head with a file read by MOD-documents' `readDocument` and the collaborators
schema: the row `| Ada Example | ada-example | no |`, or one with an empty Agreed, gives no finding for "Ada Example
wrote."; known positive: the same text with no collaborators file gives one, and Agreed `yes` gives none as intended.

The other checks hold. First commit `3055953` holds only `tests/personal-data-checkers-and-consent.test.mjs`, and CI was
red on it (run 39069071463, node (6): TST-838001.. fail); CI is green on the head (run 39069181481, all ten jobs). Only
`src/personal-data/` (new `checkers.mjs` and `consent.mjs`, both in the file's Parts; the two exports in `index.mjs`)
and the new test, whose header names MOD-personal-data and the requirements it guards, change; no dependency. The
existing tests naming MOD-personal-data pass on the head (people-in, person-hits, settings, pseudonymiser). Counter-
proofs replayed on the head, each red: `notLike` dropped (TST-838001/002/003/005), the places need dropped
(TST-838006/007), accounts dropped (TST-838011), `line: 1` (TST-838009), the difference among checkers replaced by
`true` (TST-838004/005). The readings on `checkersFor` hold: `eligible` with `draft text`, the mailbox's places and
`notLike: [rewriter]` leaves out a participant naming no model, so a checker is a text-drafting participant with a
named model; then the first three that pairwise `differs`. One finding per occurrence through `personHits`, and an
account matched case-insensitively with an optional `@`, fit the accepted text; a collaborator's Account column not
used is a gap for the module file, no reason by itself.
