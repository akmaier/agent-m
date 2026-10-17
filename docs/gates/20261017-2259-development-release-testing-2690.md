---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8c3ea51e8c9e5b582530f5cf4a6652c8b63cdf63
  - https://github.com/akmaier/agent-m/pull/805
date: 2026-10-17 22:59 UTC
---
# Development → Release testing: ITM-848, a product's SPEC entry reads the instance once

**REGISTER**

## Reason

ITM-848, pull request #805 into `sprint/team1/79`, at head `8c3ea51e`. It is mergeable, and run 39077062700 passed twelve of
twelve. It changes four files, +16/−12.

**Red, then code.** The tests-only commit `0316cce6` was red in run 39076584007 on exactly the four counts named at the draft
stop:
- TST-844201, from 7 to 4;
- TST-844202, from 8 to 5;
- the two read-problem cases, from 14 to 12 and from 26 to 24.

The code was pushed after the run had ended.

**The acceptance is met.**
- `sourcesOf` takes the instance's snapshot that `ownSource` has built, so a product's entry page reads the instance's
  commit and tree once. `ownSource`'s line 85 is unchanged, and the other callers are left to ITM-852.
- **At this repository's size,** a product's entry page goes from 13 requests to 10 with a token, and from 17 to 14
  without. The instance's own page is unchanged. ITM-844's 13 and 17 hold. The harness's 14 and 26 were its own
  ten-file fixture, which pins the instance's side.
- **The 418 counter-proof** gave 29 receipts on the base and the head alike, each red and then green, TST-418101 among
  them.
- The 41 files of MOD-review-pages and the 62 release files give the same results for each file on the base and the head.

**The process question, ruled here for this item and ITM-847.**
- Sprint 78's agreement reads: "A refused command is reported, not run again in another form". The guard's refusals
  offer one path themselves: "Split it into plain, separate commands".
- **So splitting a refused compound command into plain, separate commands, each of which the guard can check, is no way
  around it.** That holds whether or not the refusal text asked for it.
- **It is a way around the guard** when a part repeats the refused construct in another form. Examples are the same script
  under another interpreter, as at ITM-844's gate, or a string built in pieces.
- So developer-sonnet-d's separate commands here are accepted. So is developer-sonnet-e's `diff` run alone at ITM-847's
  draft, and its note in ITM-847 is corrected in `79.md`.
