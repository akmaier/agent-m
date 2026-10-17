---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ab20bef6a7e9ee3ef41a2dc26278d58ffd0ec61d
  - https://github.com/akmaier/agent-m/pull/703
date: 2026-10-17 07:30 UTC
---
# Development → Release testing: ITM-601 (after its cut), a failed read is named by the frame's readProblem

**REGISTER**

## Reason

ITM-601, pull request #703 into `sprint/team1/67`, at head `ab20bef6`. developer-sonnet-d wrote it. It is the item as
cut at its stop (`67.md`, "ITM-601's cut"): MOD-site-frame and MOD-review-pages. No file of MOD-trace-pages is touched.

**Red.** The tests-only commit `494c6678` was red in run 39013377519 (`failure` on `494c6678`). node (2) has `# fail 18`
and `# todo 1`, the existing ITM-369-1. node (4) has `# fail 5`. These are the 23 new tests of the two new files.
- The callers' tests fail on the missing export, because moving the rule changes no text a page draws.
- That limit is covered: against a stub `readProblem` returning an empty `<p>`, the same 23 failed on behaviour.
- With the real `readProblem` and the old callers, 30 of 31 pass, as expected.

**The code, read in the diff.**
- `readProblem(failure, tokenStored)` in `src/site-frame/index.mjs` is MOD-site-frame's accepted text. For a `NotFound`
  with no token stored, the private-or-missing sentence; otherwise the host's `failure.message`. With no token, a link
  "Store a token".
- **The link** is `fragmentOf("add-product")`, `#add-product`, the same address as MOD-review-pages' `TOKEN_STEP`
  (`common.mjs:9`). So no page's link changes.
- `common.mjs` loses `problem`, and the nine call sites in its five importers call `readProblem(failure,
  Boolean(token))`, with the token they already read. The rule now stands once (nothing twice).

**What else holds.**
- CI is green, ten of ten in run 39013529347, and the pull request is mergeable.
- The draft run's name and result lists are identical over 3592 tests, so no existing test changes.
- Planted faults at each of the nine call sites fail that site's tests alone. Faults in `readProblem`, a `problem`
  exported again, and an added request are caught.
- The UC-019 table is identical on base and head, and ITM-018 passes.
- **The token budget** (sprint 66): the requests of each failing page are identical on base and head, with and without a
  token, so no read is added.

**Readings taken:** the link through `fragmentOf`; the host's message as `failure.message`; `Boolean(token)` from the
callers. All three follow the accepted text.

**Process.** The branch existed locally from the first attempt with no commits of its own, and it was checked out
plainly. Guard refusals were met with plain commands, and nothing was disguised.

**Findings** (sprint 63's agreement):
- **The sprint branch lacks the cut's lines and ITM-658 and ITM-659:** no item. They are records on `main`, and they
  reach the sprint's history when it is merged.
- **`tests/review-pages-failure-after-snapshot.test.mjs:73` compares two DOM nodes**, against sprint 65's agreement. It
  is registered as ITM-662.
- **`jobs.mjs:172` (`panelOf`) is reached only with a token: no item.** That panel appears only after a token is read,
  so the token-less branch of `readProblem` does not arise there, and that is the page's design.
