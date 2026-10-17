---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b364c3efdb96465a139d20ab6071ae8f346998ca
  - https://github.com/akmaier/agent-m/pull/793
date: 2026-10-17 22:11 UTC
---
# Development → Release testing: ITM-827, the main page is drawn by its module's home route

**REGISTER**

## Reason

ITM-827, pull request #793 into `sprint/team1/78`, at head `b364c3ef`. Run 39073807647 is green on all ten jobs. GitHub was
still computing mergeability after ITM-844's merge, and the Scrum Master checks it before merging. It changes eight files,
+719/−25.

**Red, then code.** The tests-only commit `f0264c64` was red in run 39073477274:
- TST-509007, with its named change to `[home, jobs]`;
- the new file, which could not import `cards.mjs`.

As the red was a missing file, an uncommitted stub failed 14 cases on behaviour. One further failure, TST-492005's
`ENOTEMPTY` on a temporary folder, is unrelated and passes on the green head. The code was pushed after the run had ended.

**The acceptance is met, as decided at its draft stop.**
- MOD-main-page's `home` route draws, through its Uses:
  - a card per kept product with its own token, and Agent M's own card while none is kept;
  - the six stages, with the current one marked;
  - what is being built, with its live states;
  - what waits for a person;
  - a card that cannot be read, with its failure while the others draw.
- `bridgesOf`, `liveStatesOf`, `el` and `clock` each keep one copy, in this module.
- **The links go through `ViewContext.go`.** A wait's *Open* goes to its page, *+ Add product* shows only beside Agent M's
  own card, and an unreadable card offers its token's setting. TST-827011 to 013 test them.
- Ten planted faults are caught.
- **Requests with a token at this repository's size:** 56, against the old main page's 1,006. Without a token it is 3,367,
  which is ITM-842's.
- Committed tests pin 22 and 1,012 requests on the fake.
- No release result changed. The module's and its callers' suites pass 147 of 147, and ITM-018 passes.

**Readings accepted.** The gate route `process` is MOD-implementation-pages' route of that name. The other route names are
MOD-review-pages' (`kinds.mjs`).

**Finding, noted in ITM-684.** On the main page, `go` only sets the address. The main page loads no other view, so the
links lead to "This page is not built yet" until the routes are served. No reader meets it now, since the live main page is
still the old one. ITM-684 does not switch the live page before every link finds its page, tested.
